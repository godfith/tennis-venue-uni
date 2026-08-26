<template>
  <view class="wrap">
    <view class="bar">
      <view class="item" @tap="go(0)">
        <image class="ico" :src="current === 0 ? '/static/images/tab/home-on.png' : '/static/images/tab/home.png'"></image>
        <text :class="current === 0 ? 'lab on' : 'lab'">首页</text>
      </view>
      <view class="item" @tap="go(1)">
        <image class="ico" :src="current === 1 ? '/static/images/tab/shop-on.png' : '/static/images/tab/shop.png'"></image>
        <text :class="current === 1 ? 'lab on' : 'lab'">商城</text>
      </view>
      <view class="item mid" @tap="go(2)">
        <view :class="current === 2 ? 'fab on' : 'fab'">
          <image class="fab-ico" src="/static/images/tab/book-on.png"></image>
        </view>
        <text :class="current === 2 ? 'lab on' : 'lab'">订场开打</text>
      </view>
      <view class="item" @tap="go(3)">
        <image class="ico" :src="current === 3 ? '/static/images/tab/mine-on.png' : '/static/images/tab/mine.png'"></image>
        <text :class="current === 3 ? 'lab on' : 'lab'">我的</text>
      </view>
      <view class="item" @tap="go(4)">
        <image class="ico" :src="current === 4 ? '/static/images/tab/rank-on.png' : '/static/images/tab/rank.png'"></image>
        <text :class="current === 4 ? 'lab on' : 'lab'">排名</text>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    current: { type: Number, default: 0 }
  },
  created() {
    try { uni.hideTabBar({ animation: false }) } catch (e) {}
  },
  methods: {
    go(i) {
      var urls = [
        '/pages/index/index',
        '/pages/shop/shop',
        '/pages/booking/booking',
        '/pages/my/my',
        '/pages/rank/rank'
      ]
      if (i === this.current) return
      uni.switchTab({ url: urls[i] })
    }
  }
}
</script>
<style>
.wrap {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  z-index: 90;
  background: #fff;
  box-shadow: 0 -8rpx 24rpx rgba(44,44,44,.06);
  padding-bottom: env(safe-area-inset-bottom);
}
.bar {
  height: 120rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 8rpx 8rpx;
}
.item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
.ico { width: 48rpx; height: 48rpx; margin-bottom: 4rpx; }
.lab { font-size: 22rpx; color: #8aa198; line-height: 1.2; }
.lab.on { color: #3f6b56; font-weight: 700; }
.item.mid { position: relative; }
.fab {
  width: 112rpx;
  height: 112rpx;
  border-radius: 56rpx;
  background: #3f6b56;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -52rpx;
  margin-bottom: 6rpx;
  box-shadow: 0 12rpx 28rpx rgba(63,107,86,.35);
  border: 8rpx solid #fff;
}
.fab.on { background: #2f5343; }
.fab-ico {
  width: 56rpx;
  height: 56rpx;
  filter: brightness(10);
}
</style>
