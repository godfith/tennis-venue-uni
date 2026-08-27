<template>
  <view class="page">
    <view class="title">我的预约</view>

    <view class="tabs">
      <view :class="tab === 'all' ? 'tab on' : 'tab'" @tap="tab = 'all'">全部</view>
      <view :class="tab === 'booked' ? 'tab on' : 'tab'" @tap="tab = 'booked'">已预约</view>
      <view :class="tab === 'cancelled' ? 'tab on' : 'tab'" @tap="tab = 'cancelled'">已取消</view>
    </view>

    <view class="empty" v-if="filtered.length === 0 && !loading">
      <view class="empty-text">暂无预约记录</view>
      <button class="go-btn" @tap="goBooking">去订场</button>
    </view>

    <view class="list" v-else>
      <view class="card" v-for="(item, index) in filtered" :key="index">
        <view class="card-top">
          <view class="court">{{ item.court || '场地' }}</view>
          <view :class="item.status === 'booked' ? 'tag ok' : 'tag off'">
            {{ item.status === 'booked' ? '已预约' : '已取消' }}
          </view>
        </view>
        <view class="venue" v-if="item.venueName">{{ item.venueName }}</view>
        <view class="when">{{ fmtDate(item.date) }}  {{ item.time }}</view>
        <view class="meta" v-if="item.coachName">教练 {{ item.coachName }}</view>
        <view class="meta" v-if="item.cardName">卡券 {{ item.cardName }}</view>
        <view class="card-bot" v-if="item.status === 'booked'">
          <button class="cancel-btn" @tap.stop="onCancel(item._id)">取消预约</button>
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
      tab: 'all',
      page: 1,
      pageSize: 10,
      total: 0,
      totalPage: 1,
      loading: false
    }
  },
  computed: {
    filtered() {
      if (this.tab === 'all') return this.list
      return (this.list || []).filter((i) => i.status === this.tab)
    }
  },
  onShow() {
    this.page = 1
    this.loadMyBookings()
  },
  methods: {
    fmtDate(v) {
      if (!v) return ''
      var s = String(v).slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
      var p = s.split('-')
      return p[0] + '年' + Number(p[1]) + '月' + Number(p[2]) + '日'
    },
    loadMyBookings() {
      var openid = uni.getStorageSync('openid') || ''
      var userDocId = uni.getStorageSync('userDocId') || ''
      if (!openid && !userDocId) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      this.loading = true
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getMyBookings',
          openid: openid,
          userId: userDocId,
          page: that.page,
          pageSize: that.pageSize
        }
      }).then(function (res) {
        var result = res.result || {}
        if (!result.ok) {
          uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
          return
        }
        that.list = result.list || []
        that.total = result.total || 0
        that.totalPage = Math.ceil(that.total / that.pageSize) || 1
      }).catch(function (err) {
        console.error('加载失败', err)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }).finally(function () {
        that.loading = false
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
      var startTimeStr = (booking.time || '').split('-')[0]
      var bookingTime = new Date((booking.date + ' ' + startTimeStr + ':00').replace(/-/g, '/'))
      var diffHours = (bookingTime.getTime() - Date.now()) / 3600000
      return diffHours >= 6
    },
    onCancel(id) {
      var booking = this.list.find(function (item) { return item._id === id })
      if (!booking) return
      if (!this.canCancel(booking)) {
        uni.showModal({
          title: '无法取消',
          content: '预约开始前6小时内不可取消，请提前安排。',
          showCancel: false
        })
        return
      }
      var that = this
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个预约吗？',
        success: function (res) {
          if (!res.confirm) return
          wx.cloud.callFunction({
            name: 'userApi',
            data: { action: 'cancelBooking', id: id }
          }).then(function (r) {
            var result = r.result || {}
            if (!result.ok) {
              uni.showToast({ title: result.msg || '取消失败', icon: 'none' })
              return
            }
            uni.showToast({ title: '已取消', icon: 'success' })
            that.loadMyBookings()
          }).catch(function (err) {
            console.error(err)
            uni.showToast({ title: '取消失败', icon: 'none' })
          })
        }
      })
    },
    goBooking() {
      uni.switchTab({ url: '/pages/booking/booking' })
    }
  }
}
</script>
<style>
.page {
  min-height: 100vh;
  background: #f4f2ee;
  padding: 28rpx 24rpx 80rpx;
  box-sizing: border-box;
}
.title { font-size: 40rpx; font-weight: 700; color: #1e4870; margin-bottom: 20rpx; }
.tabs {
  display: flex;
  background: #e8e4dc;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}
.tab { flex: 1; text-align: center; padding: 16rpx 0; font-size: 26rpx; color: #6b6760; }
.tab.on { background: #fff; color: #1e4870; font-weight: 700; }
.empty { margin-top: 160rpx; text-align: center; }
.empty-text { font-size: 28rpx; color: #999; margin-bottom: 36rpx; }
.go-btn {
  width: 280rpx;
  background: #1e4870 !important;
  color: #fff !important;
  border-radius: 12rpx;
  font-size: 28rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
}
.card-top { display: flex; justify-content: space-between; align-items: center; }
.court { font-size: 32rpx; font-weight: 700; color: #222; }
.tag { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 8rpx; }
.tag.ok { background: #e8f0f8; color: #1e4870; }
.tag.off { background: #f0f0f0; color: #999; }
.venue { font-size: 24rpx; color: #1e4870; margin-top: 10rpx; }
.when { font-size: 26rpx; color: #555; margin-top: 8rpx; }
.meta { font-size: 24rpx; color: #888; margin-top: 6rpx; }
.card-bot { margin-top: 18rpx; text-align: right; }
.cancel-btn {
  background: #fff !important;
  color: #c45656 !important;
  border: 1rpx solid #c45656 !important;
  font-size: 24rpx !important;
  padding: 0 24rpx !important;
  margin: 0;
  line-height: 52rpx !important;
  border-radius: 10rpx !important;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32rpx;
}
.page-btn {
  font-size: 24rpx !important;
  padding: 0 24rpx !important;
  margin: 0 16rpx;
  background: #fff !important;
  color: #333 !important;
  border-radius: 10rpx !important;
  line-height: 60rpx !important;
}
.page-btn[disabled] { color: #ccc !important; }
.page-info { font-size: 26rpx; color: #666; }
</style>
