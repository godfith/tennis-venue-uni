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
        @tap="onSelectDate(item.date)"
      >
        <view class="day">{{ item.dayNum }}</view>
        <view class="week">{{ item.week }}</view>
      </view>
    </scroll-view>

    <view class="filters">
      <view class="chip" :class="{ on: !nameFilter }" @tap="clearNameFilter">课程</view>
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
      <view class="chip" :class="{ on: !venueFilter }" @tap="clearVenueFilter">全部</view>
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
      <view class="chip" :class="{ on: timeFilter === '' }" @tap="clearTimeFilter">时间</view>
      <view class="chip" :class="{ on: timeFilter === 'morning' }" data-val="morning" @tap="onTimeChip">上午</view>
      <view class="chip" :class="{ on: timeFilter === 'afternoon' }" data-val="afternoon" @tap="onTimeChip">下午</view>
      <view class="chip" :class="{ on: timeFilter === 'evening' }" data-val="evening" @tap="onTimeChip">晚上</view>
    </view>
    <view class="filters">
      <view class="chip" :class="{ on: typeFilter === '' }" @tap="clearTypeFilter">全部类型</view>
      <view class="chip" :class="{ on: typeFilter === 'fixed' }" data-val="fixed" @tap="onTypeChip">固定团课</view>
      <view class="chip" :class="{ on: typeFilter === 'self' }" data-val="self" @tap="onTypeChip">自组团课</view>
    </view>
    <view class="type-note">固定团课是门店轮流开课，时间不固定；自组团课是灵活开课</view>

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
          <view v-if="item.courseContentName || item.theme" class="theme">{{ item.courseContentName || item.theme }}</view>
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
            :data-id="item._id"
            @tap="onEnrollTap"
          >{{ enrollLabel(item) }}</button>
        </view>
      </view>
    </view>

    <view v-if="show" class="mask" @tap="closeSheet">
      <view class="sheet" @tap.stop="stopBubble">
        <view class="sheet-title">确认报名</view>
        <view class="row">{{ current.name }} · {{ current.time }}</view>
        <view class="row">{{ classTypeLabel(current) }}<text v-if="current.courseContentName || current.theme"> · {{ current.courseContentName || current.theme }}</text></view>
        <view class="row">{{ current.venueName || '' }} {{ current.court }} · 教练 {{ current.coachName || '-' }} · {{ current.enrolled || 0 }}/{{ current.capacity || 0 }}</view>

        <view class="label">选择团课卡</view>
        <view v-if="!boundTemplateIds(current).length && (current.courseContentId || current.courseContentName)" class="err">该课程内容尚未绑定可用团课卡，暂时不能报名</view>
        <view v-else-if="cards.length === 0" class="err">
          没有可用于本节课的团课卡
          <view class="buy-row">
            <button class="buy" @tap="goBuyCard">去商城买卡后报名</button>
          </view>
        </view>
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

    <group-month-cal
      :show="calOpen"
      :selected-date="currentDate"
      @close="closeCal"
      @pickdate="onCalPickDate"
      @openclass="onCalOpenClass"
    />
  </view>
</template>

