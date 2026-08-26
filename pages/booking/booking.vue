<template>
  <view>
    <view class="page">
      <view class="top">
        <view class="top-l">
          <view class="hello">Hi, {{ nickName || '球友' }}</view>
          <view class="venue">{{ venueName || '请先选择场馆' }}</view>
        </view>
        <view class="sw" @tap="switchVenue">切换场馆</view>
      </view>

      <view class="tabs">
        <view class="tab on">订场</view>
        <view class="tab" @tap="goCoach">私教</view>
      </view>

      <scroll-view class="dates" scroll-x enable-flex>
        <view
          v-for="(item, index) in dateList"
          :key="index"
          :class="'date ' + (currentDate === item.date ? 'on' : '')"
          @tap="onSelectDate(item.date)"
        >
          <view class="d-md">{{ item.md }}</view>
          <view class="d-wk">{{ item.week }}</view>
        </view>
      </scroll-view>

      <view class="board" v-if="courtList.length">
        <view class="left">
          <view class="left-lab">场地</view>
          <view
            v-for="item in courtList"
            :key="item.id"
            :class="'l-item ' + (currentCourtName === item.name ? 'on' : '')"
            @tap="pickCourt(item)"
          >{{ item.name }}</view>
        </view>
        <view class="right">
          <view
            v-for="(cell, i) in activeTimes"
            :key="i"
            :class="'slot ' + cls(cell)"
            @tap="onSelectSlot(activeCourt.id, activeCourt.name, cell.time, cell.status)"
          >
            <text>{{ cell.time }}</text>
            <text v-if="cell.status === 'full'" class="st">已订</text>
            <text v-else-if="cell.status === 'group'" class="st pink">团课</text>
            <text v-else-if="cell.price > 0" class="price">¥{{ cell.price }}</text>
          </view>
          <view v-if="!activeTimes.length" class="empty">暂无时段</view>
        </view>
      </view>
      <view class="empty" v-else>请先在首页选择场馆</view>
    </view>

    <view class="bar">
      <view>
        <view class="sum">¥{{ currentPrice || 0 }}</view>
        <view class="picked">{{ currentCourtName || '未选场地' }} {{ currentTime }}</view>
      </view>
      <button class="ok" :disabled="!currentCourtName || !currentTime || booking" :loading="booking" @tap="onBook">确认订场</button>
    </view>

    <view class="mask" v-if="cardSheetVisible" @tap="cardSheetVisible = false">
      <view class="sheet" @tap.stop="">
        <view class="sheet-title">选择支付方式</view>
        <view class="sheet-sub">{{ currentCourtName }} · {{ currentDate }} {{ currentTime }}</view>
        <view class="sheet-price" v-if="currentPrice > 0">场地参考价 ¥{{ currentPrice }}</view>
        <view class="card-option" :class="selectedCardId === '' ? 'on' : ''" @tap="selectedCardId = ''">
          <view class="co-name">到店支付</view>
          <view class="co-meta" v-if="currentPrice > 0">应付约 ¥{{ currentPrice }}</view>
        </view>
        <view v-for="c in usableCards" :key="c._id" class="card-option" :class="selectedCardId === c._id ? 'on' : ''" @tap="selectedCardId = c._id">
          <view class="co-name">{{ c.cardName }}</view>
          <view class="co-meta">{{ cardMeta(c) }}</view>
        </view>
        <view v-if="!cardLoading && usableCards.length === 0" class="sheet-empty">暂无可用会员卡</view>
        <button class="sheet-btn" :loading="booking" @tap="submitBook">确认预约</button>
        <view class="sheet-cancel" @tap="cardSheetVisible = false">取消</view>
      </view>
    </view>
    <app-tabbar :current="2" />
  </view>
