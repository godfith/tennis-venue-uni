<template>
  <view>
    <view class="page" v-if="coach">
      <view class="hero">
        <image class="hero-img" :src="coach.avatar || '/static/images/avatar.png'" mode="aspectFill"></image>
        <view class="hero-mask"></view>
        <view class="hero-txt">
          <view class="kicker">COACH</view>
          <view class="name">{{ coach.name }}</view>
          <view class="role">{{ coach.title || '专业教练' }}</view>
        </view>
      </view>

      <view class="bio" v-if="coach.desc || coach.remark">
        {{ coach.desc || coach.remark }}
      </view>
      <view class="bio muted" v-else>这位教练还没有填写介绍</view>

      <view class="sec-title">选择日期</view>
      <scroll-view scroll-x class="dates" enable-flex>
        <view
          v-for="(item, index) in dateList"
          :key="index"
          :class="'date ' + (currentDate === item.date ? 'on' : '')"
          @tap="onSelectDate(item.date)"
        >
          <view class="d-wk">{{ item.week }}</view>
          <view class="d-md">{{ item.day }}</view>
        </view>
      </scroll-view>

      <view class="sec-title">可约时段</view>
      <view class="slots">
        <view
          v-for="(item, index) in timeList"
          :key="index"
          :class="'slot ' + (item.status === 'full' ? 'off' : '') + ' ' + (currentTime === item.time ? 'sel' : '')"
          @tap="onSelectTime(item.time, item.status)"
        >
          <text>{{ item.time }}</text>
          <text v-if="item.status === 'full'" class="tag">已满</text>
        </view>
      </view>

      <view class="sec-title" v-if="currentTime">选择场地</view>
      <view class="courts" v-if="currentTime">
        <view
          v-for="(item, index) in availableCourts"
          :key="index"
          :class="'court ' + (currentCourt === item ? 'sel' : '')"
          @tap="onSelectCourt(item)"
        >{{ item }}</view>
        <view class="no-court" v-if="!availableCourts.length">该时段暂无空闲场地</view>
      </view>

      <view class="bottom-space"></view>
    </view>
    <view class="loading" v-else>加载中...</view>

    <view class="bar" v-if="coach">
      <view class="bar-info">
        <view class="bar-name">{{ coach.name }}</view>
        <view class="bar-sub" v-if="currentDate && currentTime && currentCourt">
          {{ currentDate }} {{ currentTime }} · {{ currentCourt }}
        </view>
        <view class="bar-sub" v-else>请选择日期、时段和场地</view>
      </view>
      <button class="bar-btn" :disabled="!currentDate || !currentTime || !currentCourt || booking" :loading="booking" @tap="onBook">立即预约</button>
    </view>

    <view class="mask" v-if="cardSheetVisible" @tap="cardSheetVisible = false">
      <view class="sheet" @tap.stop="">
        <view class="sheet-title">选择支付方式</view>
        <view class="sheet-sub">{{ coach.name }} · {{ pending.date }} {{ pending.time }} · {{ pending.court }}</view>
        <view class="card-option" :class="selectedCardId === '' ? 'on' : ''" @tap="selectedCardId = ''">
          <view class="co-name">到店支付课时费</view>
          <view class="co-meta">不使用会员卡</view>
        </view>
        <view
          v-for="c in usableCards"
          :key="c._id"
          class="card-option"
          :class="selectedCardId === c._id ? 'on' : ''"
          @tap="selectedCardId = c._id"
        >
          <view class="co-name">{{ c.cardName }}</view>
          <view class="co-meta">{{ cardMeta(c) }}</view>
        </view>
        <view v-if="!cardLoading && usableCards.length === 0" class="sheet-empty">暂无可用教练卡，可到店支付</view>
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
      dateList: [],
      timeList: [],
      availableCourts: [],
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
    this.loadCoachDetail()
    this.loadCourts()
  },
  methods: {
    venueId() { return uni.getStorageSync('venue_id') || '' },
    cardMeta(c) { return '教练卡 · 剩' + (c.remainingTimes || 0) + '次' },
    isCardUsable(card, dateStr) {
      if (!card || card.status !== 'active') return false
      if (card.type !== 'coach') return false
      if ((card.remainingTimes || 0) <= 0) return false
      if (card.validFrom && dateStr && dateStr < card.validFrom) return false
      if (card.validTo && dateStr && dateStr > card.validTo) return false
      return true
    },
    loadCoachDetail() {
      var that = this
      if (!that.coachId) {
        uni.showToast({ title: '缺少教练', icon: 'none' })
        return
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCoachDetail', id: that.coachId },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok || !result.coach) {
            uni.showToast({ title: result.msg || '加载教练失败', icon: 'none' })
            return
          }
          that.coach = result.coach
        },
        fail: function () {
          uni.showToast({ title: '加载失败', icon: 'none' })
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
          week: i === 0 ? '今天' : '周' + weeks[d.getDay()],
          day: m + '/' + day
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
      if (resetSelect) {
        that.currentTime = ''
        that.currentCourt = ''
        that.availableCourts = []
      }
      if (availableTimes.length === 0) {
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
          var courtUsed = {}
          bookings.forEach(function (b) {
            if (b.status !== 'booked') return
            if (b.coachId && String(b.coachId) === String(that.coachId)) coachBusy[b.time] = true
            if (!courtUsed[b.time]) courtUsed[b.time] = []
            if (b.court) courtUsed[b.time].push(b.court)
          })
          groups.forEach(function (g) {
            if (g.status !== 'open') return
            if (g.coachId && String(g.coachId) === String(that.coachId)) coachBusy[g.time] = true
            if (!courtUsed[g.time]) courtUsed[g.time] = []
            if (g.court) courtUsed[g.time].push(g.court)
          })
          that.timeList = availableTimes.map(function (time) {
            var used = courtUsed[time] || []
            var total = that.courtList.length || 4
            var full = !!coachBusy[time] || used.length >= total
            return { time: time, status: full ? 'full' : 'available' }
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
      this.currentCourt = ''
      this.loadAvailableCourts(time)
    },
    loadAvailableCourts(time) {
      var used = {}
      ;(this.bookingsCache || []).forEach(function (b) {
        if (b.status === 'booked' && b.time === time && b.court) used[b.court] = true
      })
      ;(this.groupCache || []).forEach(function (g) {
        if (g.status === 'open' && g.time === time && g.court) used[g.court] = true
      })
      this.availableCourts = (this.courtList || []).filter(function (c) { return !used[c] })
    },
    onSelectCourt(court) { this.currentCourt = court },
    onBook() {
      var nickName = uni.getStorageSync('nickName') || ''
      var phone = uni.getStorageSync('phone') || ''
      if (!nickName || !phone) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        uni.navigateTo({ url: '/pages/login/login' })
        return
      }
      if (!this.currentDate || !this.currentTime || !this.currentCourt) {
        uni.showToast({ title: '请先选择日期、时段和场地', icon: 'none' })
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
      var date = that.pending.date
      var time = that.pending.time
      var court = that.pending.court
      if (!date || !time || !court) {
        uni.showToast({ title: '请先选择日期、时段和场地', icon: 'none' })
        return
      }
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
        if (sel.type !== 'coach') {
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
            userName: nickName,
            phone: phone,
            userId: userDocId,
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
            that.loadTimeList(that.currentDate, false)
            return
          }
          uni.showToast({ title: '预约成功', icon: 'success' })
          that.cardSheetVisible = false
          that.pending = { date: '', time: '', court: '' }
          that.currentTime = ''
          that.currentCourt = ''
          that.availableCourts = []
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
.page { min-height: 100vh; background: #f4f2ee; padding-bottom: 160rpx; }
.loading { text-align: center; padding-top: 200rpx; color: #999; }
.hero { height: 420rpx; position: relative; background: #111; }
.hero-img { width: 100%; height: 100%; opacity: .55; }
.hero-mask { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,.75)); }
.hero-txt { position: absolute; left: 36rpx; bottom: 36rpx; color: #fff; }
.kicker { font-size: 20rpx; letter-spacing: 8rpx; color: #c8a36a; }
.name { font-size: 56rpx; font-weight: 700; margin: 8rpx 0 6rpx; }
.role { font-size: 24rpx; color: #ddd; }
.bio { margin: 28rpx 32rpx 8rpx; font-size: 26rpx; color: #444; line-height: 1.7; }
.bio.muted { color: #aaa; }
.sec-title { margin: 28rpx 32rpx 16rpx; font-size: 26rpx; font-weight: 700; letter-spacing: 2rpx; color: #111; }
.dates { white-space: nowrap; padding: 0 24rpx 8rpx; }
.date { display: inline-flex; flex-direction: column; align-items: center; width: 120rpx; padding: 16rpx 0; margin-right: 12rpx; background: #fff; }
.date.on { background: #111; color: #fff; }
.d-wk { font-size: 20rpx; opacity: .7; }
.d-md { font-size: 28rpx; font-weight: 700; margin-top: 6rpx; }
.slots { padding: 0 24rpx; }
.slot { display: flex; justify-content: space-between; background: #eceae6; padding: 24rpx 24rpx; margin-bottom: 12rpx; font-size: 28rpx; }
.slot.off { color: #bbb; }
.slot.sel { background: #fff; border: 2rpx solid #111; }
.tag { font-size: 22rpx; color: #c45c26; }
.courts { display: flex; flex-wrap: wrap; gap: 12rpx; padding: 0 24rpx; }
.court { min-width: 160rpx; text-align: center; padding: 20rpx 0; background: #fff; font-size: 26rpx; }
.court.sel { background: #111; color: #fff; }
.no-court { width: 100%; text-align: center; color: #999; padding: 20rpx 0; }
.bottom-space { height: 40rpx; }
.bar { position: fixed; left: 0; right: 0; bottom: 0; background: #fff; padding: 16rpx 24rpx; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -8rpx 24rpx rgba(0,0,0,.06); z-index: 80; }
.bar-name { font-size: 28rpx; font-weight: 700; }
.bar-sub { font-size: 22rpx; color: #888; margin-top: 4rpx; }
.bar-btn { margin: 0; background: #c45c26 !important; color: #fff !important; font-size: 26rpx; padding: 0 32rpx; border-radius: 0; }
.bar-btn[disabled] { background: #ddd !important; color: #999 !important; }
.mask { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 200; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; padding: 32rpx 30rpx 50rpx; max-height: 75vh; overflow-y: auto; }
.sheet-title { text-align: center; font-size: 32rpx; font-weight: 700; }
.sheet-sub { text-align: center; color: #888; font-size: 24rpx; margin: 12rpx 0 20rpx; }
.card-option { border: 2rpx solid #eee; padding: 24rpx; margin-bottom: 16rpx; }
.card-option.on { border-color: #111; background: #f7f4ef; }
.co-name { font-size: 28rpx; font-weight: 600; }
.co-meta { font-size: 24rpx; color: #c45c26; margin-top: 8rpx; }
.sheet-empty { text-align: center; color: #999; padding: 16rpx 0; }
.sheet-btn { margin-top: 12rpx; background: #111 !important; color: #fff !important; border-radius: 0; }
.sheet-cancel { text-align: center; color: #999; margin-top: 20rpx; padding: 12rpx; }
</style>
