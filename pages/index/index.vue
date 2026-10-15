<template>
  <view class="page">
    <view class="hero-wrap">
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
      <view class="venue-top" @tap="showVenuePicker">
        <view class="vt-name">{{ venueName }}</view>
        <view class="vt-sw">切换场馆 ›</view>
      </view>
    </view>

    <view class="sheet">
      <view class="hello-row">
        <image class="avatar" :src="avatarUrl || '/static/images/avatar.png'" mode="aspectFill" @tap="goMyCards"></image>
        <view class="hello-txt" @tap="goMyCards">
          <view class="hi">Hi, {{ nickName || '球友' }}</view>
          <view class="no">{{ phone || '登录后查看' }}</view>
        </view>
        <view class="wallet-inline" @tap="goWallet">
          <view class="wi-item">
            <view class="wi-num">¥{{ Number(balance).toFixed(0) }}</view>
            <view class="wi-lab">余额</view>
          </view>
          <view class="wi-item">
            <view class="wi-num">{{ points || 0 }}</view>
            <view class="wi-lab">积分</view>
          </view>
          <view class="wi-item" @tap.stop="goMyCards">
            <view class="wi-num">{{ cardCount }}</view>
            <view class="wi-lab">持卡</view>
          </view>
        </view>
      </view>

      <view class="date-block">
        <view class="date-top">
          <view class="date-label">活动日历</view>
          <view class="date-zoom" @tap="openCal">
            <view class="zoom-icon">📅</view>
            <view class="zoom-txt">月历</view>
          </view>
        </view>
        <scroll-view class="dates" scroll-x enable-flex :scroll-into-view="scrollTo">
          <view
            v-for="d in dateRow"
            :key="d.date"
            :class="'date ' + (d.date === selectedDate ? 'on' : '')"
            :id="'d' + d.date"
            @tap="pickDate(d.date)"
          >
            <view class="d-wk">{{ d.week }}</view>
            <view class="d-md">{{ d.md }}</view>
            <view class="d-hol" v-if="d.holiday">{{ d.holiday }}</view>
            <view class="d-dot" v-if="hasActivity(d.date)"></view>
          </view>
        </scroll-view>
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

      <view class="stat-row">
        <view class="stat" @tap="goMyCards">
          <view class="stat-n">{{ coachCount }}</view>
          <view class="stat-l">私教卡</view>
        </view>
        <view class="stat" @tap="goMyCards">
          <view class="stat-n">{{ timesCount }}</view>
          <view class="stat-l">场地次卡</view>
        </view>
        <view class="stat" @tap="goMyCards">
          <view class="stat-n">{{ groupCount }}</view>
          <view class="stat-l">团课卡</view>
        </view>
        <view class="stat" @tap="goMyCards">
          <view class="stat-n">{{ timeCount }}</view>
          <view class="stat-l">时间卡</view>
        </view>
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
    <view class="mask" v-if="calOpen" @tap="calOpen = false">
      <view class="cal-pop" @tap.stop="">
        <view class="cal-head">
          <view class="cal-nav" @tap="changeMonth(-1)">‹</view>
          <view class="cal-title">{{ calYear }}年{{ calMonth }}月</view>
          <view class="cal-nav" @tap="changeMonth(1)">›</view>
          <view class="cal-close" @tap="calOpen = false">✕</view>
        </view>
        <view class="cal-weeks">
          <view class="cal-w" v-for="w in weekLabels" :key="w">{{ w }}</view>
        </view>
        <view class="cal-grid">
          <view
            v-for="(d, i) in calDays"
            :key="i"
            :class="'cal-d ' + (d.date === selectedDate ? 'on' : '') + (d.inMonth ? '' : ' out')"
            @tap="d.inMonth && (pickDate(d.date), calOpen = false)"
          >
            <text>{{ d.day }}</text>
            <view class="cal-hol" v-if="d.holiday">{{ d.holiday }}</view>
            <view class="cal-dot" v-if="hasActivity(d.date)"></view>
          </view>
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
      dateRow: [], selectedDate: '', scrollTo: '', calOpen: false,
      calYear: 2026, calMonth: 10, calDays: [],
      activities: [],
      balance: 0, points: 0, cardCount: 0,
      nickName: '', phone: '', avatarUrl: '',
      coachCount: 0, timesCount: 0, groupCount: 0, timeCount: 0
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
    this.nickName = uni.getStorageSync('nickName') || ''
    this.phone = uni.getStorageSync('phone') || ''
    this.avatarUrl = uni.getStorageSync('avatarUrl') || ''
    this.loadVenues()
    this.initCal()
    this.loadCards()
    this.loadWallet()
  },
  onShareAppMessage() { return { title: '山羊Goat网球馆', path: '/pages/index/index' } },
  onShareTimeline() { return { title: '山羊Goat网球馆' } },
  methods: {
    initCal() {
      var weeks = ['日', '一', '二', '三', '四', '五', '六']
      var now = new Date()
      var list = []
      for (var i = 0; i < 14; i++) {
        var d = new Date(now.getTime())
        d.setDate(now.getDate() + i)
        var m = d.getMonth() + 1
        var day = d.getDate()
        list.push({
          date: this.fmtDate(d),
          week: i === 0 ? '今天' : ('周' + weeks[d.getDay()]),
          md: m + '.' + (day < 10 ? '0' : '') + day,
          holiday: this.holidayName(this.fmtDate(d))
        })
      }
      this.dateRow = list
      this.selectedDate = list[0].date
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
        list.push({ day: d, date: this.fmtDate(cur), inMonth: true, holiday: this.holidayName(this.fmtDate(cur)) })
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
    holidayName(date) {
      var map = {
        '2026-01-01': '元旦', '2026-01-02': '元旦', '2026-01-03': '元旦',
        '2026-02-15': '除夕', '2026-02-16': '春节', '2026-02-17': '春节',
        '2026-02-18': '春节', '2026-02-19': '春节', '2026-02-20': '春节',
        '2026-02-21': '春节', '2026-02-22': '春节', '2026-02-23': '春节',
        '2026-04-04': '清明', '2026-04-05': '清明', '2026-04-06': '清明',
        '2026-05-01': '劳动节', '2026-05-02': '劳动节', '2026-05-03': '劳动节',
        '2026-05-04': '劳动节', '2026-05-05': '劳动节',
        '2026-06-19': '端午', '2026-06-20': '端午', '2026-06-21': '端午',
        '2026-09-25': '中秋', '2026-09-26': '中秋', '2026-09-27': '中秋',
        '2026-10-01': '国庆', '2026-10-02': '国庆', '2026-10-03': '国庆',
        '2026-10-04': '国庆', '2026-10-05': '国庆', '2026-10-06': '国庆', '2026-10-07': '国庆'
      }
      return map[date] || ''
    },
    hasActivity(date) {
      return this.activities.some(function (a) { return a.date === date })
    },
    pickDate(date) {
      this.selectedDate = date
      var exists = this.dateRow.some(function (d) { return d.date === date })
      if (!exists) this.buildRowAround(date)
      this.scrollTo = ''
      var that = this
      setTimeout(function () { that.scrollTo = 'd' + date }, 50)
    },
    buildRowAround(center) {
      var weeks = ['日', '一', '二', '三', '四', '五', '六']
      var base = new Date(center.replace(/-/g, '/'))
      var list = []
      for (var i = -3; i < 11; i++) {
        var d = new Date(base.getTime())
        d.setDate(base.getDate() + i)
        var m = d.getMonth() + 1
        var day = d.getDate()
        var ds = this.fmtDate(d)
        list.push({
          date: ds,
          week: ds === this.fmtDate(new Date()) ? '今天' : ('周' + weeks[d.getDay()]),
          md: m + '.' + (day < 10 ? '0' : '') + day,
          holiday: this.holidayName(ds)
        })
      }
      this.dateRow = list
    },
    openCal() {
      var d = this.selectedDate ? new Date(this.selectedDate.replace(/-/g, '/')) : new Date()
      this.calYear = d.getFullYear()
      this.calMonth = d.getMonth() + 1
      this.buildDays()
      this.calOpen = true
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
    goGroup() { uni.navigateTo({ url: '/pages/group/group' }) },
    goMyCards() {
      if (!uni.getStorageSync('phone')) { uni.navigateTo({ url: '/pages/login/login' }); return }
      uni.navigateTo({ url: '/pages/mycards/mycards' })
    },
    goWallet() {
      if (!uni.getStorageSync('phone')) { uni.navigateTo({ url: '/pages/login/login' }); return }
      uni.navigateTo({ url: '/pages/wallet/wallet' })
    },
    loadWallet() {
      var that = this
      var userId = uni.getStorageSync('userDocId') || ''
      if (!userId) { that.balance = 0; that.points = 0; return }
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getWallet', userId: userId, phone: uni.getStorageSync('phone') || '' },
        success: function (res) {
          var r = res.result || {}
          if (!r.ok) return
          that.balance = Number(r.balance) || 0
          that.points = Number(r.points) || 0
        }
      })
    },
    loadCards() {
      var that = this
      var userId = uni.getStorageSync('userDocId') || ''
      if (!userId) { that.coachCount = that.timesCount = that.groupCount = that.timeCount = 0; return }
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getMyCards', userId: userId, phone: uni.getStorageSync('phone') || '' },
        success: function (res) {
          var list = ((res.result || {}).list || []).filter(function (c) { return c.status === 'active' })
          that.coachCount = that.timesCount = that.groupCount = that.timeCount = 0
          that.cardCount = list.length
          list.forEach(function (c) {
            if (c.type === 'coach') that.coachCount += 1
            else if (c.type === 'times') that.timesCount += 1
            else if (c.type === 'group') that.groupCount += 1
            else if (c.type === 'time') that.timeCount += 1
          })
        }
      })
    }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f4f2ee; }
