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
          <image class="t-ico" src="/static/images/tab/shop-on.png"></image>
          <view class="t-l">卡券</view>
        </view>
        <view class="t-item" @tap="goMyBooking">
          <image class="t-ico" src="/static/images/tab/book-on.png"></image>
          <view class="t-l">预约</view>
        </view>
        <view class="t-item" @tap="goMyCards">
          <image class="t-ico" src="/static/images/tab/home-on.png"></image>
          <view class="t-l">会员卡</view>
        </view>
      </view>

      <view class="menu">
        <view class="menu-row" @tap="goMyBooking">
          <image class="m-ico" src="/static/images/tab/rank-on.png"></image>
          <text class="m-name">订单中心</text>
          <text class="en">MY ORDERS</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-row" @tap="goMyCards">
          <image class="m-ico" src="/static/images/tab/shop-on.png"></image>
          <text class="m-name">我的会员卡</text>
          <text class="en">MY CARDS</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-row" v-if="role === 'coach'" @tap="goCoachWorkbench">
          <image class="m-ico" src="/static/images/tab/book-on.png"></image>
          <text class="m-name">教练工作台</text>
          <text class="en">WORKBENCH</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-row" @tap="comingSoon">
          <image class="m-ico" src="/static/images/tab/mine-on.png"></image>
          <text class="m-name">个人资料</text>
          <text class="en">PERSONAL INFO</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-row" @tap="comingSoon">
          <image class="m-ico" src="/static/images/tab/home-on.png"></image>
          <text class="m-name">联系客服</text>
          <text class="en">CONTACT</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <view class="logout" @tap="logout">退出登录</view>
    </block>
    <app-tabbar :current="3" />
  </view>
</template>

<script>
import AppTabbar from '@/components/app-tabbar.vue'
export default {
  components: { AppTabbar },
  data() {
    return {
      isLogin: false,
      avatarUrl: '',
      nickName: '',
      phone: '',
      role: 'user'
    }
  },
  onShow() {
    try { uni.hideTabBar({ animation: false }) } catch (e) {}
    this.checkLoginStatus()
  },
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
.page { min-height: 100vh; background: #f4f2ee; padding-bottom: 180rpx; }
.login-box { margin: 120rpx 40rpx; background: #fff; border-radius: 24rpx; padding: 80rpx 40rpx; text-align: center; }
.login-title { font-size: 40rpx; font-weight: 700; }
.login-desc { font-size: 26rpx; color: #999; margin: 16rpx 0 48rpx; }
.login-btn { background: #1e4870 !important; color: #fff !important; border-radius: 8rpx; }
.head { padding: 48rpx 0 24rpx; display: flex; flex-direction: column; align-items: center; background: #fff; }
.avatar { width: 140rpx; height: 140rpx; border-radius: 50%; background: #eee; }
.name { font-size: 40rpx; font-weight: 700; margin-top: 20rpx; color: #1e4870; }
.since { font-size: 24rpx; color: #666; margin-top: 8rpx; }
.since.muted { color: #bbb; }
.triple { display: flex; background: #fff; padding: 12rpx 0 32rpx; margin-bottom: 16rpx; }
.t-item { flex: 1; text-align: center; }
.t-ico { width: 56rpx; height: 56rpx; }
.t-l { font-size: 22rpx; color: #1e4870; margin-top: 8rpx; font-weight: 600; }
.menu { background: #fff; }
.menu-row {
  padding: 28rpx 32rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f3f3f3;
}
.m-ico { width: 44rpx; height: 44rpx; margin-right: 20rpx; flex-shrink: 0; }
.m-name { flex: 1; font-size: 30rpx; color: #222; }
.en { font-size: 18rpx; color: #c0c4c8; letter-spacing: 1rpx; margin-right: 8rpx; }
.arrow { font-size: 36rpx; color: #ccc; line-height: 1; }
.logout { margin: 40rpx 36rpx; text-align: center; color: #c45656; font-size: 28rpx; }
</style>
