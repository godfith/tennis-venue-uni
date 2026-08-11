<template>
    <view class="page">
        <!-- 教练资料卡片 -->
        <view class="profile-card" v-if="coachInfo">
            <view class="profile-header">
                <image class="avatar" :src="coachInfo.avatar || '/static/images/avatar.png'" mode="aspectFill"></image>
                <view class="info">
                    <view class="name">{{ coachInfo.name }}</view>
                    <view class="title">{{ coachInfo.title }}</view>
                </view>
                <view class="edit-btn" @tap="goEditProfile">编辑资料</view>
            </view>
            <view class="desc">{{ coachInfo.desc || '暂无介绍' }}</view>
        </view>

        <!-- 未关联提示 -->
        <view class="bind-card" v-if="!coachInfo && !loading">
            <view class="bind-title">您还没有完善教练资料</view>
            <view class="bind-desc">完善后学员才能预约您的课程</view>
            <button class="bind-btn" @tap="createCoachProfile">立即完善资料</button>
        </view>

        <!-- 课程列表 -->
        <view class="section-title" v-if="coachInfo">我的课程安排</view>

        <view class="empty" v-if="coachInfo && !loading && list.length === 0">
            <view class="empty-text">暂无预约课程</view>
        </view>

        <view class="list" v-if="coachInfo">
            <view class="item" v-for="(item, index) in list" :key="index">
                <view class="item-left">
                    <view class="date">{{ item.date }}</view>
                    <view class="time">{{ item.time }}</view>
                    <view class="court">场地：{{ item.court }}</view>
                </view>

                <view class="status booked">已预约</view>
            </view>
        </view>

        <view class="loading" v-if="loading">加载中...</view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            list: [],
            coachInfo: null,
            loading: true
        };
    },
    onShow() {
        this.loadCoachInfo();
    },
    methods: {
        // 加载教练资料 + 预约记录
        loadCoachInfo() {
          const db = wx.cloud.database()
          const openid = uni.getStorageSync('openid')
          this.loading = true
        
          if (!openid) {
            uni.showToast({ title: '请先登录', icon: 'none' })
            this.loading = false
            return
          }
        
          db.collection('users')
            .where({ _openid: openid, role: 'coach' })
            .get()
            .then((userRes) => {
              if (userRes.data.length === 0) {
                uni.showToast({ title: '您不是教练账号', icon: 'none' })
                this.loading = false
                return Promise.reject('not coach')
              }
              const user = userRes.data[0]
              this.userDocId = user._id
              if (user.coachId) {
                return db.collection('coaches').doc(user.coachId).get()
                  .then((res) => {
                    this.coachInfo = res.data
                    return user.coachId
                  })
              } else {
                this.coachInfo = null
                this.loading = false
                return null
              }
            })
            .then((coachId) => {
              if (!coachId) return
              return db.collection('coach_bookings')
                .where({ coachId: coachId, status: 'booked' })
                .orderBy('date', 'asc')
                .get()
                .then((res) => {
                  this.list = res.data
                  this.loading = false
                })
            })
            .catch((err) => {
              console.error(err)
              this.loading = false
            })
        },

        // 创建教练资料（首次关联）
        createCoachProfile() {
            const nickName = uni.getStorageSync('nickName') || '教练';
            const avatarUrl = uni.getStorageSync('avatarUrl') || '/static/images/avatar.png';
            const db = wx.cloud.database();
            uni.showLoading({
                title: '创建中...'
            });
            db.collection('coaches')
                .add({
                    data: {
                        name: nickName,
                        title: '教练',
                        desc: '暂无介绍，请点击编辑资料完善',
                        avatar: avatarUrl,
                        tags: [],
                        sort: 99,
                        createTime: db.serverDate()
                    }
                })
                .then((res) => {
                    const coachId = res._id;

                    // 把 coachId 写回 users 表
                    return db
                        .collection('users')
                        .doc(this.userDocId)
                        .update({
                            data: {
                                coachId: coachId
                            }
                        })
                        .then(() => {
                            uni.hideLoading();
                            uni.showToast({
                                title: '创建成功',
                                icon: 'success'
                            });
                            this.loadCoachInfo();
                        });
                })
                .catch((err) => {
                    uni.hideLoading();
                    console.error(err);
                    uni.showToast({
                        title: '创建失败',
                        icon: 'none'
                    });
                });
        },

        // 跳转编辑资料
        goEditProfile() {
            if (!this.coachInfo) {
                return;
            }
            uni.navigateTo({
                url: `/pages/coach-edit/coach-edit?id=${this.coachInfo._id}`
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

/* 资料卡片 */
.profile-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

.profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    background: #f0f0f0;
}

.info {
    flex: 1;
}

.name {
    font-size: 32rpx;
    font-weight: 600;
    color: #222;
}

.title {
    font-size: 24rpx;
    color: #07c160;
    margin-top: 6rpx;
}

.edit-btn {
    font-size: 26rpx;
    color: #07c160;
    padding: 8rpx 20rpx;
    border: 1rpx solid #07c160;
    border-radius: 30rpx;
}

.desc {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
}

/* 未关联 */
.bind-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 60rpx 40rpx;
    text-align: center;
    margin-bottom: 30rpx;
}

.bind-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 12rpx;
}

.bind-desc {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 40rpx;
}

.bind-btn {
    background: #07c160 !important;
    color: #fff !important;
    border-radius: 40rpx;
    font-size: 30rpx;
}

/* 列表 */
.section-title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
    color: #222;
}

.item {
    background: #fff;
    border-radius: 16rpx;
    padding: 28rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.date {
    font-size: 28rpx;
    font-weight: 600;
    margin-bottom: 6rpx;
}

.time {
    font-size: 26rpx;
    color: #07c160;
    margin-bottom: 6rpx;
}

.court {
    font-size: 24rpx;
    color: #888;
}

.status {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
}

.status.booked {
    background: #e8f8ef;
    color: #07c160;
}

.empty {
    text-align: center;
    padding: 80rpx 0;
    color: #999;
}

.loading {
    text-align: center;
    color: #999;
    margin-top: 100rpx;
}
</style>
