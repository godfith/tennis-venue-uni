<template>
    <view class="page">
        <view class="hero">
            <image class="hero-image" src="/static/images/index/title.jpg" mode="aspectFill"></image>
        </view>
		<view class="venue-bar" @tap="showVenuePicker">
		  <text class="venue-label">当前场馆</text>
		  <text class="venue-name">{{ venueName }}</text>
		  <text class="venue-arrow">切换 ›</text>
		</view>

        <view class="block">
            <view class="block-header">
                <text class="block-title">赛事与活动</text>
                <text class="more" @tap="comingSoon">更多 ></text>
            </view>

            <scroll-view scroll-x class="event-list" enhanced :show-scrollbar="false">
                <view class="event-item event-blue">
                    <view class="event-tag">进行中</view>
                    <view class="event-name">周末网球体验营</view>
                    <view class="event-date">本周六 - 周日</view>
                </view>
                <view class="event-item event-green">
                    <view class="event-tag green">报名中</view>
                    <view class="event-name">青少年网球挑战赛</view>
                    <view class="event-date">即将开始</view>
                </view>
            </scroll-view>
        </view>

        <view class="block">
            <view class="block-header">
                <text class="block-title">场馆服务</text>
            </view>

            <view class="service-box">
                <view class="service-item" @tap="goBooking">
                    <view class="icon-wrap">📅</view>
                    <text>场地预订</text>
                </view>
                <view class="service-item" @tap="goCoach">
                    <view class="icon-wrap">🎾</view>
                    <text>教练指导</text>
                </view>
                <view class="service-item" @tap="comingSoon">
                    <view class="icon-wrap">🏋️</view>
                    <text>配套设施</text>
                </view>
                <view class="service-item" @tap="goMy">
                    <view class="icon-wrap">👤</view>
                    <text>会员中心</text>
                </view>
            </view>
        </view>

        <view class="block">
            <view class="block-header">
                <text class="block-title">场馆风采</text>
            </view>

            <scroll-view scroll-x class="gallery" enhanced :show-scrollbar="false">
                <view class="gallery-item g1"></view>
                <view class="gallery-item g2"></view>
                <view class="gallery-item g3"></view>
            </scroll-view>
        </view>

        <view class="safe-bottom"></view>
    </view>
</template>

<script>
export default {
    data() {
      return {
        venueList: [],
        venueId: '',
        venueName: '请选择场馆'
      }
    },
	onShow() {
	  this.loadVenues()
	},
methods: {
  loadVenues() {
    wx.cloud
      .callFunction({
        name: 'userApi',
        data: { action: 'getVenues' }
      })
      .then((res) => {
        const result = res.result || {}
        const list = result.list || []
        this.venueList = list

        let id = uni.getStorageSync('venue_id')
        let name = uni.getStorageSync('venue_name')

        if (!id && list.length) {
          id = list[0].venueId
          name = list[0].name
          uni.setStorageSync('venue_id', id)
          uni.setStorageSync('venue_name', name)
        }

        const found = list.find((v) => v.venueId === id)
        if (found) {
          this.venueId = found.venueId
          this.venueName = found.name
        } else if (list.length) {
          this.venueId = list[0].venueId
          this.venueName = list[0].name
          uni.setStorageSync('venue_id', this.venueId)
          uni.setStorageSync('venue_name', this.venueName)
        }
      })
      .catch((err) => {
        console.error('加载场馆失败', err)
        uni.showToast({ title: '加载场馆失败', icon: 'none' })
      })
  },

  showVenuePicker() {
    if (!this.venueList.length) {
      uni.showToast({ title: '暂无场馆', icon: 'none' })
      return
    }
    const names = this.venueList.map((v) => v.name)
    uni.showActionSheet({
      itemList: names,
      success: (res) => {
        const v = this.venueList[res.tapIndex]
        this.venueId = v.venueId
        this.venueName = v.name
        uni.setStorageSync('venue_id', v.venueId)
        uni.setStorageSync('venue_name', v.name)
        uni.showToast({ title: '已切换', icon: 'success' })
      }
    })
  },
        goBooking() {
            uni.switchTab({
                url: '/pages/booking/booking'
            });
        },

        goMy() {
            uni.switchTab({
                url: '/pages/my/my'
            });
        },

        goCoach() {
            uni.navigateTo({
                url: '/pages/coach/coach'
            });
        },

        comingSoon() {
            uni.showToast({
                title: '功能即将上线',
                icon: 'none'
            });
        }
    }
};
</script>
<style>
.page {
    min-height: 100vh;
    background: #f5f6f8;
    padding-bottom: 40rpx;
    box-sizing: border-box;
}
.hero {
    height: 420rpx;
    width: 100%;
    overflow: hidden;
}
.hero-image {
    width: 100%;
    height: 100%;
    display: block;
}
.block {
    margin: 36rpx 30rpx 0;
}
.block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
}
.block-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
}
.more {
    font-size: 26rpx;
    color: #999;
}
.event-list {
    white-space: nowrap;
    width: 100%;
}
.event-item {
    display: inline-block;
    width: 400rpx;
    height: 200rpx;
    border-radius: 20rpx;
    margin-right: 24rpx;
    padding: 28rpx;
    box-sizing: border-box;
    position: relative;
    vertical-align: top;
    color: #fff;
}
.event-blue {
    background: linear-gradient(135deg, #1e4a6e, #2c6a9e);
}
.event-green {
    background: linear-gradient(135deg, #1a5c45, #2d8a6a);
}
.event-tag {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background: #e6a23c;
    font-size: 20rpx;
    padding: 4rpx 14rpx;
    border-radius: 16rpx;
}
.event-tag.green {
    background: #07c160;
}
.event-name {
    font-size: 30rpx;
    font-weight: 600;
    margin-top: 60rpx;
    margin-bottom: 8rpx;
}
.event-date {
    font-size: 24rpx;
    opacity: 0.85;
}
.service-box {
    background: #fff;
    border-radius: 20rpx;
    padding: 36rpx 10rpx;
    display: flex;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}
.service-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.icon-wrap {
    width: 88rpx;
    height: 88rpx;
    background: #f0f4f8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-bottom: 14rpx;
}
.service-item text {
    font-size: 24rpx;
    color: #333;
}
.gallery {
    white-space: nowrap;
    width: 100%;
}
.gallery-item {
    display: inline-block;
    width: 260rpx;
    height: 160rpx;
    border-radius: 16rpx;
    margin-right: 20rpx;
}
.g1 {
    background: linear-gradient(135deg, #1a5276, #2980b9);
}
.g2 {
    background: linear-gradient(135deg, #1a3a5c, #2c3e50);
}
.g3 {
    background: linear-gradient(135deg, #0e6655, #148f77);
}
.safe-bottom {
    height: 30rpx;
}
.venue-bar {
  margin: 24rpx 30rpx 0;
  padding: 24rpx 28rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.venue-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 16rpx;
}
.venue-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a5c3a;
}
.venue-arrow {
  font-size: 26rpx;
  color: #07c160;
}
</style>
