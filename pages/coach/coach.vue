<template>
  <view class="page">
    <view class="top">
      <view class="top-l">
        <view class="hello">预约私教</view>
        <view class="venue">{{ venueName || '请先选择场馆' }}</view>
      </view>
    </view>

    <view class="tabs">
      <view class="tab" @tap="goBook">订场</view>
      <view class="tab on">私教</view>
    </view>

    <view class="loading" v-if="loading">加载教练中...</view>
    <view class="empty" v-else-if="!coachList.length">本店暂未安排教练</view>

    <view class="list" v-else>
      <view class="card" v-for="item in coachList" :key="item._id" @tap="goDetail(item._id)">
        <image class="avatar" :src="item.avatar || '/static/images/avatar.png'" mode="aspectFill"></image>
        <view class="info">
          <view class="name">{{ item.name }}</view>
          <view class="title">{{ item.title || '专业教练' }}</view>
          <view class="desc">{{ item.desc || item.remark || '查看可约时段' }}</view>
        </view>
        <view class="cta">选择</view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      coachList: [],
      loading: true,
      venueName: uni.getStorageSync('venue_name') || ''
    }
  },
  onShow() {
    this.venueName = uni.getStorageSync('venue_name') || ''
    this.loadCoaches()
  },
  methods: {
    goBook() { uni.switchTab({ url: '/pages/booking/booking' }) },
    loadCoaches() {
      var venueId = uni.getStorageSync('venue_id')
      var that = this
      if (!venueId) {
        uni.showToast({ title: '请先在首页选择场馆', icon: 'none' })
        that.coachList = []
        that.loading = false
        return
      }
      that.loading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCoaches', venueId: venueId },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) {
            that.coachList = []
            return
          }
          that.coachList = (result.list || []).filter(function (c) {
            return c.status === 'active' || c.status === '在职' || !c.status
          })
        },
        fail: function () { that.coachList = [] },
        complete: function () { that.loading = false }
      })
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/coach-detail/coach-detail?id=' + id })
    }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f3f1ec; }
.top { padding: 28rpx 28rpx 12rpx; }
.hello { font-size: 36rpx; font-weight: 700; color: #2c2c2c; }
.venue { font-size: 24rpx; color: #8a8680; margin-top: 6rpx; }
.tabs { margin: 12rpx 28rpx 20rpx; display: flex; background: #e8e4dc; border-radius: 12rpx; overflow: hidden; }
.tab { flex: 1; text-align: center; padding: 18rpx 0; font-size: 28rpx; color: #6b6760; }
.tab.on { background: #fff; color: #2c2c2c; font-weight: 700; }
.loading, .empty { text-align: center; color: #8a8680; padding: 80rpx 0; }
.list { padding: 0 20rpx 40rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx; display: flex; align-items: center; }
.avatar { width: 108rpx; height: 108rpx; border-radius: 12rpx; background: #e8e4dc; margin-right: 20rpx; }
.info { flex: 1; min-width: 0; }
.name { font-size: 32rpx; font-weight: 700; color: #2c2c2c; }
.title { font-size: 22rpx; color: #3f6b56; margin: 6rpx 0; }
.desc { font-size: 24rpx; color: #8a8680; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cta { background: #3f6b56; color: #fff; font-size: 24rpx; padding: 12rpx 22rpx; border-radius: 10rpx; }
</style>
