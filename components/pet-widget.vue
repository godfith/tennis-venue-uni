<template>
  <view class="pet" :class="{ hide: hidden }" @touchmove.stop.prevent="onDrag">
    <view class="pet-body" :class="pose" :style="{ left: x + 'px', top: y + 'px' }" @tap.stop="poke" @longpress.stop="toggleHide">
      <view class="ear left"></view>
      <view class="ear right"></view>
      <view class="face">
        <view class="horn l"></view>
        <view class="horn r"></view>
        <view class="eye" :class="{ wink: pose === 'wink' }"></view>
        <view class="eye" :class="{ wink: pose === 'wink' }"></view>
        <view class="mouth" :class="pose"></view>
      </view>
      <view class="bubble" v-if="line">{{ line }}</view>
    </view>
  </view>
</template>
<script>
var LINES = ['咩～订场不？','点我干嘛！','余额还够打一场','山羊待命中','今天挥拍了吗','嘿嘿嘿','别戳了别戳了']
export default {
  data() { return { x: 0, y: 0, pose: 'idle', line: '', hidden: false, timer: null } },
  mounted() {
    try {
      var sys = uni.getSystemInfoSync()
      this.x = (sys.windowWidth || 320) - 88
      this.y = (sys.windowHeight || 640) - 220
    } catch (e) { this.x = 280; this.y = 480 }
    this.idleLoop()
  },
  beforeDestroy() { if (this.timer) clearInterval(this.timer) },
  methods: {
    idleLoop() {
      var that = this
      this.timer = setInterval(function () {
        if (that.hidden || that.pose === 'talk') return
        that.pose = that.pose === 'idle' ? 'blink' : 'idle'
      }, 1800)
    },
    poke() {
      if (this.hidden) { this.hidden = false; return }
      var i = Math.floor(Math.random() * LINES.length)
      this.line = LINES[i]
      this.pose = i % 2 ? 'talk' : 'wink'
      var that = this
      setTimeout(function () { that.pose = 'idle'; that.line = '' }, 1600)
    },
    toggleHide() {
      this.hidden = true
      this.line = ''
      uni.showToast({ title: '长按已收起，点角落再叫出来', icon: 'none' })
    },
    onDrag(e) {
      var t = e.touches && e.touches[0]
      if (!t) return
      this.x = Math.max(0, t.clientX - 36)
      this.y = Math.max(40, t.clientY - 36)
    }
  }
}
</script>
<style>
.pet { position: fixed; left: 0; top: 0; z-index: 90; pointer-events: none; }
.pet.hide .pet-body { transform: scale(0.45); opacity: 0.55; }
.pet-body { position: absolute; width: 72px; height: 72px; pointer-events: auto; transition: transform 0.2s; }
.pet-body.talk { transform: scale(1.12) rotate(-6deg); }
.pet-body.wink { transform: scale(1.08); }
.face { width: 64px; height: 64px; margin: 8px auto 0; background: #f3efe6; border-radius: 50%; border: 3px solid #1e4870; position: relative; box-shadow: 0 6px 14px rgba(30,72,112,.25); }
.ear { position: absolute; width: 16px; height: 22px; background: #d9cbb3; border: 2px solid #1e4870; border-radius: 12px 12px 4px 4px; top: 0; }
.ear.left { left: 8px; transform: rotate(-18deg); }
.ear.right { right: 8px; transform: rotate(18deg); }
.horn { position: absolute; top: -8px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 12px solid #1e4870; }
.horn.l { left: 14px; transform: rotate(-16deg); }
.horn.r { right: 14px; transform: rotate(16deg); }
.eye { position: absolute; top: 24px; width: 8px; height: 8px; background: #1e4870; border-radius: 50%; }
.eye:first-of-type { left: 16px; }
.eye:last-of-type { right: 16px; }
.eye.wink { height: 2px; top: 27px; border-radius: 2px; }
.mouth { position: absolute; left: 50%; bottom: 14px; width: 16px; height: 8px; margin-left: -8px; border: 2px solid #1e4870; border-top: none; border-radius: 0 0 12px 12px; }
.mouth.talk { height: 12px; border-radius: 8px; background: #1e4870; border: none; }
.bubble { position: absolute; right: 70px; top: 4px; background: #fff; color: #1e4870; font-size: 22rpx; padding: 8rpx 14rpx; border-radius: 12rpx; white-space: nowrap; box-shadow: 0 4rpx 12rpx rgba(0,0,0,.08); }
</style>
