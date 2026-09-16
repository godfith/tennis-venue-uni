<template>
  <view class="pet" :class="{ hide: hidden }">
    <view
      class="ball"
      :class="pose"
      :style="{ left: x + 'px', top: y + 'px' }"
      @tap.stop="poke"
      @longpress.stop="toggleHide"
      @touchstart.stop="onStart"
      @touchmove.stop.prevent="onDrag"
    >
      <text class="emoji">🐐</text>
      <view class="bubble" v-if="line">{{ line }}</view>
    </view>
  </view>
</template>
<script>
var LINES = ['咩～', '要订场吗', '点我干嘛', '打网球去', '嘿嘿']
export default {
  data() {
    return { x: 0, y: 0, pose: '', line: '', hidden: false, startX: 0, startY: 0 }
  },
  mounted() {
    try {
      var s = uni.getSystemInfoSync()
      this.x = (s.windowWidth || 320) - 78
      this.y = (s.windowHeight || 640) - 210
    } catch (e) {
      this.x = 260
      this.y = 500
    }
  },
  methods: {
    poke() {
      if (this.hidden) { this.hidden = false; return }
      this.line = LINES[Math.floor(Math.random() * LINES.length)]
      this.pose = 'bounce'
      var that = this
      setTimeout(function () { that.pose = ''; that.line = '' }, 1200)
    },
    toggleHide() { this.hidden = true; this.line = '' },
    onStart(e) {
      var t = e.touches && e.touches[0]
      if (!t) return
      this.startX = t.clientX - this.x
      this.startY = t.clientY - this.y
    },
    onDrag(e) {
      var t = e.touches && e.touches[0]
      if (!t) return
      this.x = Math.max(0, t.clientX - this.startX)
      this.y = Math.max(40, t.clientY - this.startY)
    }
  }
}
</script>
<style>
.pet { position: fixed; left: 0; top: 0; z-index: 90; pointer-events: none; }
.pet.hide .ball { transform: scale(0.4); opacity: 0.4; }
.ball {
  position: absolute; width: 64px; height: 64px;
  pointer-events: auto; display: flex; align-items: center; justify-content: center;
}
.emoji { font-size: 52px; line-height: 64px; }
.ball.bounce .emoji { animation: hop 0.45s ease; }
@keyframes hop {
  0% { transform: scale(1); }
  40% { transform: scale(1.18) translateY(-8px); }
  100% { transform: scale(1); }
}
.bubble {
  position: absolute; right: 62px; top: 8px;
  background: #fff; color: #333; font-size: 24rpx;
  padding: 8rpx 16rpx; border-radius: 20rpx; white-space: nowrap;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,.08);
}
</style>
