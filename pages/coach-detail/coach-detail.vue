<template>
  <view>
    <view class="page" v-if="coach">
      <view class="top">
        <view class="top-l">
          <view class="hello">{{ coach.name }}</view>
          <view class="venue">{{ coach.title || '专业教练' }} · {{ venueName }}</view>
        </view>
      </view>

      <view class="tabs">
        <view class="tab" @tap="goBook">订场</view>
        <view class="tab on">私教</view>
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

      <view class="board">
        <view class="left">
          <view class="left-lab">场地</view>
          <view
            v-for="c in courtList"
            :key="c"
            :class="'l-item ' + (currentCourt === c ? 'on' : '')"
            @tap="onSelectCourt(c)"
          >{{ c }}</view>
          <view v-if="!courtList.length" class="left-lab">暂无场地</view>
        </view>
        <view class="right">
          <view
            v-for="(item, index) in timeList"
            :key="index"
            :class="'slot ' + (item.status === 'full' ? 'off' : '') + ' ' + (currentTime === item.time ? 'sel' : '')"
            @tap="onSelectTime(item.time, item.status)"
          >
            <text>{{ item.time }}</text>
            <text v-if="item.status === 'full'" class="st">已满</text>
          </view>
          <view v-if="!timeList.length" class="empty">暂无时段</view>
        </view>
      </view>
    </view>
    <view class="empty" v-else>加载中...</view>

    <view class="bar" v-if="coach">
      <view>
        <view class="sum">{{ coach.name }}</view>
        <view class="picked">{{ currentCourt || '未选场地' }} {{ currentTime }}</view>
      </view>
      <button class="ok" :disabled="!currentDate || !currentTime || !currentCourt || booking" :loading="booking" @tap="onBook">确认约课</button>
    </view>

    <view class="mask" v-if="cardSheetVisible" @tap="cardSheetVisible = false">
      <view class="sheet" @tap.stop="">
        <view class="sheet-title">选择支付方式</view>
        <view class="sheet-sub">{{ coach.name }} · {{ pending.date }} {{ pending.time }} · {{ pending.court }}</view>
        <view class="card-option" :class="selectedCardId === '' ? 'on' : ''" @tap="selectedCardId = ''">
          <view class="co-name">到店支付课时费</view>
        </view>
        <view v-for="c in usableCards" :key="c._id" class="card-option" :class="selectedCardId === c._id ? 'on' : ''" @tap="selectedCardId = c._id">
          <view class="co-name">{{ c.cardName }}</view>
          <view class="co-meta">教练卡 · 剩{{ c.remainingTimes || 0 }}次</view>
        </view>
        <view v-if="!cardLoading && usableCards.length === 0" class="sheet-empty">暂无可用教练卡</view>
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
      coach: null,
      venueName: '',
      dateList: [],
      timeList: [],
      currentDate: '',
      currentTime: '',
      currentCourt: '',
      pending: { date: '', time: '', court: '' },
      coachId: '',
      courtList: [],
      bookingsCache: [],
      groupCache: [],
      booking: false,
      cardSheetVisible: false,
      cardLoading: false,
      myCards: [],
      selectedCardId: '',
      allTimes: [
        '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
        '18:00-19:00', '19:00-20:00', '20:00-21:00'
      ]
    }
  },
  computed: {
    usableCards() {
      var that = this
      var dateStr = that.pending.date || that.currentDate
      return (this.myCards || []).filter(function (c) {
        return that.isCardUsable(c, dateStr)
      })
    }
  },
  onLoad(options) {
    this.coachId = options.id || ''
    this.venueName = uni.getStorageSync('venue_name') || ''
    this.loadCoachDetail()
    this.loadCourts()
  },
  methods: {
    goBook() { uni.switchTab({ url: '/pages/booking/booking' }) },
    venueId() { return uni.getStorageSync('venue_id') || '' },
    isCardUsable(card, dateStr) {
      if (!card || card.status !== 'active' || card.type !== 'coach') return false
      if ((card.remainingTimes || 0) <= 0) return false
      if (card.validFrom && dateStr && dateStr < card.validFrom) return false
      if (card.validTo && dateStr && dateStr > card.validTo) return false
      return true
    },
    loadCoachDetail() {
      var that = this
      if (!that.coachId) return
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCoachDetail', id: that.coachId },
        success: function (res) {
          var result = res.result || {}
          if (result.ok) that.coach = result.coach
        }
      })
    },
    loadCourts() {
      var that = this
      var venueId = that.venueId()
      if (!venueId) {
        that.initDateList()
        return
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCourts', venueId: venueId },
        success: function (res) {
          that.courtList = ((res.result || {}).list || []).map(function (item) { return item.name })
          if (that.courtList.length && !that.currentCourt) that.currentCourt = that.courtList[0]
          that.initDateList()
        },
        fail: function () { that.initDateList() }
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
      this.loadTimeList(list[0].date, true)
    },
    getAvailableTimes(dateStr) {
      var now = new Date()
      var y = now.getFullYear()
      var m = now.getMonth() + 1
      var day = now.getDate()
      var mm = m < 10 ? '0' + m : '' + m
      var dd = day < 10 ? '0' + day : '' + day
      var todayStr = y + '-' + mm + '-' + dd
      if (dateStr !== todayStr) return this.allTimes.slice()
      var currentHour = now.getHours()
      var currentMinute = now.getMinutes()
      return this.allTimes.filter(function (time) {
        var startHour = parseInt(time.split(':')[0], 10)
        if (startHour < currentHour) return false
        if (startHour === currentHour && currentMinute > 0) return false
        return true
      })
    },
    loadTimeList(date, resetSelect) {
      var that = this
      var venueId = that.venueId()
      var availableTimes = that.getAvailableTimes(date)
      if (resetSelect) that.currentTime = ''
      if (!availableTimes.length) {
        that.timeList = []
        return
      }
      if (!venueId) {
        that.timeList = availableTimes.map(function (t) { return { time: t, status: 'available' } })
        return
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getSchedule', venueId: venueId, date: date },
        success: function (res) {
          var result = res.result || {}
          var bookings = result.bookings || []
          var groups = result.groupClasses || []
          that.bookingsCache = bookings
          that.groupCache = groups
          var coachBusy = {}
          bookings.forEach(function (b) {
            if (b.status === 'booked' && b.coachId && String(b.coachId) === String(that.coachId)) {
              coachBusy[b.time] = true
            }
          })
          groups.forEach(function (g) {
            if (g.status === 'open' && g.coachId && String(g.coachId) === String(that.coachId)) {
              coachBusy[g.time] = true
            }
          })
          that.timeList = availableTimes.map(function (time) {
            var courtBusy = false
            if (that.currentCourt) {
              bookings.forEach(function (b) {
                if (b.status === 'booked' && b.time === time && b.court === that.currentCourt) courtBusy = true
              })
              groups.forEach(function (g) {
                if (g.status === 'open' && g.time === time && g.court === that.currentCourt) courtBusy = true
              })
            }
            return { time: time, status: (coachBusy[time] || courtBusy) ? 'full' : 'available' }
          })
        },
        fail: function () {
          that.timeList = availableTimes.map(function (t) { return { time: t, status: 'available' } })
        }
      })
    },
    onSelectDate(date) {
      this.currentDate = date
      this.loadTimeList(date, true)
    },
    onSelectTime(time, status) {
      if (status === 'full') {
        uni.showToast({ title: '该时间不可预约', icon: 'none' })
        return
      }
      this.currentTime = time
    },
    onSelectCourt(court) {
      this.currentCourt = court
      this.currentTime = ''
      this.loadTimeList(this.currentDate, false)
    },
    onBook() {
      var nickName = uni.getStorageSync('nickName') || ''
      var phone = uni.getStorageSync('phone') || ''
      if (!nickName || !phone) {
        uni.navigateTo({ url: '/pages/login/login' })
        return
      }
      if (!this.currentDate || !this.currentTime || !this.currentCourt) {
        uni.showToast({ title: '请选择场地和时段', icon: 'none' })
        return
      }
      this.pending = { date: this.currentDate, time: this.currentTime, court: this.currentCourt }
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
      var date = that.pending.date, time = that.pending.time, court = that.pending.court
      if (!date || !time || !court) return
      var sel = null
      if (that.selectedCardId) {
        sel = (that.myCards || []).find(function (c) { return c._id === that.selectedCardId })
        if (!sel || sel.type !== 'coach') {
          uni.showToast({ title: '约教练只能使用教练卡', icon: 'none' })
          return
        }
      }
      that.booking = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'createBooking',
          data: {
            venueId: that.venueId(),
            venueName: uni.getStorageSync('venue_name') || '',
            court: court,
            date: date,
            time: time,
            userName: uni.getStorageSync('nickName') || '',
            phone: uni.getStorageSync('phone') || '',
            userId: uni.getStorageSync('userDocId') || '',
            coachId: that.coachId,
            coachName: (that.coach && that.coach.name) || '',
            cardId: sel ? sel._id : '',
            cardName: sel ? sel.cardName : '',
            cardType: sel ? sel.type : ''
          }
        },
        success: function (r) {
          var result = r.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '预约失败', icon: 'none' })
            return
          }
          uni.showToast({ title: '预约成功', icon: 'success' })
          that.cardSheetVisible = false
          that.pending = { date: '', time: '', court: '' }
          that.currentTime = ''
          that.loadTimeList(that.currentDate, false)
        },
        fail: function () { uni.showToast({ title: '预约失败', icon: 'none' }) },
        complete: function () { that.booking = false }
      })
    }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f3f1ec; padding-bottom: 150rpx; }
