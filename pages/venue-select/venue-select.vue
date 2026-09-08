<template>
  <view class="page">
    <view class="hero">
      <view class="logo-text">选择注册场馆</view>
    </view>
    <view class="card">
      <view v-if="loading" class="empty">加载场馆中...</view>
      <view
        v-for="(v, idx) in list"
        :key="idx"
        class="item"
        :class="pickedIndex === idx ? 'active' : ''"
        @tap="onPick(idx)"
      >
        <view class="name">{{ v.name }}</view>
      </view>
      <view v-if="!loading && !list.length" class="empty">暂无场馆</view>
      <view class="submit-btn" :class="pickedIndex < 0 ? 'off' : ''" @tap="askConfirm">确认注册场馆</view>
    </view>
  </view>
</template>
<script>
import { callCloud } from '@/utils/api'
export default {
  data() {
    return {
      list: [],
      pickedIndex: -1,
      loading: false,
      saving: false
    }
  },
  onShow() {
    this.loadVenues()
  },
  methods: {
    venueIdOf(v) {
      if (!v) return ''
      return v.venueId || v._id || v.id || ''
    },
    loadVenues() {
      var that = this
      that.loading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenues' },
        success: function (res) {
          var raw = (res.result || {}).list || []
          that.list = raw.map(function (v) {
            return {
              venueId: that.venueIdOf(v),
              name: v.name || ''
            }
          })
        },
        complete: function () {
          that.loading = false
        }
      })
    },
    onPick(idx) {
      this.pickedIndex = idx
    },
    askConfirm() {
      if (this.saving) return
      var v = this.list[this.pickedIndex]
      if (!v || !v.venueId) {
        uni.showToast({ title: '请选择场馆', icon: 'none' })
        return
      }
      var that = this
      uni.showModal({
        title: '确认注册场馆',
        content: '将「' + v.name + '」记为你的注册店？',
        confirmText: '确认',
        cancelText: '再想想',
        success: function (r) {
          if (r.confirm) that.saveVenue(v.venueId, v.name)
        }
      })
    },
    async saveVenue(venueId, venueName) {
      this.saving = true
      try {
        uni.setStorageSync('home_venue_id', venueId)
        uni.setStorageSync('home_venue_name', venueName)
        if (!uni.getStorageSync('venue_id')) {
          uni.setStorageSync('venue_id', venueId)
          uni.setStorageSync('venue_name', venueName)
        }
        await callCloud({
          name: 'login',
          data: {
            action: 'setVenue',
            userId: uni.getStorageSync('userDocId') || uni.getStorageSync('userId') || '',
            openid: uni.getStorageSync('openid') || '',
            venueId: venueId,
            venueName: venueName
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
.card { background: #fff; border-radius: 24rpx; padding: 28rpx 24rpx 36rpx; }
.item { background: #f4f2ee; border-radius: 16rpx; padding: 28rpx 24rpx; margin-bottom: 16rpx; border: 2rpx solid transparent; }
.item.active { border-color: #1e4870; background: #eef3f8; }
.name { font-size: 32rpx; font-weight: 700; color: #1e4870; }
.empty { text-align: center; color: #999; padding: 40rpx 0; }
.submit-btn { width: 100%; height: 90rpx; line-height: 90rpx; text-align: center; margin-top: 20rpx; background: #1e4870; color: #fff; border-radius: 16rpx; font-size: 32rpx; }
.submit-btn.off { opacity: 0.45; }
</style>
