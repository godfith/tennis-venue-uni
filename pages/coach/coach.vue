<template>
    <view class="page">
        <view class="header">选择教练</view>

        <!-- 加载中 -->
        <view class="loading" v-if="loading">加载中...</view>

        <!-- 空状态 -->
        <view class="empty" v-else-if="coachList.length === 0">
            <view>暂无教练信息</view>
        </view>

        <!-- 教练列表 -->
        <view class="coach-list" v-else>
            <view class="coach-card" @tap="goDetail(item._id)" v-for="(item, index) in coachList" :key="index">
                <image class="avatar" :src="item.avatar" mode="aspectFill"></image>

                <view class="info">
                    <view class="name">{{ item.name }}</view>
                    <view class="title">{{ item.title }}</view>
                    <view class="desc">{{ item.desc }}</view>
                    <view class="tags">
                        <text class="tag" v-for="(tag, index1) in item.tags" :key="index1">{{ tag }}</text>
                    </view>
                </view>

                <view class="arrow">›</view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            coachList: [],
            loading: true,
            tag: ''
        };
    },
    onShow() {
        this.loadCoaches();
    },
    methods: {
        // 从数据库加载教练列表
        loadCoaches() {
          const db = wx.cloud.database()
          this.loading = true
          db.collection('coaches')
            .orderBy('sort', 'asc')
            .get()
            .then((res) => {
              this.coachList = res.data
              this.loading = false
            })
            .catch((err) => {
              console.error('加载教练失败', err)
              this.loading = false
              uni.showToast({ title: '加载失败', icon: 'none' })
            })
        },

        goDetail(id) {
          uni.navigateTo({
            url: `/pages/coach-detail/coach-detail?id=${id}`
          })
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

.header {
    font-size: 36rpx;
    font-weight: 700;
    color: #222;
    margin-bottom: 30rpx;
}

.coach-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

.avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    background: #f0f0f0;
    flex-shrink: 0;
}

.info {
    flex: 1;
    overflow: hidden;
}

.name {
    font-size: 32rpx;
    font-weight: 600;
    color: #222;
    margin-bottom: 6rpx;
}

.title {
    font-size: 24rpx;
    color: #07c160;
    margin-bottom: 8rpx;
}

.desc {
    font-size: 24rpx;
    color: #888;
    margin-bottom: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
}

.tag {
    font-size: 20rpx;
    background: #f0f9f4;
    color: #07c160;
    padding: 4rpx 14rpx;
    border-radius: 8rpx;
}

.arrow {
    font-size: 36rpx;
    color: #ccc;
    margin-left: 10rpx;
}
</style>
