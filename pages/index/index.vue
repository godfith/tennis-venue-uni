<template>
  <view class="page">
    <swiper class="hero" indicator-dots autoplay circular indicator-color="rgba(255,255,255,.4)" indicator-active-color="#fff">
      <swiper-item v-for="(b, i) in banners" :key="i">
        <image class="hero-img" :src="b.image" mode="aspectFill"></image>
        <view class="hero-mask"></view>
        <view class="hero-txt">
          <view class="hero-brand">GOAT TENNIS</view>
          <view class="hero-title">{{ b.title }}</view>
        </view>
      </swiper-item>
    </swiper>

    <view class="sheet">
      <view class="venue-bar" @tap="showVenuePicker">
        <view>
          <view class="v-lab">当前场馆</view>
          <view class="v-name">{{ venueName }}</view>
        </view>
        <view class="v-sw">切换</view>
      </view>

      <view class="cal">
        <view class="cal-head">
          <view class="cal-nav" @tap="changeMonth(-1)">‹</view>
          <view class="cal-title">{{ calYear }}年{{ calMonth }}月</view>
          <view class="cal-nav" @tap="changeMonth(1)">›</view>
        </view>
        <view class="cal-weeks">
          <view class="cal-w" v-for="w in weekLabels" :key="w">{{ w }}</view>
        </view>
        <view class="cal-grid">
          <view
            v-for="(d, i) in calDays"
            :key="i"
            :class="'cal-d ' + (d.date === selectedDate ? 'on' : '') + (d.inMonth ? '' : ' out') + (hasActivity(d.date) ? ' has' : '')"
            @tap="d.inMonth && pickDate(d.date)"
          >
            <text>{{ d.day }}</text>
            <view class="dot" v-if="hasActivity(d.date)"></view>
          </view>
        </view>
      </view>

      <view class="acts">
        <view class="acts-title">{{ selectedDate }} 的活动</view>
        <view v-if="dayActivities.length" class="act-list">
          <view class="act" v-for="(a, i) in dayActivities" :key="i">
            <view class="act-tag">{{ a.type }}</view>
            <view class="act-body">
              <view class="act-name">{{ a.title }}</view>
              <view class="act-meta">{{ a.time }} · {{ a.venue }}</view>
            </view>
          </view>
        </view>
        <view v-else class="acts-empty">这天没有活动或优惠</view>
      </view>

      <view class="action-row">
        <view class="action" @tap="goBooking">
          <view class="action-title">立即订场</view>
          <view class="action-en">BOOK A COURT</view>
        </view>
        <view class="action" @tap="goGroup">
          <view class="action-title">团课报名</view>
          <view class="action-en">GROUP CLASS</view>
        </view>
      </view>
    </view>
    <app-tabbar :current="0" />
  </view>
</template>
<script>
import AppTabbar from '@/components/app-tabbar.vue'
export default {
  components: { AppTabbar },
  data() {
    return {
      venueList: [], venueId: '', venueName: '请选择场馆',
      banners: [
        { image: '/static/images/index/banner.jpg', title: '山羊Goat网球馆' },
        { image: '/static/images/index/banner.jpg', title: '订场 · 团课 · 私教' }
      ],
      weekLabels: ['日', '一', '二', '三', '四', '五', '六'],
      calYear: 2026, calMonth: 10,
      calDays: [], selectedDate: '',
      activities: []
    }
  },
  computed: {
    dayActivities() {
      var d = this.selectedDate
      return this.activities.filter(function (a) { return a.date === d })
    }
  },
  onShow() {
    try { uni.hideTabBar({ animation: false }) } catch (e) {}
    this.loadVenues()
    this.initCal()
  },
  onShareAppMessage() { return { title: '山羊Goat网球馆', path: '/pages/index/index' } },
  onShareTimeline() { return { title: '山羊Goat网球馆' } },
  methods: {
    initCal() {
      var now = new Date()
      this.calYear = now.getFullYear()
      this.calMonth = now.getMonth() + 1
      this.selectedDate = this.fmtDate(now)
      this.buildDays()
      this.loadActivities()
    },
    fmtDate(d) {
      var m = d.getMonth() + 1
      var day = d.getDate()
      return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day
    },
    buildDays() {
      var y = this.calYear
      var m = this.calMonth
      var first = new Date(y, m - 1, 1)
      var start = first.getDay()
      var days = new Date(y, m, 0).getDate()
      var list = []
      for (var i = 0; i < start; i++) {
        var prev = new Date(y, m - 1, -start + i + 1)
        list.push({ day: prev.getDate(), date: this.fmtDate(prev), inMonth: false })
      }
      for (var d = 1; d <= days; d++) {
        var cur = new Date(y, m - 1, d)
        list.push({ day: d, date: this.fmtDate(cur), inMonth: true })
      }
      while (list.length % 7) {
        var next = new Date(y, m, list.length - start - days + 1)
        list.push({ day: next.getDate(), date: this.fmtDate(next), inMonth: false })
      }
      this.calDays = list
    },
    changeMonth(delta) {
      var m = this.calMonth + delta
      var y = this.calYear
      if (m < 1) { m = 12; y-- }
      if (m > 12) { m = 1; y++ }
      this.calYear = y
      this.calMonth = m
      this.buildDays()
    },
    pickDate(date) { this.selectedDate = date },
    hasActivity(date) {
      return this.activities.some(function (a) { return a.date === date })
    },
    loadActivities() {
      this.activities = []
    },
    loadVenues() {
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenues' },
        success: function (res) {
          var list = (res.result || {}).list || []
          that.venueList = list
          var id = uni.getStorageSync('venue_id')
          var found = list.find(function (v) { return v.venueId === id || v._id === id })
          if (found) {
            that.venueId = found.venueId || found._id
            that.venueName = found.name
          }
        }
      })
    },
    showVenuePicker() {
      if (!this.venueList.length) { uni.showToast({ title: '暂无场馆', icon: 'none' }); return }
      var that = this
      uni.showActionSheet({
        itemList: that.venueList.map(function (v) { return v.name }),
        success: function (res) {
          var v = that.venueList[res.tapIndex]
          that.venueId = v.venueId || v._id
          that.venueName = v.name
          uni.setStorageSync('venue_id', that.venueId)
          uni.setStorageSync('venue_name', v.name)
        }
      })
    },
    goBooking() { uni.switchTab({ url: '/pages/booking/booking' }) },
    goGroup() { uni.navigateTo({ url: '/pages/group/group' }) }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f4f2ee; }
