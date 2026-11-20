<template>
  <view class="gmc-root" v-if="show">
    <view class="gmc-mask" @tap="onClose"></view>
    <view class="gmc-pop" @tap.stop="">
      <view class="gmc-head">
        <view class="gmc-nav" @tap="prevMonth">‹</view>
        <view class="gmc-title">{{ year }}年{{ month }}月</view>
        <view class="gmc-nav" @tap="nextMonth">›</view>
        <view class="gmc-close" @tap="onClose">✕</view>
      </view>
      <view class="gmc-weeks">
        <view class="gmc-w" v-for="w in weekLabels" :key="w">{{ w }}</view>
      </view>
      <scroll-view class="gmc-scroll" scroll-y>
        <view class="gmc-grid">
          <view
            class="gmc-cell"
            v-for="(d, i) in cells"
            :key="i"
            :data-date="d.date"
            :data-ok="d.inMonth ? 1 : 0"
            :data-single="d.singleVenue ? 1 : 0"
            @tap="onDayTap"
          >
            <view
              class="gmc-card"
              :class="{
                out: !d.inMonth,
                empty: d.inMonth && !d.venueCount,
                today: d.isToday,
                on: d.isSelected
              }"
            >
              <view class="gmc-md">{{ d.md }}</view>
              <view class="gmc-wk">{{ d.isToday ? '今天' : d.weekText }}</view>
              <view class="gmc-hol" v-if="d.holiday">{{ d.holiday }}</view>
              <view
                class="gmc-venue"
                v-for="(v, vi) in d.venues"
                :key="vi"
                :data-date="d.date"
                :data-vid="v.venueId"
                @tap.stop="onVenueTap"
              >
                <view class="gmc-vname">{{ v.venueShort }}</view>
                <view
                  class="gmc-hint"
                  :class="h.kind === 'self' ? 'self' : 'fixed'"
                  v-for="(h, hi) in v.hints"
                  :key="hi"
                >{{ h.text }}</view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="gmc-legend">
        <view class="gmc-leg-item">
          <view class="gmc-leg-dot fixed"></view>
          <text>固定</text>
        </view>
        <view class="gmc-leg-item">
          <view class="gmc-leg-dot self"></view>
          <text>自组</text>
        </view>
      </view>
    </view>

    <view class="gmc-detail-root" v-if="detail" @tap="clearDetail">
      <view class="gmc-detail" @tap.stop="">
        <view class="gmc-detail-title">{{ detail.date }} · {{ detail.venueName }}</view>
        <view
          class="gmc-detail-item"
          v-for="(c, ci) in detail.classes"
          :key="ci"
          :data-id="c._id"
          :data-date="detail.date"
          @tap="onClassTap"
        >
          <view class="gmc-cd-name">{{ c.courseContentName || c.theme || c.name }}</view>
          <view class="gmc-cd-meta">{{ classMeta(c) }}</view>
          <view class="gmc-cd-go">报名 ›</view>
        </view>
        <view class="gmc-detail-close" @tap="clearDetail">关闭</view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  WEEK_LABELS,
  fmtDate,
  monthRange,
  buildMonthCells,
  findVenue,
  normClassType
} from '@/utils/groupMonthCal.js'

