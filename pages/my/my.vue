<template>
  <view class="page">
    <block v-if="!isLogin">
      <view class="login-box">
        <view class="login-title">成为 Goat 会员</view>
        <view class="login-desc">登录后可订场、约教练、查看会员卡</view>
        <button class="login-btn" @tap="goLogin">去登录</button>
      </view>
    </block>
    <block v-else>
      <view class="head">
        <image class="avatar" :src="avatarUrl || '/static/images/avatar.png'" mode="aspectFill"></image>
        <view class="name">{{ nickName }}</view>
        <view class="since" v-if="phone">{{ phone }}</view>
        <view class="since muted">山羊Goat网球馆会员</view>
      </view>

      <view class="triple">
        <view class="t-item" @tap="goMyCards">
          <view class="t-n">卡</view>
          <view class="t-l">卡券</view>
        </view>
        <view class="t-item" @tap="goMyBooking">
          <view class="t-n">约</view>
          <view class="t-l">预约</view>
        </view>
        <view class="t-item" @tap="goMyCards">
          <view class="t-n">会</view>
          <view class="t-l">会员卡</view>
        </view>
      </view>

      <view class="menu">
        <view class="item" @tap="goMyBooking">
          <text>订单中心</text><text class="en">MY ORDERS ›</text>
        </view>
        <view class="item" @tap="goMyCards">
          <text>我的会员卡</text><text class="en">MY CARDS ›</text>
        </view>
        <view class="item" v-if="role === 'coach'" @tap="goCoachWorkbench">
          <text>教练工作台</text><text class="en">WORKBENCH ›</text>
        </view>
        <view class="item" @tap="comingSoon">
          <text>个人资料</text><text class="en">PERSONAL INFO ›</text>
        </view>
        <view class="item" @tap="comingSoon">
          <text>联系客服</text><text class="en">CONTACT ›</text>
        </view>
      </view>
      <view class="logout" @tap="logout">退出登录</view>
    </block>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLogin: false,
      avatarUrl: '',
      nickName: '',
      phone: '',
      role: 'user'
    }
  },
  onShow() { this.checkLoginStatus() },
  methods: {
    checkLoginStatus() {
      var nickName = uni.getStorageSync('nickName') || ''
      var phone = uni.getStorageSync('phone') || ''
      if (nickName || phone) {
        this.isLogin = true
        this.avatarUrl = uni.getStorageSync('avatarUrl') || ''
        this.nickName = nickName || '会员'
        this.phone = phone
        this.role = uni.getStorageSync('role') || 'user'
      } else {
        this.isLogin = false
      }
    },
    goLogin() { uni.navigateTo({ url: '/pages/login/login' }) },
    goMyBooking() { uni.navigateTo({ url: '/pages/mybooking/mybooking' }) },
    goMyCards() { uni.navigateTo({ url: '/pages/mycards/mycards' }) },
    goCoachWorkbench() { uni.navigateTo({ url: '/pages/coach-workbench/coach-workbench' }) },
    comingSoon() { uni.showToast({ title: '功能即将上线', icon: 'none' }) },
    logout() {
      var that = this
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: function (res) {
          if (!res.confirm) return
          ;['avatarUrl','nickName','openid','userId','userDocId','phone','role'].forEach(function (k) {
            uni.removeStorageSync(k)
          })
          that.isLogin = false
        }
      })
    }
  }
}
</script>

<style>
.page { min-height: 100vh; background: #f4f2ee; padding-bottom: 40rpx; }
.login-box { margin: 120rpx 40rpx; background: #fff; border-radius: 24rpx; padding: 80rpx 40rpx; text-align: center; }
.login-title { font-size: 40rpx; font-weight: 700; }
.login-desc { font-size: 26rpx; color: #999; margin: 16rpx 0 48rpx; }
.login-btn { background: #0f3d28 !important; color: #fff !important; border-radius: 8rpx; }
.head { padding: 48rpx 0 24rpx; display: flex; flex-direction: column; align-items: center; background: #fff; }
.avatar { width: 140rpx; height: 140rpx; border-radius: 50%; background: #eee; }
.name { font-size: 40rpx; font-weight: 700; margin-top: 20rpx; }
.since { font-size: 24rpx; color: #666; margin-top: 8rpx; }
.since.muted { color: #bbb; }
.triple { display: flex; background: #fff; padding: 28rpx 0 40rpx; margin-bottom: 16rpx; }
.t-item { flex: 1; text-align: center; }
.t-n { font-size: 32rpx; font-weight: 700; }
.t-l { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.menu { background: #fff; }
.item { padding: 34rpx 36rpx; display: flex; justify-content: space-between; border-bottom: 1rpx solid #f3f3f3; font-size: 30rpx; }
.en { font-size: 20rpx; color: #bbb; letter-spacing: 1rpx; }
.logout { margin: 40rpx 36rpx; text-align: center; color: #c45656; font-size: 28rpx; }
</style>