<script>
import GroupMonthCal from '@/components/group-month-cal.vue'
import { applyIncomingVenue, groupSharePayload, pickVenueFromList } from '@/utils/shareVenue.js'
import { unwrapEvent } from '@/utils/groupMonthCal.js'
export default {
  components: { GroupMonthCal },
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
      weekLabels: ['日', '一', '二', '三', '四', '五', '六'],
      pendingClassId: '',
      pendingOpen: false,
      loadSeq: 0
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
        if (that.currentDate && that.normDay(g.date) !== that.normDay(that.currentDate)) return false
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
    var applied = applyIncomingVenue(options, {})
    if (applied.venueId) {
      this.venueFilter = String(applied.venueId)
    }
  },
  onShareAppMessage() {
    var v = (this.venueList || []).find(function (x) { return String(x.venueId) === String(this.venueFilter) }.bind(this))
    return groupSharePayload({
      venueId: this.venueFilter || '',
      venueName: v ? v.name : '',
      classId: '',
      date: this.currentDate || ''
    })
  },
  onShareTimeline() {
    var msg = this.onShareAppMessage()
    return { title: msg.title }
  },
  onShow() {
    this.loadVenues()
    this.initDates()
    this.loadList()
  },
  methods: {
    isFull(item) {
      if (!item) return false
      return Number(item.enrolled || 0) >= Number(item.capacity || 0)
    },
    isTemp(item) {
      if (!item) return false
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
    boundTemplateIds(item) {
      var raw = (item && (item.boundTemplateIds || item.templateIds)) || []
      return (raw || []).map(function (id) { return String(id) }).filter(Boolean)
    },
    goBuyCard() {
      var q = []
      if (this.currentDate) q.push('date=' + encodeURIComponent(this.currentDate))
      if (this.current && this.current._id) q.push('classId=' + encodeURIComponent(this.current._id))
      var url = '/pages/shop/shop' + (q.length ? '?' + q.join('&') : '')
      uni.switchTab({
        url: '/pages/shop/shop',
        fail: function () { uni.navigateTo({ url: url }) }
      })
      // persist resume because switchTab drops query
      if (this.current && this.current._id) {
        uni.setStorageSync('mall_resume_class_id', this.current._id)
        uni.setStorageSync('mall_resume_date', this.currentDate || this.current.date || '')
      }
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
      if (!item) return '预约'
      if (item.status === 'cancelled') return '已取消'
      if (item.past) return '已结束'
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
      // WeChat may turn empty data-val into true/"true", which previously emptied the list
      if (ds.val == null || ds.val === true || ds.val === 'true' || ds.val === 'all') return ''
      return String(ds.val)
    },
    clearNameFilter() { this.nameFilter = '' },
    clearVenueFilter() { this.venueFilter = '' },
    clearTimeFilter() { this.timeFilter = '' },
    clearTypeFilter() { this.typeFilter = '' },
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
    onCalPickDate(date) {
      var ds = unwrapEvent(date)
      if (ds) this.onCalPick(ds)
    },
    onCalOpenClass(payload) {
      var p = unwrapEvent(payload) || {}
      var date = p.date || ''
      var id = p.id || ''
      this.calOpen = false
      if (date) {
        this.currentDate = date
        this.buildDateList(date)
        this.nameFilter = ''
        this.$nextTick(function () {
          this.scrollTo = 'd' + date
        }.bind(this))
      }
      if (id) {
        this.pendingClassId = id
        this.pendingOpen = true
      }
      this.loadList()
    },
    closeSheet() {
      this.show = false
    },
    selectCard(id) {
      this.selectedCardId = id
    },
    normDay(v) {
      if (!v) return ''
      return String(v).slice(0, 10)
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
      if (!date) return
      this.currentDate = date
      this.nameFilter = ''
      this.pendingClassId = ''
      this.pendingOpen = false
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
      this.calOpen = true
    },
    onCalPick(date) {
      this.currentDate = date
      this.buildDateList(date)
      this.nameFilter = ''
      this.pendingClassId = ''
      this.pendingOpen = false
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
      var wantDate = that.normDay(that.currentDate)
      var wantOpen = that.pendingOpen && that.pendingClassId
      var wantId = wantOpen ? that.pendingClassId : ''
      var seq = that.loadSeq + 1
      that.loadSeq = seq
      that.loading = true
      var data = {
        action: 'getGroupClasses',
        date: wantDate,
        hidePast: true
      }
      if (wantId) data.classId = wantId
      wx.cloud.callFunction({
        name: 'userApi',
        data: data,
        success: function (res) {
          if (seq !== that.loadSeq) return
          var result = res.result || {}
          var arr = result.list || []
          var day = that.normDay(that.currentDate)
          arr = arr.filter(function (g) {
            var gd = that.normDay(g.date)
            if (!day || gd === day) return true
            return !!(wantId && String(g._id) === String(wantId))
          })
          that.list = arr
          if (wantOpen && wantId) {
            var found = arr.filter(function (g) {
              return String(g._id) === String(wantId)
            })[0]
            that.pendingOpen = false
            that.pendingClassId = ''
            if (found) {
              if (found.date && that.normDay(found.date) !== that.normDay(that.currentDate)) {
                that.currentDate = that.normDay(found.date)
                that.buildDateList(that.currentDate)
              }
              that.$nextTick(function () {
                that.scrollTo = 'd' + that.currentDate
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
          if (seq !== that.loadSeq) return
          console.error(err)
          uni.showToast({ title: '加载失败', icon: 'none' })
          that.list = []
        },
        complete: function () {
          if (seq !== that.loadSeq) return
          that.loading = false
        }
      })
    },
    findClassById(id) {
      var want = String(id || '')
      if (!want) return null
      var lists = [this.filteredList || [], this.list || []]
      for (var i = 0; i < lists.length; i++) {
        var hit = lists[i].filter(function (g) {
          return String((g && (g._id || g.id)) || '') === want
        })[0]
        if (hit) return hit
      }
      return null
    },
    resolveClassItem(input) {
      if (!input) return null
      if (input.enrolled != null || input.capacity != null || input.name || input._id || input.id) {
        if (!(input.type === 'tap' || input.currentTarget || input.target || input.mp || input.detail)) {
          return input
        }
      }
      var ev = unwrapEvent(input) || {}
      var ds = (input.currentTarget && input.currentTarget.dataset) || (input.target && input.target.dataset) || {}
      var id = ev._id || ev.id || ev.classId || ds.id || ds.classId || ''
      if (id) return this.findClassById(id)
      if (ev && (ev.enrolled != null || ev.capacity != null || ev.name || ev._id || ev.id)) return ev
      return null
    },
    onEnrollTap(e) {
      this.openEnroll(this.resolveClassItem(e))
    },
    openEnroll(item) {
      item = this.resolveClassItem(item) || item
      if (!item) {
        uni.showToast({ title: '未找到该团课', icon: 'none' })
        return
      }
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
          var allowed = that.boundTemplateIds(that.current)
          that.cards = arr.filter(function (c) {
            if (!(c.type === 'group' && c.status === 'active' && Number(c.remainingTimes || 0) > 0)) return false
            if (!allowed.length) return false
            var tid = String(c.templateId || c.template_id || '')
            return allowed.indexOf(tid) >= 0
          })
          that.selectedCardId = that.cards.length === 1 ? that.cards[0]._id : ''
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
.type-note {
  padding: 8rpx 24rpx 0;
  color: #888;
  font-size: 22rpx;
  line-height: 1.5;
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
.buy-row { margin-top: 16rpx; }
.buy { background: #1a5c3a !important; color: #fff !important; font-size: 26rpx; border-radius: 10rpx; }
</style>

