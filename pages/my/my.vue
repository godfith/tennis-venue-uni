<template>
    <view class="page">
        <!-- 未登录状态 -->
        <block v-if="!isLogin">
            <view class="login-box">
                <view class="login-title">欢迎使用网球场馆</view>
                <view class="login-desc">登录后可使用预约、查看订单等功能</view>

                <!-- 头像选择 -->
                <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                    <image class="avatar" :src="avatarUrl || '/static/images/avatar.png'" mode="aspectFill"></image>
                    <view class="avatar-tip">点击选择头像</view>
                </button>

                <!-- 昵称输入 -->
                <view class="nickname-box">
                    <input class="nickname-input" type="nickname" placeholder="请输入昵称" :value="nickName" @input="onNicknameChange" />
                </view>

                <button class="login-btn" @tap="doLogin">确认登录</button>
            </view>
        </block>

        <!-- 已登录状态 -->
        <block v-else>
            <!-- 用户信息卡片 -->
            <view class="user-card">
                <image class="avatar" :src="avatarUrl" mode="aspectFill"></image>
                <view class="user-info">
                    <view class="nickname">{{ nickName }}</view>
                    <view class="user-id">ID: {{ userId || '生成中...' }}</view>
                </view>
            </view>

            <!-- 功能菜单 -->
            <view class="menu-card">
                <view class="menu-item" @tap="goMyBooking">
                    <view class="menu-left">
                        <text class="menu-icon">📋</text>
                        <text class="menu-text">我的预约</text>
                    </view>
                    <text class="arrow">›</text>
                </view>
                <!-- 只有教练才显示 -->
                <view class="menu-item" v-if="role === 'coach'" @tap="goCoachWorkbench">
                    <view class="menu-left">
                        <text class="menu-icon">🎾</text>
                        <text class="menu-text">教练工作台</text>
                    </view>
                    <text class="arrow">›</text>
                </view>
                <view class="menu-item" @tap="comingSoon">
                    <view class="menu-left">
                        <text class="menu-icon">🎫</text>
                        <text class="menu-text">我的订单</text>
                    </view>
                    <text class="arrow">›</text>
                </view>

                <view class="menu-item" @tap="comingSoon">
                    <view class="menu-left">
                        <text class="menu-icon">💳</text>
                        <text class="menu-text">优惠券</text>
                    </view>
                    <text class="arrow">›</text>
                </view>

                <view class="menu-item" @tap="comingSoon">
                    <view class="menu-left">
                        <text class="menu-icon">⭐</text>
                        <text class="menu-text">会员中心</text>
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
            <!-- 退出登录 -->
            <view class="logout-btn" @tap="logout">退出登录</view>
            <view class="footer">网球场馆</view>
        </block>
    </view>
