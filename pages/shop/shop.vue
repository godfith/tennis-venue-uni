<template>
  <view class="page">
    <view class="banner">
      <view class="b-kicker">GOAT PRO SHOP</view>
      <view class="b-title">装备商城</view>
      <view class="b-sub">到店可选购，线上先看商品</view>
    </view>
    <view class="list">
      <view class="item" v-for="p in products" :key="p.id" @tap="openItem(p)">
        <view class="ico">{{ p.icon }}</view>
        <view class="info">
          <view class="name">{{ p.name }}</view>
          <view class="desc">{{ p.desc }}</view>
          <view class="price">¥{{ p.price }}</view>
        </view>
        <view class="go">查看</view>
      </view>
    </view>
    <view class="mask" v-if="current" @tap="current = null">
      <view class="sheet" @tap.stop="">
        <view class="s-ico">{{ current.icon }}</view>
        <view class="s-name">{{ current.name }}</view>
        <view class="s-price">¥{{ current.price }}</view>
        <view class="s-desc">{{ current.detail }}</view>
        <button class="btn" @tap="askStore">到店选购</button>
        <view class="cancel" @tap="current = null">返回</view>
      </view>
    </view>
    <app-tabbar :current="1" />
  </view>
</template>
<script>
import AppTabbar from '@/components/app-tabbar.vue'
import share from '@/mixins/share.js'
export default {
  components: { AppTabbar },
  mixins: [share],
  data() {
    return {
      current: null,
      products: [
        { id: 1, icon: '🎾', name: '训练网球', desc: '耐打练习球，门店现货', price: '12', detail: '适合发球机和日常对打。到店按颗或按筒购买，线上仅展示，不支持邮寄。' },
        { id: 2, icon: '🏸', name: '入门球拍', desc: '初学可用，可试打', price: '299', detail: '初学者球拍，门店可试打后再买。线上不锁库存，到店确认型号。' },
        { id: 3, icon: '👕', name: '运动短袖', desc: '山羊网球馆服饰', price: '89', detail: '馆内服饰，尺码以到店库存为准。线上先看款式。' }
      ]
    }
  },
  onShow() { try { uni.hideTabBar({ animation: false }) } catch (e) {} },
  methods: {
    openItem(p) { this.current = p },
    askStore() {
      uni.showModal({
        title: '到店选购',
        content: '这件商品请到门店前台购买，线上暂不支付、不邮寄。',
        showCancel: false
      })
    }
  }
}
</script>
<style>
.page { min-height: 100vh; background: #f4f2ee; padding-bottom: 180rpx; }
.banner { height: 280rpx; background: linear-gradient(135deg, #1e4870, #3a6ea0); color: #fff; padding: 70rpx 40rpx; box-sizing: border-box; }
.b-kicker { letter-spacing: 6rpx; font-size: 20rpx; opacity: .8; }
.b-title { font-size: 44rpx; font-weight: 700; margin: 10rpx 0; }
.b-sub { font-size: 26rpx; opacity: .85; }
.list { padding: 24rpx; }
.item { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; display: flex; align-items: center; }
.ico { width: 88rpx; height: 88rpx; border-radius: 16rpx; background: #eef3f8; display: flex; align-items: center; justify-content: center; font-size: 40rpx; margin-right: 20rpx; }
.info { flex: 1; }
.name { font-size: 32rpx; font-weight: 700; color: #1e4870; }
.desc { font-size: 24rpx; color: #888; margin-top: 6rpx; }
.price { font-size: 30rpx; color: #c45c26; font-weight: 700; margin-top: 8rpx; }
.go { color: #1e4870; font-size: 26rpx; }
.mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,.45); z-index: 20; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 40rpx 32rpx 48rpx; }
.s-ico { font-size: 64rpx; }
.s-name { font-size: 36rpx; font-weight: 700; margin-top: 12rpx; }
.s-price { font-size: 32rpx; color: #c45c26; font-weight: 700; margin: 8rpx 0 16rpx; }
.s-desc { font-size: 28rpx; color: #555; line-height: 1.6; }
.btn { margin-top: 28rpx; background: #1e4870 !important; color: #fff !important; border-radius: 12rpx; }
.cancel { text-align: center; color: #888; padding: 20rpx; }
</style>
