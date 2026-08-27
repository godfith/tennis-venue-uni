<template>
  <view class="page">
    <view class="hero">
      <image class="hero-image" src="/static/images/index/banner.jpg" mode="aspectFill"></image>
      <view class="hero-mask"></view>
      <view class="hero-brand">GOAT TENNIS</view>
      <view class="hero-name">山羊Goat网球馆</view>
    </view>

    <view class="sheet">
      <view class="hello-row">
        <image class="avatar" :src="avatarUrl || '/static/images/avatar.png'" mode="aspectFill"></image>
        <view class="hello-txt">
          <view class="hi">Hi, {{ nickName || '球友' }}</view>
          <view class="no">{{ phone ? phone : '登录后查看会员权益' }}</view>
        </view>
        <view class="points" @tap="goMyCards">
          <view class="p-lab">持卡张数</view>
          <view class="p-num">{{ cardCount }}</view>
        </view>
      </view>

      <view class="member-card" @tap="goMyCards">
        <view class="mc-left">
          <view class="mc-kicker">MEMBERSHIP</view>
          <view class="mc-level">Goat Member</view>
          <view class="mc-tip">点击查看全部会员卡</view>
        </view>
        <view class="mc-badge">
          <view class="mc-club">Goat Clubhouse</view>
          <view class="mc-sub">TENNIS</view>
        </view>
      </view>

      <view class="stat-row">
        <view class="stat" @tap="goCoach">
          <view class="stat-n">{{ coachLeft }}<text class="unit">次</text></view>
          <view class="stat-l">私教课</view>
        </view>
        <view class="stat" @tap="goMyCards">
          <view class="stat-n">{{ timesLeft }}<text class="unit">次</text></view>
          <view class="stat-l">场地次卡</view>
        </view>
        <view class="stat" @tap="goGroup">
          <view class="stat-n">{{ groupLeft }}<text class="unit">次</text></view>
          <view class="stat-l">团课卡</view>
        </view>
        <view class="stat" @tap="goMyCards">
          <view class="stat-n">{{ timeCardDays }}<text class="unit">天</text></view>
          <view class="stat-l">时间卡</view>
        </view>
      </view>

      <view class="action-row">
        <view class="action" @tap="goBooking">
          <view class="action-title">立即订场</view>
          <view class="action-en">BOOK A COURT</view>
          <view class="action-icon">🎾</view>
        </view>
        <view class="action" @tap="goCoach">
          <view class="action-title">预约私教</view>
          <view class="action-en">COACHING</view>
          <view class="action-icon">🏆</view>
        </view>
      </view>

      <view class="venue-bar" @tap="showVenuePicker">
        <view>
          <view class="v-lab">当前场馆</view>
          <view class="v-name">{{ venueName }}</view>
        </view>
        <view class="v-sw">切换场馆</view>
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
      venueList: [],
      venueId: '',
      venueName: '请选择场馆',
      nickName: '',
      phone: '',
      avatarUrl: '',
      cardCount: 0,
      coachLeft: 0,
      timesLeft: 0,
      groupLeft: 0,
      timeCardDays: 0
    }
  },
  onShow() {
    try { uni.hideTabBar({ animation: false }) } catch (e) {}
    this.nickName = uni.getStorageSync('nickName') || ''
    this.phone = uni.getStorageSync('phone') || ''
    this.avatarUrl = uni.getStorageSync('avatarUrl') || ''
    this.loadVenues()
    this.loadCards()
  },
  methods: {
    remainDays(card) {
      if (!card || !card.validTo) return 0
      var t = new Date(String(card.validTo).slice(0, 10).replace(/-/g, '/'))
      var now = new Date()
      now.setHours(0, 0, 0, 0)
      t.setHours(0, 0, 0, 0)
      var d = Math.round((t.getTime() - now.getTime()) / 86400000)
      return d > 0 ? d : 0
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
          var found = list.find(function (v) { return v.venueId === id })
          if (found) {
            that.venueId = found.venueId
            that.venueName = found.name
          } else if (list.length) {
            that.venueId = list[0].venueId
            that.venueName = list[0].name
            uni.setStorageSync('venue_id', that.venueId)
            uni.setStorageSync('venue_name', that.venueName)
          }
        }
      })
    },
    loadCards() {
      var that = this
      var userId = uni.getStorageSync('userDocId') || ''
      if (!userId && !uni.getStorageSync('openid')) {
        that.cardCount = that.coachLeft = that.timesLeft = that.groupLeft = that.timeCardDays = 0
        return
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getMyCards', userId: userId },
        success: function (res) {
          var list = ((res.result || {}).list || []).filter(function (c) {
            return c.status === 'active'
          })
          that.cardCount = list.length
          that.coachLeft = 0
          that.timesLeft = 0
          that.groupLeft = 0
          that.timeCardDays = 0
          list.forEach(function (c) {
            if (c.type === 'coach') that.coachLeft += Number(c.remainingTimes || 0)
            if (c.type === 'times') that.timesLeft += Number(c.remainingTimes || 0)
            if (c.type === 'group') that.groupLeft += Number(c.remainingTimes || 0)
            if (c.type === 'time') that.timeCardDays += that.remainDays(c)
          })
        }
      })
    },
    showVenuePicker() {
      if (!this.venueList.length) {
        uni.showToast({ title: '暂无场馆', icon: 'none' })
        return
      }
      var that = this
      uni.showActionSheet({
        itemList: that.venueList.map(function (v) { return v.name }),
        success: function (res) {
          var v = that.venueList[res.tapIndex]
          that.venueId = v.venueId
          that.venueName = v.name
          uni.setStorageSync('venue_id', v.venueId)
          uni.setStorageSync('venue_name', v.name)
        }
      })
    },
    goBooking() { uni.switchTab({ url: '/pages/booking/booking' }) },
    goCoach() { uni.navigateTo({ url: '/pages/coach/coach' }) },
    goGroup() { uni.navigateTo({ url: '/pages/group/group' }) },
    goMyCards() {
      if (!this.nickName && !this.phone) {
        uni.navigateTo({ url: '/pages/login/login' })
        return
      }
      uni.navigateTo({ url: '/pages/mycards/mycards' })
    }
  }
}
</script>

