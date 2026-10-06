<template>
  <view class="page">
    <view class="hero">
      <view class="logo-text">山羊Goat</view>
      <view class="logo-sub">网球馆</view>
    </view>

    <view class="card">
      <view class="title">手机号登录</view>
      <view class="desc">输入手机号即可，新号码会自动注册</view>

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
        <view class="phone-label">手机号 {{ phone || '未验证' }}</view>
        <button class="phone-btn" open-type="getPhoneNumber" :loading="loading" @getphonenumber="onGetPhone">微信手机号一键登录</button>
      </view>
      <view class="hint">点一次即验证并登录，会消耗 1 次手机号验证额度。已有号码直接进入原账号。</view>
    </view>
  </view>
</template>

<script>
import { callCloud } from '@/utils/api'

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
    if (phone) {
      this.goAfterLogin()
      return
    }
    this.avatarUrl = uni.getStorageSync('avatarUrl') || ''
    this.nickName = uni.getStorageSync('nickName') || ''
    this.phone = uni.getStorageSync('phone') || ''
    this.ensureOpenid()
  },
  methods: {
    goAfterLogin() {
      if (!uni.getStorageSync('venue_id')) {
        uni.redirectTo({ url: '/pages/venue-select/venue-select' })
        return
      }
      uni.switchTab({ url: '/pages/index/index' })
    },
    wxLoginCode() {
      return new Promise(function (resolve) {
        wx.login({
          success: function (r) {
            resolve((r && r.code) || '')
          },
          fail: function () {
            resolve('')
          }
        })
      })
    },
    async ensureOpenid() {
      const local = uni.getStorageSync('openid')
      if (local) {
        this.openid = local
        return local
      }
      try {
        const code = await this.wxLoginCode()
        const res = await callCloud({
          name: 'login',
          data: { action: 'openid', code: code }
        })
        const openid = res.result && res.result.openid
        if (openid) {
          this.openid = openid
          uni.setStorageSync('openid', openid)
        }
        return openid || ''
      } catch (err) {
        console.error(err)
        return ''
      }
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
    async onGetPhone(e) {
      const detail = (e && e.detail) || {}
      if (!detail.code) {
        uni.showToast({ title: '需要授权手机号', icon: 'none' })
        return
      }
      this.loading = true
      try {
        const res = await callCloud({
          name: 'login',
          data: { action: 'getPhone', phoneCode: detail.code }
        })
        const result = res.result || {}
        if (!result.ok || !result.phone) {
          uni.showToast({ title: result.msg || '手机号验证失败', icon: 'none' })
          return
        }
        this.phone = String(result.phone).replace(/\D/g, '').slice(-11)
        await this.submit()
      } catch (err) {
        this.loading = false
        uni.showToast({ title: '手机号验证失败', icon: 'none' })
      }
    },
    async submit() {
      if (!this.phone || this.phone.length < 8) {
        uni.showToast({ title: '请先用微信验证手机号', icon: 'none' })
        return
      }
      this.loading = true
      try {
        await this.ensureOpenid()
        const code = await this.wxLoginCode()
        const res = await callCloud({
          name: 'login',
          data: {
            action: 'register',
            code: code,
            nickName: this.nickName,
            avatarUrl: this.avatarUrl,
            phone: this.phone,
            openid: this.openid || ''
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
        uni.setStorageSync('userDocId', result.userDocId || result.userId || '')
        uni.setStorageSync('role', result.role || 'user')
        uni.setStorageSync('balance', result.balance != null ? result.balance : 0)
        uni.setStorageSync('points', result.points != null ? result.points : 0)
        if (result.venueId) {
          uni.setStorageSync('venue_id', result.venueId)
          uni.setStorageSync('venue_name', result.venueName || '')
          uni.setStorageSync('home_venue_id', result.venueId)
          uni.setStorageSync('home_venue_name', result.venueName || '')
        } else if (!uni.getStorageSync('venue_id')) {
          uni.setStorageSync('venue_id', 'venue_chenjiaci')
          uni.setStorageSync('venue_name', '山羊Goat网球馆（陈家祠店）')
        }
        uni.showToast({ title: result.isNew ? '已注册并登录' : (result.msg || '登录成功'), icon: 'success' })
        setTimeout(() => {
          this.goAfterLogin()
        }, 400)
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
.phone-btn { width: 100%; height: 80rpx; line-height: 80rpx; margin-bottom: 16rpx; background: #e8f0e9; color: #1a5c3a; border-radius: 16rpx; font-size: 28rpx; }
.phone-btn::after { border: none; }
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
