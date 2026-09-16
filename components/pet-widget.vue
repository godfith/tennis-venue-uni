<template>
  <view class="wrap">
    <view class="pet" :style="boxStyle" @touchstart="onStart" @touchmove.stop.prevent="onMove" @touchend="onEnd">
      <view class="bubble" v-if="line">{{ line }}</view>
      <image class="pic" :class="pose" :src="pic" mode="aspectFit" />
    </view>
  </view>
</template>
<script>
var LINES = { jump: '发球！', wink: '嘿嘿～', lie: '歇一会儿', sit: '要订场吗' }
export default {
  data() {
    return { pose: 'sit', line: '', ox: 0, oy: 0, startX: 0, startY: 0, moved: false }
  },
  computed: {
    pic() { return '/static/images/pet/' + this.pose + '.png' },
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
      var keys = ['jump', 'wink', 'lie']
      var next = keys[Math.floor(Math.random() * keys.length)]
      this.pose = next
      this.line = LINES[next]
      var that = this
      setTimeout(function () { that.pose = 'sit'; that.line = '' }, 1600)
    }
  }
}
</script>
<style>
.wrap { position: fixed; right: 8rpx; bottom: 190rpx; z-index: 999; pointer-events: none; }
.pet { pointer-events: auto; width: 168rpx; height: 168rpx; position: relative; }
.pic { width: 168rpx; height: 168rpx; display: block; }
.pic.jump { animation: hop 0.45s ease; }
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
