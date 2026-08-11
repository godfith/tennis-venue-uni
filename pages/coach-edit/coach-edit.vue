<template>
    <view class="page">
        <!-- 头像 -->
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
            <input class="input" :value="title" @input="onTitleInput" placeholder="例如：高级教练 · 10年经验" />
        </view>

        <view class="form-item">
            <view class="label">个人介绍</view>
            <textarea class="textarea" :value="desc" @input="onDescInput" placeholder="请输入个人介绍" maxlength="200" />
        </view>

        <view class="form-item">
            <view class="label">标签（用逗号分隔）</view>
            <input class="input" :value="tagsStr" @input="onTagsInput" placeholder="例如：底线,战术,青少年" />
        </view>

        <button class="save-btn" @tap="onSave">保存</button>
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
            tagsStr: '',
            avatar: ''
        };
    },
    onLoad(options) {
      const id = options.id
      this.id = id
      this.loadDetail(id)
    },
    methods: {
        loadDetail(id) {
          const db = wx.cloud.database()
          db.collection('coaches').doc(id).get().then((res) => {
            const data = res.data
            this.name = data.name || ''
            this.title = data.title || ''
            this.desc = data.desc || ''
            this.tagsStr = (data.tags || []).join(',')
            this.avatar = data.avatar || ''
          })
        },

        // 选择头像
onChooseAvatar(e) {
  this.avatar = e.detail.avatarUrl
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
onTagsInput(e) {
  this.tagsStr = e.detail.value
},

        onSave() {
            const { id, name, title, desc, tagsStr, avatar } = this;
            if (!name.trim()) {
                uni.showToast({
                    title: '请输入姓名',
                    icon: 'none'
                });
                return;
            }
            const tags = tagsStr
                .split(/[,，]/)
                .map((t) => t.trim())
                .filter((t) => t);
            const db = wx.cloud.database();
            uni.showLoading({
                title: '保存中...'
            });
            db.collection('coaches')
                .doc(id)
                .update({
                    data: {
                        name: name.trim(),
                        title: title.trim(),
                        desc: desc.trim(),
                        tags: tags,
                        avatar: avatar,
                        updateTime: db.serverDate()
                    }
                })
                .then(() => {
                    uni.hideLoading();
                    uni.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });
                    setTimeout(() => {
                        uni.navigateBack();
                    }, 1000);
                })
                .catch((err) => {
                    uni.hideLoading();
                    console.error(err);
                    uni.showToast({
                        title: '保存失败',
                        icon: 'none'
                    });
                });
        }
    }
};
</script>
<style>
.page {
    padding: 30rpx;
    background: #f5f6f8;
    min-height: 100vh;
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
</style>
