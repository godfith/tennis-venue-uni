<template>
  <view class="page">
    <view class="hero">
      <view class="logo-text">选择注册场馆</view>
    </view>
    <view class="card">
      <view v-if="loading" class="empty">加载场馆中...</view>
      <view
        v-for="(v, idx) in list"
        :key="idx"
        class="item"
        :class="pickedIndex === idx ? 'active' : ''"
        @tap="onPick(idx)"
      >
        <view class="row">
          <view class="name">{{ v.name }}</view>
          <view v-if="v.near" class="tag">距你最近</view>
        </view>
        <view v-if="v.address" class="addr">{{ v.address }}</view>
        <view v-if="v.distText" class="dist">{{ v.distText }}</view>
      </view>
      <view v-if="!loading && !list.length" class="empty">暂无场馆</view>
      <view class="submit-btn" :class="pickedIndex < 0 ? 'off' : ''" @tap="askConfirm">确认注册场馆</view>
    </view>
  </view>
</template>
<script>
import { callCloud } from '@/utils/api'

var VENUE_GEO = {
  venue_chenjiaci: {
    lat: 23.1263,
    lng: 113.2446,
    address: '荔湾区荔湾路54号（荔湾体育馆首层北门）'
  },
  venue_huadiwan: {
    lat: 23.0908,
    lng: 113.2295,
    address: '荔湾区花地大道北285号之一103'
  }
}

function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371
  var toRad = Math.PI / 180
  var dLat = (lat2 - lat1) * toRad
  var dLng = (lng2 - lng1) * toRad
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function distText(km) {
  if (km == null || isNaN(km)) return ''
  if (km < 1) return '距你约 ' + Math.max(50, Math.round(km * 1000)) + ' 米'
  return '距你约 ' + km.toFixed(1) + ' 公里'
}

export default {
  data() {
    return {
      list: [],
      pickedIndex: -1,
      loading: false,
      saving: false
    }
  },
  onShow() {
    this.loadVenues()
  },
  methods: {
    venueIdOf(v) {
      if (!v) return ''
      return v.venueId || v._id || v.id || ''
    },
    getLocation() {
      return new Promise(function (resolve) {
        wx.getLocation({
          type: 'gcj02',
          success: function (res) {
            resolve({ lat: res.latitude, lng: res.longitude })
          },
          fail: function () {
            resolve(null)
          }
        })
      })
    },
    loadVenues() {
      var that = this
      that.loading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getVenues' },
        success: function (res) {
          var raw = (res.result || {}).list || []
          var list = raw.map(function (v) {
            var id = that.venueIdOf(v)
            var geo = VENUE_GEO[id] || {}
            return {
              venueId: id,
              name: v.name || '',
              address: v.address || geo.address || '',
              lat: Number(v.lat) || geo.lat || 0,
              lng: Number(v.lng) || geo.lng || 0,
              km: null,
              distText: '',
              near: false
            }
          })
          that.list = list
          that.applyLocation(list)
        },
        complete: function () {
          that.loading = false
        }
      })
    },
    async applyLocation(list) {
      var loc = await this.getLocation()
      if (!loc || !list.length) {
        if (this.pickedIndex < 0 && list.length) this.pickedIndex = 0
        return
      }
      var best = 0
      var bestKm = 99999
      for (var i = 0; i < list.length; i++) {
        if (!list[i].lat || !list[i].lng) continue
        var km = haversine(loc.lat, loc.lng, list[i].lat, list[i].lng)
        list[i].km = km
        list[i].distText = distText(km)
        list[i].near = false
        if (km < bestKm) {
          bestKm = km
          best = i
        }
      }
      list.sort(function (a, b) {
        if (a.km == null && b.km == null) return 0
        if (a.km == null) return 1
        if (b.km == null) return -1
        return a.km - b.km
      })
      if (list[0] && list[0].km != null) list[0].near = true
      this.list = list
      this.pickedIndex = 0
    },
    onPick(idx) {
      this.pickedIndex = idx
    },
    askConfirm() {
      if (this.saving) return
      var v = this.list[this.pickedIndex]
      if (!v || !v.venueId) {
        uni.showToast({ title: '请选择场馆', icon: 'none' })
        return
      }
      var that = this
      uni.showModal({
        title: '确认注册场馆',
        content: '将「' + v.name + '」记为你的注册店？',
        confirmText: '确认',
        cancelText: '再想想',
        success: function (r) {
          if (r.confirm) that.saveVenue(v.venueId, v.name)
        }
      })
    },
    async saveVenue(venueId, venueName) {
      this.saving = true
      try {
        uni.setStorageSync('home_venue_id', venueId)
        uni.setStorageSync('home_venue_name', venueName)
        if (!uni.getStorageSync('venue_id')) {
          uni.setStorageSync('venue_id', venueId)
          uni.setStorageSync('venue_name', venueName)
        }
        await callCloud({
          name: 'login',
          data: {
            action: 'setVenue',
            userId: uni.getStorageSync('userDocId') || uni.getStorageSync('userId') || '',
            openid: uni.getStorageSync('openid') || '',
            venueId: venueId,
            venueName: venueName
          }
        })
        uni.switchTab({ url: '/pages/index/index' })
      } catch (e) {
        uni.switchTab({ url: '/pages/index/index' })
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
<style>
.page { min-height: 100vh; background: linear-gradient(180deg, #1e4870 0%, #f4f2ee 42%); padding: 80rpx 40rpx 40rpx; box-sizing: border-box; }
.hero { text-align: center; color: #fff; margin-bottom: 40rpx; }
.logo-text { font-size: 44rpx; font-weight: 700; }
.card { background: #fff; border-radius: 24rpx; padding: 28rpx 24rpx 36rpx; }
.item { background: #f4f2ee; border-radius: 16rpx; padding: 28rpx 24rpx; margin-bottom: 16rpx; border: 2rpx solid transparent; }
.item.active { border-color: #1e4870; background: #eef3f8; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }
.name { font-size: 32rpx; font-weight: 700; color: #1e4870; flex: 1; }
.tag { font-size: 20rpx; color: #1e4870; background: #dce6f0; padding: 4rpx 12rpx; border-radius: 8rpx; flex-shrink: 0; }
.addr { font-size: 24rpx; color: #888; margin-top: 8rpx; }
.dist { font-size: 24rpx; color: #1e4870; margin-top: 6rpx; }
.empty { text-align: center; color: #999; padding: 40rpx 0; }
.submit-btn { width: 100%; height: 90rpx; line-height: 90rpx; text-align: center; margin-top: 20rpx; background: #1e4870; color: #fff; border-radius: 16rpx; font-size: 32rpx; }
.submit-btn.off { opacity: 0.45; }
</style>
