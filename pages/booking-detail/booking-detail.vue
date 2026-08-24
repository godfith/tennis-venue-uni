<template>
  <view class="page">
    <view class="card" v-if="booking">
      <view class="row">
        <text class="label">订单号</text>
        <text class="value">{{ booking.orderNo || booking._id }}</text>
      </view>
      <view class="row">
        <text class="label">场地</text>
        <text class="value">{{ booking.court }}</text>
      </view>
      <view class="row">
        <text class="label">日期</text>
        <text class="value">{{ booking.date }}</text>
      </view>
      <view class="row">
        <text class="label">时间</text>
        <text class="value">{{ booking.time }}</text>
      </view>
      <view class="row">
        <text class="label">状态</text>
        <text :class="'status ' + (booking.status === 'booked' ? 'booked' : 'cancelled')">
          {{ statusText }}
        </text>
      </view>
      <view class="row" v-if="booking.coachName">
        <text class="label">教练</text>
        <text class="value">{{ booking.coachName }}</text>
      </view>
      <view class="row" v-if="booking.venueName">
        <text class="label">场馆</text>
        <text class="value">{{ booking.venueName }}</text>
      </view>
      <view class="row" v-if="booking.createdAt">
        <text class="label">下单时间</text>
        <text class="value">{{ formatTime(booking.createdAt) }}</text>
      </view>
    </view>

    <view class="loading" v-else>加载中...</view>

    <button
      v-if="booking && booking.status === 'booked' && canCancel"
      class="cancel-btn"
      :loading="cancelling"
      @tap="onCancel"
    >
      取消预约
    </button>

    <view class="tip" v-if="booking && booking.status === 'booked' && !canCancel">
      {{ tipText }}
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      booking: null,
      canCancel: false,
      tipText: '',
      cancelling: false
    }
  },
  computed: {
    statusText() {
      if (!this.booking) return ''
      if (this.booking.status === 'cancelled') return '已取消'
      if (!this.canCancel && this.isPast) return '已结束'
      return '已预约'
    },
    isPast() {
      if (!this.booking || !this.booking.time) return false
      var start = this.booking.time.split('-')[0]
      var t = new Date((this.booking.date + ' ' + start + ':00').replace(/-/g, '/'))
      return t.getTime() <= Date.now()
    }
  },
  onLoad(options) {
    this.id = options.id || ''
    this.loadDetail()
  },
  methods: {
    loadDetail() {
      var that = this
      if (!that.id) {
        uni.showToast({ title: '缺少订单', icon: 'none' })
        return
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getBookingDetail', id: that.id },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok || !result.booking) {
            uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
            return
          }
          that.booking = result.booking
          that.checkCanCancel(result.booking)
        },
        fail: function (err) {
          console.error(err)
          uni.showToast({ title: '加载失败', icon: 'none' })
        }
      })
    },
    checkCanCancel(booking) {
      if (booking.status !== 'booked') {
        this.canCancel = false
        this.tipText = '该预约已取消'
        return
      }
      var startTimeStr = (booking.time || '').split('-')[0]
      var bookingTime = new Date((booking.date + ' ' + startTimeStr + ':00').replace(/-/g, '/'))
      var diffHours = (bookingTime.getTime() - Date.now()) / 3600000
      if (diffHours <= 0) {
        this.canCancel = false
        this.tipText = '场次已开始或已结束，无法取消'
      } else if (diffHours < 6) {
        this.canCancel = false
        this.tipText = '开始前6小时内不可取消'
      } else {
        this.canCancel = true
        this.tipText = ''
      }
    },
    formatTime(t) {
      if (!t) return ''
      var d = t instanceof Date ? t : new Date(t)
      if (isNaN(d.getTime())) return String(t).slice(0, 16)
      var y = d.getFullYear()
      var m = String(d.getMonth() + 1).padStart(2, '0')
      var day = String(d.getDate()).padStart(2, '0')
      var h = String(d.getHours()).padStart(2, '0')
      var min = String(d.getMinutes()).padStart(2, '0')
      return y + '-' + m + '-' + day + ' ' + h + ':' + min
    },
    onCancel() {
      var that = this
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个预约吗？',
        success: function (res) {
          if (!res.confirm) return
          that.cancelling = true
          wx.cloud.callFunction({
            name: 'userApi',
            data: { action: 'cancelBooking', id: that.id },
            success: function (r) {
              var result = r.result || {}
              if (!result.ok) {
                uni.showToast({ title: result.msg || '取消失败', icon: 'none' })
                return
              }
              uni.showToast({ title: '已取消', icon: 'success' })
              that.loadDetail()
            },
            fail: function (err) {
              console.error(err)
              uni.showToast({ title: '取消失败', icon: 'none' })
            },
            complete: function () {
              that.cancelling = false
            }
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
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 10rpx 30rpx;
  margin-bottom: 40rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 28rpx;
}
.row:last-child {
  border-bottom: none;
}
.label {
  color: #999;
}
.value {
  color: #222;
  max-width: 60%;
  text-align: right;
}
.status.booked {
  color: #07c160;
}
.status.cancelled {
  color: #999;
}
.cancel-btn {
  background: #fff !important;
  color: #ff4d4f !important;
  border: 1rpx solid #ff4d4f !important;
  border-radius: 40rpx;
  font-size: 30rpx;
}
.tip {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  margin-top: 20rpx;
}
.loading {
  text-align: center;
  color: #999;
  margin-top: 100rpx;
}
</style>
