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
      <view class="gmc-agenda">
        <view class="gmc-agenda-head">{{ agendaTitle }}</view>
        <view v-if="!dayVenues.length" class="gmc-agenda-empty">这一天没有场地开课</view>
        <view class="gmc-venue-wrap" v-for="v in dayVenues" :key="v.venueId || v.venueShort">
          <view class="gmc-venue" :class="{ open: isVenueOpen(v) }" @tap="onVenueTap(v)">
            <view class="gmc-dot"></view>
            <view class="gmc-venue-main">
              <text class="gmc-venue-name">{{ v.venueShort || v.venueName }}</text>
              <text class="gmc-venue-sub">{{ venueSub(v) }}</text>
            </view>
            <text class="gmc-venue-go">{{ isVenueOpen(v) ? '收起' : '查看' }}</text>
          </view>
          <view v-if="isVenueOpen(v)" class="gmc-classes">
            <view
              class="gmc-class"
              v-for="item in v.classes"
              :key="item._id"
              @tap.stop="onClassTap(item)"
            >
              <view class="gmc-class-time">{{ item.time }}</view>
              <view class="gmc-class-main">
                <view class="gmc-class-name">{{ item.courseContentName || item.theme || item.name }}</view>
                <view class="gmc-class-meta">{{ classMeta(item) }}</view>
              </view>
              <text class="gmc-class-tag" :class="classKind(item)">{{ classKind(item) === 'self' ? '自组' : '固定' }}</text>
            </view>
          </view>
        </view>
      </view>
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
    venueKey: function (v) {
      return String((v && (v.venueId || v.venueShort)) || '')
    },
    isVenueOpen: function (v) {
      return this.openedVenueId === this.venueKey(v)
    },
    classKind: function (item) {
      return String((item && (item.classType || item.class_type)) || '').toLowerCase() === 'self' ? 'self' : 'fixed'
    },
    venueSub: function (v) {
      var parts = []
      if (v.fixedCount) parts.push('固定 ' + v.fixedCount)
      if (v.selfCount) parts.push('自组 ' + v.selfCount)
      parts.push((v.classes && v.classes.length || 0) + '节')
      return parts.join(' · ')
    },
    onVenueTap: function (v) {
      if (!v) return
      var id = this.venueKey(v)
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
  left: 20rpx;
  right: 20rpx;
  top: calc(80rpx + env(safe-area-inset-top));
  max-height: calc(100% - 120rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  background: #fff;
  border-radius: 28rpx;
  padding: 12rpx 16rpx 18rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(0,0,0,.18);
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
  min-height: 78rpx;
  border-radius: 14rpx;
  padding: 4rpx 2rpx 6rpx;
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
  margin-top: 8rpx;
  padding: 4rpx 4rpx 0;
  max-height: 420rpx;
  overflow: auto;
}
.gmc-agenda-head {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a5c3a;
  padding: 12rpx 0 8rpx;
}
.gmc-venue-wrap { margin-bottom: 8rpx; }
.gmc-venue { display: flex; align-items: center; gap: 12rpx; background: #f7f8f6; border-radius: 14rpx; padding: 16rpx 18rpx; }
.gmc-venue.open { background: #eef6f0; }
.gmc-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: #1a5c3a; flex-shrink: 0; }
.gmc-venue-main { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 12rpx; }
.gmc-venue-name { font-size: 28rpx; font-weight: 700; color: #1a5c3a; }
.gmc-venue-sub { font-size: 22rpx; color: #7a847c; }
.gmc-venue-go { font-size: 24rpx; color: #1a5c3a; font-weight: 600; flex-shrink: 0; }
.gmc-classes { background: #fff; border: 1rpx solid #e6eee8; border-top: 0; border-radius: 0 0 14rpx 14rpx; margin-top: -8rpx; padding: 8rpx 8rpx 4rpx; }
.gmc-class { display: flex; align-items: center; gap: 12rpx; padding: 14rpx 10rpx; border-top: 1rpx solid #f2f2f2; }
.gmc-class-time { width: 150rpx; font-size: 24rpx; font-weight: 600; color: #1a5c3a; flex-shrink: 0; }
.gmc-class-main { flex: 1; min-width: 0; }
.gmc-class-name { font-size: 26rpx; color: #222; }
.gmc-class-meta { font-size: 22rpx; color: #999; margin-top: 2rpx; }
.gmc-class-tag { font-size: 20rpx; color: #1a5c3a; background: #e8f5e9; border-radius: 8rpx; padding: 2rpx 10rpx; }
.gmc-class-tag.self { color: #6a7c4c; background: #eef3e4; }
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
