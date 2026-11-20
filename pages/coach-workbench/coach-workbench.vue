<template>
  <view class="page">
    <view class="profile-card" v-if="coachInfo">
      <view class="profile-header">
        <image class="avatar" :src="coachInfo.avatar || '/static/images/avatar.png'" mode="aspectFill"></image>
        <view class="info">
          <view class="name">{{ coachInfo.name }}</view>
          <view class="title">{{ coachInfo.title || '教练' }}</view>
        </view>
        <view class="edit-btn" @tap="goEditProfile">编辑资料</view>
      </view>
      <view class="desc">{{ coachInfo.desc || coachInfo.remark || '暂无介绍' }}</view>
    </view>

    <view class="bind-card" v-if="!coachInfo && !loading">
      <view class="bind-title">未找到教练资料</view>
      <view class="bind-desc">请联系管理员在后台添加教练账号，并保证手机号与登录手机号一致</view>
    </view>

    <block v-if="coachInfo">
      <view class="filters">
        <view class="chip" :class="{ on: !venueFilter }" data-val="" @tap="onVenueChip">全部</view>
        <scroll-view class="chip-scroll" scroll-x="true">
          <view
            class="chip"
            :class="{ on: venueFilter === String(v.venueId) }"
            v-for="v in venueList"
            :key="v.venueId"
            :data-val="v.venueId"
            @tap="onVenueChip"
          >{{ v.name }}</view>
        </scroll-view>
      </view>

      <view class="actions">
        <view class="act-btn" @tap="exportTable">导出课程表</view>
        <view class="act-btn" @tap="openPublish">发布团课</view>
        <view class="act-btn" @tap="openLock">锁外场</view>
      </view>

      <view class="section-title">我的课程安排</view>

      <view class="empty" v-if="!loading && filteredList.length === 0">
        <view class="empty-text">暂无预约课程</view>
      </view>

      <view class="list">
        <view class="item" v-for="(item, index) in filteredList" :key="item._id || index">
          <view class="item-left">
            <view class="date">{{ item.date }}</view>
            <view class="time">{{ item.time }}</view>
            <view class="court" v-if="item.venueName">{{ item.venueName }} · {{ item.court }}</view>
            <view class="court" v-else>场地：{{ item.court }}</view>
            <view class="user" v-if="item.kind === 'group'">{{ item.name || '团课' }}</view>
            <view class="user" v-else-if="item.kind === 'lock' || item.status === 'locked'">锁场</view>
            <view class="user" v-else-if="item.userName">学员：{{ item.userName }}</view>
          </view>
          <view class="status" :class="item.kind === 'group' ? 'group' : (item.kind === 'lock' || item.status === 'locked' ? 'lock' : 'booked')">
            {{ item.kind === 'group' ? '团课' : (item.kind === 'lock' || item.status === 'locked' ? '锁场' : '已预约') }}
          </view>
        </view>
      </view>
    </block>

    <view class="loading" v-if="loading">加载中...</view>

    <view class="mask" v-if="publishOpen" @tap="publishOpen = false">
      <view class="pop" @tap.stop>
        <view class="pop-title">发布团课</view>
        <picker :range="venueNames" @change="onPubVenue">
          <view class="field">门店：{{ pub.venueName || '请选择' }}</view>
        </picker>
        <view class="field">名称：<input v-model="pub.name" placeholder="如：周三晚提高班" /></view>
        <view class="field">日期：<input v-model="pub.date" placeholder="YYYY-MM-DD" /></view>
        <picker :range="timeSlots" @change="onPubTime">
          <view class="field">时段：{{ pub.time || '请选择' }}</view>
        </picker>
        <picker :range="courtNames" @change="onPubCourt">
          <view class="field">场地：{{ pub.court || '请选择' }}</view>
        </picker>
        <view class="field">人数：<input type="number" v-model="pub.capacity" /></view>
        <view class="pop-actions">
          <view class="act-btn ghost" @tap="publishOpen = false">取消</view>
          <view class="act-btn solid" @tap="submitPublish">发布</view>
        </view>
      </view>
    </view>

    <view class="mask" v-if="lockOpen" @tap="lockOpen = false">
      <view class="pop" @tap.stop>
        <view class="pop-title">锁定自己的外场</view>
        <picker :range="venueNames" @change="onLockVenue">
          <view class="field">门店：{{ lock.venueName || '请选择' }}</view>
        </picker>
        <view class="field">日期：<input v-model="lock.date" placeholder="YYYY-MM-DD" /></view>
        <picker :range="timeSlots" @change="onLockTime">
          <view class="field">时段：{{ lock.time || '请选择' }}</view>
        </picker>
        <view class="hint">只能锁外场，且只能锁自己的时段。不能代约私教课。</view>
        <view class="pop-actions">
          <view class="act-btn ghost" @tap="lockOpen = false">取消</view>
          <view class="act-btn solid" @tap="submitLock">锁定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { workbenchScheduleText } from '@/utils/scheduleText.js'

var FALLBACK_SLOTS = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
  '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'
]

