<template>
    <view class="container">
        <view class="title">我的预约</view>

        <!-- 空状态 -->
        <view class="empty" v-if="list.length === 0 && !loading">
            <view class="empty-text">暂无预约记录</view>
            <button class="go-btn" @tap="goBooking">去预约</button>
        </view>

        <!-- 列表 -->
        <view class="list" v-else>
            <view class="item" v-for="(item, index) in list" :key="index">
                <view class="item-left">
                    <view class="court">{{ item.court }}</view>
                    <view class="date-time">{{ item.date }}　{{ item.time }}</view>
                    <view :class="'status ' + (item.status === 'booked' ? 'booked' : 'cancelled')">
                        {{ item.status === 'booked' ? '已预约' : '已取消' }}
                    </view>
                </view>

                <view class="item-right">
                    <button v-if="item.status === 'booked'" class="cancel-btn" size="mini" @tap="onCancel(item._id)">取消</button>
                </view>
            </view>
        </view>

        <!-- 分页控制 -->
        <view class="pagination" v-if="total > 0">
            <button class="page-btn" :disabled="page === 1" @tap="prevPage">上一页</button>

            <view class="page-info">{{ page }} / {{ totalPage }}</view>

            <button class="page-btn" :disabled="page >= totalPage" @tap="nextPage">下一页</button>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            list: [],
            page: 1,
            pageSize: 5,
            total: 0,
            totalPage: 1,
            loading: false,
            openid: ''
        };
    },
    onShow() {
      this.page = 1
      this.getOpenidAndLoad()
    },
    methods: {
        // 先获取 openid，再加载数据
        getOpenidAndLoad() {
            wx.cloud
                .callFunction({
                    name: 'login',
                    config: {
                        env: 'cloud1-d0gmljq45868f5766' // 强制指定环境
                    }
                })
                .then((res) => {
                    const openid = res.result.openid;
                    console.log('当前用户 openid：', openid);
                    this.openid = openid;
                    this.loadMyBookings(openid);
                })
                .catch((err) => {
                    console.error('获取 openid 失败', err);
                    uni.showToast({
                        title: '登录失败',
                        icon: 'none'
                    });
                });
        },

        // 加载当前用户的预约
        loadMyBookings(openid) {
          const { page, pageSize } = this
          const db = wx.cloud.database()
          this.loading = true
        
          const whereCondition = { _openid: openid }
        
          db.collection('bookings')
            .where(whereCondition)
            .count()
            .then((countRes) => {
              const total = countRes.total
              const totalPage = Math.ceil(total / pageSize) || 1
              return db
                .collection('bookings')
                .where(whereCondition)
                .orderBy('createTime', 'desc')
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .get()
                .then((res) => {
                  this.list = res.data
                  this.total = total
                  this.totalPage = totalPage
                  this.loading = false
                })
            })
            .catch((err) => {
              console.error('加载失败', err)
              this.loading = false
              uni.showToast({ title: '加载失败', icon: 'none' })
            })
        },

        // 上一页
       prevPage() {
         if (this.page <= 1) return
         this.page = this.page - 1
         this.loadMyBookings(this.openid)
       },
       
       nextPage() {
         if (this.page >= this.totalPage) return
         this.page = this.page + 1
         this.loadMyBookings(this.openid)
       },
        // 判断是否可以取消（提前6小时）
        canCancel(booking) {
            const startTimeStr = booking.time.split('-')[0];
            const bookingDateTimeStr = `${booking.date} ${startTimeStr}:00`;
            const bookingTime = new Date(bookingDateTimeStr.replace(/-/g, '/'));
            const now = new Date();
            const diffMs = bookingTime.getTime() - now.getTime();
            const diffHours = diffMs / 3600000;
            return diffHours >= 6;
        },

        // 取消预约
        onCancel(id) {
          const booking = this.list.find((item) => item._id === id)
          if (!booking) return
            if (!this.canCancel(booking)) {
                uni.showModal({
                    title: '无法取消',
                    content: '预约开始前6小时内不可取消，请提前安排。',
                    showCancel: false
                });
                return;
            }
            uni.showModal({
                title: '确认取消',
                content: '确定要取消这个预约吗？',
                success: (res) => {
                    if (res.confirm) {
                        const db = wx.cloud.database();
                        db.collection('bookings')
                            .doc(id)
                            .update({
                                data: {
                                    status: 'cancelled'
                                }
                            })
                            .then(() => {
                                uni.showToast({
                                    title: '已取消',
                                    icon: 'success'
                                });
                                this.loadMyBookings(this.openid);
                            })
                            .catch((err) => {
                                console.error(err);
                                uni.showToast({
                                    title: '取消失败',
                                    icon: 'none'
                                });
                            });
                    }
                }
            });
        },

        goBooking() {
            uni.switchTab({
                url: '/pages/booking/booking'
            });
        }
    }
};
</script>
<style>
.container {
    padding: 30rpx;
    background: #f5f6f8;
    min-height: 100vh;
    box-sizing: border-box;
    padding-bottom: 120rpx;
}

.title {
    font-size: 40rpx;
    font-weight: bold;
    color: #222;
    margin-bottom: 30rpx;
}

.empty {
    margin-top: 180rpx;
    text-align: center;
}

.empty-text {
    font-size: 30rpx;
    color: #999;
    margin-bottom: 40rpx;
}

.go-btn {
    width: 280rpx;
    background: #07c160 !important;
    color: #fff;
    border-radius: 50rpx;
    font-size: 30rpx;
}

/* 列表项 */
.item {
    background: #fff;
    border-radius: 16rpx;
    padding: 28rpx 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
}

.court {
    font-size: 32rpx;
    font-weight: bold;
    color: #222;
    margin-bottom: 10rpx;
}

.date-time {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 12rpx;
}

.status {
    font-size: 22rpx;
    display: inline-block;
    padding: 4rpx 14rpx;
    border-radius: 8rpx;
}

.status.booked {
    background: #e8f8ef;
    color: #07c160;
}

.status.cancelled {
    background: #f0f0f0;
    color: #999;
}

.cancel-btn {
    background: #fff !important;
    color: #ff4d4f !important;
    border: 1rpx solid #ff4d4f !important;
    font-size: 26rpx !important;
    padding: 0 24rpx !important;
    margin: 0;
    line-height: 56rpx !important;
}

/* 分页 */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40rpx;
    gap: 30rpx;
}

.page-btn {
    font-size: 26rpx !important;
    padding: 0 30rpx !important;
    margin: 0;
    background: #fff !important;
    color: #333 !important;
    border-radius: 12rpx !important;
    line-height: 64rpx !important;
}

.page-btn[disabled] {
    color: #ccc !important;
    background: #f5f5f5 !important;
}

.page-info {
    font-size: 28rpx;
    color: #666;
}
</style>
