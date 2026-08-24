<template>
    <view class="container">
        <view class="title">我的预约</view>

        <view class="empty" v-if="list.length === 0 && !loading">
            <view class="empty-text">暂无预约记录</view>
            <button class="go-btn" @tap="goBooking">去预约</button>
        </view>

        <view class="list" v-else>
          <view class="item" v-for="(item, index) in list" :key="index">
            <view class="item-left">
              <view class="court">{{ item.court }}</view>
              <view class="venue" v-if="item.venueName">{{ item.venueName }}</view>
              <view class="date-time">{{ item.date }}　{{ item.time }}</view>
              <view :class="'status ' + (item.status === 'booked' ? 'booked' : 'cancelled')">
                {{ item.status === 'booked' ? '已预约' : '已取消' }}
              </view>
            </view>
            <view class="item-right" v-if="item.status === 'booked'">
              <button class="cancel-btn" @tap.stop="onCancel(item._id)">取消</button>
            </view>
          </view>
        </view>

        <view class="pagination" v-if="total > 0">
            <button class="page-btn" :disabled="page === 1" @tap="prevPage">上一页</button>
            <view class="page-info">{{ page }} / {{ totalPage }}</view>
            <button class="page-btn" :disabled="page >= totalPage" @tap="nextPage">下一页</button>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            list: [],
            page: 1,
            pageSize: 10,
            total: 0,
            totalPage: 1,
            loading: false,
            openid: ''
        };
    },
    onShow() {
      this.page = 1
      this.loadMyBookings()
    },
    methods: {
        loadMyBookings() {
          const openid = uni.getStorageSync('openid') || ''
          const userDocId = uni.getStorageSync('userDocId') || ''
          if (!openid && !userDocId) {
            uni.showToast({ title: '请先登录', icon: 'none' })
            return
          }
          this.openid = openid
          this.loading = true

          wx.cloud
            .callFunction({
              name: 'userApi',
              data: {
                action: 'getMyBookings',
                openid,
                userId: userDocId,
                page: this.page,
                pageSize: this.pageSize
              }
            })
            .then((res) => {
              const result = res.result || {}
              if (!result.ok) {
                uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
                return
              }
              this.list = result.list || []
              this.total = result.total || 0
              this.totalPage = Math.ceil(this.total / this.pageSize) || 1
            })
            .catch((err) => {
              console.error('加载失败', err)
              uni.showToast({ title: '加载失败', icon: 'none' })
            })
            .finally(() => {
              this.loading = false
            })
        },

       prevPage() {
         if (this.page <= 1) return
         this.page = this.page - 1
         this.loadMyBookings()
       },

       nextPage() {
         if (this.page >= this.totalPage) return
         this.page = this.page + 1
         this.loadMyBookings()
       },

        canCancel(booking) {
          const startTimeStr = booking.time.split('-')[0]
          const bookingDateTimeStr = `${booking.date} ${startTimeStr}:00`
          const bookingTime = new Date(bookingDateTimeStr.replace(/-/g, '/'))
          const now = new Date()
          const diffHours = (bookingTime.getTime() - now.getTime()) / 3600000
          if (diffHours <= 0) return false
          if (diffHours < 6) return false
          return true
        },

        onCancel(id) {
          const booking = this.list.find((item) => item._id === id)
          if (!booking) return

          if (!this.canCancel(booking)) {
            uni.showModal({
              title: '无法取消',
              content: '预约开始前6小时内不可取消，请提前安排。',
              showCancel: false
            })
            return
          }

          uni.showModal({
            title: '确认取消',
            content: '确定要取消这个预约吗？',
            success: (res) => {
              if (!res.confirm) return
              wx.cloud
                .callFunction({
                  name: 'userApi',
                  data: { action: 'cancelBooking', id }
                })
                .then((r) => {
                  const result = r.result || {}
                  if (!result.ok) {
                    uni.showToast({ title: result.msg || '取消失败', icon: 'none' })
                    return
                  }
                  uni.showToast({ title: '已取消', icon: 'success' })
                  this.loadMyBookings()
                })
                .catch((err) => {
                  console.error(err)
                  uni.showToast({ title: '取消失败', icon: 'none' })
                })
            }
          })
        },

        goBooking() {
            uni.switchTab({
                url: '/pages/booking/booking'
            });
        }
    }
};
</script>
<style>
.venue {
  font-size: 24rpx;
  color: #1a5c3a;
  margin-bottom: 8rpx;
}
.container {
    padding: 30rpx;
    background: #f5f6f8;
    min-height: 100vh;
    box-sizing: border-box;
    padding-bottom: 120rpx;
}
.title {
    font-size: 40rpx;
    font-weight: bold;
    color: #222;
    margin-bottom: 30rpx;
}
.empty {
    margin-top: 180rpx;
    text-align: center;
}
.empty-text {
    font-size: 30rpx;
    color: #999;
    margin-bottom: 40rpx;
}
.go-btn {
    width: 280rpx;
    background: #07c160 !important;
    color: #fff;
    border-radius: 50rpx;
    font-size: 30rpx;
}
.item {
    background: #fff;
    border-radius: 16rpx;
    padding: 28rpx 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
}
.court {
    font-size: 32rpx;
    font-weight: bold;
    color: #222;
    margin-bottom: 10rpx;
}
.date-time {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 12rpx;
}
.status {
    font-size: 22rpx;
    display: inline-block;
    padding: 4rpx 14rpx;
    border-radius: 8rpx;
}
.status.booked {
    background: #e8f8ef;
    color: #07c160;
}
.status.cancelled {
    background: #f0f0f0;
    color: #999;
}
.cancel-btn {
    background: #fff !important;
    color: #ff4d4f !important;
    border: 1rpx solid #ff4d4f !important;
    font-size: 26rpx !important;
    padding: 0 24rpx !important;
    margin: 0;
    line-height: 56rpx !important;
}
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40rpx;
    gap: 30rpx;
}
.page-btn {
    font-size: 26rpx !important;
    padding: 0 30rpx !important;
    margin: 0;
    background: #fff !important;
    color: #333 !important;
    border-radius: 12rpx !important;
    line-height: 64rpx !important;
}
.page-btn[disabled] {
    color: #ccc !important;
    background: #f5f5f5 !important;
}
.page-info {
    font-size: 28rpx;
    color: #666;
}
</style>
