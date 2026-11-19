<script>
import { installHttpCloud } from '@/utils/api'

export default {
  onLaunch() {
    installHttpCloud()
    // 强制拉取新版本：全量发布后用户打开即提示更新并重启
    try {
      if (typeof uni !== 'undefined' && typeof uni.getUpdateManager === 'function') {
        const u = uni.getUpdateManager()
        u.onCheckForUpdate(() => {})
        u.onUpdateReady(() => {
          uni.showModal({
            title: '更新提示',
            content: '新版本已就绪，重启后使用',
            showCancel: false,
            success: () => u.applyUpdate()
          })
        })
        u.onUpdateFailed(() => {
          uni.showToast({ title: '请删除小程序后重进', icon: 'none' })
        })
      }
    } catch (e) {}
  },
  onShow() {
    installHttpCloud()
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