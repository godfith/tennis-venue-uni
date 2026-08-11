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
      <view class="row" v-if="booking.createTime">
        <text class="label">下单时间</text>
        <text class="value">{{ formatTime(booking.createTime) }}</text>
      </view>
    </view>

    <view class="loading" v-else>加载中...</view>

    <!-- 只有可取消时才显示按钮 -->
    <button
      v-if="booking && booking.status === 'booked' && canCancel"
      class="cancel-btn"
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
      tipText: ''
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
      if (!this.booking) return false
      const start = this.booking.time.split('-')[0]
      const t = new Date(`${this.booking.date} ${start}:00`.replace(/-/g, '/'))
      return t.getTime() <= Date.now()
    }
  },
  onLoad(options) {
    this.id = options.id
    this.loadDetail()
  },
  methods: {
    loadDetail() {
      const db = wx.cloud.database()
      db.collection('bookings')
        .doc(this.id)
        .get()
        .then((res) => {
          this.booking = res.data
          this.checkCanCancel(res.data)
        })
        .catch((err) => {
          console.error(err)
          uni.showToast({ title: '加载失败', icon: 'none' })
        })
    },

    checkCanCancel(booking) {
      if (booking.status !== 'booked') {
        this.canCancel = false
        this.tipText = '该预约已取消'
        return
      }
      const startTimeStr = booking.time.split('-')[0]
      const bookingTime = new Date(`${booking.date} ${startTimeStr}:00`.replace(/-/g, '/'))
      const diffHours = (bookingTime.getTime() - Date.now()) / 3600000

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
      // 云开发返回的可能是对象 { seconds, ... } 或 Date
      const d = t instanceof Date ? t : (t.seconds ? new Date(t.seconds * 1000) : new Date(t))
      if (isNaN(d.getTime())) return ''
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${day} ${h}:${min}`
    },

    onCancel() {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个预约吗？',
        success: (res) => {
          if (!res.confirm) return
          const db = wx.cloud.database()
          db.collection('bookings')
            .doc(this.id)
            .update({
              data: { status: 'cancelled' }
            })
            .then(() => {
              // 如果是教练课，同步取消 coach_bookings
              if (this.booking.coachId) {
                return db
                  .collection('coach_bookings')
                  .where({ bookingId: this.id })
                  .update({ data: { status: 'cancelled' } })
              }
            })
            .then(() => {
              uni.showToast({ title: '已取消', icon: 'success' })
              this.loadDetail()
            })
            .catch((err) => {
              console.error(err)
              uni.showToast({ title: '取消失败', icon: 'none' })
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