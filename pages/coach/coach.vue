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

    <view class="chips">
      <view class="chip">
        <view class="ico ico-green">🎾</view>
        <text>一对一</text>
      </view>
      <view class="chip">
        <view class="ico ico-copper">🧢</view>
        <text>{{ coachList.length }} 位教练</text>
      </view>
      <view class="chip">
        <view class="ico ico-sage">📅</view>
        <text>7天可约</text>
      </view>
    </view>

    <view class="loading" v-if="loading">加载教练中...</view>
    <view class="empty" v-else-if="!coachList.length">本店暂未安排教练</view>

    <view class="list" v-else>
      <view
        class="card"
        v-for="(item, index) in coachList"
        :key="item._id"
        @tap="goDetail(item._id)"
      >
        <view :class="'photo tone-' + (index % 3)">
          <image
            class="avatar"
            :src="item.avatar || '/static/images/avatar.png'"
            mode="aspectFill"
          ></image>
          <view class="badge">0{{ index + 1 }}</view>
        </view>
        <view class="body">
          <view class="row1">
            <view>
              <view class="name">{{ item.name }}</view>
              <view class="title">{{ item.title || '专业教练' }}</view>
            </view>
            <view class="cta">约课</view>
          </view>
          <view class="desc">{{ item.desc || item.remark || '可预约场地与私教时段' }}</view>
          <view class="tags">
            <text class="tag t1">私教</text>
            <text class="tag t2">可约时段</text>
            <text class="tag t3" v-if="item.phone">认证教练</text>
          </view>
        </view>
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
          that.coachList = ((result.list || []).filter(function (c) {
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
.page { min-height: 100vh; background: #f3f1ec; padding-bottom: 40rpx; }
.top { padding: 28rpx 28rpx 8rpx; }
.hello { font-size: 36rpx; font-weight: 700; color: #2c2c2c; }
.venue { font-size: 24rpx; color: #8a8680; margin-top: 6rpx; }
.tabs { margin: 12rpx 28rpx 16rpx; display: flex; background: #e8e4dc; border-radius: 12rpx; overflow: hidden; }
.tab { flex: 1; text-align: center; padding: 18rpx 0; font-size: 28rpx; color: #6b6760; }
.tab.on { background: #fff; color: #2c2c2c; font-weight: 700; }
.chips { display: flex; gap: 12rpx; padding: 0 24rpx 20rpx; }
.chip { flex: 1; background: #fff; border-radius: 12rpx; padding: 16rpx 12rpx; display: flex; align-items: center; gap: 10rpx; font-size: 22rpx; color: #5c5852; }
.ico { width: 44rpx; height: 44rpx; border-radius: 10rpx; display: flex; align-items: center; justify-content: center; font-size: 24rpx; }
.ico-green { background: #3f6b56; }
.ico-copper { background: #c97848; }
.ico-sage { background: #7a8f7a; }
.loading, .empty { text-align: center; color: #8a8680; padding: 80rpx 0; }
.list { padding: 0 20rpx; }
.card { background: #fff; border-radius: 20rpx; overflow: hidden; margin-bottom: 20rpx; }
.photo { height: 220rpx; position: relative; background: #d8d2c8; }
.tone-0 { background: #d7e0d8; }
.tone-1 { background: #e7d7c8; }
.tone-2 { background: #d6d3e0; }
.avatar { width: 100%; height: 220rpx; }
.badge {
  position: absolute; left: 16rpx; top: 16rpx;
  background: rgba(44,44,44,.72); color: #fff;
  font-size: 20rpx; letter-spacing: 2rpx;
  padding: 6rpx 12rpx; border-radius: 8rpx;
}
.body { padding: 20rpx 22rpx 22rpx; }
.row1 { display: flex; justify-content: space-between; align-items: flex-start; }
.name { font-size: 34rpx; font-weight: 700; color: #2c2c2c; }
.title { font-size: 22rpx; color: #3f6b56; margin-top: 4rpx; }
.cta { background: #3f6b56; color: #fff; font-size: 24rpx; padding: 10rpx 22rpx; border-radius: 10rpx; }
.desc { font-size: 24rpx; color: #8a8680; margin: 12rpx 0 14rpx; line-height: 1.5; }
.tags { display: flex; gap: 10rpx; flex-wrap: wrap; }
.tag { font-size: 20rpx; padding: 6rpx 14rpx; border-radius: 8rpx; }
.t1 { background: #eef4f0; color: #3f6b56; }
.t2 { background: #f6eee6; color: #b87333; }
.t3 { background: #eeeaf3; color: #6b5b8c; }
</style>
