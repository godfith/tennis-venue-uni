<template>
  <view class="page">
    <view class="header">
      <view class="header-row">
        <view class="title">团课报名</view>
        <view class="cal-btn" @tap="openCal">
          <text class="cal-ico">📅</text>
          <text class="cal-txt">月历</text>
        </view>
      </view>
    </view>

    <scroll-view class="date-scroll" scroll-x="true" :scroll-into-view="scrollTo" enable-flex>
      <view
        v-for="(item, index) in dateList"
        :key="item.date"
        :id="'d' + item.date"
        class="date-item"
        :class="{ active: currentDate === item.date }"
        :data-date="item.date"
        @tap="onDateTap"
      >
        <view class="day">{{ item.dayNum }}</view>
        <view class="week">{{ item.week }}</view>
      </view>
    </scroll-view>

    <view class="filters">
      <view class="chip" :class="{ on: !nameFilter }" data-val="" @tap="onNameChip">课程</view>
      <scroll-view class="chip-scroll" scroll-x="true">
        <view
          class="chip"
          :class="{ on: nameFilter === n }"
          v-for="n in classNames"
          :key="'n' + n"
          :data-val="n"
          @tap="onNameChip"
        >{{ n }}</view>
      </scroll-view>
    </view>
    <view class="filters">
      <view class="chip" :class="{ on: !venueFilter }" data-val="" @tap="onVenueChip">全部</view>
      <scroll-view class="chip-scroll" scroll-x="true">
        <view
          class="chip"
          :class="{ on: venueFilter === String(v.venueId) }"
          v-for="v in venueList"
          :key="'v' + v.venueId"
          :data-val="v.venueId"
          @tap="onVenueChip"
        >{{ v.name }}</view>
      </scroll-view>
    </view>
    <view class="filters">
      <view class="chip" :class="{ on: timeFilter === '' }" data-val="" @tap="onTimeChip">时间</view>
      <view class="chip" :class="{ on: timeFilter === 'morning' }" data-val="morning" @tap="onTimeChip">上午</view>
      <view class="chip" :class="{ on: timeFilter === 'afternoon' }" data-val="afternoon" @tap="onTimeChip">下午</view>
      <view class="chip" :class="{ on: timeFilter === 'evening' }" data-val="evening" @tap="onTimeChip">晚上</view>
    </view>
    <view class="filters">
      <view class="chip" :class="{ on: typeFilter === '' }" data-val="" @tap="onTypeChip">全部类型</view>
      <view class="chip" :class="{ on: typeFilter === 'fixed' }" data-val="fixed" @tap="onTypeChip">固定团课</view>
      <view class="chip" :class="{ on: typeFilter === 'self' }" data-val="self" @tap="onTypeChip">自组团课</view>
    </view>

    <view v-if="loading" class="tip">加载中...</view>
    <view v-else-if="filteredList.length === 0" class="tip">当天暂无团课</view>

    <view v-else class="list">
      <view v-for="(item, index) in filteredList" :key="item._id || index" class="card">
        <view class="avatar" :style="avatarStyle(item)">
          <image v-if="item.coachAvatar" class="avatar-img" :src="item.coachAvatar" mode="aspectFill" />
          <text v-else>{{ letterOf(item) }}</text>
        </view>
        <view class="mid">
          <view class="name">{{ item.name }}</view>
          <view v-if="item.theme" class="theme">{{ item.theme }}</view>
          <view class="time">{{ item.time }}</view>
          <view class="tags">
            <text class="tag">{{ classTypeLabel(item) }}</text>
            <text v-if="item.court" class="tag">{{ item.court }}</text>
            <text v-if="item.coachName" class="tag">{{ item.coachName }}</text>
            <text class="tag">{{ item.enrolled || 0 }}/{{ item.capacity || 0 }}</text>
            <text v-if="item.venueName" class="tag">{{ item.venueName }}</text>
            <text v-if="isTemp(item)" class="tag warn">临时</text>
          </view>
        </view>
        <view class="right">
          <button
            class="btn"
            :class="{ full: !canEnroll(item) }"
            :disabled="!canEnroll(item)"
            @tap="openEnroll(item)"
          >{{ enrollLabel(item) }}</button>
        </view>
      </view>
    </view>

    <view v-if="show" class="mask" @tap="closeSheet">
      <view class="sheet" @tap.stop="stopBubble">
        <view class="sheet-title">确认报名</view>
        <view class="row">{{ current.name }} · {{ current.time }}</view>
        <view class="row">{{ classTypeLabel(current) }}<text v-if="current.theme"> · {{ current.theme }}</text></view>
        <view class="row">{{ current.venueName || '' }} {{ current.court }} · 教练 {{ current.coachName || '-' }}</view>

        <view class="label">选择团课卡</view>
        <view v-if="cards.length === 0" class="err">没有可用团课卡，请联系前台</view>
        <view
          v-for="(c, i) in cards"
          :key="c._id || i"
          class="card-opt"
          :class="{ on: selectedCardId === c._id }"
          @tap="selectCard(c._id)"
        >
          <view>{{ c.cardName }}（剩{{ c.remainingTimes }}次）</view>
          <view v-if="c.venueName" class="card-store">发卡门店：{{ c.venueName }}</view>
        </view>

        <button class="confirm" :loading="saving" @tap="submit">确认报名并扣次</button>
        <button class="cancel" @tap="closeSheet">取消</button>
      </view>
    </view>

    <view class="mask mask-center" v-if="calOpen" @tap="closeCal">
      <view class="cal-pop" @tap.stop="stopBubble">
        <view class="cal-head">
          <view class="cal-nav" @tap="prevMonth">‹</view>
          <view class="cal-title">{{ calYear }}年{{ calMonth }}月</view>
          <view class="cal-nav" @tap="nextMonth">›</view>
          <view class="cal-close" @tap="closeCal">×</view>
        </view>
        <view class="cal-weeks">
          <view class="cal-w" v-for="w in weekLabels" :key="w">{{ w }}</view>
        </view>
        <view class="cal-grid">
          <view
            v-for="(d, i) in calDays"
            :key="i"
            :class="'cal-d ' + (d.date === currentDate ? 'on' : '') + (d.inMonth ? '' : ' out')"
            :data-date="d.date"
            :data-ok="d.inMonth ? 1 : 0"
            @tap="onCalDayTap"
          >
            <text>{{ d.day }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      dateList: [],
      currentDate: '',
      scrollTo: '',
      list: [],
      loading: false,
      show: false,
      current: {},
      cards: [],
      selectedCardId: '',
      saving: false,
      venueList: [],
      venueFilter: '',
      nameFilter: '',
      timeFilter: '',
      typeFilter: '',
      calOpen: false,
      calYear: 2026,
      calMonth: 1,
      calDays: [],
      weekLabels: ['日', '一', '二', '三', '四', '五', '六'],
      pendingClassId: '',
      pendingOpen: false
    }
  },
  computed: {
    classNames() {
      var map = {}
      var arr = []
      ;(this.list || []).forEach(function (g) {
        var n = g.name || ''
        if (n && !map[n]) {
          map[n] = true
          arr.push(n)
        }
      })
      return arr
    },
    filteredList() {
      var that = this
      return (this.list || []).filter(function (g) {
        if (g.status && g.status !== 'open') return false
        if (that.venueFilter && String(g.venueId) !== String(that.venueFilter)) return false
        if (that.nameFilter && g.name !== that.nameFilter) return false
        if (that.timeFilter) {
          var hour = Number(String(g.time || '').slice(0, 2))
          if (that.timeFilter === 'morning' && !(hour < 12)) return false
          if (that.timeFilter === 'afternoon' && !(hour >= 12 && hour < 18)) return false
          if (that.timeFilter === 'evening' && !(hour >= 18)) return false
        }
        if (that.typeFilter) {
          var typ = that.normClassType(g)
          if (typ !== that.typeFilter) return false
        }
        return true
      })
    }
  },
  onLoad(options) {
    options = options || {}
    this.pendingClassId = options.classId || options.classid || ''
    if (options.date) {
      this.currentDate = String(options.date).slice(0, 10)
    }
    if (this.pendingClassId) this.pendingOpen = true
  },
  onShow() {
    this.loadVenues()
    this.initDates()
    this.loadList()
  },
  methods: {
    isFull(item) {
      return Number(item.enrolled || 0) >= Number(item.capacity || 0)
    },
    isTemp(item) {
      return Number(item.enrolled || 0) > Number(item.capacity || 0)
    },
    normClassType(item) {
      var s = String((item && (item.classType || item.class_type)) || '').toLowerCase()
      if (s === 'self' || s === 'self_organized' || s === 'self-organized' || s === '自组' || s === '自组团课') return 'self'
      return 'fixed'
    },
    classTypeLabel(item) {
      if (item && item.classTypeLabel) return item.classTypeLabel
      return this.normClassType(item) === 'self' ? '自组团课' : '固定团课'
    },
    canEnroll(item) {
      if (!item) return false
      if (item.status && item.status !== 'open') return false
      if (item.past) return false
      if (this.isFull(item)) return false
      if (item.enrollOpen === false) return false
      return true
    },
    enrollLabel(item) {
      if (item && item.status === 'cancelled') return '已取消'
      if (item && item.past) return '已结束'
      if (this.isFull(item)) return '已满'
      if (item && item.enrollOpen === false) {
        var reason = item.enrollClosedReason || ''
        if (reason.indexOf('提前') >= 0) {
          var m = reason.match(/提前(\d+)天/)
          return m ? ('需提前' + m[1] + '天') : '需提前报名'
        }
        return reason ? reason : '暂不可报'
      }
      return '预约'
    },
    letterOf(item) {
      var s = (item && (item.coachName || item.name)) || '课'
      return String(s).slice(0, 1)
    },
    avatarStyle(item) {
      return item && item.coachAvatar ? '' : ''
    },
    stopBubble() {},
    datasetVal(e) {
      var ds = (e && e.currentTarget && e.currentTarget.dataset) || {}
      return ds.val == null ? '' : String(ds.val)
    },
    onDateTap(e) {
      var date = ((e && e.currentTarget && e.currentTarget.dataset) || {}).date
      if (date) this.onSelectDate(date)
    },
    onNameChip(e) {
      this.setNameFilter(this.datasetVal(e))
    },
    onVenueChip(e) {
      this.setVenueFilter(this.datasetVal(e))
    },
    onTimeChip(e) {
      this.setTimeFilter(this.datasetVal(e))
    },
    onTypeChip(e) {
      this.setTypeFilter(this.datasetVal(e))
    },
    setTypeFilter(val) {
      this.typeFilter = val || ''
    },
    closeCal() {
      this.calOpen = false
    },
    prevMonth() {
      this.changeMonth(-1)
    },
    nextMonth() {
      this.changeMonth(1)
    },
    onCalDayTap(e) {
      var ds = (e && e.currentTarget && e.currentTarget.dataset) || {}
      if (String(ds.ok) === '1' && ds.date) this.onCalPick(ds.date)
    },
    closeSheet() {
      this.show = false
    },
    selectCard(id) {
      this.selectedCardId = id
    },
    fmtDate(d) {
      var m = d.getMonth() + 1
      var day = d.getDate()
      return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day
    },
    weekLabel(d, todayStr) {
      var ds = this.fmtDate(d)
      if (ds === todayStr) return '今'
      var t = new Date(todayStr.replace(/-/g, '/'))
      t.setDate(t.getDate() + 1)
      if (ds === this.fmtDate(t)) return '明'
      return this.weekLabels[d.getDay()]
    },
    buildDateList(center) {
      var today = new Date()
      today.setHours(0, 0, 0, 0)
      var todayStr = this.fmtDate(today)
      var start = new Date(today.getTime())
      start.setDate(start.getDate() - 1)
      var list = []
      for (var i = 0; i < 21; i++) {
        var d = new Date(start.getTime())
        d.setDate(start.getDate() + i)
        list.push({
          date: this.fmtDate(d),
          week: this.weekLabel(d, todayStr),
          dayNum: d.getDate()
        })
      }
      if (center) {
        var has = list.some(function (x) { return x.date === center })
        if (!has) {
          var c = new Date(String(center).replace(/-/g, '/'))
          var around = []
          for (var j = -3; j < 18; j++) {
            var d2 = new Date(c.getTime())
            d2.setDate(c.getDate() + j)
            around.push({
              date: this.fmtDate(d2),
              week: this.weekLabel(d2, todayStr),
              dayNum: d2.getDate()
            })
          }
          list = around
        }
      }
      this.dateList = list
    },
    initDates() {
      if (!this.currentDate) {
        this.currentDate = this.fmtDate(new Date())
      }
      this.buildDateList(this.currentDate)
      this.$nextTick(() => {
        this.scrollTo = 'd' + this.currentDate
      })
    },
    onSelectDate(date) {
      this.currentDate = date
      this.nameFilter = ''
      this.loadList()
    },
    setNameFilter(n) {
      this.nameFilter = this.nameFilter === n ? '' : n
    },
    setVenueFilter(id) {
      this.venueFilter = this.venueFilter === id ? '' : id
    },
    setTimeFilter(t) {
      this.timeFilter = this.timeFilter === t ? '' : t
    },
    openCal() {
      var d = this.currentDate ? new Date(this.currentDate.replace(/-/g, '/')) : new Date()
      this.calYear = d.getFullYear()
      this.calMonth = d.getMonth() + 1
      this.buildDays()
      this.calOpen = true
    },
    changeMonth(delta) {
      var m = this.calMonth + delta
      var y = this.calYear
      if (m < 1) { m = 12; y -= 1 }
      if (m > 12) { m = 1; y += 1 }
      this.calMonth = m
      this.calYear = y
      this.buildDays()
    },
    buildDays() {
      var y = this.calYear
      var m = this.calMonth
      var first = new Date(y, m - 1, 1)
      var startWeek = first.getDay()
      var daysIn = new Date(y, m, 0).getDate()
      var arr = []
      for (var i = 0; i < startWeek; i++) {
        arr.push({ day: '', date: '', inMonth: false })
      }
      for (var d = 1; d <= daysIn; d++) {
        var mm = m < 10 ? '0' + m : '' + m
        var dd = d < 10 ? '0' + d : '' + d
        arr.push({ day: d, date: y + '-' + mm + '-' + dd, inMonth: true })
      }
      this.calDays = arr
    },
    onCalPick(date) {
      this.calOpen = false
      this.currentDate = date
      this.buildDateList(date)
      this.nameFilter = ''
      this.$nextTick(() => {
        this.scrollTo = 'd' + date
      })
      this.loadList()
    },
    loadVenues() {
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenues', includeShell: true, purpose: 'group' },
        success: function (res) {
          var result = res.result || {}
          that.venueList = (result.list || []).map(function (v) {
            return { venueId: String(v.venueId || v._id || v.id || ''), name: v.name || '' }
          })
        }
      })
    },
    loadList() {
      var that = this
      that.loading = true
      var data = {
        action: 'getGroupClasses',
        date: that.currentDate,
        hidePast: true
      }
      if (that.pendingClassId) data.classId = that.pendingClassId
      wx.cloud.callFunction({
        name: 'userApi',
        data: data,
        success: function (res) {
          var result = res.result || {}
          var arr = result.list || []
          that.list = arr
          if (that.pendingOpen && that.pendingClassId) {
            var found = arr.filter(function (g) {
              return String(g._id) === String(that.pendingClassId)
            })[0]
            that.pendingOpen = false
            if (found) {
              if (found.date && found.date !== that.currentDate) {
                that.currentDate = found.date
                that.buildDateList(found.date)
              }
              that.$nextTick(function () {
                that.scrollTo = 'd' + (found.date || that.currentDate)
              })
              if (that.canEnroll(found)) {
                that.openEnroll(found)
              } else {
                var msg = that.enrollLabel(found)
                uni.showToast({ title: msg === '预约' ? '无法报名' : '该课程' + msg, icon: 'none' })
              }
            } else {
              uni.showToast({ title: '未找到该团课', icon: 'none' })
            }
          }
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
      if (!this.canEnroll(item)) {
        uni.showToast({ title: '该课程' + this.enrollLabel(item), icon: 'none' })
        return
      }
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
          var mine = Number(result.mySeats || 0)
          var deducted = Number(result.deducted || result.seats || 1) || 1
          var toast = '报名成功'
          if (mine > 1) toast = '已再扣' + deducted + '节，占' + mine + '个名额'
          uni.showToast({ title: toast, icon: 'none', duration: 2500 })
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
  background: #f4f2ee;
  padding-bottom: 40rpx;
}
.header {
  background: #fff;
  padding: 24rpx 30rpx 12rpx;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #222;
}
.cal-btn {
  display: flex;
  align-items: center;
  background: #1a5c3a;
  border-radius: 24rpx;
  padding: 8rpx 20rpx;
}
.cal-ico { font-size: 26rpx; margin-right: 6rpx; }
.cal-txt { font-size: 24rpx; color: #fff; font-weight: 600; }
.date-scroll {
  background: #fff;
  padding: 10rpx 20rpx 24rpx;
  white-space: nowrap;
  width: 100%;
}
.date-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110rpx;
  height: 120rpx;
  margin-right: 16rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  color: #333;
}
.date-item.active {
  background: #1a5c3a;
  color: #fff;
}
.week { font-size: 22rpx; opacity: 0.8; }
.day { font-size: 36rpx; font-weight: 700; margin-bottom: 4rpx; }
.filters {
  display: flex;
  align-items: center;
  padding: 8rpx 24rpx 0;
  gap: 12rpx;
}
.chip-scroll {
  flex: 1;
  white-space: nowrap;
  height: 64rpx;
}
.chip {
  display: inline-flex;
  align-items: center;
  height: 52rpx;
  padding: 0 22rpx;
  margin-right: 12rpx;
  border-radius: 26rpx;
  background: #fff;
  color: #333;
  font-size: 24rpx;
  flex-shrink: 0;
}
.chip.on {
  background: #1a5c3a;
  color: #fff;
  font-weight: 600;
}
.tip {
  text-align: center;
  color: #999;
  padding: 80rpx 0;
  font-size: 28rpx;
}
.list { padding: 20rpx 24rpx 40rpx; }
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}
.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #e8f0eb;
  color: #1a5c3a;
  font-size: 32rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20rpx;
}
.avatar-img { width: 88rpx; height: 88rpx; }
.mid { flex: 1; min-width: 0; }
.name { font-size: 30rpx; font-weight: 700; color: #222; }
.time { font-size: 26rpx; color: #1a5c3a; margin-top: 6rpx; font-weight: 600; }
.tags { margin-top: 8rpx; }
.tag {
  display: inline-block;
  font-size: 20rpx;
  color: #666;
  background: #f4f2ee;
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
  margin-right: 8rpx;
  margin-top: 4rpx;
}
.tag.warn { background: #fff4e0; color: #c47b14; }
.right { margin-left: 12rpx; flex-shrink: 0; }
.btn {
  background: #1a5c3a !important;
  color: #fff !important;
  border-radius: 12rpx;
  font-size: 26rpx;
  line-height: 64rpx;
  height: 64rpx;
  padding: 0 28rpx;
  margin: 0;
}
.btn.full {
  background: #ccc !important;
  color: #fff !important;
}
.mask {
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 36rpx 30rpx 50rpx;
  box-sizing: border-box;
}
.sheet-title { font-size: 32rpx; font-weight: 700; margin-bottom: 16rpx; }
.row { font-size: 26rpx; color: #666; margin-top: 8rpx; }
.label { margin-top: 24rpx; margin-bottom: 12rpx; font-size: 28rpx; font-weight: 600; }
.err { color: #f56c6c; font-size: 26rpx; }
.card-opt {
  padding: 22rpx 24rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  font-size: 28rpx;
}
.card-opt.on {
  border-color: #1a5c3a;
  background: #f0f6f2;
  color: #1a5c3a;
}
.card-store { font-size: 22rpx; color: #888; margin-top: 6rpx; }
.confirm {
  margin-top: 24rpx;
  background: #1a5c3a !important;
  color: #fff !important;
  border-radius: 12rpx;
}
.cancel {
  margin-top: 16rpx;
  background: #f5f5f5 !important;
  color: #666 !important;
  border-radius: 12rpx;
}
.mask-center { align-items: center; }
.cal-pop {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  width: 640rpx;
}
.cal-head { display: flex; align-items: center; margin-bottom: 16rpx; }
.cal-title { flex: 1; text-align: center; font-size: 32rpx; font-weight: 600; }
.cal-nav, .cal-close {
  width: 56rpx; height: 56rpx;
  text-align: center; line-height: 56rpx;
  font-size: 36rpx; color: #1a5c3a;
}
.cal-weeks, .cal-grid { display: flex; flex-wrap: wrap; }
.cal-w, .cal-d { width: 14.28%; text-align: center; font-size: 24rpx; }
.cal-w { color: #999; padding: 8rpx 0; }
.cal-d { height: 80rpx; color: #333; padding-top: 20rpx; }
.cal-d.out { color: #ccc; }
.cal-d.on { background: #1a5c3a; color: #fff; border-radius: 8rpx; }
</style>
