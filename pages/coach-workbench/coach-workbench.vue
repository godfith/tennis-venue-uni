<template>
  <view class="page">
    <view class="profile-card" v-if="coachInfo">
      <view class="profile-header">
        <image class="avatar" :src="coachInfo.avatar || '/static/images/avatar.png'" mode="aspectFill"></image>
        <view class="info">
          <view class="name">{{ coachInfo.name }}</view>
          <view class="title">{{ coachInfo.title || '教练' }}</view>
        </view>
        <view class="edit-btn" @tap="goEditProfile">编辑资料</view>
      </view>
      <view class="desc">{{ coachInfo.desc || coachInfo.remark || '暂无介绍' }}</view>
    </view>

    <view class="bind-card" v-if="!coachInfo && !loading">
      <view class="bind-title">未找到教练资料</view>
      <view class="bind-desc">请联系管理员在后台添加教练账号，并保证手机号与登录手机号一致</view>
    </view>

    <view class="section-title" v-if="coachInfo">我的课程安排</view>

    <view class="empty" v-if="coachInfo && !loading && list.length === 0">
      <view class="empty-text">暂无预约课程</view>
    </view>

    <view class="list" v-if="coachInfo">
      <view class="item" v-for="(item, index) in list" :key="index">
        <view class="item-left">
          <view class="date">{{ item.date }}</view>
          <view class="time">{{ item.time }}</view>
          <view class="court">场地：{{ item.court }}</view>
          <view class="user" v-if="item.userName">学员：{{ item.userName }}</view>
        </view>
        <view class="status booked">已预约</view>
      </view>
    </view>

    <view class="loading" v-if="loading">加载中...</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      coachInfo: null,
      loading: true
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    loadData() {
      var that = this
      var openid = uni.getStorageSync('openid') || ''
      var phone = uni.getStorageSync('phone') || ''
      var userDocId = uni.getStorageSync('userDocId') || ''
      if (!openid && !phone) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        that.loading = false
        return
      }
      that.loading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getCoachWorkbench',
          openid: openid,
          phone: phone,
          userId: userDocId
        },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
            that.coachInfo = null
            that.list = []
            return
          }
          that.coachInfo = result.coach || null
          that.list = result.list || []
        },
        fail: function (err) {
          console.error(err)
          uni.showToast({ title: '加载失败', icon: 'none' })
          that.coachInfo = null
          that.list = []
        },
        complete: function () {
          that.loading = false
        }
      })
    },
    goEditProfile() {
      if (!this.coachInfo || !this.coachInfo._id) return
      uni.navigateTo({
        url: '/pages/coach-edit/coach-edit?id=' + this.coachInfo._id
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 30rpx;
  box-sizing: border-box;
}
.profile-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}
.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #f0f0f0;
}
.info {
  flex: 1;
}
.name {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}
.title {
  font-size: 24rpx;
  color: #07c160;
  margin-top: 6rpx;
}
.edit-btn {
  font-size: 26rpx;
  color: #07c160;
  padding: 8rpx 20rpx;
  border: 1rpx solid #07c160;
  border-radius: 30rpx;
}
.desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
.bind-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  margin-bottom: 30rpx;
}
.bind-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}
.bind-desc {
  font-size: 26rpx;
  color: #999;
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  color: #222;
}
.item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.date {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 6rpx;
}
.time {
  font-size: 26rpx;
  color: #07c160;
  margin-bottom: 6rpx;
}
.court,
.user {
  font-size: 24rpx;
  color: #888;
  margin-top: 4rpx;
}
.status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}
.status.booked {
  background: #e8f8ef;
  color: #07c160;
}
.empty {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
}
.loading {
  text-align: center;
  color: #999;
  margin-top: 100rpx;
}
</style>
