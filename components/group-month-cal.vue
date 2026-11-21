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
      <view class="gmc-grid">
        <view
          class="gmc-cell"
          v-for="(d, i) in cells"
          :key="i"
          @tap="onDayTap(d)"
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
            <view class="gmc-day">{{ d.day }}</view>
            <view class="gmc-hol" v-if="d.holiday">{{ d.holiday }}</view>
            <view
              class="gmc-vname"
              :class="v.hints[0] && v.hints[0].kind === 'self' ? 'self' : ''"
              v-for="(v, vi) in d.venues.slice(0, 2)"
              :key="vi"
            >{{ v.venueShort }}</view>
            <view class="gmc-more" v-if="d.venueCount > 2">+{{ d.venueCount - 2 }}</view>
          </view>
        </view>
      </view>
      <scroll-view class="gmc-agenda" scroll-y>
        <view class="gmc-agenda-head">{{ agendaTitle }}</view>
        <view v-if="!dayVenues.length" class="gmc-agenda-empty">这一天暂无场地有课</view>
        <view
          class="gmc-venue"
          v-for="v in dayVenues"
          :key="v.venueId || v.venueShort"
          @tap="onVenueTap(v)"
        >
          <view class="gmc-venue-main">
            <view class="gmc-venue-name">{{ v.venueShort || v.venueName }}</view>
            <view class="gmc-venue-sub">
              <text v-if="v.fixedCount">固定团课 {{ v.fixedCount }}</text>
              <text v-if="v.selfCount">自组团课 {{ v.selfCount }}</text>
            </view>
          </view>
          <view class="gmc-venue-side">
            <text class="gmc-venue-count">{{ v.classes.length }} 节课</text>
            <text class="gmc-venue-go">查看 ›</text>
          </view>
        </view>
        <view v-if="openedVenue" class="gmc-venue-detail">
          <view class="gmc-group-title">{{ openedVenue.venueShort || openedVenue.venueName }}</view>
          <view class="gmc-group" v-for="g in openedGroups" :key="g.key">
            <view class="gmc-group-title" :class="g.kind">{{ g.title }}</view>
            <view
              class="gmc-agenda-item"
              v-for="item in g.items"
              :key="item._id"
              @tap.stop="onClassTap(item)"
            >
              <view class="gmc-ag-top">
                <text class="gmc-ag-name">{{ item.courseContentName || item.theme || item.name }}</text>
                <text class="gmc-ag-type">{{ item.time }}</text>
              </view>
              <view class="gmc-ag-meta">{{ classMeta(item) }}</view>
              <view class="gmc-ag-go">报名 ›</view>
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
        <text class="gmc-leg-tip">点日期看有课的场地，点场地看课程</text>
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
  classesOnDate
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
      loading: false,
      openedVenueId: ''
    }
  },
  computed: {
    agendaTitle: function () {
      var date = this.selectedDate
      if (!date) return '请选择日期'
      var d = new Date(String(date).replace(/-/g, '/'))
      if (isNaN(d.getTime())) return date
      var title = (d.getMonth() + 1) + '月' + d.getDate() + '日 周' + WEEK_LABELS[d.getDay()]
      if (date === this.todayStr()) title = '今天 · ' + title
      return title
    },
    agendaItems: function () {
      return classesOnDate(this.calendarDays, this.selectedDate)
    },
    dayVenues: function () {
      var cell = null
      var list = this.cells || []
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].date === this.selectedDate && list[i].inMonth) {
          cell = list[i]
          break
        }
      }
      var venues = (cell && cell.venues) || []
      return venues.map(function (v) {
        var fixedCount = 0
        var selfCount = 0
        ;(v.hints || []).forEach(function (h) {
          if (h && h.kind === 'self') selfCount += 1
          else fixedCount += 1
        })
        return Object.assign({}, v, { fixedCount: fixedCount, selfCount: selfCount })
      })
    },
    openedVenue: function () {
      var id = this.openedVenueId
      if (!id) return null
      var venues = this.dayVenues || []
      for (var i = 0; i < venues.length; i++) {
        if (String(venues[i].venueId || venues[i].venueShort) === String(id)) return venues[i]
      }
      return null
    },
    openedGroups: function () {
      var v = this.openedVenue
      if (!v) return []
      var map = { fixed: [], self: [] }
      ;(v.classes || []).forEach(function (item) {
        var kind = String(item.classType || item.class_type || '').toLowerCase() === 'self' ? 'self' : 'fixed'
        map[kind].push(item)
      })
      var out = []
      if (map.fixed.length) out.push({ key: 'fixed', kind: 'fixed', title: '固定团课', items: map.fixed })
      if (map.self.length) out.push({ key: 'self', kind: 'self', title: '自组团课', items: map.self })
      return out
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
        }
      }
    },
    selectedDate: function () {
      if (this.show) this.rebuild()
    }
  },
  methods: {
    classMeta: function (c) {
      var parts = []
      if (c && c.time) parts.push(c.time)
      if (c && c.court) parts.push(c.court)
      parts.push((c && c.coachName) || '教练待定')
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
      this.$emit('close')
    },
    onDayTap: function (d) {
      if (!d || !d.inMonth || !d.date) return
      this.openedVenueId = ''
      this.$emit('pickdate', d.date)
    },
    onVenueTap: function (v) {
      if (!v) return
      var id = String(v.venueId || v.venueShort || '')
      this.openedVenueId = this.openedVenueId === id ? '' : id
    },
    onClassTap: function (item) {
      if (!item || !item._id) return
      this.$emit('openclass', {
        id: String(item._id),
        date: item.date || this.selectedDate || '',
        venueId: item.venueId || ''
      })
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
  padding: 16rpx 12rpx 12rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.gmc-head {
  display: flex;
  align-items: center;
  margin-bottom: 4rpx;
  padding: 0 8rpx;
  flex-shrink: 0;
}
.gmc-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #1a5c3a;
}
.gmc-nav {
  width: 64rpx;
  height: 64rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 44rpx;
  color: #1a5c3a;
}
.gmc-close {
  width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  font-size: 32rpx;
  color: #666;
}
.gmc-weeks {
  display: flex;
  flex-shrink: 0;
  padding: 4rpx 0 8rpx;
}
.gmc-w {
  width: 14.28%;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #888;
}
.gmc-grid {
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.gmc-cell {
  width: 14.28%;
  box-sizing: border-box;
  padding: 3rpx;
}
.gmc-card {
  min-height: 92rpx;
  border-radius: 12rpx;
  padding: 6rpx 2rpx 8rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2rpx solid transparent;
}
.gmc-card.out { opacity: 0.28; }
.gmc-card.empty { background: transparent; }
.gmc-card.today,
.gmc-card.on {
  background: #e8f5e9;
  border-color: #1a5c3a;
}
.gmc-day {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
  line-height: 1.2;
}
.gmc-card.today .gmc-day,
.gmc-card.on .gmc-day { color: #1a5c3a; }
.gmc-hol {
  font-size: 16rpx;
  color: #c45c26;
  line-height: 1.2;
}
.gmc-vname {
  max-width: 100%;
  font-size: 20rpx;
  font-weight: 600;
  color: #1a5c3a;
  line-height: 1.25;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.gmc-vname.self { color: #6a7c4c; }
.gmc-more {
  font-size: 18rpx;
  color: #888;
  line-height: 1.2;
}
.gmc-agenda {
  flex: 1;
  min-height: 200rpx;
  margin-top: 12rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx 20rpx 16rpx;
  box-sizing: border-box;
}
.gmc-agenda-head {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a5c3a;
  padding: 12rpx 0 8rpx;
}
.gmc-venue { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff; border: 1px solid #e6eee8; border-radius: 10px; padding: 12px; margin-bottom: 8px; }
.gmc-venue-main { flex: 1; min-width: 0; }
.gmc-venue-name { font-size: 16px; font-weight: 600; color: #1a5c3a; line-height: 1.3; }
.gmc-venue-sub { margin-top: 4px; color: #666; font-size: 12px; line-height: 1.4; }
.gmc-venue-sub text { margin-right: 10px; }
.gmc-venue-side { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.gmc-venue-count { font-size: 12px; color: #909399; line-height: 1.2; }
.gmc-venue-go { font-size: 13px; color: #1a5c3a; font-weight: 600; line-height: 1.2; }
.gmc-venue-detail { margin-top: 4px; }
.gmc-group { margin-bottom: 12px; }
.gmc-group-title { font-size: 15px; font-weight: 600; color: #1a5c3a; margin: 8px 0; }
.gmc-group-title.self { color: #6a7c4c; }
.gmc-agenda-empty {
  font-size: 26rpx;
  color: #999;
  padding: 24rpx 0 16rpx;
  text-align: center;
}
.gmc-agenda-item {
  position: relative;
  padding: 18rpx 90rpx 18rpx 0;
  border-top: 1rpx solid #f0f0f0;
}
.gmc-ag-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.gmc-ag-venue {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a5c3a;
}
.gmc-ag-type {
  font-size: 22rpx;
  color: #1a5c3a;
  background: #e8f5e9;
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
}
.gmc-ag-type.self {
  color: #6a7c4c;
  background: #eef3e4;
}
.gmc-ag-name {
  font-size: 28rpx;
  color: #222;
  margin-top: 6rpx;
}
.gmc-ag-meta {
  font-size: 24rpx;
  color: #888;
  margin-top: 4rpx;
}
.gmc-agenda-item { position: relative; }
.gmc-ag-go {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 26rpx;
  color: #1a5c3a;
  font-weight: 600;
}
.gmc-legend {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 10rpx 0 2rpx;
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
.gmc-leg-tip {
  font-size: 20rpx;
  color: #999;
}
</style>
