<template>
  <view>
    <view class="container">
      <view class="header">
        <view class="title">{{ venueName || '网球场馆预约' }}</view>
        <view class="sub-title" v-if="venueName">场地预约</view>
      </view>
      <scroll-view class="date-scroll" :scroll-x="true" :enable-flex="true">
        <view v-for="(item, index) in dateList" :key="index" :class="'date-item ' + (currentDate === item.date ? 'active' : '')" @tap="onSelectDate(item.date)">
          <view class="week">{{ item.week }}</view>
          <view class="day">{{ item.day }}</view>
        </view>
      </scroll-view>
      <view class="court-area">
        <view class="court-card" v-for="(item, index) in courtList" :key="index">
          <view class="court-header">
            <text class="court-name">{{ item.name }}</text>
            <text class="court-desc">{{ item.desc }}</text>
          </view>
          <view class="time-grid">
            <view
              v-for="(cell, index1) in item.times"
              :key="index1"
              :class="'time-cell ' + (cell.status === 'full' ? 'full' : '') + ' ' + (cell.status === 'group' ? 'group' : '') + ' ' + (currentCourtId === item.id && currentTime === cell.time ? 'selected' : '')"
              @tap="onSelectSlot(item.id, item.name, cell.time, cell.status)"
            >
              <view class="time-text">{{ cell.short }}</view>
              <view class="status-text">{{ statusText(cell.status) }}</view>
              <view class="price-text" v-if="cell.status === 'available' && cell.price > 0">¥{{ cell.price }}</view>
              <view class="price-text muted" v-else-if="cell.status === 'available'">--</view>
            </view>
          </view>
        </view>
      </view>
      <view class="bottom-bar" v-if="currentCourtId">
        <view class="selected-info">
          <view>{{ currentCourtName }}</view>
          <view class="selected-time">{{ currentTime }}</view>
          <view class="selected-price" v-if="currentPrice > 0">¥{{ currentPrice }}</view>
        </view>
        <button class="book-btn" :loading="booking" @tap="onBook">确认预约</button>
      </view>
    </view>
    <view class="mask" v-if="cardSheetVisible" @tap="cardSheetVisible = false">
      <view class="sheet" @tap.stop="">
        <view class="sheet-title">选择支付方式</view>
        <view class="sheet-sub">{{ currentCourtName }} · {{ currentDate }} {{ currentTime }}</view>
        <view class="sheet-price" v-if="currentPrice > 0">场地参考价 ¥{{ currentPrice }}</view>
        <view class="card-option" :class="selectedCardId === '' ? 'on' : ''" @tap="selectedCardId = ''">
          <view class="co-name">不使用卡（到店支付）</view>
          <view class="co-meta" v-if="currentPrice > 0">应付约 ¥{{ currentPrice }}</view>
        </view>
        <view v-for="c in usableCards" :key="c._id" class="card-option" :class="selectedCardId === c._id ? 'on' : ''" @tap="selectedCardId = c._id">
          <view class="co-name">{{ c.cardName }}</view>
          <view class="co-meta">{{ cardMeta(c) }}</view>
        </view>
        <view v-if="!cardLoading && usableCards.length === 0" class="sheet-empty">暂无可用会员卡，可选择到店支付</view>
        <button class="sheet-btn" :loading="booking" @tap="submitBook">确认预约</button>
        <view class="sheet-cancel" @tap="cardSheetVisible = false">取消</view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      courtConfig: [],
      dateList: [],
      venueName: '',
      courtList: [],
      currentDate: '',
      currentCourtId: '',
      currentCourtName: '',
      currentTime: '',
      booking: false,
      cardSheetVisible: false,
      cardLoading: false,
      myCards: [],
      selectedCardId: '',
      priceMap: {},
      allTimes: [
        { time: '08:00-09:00', short: '08:00', hour: 8 },
        { time: '09:00-10:00', short: '09:00', hour: 9 },
        { time: '10:00-11:00', short: '10:00', hour: 10 },
        { time: '11:00-12:00', short: '11:00', hour: 11 },
        { time: '14:00-15:00', short: '14:00', hour: 14 },
        { time: '15:00-16:00', short: '15:00', hour: 15 },
        { time: '16:00-17:00', short: '16:00', hour: 16 },
        { time: '17:00-18:00', short: '17:00', hour: 17 },
        { time: '18:00-19:00', short: '18:00', hour: 18 },
        { time: '19:00-20:00', short: '19:00', hour: 19 },
        { time: '20:00-21:00', short: '20:00', hour: 20 }
      ]
    }
  },
  computed: {
    currentPrice() {
      if (!this.currentCourtName || !this.currentTime) return 0
      return Number(this.priceMap[this.currentCourtName + '_' + this.currentTime] || 0)
    },
    usableCards() {
      var that = this
      return (this.myCards || []).filter(function (c) {
        return that.isCardUsable(c, that.currentDate, that.currentTime)
      })
    }
  },
  onLoad() {
    this.loadCourts()
    this.initDateList()
  },
  onShow() {
    this.venueName = uni.getStorageSync('venue_name') || ''
    this.loadCourts()
  },
  methods: {
    statusText(s) {
      if (s === 'full') return '已租'
      if (s === 'group') return '团课'
      return '可约'
    },
    cardMeta(c) {
      var typeMap = { times: '次卡', coach: '教练卡', time: '时间卡', group: '团课卡' }
      var t = typeMap[c.type] || c.type
      if (c.type === 'times' || c.type === 'coach') return t + ' · 剩' + (c.remainingTimes || 0) + '次'
      return t
    },
    isCardUsable(card, dateStr, timeStr) {
      if (!card || card.status !== 'active') return false
      if (card.type === 'group') return false
      if (card.validFrom && dateStr < card.validFrom) return false
      if (card.validTo && dateStr > card.validTo) return false
      if (card.type === 'times' || card.type === 'coach') return (card.remainingTimes || 0) > 0
      if (card.type === 'time') {
        var rule = card.timeRule
        if (!rule || rule.mode === 'unlimited' || rule.mode === 'all') return true
        var d = new Date(String(dateStr).replace(/-/g, '/'))
        var weekday = d.getDay()
        if (weekday === 0) weekday = 7
        var slotStart = (timeStr || '').split('-')[0]
        if (rule.mode === 'rules' && Array.isArray(rule.rules)) {
          for (var i = 0; i < rule.rules.length; i++) {
            var r = rule.rules[i]
            if (!(r.weekdays || []).includes(weekday)) continue
            if (r.unlimited) return true
            var slots = r.timeSlots || []
            for (var j = 0; j < slots.length; j++) {
              var s = slots[j]
              if (slotStart >= s.start && slotStart < s.end) return true
            }
          }
          return false
        }
      }
      return true
    },
    loadCourts() {
      var that = this
      that.venueName = uni.getStorageSync('venue_name') || ''
      var venueId = uni.getStorageSync('venue_id')
      if (!venueId) {
        uni.showToast({ title: '请先在首页选择场馆', icon: 'none' })
        that.courtConfig = []
        that.courtList = []
        return
      }
      wx.cloud
        .callFunction({ name: 'userApi', data: { action: 'getCourts', venueId: venueId } })
        .then(function (res) {
          var result = res.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '加载场地失败', icon: 'none' })
            return
          }
          that.courtConfig = (result.list || []).map(function (item) {
            return { id: item._id, name: item.name, desc: item.type || '' }
          })
          if (that.currentDate) that.loadCourtStatus(that.currentDate)
        })
        .catch(function () {
          uni.showToast({ title: '加载场地失败', icon: 'none' })
        })
    },
    initDateList() {
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
        list.push({
          date: y + '-' + mm + '-' + dd,
          week: i === 0 ? '今天' : '周' + weeks[d.getDay()],
          day: m + '/' + day
        })
      }
      this.dateList = list
      this.currentDate = list[0].date
      this.loadCourtStatus(list[0].date)
    },
    onSelectDate(date) {
      this.currentDate = date
      this.currentCourtId = ''
      this.currentCourtName = ''
      this.currentTime = ''
      this.loadCourtStatus(date)
    },
    getAvailableTimes(dateStr) {
      var now = new Date()
      var y = now.getFullYear()
      var m = now.getMonth() + 1
      var day = now.getDate()
      var mm = m < 10 ? '0' + m : '' + m
      var dd = day < 10 ? '0' + day : '' + day
      var todayStr = y + '-' + mm + '-' + dd
      if (dateStr !== todayStr) return this.allTimes
      var currentHour = now.getHours()
      var currentMinute = now.getMinutes()
      return this.allTimes.filter(function (item) {
        if (item.hour < currentHour) return false
        if (item.hour === currentHour && currentMinute > 0) return false
        return true
      })
    },
    loadCourtStatus(date) {
      var that = this
      var venueId = uni.getStorageSync('venue_id') || ''
      var courtConfig = that.courtConfig
      var availableTimes = that.getAvailableTimes(date)
      if (availableTimes.length === 0 || !venueId || !courtConfig.length) {
        that.courtList = []
        return
      }
      var d = new Date(String(date).replace(/-/g, '/'))
      var weekday = d.getDay()
      if (weekday === 0) weekday = 7

      // 先拉价格，再拉日程，保证格子有价
      wx.cloud
        .callFunction({
          name: 'userApi',
          data: { action: 'getCourtPrices', venueId: venueId, weekday: weekday }
        })
        .then(function (pr) {
          var result = pr.result || {}
          var r = result.list || []
          var map = {}
          r.forEach(function (row) {
            if (row.court && row.timeSlot) {
              map[row.court + '_' + row.timeSlot] = Number(row.price) || 0
            }
          })
          that.priceMap = map
          return wx.cloud.callFunction({
            name: 'userApi',
            data: { action: 'getSchedule', venueId: venueId, date: date }
          })
        })
        .then(function (res) {
          var result = res.result || {}
          var bookedMap = {}
          var groupMap = {}
          ;(result.bookings || []).forEach(function (item) {
            if (item.status === 'booked' && !item.groupClassId) {
              bookedMap[item.court + '_' + item.time] = true
            }
          })
          ;(result.groupClasses || []).forEach(function (g) {
            if (g.status === 'open') groupMap[g.court + '_' + g.time] = true
          })
          that.courtList = courtConfig.map(function (court) {
            return {
              id: court.id,
              name: court.name,
              desc: court.desc,
              times: availableTimes.map(function (t) {
                var key = court.name + '_' + t.time
                var status = 'available'
                if (groupMap[key]) status = 'group'
                else if (bookedMap[key]) status = 'full'
                return {
                  time: t.time,
                  short: t.short,
                  status: status,
                  price: Number(that.priceMap[key] || 0)
                }
              })
            }
          })
        })
        .catch(function (err) {
          console.error('loadCourtStatus', err)
        })
    },
    onSelectSlot(courtId, courtName, time, status) {
      if (status === 'full') {
        uni.showToast({ title: '该时段已被预约', icon: 'none' })
        return
      }
      if (status === 'group') {
        uni.showToast({ title: '该时段为团课，请从团课入口报名', icon: 'none' })
        return
      }
      this.currentCourtId = courtId
      this.currentCourtName = courtName
      this.currentTime = time
    },
    onBook() {
      var nickName = uni.getStorageSync('nickName') || ''
      var phone = uni.getStorageSync('phone') || ''
      if (!nickName || !phone) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        uni.navigateTo({ url: '/pages/login/login' })
        return
      }
      if (!this.currentDate || !this.currentCourtName || !this.currentTime) {
        uni.showToast({ title: '请选择场地和时间', icon: 'none' })
        return
      }
      this.selectedCardId = ''
      this.cardSheetVisible = true
      this.loadMyCards()
    },
    loadMyCards() {
      var that = this
      that.cardLoading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getMyCards', userId: uni.getStorageSync('userDocId') || '' },
        success: function (res) {
          that.myCards = (res.result || {}).list || []
        },
        fail: function () {
          that.myCards = []
        },
        complete: function () {
          that.cardLoading = false
        }
      })
    },
    submitBook() {
      var that = this
      var nickName = uni.getStorageSync('nickName') || ''
      var phone = uni.getStorageSync('phone') || ''
      var userDocId = uni.getStorageSync('userDocId') || ''
      var sel = null
      if (that.selectedCardId) {
        sel = (that.myCards || []).find(function (c) {
          return c._id === that.selectedCardId
        })
        if (!sel) {
          uni.showToast({ title: '请重新选择会员卡', icon: 'none' })
          return
        }
      }
      that.booking = true
      wx.cloud
        .callFunction({
          name: 'userApi',
          data: {
            action: 'createBooking',
            data: {
              court: that.currentCourtName,
              date: that.currentDate,
              time: that.currentTime,
              venueId: uni.getStorageSync('venue_id') || '',
              venueName: uni.getStorageSync('venue_name') || '',
              userName: nickName,
              phone: phone,
              userId: userDocId,
              cardId: sel ? sel._id : '',
              cardName: sel ? sel.cardName : '',
              cardType: sel ? sel.type : ''
            }
          }
        })
        .then(function (r) {
          var result = r.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '预约失败', icon: 'none' })
            return
          }
          uni.showToast({ title: '预约成功', icon: 'success' })
          that.cardSheetVisible = false
          that.loadCourtStatus(that.currentDate)
          that.currentCourtId = ''
          that.currentCourtName = ''
          that.currentTime = ''
        })
        .catch(function () {
          uni.showToast({ title: '预约失败', icon: 'none' })
        })
        .finally(function () {
          that.booking = false
        })
    }
  }
}
</script>
<style>
.sub-title { font-size: 26rpx; color: #888; margin-top: 8rpx; }
.container { padding-bottom: 160rpx; background: #f7f8fa; min-height: 100vh; }
.header { padding: 30rpx 30rpx 10rpx; background: #fff; }
.title { font-size: 40rpx; font-weight: bold; color: #222; }
.date-scroll { background: #fff; padding: 20rpx 20rpx 30rpx; white-space: nowrap; }
.date-item { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 110rpx; height: 110rpx; margin-right: 16rpx; border-radius: 16rpx; background: #f5f5f5; }
.date-item.active { background: #07c160; color: #fff; }
.week { font-size: 22rpx; margin-bottom: 6rpx; }
.day { font-size: 30rpx; font-weight: bold; }
.court-area { padding: 20rpx; }
.court-card { background: #fff; border-radius: 20rpx; padding: 28rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03); }
.court-header { margin-bottom: 24rpx; }
.court-name { font-size: 32rpx; font-weight: bold; color: #222; margin-right: 16rpx; }
.court-desc { font-size: 24rpx; color: #999; }
.time-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.time-cell { width: 140rpx; height: 110rpx; background: #f0f9f4; border-radius: 12rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2rpx solid transparent; }
.time-cell.full { background: #f0f0f0; color: #bbb; }
.time-cell.group { background: #fce4ec; color: #c2185b; }
.time-cell.selected { background: #07c160; color: #fff; border-color: #07c160; }
.time-text { font-size: 24rpx; font-weight: 500; }
.status-text { font-size: 20rpx; margin-top: 4rpx; }
.price-text { font-size: 20rpx; color: #1a5c3a; margin-top: 2rpx; font-weight: 600; }
.price-text.muted { color: #ccc; font-weight: 400; }
.time-cell.selected .price-text { color: #fff; }
.time-cell.full .status-text { color: #ff4d4f; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 20rpx 30rpx; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -6rpx 20rpx rgba(0,0,0,0.06); z-index: 100; }
.selected-info { font-size: 28rpx; color: #333; }
.selected-time { font-size: 24rpx; color: #07c160; margin-top: 4rpx; }
.selected-price { font-size: 26rpx; color: #e6a23c; font-weight: 600; margin-top: 4rpx; }
.book-btn { background: #07c160 !important; color: #fff; font-size: 30rpx; border-radius: 50rpx; padding: 0 50rpx; margin: 0; }
.mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 32rpx 30rpx 50rpx; box-sizing: border-box; max-height: 75vh; overflow-y: auto; }
.sheet-title { font-size: 32rpx; font-weight: 600; text-align: center; }
.sheet-sub { text-align: center; color: #888; font-size: 24rpx; margin: 12rpx 0 8rpx; }
.sheet-price { text-align: center; color: #e6a23c; font-size: 28rpx; font-weight: 600; margin-bottom: 16rpx; }
.card-option { border: 2rpx solid #eee; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; }
.card-option.on { border-color: #07c160; background: #f0f9f4; }
.co-name { font-size: 28rpx; color: #222; font-weight: 500; }
.co-meta { font-size: 24rpx; color: #07c160; margin-top: 8rpx; }
.sheet-empty { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
.sheet-btn { margin-top: 20rpx; background: #07c160 !important; color: #fff !important; border-radius: 40rpx; font-size: 30rpx; }
.sheet-cancel { text-align: center; color: #999; font-size: 28rpx; margin-top: 24rpx; padding: 12rpx; }
</style>
