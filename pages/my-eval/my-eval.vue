<template>
  <view class="page">
    <view class="card" v-if="latest">
      <canvas canvas-id="radar" id="radar" class="radar"></canvas>
      <view class="total">总分 {{ latest.total }}</view>
      <view class="scores">
        <view class="score-item"><text>正手</text><text>{{ latest.forehand }}</text></view>
        <view class="score-item"><text>反手</text><text>{{ latest.backhand }}</text></view>
        <view class="score-item"><text>发球</text><text>{{ latest.serve }}</text></view>
        <view class="score-item"><text>截击</text><text>{{ latest.volley }}</text></view>
        <view class="score-item"><text>切削</text><text>{{ latest.slice }}</text></view>
        <view class="score-item"><text>高压</text><text>{{ latest.smash }}</text></view>
        <view class="score-item"><text>放小球</text><text>{{ latest.drop_shot }}</text></view>
      </view>
      <view class="coach">教练：{{ latest.coach_name || '-' }}</view>
      <view class="time">{{ latest.created_at }}</view>
    </view>
    <view class="empty" v-else>暂无评测记录</view>
    <view class="history" v-if="list.length > 1">
      <view class="hist-title">历史评测</view>
      <view class="hist-item" v-for="(h, i) in list.slice(1)" :key="i" @click="showHist(h)">
        <text>{{ h.created_at }}</text>
        <text>总分 {{ h.total }}</text>
      </view>
    </view>
  </view>
</template>
<script>
import { callCloud } from '@/utils/api.js'
export default {
  data() {
    return { list: [], latest: null }
  },
  onLoad() {
    this.load()
  },
  methods: {
    async load() {
      const userId = uni.getStorageSync('userDocId') || uni.getStorageSync('userId') || ''
      if (!userId) { uni.showToast({ title: '请先登录', icon: 'none' }); return }
      const res = await callCloud({ name: 'userApi', data: { action: 'getMyEvaluations', userId } })
      const r = res.result || res
      if (r && r.ok) {
        this.list = r.list || []
        this.latest = this.list[0] || null
        if (this.latest) this.$nextTick(() => this.drawRadar(this.latest))
      }
    },
    showHist(h) {
      this.latest = h
      this.$nextTick(() => this.drawRadar(h))
    },
    drawRadar(scores) {
      const ctx = uni.createCanvasContext('radar', this)
      const w = 300, h = 280
      const cx = w / 2, cy = h / 2
      const r = 90
      const labels = ['正手', '反手', '发球', '截击', '切削', '高压', '放小球']
      const keys = ['forehand', 'backhand', 'serve', 'volley', 'slice', 'smash', 'drop_shot']
      const n = 7
      ctx.clearRect(0, 0, w, h)
      ctx.setStrokeStyle('#ddd')
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath()
        for (let j = 0; j < n; j++) {
          const angle = (Math.PI * 2 / n) * j - Math.PI / 2
          const x = cx + Math.cos(angle) * r * i / 5
          const y = cy + Math.sin(angle) * r * i / 5
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }
      ctx.setStrokeStyle('#aaa')
      for (let j = 0; j < n; j++) {
        const angle = (Math.PI * 2 / n) * j - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.setFillStyle('rgba(26,92,58,0.3)')
      ctx.setStrokeStyle('#1a5c3a')
      ctx.setLineWidth(2)
      for (let j = 0; j < n; j++) {
        const angle = (Math.PI * 2 / n) * j - Math.PI / 2
        const val = (scores[keys[j]] || 0) / 100
        const x = cx + Math.cos(angle) * r * val
        const y = cy + Math.sin(angle) * r * val
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.setFillStyle('#333')
      ctx.setFontSize(12)
      ctx.setTextAlign('center')
      for (let j = 0; j < n; j++) {
        const angle = (Math.PI * 2 / n) * j - Math.PI / 2
        const x = cx + Math.cos(angle) * (r + 20)
        const y = cy + Math.sin(angle) * (r + 20)
        ctx.fillText(labels[j], x, y)
        ctx.setFillStyle('#1a5c3a')
        ctx.fillText(String(scores[keys[j]] || 0), x, y + 14)
        ctx.setFillStyle('#333')
      }
      ctx.draw()
    }
  }
}
</script>
<style>
.page { padding: 24rpx; background: #f4f2ee; min-height: 100vh; }
.card { background: #fff; border-radius: 16rpx; padding: 24rpx; }
.radar { width: 600rpx; height: 560rpx; margin: 0 auto; display: block; }
.total { text-align: center; font-size: 40rpx; font-weight: 700; color: #1a5c3a; margin: 16rpx 0; }
.scores { display: flex; flex-wrap: wrap; justify-content: center; gap: 16rpx; margin: 16rpx 0; }
.score-item { background: #f5f5f5; padding: 8rpx 16rpx; border-radius: 8rpx; font-size: 24rpx; }
.score-item text:last-child { color: #1a5c3a; font-weight: 700; margin-left: 8rpx; }
.coach, .time { text-align: center; color: #999; font-size: 24rpx; margin-top: 8rpx; }
.empty { text-align: center; color: #aaa; padding: 100rpx 0; }
.history { margin-top: 24rpx; background: #fff; border-radius: 16rpx; padding: 24rpx; }
.hist-title { font-weight: 700; margin-bottom: 16rpx; }
.hist-item { display: flex; justify-content: space-between; padding: 16rpx 0; border-bottom: 1rpx solid #eee; }
</style>
