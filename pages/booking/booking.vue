<template>
  <view>
    <view class="page">
      <view class="map">
        <view class="map-title">COURT MAP</view>
        <view class="courts-row">
          <view
            v-for="(c, i) in courtConfig"
            :key="c.id"
            :class="'mini-court ' + (currentCourtName === c.name ? 'on' : '')"
            @tap="pickCourt(c)"
          >{{ i + 1 }}</view>
        </view>
      </view>

      <view class="greet">
        <view>
          <view class="hi">Hi, {{ nickName || '球友' }}</view>
          <view class="hi-sub">选场地，开打</view>
        </view>
        <view class="sw" @tap="switchVenue">切换场馆</view>
      </view>
      <view class="addr">{{ venueName || '请先选择场馆' }}</view>

      <view class="tabs">
        <view :class="'tab ' + (mode === 'court' ? 'on' : '')" @tap="mode = 'court'">订场</view>
        <view :class="'tab ' + (mode === 'coach' ? 'on' : '')" @tap="goCoach">私教</view>
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
          <view class="indoor">场地</view>
          <view
            v-for="(item, index) in courtList"
            :key="item.id"
            :class="'cname ' + (currentCourtName === item.name ? 'on' : '')"
            @tap="pickCourt(item)"
          >{{ item.name }}</view>
        </view>
        <view class="right">
          <view
            v-for="(cell, i) in activeTimes"
            :key="i"
            :class="'slot ' + (cell.status !== 'available' ? 'off' : '') + ' ' + (currentTime === cell.time ? 'sel' : '')"
            @tap="onSelectSlot(activeCourt.id, activeCourt.name, cell.time, cell.status)"
          >
            <text>{{ cell.time }}</text>
            <text v-if="cell.status === 'full'" class="tag">已预订</text>
            <text v-else-if="cell.status === 'group'" class="tag pink">团课</text>
            <text v-else-if="cell.price > 0" class="price">¥{{ cell.price }}</text>
          </view>
          <view v-if="!activeTimes.length" class="empty">暂无时段</view>
        </view>
      </view>
      <view class="empty-page" v-else>请先在首页选择场馆</view>
    </view>

    <view class="bar">
      <view>
        <view class="sum">共：¥{{ currentPrice || 0 }}</view>
        <view class="picked">已选 {{ currentTime ? 1 : 0 }} 项 · {{ currentCourtName || '未选场地' }}</view>
      </view>
      <button class="ok" :disabled="!currentCourtName || !currentTime || booking" :loading="booking" @tap="onBook">1小时起订</button>
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
      mode: 'court',
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
    this.nickName = uni.getStorageSync('nickName') || ''
    this.venueName = uni.getStorageSync('venue_name') || ''
    this.loadCourts()
  },
  methods: {
    goCoach() {
      uni.navigateTo({ url: '/pages/coach/coach' })
    },
    switchVenue() {
      uni.switchTab({ url: '/pages/index/index' })
    },
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
          md: mm + '-' + dd,
          day: m + '/' + day
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
.page { min-height: 100vh; background: #f4f2ee; padding-bottom: 160rpx; }
.map { background: #d7d3cb; padding: 28rpx 24rpx 36rpx; }
.map-title { font-size: 20rpx; letter-spacing: 6rpx; color: #666; margin-bottom: 16rpx; }
.courts-row { display: flex; flex-wrap: wrap; gap: 16rpx; }
.mini-court { width: 120rpx; height: 80rpx; background: #8f8a82; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; border-radius: 8rpx; }
.mini-court.on { background: #0f3d28; }
.greet { padding: 28rpx 28rpx 0; display: flex; justify-content: space-between; align-items: flex-start; }
.hi { font-size: 40rpx; font-weight: 700; }
.hi-sub { font-size: 24rpx; color: #999; margin-top: 6rpx; }
.sw { font-size: 24rpx; color: #0f3d28; font-weight: 600; }
.addr { padding: 8rpx 28rpx 16rpx; font-size: 22rpx; color: #888; }
.tabs { margin: 0 28rpx 16rpx; display: flex; background: #fff; }
.tab { flex: 1; text-align: center; padding: 22rpx 0; font-size: 28rpx; font-weight: 600; background: #fff; color: #333; }
.tab.on { background: #111; color: #fff; }
.dates { white-space: nowrap; padding: 8rpx 20rpx 20rpx; }
.date { display: inline-flex; flex-direction: column; align-items: center; width: 110rpx; padding: 12rpx 0; margin-right: 8rpx; }
.date.on { border: 2rpx solid #111; }
.d-md { font-size: 24rpx; font-weight: 600; }
.d-wk { font-size: 20rpx; color: #888; margin-top: 4rpx; }
.board { display: flex; min-height: 520rpx; }
.left { width: 200rpx; background: #eee; }
.indoor { padding: 20rpx; font-size: 22rpx; color: #888; }
.cname { padding: 28rpx 16rpx; font-size: 26rpx; font-weight: 700; color: #666; }
.cname.on { background: #111; color: #fff; }
.right { flex: 1; padding: 8rpx 16rpx 20rpx; }
.slot { display: flex; justify-content: space-between; align-items: center; background: #eceae6; padding: 22rpx 20rpx; margin-bottom: 12rpx; font-size: 26rpx; }
.slot.off { color: #bbb; }
.slot.sel { background: #fff; border: 2rpx solid #111; }
.tag { font-size: 22rpx; color: #999; }
.tag.pink { color: #c2185b; }
.price { font-size: 26rpx; font-weight: 600; }
.empty, .empty-page { text-align: center; color: #999; padding: 60rpx 20rpx; }
.bar { position: fixed; left: 0; right: 0; bottom: 0; background: #fff; padding: 16rpx 24rpx; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -6rpx 20rpx rgba(0,0,0,.06); z-index: 80; }
.sum { font-size: 30rpx; font-weight: 700; }
.picked { font-size: 22rpx; color: #888; margin-top: 4rpx; }
.ok { margin: 0; background: #eceae6 !important; color: #111 !important; font-size: 26rpx; padding: 0 28rpx; }
.ok[disabled] { opacity: .6; }
.mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,.45); z-index: 200; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 32rpx 30rpx 50rpx; box-sizing: border-box; max-height: 75vh; overflow-y: auto; }
.sheet-title { font-size: 32rpx; font-weight: 600; text-align: center; }
.sheet-sub { text-align: center; color: #888; font-size: 24rpx; margin: 12rpx 0 8rpx; }
.sheet-price { text-align: center; color: #e6a23c; font-size: 28rpx; font-weight: 600; margin-bottom: 16rpx; }
.card-option { border: 2rpx solid #eee; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; }
.card-option.on { border-color: #0f3d28; background: #f3f7f4; }
.co-name { font-size: 28rpx; color: #222; font-weight: 500; }
.co-meta { font-size: 24rpx; color: #07c160; margin-top: 8rpx; }
.sheet-empty { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
.sheet-btn { margin-top: 20rpx; background: #0f3d28 !important; color: #fff !important; border-radius: 8rpx; font-size: 30rpx; }
.sheet-cancel { text-align: center; color: #999; font-size: 28rpx; margin-top: 24rpx; padding: 12rpx; }
</style>
