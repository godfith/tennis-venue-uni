<template>
    <view>
        <view class="container">
            <!-- 标题 -->
            <view class="header">
                <view class="title">网球场馆预约</view>
            </view>

            <!-- 日期选择 -->
            <scroll-view class="date-scroll" :scroll-x="true" :enable-flex="true">
                <view :class="'date-item ' + (currentDate === item.date ? 'active' : '')" @tap="onSelectDate(item.date)" v-for="(item, index) in dateList" :key="index">
                    <view class="week">{{ item.week }}</view>

                    <view class="day">{{ item.day }}</view>
                </view>
            </scroll-view>

            <!-- 场地列表 -->
            <view class="court-area">
                <view class="court-card" v-for="(item, index) in courtList" :key="index">
                    <!-- 场地名称 -->

                    <view class="court-header">
                        <text class="court-name">{{ item.name }}</text>
                        <text class="court-desc">{{ item.desc }}</text>
                    </view>

                    <!-- 该场地的时间段状态 -->

                    <view class="time-grid">
                        <view
                          :class="'time-cell ' + (cell.status === 'full' ? 'full' : '') + ' ' + (currentCourtId === item.id && currentTime === cell.time ? 'selected' : '')"
                          @tap="onSelectSlot(item.id, item.name, cell.time, cell.status)"
                          v-for="(cell, index1) in item.times"
                          :key="index1"
                        >
                          <view class="time-text">{{ cell.short }}</view>
                          <view class="status-text">{{ cell.status === 'full' ? '已租' : '可约' }}</view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 底部已选信息 + 按钮 -->
            <view class="bottom-bar" v-if="currentCourtId">
                <view class="selected-info">
                    <view>{{ currentCourtName }}</view>
                    <view class="selected-time">{{ currentTime }}</view>
                </view>
                <button class="book-btn" @tap="onBook">确认预约</button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            courtConfig: [],

            // 改成空数组
            dateList: [],

            courtList: [],
            currentDate: '',
            currentCourtId: '',
            currentCourtName: '',
            currentTime: '',

            allTimes: [
                {
                    time: '08:00-09:00',
                    short: '08:00',
                    hour: 8
                },
                {
                    time: '09:00-10:00',
                    short: '09:00',
                    hour: 9
                },
                {
                    time: '10:00-11:00',
                    short: '10:00',
                    hour: 10
                },
                {
                    time: '11:00-12:00',
                    short: '11:00',
                    hour: 11
                },
                {
                    time: '14:00-15:00',
                    short: '14:00',
                    hour: 14
                },
                {
                    time: '15:00-16:00',
                    short: '15:00',
                    hour: 15
                },
                {
                    time: '16:00-17:00',
                    short: '16:00',
                    hour: 16
                },
                {
                    time: '17:00-18:00',
                    short: '17:00',
                    hour: 17
                },
                {
                    time: '18:00-19:00',
                    short: '18:00',
                    hour: 18
                },
                {
                    time: '19:00-20:00',
                    short: '19:00',
                    hour: 19
                },
                {
                    time: '20:00-21:00',
                    short: '20:00',
                    hour: 20
                }
            ],

            cell: {
                status: '',
                time: '',
                short: ''
            }
        };
    },
    onLoad() {
        this.loadCourts();
        this.initDateList();
    },
    methods: {
        // 从数据库加载场地
        loadCourts() {
          const venueId = uni.getStorageSync('venue_id')
          if (!venueId) {
            uni.showToast({ title: '请先在首页选择场馆', icon: 'none' })
            this.courtConfig = []
            this.courtList = []
            return
          }
        
          const db = wx.cloud.database()
          db.collection('courts')
            .where({
              status: 'open',
              venueId: venueId
            })
            .orderBy('sort', 'asc')
            .get()
            .then((res) => {
              const courtConfig = res.data.map((item) => ({
                id: item._id,
                name: item.name,
                desc: item.type || ''
              }))
              this.courtConfig = courtConfig
              if (this.currentDate) {
                this.loadCourtStatus(this.currentDate)
              }
            })
            .catch((err) => {
              console.error('加载场地失败', err)
            })
        },

        // 初始化日期列表
        initDateList() {
            const weeks = ['日', '一', '二', '三', '四', '五', '六'];
            const list = [];
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                const year = d.getFullYear();
                const month = d.getMonth() + 1;
                const day = d.getDate();
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                list.push({
                    date: dateStr,
                    week: i === 0 ? '今天' : `周${weeks[d.getDay()]}`,
                    day: `${month}/${day}`,
                    isToday: i === 0
                });
            }
            this.dateList = list
            this.currentDate = list[0].date
            this.loadCourtStatus(list[0].date)
        },

        // 选择日期
        onSelectDate(date) {
          this.currentDate = date
          this.currentCourtId = ''
          this.currentCourtName = ''
          this.currentTime = ''
          this.loadCourtStatus(date)
        },

        /**
         * 获取某个日期下，真正还可以预约的时间段
         * 如果是今天，就过滤掉已经过去的时间
         */
        getAvailableTimes(dateStr) {
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // 如果不是今天，返回全部时间段
            if (dateStr !== todayStr) {
                return this.allTimes;
            }

            // 是今天，只返回还没开始的时间段
            return this.allTimes.filter((item) => {
                // 如果当前时间已经超过这个时间段的开始时间，就过滤掉
                // 例如现在 15:20，那么 15:00-16:00 也算过期
                if (item.hour < currentHour) {
                    return false;
                }
                if (item.hour === currentHour && currentMinute > 0) {
                    return false;
                }
                return true;
            });
        },

        // 加载某天所有场地的预约状态（核心）
        loadCourtStatus(date) {
            const db = wx.cloud.database();
            const { courtConfig } = this;

            // 先获取这个日期真正可预约的时间段
            const availableTimes = this.getAvailableTimes(date);

            // 如果今天已经没有可预约时间了
            if (availableTimes.length === 0) {
                this.courtList = []
                uni.showToast({
                    title: '今日已无剩余时段',
                    icon: 'none'
                });
                return;
            }
            db.collection('bookings')
                .where({
                    date: date,
                    status: 'booked'
                })
                .get()
                .then((res) => {
                    // 用「场地名_时间」做已预约标记
                    const bookedMap = {};
                    res.data.forEach((item) => {
                        bookedMap[`${item.court}_${item.time}`] = true;
                    });

                    // 生成每个场地的时间状态
                    const courtList = courtConfig.map((court) => {
                        const times = availableTimes.map((t) => {
                            const key = `${court.name}_${t.time}`;
                            return {
                                time: t.time,
                                short: t.short,
                                status: bookedMap[key] ? 'full' : 'available'
                            };
                        });
                        return {
                            ...court,
                            times
                        };
                    });
                    this.courtList = courtList;
                })
                .catch((err) => {
                    console.error('查询失败', err);
                    // 失败时仍然显示可约时间
                    const courtList = courtConfig.map((court) => ({
                        ...court,
                        times: availableTimes.map((t) => ({
                            time: t.time,
                            short: t.short,
                            status: 'available'
                        }))
                    }));
                    this.courtList = courtList;
                });
        },

        // 点击某个时间格子
        onSelectSlot(courtId, courtName, time, status) {
          if (status === 'full') {
            uni.showToast({
              title: '该时段已被预约',
              icon: 'none'
            })
            return
          }
          this.currentCourtId = courtId
          this.currentCourtName = courtName
          this.currentTime = time
        },
		

        // 确认预约
        onBook() {
            const { currentDate, currentCourtName, currentTime } = this;
            if (!currentDate || !currentCourtName || !currentTime) {
                uni.showToast({
                    title: '请选择场地和时间',
                    icon: 'none'
                });
                return;
            }
            uni.showModal({
                title: '确认预约',
                content: `场地：${currentCourtName}\n日期：${currentDate}\n时间：${currentTime}`,
                success: (res) => {
                    if (res.confirm) {
                        const db = wx.cloud.database();
                        db.collection('bookings')
                            .add({
                                data: {
                                  orderNo: 'GT' + Date.now(),  // 简单订单号，例如 GT1723360000000
                                  date: currentDate,
                                  time: currentTime,
                                  court: currentCourtName,
                                  status: 'booked',
								  venueId: uni.getStorageSync('venue_id') || '',
                                  createTime: db.serverDate()
                                }
                            })
                            .then(() => {
                                uni.showToast({
                                    title: '预约成功',
                                    icon: 'success'
                                });
                                this.loadCourtStatus(currentDate);
                                this.currentCourtId = '';
                                this.currentCourtName = '';
                                this.currentTime = '';
                            })
                            .catch((err) => {
                                console.error(err);
                                uni.showToast({
                                    title: '预约失败',
                                    icon: 'none'
                                });
                            });
                    }
                }
            });
        },

        // 跳转到我的预约
        goMyBooking() {
            uni.navigateTo({
                url: '/pages/mybooking/mybooking'
            });
        },
		onShow() {
		  this.loadCourts()
		},
    }
};
</script>
<style>
.container {
    padding-bottom: 160rpx;
    background: #f7f8fa;
    min-height: 100vh;
}

