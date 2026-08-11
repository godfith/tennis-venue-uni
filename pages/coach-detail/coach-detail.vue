<template>
    <view>
        <view class="page" v-if="coach">
            <!-- 教练头部信息 -->
            <view class="header-card">
                <image class="avatar" :src="coach.avatar" mode="aspectFill"></image>
                <view class="name">{{ coach.name }}</view>
                <view class="title">{{ coach.title }}</view>
                <view class="tags">
                    <text class="tag" v-for="(item, index) in coach.tags" :key="index">{{ item }}</text>
                </view>
            </view>

            <!-- 详细介绍 -->
            <view class="section">
                <view class="section-title">教练介绍</view>
                <view class="desc">{{ coach.desc || '暂无详细介绍' }}</view>
            </view>

            <!-- 选择时间 -->
            <view class="section">
                <view class="section-title">1. 选择上课时间</view>

                <scroll-view scroll-x class="date-list" enable-flex>
                    <view
                        :class="'date-item ' + (currentDate === item.date ? 'active' : '')"
                        @tap="onSelectDate(item.date)"
                        v-for="(item, index) in dateList"
                        :key="index"
                    >
                        <view class="week">{{ item.week }}</view>

                        <view class="day">{{ item.day }}</view>
                    </view>
                </scroll-view>

                <view class="time-list">
                    <view
                        :class="'time-item ' + (item.status === 'full' ? 'full' : '') + ' ' + (currentTime === item.time ? 'active' : '')"
                        @tap="onSelectTime(item.time, item.status)"
                        v-for="(item, index) in timeList"
                        :key="index"
                    >
                        {{ item.time }}

                        <text v-if="item.status === 'full'" class="status-text">已满</text>
                    </view>
                </view>
            </view>

            <!-- 选择场地（选了时间后才显示） -->
            <view class="section" v-if="currentTime">
                <view class="section-title">2. 选择场地</view>

                <view class="court-list" v-if="availableCourts.length > 0">
                    <view
                        :class="'court-item ' + (currentCourt === item ? 'active' : '')"
                        @tap="onSelectCourt(item)"
                        v-for="(item, index) in availableCourts"
                        :key="index"
                    >
                        {{ item }}
                    </view>
                </view>

                <view class="no-court" v-else>该时间段暂无空闲场地</view>
            </view>

            <!-- 底部按钮 -->
            <view class="bottom-bar">
                <view class="selected-info" v-if="currentDate && currentTime && currentCourt">{{ currentDate }} {{ currentTime }} · {{ currentCourt }}</view>
                <button class="book-btn" :disabled="!currentDate || !currentTime || !currentCourt" @tap="onBook">立即预约</button>
            </view>
        </view>

        <view class="loading" v-else>加载中...</view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            coach: null,
            dateList: [],
            timeList: [],
            availableCourts: [],
            currentDate: '',
            currentTime: '',
            currentCourt: '',
            coachId: '',
            courtList: [] // 改成空数组，后面从数据库加载
        };
    },
    onLoad(options) {
      const id = options.id
      this.coachId = id
      this.loadCoachDetail(id)
      this.loadCourts()
    },
    methods: {
        // 从数据库加载场地
        loadCourts() {
            const db = wx.cloud.database();
            db.collection('courts')
                .where({
                    status: 'open'
                })
                .orderBy('sort', 'asc')
                .get()
                .then((res) => {
                  this.courtList = res.data.map((item) => item.name)
                  this.initDateList()
                })
                .catch((err) => {
                    console.error('加载场地失败', err);
                    // 即使失败也继续，避免页面卡死
                    this.initDateList();
                });
        },

        // 初始化未来7天
        initDateList() {
            const weeks = ['日', '一', '二', '三', '四', '五', '六'];
            const list = [];
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                const month = d.getMonth() + 1;
                const day = d.getDate();
                const dateStr = `${d.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                list.push({
                    date: dateStr,
                    week: i === 0 ? '今天' : `周${weeks[d.getDay()]}`,
                    day: `${month}/${day}`
                });
            }
            this.dateList = list;
            this.currentDate = list[0].date;
            this.loadTimeList(list[0].date);
        },

        loadCoachDetail(id) {
            const db = wx.cloud.database();
            db.collection('coaches')
                .doc(id)
                .get()
                .then((res) => {
                  this.coach = res.data
                })
                .catch((err) => {
                    console.error(err);
                    uni.showToast({
                        title: '加载失败',
                        icon: 'none'
                    });
                });
        },

        // 加载时间段状态（教练是否已约 + 是否有空闲场地）
        // 加载时间段状态（过滤过期时间 + 检查教练是否已约 + 是否有空闲场地）
        loadTimeList(date) {
            const db = wx.cloud.database();
            const { coachId, courtList } = this;

            // 所有可能的时间段
            const allTimes = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00'];

            // 根据当前时间过滤（如果是今天，去掉已经过去的时间）
            const availableTimes = this.getAvailableTimes(date, allTimes);
            if (availableTimes.length === 0) {
                this.timeList = []
                this.currentTime = ''
                this.currentCourt = ''
                this.availableCourts = []
                return;
            }
            Promise.all([
                db
                    .collection('coach_bookings')
                    .where({
                        coachId: coachId,
                        date: date,
                        status: 'booked'
                    })
                    .get(),
                db
                    .collection('bookings')
                    .where({
                        date: date,
                        status: 'booked'
                    })
                    .get()
            ])
                .then(([coachRes, bookingRes]) => {
                    const coachBookedTimes = coachRes.data.map((item) => item.time);
                    const courtUsed = {};
                    bookingRes.data.forEach((item) => {
                        if (!courtUsed[item.time]) {
                            courtUsed[item.time] = [];
                        }
                        courtUsed[item.time].push(item.court);
                    });
                    const timeList = availableTimes.map((time) => {
                        const isCoachBooked = coachBookedTimes.includes(time);
                        const usedCourts = courtUsed[time] || [];
                        const totalCourts = courtList.length || 4; // 防止 courtList 为空
                        const hasAvailableCourt = usedCourts.length < totalCourts;
                        return {
                            time,
                            status: isCoachBooked || !hasAvailableCourt ? 'full' : 'available'
                        };
                    });
                    this.timeList = timeList
                    this.currentTime = ''
                    this.currentCourt = ''
                    this.availableCourts = []
                })
                .catch((err) => {
                    console.error(err);
                });
        },

        /**
         * 获取某个日期真正可预约的时间段
         * 如果是今天，过滤掉已经过去的时间
         */
        getAvailableTimes(dateStr, allTimes) {
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            // 不是今天，返回全部
            if (dateStr !== todayStr) {
                return allTimes;
            }

            // 是今天，过滤已过去的时间
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            return allTimes.filter((time) => {
                const startHour = parseInt(time.split(':')[0]);
                if (startHour < currentHour) {
                    return false;
                }
                if (startHour === currentHour && currentMinute > 0) {
                    return false;
                }
                return true;
            });
        },

       onSelectDate(date) {
         this.currentDate = date
         this.loadTimeList(date)
       },

        // 选择时间后，加载该时间的空闲场地
        onSelectTime(time, status) {
          if (status === 'full') {
            uni.showToast({ title: '该时间不可预约', icon: 'none' })
            return
          }
          this.currentTime = time
          this.currentCourt = ''
          this.loadAvailableCourts(this.currentDate, time)
        },

        // 查询某时间段的空闲场地
        loadAvailableCourts(date, time) {
            const db = wx.cloud.database();
            const { courtList } = this;
            db.collection('bookings')
                .where({
                    date: date,
                    time: time,
                    status: 'booked'
                })
                .get()
                .then((res) => {
                    const bookedCourts = res.data.map((item) => item.court);
                    const availableCourts = courtList.filter((c) => !bookedCourts.includes(c));
                    this.availableCourts = availableCourts
                })
                .catch((err) => {
                    console.error(err);
                    this.availableCourts = courtList
                });
        },

        onSelectCourt(court) {
          this.currentCourt = court
        },

        // 预约
        onBook() {
            const { currentDate, currentTime, currentCourt, coach, coachId } = this;
            if (!currentDate || !currentTime || !currentCourt) {
                uni.showToast({
                    title: '请完整选择时间与场地',
                    icon: 'none'
                });
                return;
            }
            uni.showModal({
                title: '确认预约',
                content: `教练：${coach.name}\n时间：${currentDate} ${currentTime}\n场地：${currentCourt}`,
                success: (res) => {
                    if (!res.confirm) {
                        return;
                    }
                    uni.showLoading({
                        title: '预约中...'
                    });
                    const db = wx.cloud.database();

                    // 最终检查教练是否已被约
                    db.collection('coach_bookings')
                        .where({
                            coachId: coachId,
                            date: currentDate,
                            time: currentTime,
                            status: 'booked'
                        })
                        .count()
                        .then((countRes) => {
                            if (countRes.total > 0) {
                                uni.hideLoading();
                                uni.showToast({
                                    title: '该教练此时间已被预约',
                                    icon: 'none'
                                });
                                this.loadTimeList(currentDate);
                                return Promise.reject('教练已约');
                            }

                            // 检查场地是否还空闲
                            return db
                                .collection('bookings')
                                .where({
                                    date: currentDate,
                                    time: currentTime,
                                    court: currentCourt,
                                    status: 'booked'
                                })
                                .count();
                        })
                        .then((countRes) => {
                            if (countRes.total > 0) {
                                uni.hideLoading();
                                uni.showToast({
                                    title: '该场地已被预约',
                                    icon: 'none'
                                });
                                this.loadAvailableCourts(currentDate, currentTime);
                                return Promise.reject('场地已约');
                            }

                            // 创建场地预约
                            return db.collection('bookings').add({
                                data: {
                                    date: currentDate,
                                    time: currentTime,
                                    court: currentCourt,
                                    status: 'booked',
                                    type: 'coach',
                                    coachId: coachId,
                                    coachName: coach.name,
                                    createTime: db.serverDate(),
									orderNo: 'GT' + Date.now(),
                                }
                            });
                        })
                        .then((bookRes) => {
                            // 创建教练预约
                            return db.collection('coach_bookings').add({
                                data: {
                                    coachId: coachId,
                                    coachName: coach.name,
                                    date: currentDate,
                                    time: currentTime,
                                    court: currentCourt,
                                    status: 'booked',
                                    bookingId: bookRes._id,
                                    createTime: db.serverDate(),
									orderNo: 'GT' + Date.now(),
                                }
                            });
                        })
                        .then(() => {
                            uni.hideLoading();
                            uni.showToast({
                                title: '预约成功',
                                icon: 'success'
                            });
                            this.loadTimeList(currentDate);
                            this.currentTime = ''
                            this.currentCourt = ''
                            this.availableCourts = []
                        })
                        .catch((err) => {
                            uni.hideLoading();
                            if (err !== '教练已约' && err !== '场地已约') {
                                console.error(err);
                                uni.showToast({
                                    title: '预约失败',
                                    icon: 'none'
                                });
                            }
                        });
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
    padding-bottom: 160rpx;
    box-sizing: border-box;
}

.loading {
    text-align: center;
    padding-top: 200rpx;
    color: #999;
}

/* 头部卡片 */
.header-card {
    background: linear-gradient(135deg, #1a5c3a, #2d8a5e);
    padding: 50rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
}

.avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 6rpx solid rgba(255, 255, 255, 0.3);
    margin-bottom: 24rpx;
    background: #fff;
}

.name {
    font-size: 40rpx;
    font-weight: 700;
    margin-bottom: 10rpx;
}

.title {
    font-size: 26rpx;
    opacity: 0.9;
    margin-bottom: 20rpx;
}

.tags {
    display: flex;
    gap: 12rpx;
}

.tag {
    background: rgba(255, 255, 255, 0.2);
    padding: 6rpx 18rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
}

/* 通用区块 */
.section {
    margin: 24rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #222;
    margin-bottom: 24rpx;
}

.desc {
    font-size: 28rpx;
    color: #555;
    line-height: 1.7;
}

/* 日期 */
.date-list {
    white-space: nowrap;
    margin-bottom: 30rpx;
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
    font-size: 28rpx;
    font-weight: 600;
}

/* 时间段 */
.time-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.time-item {
    width: 200rpx;
    height: 76rpx;
    line-height: 76rpx;
    text-align: center;
    background: #f5f5f5;
    border-radius: 12rpx;
    font-size: 26rpx;
    position: relative;
}

.time-item.active {
    background: #07c160;
    color: #fff;
}

.time-item.full {
    background: #eee;
    color: #bbb;
}

.status-text {
    position: absolute;
    right: 8rpx;
    top: 4rpx;
    font-size: 18rpx;
    color: #ff4d4f;
    line-height: 1;
}

/* 底部按钮 */
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
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.selected-info {
    font-size: 26rpx;
    color: #333;
}

.book-btn {
    background: #07c160 !important;
    color: #fff !important;
    border-radius: 40rpx;
    font-size: 30rpx;
    padding: 0 50rpx;
    margin: 0;
    line-height: 80rpx;
}

.book-btn[disabled] {
    background: #ccc !important;
}

/* 场地选择 */
.court-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.court-item {
    width: 200rpx;
    height: 76rpx;
    line-height: 76rpx;
    text-align: center;
    background: #f5f5f5;
    border-radius: 12rpx;
    font-size: 28rpx;
}

.court-item.active {
    background: #07c160;
    color: #fff;
}

.no-court {
    font-size: 26rpx;
    color: #999;
    text-align: center;
    padding: 30rpx 0;
}
</style>
