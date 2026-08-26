<template>
  <view class="bar">
    <view
      class="item"
      v-for="(item, index) in tabs"
      :key="index"
      @tap="go(index)"
    >
      <view :class="'ico-wrap ' + (index === 2 ? 'mid' : '') + ' ' + (selected === index ? 'on' : '')">
        <image class="ico" :src="item.icon" mode="aspectFit"></image>
      </view>
      <text :class="'lab ' + (selected === index ? 'on' : '')">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selected: 0,
      tabs: [
        { text: '首页', path: '/pages/index/index', icon: '/static/images/ui/bYMYQ.jpg' },
        { text: '商城', path: '/pages/shop/shop', icon: '/static/images/ui/gwm0c.jpg' },
        { text: '订场', path: '/pages/booking/booking', icon: '/static/images/ui/T8zdG.jpg' },
        { text: '我的', path: '/pages/my/my', icon: '/static/images/ui/AOIXl.jpg' },
        { text: '排名', path: '/pages/rank/rank', icon: '/static/images/ui/gwm0c.jpg' }
      ]
    }
  },
  pageLifetimes: {
    show() {
      this.sync()
    }
  },
  methods: {
    sync() {
      try {
        var pages = getCurrentPages()
        var route = (pages[pages.length - 1] || {}).route || ''
        var map = {
          'pages/index/index': 0,
          'pages/shop/shop': 1,
          'pages/booking/booking': 2,
          'pages/my/my': 3,
          'pages/rank/rank': 4
        }
        if (map[route] !== undefined) this.selected = map[route]
      } catch (e) {}
    },
    go(index) {
      if (this.selected === index) return
      this.selected = index
      uni.switchTab({ url: this.tabs[index].path })
    }
  }
}
</script>

<style>
.bar {
  height: 130rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  box-shadow: 0 -8rpx 24rpx rgba(44, 44, 44, 0.06);
}
.item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 10rpx;
}
.ico-wrap {
  width: 52rpx;
  height: 52rpx;
  border-radius: 14rpx;
  overflow: hidden;
  background: #f3f1ec;
  margin-bottom: 6rpx;
}
.ico-wrap.mid {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  margin-top: -18rpx;
}
.ico-wrap.on {
  background: #e8f0eb;
}
.ico {
  width: 100%;
  height: 100%;
}
.lab {
  font-size: 24rpx;
  color: #8a8680;
  line-height: 1.2;
}
.lab.on {
  color: #3f6b56;
  font-weight: 700;
  font-size: 26rpx;
}
</style>
