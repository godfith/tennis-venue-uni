<template>
  <view class="page">
    <view class="banner">
      <view class="b-kicker">GOAT PRO SHOP</view>
      <view class="b-title">装备商城</view>
      <view class="b-sub">球拍 · 线 · 服饰即将上线</view>
    </view>
    <view class="empty">商城建设中，先去订场开打</view>
    <button class="btn" @tap="goBook">去订场</button>
  </view>
</template>
<script>
export default {
  methods: {
    goBook() { uni.switchTab({ url: '/pages/booking/booking' }) }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f4f2ee; }
.banner { height: 360rpx; background: linear-gradient(135deg, #0f3d28, #2d8a5e); color: #fff; padding: 80rpx 40rpx; box-sizing: border-box; }
.b-kicker { letter-spacing: 6rpx; font-size: 20rpx; opacity: .8; }
.b-title { font-size: 48rpx; font-weight: 700; margin: 12rpx 0; }
.b-sub { font-size: 26rpx; opacity: .85; }
.empty { text-align: center; color: #999; padding: 80rpx 40rpx 30rpx; }
.btn { width: 60%; background: #0f3d28 !important; color: #fff !important; border-radius: 8rpx; }
</style>
