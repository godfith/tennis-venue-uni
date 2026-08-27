<template>
  <view class="page">
    <view class="title">赛事排名</view>
    <view class="sub">TOURNAMENT RANKING</view>
    <view class="empty">排名功能即将上线</view>
    <app-tabbar :current="4" />
  </view>
</template>
<script>
import AppTabbar from '@/components/app-tabbar.vue'
export default {
  components: { AppTabbar },
  onShow() { try { uni.hideTabBar({ animation: false }) } catch (e) {} }
}
</script>
<style>
.page { min-height: 100vh; background: #f4f2ee; padding-top: 80rpx; padding-bottom: 180rpx; text-align: center; }
.title { font-size: 44rpx; font-weight: 700; color: #1e4870; }
.sub { font-size: 22rpx; color: #999; letter-spacing: 4rpx; margin-top: 8rpx; }
.empty { margin-top: 80rpx; color: #aaa; }
</style>
