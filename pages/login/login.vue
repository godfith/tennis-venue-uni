<template>
  <view class="page">
    <view class="hero">
      <view class="logo-text">山羊Goat</view>
      <view class="logo-sub">网球馆</view>
    </view>

    <view class="card">
      <view class="title">会员登录</view>
      <view class="desc">登录后可预约场地、使用会员卡</view>

      <!-- 头像 -->
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar" :src="avatarUrl || '/static/images/avatar.png'" mode="aspectFill" />
        <view class="avatar-tip">选择头像</view>
      </button>

      <!-- 昵称 -->
      <view class="field">
        <input
          class="input"
          type="nickname"
          placeholder="请输入微信昵称"
          :value="nickName"
          @blur="onNicknameBlur"
          @input="onNicknameInput"
        />
      </view>

      <!-- 手机号：必须用 button getPhoneNumber -->
      <view class="field phone-row">
        <view class="phone-text">{{ phone || '未授权手机号' }}</view>
        <button
          class="phone-btn"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhone"
        >
          {{ phone ? '重新授权' : '授权手机号' }}
        </button>
      </view>

      <button class="submit-btn" :loading="loading" @tap="submit">确认登录</button>
      <view class="hint">需完成头像、昵称、手机号后才能使用</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      avatarUrl: '',
      nickName: '',
      phone: '',
      openid: '',
      loading: false
    }
  },
  onLoad() {
    // 已登录则回首页
    const nick = uni.getStorageSync('nickName')
    const phone = uni.getStorageSync('phone')
    if (nick && phone) {
      uni.switchTab({ url: '/pages/index/index' })
      return
    }
    this.avatarUrl = uni.getStorageSync('avatarUrl') || ''
    this.nickName = uni.getStorageSync('nickName') || ''
    this.phone = uni.getStorageSync('phone') || ''
    this.ensureOpenid()
  },
  methods: {
    ensureOpenid() {
      const local = uni.getStorageSync('openid')
      if (local) {
        this.openid = local
        return Promise.resolve(local)
      }
      return wx.cloud
        .callFunction({
          name: 'login',
          data: { action: 'openid' }
        })
        .then((res) => {
          const openid = res.result && res.result.openid
          if (openid) {
            this.openid = openid
            uni.setStorageSync('openid', openid)
          }
          return openid
        })
        .catch((err) => {
          console.error(err)
          return ''
        })
    },

    onChooseAvatar(e) {
      this.avatarUrl = e.detail.avatarUrl || ''
    },

    onNicknameInput(e) {
      this.nickName = (e.detail.value || '').trim()
    },

    onNicknameBlur(e) {
      this.nickName = (e.detail.value || '').trim()
    },

    onGetPhone(e) {
      const detail = e.detail || {}
      if (detail.errMsg && detail.errMsg.indexOf('ok') === -1) {
        uni.showToast({ title: '需要授权手机号', icon: 'none' })
        return
      }
      // 新版返回 code
      const code = detail.code
      if (!code) {
        uni.showToast({ title: '获取手机号失败，请更新微信', icon: 'none' })
        return
      }
      uni.showLoading({ title: '解析中' })
      wx.cloud
        .callFunction({
          name: 'login',
          data: { action: 'getPhone', phoneCode: code }
        })
        .then((res) => {
          uni.hideLoading()
          const phone = res.result && res.result.phone
          if (!phone) {
            uni.showToast({ title: res.result?.msg || '解析手机号失败', icon: 'none' })
            return
          }
          this.phone = phone
          uni.showToast({ title: '已获取手机号', icon: 'success' })
        })
        .catch((err) => {
          uni.hideLoading()
          console.error(err)
          uni.showToast({ title: '获取失败', icon: 'none' })
        })
    },

    async submit() {
      if (!this.avatarUrl) {
        uni.showToast({ title: '请选择头像', icon: 'none' })
        return
      }
      if (!this.nickName) {
        uni.showToast({ title: '请填写昵称', icon: 'none' })
        return
      }
      if (!this.phone) {
        uni.showToast({ title: '请授权手机号', icon: 'none' })
        return
      }

      this.loading = true
      try {
        await this.ensureOpenid()
        if (!this.openid) {
          uni.showToast({ title: '登录标识获取失败', icon: 'none' })
          return
        }

        const res = await wx.cloud.callFunction({
          name: 'login',
          data: {
            action: 'register',
            nickName: this.nickName,
            avatarUrl: this.avatarUrl,
            phone: this.phone
          }
        })
        const result = res.result || {}
        if (!result.ok) {
          uni.showToast({ title: result.msg || '登录失败', icon: 'none' })
          return
        }

        uni.setStorageSync('avatarUrl', result.avatarUrl || this.avatarUrl)
        uni.setStorageSync('nickName', result.nickName || this.nickName)
        uni.setStorageSync('phone', result.phone || this.phone)
        uni.setStorageSync('openid', result.openid || this.openid)
        uni.setStorageSync('userId', result.userId || '')
        uni.setStorageSync('userDocId', result.userDocId || '')
        uni.setStorageSync('role', result.role || 'user')

        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 500)
      } catch (e) {
        console.error(e)
        uni.showToast({ title: '登录失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a5c3a 0%, #f5f6f8 40%);
  padding: 80rpx 40rpx 40rpx;
  box-sizing: border-box;
}
.hero {
  text-align: center;
  color: #fff;
  margin-bottom: 48rpx;
}
.logo-text {
  font-size: 48rpx;
  font-weight: 700;
}
.logo-sub {
  font-size: 28rpx;
  opacity: 0.85;
  margin-top: 8rpx;
}
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 36rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
}
.desc {
  font-size: 26rpx;
  color: #999;
  margin: 12rpx 0 40rpx;
}
.avatar-btn {
  padding: 0;
  margin: 0 0 12rpx;
  background: transparent;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}
.avatar-btn::after {
  border: none;
}
.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: block;
}
.avatar-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 22rpx;
  text-align: center;
  padding: 6rpx 0;
}
.field {
  width: 100%;
  margin-top: 28rpx;
}
.input {
  width: 100%;
  height: 88rpx;
  background: #f5f6f8;
  border-radius: 16rpx;
  padding: 0 28rpx;
  box-sizing: border-box;
  font-size: 30rpx;
  text-align: center;
}
.phone-row {
  display: flex;
  align-items: center;
  background: #f5f6f8;
  border-radius: 16rpx;
  padding: 12rpx 16rpx 12rpx 28rpx;
  box-sizing: border-box;
}
.phone-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.phone-btn {
  margin: 0;
  padding: 0 24rpx;
  height: 64rpx;
  line-height: 64rpx;
  font-size: 24rpx;
  background: #1a5c3a !important;
  color: #fff !important;
  border-radius: 12rpx;
}
.phone-btn::after {
  border: none;
}
.submit-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  margin-top: 48rpx;
  background: #07c160 !important;
  color: #fff !important;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
}
.hint {
  margin-top: 24rpx;
  font-size: 22rpx;
  color: #bbb;
}
</style>
