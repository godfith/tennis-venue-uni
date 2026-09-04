<template>
  <view class="goat-tb">
    <view class="goat-tb-row">
      <view class="goat-tb-item" @tap="go(0)">
        <image class="goat-tb-ico" :src="current === 0 ? '/static/images/tab/home-on.png' : '/static/images/tab/home.png'"></image>
        <text :class="current === 0 ? 'goat-tb-lab on' : 'goat-tb-lab'">首页</text>
      </view>
      <view class="goat-tb-item" @tap="go(1)">
        <image class="goat-tb-ico" :src="current === 1 ? '/static/images/tab/shop-on.png' : '/static/images/tab/shop.png'"></image>
        <text :class="current === 1 ? 'goat-tb-lab on' : 'goat-tb-lab'">商城</text>
      </view>
      <view class="goat-tb-item goat-tb-mid" @tap="go(2)">
        <view class="goat-tb-hold"></view>
        <view :class="current === 2 ? 'goat-tb-fab on' : 'goat-tb-fab'">
          <image class="goat-tb-fab-ico" src="/static/images/tab/book-white.png"></image>
        </view>
        <text :class="current === 2 ? 'goat-tb-lab on' : 'goat-tb-lab'">订场开打</text>
      </view>
      <view class="goat-tb-item" @tap="go(3)">
        <image class="goat-tb-ico" :src="current === 3 ? '/static/images/tab/mine-on.png' : '/static/images/tab/mine.png'"></image>
        <text :class="current === 3 ? 'goat-tb-lab on' : 'goat-tb-lab'">我的</text>
      </view>
      <view class="goat-tb-item" @tap="go(4)">
        <image class="goat-tb-ico" :src="current === 4 ? '/static/images/tab/rank-on.png' : '/static/images/tab/rank.png'"></image>
        <text :class="current === 4 ? 'goat-tb-lab on' : 'goat-tb-lab'">排名</text>
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
<style scoped>
.goat-tb {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: #ffffff;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
.goat-tb-row {
  height: 112rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 6rpx 10rpx;
  box-sizing: border-box;
}
.goat-tb-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}
.goat-tb-ico {
  width: 56rpx;
  height: 56rpx;
  margin-bottom: 4rpx;
}
.goat-tb-lab {
  font-size: 24rpx;
  color: #8aa0b0;
  line-height: 1.2;
}
.goat-tb-lab.on {
  color: #1e4870;
  font-weight: 700;
}
.goat-tb-hold {
  width: 56rpx;
  height: 56rpx;
  margin-bottom: 4rpx;
}
.goat-tb-fab {
  position: absolute;
  left: 50%;
  bottom: 42rpx;
  width: 112rpx;
  height: 112rpx;
  margin-left: -56rpx;
  border-radius: 56rpx;
  background: #1e4870;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(30,72,112,.28);
  border: 6rpx solid #fff;
  box-sizing: border-box;
}
.goat-tb-fab.on {
  background: #163a58;
}
.goat-tb-fab-ico {
  width: 64rpx;
  height: 64rpx;
}
</style>
