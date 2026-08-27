<template>
  <view class="page">
    <view class="hero">
      <view class="logo-text">山羊Goat</view>
      <view class="logo-sub">网球馆</view>
    </view>

    <view class="card">
      <view class="title">会员登录</view>
      <view class="desc">登录后可预约场地、使用会员卡</view>

      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar" :src="avatarUrl || '/static/images/avatar.png'" mode="aspectFill" />
        <view class="avatar-tip">选择头像</view>
      </button>

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

      <view class="field">
        <view class="phone-label">手机号</view>
        <input
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入11位手机号"
          :value="phone"
          @input="onPhoneInput"
        />
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
    onPhoneInput(e) {
      this.phone = String(e.detail.value || '').replace(/\D/g, '').slice(0, 11)
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
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({ title: '请填写11位手机号', icon: 'none' })
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
  background: linear-gradient(180deg, #1e4870 0%, #f4f2ee 42%);
  padding: 80rpx 40rpx 40rpx;
  box-sizing: border-box;
}
.hero { text-align: center; color: #fff; margin-bottom: 48rpx; }
.logo-text { font-size: 48rpx; font-weight: 700; }
.logo-sub { font-size: 28rpx; opacity: 0.85; margin-top: 8rpx; }
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 36rpx;
  box-shadow: 0 12rpx 40rpx rgba(30, 72, 112, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title { font-size: 36rpx; font-weight: 700; color: #1e4870; }
.desc { font-size: 26rpx; color: #999; margin: 12rpx 0 40rpx; }
.avatar-btn {
  padding: 0; margin: 0 0 12rpx; background: transparent;
  width: 160rpx; height: 160rpx; border-radius: 50%; overflow: hidden; position: relative;
}
.avatar-btn::after { border: none; }
.avatar { width: 160rpx; height: 160rpx; border-radius: 50%; background: #f0f0f0; display: block; }
.avatar-tip {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(30, 72, 112, 0.55); color: #fff; font-size: 22rpx; text-align: center; padding: 6rpx 0;
}
.field { width: 100%; margin-top: 28rpx; }
.phone-label { font-size: 26rpx; color: #666; margin-bottom: 12rpx; }
.input {
  width: 100%; height: 88rpx; background: #f4f2ee; border-radius: 16rpx;
  padding: 0 28rpx; box-sizing: border-box; font-size: 30rpx; text-align: center;
}
.submit-btn {
  width: 100%; height: 90rpx; line-height: 90rpx; margin-top: 48rpx;
  background: #1e4870 !important; color: #fff !important;
  border-radius: 16rpx; font-size: 32rpx; font-weight: 500;
}
.hint { margin-top: 24rpx; font-size: 22rpx; color: #bbb; }
</style>