<style>
.page { min-height: 100vh; background: #f4f2ee; padding-bottom: 180rpx; }
.hero { height: 360rpx; position: relative; }
.hero-image { width: 100%; height: 100%; display: block; }
.hero-mask { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: linear-gradient(180deg, rgba(30,72,112,.08), rgba(30,72,112,.42)); }
.hero-brand { position: absolute; left: 40rpx; bottom: 88rpx; color: #fff; letter-spacing: 8rpx; font-size: 22rpx; font-weight: 600; }
.hero-name { position: absolute; left: 40rpx; bottom: 36rpx; color: #fff; font-size: 40rpx; font-weight: 700; }
.sheet { margin-top: -28rpx; background: #f4f2ee; border-radius: 28rpx 28rpx 0 0; padding: 36rpx 28rpx 40rpx; position: relative; }
.hello-row { display: flex; align-items: center; margin-bottom: 28rpx; }
.avatar { width: 88rpx; height: 88rpx; border-radius: 50%; margin-right: 20rpx; background: #ddd; }
.hello-txt { flex: 1; }
.hi { font-size: 34rpx; font-weight: 700; color: #1e4870; }
.no { font-size: 22rpx; color: #999; margin-top: 6rpx; }
.points { text-align: right; }
.p-lab { font-size: 20rpx; color: #999; }
.p-num { font-size: 40rpx; font-weight: 700; color: #1e4870; }
.member-card { background: #1e4870; border-radius: 20rpx; padding: 32rpx; display: flex; color: #fff; margin-bottom: 24rpx; }
.mc-left { flex: 1; }
.mc-kicker { font-size: 20rpx; letter-spacing: 3rpx; opacity: .7; }
.mc-level { font-size: 40rpx; font-weight: 700; margin: 10rpx 0 16rpx; }
.mc-tip { font-size: 22rpx; opacity: .75; }
.mc-badge { width: 220rpx; background: rgba(255,255,255,.08); border-radius: 16rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.mc-club { font-size: 24rpx; font-weight: 600; }
.mc-sub { font-size: 18rpx; letter-spacing: 4rpx; opacity: .6; margin-top: 8rpx; }
.stat-row { background: #fff; border-radius: 16rpx; display: flex; padding: 28rpx 0; margin-bottom: 24rpx; }
.stat { flex: 1; text-align: center; border-right: 1rpx solid #eee; }
.stat:last-child { border-right: none; }
.stat-n { font-size: 36rpx; font-weight: 700; color: #111; }
.unit { font-size: 20rpx; font-weight: 600; color: #888; margin-left: 2rpx; }
.stat-l { font-size: 20rpx; color: #999; margin-top: 8rpx; }
.action-row { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.action { flex: 1; background: #fff; border-radius: 16rpx; padding: 28rpx; min-height: 160rpx; position: relative; }
.action-title { font-size: 30rpx; font-weight: 700; color: #1e4870; }
.action-en { font-size: 18rpx; color: #aaa; letter-spacing: 2rpx; margin-top: 8rpx; }
.action-icon { position: absolute; right: 24rpx; bottom: 20rpx; font-size: 44rpx; }
.venue-bar { background: #fff; border-radius: 16rpx; padding: 24rpx 28rpx; display: flex; align-items: center; justify-content: space-between; }
.v-lab { font-size: 20rpx; color: #999; }
.v-name { font-size: 28rpx; font-weight: 600; color: #1e4870; margin-top: 6rpx; }
.v-sw { font-size: 24rpx; color: #1e4870; font-weight: 600; }
</style>