.header {
    padding: 30rpx 30rpx 10rpx;
    background: #fff;
}

.title {
    font-size: 40rpx;
    font-weight: bold;
    color: #222;
}

/* 日期横向滚动 */
.date-scroll {
    background: #fff;
    padding: 20rpx 20rpx 30rpx;
    white-space: nowrap;
}

.date-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 110rpx;
    height: 110rpx;
    margin-right: 16rpx;
    border-radius: 16rpx;
    background: #f5f5f5;
}

.date-item.active {
    background: #07c160;
    color: #fff;
}

.week {
    font-size: 22rpx;
    margin-bottom: 6rpx;
}

.day {
    font-size: 30rpx;
    font-weight: bold;
}

/* 场地卡片 */
.court-area {
    padding: 20rpx;
}

.court-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

.court-header {
    margin-bottom: 24rpx;
}

.court-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #222;
    margin-right: 16rpx;
}

.court-desc {
    font-size: 24rpx;
    color: #999;
}

/* 时间格子 */
.time-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.time-cell {
    width: 140rpx;
    height: 90rpx;
    background: #f0f9f4;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2rpx solid transparent;
}

.time-cell.full {
    background: #f0f0f0;
    color: #bbb;
}

.time-cell.selected {
    background: #07c160;
    color: #fff;
    border-color: #07c160;
}

.time-text {
    font-size: 24rpx;
    font-weight: 500;
}

.status-text {
    font-size: 20rpx;
    margin-top: 4rpx;
}

.time-cell.full .status-text {
    color: #ff4d4f;
}

/* 底部栏 */
.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 -6rpx 20rpx rgba(0, 0, 0, 0.06);
    z-index: 100;
}

.selected-info {
    font-size: 28rpx;
    color: #333;
}

.selected-time {
    font-size: 24rpx;
    color: #07c160;
    margin-top: 4rpx;
}

.book-btn {
    background: #07c160 !important;
    color: #fff;
    font-size: 30rpx;
    border-radius: 50rpx;
    padding: 0 50rpx;
    margin: 0;
}
.header {
    padding: 30rpx 30rpx 10rpx;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.my-link {
    font-size: 28rpx;
    color: #07c160;
}
</style>
