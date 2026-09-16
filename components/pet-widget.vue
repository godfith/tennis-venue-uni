<template>
  <view class="wrap">
    <view class="pet" :style="boxStyle" @touchstart="onStart" @touchmove.stop.prevent="onMove" @touchend="onEnd">
      <view class="bubble" v-if="line">{{ line }}</view>
      <image class="pic" :class="pose" :src="pic" mode="aspectFit" />
    </view>
  </view>
</template>
<script>
var FRAMES = {
  sit: 'data:image/jpeg;base64,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',
  jump: 'data:image/jpeg;base64,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',
  wink: 'data:image/jpeg;base64,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',
  lie: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABgAGADASIAAhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAAAAUEBgECAwf/xAAzEAACAQMDAgMHAwMFAAAAAAABAgMABBEFEiEGMUFRYQcTFCJxgZEyodEVscEzQlJygv/EABgBAQEBAQEAAAAAAAAAAAAAAAIAAQME/8QAHxEAAwACAwEAAwAAAAAAAAAAAAECAxESITETBDJB/9oADAMBAAIRAxEAPwD2WiiiiaFFFB7cVEayoXjZVdkJHDL3FJ4rbWGuVWW4ZIVOWcODuHkB61MuZb0ZEcYA815pVO2oEnIf96xzsSposZZR3IH3rX3if81/NVbbeseVb8V0jguz/sb8UtBLOCD2IP0NFJILS7yCFZfUnFNrZJI49sjbjUR1ooorCCiiiogoooqIwzBVLMcADJJrlb3UdwzCPd8vfIxXSRBJGyN2YYNZVSqgZyfE471EZorG4b9mfmxms1EFFFFRBRRRUQUUUVEFBOBk1yu7hLW3eaQgBR4nv6Uka4vdTZ/h3Nvb8DLDnIPOPxWVSQph0WCtHmjQqGcAsdqjPc0mupNU3sI3jKEY74J/ily6dcsEaW7cMpLYQYwTQeRDWJlonfZC7qQD2B9a2g94IwJgN44yDnPrVQuLm8tnghk+eINw2eSe/wCTTmy6o0q7Xm5EMg4aKX5WU+VJWmF46Q5oqEmr6fI+yO7iZvJTmpisHUMpyCMg0tgaa9M0UUVEFLtdu7qztA9kiNIWx8/YUxrDKrqVZQwPgRmp9o2Wk9soIXWNY1CD4+Qe5SQMIkGAxB4+1cOtOornph9NjWVkgeOZ393CHLsn6VyeykkZ8RXoIgSNGECIjHyGOarGrafaaqYoNYsxJHE25A+VwfHkdwfEeNcaXH3s9U19G9daHFvJ8RbRTBSBJGr48sgH/NUP2paxc6XFbQwrcBZ4pCkkMxj2SgrgkjuAM8evpVvvrhzJB7gShEOXEbqoK47c+uPtmuGpm1vLYJeW8MqghtkqhgpoJ67Fx30LdLaW86Z025uy5neBJJC5yxPfJqTqXT9tc6isSoHZ13K+cHtnB/muV6bqGEvNGyo3AzgY8uPAV1t7pp5EePdtAxuIxnw4pR36HI3FJyyTp/THw8gYhIwPHIJ+1WaMKsaqn6QMD6VAjui9s4lJJAwAPGpdmVa1j2DChcAfSu0yp8PPkure6O1FFFaAKKKUdRWV1ex24ttVn08I7F2hxmQY4HP5o3Shcmak29Ib0l1aC6KuixGWFjkbe4pPZ3muaU0sBP8AWowd4lM4jlC47YPB5H71E1nrCGGJA7XtvNI+xreaHBA55DDgj6UdzknaGtwyGs2qJdSW8iKSOVycNjwz6040S01CWdriWKMrGMKobJ3Hx59KrljrlrJrDkTKx2gZLd6uGl6kglZVYBnAOfD8VnBD+j/hi90i8uo2M7qMniMclv8AFTJ7WK30+NlHzEDmp0l7EI+H+bGM7aSarqCCKONWIUDAye5ppJeHN069NzIBHjzrWHUmtpCobgc4PaktzrVvCAm/fIeyKMk/aoVuNWv5g7RRwxE8gsS2KytvwUtJ9npUbiSNHXswBFbVF0xpWtVEyqu0ALtGBipVM5BSXqk3i2kRsbeSdt53CMZIGKdUq6g0eTWIYY4tUvNPaJi2+1IBbIxg58KGTGskua8Yopy9optlqZ0+6lbVJktXIAMczYYDv2pR1Z1Po11ZyW9vtuZW7E/KqnzyfGnd17KrW9uWuL/XdRuJGxuZ1TJx61KtfZZ09B+o3Mp83YfxW48c45Uoqt09s8p0u7CXI+L+BuA54HIIz4dv3q62clgjpJbrNC6H5DHNuA/8kj8Vbz7PtA27VgceRG3I/allz7NIhlrDVZoj4LKgYftg1mRW/wBTv+PWBJrKjVNSaYBVurRG85t6D+x/vXaHpKTU5Bd3d9DcjspiY7B6Dmk9x0Z1JZ827W92ox/pybT+G/mrd0Jp19pWj/DX8Hu5GkaRiXB5OOOPpRh3vVIWecCneOtnWy6WtLUYUIP+q03gsbeH9KAnzPNSKK7HkCiiisI//9k='
}
var LINES = { jump: '发球！', wink: '嘿嘿～', lie: '歇一会儿', sit: '要订场吗' }
export default {
  data() {
    return { pose: 'sit', line: '', ox: 0, oy: 0, startX: 0, startY: 0, moved: false }
  },
  computed: {
    pic() { return FRAMES[this.pose] || FRAMES.sit },
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