</template>
<script>
import AppTabbar from '@/components/app-tabbar.vue'
export default {
  components: { AppTabbar },
  data() {
    return {
      nickName: '',
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
    },
    activeCourt() {
      var name = this.currentCourtName
      var list = this.courtList || []
      for (var i = 0; i < list.length; i++) {
        if (list[i].name === name) return list[i]
      }
      return list[0] || { id: '', name: '', times: [] }
    },
    activeTimes() {
      return (this.activeCourt && this.activeCourt.times) || []
    }
  },
  onLoad() {
    this.nickName = uni.getStorageSync('nickName') || ''
    this.loadCourts()
    this.initDateList()
  },
  onShow() {
    try { uni.hideTabBar({ animation: false }) } catch (e) {}
    this.nickName = uni.getStorageSync('nickName') || ''
    this.venueName = uni.getStorageSync('venue_name') || ''
    this.loadCourts()
  },
  methods: {
    cls(cell) {
      var s = cell.status === 'available' ? '' : 'off'
      if (this.currentTime === cell.time) s += ' sel'
      return s
    },
    goCoach() { uni.navigateTo({ url: '/pages/coach/coach' }) },
    switchVenue() { uni.switchTab({ url: '/pages/index/index' }) },
    pickCourt(item) {
      this.currentCourtId = item.id
      this.currentCourtName = item.name
      this.currentTime = ''
    },
    cardMeta(c) {
      var typeMap = { times: '次卡', coach: '教练卡', time: '时间卡', group: '团课卡' }
      var t = typeMap[c.type] || c.type
      if (c.type === 'times' || c.type === 'coach') return t + ' · 剩' + (c.remainingTimes || 0) + '次'
      return t
    },
    isCardUsable(card, dateStr, timeStr) {
      if (!card || card.status !== 'active') return false
      if (card.type === 'group' || card.type === 'coach') return false
      if (card.validFrom && dateStr < card.validFrom) return false
      if (card.validTo && dateStr > card.validTo) return false
      if (card.type === 'times') return (card.remainingTimes || 0) > 0
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
        that.courtConfig = []
        that.courtList = []
        return
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCourts', venueId: venueId },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) return
          that.courtConfig = (result.list || []).map(function (item) {
            return { id: item._id, name: item.name, desc: item.type || '' }
          })
          if (that.courtConfig.length && !that.currentCourtName) {
            that.currentCourtId = that.courtConfig[0].id
            that.currentCourtName = that.courtConfig[0].name
          }
          if (that.currentDate) that.loadCourtStatus(that.currentDate)
        }
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
          week: i === 0 ? '今天' : weeks[d.getDay()],
          md: mm + '-' + dd
        })
      }
      this.dateList = list
      this.currentDate = list[0].date
      this.loadCourtStatus(list[0].date)
    },
    onSelectDate(date) {
      this.currentDate = date
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
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCourtPrices', venueId: venueId, weekday: weekday }
      }).then(function (pr) {
        var r = ((pr.result || {}).list) || []
        var map = {}
        r.forEach(function (row) {
          if (row.court && row.timeSlot) map[row.court + '_' + row.timeSlot] = Number(row.price) || 0
        })
        that.priceMap = map
        return wx.cloud.callFunction({
          name: 'userApi',
          data: { action: 'getSchedule', venueId: venueId, date: date }
        })
      }).then(function (res) {
        var result = res.result || {}
        var bookedMap = {}
        var groupMap = {}
        ;(result.bookings || []).forEach(function (item) {
          if (item.status === 'booked' && !item.groupClassId) bookedMap[item.court + '_' + item.time] = true
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
              return { time: t.time, short: t.short, status: status, price: Number(that.priceMap[key] || 0) }
            })
          }
        })
        if (that.courtList.length && !that.currentCourtName) {
          that.currentCourtId = that.courtList[0].id
          that.currentCourtName = that.courtList[0].name
        }
      }).catch(function (err) {
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
        success: function (res) { that.myCards = (res.result || {}).list || [] },
        fail: function () { that.myCards = [] },
        complete: function () { that.cardLoading = false }
      })
    },
    submitBook() {
      var that = this
      var nickName = uni.getStorageSync('nickName') || ''
      var phone = uni.getStorageSync('phone') || ''
      var userDocId = uni.getStorageSync('userDocId') || ''
      var sel = null
      if (that.selectedCardId) {
        sel = (that.myCards || []).find(function (c) { return c._id === that.selectedCardId })
        if (!sel) {
          uni.showToast({ title: '请重新选择会员卡', icon: 'none' })
          return
        }
      }
      that.booking = true
      wx.cloud.callFunction({
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
      }).then(function (r) {
        var result = r.result || {}
        if (!result.ok) {
          uni.showToast({ title: result.msg || '预约失败', icon: 'none' })
          return
        }
        uni.showToast({ title: '预约成功', icon: 'success' })
        that.cardSheetVisible = false
        that.currentTime = ''
        that.loadCourtStatus(that.currentDate)
      }).catch(function () {
        uni.showToast({ title: '预约失败', icon: 'none' })
      }).finally(function () {
        that.booking = false
      })
    }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f3f1ec; padding-bottom: 280rpx; }
