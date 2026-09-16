<template>
  <view class="wrap">
    <view class="pet" :style="boxStyle" @touchstart="onStart" @touchmove.stop.prevent="onMove" @touchend="onEnd">
      <view class="bubble" v-if="line">{{ line }}</view>
      <image class="pic" :class="{ hop: hopping }" :src="poses[pose]" mode="aspectFit" />
    </view>
  </view>
</template>
<script>
var LINES = ['要订场吗', '发球！', '嘿嘿～', '歇一会儿', '今天状态不错']
export default {
  data() {
    return {
      line: '',
      ox: 0,
      oy: 0,
      startX: 0,
      startY: 0,
      moved: false,
      hopping: false,
      pose: 0,
      poses: [
        '/static/images/pet/sit.png',
        '/static/images/pet/jump.png',
        '/static/images/pet/wink.png',
        '/static/images/pet/lie.png'
      ]
    }
  },
  computed: {
    boxStyle() { return 'transform:translate(' + this.ox + 'px,' + this.oy + 'px)' }
  },
  methods: {
    onStart(e) {
      var t = e.touches && e.touches[0]
      if (!t) return
      this.startX = t.clientX
      this.startY = t.clientY
      this.moved = false
    },
    onMove(e) {
      var t = e.touches && e.touches[0]
      if (!t) return
      var dx = t.clientX - this.startX
      var dy = t.clientY - this.startY
      if (Math.abs(dx) + Math.abs(dy) > 8) this.moved = true
      if (this.moved) {
        this.ox += dx
        this.oy += dy
        this.startX = t.clientX
        this.startY = t.clientY
      }
    },
    onEnd() {
      if (this.moved) return
      this.hopping = false
      var that = this
      this.pose = (this.pose + 1) % this.poses.length
      this.$nextTick(function () {
        that.hopping = true
        that.line = LINES[Math.floor(Math.random() * LINES.length)]
        setTimeout(function () { that.hopping = false; that.line = '' }, 1400)
      })
    }
  }
}
</script>
<style>
.wrap { position: fixed; right: 8rpx; bottom: 190rpx; z-index: 999; pointer-events: none; }
.pet { pointer-events: auto; width: 168rpx; height: 168rpx; position: relative; }
.pic { width: 168rpx; height: 168rpx; display: block; background: transparent; }
.pic.hop { animation: hop 0.45s ease; }
@keyframes hop {
  0% { transform: translateY(0); }
  40% { transform: translateY(-20rpx); }
  100% { transform: translateY(0); }
}
.bubble {
  position: absolute; right: 160rpx; top: 18rpx;
  background: #fff; color: #1e4870; font-size: 24rpx;
  padding: 10rpx 16rpx; border-radius: 18rpx;
  box-shadow: 0 6rpx 18rpx rgba(30,72,112,.12);
  white-space: nowrap;
}
</style>
