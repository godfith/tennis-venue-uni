<template>
  <view class="wrap">
    <view class="pet" :style="boxStyle" @touchstart="onStart" @touchmove.stop.prevent="onMove" @touchend="onEnd">
      <view class="bubble" v-if="line">{{ line }}</view>
      <image class="pic" :class="{ hop: hopping }" :src="poses[pose]" mode="aspectFit" />
    </view>
  </view>
</template>
<script>
var LINES = ['要订场吗', '歇一会儿', '嘿嘿～', '发球！']
var PET_CDN = 'https://cloud1-d3g0pb1qk028e3585-d862bc2-1312769671.tcloudbaseapp.com/pet/'
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
        PET_CDN + 'sit.png',
        PET_CDN + 'lie.png',
        PET_CDN + 'jump.png',
        PET_CDN + 'stand.png'
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
        that.line = LINES[that.pose] || LINES[Math.floor(Math.random() * LINES.length)]
        setTimeout(function () { that.hopping = false; that.line = '' }, 1400)
      })
    }
  }
}
</script>
<style>
.wrap { position: fixed; right: 8rpx; bottom: 190rpx; z-index: 999; pointer-events: none; }
.pet { pointer-events: auto; width: 176rpx; height: 176rpx; position: relative; }
.pic { width: 176rpx; height: 176rpx; display: block; background: transparent; }
.pic.hop { animation: hop 0.45s ease; }
@keyframes hop {
  0% { transform: translateY(0); }
  40% { transform: translateY(-22rpx); }
  100% { transform: translateY(0); }
}
.bubble {
  position: absolute; right: 168rpx; top: 18rpx;
  background: #fff; color: #1e4870; font-size: 24rpx;
  padding: 10rpx 16rpx; border-radius: 18rpx;
  box-shadow: 0 6rpx 18rpx rgba(30,72,112,.12);
  white-space: nowrap;
}
</style>
