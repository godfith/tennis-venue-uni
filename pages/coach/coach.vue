<template>
  <view class="page">
    <view class="hero">
      <view class="kicker">PRIVATE COACHING</view>
      <view class="h1">预约私教</view>
      <view class="h2">{{ venueName || '请先选择场馆' }}</view>
    </view>

    <view class="loading" v-if="loading">加载教练中...</view>
    <view class="empty" v-else-if="coachList.length === 0">本店暂未安排教练</view>

    <view class="list" v-else>
      <view class="card" v-for="(item, index) in coachList" :key="item._id" @tap="goDetail(item._id)">
        <view class="num">{{ pad(index + 1) }}</view>
        <image class="avatar" :src="item.avatar || '/static/images/avatar.png'" mode="aspectFill"></image>
        <view class="info">
          <view class="name">{{ item.name }}</view>
          <view class="title">{{ item.title || '专业教练' }}</view>
          <view class="desc">{{ item.desc || item.remark || '点击查看可约时段' }}</view>
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
    pad(n) {
      return n < 10 ? '0' + n : '' + n
    },
    loadCoaches() {
      var venueId = uni.getStorageSync('venue_id')
      if (!venueId) {
        uni.showToast({ title: '请先在首页选择场馆', icon: 'none' })
        this.coachList = []
        this.loading = false
        return
      }
      this.loading = true
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCoaches', venueId: venueId },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
            that.coachList = []
            return
          }
          that.coachList = (result.list || []).filter(function (c) {
            return c.status === 'active' || c.status === '在职' || !c.status
          })
        },
        fail: function () {
          uni.showToast({ title: '加载失败', icon: 'none' })
          that.coachList = []
        },
        complete: function () {
          that.loading = false
        }
      })
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/coach-detail/coach-detail?id=' + id })
    }
  }
}
</script>

<style>
.page { min-height: 100vh; background: #f4f2ee; padding-bottom: 40rpx; }
.hero { padding: 36rpx 36rpx 20rpx; background: #1c1c1c; color: #fff; }
.kicker { font-size: 20rpx; letter-spacing: 6rpx; color: #c8a36a; }
.h1 { font-size: 48rpx; font-weight: 700; margin: 10rpx 0 8rpx; }
.h2 { font-size: 24rpx; color: #aaa; }
.loading, .empty { text-align: center; color: #999; padding: 80rpx 0; }
.list { padding: 24rpx 24rpx 0; }
.card {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 18rpx;
  position: relative;
}
.num { position: absolute; right: 24rpx; top: 16rpx; font-size: 22rpx; color: #ddd; letter-spacing: 2rpx; }
.avatar { width: 128rpx; height: 160rpx; border-radius: 4rpx; background: #ddd; margin-right: 24rpx; flex-shrink: 0; }
.info { flex: 1; min-width: 0; }
.name { font-size: 34rpx; font-weight: 700; color: #111; }
.title { font-size: 22rpx; color: #c45c26; margin: 6rpx 0 10rpx; letter-spacing: 2rpx; }
.desc { font-size: 24rpx; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cta {
  margin-left: 12rpx;
  background: #111;
  color: #fff;
  font-size: 22rpx;
  padding: 10rpx 18rpx;
  letter-spacing: 2rpx;
}
</style>
