<template>
    <view class="page">
        <view class="header">选择教练 · {{ venueName }}</view>

        <view class="loading" v-if="loading">加载中...</view>

        <view class="empty" v-else-if="coachList.length === 0">
            <view>暂无教练信息</view>
        </view>

        <view class="coach-list" v-else>
            <view class="coach-card" @tap="goDetail(item._id)" v-for="(item, index) in coachList" :key="index">
                <image class="avatar" :src="item.avatar || '/static/images/avatar.png'" mode="aspectFill"></image>

                <view class="info">
                    <view class="name">{{ item.name }}</view>
                    <view class="title">{{ item.title || '教练' }}</view>
                    <view class="desc">{{ item.desc || item.remark || '' }}</view>
                    <view class="tags" v-if="item.tags && item.tags.length">
                        <text class="tag" v-for="(tag, index1) in item.tags" :key="index1">{{ tag }}</text>
                    </view>
                </view>

                <view class="arrow">›</view>
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
        loadCoaches() {
          const venueId = uni.getStorageSync('venue_id')
          if (!venueId) {
            uni.showToast({ title: '请先在首页选择场馆', icon: 'none' })
            this.coachList = []
            this.loading = false
            return
          }

          this.loading = true
          wx.cloud
            .callFunction({
              name: 'userApi',
              data: { action: 'getCoaches', venueId }
            })
            .then((res) => {
              const result = res.result || {}
              if (!result.ok) {
                uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
                this.coachList = []
                return
              }
              this.coachList = (result.list || []).filter(
                (c) => c.status === 'active' || c.status === '在职' || !c.status
              )
            })
            .catch((err) => {
              console.error('加载教练失败', err)
              uni.showToast({ title: '加载失败', icon: 'none' })
              this.coachList = []
            })
            .finally(() => {
              this.loading = false
            })
        },
        goDetail(id) {
          uni.navigateTo({
            url: `/pages/coach-detail/coach-detail?id=${id}`
          })
        }
    }
};
</script>
<style>
.page {
    min-height: 100vh;
    background: #f5f6f8;
    padding: 30rpx;
    box-sizing: border-box;
}
.header {
    font-size: 36rpx;
    font-weight: 700;
    color: #222;
    margin-bottom: 30rpx;
}
.loading, .empty {
    text-align: center;
    color: #999;
    padding: 80rpx 0;
    font-size: 28rpx;
}
.coach-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}
.avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    background: #f0f0f0;
    flex-shrink: 0;
}
.info {
    flex: 1;
    overflow: hidden;
}
.name {
    font-size: 32rpx;
    font-weight: 600;
    color: #222;
    margin-bottom: 6rpx;
}
.title {
    font-size: 24rpx;
    color: #07c160;
    margin-bottom: 8rpx;
}
.desc {
    font-size: 24rpx;
    color: #888;
    margin-bottom: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
}
.tag {
    font-size: 20rpx;
    background: #f0f9f4;
    color: #07c160;
    padding: 4rpx 14rpx;
    border-radius: 8rpx;
}
.arrow {
    font-size: 36rpx;
    color: #ccc;
    margin-left: 10rpx;
}
</style>
