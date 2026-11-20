<template>
  <view class="page">
    <view class="venue-fixed" @tap="showVenuePicker">
      <view class="vt-name">{{ venueName }}</view>
      <view class="vt-sw">切换场馆 ›</view>
    </view>
    <view class="hero-wrap">
      <swiper class="hero" indicator-dots autoplay circular indicator-color="rgba(255,255,255,.4)" indicator-active-color="#fff">
        <swiper-item v-for="(b, i) in banners" :key="i" :data-i="i" @tap="onBannerTap">
          <image class="hero-img" :src="b.image" mode="aspectFill"></image>
          <view class="hero-mask"></view>
          <view class="hero-txt">
            <view class="hero-brand">GOAT TENNIS</view>
            <view class="hero-title">{{ b.title }}</view>
          </view>
        </swiper-item>
      </swiper>
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
          <view
            class="act"
            :class="{ disabled: isActDisabled(a) }"
            v-for="(a, i) in dayActivities"
            :key="a.groupClassId || a.id || i"
            :data-idx="i"
            :data-gid="a.groupClassId || ''"
            :data-type="a.type || ''"
            :data-date="a.date || ''"
            :data-status="a.status || ''"
            @tap="onTapActivity"
          >
            <view class="act-tag">{{ a.classTypeLabel || a.type }}</view>
            <view class="act-body">
              <view class="act-name">{{ a.title }}</view>
              <view class="act-meta">{{ a.time }} · {{ a.venue }}<text v-if="a.courseContentName || a.theme"> · {{ a.courseContentName || a.theme }}</text><text v-if="a.coachName"> · {{ a.coachName }}</text><text v-if="a.capacity"> · {{ a.enrolled || 0 }}/{{ a.capacity }}</text></view>
            </view>
            <view v-if="a.status === 'cancelled'" class="act-state">已取消</view>
            <view v-else-if="a.type === '团课' || a.groupClassId" class="act-arrow">报名 ›</view>
          </view>
        </view>
        <view v-else class="acts-empty">这天没有活动或优惠</view>
      </view>

      <view class="action-row">
        <view class="action" @tap="goBooking">
          <view class="action-title">立即订场</view>
          <view class="action-en">BOOK A COURT</view>
        </view>
        <view class="action" v-if="hasUpcomingGroupClass" @tap="goGroup">
          <view class="action-title">团课报名</view>
          <view class="action-en">GROUP CLASS</view>
        </view>
        <view class="action" @tap="goShop">
          <view class="action-title">商城</view>
          <view class="action-en">CLASS PASS</view>
        </view>
      </view>
    </view>

    <view class="mask" v-if="remindVisible" @tap="closeRemind">
      <view class="remind-pop" @tap.stop="">
        <view class="remind-title">预约提醒</view>
        <view class="remind-sub">您未来3天有以下预约</view>
        <view class="remind-list">
          <view class="remind-item" v-for="(b, i) in remindList" :key="i">
            <view class="remind-main">{{ b.date }} {{ b.time }}</view>
            <view class="remind-sub2">{{ b.venueName }} · {{ b.court }}</view>
          </view>
        </view>
        <view class="remind-notice" v-if="remindNotice">{{ remindNotice }}</view>
        <view class="remind-btn" @tap="closeRemind">我知道了</view>
      </view>
    </view>

    <group-month-cal
      :show="calOpen"
      :selected-date="selectedDate"
      @close="closeCal"
      @pickdate="onCalPickDate"
      @openclass="onCalOpenClass"
      @loaded="onCalLoaded"
    />
    <app-tabbar :current="0" />
  </view>
