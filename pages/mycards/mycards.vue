<template>
  <view class="page">
    <view class="title">我的会员卡</view>

    <view class="empty" v-if="!loading && list.length === 0">
      <view class="empty-text">暂无会员卡</view>
      <view class="empty-tip">请联系场馆前台办理</view>
    </view>

    <view class="list" v-else>
      <view
        class="card"
        :class="cardClass(item)"
        v-for="(item, index) in list"
        :key="index"
      >
        <view class="card-top">
          <view class="card-name">{{ item.cardName }}</view>
          <view class="card-type">{{ typeLabel(item.type) }}</view>
        </view>
        <view class="card-body">
          <view v-if="isTimesLike(item.type)" class="times">
            剩余 <text class="num">{{ item.remainingTimes }}</text> / {{ item.totalTimes }} 次
          </view>
          <view v-else class="times">时间卡</view>
          <view class="valid" v-if="item.validFrom || item.validTo">
            有效期：{{ item.validFrom || '不限' }} ~ {{ item.validTo || '不限' }}
          </view>
        </view>
        <view class="card-status">{{ statusLabel(item.status) }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      loading: false
    }
  },
  onShow() {
    this.loadCards()
  },
  methods: {
    typeLabel(t) {
      return { times: '次卡', coach: '教练卡', group: '团课卡', time: '时间卡' }[t] || t
    },
    isTimesLike(t) {
      return t === 'times' || t === 'coach' || t === 'group'
    },
    statusLabel(s) {
      return { active: '可用', used_up: '已用完', refunded: '已退卡', disabled: '停用' }[s] || s
    },
    cardClass(item) {
      if (item.status === 'active') return 'ok'
      if (item.status === 'refunded') return 'refund'
      return 'off'
    },
    loadCards() {
      const userDocId = uni.getStorageSync('userDocId') || ''
      const openid = uni.getStorageSync('openid') || ''
      if (!userDocId && !openid) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      this.loading = true
      wx.cloud
        .callFunction({
          name: 'userApi',
          data: {
            action: 'getMyCards',
            userId: userDocId,
            openid
          }
        })
        .then((res) => {
          const result = res.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
            return
          }
          this.list = result.list || []
        })
        .catch((e) => {
          console.error(e)
          uni.showToast({ title: '加载失败', icon: 'none' })
        })
        .finally(() => {
          this.loading = false
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
.title {
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 30rpx;
  color: #222;
}
.empty {
  margin-top: 160rpx;
  text-align: center;
}
.empty-text {
  font-size: 30rpx;
  color: #999;
}
.empty-tip {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #bbb;
}
.card {
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.card.ok {
  background: linear-gradient(135deg, #1a5c3a, #2d8a5e);
}
.card.off {
  background: linear-gradient(135deg, #888, #aaa);
}
.card.refund {
  background: linear-gradient(135deg, #999, #bbb);
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.card-name {
  font-size: 32rpx;
  font-weight: 600;
}
.card-type {
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}
.times {
  font-size: 28rpx;
  margin-bottom: 10rpx;
}
.num {
  font-size: 40rpx;
  font-weight: 700;
}
.valid {
  font-size: 24rpx;
  opacity: 0.85;
}
.card-status {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  font-size: 22rpx;
  opacity: 0.9;
}
</style>
