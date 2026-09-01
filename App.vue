<script>
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
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-d3g0pb1qk028e3585-d862bc2',
        traceUser: true
      })
    }
    setTimeout(goLoginIfNeeded, 50)
  },
  onShow() {
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
}
</style>
