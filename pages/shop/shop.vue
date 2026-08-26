<template>
  <view class="page">
    <view class="banner">
      <view class="b-kicker">GOAT PRO SHOP</view>
      <view class="b-title">装备商城</view>
      <view class="b-sub">球拍 · 线 · 服饰即将上线</view>
    </view>
    <view class="empty">商城建设中，先去订场开打</view>
    <button class="btn" @tap="goBook">去订场</button>
    <app-tabbar :current="1" />
  </view>
</template>
<script>
import AppTabbar from '@/components/app-tabbar.vue'
export default {
  components: { AppTabbar },
  onShow() { try { uni.hideTabBar({ animation: false }) } catch (e) {} },
  methods: {
    goBook() { uni.switchTab({ url: '/pages/booking/booking' }) }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f4f2ee; padding-bottom: 180rpx; }
.banner { height: 360rpx; background: linear-gradient(135deg, #3f6b56, #6a9a7e); color: #fff; padding: 80rpx 40rpx; box-sizing: border-box; }
.b-kicker { letter-spacing: 6rpx; font-size: 20rpx; opacity: .8; }
.b-title { font-size: 48rpx; font-weight: 700; margin: 12rpx 0; }
.b-sub { font-size: 26rpx; opacity: .85; }
.empty { text-align: center; color: #999; padding: 80rpx 40rpx 30rpx; }
.btn { width: 60%; background: #3f6b56 !important; color: #fff !important; border-radius: 8rpx; }
</style>
