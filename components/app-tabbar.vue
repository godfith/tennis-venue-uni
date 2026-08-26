<template>
  <view class="dock">
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
        <view class="fab-hold"></view>
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
.dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: #ffffff;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
.bar {
  height: 112rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 6rpx 10rpx;
  box-sizing: border-box;
}
.item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}
.ico { width: 56rpx; height: 56rpx; margin-bottom: 4rpx; border-radius: 12rpx; }
.lab { font-size: 20rpx; color: #8aa198; line-height: 1.2; }
.lab.on { color: #1a4a6e; font-weight: 700; }
.fab-hold { width: 56rpx; height: 56rpx; margin-bottom: 4rpx; }
.fab {
  position: absolute;
  left: 50%;
  bottom: 42rpx;
  width: 120rpx;
  height: 120rpx;
  margin-left: -60rpx;
  border-radius: 60rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(26,74,110,.22);
  border: 6rpx solid #1a4a6e;
  box-sizing: border-box;
  overflow: hidden;
}
.fab.on { border-color: #163a58; }
.fab-ico {
  width: 92rpx;
  height: 92rpx;
}
</style>
