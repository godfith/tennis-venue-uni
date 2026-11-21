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
        <view v-if="!agendaGroups.length" class="gmc-agenda-empty">这一天暂无团课</view>
        <view class="gmc-group" v-for="g in agendaGroups" :key="g.key">
          <view class="gmc-group-title" :class="g.kind">{{ g.title }}</view>
          <view v-if="!g.items.length" class="gmc-agenda-empty">暂无时段，教练或店长开课后会出现在这里</view>
          <view
            class="gmc-agenda-item"
            v-for="item in g.items"
            :key="item._id"
            @tap="onClassTap(item)"
          >
            <view class="gmc-ag-top">
              <text class="gmc-ag-name">{{ item.courseContentName || item.theme || item.name }}</text>
              <text class="gmc-ag-type" :class="item.hint && item.hint.kind">{{ item.time || (item.hint && item.hint.text) }}</text>
            </view>
            <view class="gmc-ag-meta">{{ classMeta(item) }}</view>
            <view class="gmc-ag-go">报名 ›</view>
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
        <text class="gmc-leg-tip">点格子看当天课程，点课程报名</text>
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
      loading: false
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
    agendaGroups: function () {
      var items = this.agendaItems || []
      var map = {}
      var order = []
      items.forEach(function (item) {
        var kind = (item.hint && item.hint.kind) || (String(item.classType || item.class_type || '').toLowerCase() === 'self' ? 'self' : 'fixed')
        var venue = item.venueShort || item.venueName || '门店'
        var key = kind + '|' + venue
        if (!map[key]) {
          map[key] = {
            key: key,
            kind: kind,
            title: (kind === 'self' ? '自组团课' : '固定团课') + ' · ' + venue,
            items: []
          }
          order.push(key)
        }
        map[key].items.push(item)
      })
      return order.map(function (k) { return map[k] })
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
      this.$emit('pickdate', d.date)
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
.gmc-ag-go {
  position: absolute;
  right: 0;
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
