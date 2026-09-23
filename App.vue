<script>
import { installHttpCloud } from '@/utils/api'

export default {
  onLaunch() {
    installHttpCloud()
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
