<script>
import { installHttpCloud } from '@/utils/api'

function needLogin() {
  const nickName = uni.getStorageSync('nickName')
  const phone = uni.getStorageSync('phone')
  return !nickName || !phone
}

function needVenue() {
  return !uni.getStorageSync('venue_id')
}

function currentRoute() {
  try {
    const pages = getCurrentPages()
    const cur = pages && pages.length ? pages[pages.length - 1] : null
    return cur ? cur.route || cur.__route__ || '' : ''
  } catch (e) {
    return ''
  }
}

function guard() {
  const route = currentRoute()
  if (route === 'pages/login/login') return
  if (needLogin()) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }
  if (route === 'pages/venue-select/venue-select') return
  if (needVenue()) {
    uni.reLaunch({ url: '/pages/venue-select/venue-select' })
  }
}

export default {
  onLaunch() {
    installHttpCloud()
    setTimeout(guard, 50)
  },
  onShow() {
    installHttpCloud()
    setTimeout(guard, 50)
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
