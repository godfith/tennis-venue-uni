<template>
  <view class="page">
    <view class="header">
      <view class="title">团课报名</view>
      <view class="sub">{{ venueName || '请先选择场馆' }}</view>
    </view>

    <scroll-view class="date-scroll" scroll-x="true">
      <view
        v-for="(item, index) in dateList"
        :key="index"
        class="date-item"
        :class="{ active: currentDate === item.date }"
        @tap="onSelectDate(item.date)"
      >
        <view class="week">{{ item.week }}</view>
        <view class="day">{{ item.day }}</view>
      </view>
    </scroll-view>

    <view v-if="loading" class="tip">加载中...</view>
    <view v-else-if="list.length === 0" class="tip">当天暂无团课</view>

    <view v-else class="list">
      <view v-for="(item, index) in list" :key="index" class="card">
        <view class="card-top">
          <text class="name">{{ item.name }}</text>
          <text class="badge">{{ isFull(item) ? '已满' : '可报名' }}</text>
        </view>
        <view class="row">时段：{{ item.time }}</view>
        <view class="row">场地：{{ item.court }}</view>
        <view class="row">教练：{{ item.coachName || '-' }}</view>
        <view class="row">名额：{{ item.enrolled || 0 }}/{{ item.capacity || 0 }}</view>
        <button
          class="btn"
          :disabled="isFull(item)"
          @tap="openEnroll(item)"
        >{{ isFull(item) ? '名额已满' : '报名' }}</button>
      </view>
    </view>

    <view v-if="show" class="mask" @tap="closeSheet">
      <view class="sheet" @tap="stopBubble">
        <view class="sheet-title">确认报名</view>
        <view class="row">{{ current.name }} · {{ current.time }}</view>
        <view class="row">场地 {{ current.court }} · 教练 {{ current.coachName || '-' }}</view>

        <view class="label">选择团课卡</view>
        <view v-if="cards.length === 0" class="err">没有可用团课卡，请联系前台</view>
        <view
          v-for="(c, i) in cards"
          :key="i"
          class="card-opt"
          :class="{ on: selectedCardId === c._id }"
          @tap="selectCard(c._id)"
        >
          {{ c.cardName }}（剩{{ c.remainingTimes }}次）
        </view>

        <button class="confirm" :loading="saving" @tap="submit">确认报名并扣次</button>
        <button class="cancel" @tap="closeSheet">取消</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      venueName: '',
      dateList: [],
      currentDate: '',
      list: [],
      loading: false,
      show: false,
      current: {},
      cards: [],
      selectedCardId: '',
      saving: false
    }
  },
  onShow() {
    this.venueName = uni.getStorageSync('venue_name') || ''
    this.initDates()
    this.loadList()
  },
  methods: {
    isFull(item) {
      return Number(item.enrolled || 0) >= Number(item.capacity || 0)
    },
    stopBubble() {},
    closeSheet() {
      this.show = false
    },
    selectCard(id) {
      this.selectedCardId = id
    },
    initDates() {
      var weeks = ['日', '一', '二', '三', '四', '五', '六']
      var list = []
      var today = new Date()
      for (var i = 0; i < 7; i++) {
        var d = new Date(today.getTime())
        d.setDate(today.getDate() + i)
        var y = d.getFullYear()
        var m = d.getMonth() + 1
        var day = d.getDate()
        var mm = m < 10 ? '0' + m : '' + m
        var dd = day < 10 ? '0' + day : '' + day
        var dateStr = y + '-' + mm + '-' + dd
        list.push({
          date: dateStr,
          week: i === 0 ? '今天' : '周' + weeks[d.getDay()],
          day: m + '/' + day
        })
      }
      this.dateList = list
      if (!this.currentDate) {
        this.currentDate = list[0].date
      }
    },
    onSelectDate(date) {
      this.currentDate = date
      this.loadList()
    },
    loadList() {
      var that = this
      var venueId = uni.getStorageSync('venue_id') || ''
      if (!venueId) {
        uni.showToast({ title: '请先选择场馆', icon: 'none' })
        that.list = []
        return
      }
      that.loading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getGroupClasses',
          venueId: venueId,
          date: that.currentDate
        },
        success: function (res) {
          var result = res.result || {}
          var arr = result.list || []
          that.list = arr.filter(function (g) {
            return g.status === 'open'
          })
        },
        fail: function (err) {
          console.error(err)
          uni.showToast({ title: '加载失败', icon: 'none' })
          that.list = []
        },
        complete: function () {
          that.loading = false
        }
      })
    },
    openEnroll(item) {
      var nickName = uni.getStorageSync('nickName') || ''
      var phone = uni.getStorageSync('phone') || ''
      if (!nickName || !phone) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        uni.navigateTo({ url: '/pages/login/login' })
        return
      }
      this.current = item
      this.selectedCardId = ''
      this.show = true
      this.loadGroupCards()
    },
    loadGroupCards() {
      var that = this
      var userDocId = uni.getStorageSync('userDocId') || ''
      var openid = uni.getStorageSync('openid') || ''
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getMyCards',
          userId: userDocId,
          openid: openid
        },
        success: function (res) {
          var result = res.result || {}
          var arr = result.list || []
          that.cards = arr.filter(function (c) {
            return c.type === 'group' && c.status === 'active' && Number(c.remainingTimes || 0) > 0
          })
          if (that.cards.length === 1) {
            that.selectedCardId = that.cards[0]._id
          }
        },
        fail: function () {
          that.cards = []
        }
      })
    },
    submit() {
      var that = this
      if (!that.selectedCardId) {
        uni.showToast({ title: '请选择团课卡', icon: 'none' })
        return
      }
      that.saving = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'enrollGroupClass',
          groupClassId: that.current._id,
          userId: uni.getStorageSync('userDocId') || '',
          userName: uni.getStorageSync('nickName') || '',
          phone: uni.getStorageSync('phone') || '',
          cardId: that.selectedCardId
        },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '报名失败', icon: 'none' })
            return
          }
          uni.showToast({ title: '报名成功', icon: 'success' })
          that.show = false
          that.loadList()
        },
        fail: function (err) {
          console.error(err)
          uni.showToast({ title: '报名失败', icon: 'none' })
        },
        complete: function () {
          that.saving = false
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
  padding-bottom: 40rpx;
}
.header {
  background: #fff;
  padding: 30rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #222;
}
.sub {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #888;
}
.date-scroll {
  background: #fff;
  padding: 10rpx 20rpx 30rpx;
  white-space: nowrap;
  width: 100%;
}
.date-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110rpx;
  height: 110rpx;
  margin-right: 16rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
}
.date-item.active {
  background: #07c160;
  color: #fff;
}
.week {
  font-size: 22rpx;
}
.day {
  font-size: 30rpx;
  font-weight: 700;
  margin-top: 6rpx;
}
.tip {
  text-align: center;
  color: #999;
  padding: 80rpx 0;
  font-size: 28rpx;
}
.list {
  padding: 24rpx 30rpx;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.name {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}
.badge {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: #e8f8ef;
  color: #07c160;
}
.row {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
}
.btn {
  margin-top: 24rpx;
  background: #07c160 !important;
  color: #fff !important;
  border-radius: 12rpx;
  font-size: 28rpx;
}
.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}
.sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 36rpx 30rpx 50rpx;
  box-sizing: border-box;
}
.sheet-title {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}
.label {
  margin-top: 24rpx;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
}
.err {
  color: #f56c6c;
  font-size: 26rpx;
}
.card-opt {
  padding: 22rpx 24rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  font-size: 28rpx;
}
.card-opt.on {
  border-color: #07c160;
  background: #f0f9f4;
  color: #1a5c3a;
}
.confirm {
  margin-top: 24rpx;
  background: #07c160 !important;
  color: #fff !important;
  border-radius: 12rpx;
}
.cancel {
  margin-top: 16rpx;
  background: #f5f5f5 !important;
  color: #666 !important;
  border-radius: 12rpx;
}
</style>
