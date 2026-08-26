<template>
  <view>
    <view class="page" v-if="coach">
      <view class="header-card">
        <image class="avatar" :src="coach.avatar || '/static/images/avatar.png'" mode="aspectFill"></image>
        <view class="name">{{ coach.name }}</view>
        <view class="title">{{ coach.title || '教练' }}</view>
        <view class="tags" v-if="coach.tags && coach.tags.length">
          <text class="tag" v-for="(item, index) in coach.tags" :key="index">{{ item }}</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">教练介绍</view>
        <view class="desc">{{ coach.desc || coach.remark || '暂无详细介绍' }}</view>
      </view>

      <view class="section">
        <view class="section-title">1. 选择上课时间</view>
        <scroll-view scroll-x class="date-list" enable-flex>
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

        <view class="time-list">
          <view
            v-for="(item, index) in timeList"
            :key="index"
            :class="'time-item ' + (item.status === 'full' ? 'full' : '') + ' ' + (currentTime === item.time ? 'active' : '')"
            @tap="onSelectTime(item.time, item.status)"
          >
            {{ item.time }}
            <text v-if="item.status === 'full'" class="status-text">已满</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="currentTime">
        <view class="section-title">2. 选择场地</view>
        <view class="court-list" v-if="availableCourts.length > 0">
          <view
            v-for="(item, index) in availableCourts"
            :key="index"
            :class="'court-item ' + (currentCourt === item ? 'active' : '')"
            @tap="onSelectCourt(item)"
          >{{ item }}</view>
        </view>
        <view class="no-court" v-else>该时间段暂无空闲场地</view>
      </view>

      <view class="bottom-bar">
        <view class="selected-info" v-if="currentDate && currentTime && currentCourt">
          {{ currentDate }} {{ currentTime }} · {{ currentCourt }}
        </view>
        <button
          class="book-btn"
          :disabled="!currentDate || !currentTime || !currentCourt || booking"
          :loading="booking"
          @tap="onBook"
        >立即预约</button>
      </view>
    </view>

    <view class="loading" v-else>加载中...</view>

    <view class="mask" v-if="cardSheetVisible" @tap="cardSheetVisible = false">
      <view class="sheet" @tap.stop="">
        <view class="sheet-title">选择支付方式</view>
        <view class="sheet-sub">
          {{ coach.name }} · {{ pending.date }} {{ pending.time }} · {{ pending.court }}
        </view>

        <view class="card-option" :class="selectedCardId === '' ? 'on' : ''" @tap="selectedCardId = ''">
          <view class="co-name">不使用卡（到店支付）</view>
          <view class="co-meta">现场结算课时费</view>
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

        <view v-if="!cardLoading && usableCards.length === 0" class="sheet-empty">
          暂无可用教练卡，可选择到店支付
        </view>

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
    venueId() {
      return uni.getStorageSync('venue_id') || ''
    },
    cardMeta(c) {
      return '教练卡 · 剩' + (c.remainingTimes || 0) + '次'
    },
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
        fail: function (err) {
          console.error(err)
          uni.showToast({ title: '加载失败', icon: 'none' })
        }
      })
    },
    loadCourts() {
      var that = this
      var venueId = that.venueId()
      if (!venueId) {
        uni.showToast({ title: '请先选择场馆', icon: 'none' })
        that.initDateList()
        return
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCourts', venueId: venueId },
        success: function (res) {
          var result = res.result || {}
          that.courtList = (result.list || []).map(function (item) {
            return item.name
          })
          that.initDateList()
        },
        fail: function (err) {
          console.error(err)
          that.initDateList()
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
        that.timeList = availableTimes.map(function (t) {
          return { time: t, status: 'available' }
        })
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
            if (b.coachId && String(b.coachId) === String(that.coachId)) {
              coachBusy[b.time] = true
            }
            if (!courtUsed[b.time]) courtUsed[b.time] = []
            if (b.court) courtUsed[b.time].push(b.court)
          })
          groups.forEach(function (g) {
            if (g.status !== 'open') return
            if (g.coachId && String(g.coachId) === String(that.coachId)) {
              coachBusy[g.time] = true
            }
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
        fail: function (err) {
          console.error(err)
          that.timeList = availableTimes.map(function (t) {
            return { time: t, status: 'available' }
          })
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
      this.availableCourts = (this.courtList || []).filter(function (c) {
        return !used[c]
      })
    },
    onSelectCourt(court) {
      this.currentCourt = court
    },
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
      this.pending = {
        date: this.currentDate,
        time: this.currentTime,
        court: this.currentCourt
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
        sel = (that.myCards || []).find(function (c) {
          return c._id === that.selectedCardId
        })
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
        fail: function (err) {
          console.error(err)
          uni.showToast({ title: '预约失败', icon: 'none' })
        },
        complete: function () {
          that.booking = false
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
  padding-bottom: 160rpx;
  box-sizing: border-box;
}
.loading {
  text-align: center;
  padding-top: 200rpx;
  color: #999;
}
.header-card {
  background: linear-gradient(135deg, #1a5c3a, #2d8a5e);
  padding: 50rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}
.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  margin-bottom: 24rpx;
  background: #fff;
}
.name {
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}
.title {
  font-size: 26rpx;
  opacity: 0.9;
  margin-bottom: 20rpx;
}
.tags {
  display: flex;
  gap: 12rpx;
}
.tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}
.section {
  margin: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 24rpx;
}
.desc {
  font-size: 28rpx;
  color: #555;
  line-height: 1.7;
}
.date-list {
  white-space: nowrap;
  margin-bottom: 30rpx;
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
  margin-bottom: 6rpx;
}
.day {
  font-size: 28rpx;
  font-weight: 600;
}
.time-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.time-item {
  width: 200rpx;
  height: 76rpx;
  line-height: 76rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 26rpx;
  position: relative;
}
.time-item.active {
  background: #07c160;
  color: #fff;
}
.time-item.full {
  background: #eee;
  color: #bbb;
}
.status-text {
  position: absolute;
  right: 8rpx;
  top: 4rpx;
  font-size: 18rpx;
  color: #ff4d4f;
  line-height: 1;
}
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}
.selected-info {
  font-size: 26rpx;
  color: #333;
}
.book-btn {
  background: #07c160 !important;
  color: #fff !important;
  border-radius: 40rpx;
  font-size: 30rpx;
  padding: 0 50rpx;
  margin: 0;
  line-height: 80rpx;
}
.book-btn[disabled] {
  background: #ccc !important;
}
.court-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.court-item {
  width: 200rpx;
  height: 76rpx;
  line-height: 76rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
}
.court-item.active {
  background: #07c160;
  color: #fff;
}
.no-court {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  padding: 30rpx 0;
}
.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}
.sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx 30rpx 50rpx;
  box-sizing: border-box;
  max-height: 75vh;
  overflow-y: auto;
}
.sheet-title {
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
}
.sheet-sub {
  text-align: center;
  color: #888;
  font-size: 24rpx;
  margin: 12rpx 0 20rpx;
}
.card-option {
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.card-option.on {
  border-color: #07c160;
  background: #f0f9f4;
}
.co-name {
  font-size: 28rpx;
  color: #222;
  font-weight: 500;
}
.co-meta {
  font-size: 24rpx;
  color: #07c160;
  margin-top: 8rpx;
}
.sheet-empty {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 20rpx 0;
}
.sheet-btn {
  margin-top: 20rpx;
  background: #07c160 !important;
  color: #fff !important;
  border-radius: 40rpx;
  font-size: 30rpx;
}
.sheet-cancel {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  margin-top: 24rpx;
  padding: 12rpx;
}
</style>
