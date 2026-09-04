<script>
import { installHttpCloud } from '@/utils/api'

function needLogin() {
  const nickName = uni.getStorageSync('nickName')
  const phone = uni.getStorageSync('phone')
  return !nickName || !phone
}

function goLoginIfNeeded() {
  try {
    const pages = getCurrentPages()
    const cur = pages && pages.length ? pages[pages.length - 1] : null
    const route = cur ? cur.route || cur.__route__ : ''
    if (route === 'pages/login/login') return
    if (needLogin()) {
      uni.reLaunch({ url: '/pages/login/login' })
    }
  } catch (e) {
    console.error(e)
  }
}

export default {
  onLaunch() {
    installHttpCloud()
    setTimeout(goLoginIfNeeded, 50)
  },
  onShow() {
    installHttpCloud()
    setTimeout(goLoginIfNeeded, 50)
  },
  globalData: {}
}
</script>
<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

button {
  background: initial;
}

button:focus {
  outline: 0;
}

button::after {
  border: none;
}

page {
  background: #f6f6f6;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-size: 28rpx;
  color: #333;
}
</style>
