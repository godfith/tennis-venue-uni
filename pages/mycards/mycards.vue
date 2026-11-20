<template>
  <view class="page">
    <view class="title">我的会员卡</view>

    <view class="empty" v-if="!loading && list.length === 0">
      <view class="empty-text">暂无会员卡</view>
      <view class="empty-tip">可在商城购买团课卡，或联系场馆前台办理</view>
    </view>

    <view class="list" v-else>
      <view
        class="card"
        :class="cardClass(item)"
        v-for="(item, index) in list"
        :key="item._id || index"
      >
        <view class="card-top">
          <view class="card-name">{{ item.cardName }}</view>
          <view class="card-type">{{ typeLabel(item.type) }}</view>
        </view>
        <view class="card-body">
          <view v-if="isTimesLike(item.type)" class="times">
            <view class="times-main">
              <text class="num">{{ item.remainingTimes }}</text>
              <text class="unit">次</text>
            </view>
            <view class="times-sub">剩余 / 共 {{ item.totalTimes }} 次</view>
          </view>
          <view v-else class="times">
            <view class="times-main">
              <text class="num">{{ remainDays(item) }}</text>
              <text class="unit">天</text>
            </view>
            <view class="times-sub">剩余有效天数</view>
          </view>
          <view class="valid" v-if="item.validFrom || item.validTo">
            有效期：{{ item.validFrom || '不限' }} ~ {{ item.validTo || '不限' }}
          </view>
        </view>
        <view class="card-status">{{ statusLabel(item.status) }}</view>
        <view class="refund-row" v-if="item.canRequestRefund">
          <view v-if="item.refundStatus === 'pending' || item.refundStatus === 'refunding'" class="refund-wait">已申请退款，待管理员确认</view>
          <view v-else-if="item.refundStatus === 'confirmed'" class="refund-wait">退款已确认</view>
          <button v-else class="refund-btn" :loading="refundingId === item._id" @tap="requestRefund(item)">申请退款</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      loading: false,
      refundingId: ''
    }
  },
  onShow() {
    this.loadCards()
  },
  methods: {
    typeLabel(t) {
      return { times: '次卡', coach: '教练卡', group: '团课卡', time: '时间卡', stored: '储值卡' }[t] || t
    },
    isTimesLike(t) {
      return t === 'times' || t === 'coach' || t === 'group'
    },
    statusLabel(s) {
      return { active: '可用', used_up: '已用完', expired: '已过期', refunded: '已退卡', disabled: '停用' }[s] || s
    },
    remainDays(item) {
      if (!item || !item.validTo) return 0
      var t = new Date(String(item.validTo).slice(0, 10).replace(/-/g, '/'))
      var now = new Date()
      now.setHours(0, 0, 0, 0)
      t.setHours(0, 0, 0, 0)
      var d = Math.round((t.getTime() - now.getTime()) / 86400000)
      return d > 0 ? d : 0
    },
    cardClass(item) {
      var st = ''
      if (item.status === 'refunded') st = ' refund'
      else if (item.status === 'expired' || item.status === 'used_up') st = ' muted'
      else if (item.status && item.status !== 'active') st = ' off'
      var tp = {
        coach: 'c-coach',
        times: 'c-times',
        group: 'c-group',
        time: 'c-time',
        stored: 'c-stored'
      }[item.type] || 'c-times'
      return tp + st
    },
    isVisibleCard(item) {
      var s = item && item.status ? item.status : 'active'
      return s !== 'disabled' && s !== 'refunded'
    },
    loadCards() {
      const userDocId = uni.getStorageSync('userDocId') || ''
      const openid = uni.getStorageSync('openid') || ''
      const phone = uni.getStorageSync('phone') || ''
      if (!userDocId && !openid && !phone) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      this.loading = true
      const that = this
      wx.cloud
        .callFunction({
          name: 'userApi',
          data: {
            action: 'getMyCards',
            userId: userDocId,
            openid,
            phone
          }
        })
        .then((res) => {
          const result = res.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
            return
          }
          that.list = (result.list || []).filter(function (c) { return that.isVisibleCard(c) })
        })
        .catch((e) => {
          console.error(e)
          uni.showToast({ title: '加载失败', icon: 'none' })
        })
        .finally(() => {
          this.loading = false
        })
    },
    requestRefund(item) {
      const that = this
      if (!item || !item._id) return
      uni.showModal({
        title: '申请退款',
        content: '提交后不会立刻退款。前台在群里报备后，由管理员在后台确认才会原路退回微信。已用次数不退。',
        confirmText: '提交申请',
        success: function (r) {
          if (!r.confirm) return
          that.refundingId = item._id
          wx.cloud.callFunction({
            name: 'userApi',
            data: {
              action: 'requestCardRefund',
              cardId: item._id,
              userId: uni.getStorageSync('userDocId') || '',
              openid: uni.getStorageSync('openid') || '',
              phone: uni.getStorageSync('phone') || ''
            }
          }).then(function (res) {
            var result = res.result || {}
            if (!result.ok) {
              uni.showToast({ title: result.msg || '提交失败', icon: 'none' })
              return
            }
            item.refundStatus = 'pending'
            uni.showToast({ title: result.msg || '已提交申请', icon: 'none' })
          }).catch(function () {
            uni.showToast({ title: '提交失败', icon: 'none' })
          }).finally(function () {
            that.refundingId = ''
          })
        }
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
.card.c-coach { background: linear-gradient(135deg, #1e4870, #3a6ea0); }
.card.c-times { background: linear-gradient(135deg, #2d6a4f, #52b788); }
.card.c-group { background: linear-gradient(135deg, #7b2d3b, #c45c6a); }
.card.c-time { background: linear-gradient(135deg, #8a5a12, #d4a017); }
.card.c-stored { background: linear-gradient(135deg, #1a5c3a, #3d8b63); }
.card.off { background: linear-gradient(135deg, #888, #aaa) !important; }
.card.refund { background: linear-gradient(135deg, #999, #bbb) !important; }
.card.muted { opacity: 0.82; }
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
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
  margin-bottom: 10rpx;
}
.times-main {
  display: flex;
  align-items: baseline;
  margin: 4rpx 0 6rpx;
}
.num {
  font-size: 80rpx;
  font-weight: 800;
  line-height: 1;
}
.unit {
  font-size: 28rpx;
  margin-left: 8rpx;
  opacity: 0.92;
}
.times-sub {
  font-size: 24rpx;
  opacity: 0.85;
  margin-bottom: 8rpx;
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
.refund-row { margin-top: 16rpx; }
.refund-btn { background: transparent; color: #c45c26; border: 1rpx solid #c45c26; font-size: 24rpx; line-height: 56rpx; height: 56rpx; border-radius: 8rpx; padding: 0 20rpx; }
.refund-wait { font-size: 24rpx; color: #888; }
</style>
