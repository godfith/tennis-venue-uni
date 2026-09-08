<template>
  <view class="page">
    <view class="hero">
      <view class="logo-text">选择场馆</view>
      <view class="logo-sub">登录后请先确认常去的店，订场和约教练都会记到这家</view>
    </view>
    <view class="card">
      <view v-if="loading" class="empty">加载场馆中...</view>
      <view
        v-for="v in list"
        :key="v.venueId || v._id"
        class="item"
        :class="picked === (v.venueId || v._id) ? 'on' : ''"
        @tap="pick(v)"
      >
        <view class="name">{{ v.name }}</view>
        <view class="addr" v-if="v.address">{{ v.address }}</view>
        <view class="addr" v-else>点击选中，再点下方确认</view>
      </view>
      <view v-if="!loading && !list.length" class="empty">暂无场馆</view>
      <button class="submit-btn" :disabled="!picked" :loading="saving" @tap="askConfirm">确认进入</button>
    </view>
  </view>
</template>
<script>
import { callCloud } from '@/utils/api'
export default {
  data() {
    return { list: [], picked: '', pickedName: '', loading: false, saving: false }
  },
  onShow() { this.loadVenues() },
  methods: {
    loadVenues() {
      var that = this
      that.loading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenues' },
        success: function (res) { that.list = (res.result || {}).list || [] },
        complete: function () { that.loading = false }
      })
    },
    pick(v) {
      this.picked = v.venueId || v._id
      this.pickedName = v.name
    },
    askConfirm() {
      if (!this.picked) {
        uni.showToast({ title: '请选择场馆', icon: 'none' })
        return
      }
      var that = this
      uni.showModal({
        title: '确认常去场馆',
        content: '将「' + that.pickedName + '」设为你的注册场馆？订场、约教练和后台用户资料都会记在这家。',
        confirmText: '确认',
        cancelText: '再想想',
        success: function (r) { if (r.confirm) that.saveVenue() }
      })
    },
    async saveVenue() {
      this.saving = true
      try {
        uni.setStorageSync('venue_id', this.picked)
        uni.setStorageSync('venue_name', this.pickedName)
        uni.setStorageSync('home_venue_id', this.picked)
        uni.setStorageSync('home_venue_name', this.pickedName)
        await callCloud({
          name: 'login',
          data: {
            action: 'setVenue',
            userId: uni.getStorageSync('userDocId') || uni.getStorageSync('userId') || '',
            openid: uni.getStorageSync('openid') || '',
            venueId: this.picked,
            venueName: this.pickedName
          }
        })
        uni.switchTab({ url: '/pages/index/index' })
      } catch (e) {
        uni.switchTab({ url: '/pages/index/index' })
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
<style>
.page { min-height: 100vh; background: linear-gradient(180deg, #1e4870 0%, #f4f2ee 42%); padding: 80rpx 40rpx 40rpx; box-sizing: border-box; }
.hero { text-align: center; color: #fff; margin-bottom: 40rpx; }
.logo-text { font-size: 44rpx; font-weight: 700; }
.logo-sub { font-size: 26rpx; opacity: 0.85; margin-top: 12rpx; padding: 0 20rpx; line-height: 1.5; }
.card { background: #fff; border-radius: 24rpx; padding: 28rpx 24rpx 36rpx; }
.item { background: #f4f2ee; border-radius: 16rpx; padding: 28rpx 24rpx; margin-bottom: 16rpx; border: 2rpx solid transparent; }
.item.on { border-color: #1e4870; background: #eef3f8; }
.name { font-size: 32rpx; font-weight: 700; color: #1e4870; }
.addr { font-size: 24rpx; color: #888; margin-top: 8rpx; }
.empty { text-align: center; color: #999; padding: 40rpx 0; }
.submit-btn { width: 100%; height: 90rpx; line-height: 90rpx; margin-top: 20rpx; background: #1e4870 !important; color: #fff !important; border-radius: 16rpx; font-size: 32rpx; }
.submit-btn[disabled] { opacity: 0.45; }
</style>
