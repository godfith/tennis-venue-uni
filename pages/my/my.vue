<template>
    <view class="page">
        <block v-if="!isLogin">
            <view class="login-box">
                <view class="login-title">欢迎使用网球场馆</view>
                <view class="login-desc">登录后可使用预约、查看订单等功能</view>
                <button class="login-btn" @tap="goLogin">去登录</button>
            </view>
        </block>

        <block v-else>
            <view class="user-card">
                <image class="avatar" :src="avatarUrl || '/static/images/avatar.png'" mode="aspectFill"></image>
                <view class="user-info">
                    <view class="nickname">{{ nickName }}</view>
                    <view class="user-id" v-if="phone">手机 {{ phone }}</view>
                    <view class="user-id">ID: {{ userId || '-' }}</view>
                </view>
            </view>

            <view class="menu-card">
                <view class="menu-item" @tap="goMyBooking">
                    <view class="menu-left">
                        <text class="menu-icon">📋</text>
                        <text class="menu-text">我的预约</text>
                    </view>
                    <text class="arrow">›</text>
                </view>
                <view class="menu-item" @tap="goMyCards">
                    <view class="menu-left">
                        <text class="menu-icon">💳</text>
                        <text class="menu-text">我的会员卡</text>
                    </view>
                    <text class="arrow">›</text>
                </view>
                <view class="menu-item" v-if="role === 'coach'" @tap="goCoachWorkbench">
                    <view class="menu-left">
                        <text class="menu-icon">🎾</text>
                        <text class="menu-text">教练工作台</text>
                    </view>
                    <text class="arrow">›</text>
                </view>
            </view>

            <view class="menu-card" style="margin-top: 24rpx">
                <view class="menu-item" @tap="comingSoon">
                    <view class="menu-left">
                        <text class="menu-icon">💬</text>
                        <text class="menu-text">联系客服</text>
                    </view>
                    <text class="arrow">›</text>
                </view>
                <view class="menu-item" @tap="comingSoon">
                    <view class="menu-left">
                        <text class="menu-icon">📝</text>
                        <text class="menu-text">意见反馈</text>
                    </view>
                    <text class="arrow">›</text>
                </view>
            </view>

            <view class="logout-btn" @tap="logout">退出登录</view>
            <view class="footer">山羊Goat网球馆</view>
        </block>
    </view>
</template>

<script>
export default {
    data() {
        return {
            isLogin: false,
            avatarUrl: '',
            nickName: '',
            openid: '',
            userId: '',
            phone: '',
            role: 'user'
        };
    },
    onShow() {
        this.checkLoginStatus();
    },
    methods: {
        checkLoginStatus() {
          const avatarUrl = uni.getStorageSync('avatarUrl') || ''
          const nickName = uni.getStorageSync('nickName') || ''
          const openid = uni.getStorageSync('openid') || ''
          const userId = uni.getStorageSync('userId') || uni.getStorageSync('userDocId') || ''
          const phone = uni.getStorageSync('phone') || ''
          const role = uni.getStorageSync('role') || 'user'

          if (nickName || phone) {
            this.isLogin = true
            this.avatarUrl = avatarUrl
            this.nickName = nickName || '会员'
            this.openid = openid
            this.userId = userId
            this.phone = phone
            this.role = role
          } else {
            this.isLogin = false
          }
        },

        goLogin() {
          uni.navigateTo({ url: '/pages/login/login' })
        },

        goMyBooking() {
            uni.navigateTo({ url: '/pages/mybooking/mybooking' });
        },

        goMyCards() {
            uni.navigateTo({ url: '/pages/mycards/mycards' });
        },

        goCoachWorkbench() {
            uni.navigateTo({ url: '/pages/coach-workbench/coach-workbench' });
        },

        comingSoon() {
            uni.showToast({ title: '功能即将上线', icon: 'none' });
        },

        logout() {
            uni.showModal({
                title: '提示',
                content: '确定要退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        ;['avatarUrl','nickName','openid','userId','userDocId','phone','role'].forEach((k) => {
                          uni.removeStorageSync(k)
                        })
                        this.isLogin = false
                        this.avatarUrl = ''
                        this.nickName = ''
                        this.openid = ''
                        this.userId = ''
                        this.phone = ''
                        this.role = 'user'
                        uni.showToast({ title: '已退出登录', icon: 'success' });
                    }
                }
            });
        }
    }
};
</script>
<style>
.page {
    min-height: 100vh;
    background: #f5f6f8;
    padding: 30rpx;
    box-sizing: border-box;
}
.login-box {
    margin-top: 100rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
}
.login-title {
    font-size: 40rpx;
    font-weight: 700;
    color: #222;
    margin-bottom: 16rpx;
}
.login-desc {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 50rpx;
}
.login-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background: #07c160 !important;
    color: #fff !important;
    border-radius: 16rpx;
    font-size: 32rpx;
    margin: 0;
}
.user-card {
    background: linear-gradient(135deg, #1a5c3a, #2d8a5e);
    border-radius: 24rpx;
    padding: 48rpx 36rpx;
    display: flex;
    align-items: center;
    color: #fff;
    margin-bottom: 30rpx;
    box-shadow: 0 12rpx 30rpx rgba(26, 92, 58, 0.25);
}
.user-card .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 28rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.4);
}
.nickname {
    font-size: 36rpx;
    font-weight: 600;
    margin-bottom: 10rpx;
}
.user-id {
    font-size: 24rpx;
    opacity: 0.8;
}
.menu-card {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}
.menu-item {
    padding: 34rpx 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #f5f5f5;
}
.menu-item:last-child {
    border-bottom: none;
}
.menu-left {
    display: flex;
    align-items: center;
}
.menu-icon {
    font-size: 36rpx;
    margin-right: 20rpx;
}
.menu-text {
    font-size: 30rpx;
    color: #333;
}
.arrow {
    color: #ccc;
    font-size: 34rpx;
}
.footer {
    text-align: center;
    font-size: 24rpx;
    color: #bbb;
    margin-top: 60rpx;
}
.logout-btn {
    margin-top: 40rpx;
    height: 90rpx;
    line-height: 90rpx;
    text-align: center;
    background: #fff;
    border-radius: 16rpx;
    color: #ff4d4f;
    font-size: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}
</style>