.top { padding: 28rpx 28rpx 12rpx; }
.hello { font-size: 36rpx; font-weight: 700; color: #2c2c2c; }
.venue { font-size: 24rpx; color: #8a8680; margin-top: 6rpx; }
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
.slot { display: flex; justify-content: space-between; align-items: center; background: #f3f1ec; padding: 22rpx 18rpx; margin-bottom: 10rpx; border-radius: 10rpx; font-size: 26rpx; }
.slot.off { color: #b3aea6; }
.slot.sel { background: #eef4f0; outline: 2rpx solid #3f6b56; }
.st { font-size: 22rpx; color: #b3aea6; }
.empty { text-align: center; color: #8a8680; padding: 60rpx 20rpx; }
.bar { position: fixed; left: 0; right: 0; bottom: 0; background: #fff; padding: 16rpx 24rpx; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -8rpx 24rpx rgba(44,44,44,.06); }
.sum { font-size: 30rpx; font-weight: 700; color: #2c2c2c; }
.picked { font-size: 22rpx; color: #8a8680; margin-top: 4rpx; }
.ok { margin: 0; background: #3f6b56 !important; color: #fff !important; font-size: 28rpx; padding: 0 36rpx; border-radius: 12rpx; }
.ok[disabled] { background: #d8d4cc !important; color: #9a968f !important; }
.mask { position: fixed; inset: 0; background: rgba(44,44,44,.4); z-index: 200; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 32rpx 28rpx 48rpx; max-height: 75vh; overflow-y: auto; }
.sheet-title { text-align: center; font-size: 32rpx; font-weight: 700; }
.sheet-sub { text-align: center; color: #8a8680; font-size: 24rpx; margin: 10rpx 0 16rpx; }
.card-option { border: 2rpx solid #ece8e1; border-radius: 12rpx; padding: 22rpx; margin-bottom: 12rpx; }
.card-option.on { border-color: #3f6b56; background: #eef4f0; }
.co-name { font-size: 28rpx; font-weight: 600; }
.co-meta { font-size: 24rpx; color: #3f6b56; margin-top: 6rpx; }
.sheet-empty { text-align: center; color: #8a8680; padding: 16rpx 0; }
.sheet-btn { margin-top: 8rpx; background: #3f6b56 !important; color: #fff !important; border-radius: 12rpx; }
.sheet-cancel { text-align: center; color: #8a8680; margin-top: 18rpx; padding: 10rpx; }
</style>