</template>
<script module="filters" lang="wxs">
function getLastEight(str) { return str ? str.slice(-8) : '' }
module.exports.getLastEight = getLastEight;
</script>
<script>
export default {
    data() {
        return {
            isLogin: false,
            avatarUrl: '',
            nickName: '',
            openid: '',
            userId: '',
            role: 'user',
            choosingAvatar: false
        };
    },
    onShow() {
        this.checkLoginStatus();
        this.getOpenid();
    },
    methods: {
        checkLoginStatus() {
          const avatarUrl = uni.getStorageSync('avatarUrl') || ''
          const nickName = uni.getStorageSync('nickName') || ''
          const openid = uni.getStorageSync('openid') || ''
          const userId = uni.getStorageSync('userId') || ''
          const role = uni.getStorageSync('role') || 'user'
        
          if (avatarUrl && nickName) {
            this.isLogin = true
            this.avatarUrl = avatarUrl
            this.nickName = nickName
            this.openid = openid
            this.userId = userId
            this.role = role
          } else {
            this.isLogin = false
            this.avatarUrl = ''
            this.nickName = ''
            this.openid = ''
            this.userId = ''
            this.role = 'user'
          }
        },

        getOpenid() {
            const localOpenid = uni.getStorageSync('openid');
            if (localOpenid) {
                this.openid = localOpenid
                return;
            }
            wx.cloud
                .callFunction({
                    name: 'login',
                    config: {
                        env: 'cloud1-d0gmljq45868f5766'
                    }
                })
                .then((res) => {
                    const openid = res.result.openid;
                    this.openid = openid
                    uni.setStorageSync('openid', openid);
                })
                .catch((err) => {
                    console.error('获取openid失败', err);
                });
        },

        onChooseAvatar(e) {
          if (this.choosingAvatar) return
          this.choosingAvatar = true
          this.avatarUrl = e.detail.avatarUrl
          this.choosingAvatar = false
        },

        onNicknameChange(e) {
          this.nickName = e.detail.value
        },

        doLogin() {
            const { avatarUrl, nickName, openid } = this;
            if (!avatarUrl) {
                uni.showToast({
                    title: '请选择头像',
                    icon: 'none'
                });
                return;
            }
            if (!nickName || !nickName.trim()) {
                uni.showToast({
                    title: '请输入昵称',
                    icon: 'none'
                });
                return;
            }
            if (!openid) {
                uni.showToast({
                    title: '用户标识获取失败，请重试',
                    icon: 'none'
                });
                this.getOpenid();
                return;
            }
            const db = wx.cloud.database();
            db.collection('users')
                .where({
                    _openid: openid
                })
                .get()
                .then((res) => {
                    if (res.data.length > 0) {
                        // ---------- 老用户 ----------
                        const user = res.data[0];
                        let finalUserId = user.userId;
                        if (!finalUserId) {
                            // 老用户没有 userId，补一个
                            return db
                                .collection('users')
                                .count()
                                .then((countRes) => {
                                    finalUserId = 'Gt_tennis_' + String(countRes.total + 1).padStart(4, '0');
                                    return db
                                        .collection('users')
                                        .doc(user._id)
                                        .update({
                                            data: {
                                                userId: finalUserId,
                                                nickName: nickName.trim(),
                                                avatarUrl: avatarUrl,
                                                updateTime: db.serverDate()
                                            }
                                        })
                                        .then(() => {
                                            return {
                                                userId: finalUserId,
                                                nickName: nickName.trim(),
                                                avatarUrl: avatarUrl,
                                                role: user.role || 'user'
                                            };
                                        });
                                });
                        } else {
                            // 已有 userId，只更新头像昵称
                            return db
                                .collection('users')
                                .doc(user._id)
                                .update({
                                    data: {
                                        nickName: nickName.trim(),
                                        avatarUrl: avatarUrl,
                                        updateTime: db.serverDate()
                                    }
                                })
                                .then(() => {
                                    return {
                                        userId: finalUserId,
                                        nickName: nickName.trim(),
                                        avatarUrl: avatarUrl,
                                        role: user.role || 'user'
                                    };
                                });
                        }
                    } else {
                        // ---------- 新用户 ----------
                        return db
                            .collection('users')
                            .count()
                            .then((countRes) => {
                                const newUserId = 'Gt_tennis_' + String(countRes.total + 1).padStart(4, '0');
                                return db
                                    .collection('users')
                                    .add({
                                        data: {
                                            userId: newUserId,
                                            nickName: nickName.trim(),
                                            avatarUrl: avatarUrl,
                                            role: 'user',
                                            createTime: db.serverDate(),
                                            updateTime: db.serverDate()
                                        }
                                    })
                                    .then(() => {
                                        return {
                                            userId: newUserId,
                                            nickName: nickName.trim(),
                                            avatarUrl: avatarUrl,
                                            role: 'user'
                                        };
                                    });
                            });
                    }
                })
                .then((user) => {
                    // 登录成功，统一处理
                    uni.setStorageSync('avatarUrl', user.avatarUrl);
                    uni.setStorageSync('nickName', user.nickName);
                    uni.setStorageSync('openid', openid);
                    uni.setStorageSync('userId', user.userId);
                    uni.setStorageSync('role', user.role || 'user');
                    this.isLogin = true
                    this.userId = user.userId
                    this.avatarUrl = user.avatarUrl
                    this.nickName = user.nickName
                    this.role = user.role || 'user'
                    uni.showToast({
                        title: '登录成功',
                        icon: 'success'
                    });
                })
                .catch((err) => {
                    console.error('登录失败', err);
                    uni.showToast({
                        title: '登录失败，请重试',
                        icon: 'none'
                    });
                });
        },

        goMyBooking() {
            uni.navigateTo({
                url: '/pages/mybooking/mybooking'
            });
        },

        goCoachWorkbench() {
            uni.navigateTo({
                url: '/pages/coach-workbench/coach-workbench'
            });
        },

        comingSoon() {
            uni.showToast({
                title: '功能即将上线',
                icon: 'none'
            });
        },

        logout() {
            uni.showModal({
                title: '提示',
                content: '确定要退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        uni.removeStorageSync('avatarUrl');
                        uni.removeStorageSync('nickName');
                        uni.removeStorageSync('openid');
                        uni.removeStorageSync('userId');
                        uni.removeStorageSync('role');
                        this.isLogin = false
                        this.avatarUrl = ''
                        this.nickName = ''
                        this.openid = ''
                        this.userId = ''
                        this.role = 'user'
                        uni.showToast({
                            title: '已退出登录',
                            icon: 'success'
                        });
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

/* ===== 登录引导 ===== */
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

.avatar-btn {
    padding: 0;
    margin: 0 0 16rpx;
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
    display: block;
    background: #f0f0f0;
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

.nickname-box {
    width: 100%;
    margin: 30rpx 0 50rpx;
}

.nickname-input {
    width: 100%;
    height: 90rpx;
    background: #f5f6f8;
    border-radius: 16rpx;
    padding: 0 30rpx;
    box-sizing: border-box;
    font-size: 30rpx;
    text-align: center;
}

.login-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background: #07c160 !important;
    color: #fff !important;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 500;
    margin: 0;
}

/* ===== 已登录状态 ===== */
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
/* 退出登录按钮 */
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
