<template>
  <view class="page">
    <view class="banner">
      <view class="b-kicker">GOAT CLASS PASS</view>
      <view class="b-title">团课卡商城</view>
      <view class="b-sub">价格以后台卡模板为准，改价后刷新即可</view>
    </view>
    <view v-if="loading" class="empty">加载中...</view>
    <view v-else-if="!products.length" class="empty">暂无可购买的团课卡</view>
    <view class="list" v-else>
      <view class="item" v-for="p in products" :key="p.id" @tap="openItem(p)">
        <view class="ico">🎾</view>
        <view class="info">
          <view class="name">{{ p.name }}</view>
          <view class="desc">{{ p.desc || (p.totalTimes ? ('共' + p.totalTimes + '次') : '') }}</view>
          <view class="price">¥{{ formatPrice(p.price) }}</view>
        </view>
        <view class="go">购买</view>
      </view>
    </view>
    <view class="mask" v-if="current" @tap="current = null">
      <view class="sheet" @tap.stop="">
        <view class="s-ico">🎾</view>
        <view class="s-name">{{ current.name }}</view>
        <view class="s-price">¥{{ formatPrice(current.price) }}</view>
        <view class="s-desc">{{ current.detail || current.desc || ('共' + (current.totalTimes || 0) + '次。购买后进入「我的会员卡」，可用于绑定该课程内容的团课报名。') }}</view>
        <button class="btn" :loading="paying" @tap="buyCurrent">立即购买</button>
        <view class="cancel" @tap="current = null">返回</view>
      </view>
    </view>
    <app-tabbar v-if="!current" :current="1" />
  </view>
</template>
<script>
import AppTabbar from '@/components/app-tabbar.vue'
import share from '@/mixins/share.js'
export default {
  components: { AppTabbar },
  mixins: [share],
  data() {
    return { current: null, products: [], loading: false, paying: false, resumeClassId: '', resumeDate: '' }
  },
  onLoad(options) {
    options = options || {}
    this.resumeClassId = options.classId || options.classid || ''
    this.resumeDate = options.date || ''
  },
  onShow() {
    try { uni.hideTabBar({ animation: false }) } catch (e) {}
    if (!this.resumeClassId) this.resumeClassId = uni.getStorageSync('mall_resume_class_id') || ''
    if (!this.resumeDate) this.resumeDate = uni.getStorageSync('mall_resume_date') || ''
    this.loadProducts()
  },
  methods: {
    formatPrice(v) {
      var n = Number(v)
      if (!isFinite(n)) return '0'
      return (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0)
    },
    loadProducts() {
      var that = this
      that.loading = true
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getMallProducts' }
      }).then(function (res) {
        var r = res.result || {}
        that.products = r.ok ? (r.list || []) : []
      }).catch(function () {
        that.products = []
      }).finally(function () {
        that.loading = false
      })
    },
    openItem(p) { this.current = p },
    buyCurrent() {
      var that = this
      if (!that.current) return
      if (!uni.getStorageSync('phone') && !uni.getStorageSync('openid') && !uni.getStorageSync('userDocId')) {
        uni.navigateTo({ url: '/pages/login/login' })
        return
      }
      that.paying = true
      var openid = uni.getStorageSync('openid') || ''
      wx.cloud.callFunction({
        name: 'pay',
        data: {
          action: 'createCardPay',
          templateId: that.current.templateId || that.current.id,
          amount: that.current.price,
          venueId: uni.getStorageSync('venue_id') || '',
          venueName: uni.getStorageSync('venue_name') || '',
          openid: openid,
          userId: uni.getStorageSync('userDocId') || '',
          userName: uni.getStorageSync('nickName') || '',
          phone: uni.getStorageSync('phone') || ''
        }
      }).then(function (r) {
        var result = r.result || {}
        if (!result.ok || !result.payParams) {
          uni.showToast({ title: result.msg || '下单失败', icon: 'none' })
          that.paying = false
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
            function pollConfirm(left) {
              wx.cloud.callFunction({
                name: 'pay',
                data: { action: 'confirmCourtPay', outTradeNo: tradeNo }
              }).then(function (cr) {
                var c = (cr && cr.result) || {}
                if (c.ok) {
                  uni.showToast({ title: '购买成功，卡已到账', icon: 'none' })
                  that.current = null
                  that.paying = false
                  that.afterPaid()
                  return
                }
                if (c.waiting && left > 0) {
                  setTimeout(function () { pollConfirm(left - 1) }, 1000)
                  return
                }
                uni.showToast({ title: '支付成功，发卡确认中', icon: 'none' })
                that.current = null
                that.paying = false
                that.afterPaid()
              }).catch(function () {
                if (left > 0) setTimeout(function () { pollConfirm(left - 1) }, 1000)
                else {
                  uni.showToast({ title: '支付成功，请稍后在我的会员卡查看', icon: 'none' })
                  that.current = null
                  that.paying = false
                }
              })
            }
            pollConfirm(8)
          },
          fail: function (err) {
            var raw = (err && (err.errMsg || err.message)) || ''
            var cancelled = raw.indexOf('cancel') >= 0 || raw.indexOf('取消') >= 0
            var title = '支付失败'
            if (cancelled) {
              title = '已取消支付'
            } else if (raw) {
              title = raw.replace('requestPayment:fail ', '') || '支付失败'
            }
            uni.showToast({ title: title, icon: 'none' })
            that.paying = false
          }
        })
      }).catch(function () {
        uni.showToast({ title: '下单失败', icon: 'none' })
        that.paying = false
      })
    },
    afterPaid() {
      var q = []
      if (this.resumeDate) q.push('date=' + encodeURIComponent(this.resumeDate))
      if (this.resumeClassId) q.push('classId=' + encodeURIComponent(this.resumeClassId))
      try { uni.removeStorageSync('mall_resume_class_id'); uni.removeStorageSync('mall_resume_date') } catch (e) {}
      if (q.length) {
        uni.navigateTo({ url: '/pages/group/group?' + q.join('&') })
        return
      }
      uni.navigateTo({ url: '/pages/mycards/mycards' })
    }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f4f2ee; padding-bottom: 180rpx; }