function todayYmd() {
  var d = new Date()
  var m = d.getMonth() + 1
  var day = d.getDate()
  return d.getFullYear() + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day)
}

export default {
  data() {
    return {
      list: [],
      coachInfo: null,
      loading: true,
      venueList: [],
      venueFilter: '',
      timeSlots: FALLBACK_SLOTS.slice(),
      courts: [],
      publishOpen: false,
      lockOpen: false,
      pub: { venueId: '', venueName: '', name: '固定团课', date: '', time: '', court: '', capacity: 4 },
      lock: { venueId: '', venueName: '', date: '', time: '' }
    }
  },
  computed: {
    filteredList() {
      var id = this.venueFilter
      if (!id) return this.list || []
      return (this.list || []).filter(function (x) { return String(x.venueId) === String(id) })
    },
    venueNames() {
      return (this.venueList || []).map(function (v) { return v.name })
    },
    courtNames() {
      return (this.courts || []).map(function (c) { return c.name })
    },
    filterVenueName() {
      var id = this.venueFilter
      if (!id) return '全部门店'
      var v = (this.venueList || []).find(function (x) { return String(x.venueId) === String(id) })
      return v ? v.name : '所选门店'
    }
  },
  onShow() {
    var stored = uni.getStorageSync('venue_id') || ''
    if (stored && !this.venueFilter) this.venueFilter = stored
    this.loadVenues()
    this.loadData()
  },
  methods: {
    authPayload() {
      return {
        openid: uni.getStorageSync('openid') || '',
        phone: uni.getStorageSync('phone') || '',
        userId: uni.getStorageSync('userDocId') || ''
      }
    },
    onVenueChip(e) {
      var val = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.val) || ''
      this.venueFilter = this.venueFilter === String(val) && val ? '' : String(val)
    },
    loadVenues() {
      var that = this
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenues', includeShell: true, purpose: 'group' },
        success: function (res) {
          that.venueList = ((res.result || {}).list || []).map(function (v) {
            return { venueId: String(v.venueId || v._id || v.id || ''), name: v.name || '' }
          }).filter(function (v) { return v.venueId })
        }
      })
    },
    loadData() {
      var that = this
      var auth = this.authPayload()
      if (!auth.openid && !auth.phone) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        that.loading = false
        return
      }
      that.loading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: Object.assign({ action: 'getCoachWorkbench' }, auth),
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
            that.coachInfo = null
            that.list = []
            return
          }
          that.coachInfo = result.coach || null
          that.list = result.list || []
        },
        fail: function () {
          uni.showToast({ title: '加载失败', icon: 'none' })
          that.coachInfo = null
          that.list = []
        },
        complete: function () {
          that.loading = false
        }
      })
    },
    exportTable() {
      var text = workbenchScheduleText({
        title: '我的课程安排',
        venueName: this.filterVenueName,
        rows: this.filteredList
      })
      uni.setClipboardData({
        data: text,
        success: function () {
          uni.showToast({ title: '课程表已复制', icon: 'none' })
        },
        fail: function () {
          uni.showToast({ title: '复制失败', icon: 'none' })
        }
      })
    },
    defaultVenue() {
      var id = this.venueFilter || uni.getStorageSync('venue_id') || ((this.venueList[0] && this.venueList[0].venueId) || '')
      var v = (this.venueList || []).find(function (x) { return String(x.venueId) === String(id) })
      return { venueId: id, venueName: v ? v.name : (uni.getStorageSync('venue_name') || '') }
    },
    loadHoursAndCourts(venueId) {
      var that = this
      if (!venueId) return
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenueHours', venueId: venueId },
        success: function (res) {
          var slots = (res.result || {}).slots || []
          if (slots.length) that.timeSlots = slots
        }
      })
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCourts', venueId: venueId },
        success: function (res) {
          that.courts = (res.result || {}).list || []
        }
      })
    },
    openPublish() {
      var v = this.defaultVenue()
      this.pub = { venueId: v.venueId, venueName: v.venueName, name: '固定团课', date: todayYmd(), time: '', court: '', capacity: 4 }
      this.publishOpen = true
      this.loadHoursAndCourts(v.venueId)
    },
    openLock() {
      var v = this.defaultVenue()
      this.lock = { venueId: v.venueId, venueName: v.venueName, date: todayYmd(), time: '' }
      this.lockOpen = true
      this.loadHoursAndCourts(v.venueId)
    },
    onPubVenue(e) {
      var v = this.venueList[e.detail.value]
      if (!v) return
      this.pub.venueId = v.venueId
      this.pub.venueName = v.name
      this.pub.court = ''
      this.loadHoursAndCourts(v.venueId)
    },
    onPubTime(e) { this.pub.time = this.timeSlots[e.detail.value] || '' },
    onPubCourt(e) { this.pub.court = this.courtNames[e.detail.value] || '' },
    onLockVenue(e) {
      var v = this.venueList[e.detail.value]
      if (!v) return
      this.lock.venueId = v.venueId
      this.lock.venueName = v.name
      this.loadHoursAndCourts(v.venueId)
    },
    onLockTime(e) { this.lock.time = this.timeSlots[e.detail.value] || '' },
    submitPublish() {
      var that = this
      var p = this.pub
      if (!p.venueId || !p.name || !p.date || !p.time || !p.court) {
        uni.showToast({ title: '请填写完整', icon: 'none' })
        return
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: Object.assign({
          action: 'coachSaveGroupClass',
          venueId: p.venueId,
          venueName: p.venueName,
          name: p.name,
          date: p.date,
          time: p.time,
          court: p.court,
          capacity: Number(p.capacity) || 4
        }, this.authPayload()),
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) { uni.showToast({ title: result.msg || '发布失败', icon: 'none' }); return }
          uni.showToast({ title: '已发布', icon: 'none' })
          that.publishOpen = false
          that.loadData()
        },
        fail: function () { uni.showToast({ title: '发布失败', icon: 'none' }) }
      })
    },
    submitLock() {
      var that = this
      var p = this.lock
      if (!p.venueId || !p.date || !p.time) {
        uni.showToast({ title: '请填写完整', icon: 'none' })
        return
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: Object.assign({
          action: 'coachLockOutdoor',
          venueId: p.venueId,
          venueName: p.venueName,
          date: p.date,
          time: p.time,
          court: '外场'
        }, this.authPayload()),
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) { uni.showToast({ title: result.msg || '锁场失败', icon: 'none' }); return }
          uni.showToast({ title: '已锁定外场', icon: 'none' })
          that.lockOpen = false
          that.loadData()
        },
        fail: function () { uni.showToast({ title: '锁场失败', icon: 'none' }) }
      })
    },
    goEditProfile() {
      if (!this.coachInfo || !this.coachInfo._id) return
      uni.navigateTo({ url: '/pages/coach-edit/coach-edit?id=' + this.coachInfo._id })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 30rpx;
  box-sizing: border-box;
}
.profile-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}
.profile-header { display: flex; align-items: center; margin-bottom: 20rpx; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; margin-right: 20rpx; background: #f0f0f0; }
.info { flex: 1; }
.name { font-size: 32rpx; font-weight: 600; color: #222; }
.title { font-size: 24rpx; color: #07c160; margin-top: 6rpx; }
.edit-btn { font-size: 26rpx; color: #07c160; padding: 8rpx 20rpx; border: 1rpx solid #07c160; border-radius: 30rpx; }
.desc { font-size: 26rpx; color: #666; line-height: 1.6; }
.bind-card { background: #fff; border-radius: 20rpx; padding: 60rpx 40rpx; text-align: center; margin-bottom: 30rpx; }
.bind-title { font-size: 32rpx; font-weight: 600; margin-bottom: 12rpx; }
.bind-desc { font-size: 26rpx; color: #999; }
.filters { display: flex; align-items: center; margin-bottom: 16rpx; }
.chip-scroll { white-space: nowrap; flex: 1; }
.chip {
  display: inline-block;
  margin-right: 12rpx;
  padding: 8rpx 20rpx;
  border-radius: 28rpx;
  background: #fff;
  font-size: 24rpx;
  color: #555;
}
.chip.on { background: #1e4870; color: #fff; }
.actions { display: flex; gap: 12rpx; margin-bottom: 20rpx; }
.act-btn { flex: 1; text-align: center; background: #fff; color: #1e4870; border: 1rpx solid #1e4870; border-radius: 12rpx; padding: 16rpx 8rpx; font-size: 26rpx; }
.act-btn.solid { background: #1e4870; color: #fff; }
.act-btn.ghost { border-color: #ccc; color: #666; }
.section-title { font-size: 30rpx; font-weight: 600; margin-bottom: 20rpx; color: #222; }
.item { background: #fff; border-radius: 16rpx; padding: 28rpx; margin-bottom: 20rpx; display: flex; justify-content: space-between; align-items: center; }
.date { font-size: 28rpx; font-weight: 600; margin-bottom: 6rpx; }
.time { font-size: 26rpx; color: #07c160; margin-bottom: 6rpx; }
.court, .user { font-size: 24rpx; color: #888; margin-top: 4rpx; }
.status { font-size: 24rpx; padding: 6rpx 16rpx; border-radius: 8rpx; }
.status.booked { background: #e8f8ef; color: #07c160; }
.status.group { background: #e8f0fa; color: #1e4870; }
.status.lock { background: #fff3e8; color: #c45600; }
.empty { text-align: center; padding: 80rpx 0; color: #999; }
.loading { text-align: center; color: #999; margin-top: 100rpx; }
.mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-end; z-index: 20; }
.pop { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 32rpx; box-sizing: border-box; }
.pop-title { font-size: 32rpx; font-weight: 600; margin-bottom: 20rpx; }
.field { display: flex; align-items: center; padding: 18rpx 0; border-bottom: 1rpx solid #f0f0f0; font-size: 28rpx; color: #333; }
.field input { flex: 1; }
.hint { margin: 16rpx 0; font-size: 24rpx; color: #888; line-height: 1.5; }
.pop-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
</style>
