<template>
  <view class="page">
    <view class="avatar-section">
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar" :src="avatar || '/static/images/avatar.png'" mode="aspectFill"></image>
        <view class="avatar-tip">点击更换头像</view>
      </button>
    </view>

    <view class="form-item">
      <view class="label">姓名</view>
      <input class="input" :value="name" @input="onNameInput" placeholder="请输入姓名" />
    </view>

    <view class="form-item">
      <view class="label">头衔</view>
      <input class="input" :value="title" @input="onTitleInput" placeholder="例如：高级教练" />
    </view>

    <view class="form-item">
      <view class="label">个人介绍</view>
      <textarea class="textarea" :value="desc" @input="onDescInput" placeholder="请输入个人介绍" maxlength="200" />
    </view>

    <button class="save-btn" :loading="saving" @tap="onSave">保存</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      name: '',
      title: '',
      desc: '',
      avatar: '',
      saving: false
    }
  },
  onLoad(options) {
    this.id = options.id || ''
    this.loadDetail()
  },
  methods: {
    loadDetail() {
      var that = this
      if (!that.id) return
      wx.cloud.callFunction({
        name: 'userApi',
        data: { action: 'getCoachDetail', id: that.id },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok || !result.coach) {
            uni.showToast({ title: result.msg || '加载失败', icon: 'none' })
            return
          }
          var c = result.coach
          that.name = c.name || ''
          that.title = c.title || ''
          that.desc = c.desc || c.remark || ''
          that.avatar = c.avatar || ''
        },
        fail: function (err) {
          console.error(err)
          uni.showToast({ title: '加载失败', icon: 'none' })
        }
      })
    },
    onChooseAvatar(e) {
      this.avatar = (e.detail && e.detail.avatarUrl) || ''
    },
    onNameInput(e) {
      this.name = e.detail.value
    },
    onTitleInput(e) {
      this.title = e.detail.value
    },
    onDescInput(e) {
      this.desc = e.detail.value
    },
    onSave() {
      var that = this
      if (!that.name.trim()) {
        uni.showToast({ title: '请输入姓名', icon: 'none' })
        return
      }
      that.saving = true
      var remark = ''
      if (that.title.trim()) remark += that.title.trim()
      if (that.desc.trim()) {
        remark += (remark ? ' | ' : '') + that.desc.trim()
      }
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'updateCoachProfile',
          id: that.id,
          name: that.name.trim(),
          remark: remark,
          avatar: that.avatar || ''
        },
        success: function (res) {
          var result = res.result || {}
          if (!result.ok) {
            uni.showToast({ title: result.msg || '保存失败', icon: 'none' })
            return
          }
          uni.showToast({ title: '保存成功', icon: 'success' })
          setTimeout(function () {
            uni.navigateBack()
          }, 800)
        },
        fail: function (err) {
          console.error(err)
          uni.showToast({ title: '保存失败', icon: 'none' })
        },
        complete: function () {
          that.saving = false
        }
      })
    }
  }
}
</script>

<style>
.page {
  padding: 30rpx;
  background: #f5f6f8;
  min-height: 100vh;
}
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}
.avatar-btn {
  padding: 0;
  margin: 0;
  background: transparent;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}
.avatar-btn::after {
  border: none;
}
.avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  display: block;
  background: #f0f0f0;
}
.avatar-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 22rpx;
  text-align: center;
  padding: 8rpx 0;
}
.form-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
}
.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}
.input {
  font-size: 30rpx;
  color: #222;
}
.textarea {
  width: 100%;
  height: 180rpx;
  font-size: 30rpx;
  color: #222;
}
.save-btn {
  margin-top: 40rpx;
  background: #07c160 !important;
  color: #fff !important;
  border-radius: 40rpx;
  font-size: 32rpx;
}
</style>