.banner { height: 280rpx; background: linear-gradient(135deg, #1a5c3a, #2d8a5e); color: #fff; padding: 70rpx 40rpx; box-sizing: border-box; }
.b-kicker { letter-spacing: 6rpx; font-size: 20rpx; opacity: .8; }
.b-title { font-size: 44rpx; font-weight: 700; margin: 10rpx 0; }
.b-sub { font-size: 26rpx; opacity: .85; }
.list { padding: 24rpx; }
.item { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; display: flex; align-items: center; }
.ico { width: 88rpx; height: 88rpx; border-radius: 16rpx; background: #e8f5e9; display: flex; align-items: center; justify-content: center; font-size: 40rpx; margin-right: 20rpx; }
.info { flex: 1; }
.name { font-size: 32rpx; font-weight: 700; color: #1a5c3a; }
.desc { font-size: 24rpx; color: #888; margin-top: 6rpx; }
.price { font-size: 30rpx; color: #c45c26; font-weight: 700; margin-top: 8rpx; }
.go { color: #1a5c3a; font-size: 26rpx; }
.empty { text-align: center; color: #888; padding: 80rpx 0; }
.mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,.45); z-index: 20000; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 40rpx 32rpx calc(48rpx + env(safe-area-inset-bottom)); box-sizing: border-box; }
.s-ico { font-size: 64rpx; }
.s-name { font-size: 36rpx; font-weight: 700; margin-top: 12rpx; }
.s-price { font-size: 32rpx; color: #c45c26; font-weight: 700; margin: 8rpx 0 16rpx; }
.s-desc { font-size: 28rpx; color: #555; line-height: 1.6; }
.btn { margin-top: 28rpx; background: #1a5c3a !important; color: #fff !important; border-radius: 12rpx; }
.cancel { text-align: center; color: #888; padding: 20rpx; }
</style>
