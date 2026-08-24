<template>
  <view class="page">
    <view class="header">
      <view class="title">团课报名</view>
      <view class="sub">{{ venueName || '请先选择场馆' }}</view>
    </view>

    <scroll-view class="date-scroll" scroll-x>
      <view
        v-for="(item, index) in dateList"
        :key="index"
        :class="'date-item ' + (currentDate === item.date ? 'active' : '')"
        @tap="onSelectDate(item.date)"
      >
        <view class="week">{{ item.week }}</view>
        <view class="day">{{ item.day }}</view>
      </view>
    </scroll-view>

    <view class="loading" v-if="loading">加载中...</view>

    <view class="empty" v-else-if="list.length === 0">
      <view>当天暂无团课</view>
    </view>

    <view class="list" v-else>
      <view class="card" v-for="(item, index) in list" :key="index">
        <view class="card-top">
          <view class="name">{{ item.name }}</view>
          <view class="badge" :class="full(item) ? 'full' : 'open'">
            {{ full(item) ? '已满' : '可报名' }}
          </view>
        </view>
        <view class="row">时段 {{ item.time }}</view>
        <view class="row">场地 {{ item.court }}</view>
        <view class="row">教练 {{ item.coachName || '-' }}</view>
        <view class="row">名额 {{ item.enrolled || 0 }} / {{ item.capacity || 0 }}</view>
        <button
          class="btn"
          :disabled="full(item) || item.status !== 'open'"
          @tap="openEnroll(item)"
        >
          {{ full(item) ? '名额已满' : '报名' }}
        </button>
      </view>
    </view>

    <!-- 报名弹层 -->
    <view class="mask" v-if="show" @tap="show = false">
      <view class="sheet" @tap.stop="">
        <view class="sheet-title">确认报名</view>
        <view class="sheet-row">{{ current.name }} · {{ current.time }}</view>
        <view class="sheet-row">场地 {{ current.court }} · 教练 {{ current.coachName || '-' }}</view>

        <view class="label">选择团课卡</view>
        <view v-if="!cards.length" class="tip error">没有可用团课卡，请联系前台办理</view>
        <view
          v-for="(c, i) in cards"
          :key="i"
          :class="'card-opt ' + (selectedCardId === c._id ? 'on' : '')"
          @tap="selectedCardId = c._id"
        >
          {{ c.cardName }}（剩 {{ c.remainingTimes }} 次）
        </view>

        <button class="confirm" :loading="saving" :disabled="!selectedCardId" @tap="submit">
          确认报名并扣次
        </button>
        <button class="cancel" @tap="show = false">取消</button>
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
    full(item) {
      return (item.enrolled || 0) >= (item.capacity || 0)
    },
    initDates() {
      const weeks = ['日', '一', '二', '三', '四', '五', '六']
      const list = []
      const today = new Date()
      for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        const y = d.getFullYear()
        const m = d.getMonth() + 1
        const day = d.getDate()
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        list.push({
          date: dateStr,
          week: i === 0 ? '今天' : `周${weeks[d.getDay()]}`,
          day: `${m}/${day}`
        })
      }
      this.dateList = list
      if (!this.currentDate) this.currentDate = list[0].date
    },
    onSelectDate(date) {
      this.currentDate = date
      this.loadList()
    },
    loadList() {
      const venueId = uni.getStorageSync('venue_id')
      if (!venueId) {
        uni.showToast({ title: '请先选择场馆', icon: 'none' })
        this.list = []
        return
      }
      this.loading = true
      wx.cloud
        .callFunction({
          name: 'userApi',
          data: {
            action: 'getGroupClasses',
            venueId,
            date: this.currentDate
          }
        })
        .then((res) => {
          const result = res.result || {}
          this.list = (result.list || []).filter((g) => g.status === 'open')
        })
        .catch((e) => {
          console.error(e)
          uni.showToast({ title: '加载失败', icon: 'none' })
        })
        .finally(() => {
          this.loading = false
        })
    },
    openEnroll(item) {
      const nickName = uni.getStorageSync('nickName') || ''
      const phone = uni.getStorageSync('phone') || ''
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
      const userDocId = uni.getStorageSync('userDocId') || ''
      const openid = uni.getStorageSync('openid') || ''
      wx.cloud
        .callFunction({
          name: 'userApi',
          data: { action: 'getMyCards', userId: userDocId, openid }
        })
        .then((res) => {
          const result = res.result || {}
          this.cards = (result.list || []).filter(
            (c) => c.type === 'group' && c.status === 'active' && (c.remainingTimes || 0) > 0
          )
          if (this.cards.length === 1) this.selectedCardId = this.cards[0]._id
        })
        .catch(() => {
          this.cards = []
        })
    },
    submit() {
      if (!this.selectedCardId) {
        uni.showToast({ title: '请选择团课卡', icon: 'none' })
        return
      }
      this.saving = true
      wx.cloud
        .callFunction({
          name: 'userApi',
          data: {
            action: 'enrollGroupClass',
            groupClassId: this.current._id,
            userId: uni.getStorageSync('userDocId') || '',
            userName: uni.getStorageSync('nickName') || '',
            phone: uni.getStorageSync('phone') || '',
            cardId: this.selectedCardId
          }
        })
        .then((res) => {
          const result = res.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '报名失败', icon: 'none' })
            return
          }
          uni.showToast({ title: '报名成功', icon: 'success' })
          this.show = false
          this.loadList()
        })
        .catch((e) => {
          console.error(e)
          uni.showToast({ title: '报名失败', icon: 'none' })
        })
        .finally(() => {
          this.saving = false
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
.week { font-size: 22rpx; }
.day { font-size: 30rpx; font-weight: 700; margin-top: 6rpx; }
.loading, .empty {
  text-align: center;
  color: #999;
  padding: 80rpx 0;
  font-size: 28rpx;
}
.list { padding: 24rpx 30rpx; }
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.name { font-size: 32rpx; font-weight: 600; color: #222; }
.badge {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
}
.badge.open { background: #e8f8ef; color: #07c160; }
.badge.full { background: #f0f0f0; color: #999; }
.row { font-size: 26rpx; color: #666; margin-top: 8rpx; }
.btn {
  margin-top: 24rpx;
  background: #07c160 !important;
  color: #fff !important;
  border-radius: 12rpx;
  font-size: 28rpx;
}
.btn[disabled] {
  background: #ccc !important;
}
.mask {
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
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
.sheet-row {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}
.label {
  margin-top: 24rpx;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
}
.tip.error { color: #f56c6c; font-size: 26rpx; }
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