export default {
  name: 'GroupMonthCal',
  props: {
    show: { type: Boolean, default: false },
    selectedDate: { type: String, default: '' }
  },
  data: function () {
    return {
      year: 2026,
      month: 1,
      weekLabels: WEEK_LABELS,
      calendarDays: {},
      cells: [],
      detail: null,
      loading: false
    }
  },
  watch: {
    show: {
      immediate: true,
      handler: function (val) {
        if (val) {
          this.syncMonthFromSelected()
          this.rebuild()
          this.loadMonth()
        } else {
          this.detail = null
        }
      }
    },
    selectedDate: function () {
      if (this.show) this.rebuild()
    }
  },
  methods: {
    classMeta: function (c) {
      var typ = normClassType(c) === 'self' ? '自组' : '固定'
      var time = (c && c.time) || ''
      var coach = (c && c.coachName) || '教练待定'
      var enrolled = (c && c.enrolled) || 0
      var cap = (c && c.capacity) || 0
      var parts = [typ]
      if (time) parts.push(time)
      parts.push(coach)
      parts.push(enrolled + '/' + cap)
      return parts.join(' · ')
    },
    todayStr: function () {
      return fmtDate(new Date())
    },
    rebuild: function () {
      this.cells = buildMonthCells({
        year: this.year,
        month: this.month,
        calendarDays: this.calendarDays,
        selectedDate: this.selectedDate,
        today: this.todayStr()
      })
    },
    syncMonthFromSelected: function () {
      var raw = this.selectedDate || this.todayStr()
      var d = new Date(String(raw).replace(/-/g, '/'))
      if (isNaN(d.getTime())) d = new Date()
      this.year = d.getFullYear()
      this.month = d.getMonth() + 1
    },
    changeMonth: function (delta) {
      var m = this.month + delta
      var y = this.year
      if (m < 1) { m = 12; y -= 1 }
      if (m > 12) { m = 1; y += 1 }
      this.month = m
      this.year = y
      this.detail = null
      this.rebuild()
      this.loadMonth()
    },
    prevMonth: function () {
      this.changeMonth(-1)
    },
    nextMonth: function () {
      this.changeMonth(1)
    },
    onClose: function () {
      this.detail = null
      this.$emit('close')
    },
    clearDetail: function () {
      this.detail = null
    },
    venuesOf: function (date) {
      var cells = this.cells || []
      for (var i = 0; i < cells.length; i++) {
        if (cells[i].date === date) return cells[i].venues || []
      }
      return []
    },
    openDetail: function (date, venueId) {
      var list = this.venuesOf(date)
      var hit = venueId ? findVenue(list, venueId) : (list.length === 1 ? list[0] : null)
      if (!hit || !hit.classes || !hit.classes.length) return false
      this.detail = {
        date: date,
        venueId: hit.venueId,
        venueName: hit.venueName || hit.venueShort,
        classes: hit.classes
      }
      return true
    },
    onDayTap: function (e) {
      var ds = (e && e.currentTarget && e.currentTarget.dataset) || {}
      if (String(ds.ok) !== '1' || !ds.date) return
      var date = ds.date
      var venues = this.venuesOf(date)
      if (venues.length === 1 || String(ds.single) === '1') {
        this.openDetail(date, venues[0] && venues[0].venueId)
        return
      }
      if (venues.length > 1) return
      this.$emit('pickdate', date)
    },
    onVenueTap: function (e) {
      var ds = (e && e.currentTarget && e.currentTarget.dataset) || {}
      if (!ds.date) return
      this.openDetail(ds.date, ds.vid)
    },
    onClassTap: function (e) {
      var ds = (e && e.currentTarget && e.currentTarget.dataset) || {}
      var id = ds.id
      var date = ds.date || (this.detail && this.detail.date) || ''
      var venueId = this.detail && this.detail.venueId
      this.detail = null
      this.$emit('openclass', { id: id, date: date, venueId: venueId })
    },
    loadMonth: function () {
      var that = this
      var range = monthRange(this.year, this.month)
      that.loading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getGroupClassCalendar', startDate: range.start, endDate: range.end },
        success: function (res) {
          var r = res.result || {}
          if (r.calendar && r.calendar.days) {
            that.calendarDays = Object.assign({}, that.calendarDays, r.calendar.days)
            that.rebuild()
          }
          that.$emit('loaded', {
            days: (r.calendar && r.calendar.days) || {},
            hasUpcomingGroupClass: r.hasUpcomingGroupClass
          })
        },
        complete: function () {
          that.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.gmc-root {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 12000;
}
.gmc-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
}
.gmc-pop {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  top: calc(12rpx + env(safe-area-inset-top));
  bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #f4f2ee;
  border-radius: 24rpx;
  padding: 16rpx 10rpx 12rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.gmc-head {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  padding: 0 8rpx;
  flex-shrink: 0;
}
.gmc-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}
.gmc-nav, .gmc-close {
  width: 56rpx;
  height: 56rpx;
  text-align: center;
  line-height: 56rpx;
  font-size: 36rpx;
  color: #1a5c3a;
}
.gmc-weeks {
  display: flex;
  flex-shrink: 0;
  padding: 0 4rpx;
}
.gmc-w {
  width: 14.28%;
  text-align: center;
  font-size: 22rpx;
  color: #999;
  padding: 8rpx 0 12rpx;
}
.gmc-scroll {
  flex: 1;
  height: 70vh;
  min-height: 0;
}
.gmc-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 2rpx 12rpx;
}
.gmc-cell {
  width: 14.28%;
  padding: 4rpx;
  box-sizing: border-box;
  display: flex;
}
.gmc-card {
  flex: 1;
  width: 100%;
  background: #fff;
  border-radius: 16rpx;
  min-height: 168rpx;
  padding: 8rpx 4rpx 10rpx;
  box-sizing: border-box;
  border: 3rpx solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gmc-card.empty {
  background: #f7f5f1;
}
.gmc-card.out {
  background: transparent;
  opacity: 0.38;
  min-height: 120rpx;
}
.gmc-card.today,
.gmc-card.on {
  border-color: #1a5c3a;
  background: #e8f5e9;
  box-shadow: 0 2rpx 8rpx rgba(26, 92, 58, 0.12);
}
.gmc-md {
  font-size: 20rpx;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  text-align: center;
}
.gmc-wk {
  font-size: 18rpx;
  color: #888;
  line-height: 1.2;
  margin-top: 2rpx;
  text-align: center;
}
.gmc-card.today .gmc-wk,
.gmc-card.on .gmc-wk {
  color: #1a5c3a;
  font-weight: 600;
}
.gmc-hol {
  font-size: 16rpx;
  color: #e85d4c;
  line-height: 1.2;
  margin-top: 2rpx;
}
.gmc-venue {
  width: 100%;
  margin-top: 8rpx;
  text-align: center;
}
.gmc-vname {
  font-size: 22rpx;
  font-weight: 700;
  color: #1a5c3a;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gmc-hint {
  font-size: 16rpx;
  line-height: 1.25;
  margin-top: 2rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gmc-hint.fixed { color: #1a5c3a; }
.gmc-hint.self { color: #6a7c4c; }
.gmc-legend {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32rpx;
  padding: 8rpx 0 4rpx;
}
.gmc-leg-item {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #666;
}
.gmc-leg-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}
.gmc-leg-dot.fixed { background: #1a5c3a; }
.gmc-leg-dot.self { background: #6a7c4c; }
.gmc-detail-root {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 32rpx;
  box-sizing: border-box;
}
.gmc-detail {
  width: 100%;
  max-width: 640rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx 16rpx;
  box-sizing: border-box;
}
.gmc-detail-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a5c3a;
  margin-bottom: 12rpx;
}
.gmc-detail-item {
  position: relative;
  padding: 16rpx 80rpx 16rpx 0;
  border-top: 1rpx solid #f0f0f0;
}
.gmc-cd-name {
  font-size: 28rpx;
  color: #222;
}
.gmc-cd-meta {
  font-size: 24rpx;
  color: #888;
  margin-top: 4rpx;
}
.gmc-cd-go {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 22rpx;
  color: #1a5c3a;
  font-weight: 600;
}
.gmc-detail-close {
  text-align: center;
  color: #888;
  padding: 16rpx 0 4rpx;
  font-size: 26rpx;
}
</style>