.hero { height: 66vh; position: relative; }
.hero-img { width: 100%; height: 100%; }
.hero-mask { position: absolute; left: 0; right: 0; bottom: 0; height: 200rpx; background: linear-gradient(transparent, rgba(0,0,0,.45)); }
.hero-txt { position: absolute; left: 40rpx; bottom: 48rpx; color: #fff; }
.hero-brand { font-size: 24rpx; letter-spacing: 4rpx; opacity: .85; }
.hero-title { font-size: 44rpx; font-weight: 700; margin-top: 8rpx; }
.sheet { background: #f4f2ee; border-radius: 32rpx 32rpx 0 0; margin-top: -32rpx; position: relative; padding: 32rpx 28rpx 180rpx; }
.venue-bar { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 16rpx; padding: 20rpx 24rpx; margin-bottom: 24rpx; }
.v-lab { font-size: 22rpx; color: #999; }
.v-name { font-size: 30rpx; font-weight: 600; color: #1a5c3a; margin-top: 4rpx; }
.v-sw { font-size: 24rpx; color: #1a5c3a; border: 1rpx solid #1a5c3a; border-radius: 24rpx; padding: 6rpx 20rpx; }
.cal { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 24rpx; }
.cal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.cal-title { font-size: 30rpx; font-weight: 600; color: #333; }
.cal-nav { width: 56rpx; height: 56rpx; text-align: center; line-height: 56rpx; font-size: 36rpx; color: #1a5c3a; }
.cal-weeks, .cal-grid { display: flex; flex-wrap: wrap; }
.cal-w, .cal-d { width: 14.28%; text-align: center; font-size: 24rpx; }
.cal-w { color: #999; padding: 8rpx 0; }
.cal-d { height: 72rpx; line-height: 72rpx; position: relative; color: #333; }
.cal-d.out { color: #ccc; }
.cal-d.on { background: #1a5c3a; color: #fff; border-radius: 50%; }
.cal-d.has .dot { position: absolute; bottom: 6rpx; left: 50%; transform: translateX(-50%); width: 8rpx; height: 8rpx; background: #e85d4c; border-radius: 50%; }
.cal-d.on .dot { background: #fff; }
.acts { background: #fff; border-radius: 16rpx; padding: 20rpx 24rpx; margin-bottom: 24rpx; }
.acts-title { font-size: 28rpx; font-weight: 600; color: #333; margin-bottom: 16rpx; }
.acts-empty { text-align: center; color: #999; padding: 32rpx 0; font-size: 26rpx; }
.act { display: flex; align-items: center; padding: 16rpx 0; border-top: 1rpx solid #f0f0f0; }
.act-tag { background: #e8f5e9; color: #1a5c3a; font-size: 22rpx; padding: 6rpx 14rpx; border-radius: 8rpx; margin-right: 16rpx; }
.act-name { font-size: 28rpx; color: #333; }
.act-meta { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.action-row { display: flex; gap: 16rpx; }
.action { flex: 1; background: #1a5c3a; color: #fff; border-radius: 16rpx; padding: 28rpx 24rpx; }
.action-title { font-size: 32rpx; font-weight: 700; }
.action-en { font-size: 20rpx; opacity: .7; margin-top: 4rpx; }
</style>
