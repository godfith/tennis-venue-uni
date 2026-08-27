<template>
  <view class="page">
    <view class="top">
      <view class="hello">预约私教</view>
      <view class="venue">{{ venueName || '请先选择场馆' }}</view>
    </view>

    <view class="tabs">
      <view class="tab" @tap="goBook">订场</view>
      <view class="tab on">私教</view>
    </view>

    <view class="loading" v-if="loading">加载教练中...</view>
    <view class="empty" v-else-if="!coachList.length">本店暂未安排教练</view>

    <view class="list" v-else>
      <view class="card" v-for="item in coachList" :key="item._id" @tap="goDetail(item._id)">
        <view class="photo">
          <image class="avatar" :src="cover(item)" mode="aspectFit"></image>
        </view>
        <view class="info">
          <view class="name">{{ item.name }}</view>
          <view class="title">{{ item.title || '专业教练' }}</view>
          <view class="desc">{{ item.desc || item.remark || '查看可约时段' }}</view>
        </view>
        <view class="cta">约课</view>
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
    cover(item) {
      return item.avatar || '/static/images/ui/MMi0Y.jpg'
    },
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
          that.coachList = (((res.result || {}).list || []).filter(function (c) {
            return c.status === 'active' || c.status === '在职' || !c.status
          }))
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
.page { min-height: 100vh; background: #f4f2ee; }
.top { padding: 28rpx 32rpx 8rpx; }
.hello { font-size: 36rpx; font-weight: 700; color: #1e4870; }
.venue { font-size: 24rpx; color: #8a8680; margin-top: 6rpx; }
.tabs { margin: 16rpx 28rpx 24rpx; display: flex; background: #e8e4dc; border-radius: 12rpx; overflow: hidden; }
.tab { flex: 1; text-align: center; padding: 18rpx 0; font-size: 28rpx; color: #6b6760; }
.tab.on { background: #fff; color: #1e4870; font-weight: 700; }
.loading, .empty { text-align: center; color: #8a8680; padding: 80rpx 0; }
.list { padding: 0 24rpx 40rpx; }
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}
.photo {
  width: 132rpx; height: 132rpx; border-radius: 16rpx; overflow: hidden;
  background: #ece8e1; flex-shrink: 0; margin-right: 20rpx;
}
.avatar { width: 132rpx; height: 132rpx; }
.info { flex: 1; min-width: 0; }
.name { font-size: 32rpx; font-weight: 700; color: #222; }
.title { font-size: 22rpx; color: #1e4870; margin: 6rpx 0; }
.desc {
  font-size: 22rpx; color: #8a8680;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.cta {
  margin-left: 12rpx; background: #1e4870; color: #fff;
  font-size: 24rpx; padding: 12rpx 22rpx; border-radius: 10rpx; flex-shrink: 0;
}
</style>
