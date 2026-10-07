<template>
  <view class="page">
    <view class="card">
      <view class="lab">现金余额</view>
      <view class="num">¥{{ Number(balance).toFixed(2) }}</view>
      <view class="tip">订场时可直接抵扣。余额由门店充值或退款产生，暂不支持在线充值。</view>
    </view>
    <view class="card">
      <view class="lab">积分</view>
      <view class="num">{{ points || 0 }}</view>
      <view class="tip">积分暂不抵扣，仅作会员记录。</view>
    </view>
    <view class="row" v-if="phone">当前账号 {{ phone }}</view>
    <button class="btn" @tap="goBook">去订场使用余额</button>
    <button class="back" @tap="back">返回</button>
  </view>
</template>
<script>
export default {
  data() {
    return { balance: 0, points: 0, phone: '' }
  },
  onShow() {
    this.phone = uni.getStorageSync('phone') || ''
    if (!this.phone) {
      this.balance = 0
      this.points = 0
      uni.removeStorageSync('balance')
      uni.removeStorageSync('points')
      return
    }
    this.balance = Number(uni.getStorageSync('balance') || 0)
    this.points = Number(uni.getStorageSync('points') || 0)
    this.loadWallet()
  },
  methods: {
    loadWallet() {
      var id = uni.getStorageSync('userDocId') || ''
      if (!id) return
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getMyCards', userId: id },
        success: function (res) {
          var result = res.result || {}
          if (result.balance != null) {
            that.balance = Number(result.balance) || 0
            uni.setStorageSync('balance', that.balance)
          }
          if (result.points != null) {
            that.points = Number(result.points) || 0
            uni.setStorageSync('points', that.points)
          }
        }
      })
    },
    goBook() { uni.switchTab({ url: '/pages/booking/booking' }) },
    back() { uni.navigateBack() }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f4f2ee; padding: 28rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 28rpx; margin-bottom: 16rpx; }
.lab { font-size: 24rpx; color: #888; }
.num { font-size: 48rpx; font-weight: 700; color: #1e4870; margin: 8rpx 0; }
.tip { font-size: 26rpx; color: #666; line-height: 1.6; }
.row { color: #888; font-size: 24rpx; margin: 12rpx 0 24rpx; }
.btn { background: #1e4870 !important; color: #fff !important; border-radius: 12rpx; }
.back { margin-top: 16rpx; background: #fff !important; color: #1e4870 !important; border-radius: 12rpx; }
</style>