.top { padding: 28rpx 28rpx 12rpx; display: flex; justify-content: space-between; align-items: flex-start; }
.hello { font-size: 36rpx; font-weight: 700; color: #2c2c2c; }
.venue { font-size: 24rpx; color: #8a8680; margin-top: 6rpx; }
.sw { font-size: 24rpx; color: #3f6b56; font-weight: 600; }
.tabs { margin: 12rpx 28rpx 8rpx; display: flex; background: #e8e4dc; border-radius: 12rpx; overflow: hidden; }
.tab { flex: 1; text-align: center; padding: 18rpx 0; font-size: 28rpx; color: #6b6760; }
.tab.on { background: #fff; color: #2c2c2c; font-weight: 700; }
.dates { white-space: nowrap; padding: 12rpx 20rpx 16rpx; }
.date { display: inline-flex; flex-direction: column; align-items: center; width: 108rpx; padding: 14rpx 0; margin-right: 10rpx; background: #fff; border-radius: 12rpx; }
.date.on { background: #3f6b56; color: #fff; }
.d-md { font-size: 24rpx; font-weight: 600; }
.d-wk { font-size: 20rpx; margin-top: 4rpx; opacity: .75; }
.board { display: flex; min-height: 560rpx; margin: 0 16rpx; background: #fff; border-radius: 16rpx; overflow: hidden; }
.left { width: 176rpx; background: #f7f5f1; }
.left-lab { padding: 20rpx 16rpx 8rpx; font-size: 22rpx; color: #8a8680; }
.l-item { padding: 26rpx 16rpx; font-size: 26rpx; color: #5c5852; }
.l-item.on { background: #3f6b56; color: #fff; font-weight: 700; }
.right { flex: 1; padding: 12rpx; }
.slot { display: flex; justify-content: space-between; align-items: center; background: #f3f1ec; padding: 22rpx 18rpx; margin-bottom: 10rpx; border-radius: 10rpx; font-size: 26rpx; color: #2c2c2c; }
.slot.off { color: #b3aea6; }
.slot.sel { background: #eef4f0; outline: 2rpx solid #3f6b56; }
.st { font-size: 22rpx; color: #b3aea6; }
.st.pink { color: #b85c4a; }
.price { font-size: 26rpx; color: #b87333; font-weight: 600; }
.empty { text-align: center; color: #8a8680; padding: 60rpx 20rpx; }
.bar { position: fixed; left: 0; right: 0; bottom: calc(128rpx + env(safe-area-inset-bottom)); background: #fff; padding: 16rpx 24rpx; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -8rpx 24rpx rgba(44,44,44,.06); z-index: 80; }
.sum { font-size: 34rpx; font-weight: 700; color: #2c2c2c; }
.picked { font-size: 22rpx; color: #8a8680; margin-top: 4rpx; }
.ok { margin: 0; background: #3f6b56 !important; color: #fff !important; font-size: 28rpx; padding: 0 36rpx; border-radius: 12rpx; }
.ok[disabled] { background: #d8d4cc !important; color: #9a968f !important; }
.mask { position: fixed; inset: 0; background: rgba(44,44,44,.4); z-index: 200; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 32rpx 28rpx 48rpx; max-height: 75vh; overflow-y: auto; }
.sheet-title { text-align: center; font-size: 32rpx; font-weight: 700; }
.sheet-sub { text-align: center; color: #8a8680; font-size: 24rpx; margin: 10rpx 0 8rpx; }
.sheet-price { text-align: center; color: #b87333; font-weight: 600; margin-bottom: 16rpx; }
.card-option { border: 2rpx solid #ece8e1; border-radius: 12rpx; padding: 22rpx; margin-bottom: 12rpx; }
.card-option.on { border-color: #3f6b56; background: #eef4f0; }
.co-name { font-size: 28rpx; font-weight: 600; }
.co-meta { font-size: 24rpx; color: #3f6b56; margin-top: 6rpx; }
.sheet-empty { text-align: center; color: #8a8680; padding: 16rpx 0; }
.sheet-btn { margin-top: 8rpx; background: #3f6b56 !important; color: #fff !important; border-radius: 12rpx; }
.sheet-cancel { text-align: center; color: #8a8680; margin-top: 18rpx; padding: 10rpx; }
</style>