</template>
<script>
import AppTabbar from '@/components/app-tabbar.vue'
import GroupMonthCal from '@/components/group-month-cal.vue'
import { applyIncomingVenue, pickVenueFromList, indexSharePayload } from '@/utils/shareVenue.js'
import { unwrapEvent } from '@/utils/groupMonthCal.js'
export default {
  components: { AppTabbar, GroupMonthCal },
  data() {
    return {
      venueList: [], venueId: '', venueName: '请选择场馆',
      pendingVenueId: '', pendingVenueName: '',
      banners: [
        { image: '/static/images/index/banner.jpg', title: '山羊Goat网球馆' },
        { image: '/static/images/index/banner.jpg', title: '订场 · 团课 · 私教' }
      ],
      dateRow: [], selectedDate: '', scrollTo: '', calOpen: false,
      activities: [],
      balance: 0, points: 0, cardCount: 0,
      nickName: '', phone: '', avatarUrl: '',
      coachCount: 0, timesCount: 0, groupCount: 0, timeCount: 0,
      remindVisible: false, remindList: [], remindNotice: '', remindChecked: false,
      hasUpcomingGroupClass: true,
      calendarDays: {}
    }
  },
  computed: {
    dayActivities() {
      var d = this.selectedDate
      return this.activities.filter(function (a) { return a.date === d })
    }
  },
  onLoad(options) {
    this.applyShareVenue(options || {})
  },
  onShow() {
    try { uni.hideTabBar({ animation: false }) } catch (e) {}
    this.nickName = uni.getStorageSync('nickName') || ''
    this.phone = uni.getStorageSync('phone') || ''
    this.avatarUrl = uni.getStorageSync('avatarUrl') || ''
    this.loadBanners()
    this.loadVenues()
    this.initCal()
    this.loadCards()
    this.loadWallet()
    this.checkRecentBookings()
  },
  onShareAppMessage() {
    return indexSharePayload(this.venueId, this.venueName)
  },
  onShareTimeline() {
    return { title: indexSharePayload(this.venueId, this.venueName).title }
  },
  methods: {
    applyShareVenue(options) {
      var applied = applyIncomingVenue(options, {
        venueId: uni.getStorageSync('venue_id') || '',
        venueName: uni.getStorageSync('venue_name') || ''
      })
      if (applied.fromShare && applied.venueId) {
        this.pendingVenueId = applied.venueId
        this.pendingVenueName = applied.venueName || ''
        this.venueId = applied.venueId
        if (applied.venueName) this.venueName = applied.venueName
        uni.setStorageSync('venue_id', applied.venueId)
        if (applied.venueName) uni.setStorageSync('venue_name', applied.venueName)
      }
    },
    checkRecentBookings() {
      if (this.remindChecked) return
      var phone = uni.getStorageSync('phone') || ''
      var userId = uni.getStorageSync('userDocId') || ''
      if (!phone && !userId) return
      this.remindChecked = true
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getMyBookings', userId: userId, phone: phone, pageSize: 30, upcomingOnly: true }
      }).then(function (res) {
        var list = ((res.result || {}).list) || []
        var now = Date.now()
        var to = now + 3 * 86400000
        function bookingStartMs(b) {
          if (!b || !b.date) return NaN
          var start = String(b.time || '').split('-')[0].trim()
          if (!start) start = '00:00'
          if (start.length === 4) start = '0' + start
          if (start.length === 5) start = start + ':00'
          return new Date(String(b.date).replace(/-/g, '/') + ' ' + start).getTime()
        }
        var recent = list.filter(function (b) {
          if (!b.date || b.status === 'cancelled' || b.status === 'locked') return false
          var startMs = bookingStartMs(b)
          if (!isFinite(startMs)) return false
          // 开场时间已过（中国本地时区 = 手机本地）不再提醒
          return startMs >= now && startMs <= to
        }).sort(function (a, b) {
          return bookingStartMs(a) - bookingStartMs(b)
        })
        if (!recent.length) return
        that.remindList = recent.slice(0, 5)
        that.remindVisible = true
        that.loadRemindNotice()
      }).catch(function () {})
    },
    loadRemindNotice() {
      var that = this
      var venueId = uni.getStorageSync('venue_id') || ''
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getNotice', venueId: venueId }
      }).then(function (res) {
        var n = (res.result || {}).notice
        if (n && n.content) that.remindNotice = n.content
      }).catch(function () {})
    },
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
      this.calOpen = true
    },
    closeCal() {
      this.calOpen = false
    },
    closeRemind() {
      this.remindVisible = false
    },
    loadActivities() {
      var that = this
      var dates = that.dateRow.map(function (d) { return d.date })
      if (!dates.length) return
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getActivities', startDate: dates[0], endDate: dates[dates.length - 1] },
        success: function (res) {
          var r = res.result || {}
          that.activities = r.list || []
          if (typeof r.hasUpcomingGroupClass === 'boolean') that.hasUpcomingGroupClass = r.hasUpcomingGroupClass
          if (r.calendar && r.calendar.days) {
            that.calendarDays = Object.assign({}, that.calendarDays, r.calendar.days)
          }
        }
      })
    },
    loadBanners() {
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getBanners' },
        success: function (res) {
          var list = (res.result || {}).list || []
          if (list.length) that.banners = list
        }
      })
    },
    loadVenues() {
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenues' },
        success: function (res) {
          var list = (res.result || {}).list || []
          that.venueList = list
          var id = that.pendingVenueId || uni.getStorageSync('venue_id')
          var found = pickVenueFromList(list, id)
          if (found) {
            that.venueId = found.venueId || found._id
            that.venueName = found.name
            uni.setStorageSync('venue_id', that.venueId)
            uni.setStorageSync('venue_name', found.name)
          } else if (that.pendingVenueId) {
            that.venueId = that.pendingVenueId
            if (that.pendingVenueName) that.venueName = that.pendingVenueName
          } else if (id) {
            that.venueId = ''
            that.venueName = '请选择场馆'
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
    goShop() {
      uni.switchTab({
        url: '/pages/shop/shop',
        fail: function () { uni.navigateTo({ url: '/pages/shop/shop' }) }
      })
    },
    venuesOf(date) {
      var days = this.calendarDays || {}
      return days[date] || []
    },
    onCalLoaded(payload) {
      var r = unwrapEvent(payload) || {}
      if (r.days) this.calendarDays = Object.assign({}, this.calendarDays, r.days)
      if (typeof r.hasUpcomingGroupClass === 'boolean') this.hasUpcomingGroupClass = r.hasUpcomingGroupClass
    },
    onCalPickDate(date) {
      var ds = unwrapEvent(date)
      if (ds) this.pickDate(ds)
    },
    onCalOpenClass(payload) {
      var p = unwrapEvent(payload) || {}
      var id = p.id || ''
      var date = p.date || ''
      var venueId = p.venueId || ''
      var q = []
      if (date) q.push('date=' + encodeURIComponent(date))
      if (id) q.push('classId=' + encodeURIComponent(id))
      if (venueId) q.push('venueId=' + encodeURIComponent(venueId))
      this.calOpen = false
      uni.navigateTo({ url: '/pages/group/group' + (q.length ? '?' + q.join('&') : '') })
    },
    onBannerTap(e) {
      var ds = (e && e.currentTarget && e.currentTarget.dataset) || {}
      var i = Number(ds.i)
      var b = this.banners[i]
      if (!b) return
      var link = b.link || b.url || ''
      if (!link) return
      if (link.indexOf('/') !== 0) link = '/' + link
      var mode = b.navMode || b.navType || ''
      var tab = ['/pages/index/index', '/pages/shop/shop', '/pages/booking/booking', '/pages/my/my']
      if (mode === 'switchTab' || tab.indexOf(link) >= 0) {
        uni.switchTab({
          url: link,
          fail: function () { uni.navigateTo({ url: link }) }
        })
        return
      }
      uni.navigateTo({ url: link })
    },
    goGroup() {
      if (!this.hasUpcomingGroupClass) {
        uni.showToast({ title: '当前没有可报名的团课', icon: 'none' })
        return
      }
      var date = this.selectedDate
      var venues = this.venuesOf(date)
      var hasToday = (venues && venues.length) || (this.dayActivities || []).some(function (a) {
        return a.type === '团课' || a.groupClassId
      })
      var url = '/pages/group/group'
      if (hasToday && date) url += '?date=' + encodeURIComponent(date)
      uni.navigateTo({ url: url })
    },
    isActDisabled(a) {
      return !!(a && a.status === 'cancelled')
    },
    onTapActivity(e) {
      var ds = (e && e.currentTarget && e.currentTarget.dataset) || {}
      var list = this.dayActivities || []
      var idx = ds.idx
      var a = (idx !== '' && idx != null) ? list[Number(idx)] : null
      var type = (a && a.type) || ds.type || ''
      var gid = ''
      if (a) gid = a.groupClassId || a.group_class_id || ''
      if (!gid) gid = ds.gid || ''
      var date = (a && a.date) || ds.date || this.selectedDate || ''
      var status = (a && a.status) || ds.status || ''
      var isGroup = type === '团课' || !!gid
      if (!isGroup) return
      if (status === 'cancelled') {
        uni.showToast({ title: '该团课已取消', icon: 'none' })
        return
      }
      if (status === 'closed') {
        uni.showToast({ title: '该团课未开放', icon: 'none' })
        return
      }
      var url = '/pages/group/group'
      var q = []
      if (date) q.push('date=' + encodeURIComponent(date))
      if (gid) q.push('classId=' + encodeURIComponent(gid))
      if (q.length) url += '?' + q.join('&')
      uni.navigateTo({
        url: url,
        fail: function () {
          uni.showToast({ title: '无法打开报名页', icon: 'none' })
        }
      })
    },
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
.remind-pop { position: fixed; left: 40rpx; right: 40rpx; top: 30%; background: #fff; border-radius: 16rpx; padding: 32rpx; z-index: 200; }
.remind-title { font-size: 34rpx; font-weight: 700; color: #333; text-align: center; }
.remind-sub { font-size: 24rpx; color: #999; text-align: center; margin: 8rpx 0 20rpx; }
.remind-item { padding: 16rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.remind-main { font-size: 28rpx; font-weight: 600; color: #1a5c3a; }
.remind-sub2 { font-size: 24rpx; color: #666; margin-top: 4rpx; }
.remind-notice { background: #fff8e6; border-radius: 8rpx; padding: 16rpx; margin-top: 16rpx; font-size: 24rpx; color: #666; white-space: pre-wrap; }
.remind-btn { margin-top: 24rpx; background: #1a5c3a; color: #fff; text-align: center; border-radius: 8rpx; padding: 20rpx; font-size: 28rpx; }

.page { min-height: 100vh; background: #f4f2ee; padding-top: 0; }
.venue-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,.35);
  padding: 18rpx 28rpx;
  padding-top: calc(18rpx + env(safe-area-inset-top));
}
.vt-name { color: #fff; font-size: 36rpx; font-weight: 700; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vt-sw { color: #fff; font-size: 28rpx; margin-left: 16rpx; flex-shrink: 0; }
.hero-wrap { position: relative; height: 66vh; }
.hero { height: 66vh; }
.hero-img { width: 100%; height: 100%; }
.hero-mask { position: absolute; left: 0; right: 0; bottom: 0; height: 200rpx; background: linear-gradient(transparent, rgba(0,0,0,.45)); pointer-events: none; }
.hero-txt { position: absolute; left: 40rpx; right: 40rpx; bottom: 48rpx; color: #fff; z-index: 2; }
.hero-brand { font-size: 24rpx; letter-spacing: 4rpx; opacity: .85; }
.hero-title { font-size: 44rpx; font-weight: 700; margin-top: 8rpx; }
.sheet { background: #f4f2ee; border-radius: 32rpx 32rpx 0 0; margin-top: 0; position: relative; z-index: 3; padding: 32rpx 28rpx 180rpx; }
.d-hol { font-size: 18rpx; color: #e85d4c; margin-top: 2rpx; }
.date.on .d-hol { color: #ffd; }
.date-block { margin-bottom: 24rpx; }
.dates { white-space: nowrap; }
.date-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.date-label { font-size: 28rpx; font-weight: 600; color: #333; }
.date-zoom { display: flex; align-items: center; background: #1a5c3a; border-radius: 24rpx; padding: 8rpx 20rpx; }
.zoom-icon { font-size: 28rpx; margin-right: 6rpx; }
.zoom-txt { font-size: 24rpx; color: #fff; font-weight: 600; }
.hello-row { display: flex; align-items: center; background: #fff; border-radius: 20rpx; padding: 20rpx 24rpx; margin-bottom: 24rpx; box-shadow: 0 8rpx 28rpx rgba(0,0,0,.06); }
.avatar { width: 72rpx; height: 72rpx; border-radius: 50%; margin-right: 16rpx; flex-shrink: 0; }
.hello-txt { flex: 1; min-width: 0; }
.hi { font-size: 28rpx; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.no { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.wallet-inline { display: flex; gap: 32rpx; padding-left: 16rpx; }
.wi-item { text-align: center; min-width: 72rpx; }
.wi-num { font-size: 32rpx; font-weight: 700; color: #1a5c3a; }
.wi-lab { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.stat-row { display: flex; gap: 12rpx; margin-bottom: 24rpx; }
.stat { flex: 1; background: #fff; border-radius: 16rpx; padding: 24rpx 0; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,.04); }
.stat-n { font-size: 40rpx; font-weight: 700; color: #1a5c3a; }
.stat-l { font-size: 22rpx; color: #888; margin-top: 6rpx; }
.mask { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: rgba(0,0,0,.45); z-index: 100; display: flex; align-items: center; justify-content: center; }
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
.act.disabled { opacity: 0.55; }
.act-tag { background: #e8f5e9; color: #1a5c3a; font-size: 22rpx; padding: 6rpx 14rpx; border-radius: 8rpx; margin-right: 16rpx; }
.act-name { font-size: 28rpx; color: #333; }
.act-meta { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.act-body { flex: 1; min-width: 0; }
.act-arrow { font-size: 22rpx; color: #1a5c3a; margin-left: 12rpx; flex-shrink: 0; }
.act-state { font-size: 22rpx; color: #999; margin-left: 12rpx; flex-shrink: 0; }
.action-row { display: flex; gap: 16rpx; }
.action { flex: 1; background: linear-gradient(135deg, #1a5c3a, #2d8a5e); color: #fff; border-radius: 16rpx; padding: 32rpx 24rpx; box-shadow: 0 4rpx 12rpx rgba(26,92,58,.25); }
.action-title { font-size: 32rpx; font-weight: 700; }
.action-en { font-size: 20rpx; opacity: .75; margin-top: 6rpx; letter-spacing: 1rpx; }
</style>
