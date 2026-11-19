<template>
  <view class="root">
    <view class="page">
      <view class="top">
        <view class="top-l">
          <view class="hello">Hi, {{ nickName || '球友' }}</view>
          <view class="venue">{{ venueName || '请先选择场馆' }}</view>
        </view>
        <view class="sw" @tap="switchVenue">切换场馆</view>
      </view>

      <view class="tabs">
        <view :class="'tab ' + (sport === 'tennis' ? 'on' : '')" @tap="setSport('tennis')">网球</view>
        <view v-if="hasPickleball" :class="'tab ' + (sport === 'pickleball' ? 'on' : '')" @tap="setSport('pickleball')">匹克球</view>
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

      <view class="venue-tip" v-if="courtList.length">{{ venueName }} · {{ sport === 'pickleball' ? '匹克球' : '网球' }}，{{ courtList.length }} 个场地</view>
      <scroll-view class="grid-wrap" scroll-x scroll-y v-if="courtList.length && hasOpenSlots">
        <view class="grid">
          <view class="col" v-for="court in courtList" :key="court.id">
            <view class="col-h">{{ court.name }}<text v-if="court.desc === '共用' || court.desc === '匹克球'" class="col-type"> · {{ court.desc }}</text></view>
            <view
              v-for="(cell, i) in court.times"
              :key="i"
              :class="'cell ' + cls(cell) + (currentCourtName === court.name && currentTime === cell.time ? ' pick' : '')"
              @tap="onSelectSlot(court.id, court.name, cell.time, cell.status, cell.past)"
            >
              <block v-if="cell.status === 'full'">
                <view class="sold">{{ cell.sportText || '已售' }}</view>
              </block>
              <block v-else-if="cell.status === 'group'">
                <view class="sold">团课</view>
              </block>
              <block v-else-if="cell.status === 'noprice' || cell.past">
                <view class="sold">{{ cell.past ? '已过' : '未标价' }}</view>
              </block>
              <block v-else>
                <view class="yen" v-if="cell.price">¥{{ cell.price }}/h</view><view class="yen" v-else>可约</view>
              </block>
              <view class="tm">{{ cell.time }}</view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="empty" v-else-if="courtList.length">今日可约时段已过，请换一天</view>
      <view class="empty" v-else>{{ emptyHint }}</view>
    </view>

    <view class="bar">
      <view class="picked">{{ venueName || '未选门店' }} · {{ currentCourtName || '未选场地' }} {{ currentTime }}</view>
      <button class="ok" :disabled="!currentCourtName || !currentTime || booking" :loading="booking" @tap="onBook">立即预定</button>
    </view>

    <view class="mask" v-if="noticeVisible" @tap.stop="">
      <view class="sheet" @tap.stop="">
        <view class="sheet-title">{{ notice && notice.title ? notice.title : '预约注意事项' }}</view>
        <view class="notice-content" style="padding:20rpx 0;white-space:pre-wrap;line-height:1.7;color:#333;font-size:28rpx">{{ notice && notice.content ? notice.content : '暂无注意事项' }}</view>
        <button class="sheet-btn" @tap="confirmNotice">我已阅读，继续预约</button>
        <view class="sheet-cancel" @tap="noticeVisible = false">取消</view>
      </view>
    </view>

    <view class="mask" v-if="cardSheetVisible" @tap="cardSheetVisible = false">
      <view class="sheet" @tap.stop="">
        <view class="sheet-title">确认预约</view>
        <view class="sheet-sub">{{ venueName }}</view>
        <view class="sheet-sub">{{ currentCourtName }} · {{ currentDate }} {{ currentTime }}</view>
        <view class="sheet-price" v-if="currentPrice > 0">场地参考价 ¥{{ currentPrice }}</view>
        <view
          v-if="currentPrice > 0"
          class="card-option"
          :class="payWay === 'wx' ? 'on' : ''"
          @tap="pickWxPay"
        >
          <view class="co-name">微信支付</view>
          <view class="co-meta">在线支付 ¥{{ currentPrice }}</view>
        </view>
        <view
          v-if="currentPrice > 0"
          class="card-option"
          :class="payWay === 'balance' ? 'on' : (walletBalance + 0.001 < currentPrice ? 'off' : '')"
          @tap="pickBalancePay"
        >
          <view class="co-name">现金余额</view>
          <view class="co-meta" v-if="walletBalance + 0.001 >= currentPrice">余额 ¥{{ Number(walletBalance).toFixed(2) }}，本场扣 ¥{{ currentPrice }}</view>
          <view class="co-meta" v-else>余额 ¥{{ Number(walletBalance).toFixed(2) }}，不足本场 ¥{{ currentPrice }}</view>
        </view>
        <view v-for="c in usableCards" :key="c._id" class="card-option" :class="payWay === 'card' && selectedCardId === c._id ? 'on' : ''" @tap="pickCardPay(c._id)">
          <view class="co-name">{{ c.cardName }}</view>
          <view class="co-meta">{{ cardMeta(c) }}</view>
        </view>
        <view v-if="!cardLoading && usableCards.length === 0" class="sheet-empty">{{ noUsableCardText }}</view>
        <button class="sheet-btn" :loading="booking" @tap="submitBook">确认预约 {{ venueName }}</button>
        <view class="sheet-cancel" @tap="cardSheetVisible = false">取消</view>
      </view>
    </view>
    <view class="mask" v-if="venueSheetVisible" @tap="venueSheetVisible = false">
      <view class="sheet" @tap.stop="">
        <view class="sheet-title">切换门店</view>
        <view
          v-for="v in venueList"
          :key="v.venueId"
          class="card-option"
          :class="v.venueId === venueId ? 'on' : ''"
          @tap="chooseVenue(v)"
        >
          <view class="co-name">{{ v.name }}</view>
        </view>
        <view class="sheet-cancel" @tap="venueSheetVisible = false">取消</view>
      </view>
    </view>
    <app-tabbar :current="1" />
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
      hasPickleball: false,
      dateList: [],
      venueName: '',
      venueId: '',
      venueList: [],
      sport: 'tennis',
      venueSheetVisible: false,
      courtList: [],
      currentDate: '',
      currentCourtId: '',
      currentCourtName: '',
      currentTime: '',
      booking: false,
      notice: null,
      noticeVisible: false,
      cardSheetVisible: false,
      cardLoading: false,
      myCards: [],
      selectedCardId: '',
      payWay: 'wx',
      walletBalance: 0,
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
        { time: '20:00-21:00', short: '20:00', hour: 20 },
        { time: '21:00-22:00', short: '21:00', hour: 21 }
      ]
    }
  },
  computed: {
    hasOpenSlots() {
      var list = this.courtList || []
      for (var i = 0; i < list.length; i++) {
        if (list[i].times && list[i].times.length) return true
      }
      return false
    },
    emptyHint() {
      if (!this.venueId) return '请先在首页选择场馆'
      if (this.sport === 'pickleball') return '当前门店没有匹克球场地'
      if (!(this.courtConfig && this.courtConfig.length)) return '当前门店暂无可预约场地（场地可能尚未开放）'
      return '当前门店没有可预约的网球场地'
    },
    currentPrice() {
      if (!this.currentCourtName || !this.currentTime) return 0
      return this.lookupPrice(this.currentCourtName, this.currentTime)
    },
    usableCards() {
      var that = this
      return (this.myCards || []).filter(function (c) {
        var typ = String(c.type || '')
        var name = String(c.cardName || c.card_name || '')
        if (typ === 'stored' || typ === '储值' || typ === 'wallet' || name.indexOf('储值') >= 0) return false
        return that.isCardUsable(c, that.currentDate, that.currentTime)
      })
    },
    noUsableCardText() {
      var court = this.lookupCurrentCourt()
      if (this.isPureTennisCourt(court) && this.hasMachineOnlyCards()) {
        return '这块场已标为纯网球、没有发球机，发球机卡不能约'
      }
      return '暂无可用次卡或期限卡，可用现金余额或微信支付'
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
    this.venueId = uni.getStorageSync('venue_id') || ''
    this.ensureBookableVenue()
  },
  methods: {
    normCourt(c) {
      return String(c || '').trim().replace(/^发球机/u, '').replace(/场$/u, '')
    },
    slotKey(court, time) {
      return this.normCourt(court) + '_' + String(time || '')
    },
    lookupPrice(courtName, time) {
      var direct = Number(this.priceMap[courtName + '_' + time] || 0)
      if (direct) return direct
      var keys = Object.keys(this.priceMap || {})
      var want = this.normCourt(courtName)
      for (var k = 0; k < keys.length; k++) {
        if (keys[k].indexOf(time) < 0) continue
        var courtKey = keys[k].split('_')[0]
        if (courtKey === courtName || this.normCourt(courtKey) === want || courtName.indexOf(courtKey) >= 0 || courtKey.indexOf(courtName) >= 0) {
          var price = Number(this.priceMap[keys[k]] || 0)
          if (price) return price
        }
      }
      return 0
    },
    cls(cell) {
      var off = cell.status !== 'available' || cell.past || cell.status === 'noprice'
      var s = off ? 'off' : ''
      if (this.currentTime === cell.time && this.currentCourtName) s += ' sel'
      return s
    },
    goCoach() { uni.navigateTo({ url: '/pages/coach/coach' }) },
    ensureBookableVenue() {
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenues' },
        success: function (res) {
          var list = ((res.result || {}).list) || []
          that.venueList = list
          var id = that.venueId || uni.getStorageSync('venue_id') || ''
          var found = list.find(function (v) { return (v.venueId || v._id) === id })
          if (found) {
            that.loadCourts()
            return
          }
          if (id) {
            that.venueId = ''
            that.venueName = '请先选择场馆'
            uni.showToast({ title: '请选择可订场的门店', icon: 'none' })
            if (list.length) that.venueSheetVisible = true
            return
          }
          that.loadCourts()
        },
        fail: function () { that.loadCourts() }
      })
    },
    switchVenue() {
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenues' },
        success: function (res) {
          that.venueList = ((res.result || {}).list) || []
          that.venueSheetVisible = true
        },
        fail: function () { uni.showToast({ title: '门店加载失败', icon: 'none' }) }
      })
    },
    chooseVenue(v) {
      var id = v.venueId || v._id || ''
      var name = v.name || ''
      uni.setStorageSync('venue_id', id)
      uni.setStorageSync('venue_name', name)
      uni.setStorageSync('home_venue_id', id)
      uni.setStorageSync('home_venue_name', name)
      this.venueId = id
      this.venueName = name
      this.currentCourtName = ''
      this.currentTime = ''
      this.venueSheetVisible = false
      this.loadCourts()
      if (this.currentDate) this.loadCourtStatus(this.currentDate)
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

    parseCardTimeRule(card) {
      var rule = card && (card.timeRule || card.time_rule)
      if (!rule) return null
      if (typeof rule === 'object') return rule
      try { return JSON.parse(rule) } catch (e) { return null }
    },
    inferCourtTypesFromName(name, cardType) {
      var typ = String(cardType || '')
      var n = String(name || '')
      if (typ === 'stored' || typ === '储值' || typ === 'wallet' || n.indexOf('储值') >= 0) return []
      if (n.indexOf('匹克') >= 0 || n.indexOf('丁克') >= 0) return ['匹克球']
      if (n.indexOf('发球机') >= 0) return ['发球机']
      return ['网球']
    },
    resolveCardCourtTypes(card) {
      var name = (card && (card.cardName || card.card_name || card.name)) || ''
      var typ = (card && card.type) || ''
      var rule = this.parseCardTimeRule(card)
      if (rule && Array.isArray(rule.courtTypes)) {
        var out = []
        for (var i = 0; i < rule.courtTypes.length; i++) {
          var t = String(rule.courtTypes[i] || '').trim()
          if (t === '不限' || t === '*' || t === 'all') return []
          if ((t === '网球' || t === '匹克球' || t === '发球机') && out.indexOf(t) < 0) out.push(t)
        }
        return out
      }
      return this.inferCourtTypesFromName(name, typ)
    },
    inferCourtTypeFromCourt(court) {
      var typ = String((court && court.type) || '').trim()
      var name = String((court && (court.name || court.court)) || '')
      if (typ === '网球' || typ === '匹克球' || typ === '发球机' || typ === '共用') return typ
      if (name.indexOf('匹克') >= 0 || name.indexOf('丁克') >= 0) return '匹克球'
      if (!typ && name && (name.indexOf('发球机') === 0 || name.indexOf('发球机') >= 0)) return '发球机'
      return '网球'
    },
    isPureTennisCourt(court) {
      if (!court || typeof court !== 'object') return false
      var v = court.pureTennis != null ? court.pureTennis : court.pure_tennis
      return v === true || v === 1 || v === '1'
    },
    isMachineOnlyCard(card) {
      var typ = String((card && card.type) || '')
      if (typ === 'coach') return false
      var allowed = this.resolveCardCourtTypes(card)
      if (!allowed.length) return false
      return allowed.length === 1 && allowed[0] === '发球机'
    },
    hasMachineOnlyCards() {
      var list = this.myCards || []
      for (var i = 0; i < list.length; i++) {
        if (this.isMachineOnlyCard(list[i])) return true
      }
      return false
    },
    lookupCurrentCourt() {
      var court = this.activeCourt || { name: this.currentCourtName, type: '' }
      var lists = [this.courtConfig || [], this.courtList || []]
      if ((!court || !court.name || (court.pureTennis == null && court.pure_tennis == null) || !court.type) && this.currentCourtName) {
        for (var a = 0; a < lists.length; a++) {
          var list = lists[a]
          for (var i = 0; i < list.length; i++) {
            if (list[i].name === this.currentCourtName) {
              court = Object.assign({}, court || {}, list[i])
              break
            }
          }
        }
        if (!court || !court.name) court = { name: this.currentCourtName, type: '' }
      }
      return court
    },
    cardAllowsCurrentCourt(card) {
      var court = this.lookupCurrentCourt()
      if (this.isPureTennisCourt(court) && this.isMachineOnlyCard(card)) return false
      var allowed = this.resolveCardCourtTypes(card)
      if (!allowed.length) return true
      if (!court || !court.name) return true
      var courtType = this.inferCourtTypeFromCourt(court)
      var required
      if (courtType === '共用') {
        required = this.sport === 'pickleball' ? ['匹克球'] : ['网球', '发球机']
      } else if (courtType === '发球机' || courtType === '网球') {
        required = ['网球', '发球机']
      } else {
        required = [courtType]
      }
      for (var j = 0; j < required.length; j++) {
        if (allowed.indexOf(required[j]) >= 0) return true
      }
      return false
    },
    isCardUsable(card, dateStr, timeStr) {
      if (!card || card.status !== 'active') return false
      if (card.type === 'group' || card.type === 'coach' || card.type === 'stored' || card.type === '储值') return false
      if (card.validFrom && dateStr < card.validFrom) return false
      if (card.validTo && dateStr > card.validTo) return false
      if (!this.cardAllowsCurrentCourt(card)) return false
      if (card.type === 'times') return (card.remainingTimes || 0) > 0
      if (card.type === 'time') {
        var rule = this.parseCardTimeRule(card) || card.timeRule
        if (!rule || rule.mode === 'unlimited' || rule.mode === 'all') return true
        if (rule.mode === 'dates') {
          var ranges = rule.dateRanges || []
          for (var d = 0; d < ranges.length; d++) {
            var rg = ranges[d] || {}
            if (rg.start && rg.end && dateStr >= rg.start && dateStr <= rg.end) return true
          }
          return false
        }
        var dt = new Date(String(dateStr).replace(/-/g, '/'))
        var weekday = dt.getDay()
        if (weekday === 0) weekday = 7
        var slotStart = (timeStr || '').split('-')[0]
        if (rule.mode === 'rules' && Array.isArray(rule.rules)) {
          for (var i = 0; i < rule.rules.length; i++) {
            var r = rule.rules[i]
            var days = (r.weekdays || []).map(function (n) { return Number(n) })
            if (days.indexOf(weekday) < 0) continue
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
      that.courtConfig = []
      that.courtList = []
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCourts', venueId: venueId },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) return
          that.courtConfig = (result.list || []).map(function (item) {
            return {
              id: item._id,
              name: item.name,
              desc: item.type || '',
              type: item.type || '',
              remark: item.remark || '',
              pureTennis: item.pureTennis === 1 || item.pureTennis === true || item.pure_tennis === 1 || item.pure_tennis === '1' ? 1 : 0
            }
          })
          that.hasPickleball = that.courtConfig.some(function (c) {
            var s = that.courtSport(c)
            return s === 'pickleball' || s === 'both'
          })
          if (!that.hasPickleball && that.sport === 'pickleball') that.sport = 'tennis'
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
          week: i === 0 ? '今天' : ('周' + weeks[d.getDay()]),
          md: m + '.' + dd
        })
      }
      this.dateList = list
      this.currentDate = list[0].date
      this.loadCourtStatus(list[0].date)
    },
    setSport(sport) {
      this.sport = sport
      this.currentCourtName = ''
      this.currentTime = ''
      if (this.currentDate) this.loadCourtStatus(this.currentDate)
    },
    courtSport(court) {
      var typ = String((court && court.type) || '').trim()
      var name = String((court && (court.name || court.court)) || '')
      var remark = String((court && court.remark) || '')
      if (typ === '共用') return 'both'
      if (typ === '匹克球') return 'pickleball'
      if (typ === '网球' || typ === '发球机') return 'tennis'
      var text = typ + name + remark
      var hasShare = text.indexOf('共用') >= 0
      var hasPickle = text.indexOf('匹克') >= 0 || text.indexOf('丁克') >= 0
      var hasTennisish = text.indexOf('网球') >= 0 || text.indexOf('发球机') >= 0
      if (hasShare || (hasPickle && hasTennisish)) return 'both'
      if (hasPickle) return 'pickleball'
      return 'tennis'
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
      if (!venueId || !courtConfig.length) {
        that.courtList = []
        return
      }
      var d = new Date(String(date).replace(/-/g, '/'))
      var weekday = d.getDay()
      if (weekday === 0) weekday = 7
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenueHours', venueId: venueId, weekday: weekday }
      }).then(function (hr) {
        var result = (hr && hr.result) || {}
        var slots = (result.byWeekday && result.byWeekday[weekday]) || result.slots || []
        var availableTimes = (slots.length ? slots : that.allTimes.map(function (x) { return x.time })).map(function (time) {
          var hour = Number(String(time).slice(0, 2))
          return { time: time, short: String(time).slice(0, 5), hour: hour }
        })
        var now = new Date()
        var mm = now.getMonth() + 1
        var dd = now.getDate()
        var today = now.getFullYear() + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd
        var pastMap = {}
        if (date === today) {
          availableTimes.forEach(function (item) {
            var started = item.hour < now.getHours() || (item.hour === now.getHours() && now.getMinutes() > 0)
            if (started) pastMap[item.time] = true
          })
        }
        that._openTimes = availableTimes
        that._pastMap = pastMap
        return wx.cloud.callFunction({
          name: 'userApi',
          data: { action: 'getCourtPrices', venueId: venueId, weekday: weekday }
        })
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
        var sportMap = {}
        ;(result.bookings || []).forEach(function (item) {
          if ((item.status === 'booked' || item.status === 'locked' || item.status === 'pending_pay') && !item.groupClassId) {
            var bkey = that.slotKey(item.court, item.time)
            bookedMap[bkey] = true
            if (String(item.remark || '').indexOf('匹克') >= 0) sportMap[bkey] = '匹克球'
          }
        })
        ;(result.groupClasses || []).forEach(function (g) {
          if (g.status === 'open') groupMap[that.slotKey(g.court, g.time)] = true
        })
        var availableTimes = (that._openTimes || []).filter(function (t) {
          return !(that._pastMap && that._pastMap[t.time])
        })
        if (that.currentTime && that._pastMap && that._pastMap[that.currentTime]) {
          that.currentTime = ''
          that.currentCourtId = ''
          that.currentCourtName = ''
        }
        var courts = courtConfig.filter(function (court) {
          var s = that.courtSport(court)
          return s === 'both' || s === that.sport
        })
        that.courtList = courts.map(function (court) {
          return {
            id: court.id,
            name: court.name,
            desc: court.desc,
            type: court.type || court.desc,
            remark: court.remark || '',
            times: availableTimes.map(function (t) {
              var key = that.slotKey(court.name, t.time)
              var status = 'available'
              var past = !!(that._pastMap && that._pastMap[t.time])
              if (groupMap[key]) status = 'group'
              else if (bookedMap[key]) status = 'full'
              var price = that.lookupPrice(court.name, t.time)
              if (status === 'available' && !price) status = 'noprice'
              return { time: t.time, short: t.short, status: status, past: past, price: price, sportText: sportMap[key] || '' }
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
    onSelectSlot(courtId, courtName, time, status, past) {
      if (past) {
        uni.showToast({ title: '该时段已过，不能预约', icon: 'none' })
        return
      }
      if (status === 'full') {
        uni.showToast({ title: '该时段已被预约', icon: 'none' })
        return
      }
      if (status === 'group') {
        uni.showToast({ title: '该时段为团课，请从团课入口报名', icon: 'none' })
        return
      }
      if (status === 'noprice') {
        uni.showToast({ title: '该时段暂未标价，无法预约', icon: 'none' })
        return
      }
      this.currentCourtId = courtId
      this.currentCourtName = courtName
      this.currentTime = time
    },
    loadNotice() {
      var that = this
      var venueId = uni.getStorageSync('venue_id') || ''
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getNotice', venueId: venueId }
      }).then(function (res) {
        var r = res.result || {}
        that.notice = r.notice || null
        if (that.notice && that.notice.content) {
          that.noticeVisible = true
        } else {
          that.openCardSheet()
        }
      }).catch(function () {
        that.notice = null
        that.openCardSheet()
      })
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
      this.loadNotice()
    },
    confirmNotice() {
      this.noticeVisible = false
      this.openCardSheet()
    },
    openCardSheet() {
      this.selectedCardId = ''
      this.walletBalance = Number(uni.getStorageSync('balance') || 0)
      this.payWay = (this.currentPrice > 0 && this.walletBalance + 0.001 >= this.currentPrice) ? 'balance' : (this.currentPrice > 0 ? 'wx' : 'card')
      this.cardSheetVisible = true
      this.loadMyCards()
      this.loadWallet()
    },
    loadWallet() {
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getWallet',
          userId: uni.getStorageSync('userDocId') || '',
          phone: uni.getStorageSync('phone') || ''
        },
        success: function (res) {
          var r = res.result || {}
          if (!r.ok) return
          that.walletBalance = Number(r.balance) || 0
          uni.setStorageSync('balance', that.walletBalance)
          if (that.cardSheetVisible && that.currentPrice > 0 && that.payWay !== 'card' && that.payWay !== 'wx') {
            if (that.walletBalance + 0.001 >= that.currentPrice) that.payWay = 'balance'
          }
        }
      })
    },
    loadMyCards() {
      var that = this
      that.cardLoading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getMyCards',
          userId: uni.getStorageSync('userDocId') || '',
          phone: uni.getStorageSync('phone') || ''
        },
        success: function (res) { that.myCards = (res.result || {}).list || [] },
        fail: function () { that.myCards = [] },
        complete: function () { that.cardLoading = false }
      })
    },
    pickWxPay() {
      this.payWay = 'wx'
      this.selectedCardId = ''
    },
    pickBalancePay() {
      if (this.walletBalance + 0.001 < this.currentPrice) {
        uni.showToast({ title: '现金余额不足', icon: 'none' })
        return
      }
      this.payWay = 'balance'
      this.selectedCardId = ''
    },
    pickCardPay(id) {
      this.payWay = 'card'
      this.selectedCardId = id
    },
    submitBook() {
      var that = this
      var nickName = uni.getStorageSync('nickName') || ''
      var phone = uni.getStorageSync('phone') || ''
      var userDocId = uni.getStorageSync('userDocId') || ''
      var openid = uni.getStorageSync('openid') || ''
      var sel = null
      if (that.payWay === 'card' && that.selectedCardId) {
        sel = (that.myCards || []).find(function (c) { return c._id === that.selectedCardId })
        if (!sel) {
          uni.showToast({ title: '请重新选择会员卡', icon: 'none' })
          return
        }
      }
      if (that.payWay === 'card' && !sel && !(that.currentPrice > 0)) {
        uni.showToast({ title: '该时段暂未标价，请选择会员卡或更换时段', icon: 'none' })
        return
      }
      that.booking = true
      function doCreate(payNo) {
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
              cardType: sel ? sel.type : '',
              payOrderNo: payNo || '',
              outTradeNo: payNo || '',
              sport: that.sport,
              remark: that.sport === 'pickleball' ? '匹克球' : ''
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
      if (that.payWay === 'balance') {
        if (!(that.currentPrice > 0)) {
          uni.showToast({ title: '该时段暂未标价，无法用余额支付', icon: 'none' })
          that.booking = false
          return
        }
        if (that.walletBalance + 0.001 < that.currentPrice) {
          uni.showToast({ title: '现金余额不足（当前 ¥' + Number(that.walletBalance).toFixed(2) + '）', icon: 'none' })
          that.booking = false
          return
        }
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
              payWay: 'balance',
              sport: that.sport,
              remark: that.sport === 'pickleball' ? '匹克球' : ''
            }
          }
        }).then(function (r) {
          var result = r.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '预约失败', icon: 'none' })
            return
          }
          var left = that.walletBalance - that.currentPrice
          if (left < 0) left = 0
          that.walletBalance = Math.round(left * 100) / 100
          uni.setStorageSync('balance', that.walletBalance)
          uni.showToast({ title: '预约成功', icon: 'success' })
          that.cardSheetVisible = false
          that.currentTime = ''
          that.loadCourtStatus(that.currentDate)
        }).catch(function () {
          uni.showToast({ title: '预约失败', icon: 'none' })
        }).finally(function () {
          that.booking = false
        })
        return
      }
      if (that.payWay !== 'card') {
        that.payWay = 'wx'
        if (!(that.currentPrice > 0)) {
          uni.showToast({ title: '请选择会员卡', icon: 'none' })
          that.booking = false
          return
        }
        if (!openid) {
          uni.showToast({ title: '登录信息不完整，请重新登录', icon: 'none' })
          that.booking = false
          return
        }
        wx.cloud.callFunction({
          name: 'pay',
          data: {
            action: 'createCourtPay',
            venueId: uni.getStorageSync('venue_id') || '',
            venueName: uni.getStorageSync('venue_name') || '',
            court: that.currentCourtName,
            date: that.currentDate,
            time: that.currentTime,
            amount: that.currentPrice,
            openid: openid,
            userId: userDocId,
            userName: nickName,
            phone: phone,
            sport: that.sport
          }
        }).then(function (r) {
          var result = r.result || {}
          if (!result.ok || !result.payParams) {
            uni.showToast({ title: result.msg || '下单失败', icon: 'none' })
            that.booking = false
            return
          }
          var p = result.payParams
          var tradeNo = result.outTradeNo || ''
          uni.requestPayment({
            timeStamp: p.timeStamp,
            nonceStr: p.nonceStr,
            package: p.package,
            signType: p.signType,
            paySign: p.paySign,
            success: function () {
              // 订场只在 payNotify/confirmCourtPay 落 booked，不再单独 createBooking
              function pollConfirm(left) {
                wx.cloud.callFunction({
                  name: 'pay',
                  data: { action: 'confirmCourtPay', outTradeNo: tradeNo }
                }).then(function (cr) {
                  var c = (cr && cr.result) || {}
                  if (c.ok) {
                    uni.showToast({ title: '预约成功', icon: 'success' })
                    that.cardSheetVisible = false
                    that.currentTime = ''
                    that.loadCourtStatus(that.currentDate)
                    that.booking = false
                    return
                  }
                  if (c.waiting && left > 0) {
                    setTimeout(function () { pollConfirm(left - 1) }, 1000)
                    return
                  }
                  uni.showToast({ title: '支付成功，预约确认中', icon: 'none' })
                  that.cardSheetVisible = false
                  that.currentTime = ''
                  that.loadCourtStatus(that.currentDate)
                  that.booking = false
                }).catch(function () {
                  if (left > 0) {
                    setTimeout(function () { pollConfirm(left - 1) }, 1000)
                  } else {
                    uni.showToast({ title: '支付成功，请稍后在我的预约查看', icon: 'none' })
                    that.cardSheetVisible = false
                    that.loadCourtStatus(that.currentDate)
                    that.booking = false
                  }
                })
              }
              pollConfirm(8)
            },
            fail: function () {
              if (tradeNo) {
                wx.cloud.callFunction({
                  name: 'pay',
                  data: { action: 'cancelCourtPay', outTradeNo: tradeNo }
                })
              }
              uni.showToast({ title: '已取消支付', icon: 'none' })
              that.booking = false
              that.loadCourtStatus(that.currentDate)
            }
          })
        }).catch(function () {
          uni.showToast({ title: '下单失败', icon: 'none' })
          that.booking = false
        })
        return
      }
      doCreate('')
    }
  }
}
</script>
<style>
.notice-box { background: #fff8e6; border-radius: 12rpx; padding: 20rpx; margin: 16rpx 0; }
.notice-title { font-size: 28rpx; font-weight: 700; color: #333; margin-bottom: 8rpx; }
.notice-content { font-size: 24rpx; color: #666; white-space: pre-wrap; line-height: 1.6; }
.notice-agree { display: flex; align-items: center; margin-top: 16rpx; font-size: 24rpx; color: #333; }
.notice-check { width: 32rpx; height: 32rpx; border: 2rpx solid #ccc; border-radius: 6rpx; margin-right: 12rpx; display: flex; align-items: center; justify-content: center; font-size: 22rpx; color: #fff; }
.notice-check.on { background: #1a5c3a; border-color: #1a5c3a; }

.root { min-height: 100vh; background: #f3f1ec; }
.page {
  min-height: 100vh;
  background: #f3f1ec;
  padding-bottom: calc(240rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.top { padding: 28rpx 28rpx 12rpx; display: flex; justify-content: space-between; align-items: flex-start; }
.hello { font-size: 36rpx; font-weight: 700; color: #1e4870; }
.venue { font-size: 24rpx; color: #8a8680; margin-top: 6rpx; }
.sw { font-size: 24rpx; color: #1e4870; font-weight: 600; }
.tabs { margin: 12rpx 28rpx 8rpx; display: flex; background: #e8e4dc; border-radius: 12rpx; overflow: hidden; }
.tab { flex: 1; text-align: center; padding: 18rpx 0; font-size: 28rpx; color: #6b6760; }
.tab.on { background: #fff; color: #1e4870; font-weight: 700; }
.dates { white-space: nowrap; padding: 8rpx 24rpx 18rpx; }
.date { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 112rpx; height: 120rpx; margin-right: 16rpx; background: transparent; border-radius: 18rpx; color: #222; }
.date.on { background: #18a058; color: #fff; }
.d-md { font-size: 30rpx; font-weight: 700; }
.d-wk { font-size: 22rpx; margin-top: 6rpx; }
.venue-tip { margin: 0 28rpx 18rpx; color: #b0b4b8; font-size: 24rpx; }
.grid-wrap { white-space: nowrap; height: calc(100vh - 420rpx); padding-bottom: 40rpx; }
.grid { display: inline-flex; padding: 0 20rpx 24rpx; }
.col { width: 176rpx; margin-right: 16rpx; }
.col-h { text-align: center; font-size: 30rpx; color: #222; font-weight: 600; margin-bottom: 16rpx; }
.cell { background: #fff; border-radius: 18rpx; height: 148rpx; margin-bottom: 16rpx; box-sizing: border-box; border: 2rpx solid #eee; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4rpx 12rpx rgba(0,0,0,.03); }
.cell.full, .cell.group { background: #f5f6f7; border-color: #f5f6f7; box-shadow: none; }
.cell.pick { border-color: #18a058; background: #f3fbf6; }
.yen { color: #222; font-size: 30rpx; font-weight: 700; }
.sold { color: #9aa0a6; font-size: 26rpx; }
.tm { color: #9aa0a6; font-size: 20rpx; margin-top: 10rpx; }
.board {
  display: flex;
  height: calc(100vh - 520rpx);
  margin: 0 16rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.left { width: 176rpx; background: #f7f5f1; }
.left-lab { padding: 20rpx 16rpx 8rpx; font-size: 22rpx; color: #8a8680; }
.l-item { padding: 26rpx 16rpx; font-size: 26rpx; color: #5c5852; }
.l-item.on { background: #1e4870; color: #fff; font-weight: 700; }
.right { flex: 1; height: 100%; padding: 12rpx; box-sizing: border-box; }
.slot { display: flex; justify-content: space-between; align-items: center; background: #f3f1ec; padding: 22rpx 18rpx; margin-bottom: 10rpx; border-radius: 10rpx; font-size: 26rpx; color: #1e4870; }
.slot.off { color: #b3aea6; }
.slot.sel { background: #e8eef5; outline: 2rpx solid #1e4870; }
.st { font-size: 22rpx; color: #b3aea6; }
.st.pink { color: #b85c4a; }
.price { font-size: 26rpx; color: #b87333; font-weight: 600; }
.empty { text-align: center; color: #8a8680; padding: 60rpx 20rpx; }
.bar {
  position: fixed;
  left: 0; right: 0;
  bottom: calc(118rpx + env(safe-area-inset-bottom));
  background: #fff;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -8rpx 24rpx rgba(44,44,44,.06);
  z-index: 80;
}
.sum { font-size: 34rpx; font-weight: 700; color: #1e4870; }
.picked { font-size: 22rpx; color: #8a8680; margin-top: 4rpx; }
.ok { margin: 0 0 0 auto; width: 280rpx; height: 84rpx; line-height: 84rpx; background: #18a058 !important; color: #fff !important; font-size: 32rpx; border-radius: 12rpx; }
.ok[disabled] { background: #d8d4cc !important; color: #9a968f !important; }
.mask { position: fixed; inset: 0; background: rgba(44,44,44,.4); z-index: 20000; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 32rpx 28rpx 48rpx; max-height: 75vh; overflow-y: auto; }
.sheet-title { text-align: center; font-size: 32rpx; font-weight: 700; }
.sheet-sub { text-align: center; color: #8a8680; font-size: 24rpx; margin: 10rpx 0 8rpx; }
.sheet-price { text-align: center; color: #b87333; font-weight: 600; margin-bottom: 16rpx; }
.card-option { border: 2rpx solid #ece8e1; border-radius: 12rpx; padding: 22rpx; margin-bottom: 12rpx; }
.card-option.on { border-color: #1e4870; background: #e8eef5; }
.card-option.off { opacity: 0.45; }
.co-name { font-size: 28rpx; font-weight: 600; }
.co-meta { font-size: 24rpx; color: #1e4870; margin-top: 6rpx; }
.sheet-empty { text-align: center; color: #8a8680; padding: 16rpx 0; }
.sheet-btn { margin-top: 8rpx; background: #1e4870 !important; color: #fff !important; border-radius: 12rpx; }
.sheet-cancel { text-align: center; color: #8a8680; margin-top: 18rpx; padding: 10rpx; }
.col-type{font-size:20rpx;font-weight:400;opacity:.75}
</style>