.hero-wrap { position: relative; height: 66vh; }
.hero { height: 66vh; }
.hero-img { width: 100%; height: 100%; }
.hero-mask { position: absolute; left: 0; right: 0; bottom: 0; height: 200rpx; background: linear-gradient(transparent, rgba(0,0,0,.45)); }
.hero-txt { position: absolute; left: 40rpx; bottom: 48rpx; color: #fff; }
.hero-brand { font-size: 24rpx; letter-spacing: 4rpx; opacity: .85; }
.hero-title { font-size: 44rpx; font-weight: 700; margin-top: 8rpx; }
.sheet { background: #f4f2ee; border-radius: 32rpx 32rpx 0 0; margin-top: -32rpx; position: relative; padding: 32rpx 28rpx 180rpx; }
.venue-top { position: absolute; top: 24rpx; left: 28rpx; right: 28rpx; z-index: 20; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,.35); border-radius: 12rpx; padding: 16rpx 20rpx; }
.vt-name { color: #fff; font-size: 28rpx; font-weight: 600; }
.vt-sw { color: #fff; font-size: 24rpx; }
.d-hol { font-size: 18rpx; color: #e85d4c; margin-top: 2rpx; }
.date.on .d-hol { color: #ffd; }
.date-block { margin-bottom: 24rpx; }
.dates { white-space: nowrap; }
.date-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.date-label { font-size: 28rpx; font-weight: 600; color: #333; }
.date-zoom { display: flex; align-items: center; background: #1a5c3a; border-radius: 24rpx; padding: 8rpx 20rpx; }
.zoom-icon { font-size: 28rpx; margin-right: 6rpx; }
.zoom-txt { font-size: 24rpx; color: #fff; font-weight: 600; }
.hello-row { display: flex; align-items: center; background: #fff; border-radius: 16rpx; padding: 20rpx 24rpx; margin-bottom: 24rpx; }
.avatar { width: 72rpx; height: 72rpx; border-radius: 50%; margin-right: 16rpx; flex-shrink: 0; }
.hello-txt { flex: 1; min-width: 0; }
.hi { font-size: 28rpx; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.no { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.wallet-inline { display: flex; gap: 20rpx; }
.wi-item { text-align: center; }
.wi-num { font-size: 28rpx; font-weight: 700; color: #1a5c3a; }
.wi-lab { font-size: 20rpx; color: #999; margin-top: 2rpx; }
.stat-row { display: flex; gap: 12rpx; margin-bottom: 24rpx; }
.stat { flex: 1; background: #fff; border-radius: 16rpx; padding: 24rpx 0; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,.04); }
.stat-n { font-size: 40rpx; font-weight: 700; color: #1a5c3a; }
.stat-l { font-size: 22rpx; color: #888; margin-top: 6rpx; }
.mask { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: rgba(0,0,0,.45); z-index: 100; display: flex; align-items: center; justify-content: center; }
.cal-pop { background: #fff; border-radius: 20rpx; padding: 24rpx; width: 640rpx; }
.cal-head { display: flex; align-items: center; margin-bottom: 16rpx; }
.cal-title { flex: 1; text-align: center; font-size: 32rpx; font-weight: 600; }
.cal-nav, .cal-close { width: 56rpx; height: 56rpx; text-align: center; line-height: 56rpx; font-size: 36rpx; color: #1a5c3a; }
.cal-weeks, .cal-grid { display: flex; flex-wrap: wrap; }
.cal-w, .cal-d { width: 14.28%; text-align: center; font-size: 24rpx; }
.cal-w { color: #999; padding: 8rpx 0; }
.cal-d { height: 80rpx; position: relative; color: #333; padding-top: 12rpx; }
.cal-d.out { color: #ccc; }
.cal-d.on { background: #1a5c3a; color: #fff; border-radius: 8rpx; }
.cal-hol { font-size: 16rpx; color: #e85d4c; }
.cal-d.on .cal-hol { color: #ffd; }
.cal-dot { position: absolute; bottom: 4rpx; left: 50%; transform: translateX(-50%); width: 8rpx; height: 8rpx; background: #e85d4c; border-radius: 50%; }
.cal-d.on .cal-dot { background: #fff; }
.date { display: inline-flex; flex-direction: column; align-items: center; width: 100rpx; padding: 16rpx 0; margin-right: 12rpx; background: #fff; border-radius: 12rpx; position: relative; }
.date.on { background: #1a5c3a; color: #fff; }
.d-wk { font-size: 22rpx; opacity: .7; }
.d-md { font-size: 28rpx; font-weight: 600; margin-top: 4rpx; }
.d-dot { width: 8rpx; height: 8rpx; background: #e85d4c; border-radius: 50%; margin-top: 6rpx; }
.date.on .d-dot { background: #fff; }
.acts { background: #fff; border-radius: 16rpx; padding: 20rpx 24rpx; margin-bottom: 24rpx; }
.acts-title { font-size: 28rpx; font-weight: 600; color: #333; margin-bottom: 16rpx; }
.acts-empty { text-align: center; color: #999; padding: 32rpx 0; font-size: 26rpx; }
.act { display: flex; align-items: center; padding: 16rpx 0; border-top: 1rpx solid #f0f0f0; }
.act-tag { background: #e8f5e9; color: #1a5c3a; font-size: 22rpx; padding: 6rpx 14rpx; border-radius: 8rpx; margin-right: 16rpx; }
.act-name { font-size: 28rpx; color: #333; }
.act-meta { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.action-row { display: flex; gap: 16rpx; }
.action { flex: 1; background: linear-gradient(135deg, #1a5c3a, #2d8a5e); color: #fff; border-radius: 16rpx; padding: 32rpx 24rpx; box-shadow: 0 4rpx 12rpx rgba(26,92,58,.25); }
.action-title { font-size: 32rpx; font-weight: 700; }
.action-en { font-size: 20rpx; opacity: .75; margin-top: 6rpx; letter-spacing: 1rpx; }
</style>
