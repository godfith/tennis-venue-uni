<template>
    <view>
        <view class="container">
            <view class="header">
                <view class="title">{{ venueName || '网球场馆预约' }}</view>
                <view class="sub-title" v-if="venueName">场地预约</view>
            </view>

            <scroll-view class="date-scroll" :scroll-x="true" :enable-flex="true">
                <view :class="'date-item ' + (currentDate === item.date ? 'active' : '')" @tap="onSelectDate(item.date)" v-for="(item, index) in dateList" :key="index">
                    <view class="week">{{ item.week }}</view>
                    <view class="day">{{ item.day }}</view>
                </view>
            </scroll-view>

            <view class="court-area">
                <view class="court-card" v-for="(item, index) in courtList" :key="index">
                    <view class="court-header">
                        <text class="court-name">{{ item.name }}</text>
                        <text class="court-desc">{{ item.desc }}</text>
                    </view>
                    <view class="time-grid">
                        <view
                          :class="'time-cell ' + (cell.status === 'full' ? 'full' : '') + ' ' + (cell.status === 'group' ? 'group' : '') + ' ' + (currentCourtId === item.id && currentTime === cell.time ? 'selected' : '')"
                          @tap="onSelectSlot(item.id, item.name, cell.time, cell.status)"
                          v-for="(cell, index1) in item.times"
                          :key="index1"
                        >
                          <view class="time-text">{{ cell.short }}</view>
                          <view class="status-text">{{ statusText(cell.status) }}</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="bottom-bar" v-if="currentCourtId">
                <view class="selected-info">
                    <view>{{ currentCourtName }}</view>
                    <view class="selected-time">{{ currentTime }}</view>
                </view>
                <button class="book-btn" :loading="booking" @tap="onBook">确认预约</button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            courtConfig: [],
            dateList: [],
			venueName: '',
            courtList: [],
            currentDate: '',
            currentCourtId: '',
            currentCourtName: '',
            currentTime: '',
            booking: false,
            allTimes: [
                { time: '08:00-09:00', short: '08:00', hour: 8 },
                { time: '09:00-10:00', short: '09:00', hour: 9 },
                { time: '10:00-11:00', short: '10:00', hour: 10 },
                { time: '11:00-12:00', short: '11:00', hour: 11 },
                { time: '14:00-15:00', short: '14:00', hour: 14 },
                { time: '15:00-16:00', short: '15:00', hour: 15 },
                { time: '16:00-17:00', short: '16:00', hour: 16 },
                { time: '17:00-18:00', short: '17:00', hour: 17 },
                { time: '18:00-19:00', short: '18:00', hour: 18 },
                { time: '19:00-20:00', short: '19:00', hour: 19 },
                { time: '20:00-21:00', short: '20:00', hour: 20 }
            ]
        };
    },
    onLoad() {
        this.loadCourts();
        this.initDateList();
    },
	onShow() {
	  this.venueName = uni.getStorageSync('venue_name') || ''
	  this.loadCourts()
	},
    methods: {
        statusText(s) {
          if (s === 'full') return '已租'
          if (s === 'group') return '团课'
          return '可约'
        },

        loadCourts() {
		this.venueName = uni.getStorageSync('venue_name') || ''
          const venueId = uni.getStorageSync('venue_id')
          if (!venueId) {
            uni.showToast({ title: '请先在首页选择场馆', icon: 'none' })
            this.courtConfig = []
            this.courtList = []
            return
          }

          wx.cloud
            .callFunction({
              name: 'userApi',
              data: { action: 'getCourts', venueId }
            })
            .then((res) => {
              const result = res.result || {}
              if (!result.ok) {
                uni.showToast({ title: result.msg || '加载场地失败', icon: 'none' })
                return
              }
              const courtConfig = (result.list || []).map((item) => ({
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
              uni.showToast({ title: '加载场地失败', icon: 'none' })
            })
        },

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

        onSelectDate(date) {
          this.currentDate = date
          this.currentCourtId = ''
          this.currentCourtName = ''
          this.currentTime = ''
          this.loadCourtStatus(date)
        },

        getAvailableTimes(dateStr) {
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            if (dateStr !== todayStr) {
                return this.allTimes;
            }

            return this.allTimes.filter((item) => {
                if (item.hour < currentHour) return false;
                if (item.hour === currentHour && currentMinute > 0) return false;
                return true;
            });
        },

        loadCourtStatus(date) {
            const venueId = uni.getStorageSync('venue_id') || ''
            const { courtConfig } = this;
            const availableTimes = this.getAvailableTimes(date);

            if (availableTimes.length === 0) {
                this.courtList = []
                uni.showToast({ title: '今日已无剩余时段', icon: 'none' });
                return;
            }

            if (!venueId || !courtConfig.length) {
              this.courtList = []
              return
            }

            wx.cloud
              .callFunction({
                name: 'userApi',
                data: { action: 'getSchedule', venueId, date }
              })
              .then((res) => {
                const result = res.result || {}
                const bookedMap = {}
                const groupMap = {}
                ;(result.bookings || []).forEach((item) => {
                  if (item.status === 'booked' && !item.groupClassId) {
                    bookedMap[`${item.court}_${item.time}`] = true
                  }
                })
                ;(result.groupClasses || []).forEach((g) => {
                  if (g.status === 'open') {
                    groupMap[`${g.court}_${g.time}`] = true
                  }
                })

                this.courtList = courtConfig.map((court) => ({
                  ...court,
                  times: availableTimes.map((t) => {
                    const key = `${court.name}_${t.time}`
                    let status = 'available'
                    if (groupMap[key]) status = 'group'
                    else if (bookedMap[key]) status = 'full'
                    return { time: t.time, short: t.short, status }
                  })
                }))
              })
              .catch((err) => {
                console.error('查询失败', err)
                this.courtList = courtConfig.map((court) => ({
                  ...court,
                  times: availableTimes.map((t) => ({
                    time: t.time,
                    short: t.short,
                    status: 'available'
                  }))
                }))
              })
        },

        onSelectSlot(courtId, courtName, time, status) {
          if (status === 'full') {
            uni.showToast({ title: '该时段已被预约', icon: 'none' })
            return
          }
          if (status === 'group') {
            uni.showToast({ title: '该时段为团课，请从团课入口报名', icon: 'none' })
            return
          }
          this.currentCourtId = courtId
          this.currentCourtName = courtName
          this.currentTime = time
        },

        onBook() {
            const { currentDate, currentCourtName, currentTime } = this;
            if (!currentDate || !currentCourtName || !currentTime) {
                uni.showToast({ title: '请选择场地和时间', icon: 'none' });
                return;
            }
            const nickName = uni.getStorageSync('nickName') || ''
            const phone = uni.getStorageSync('phone') || ''
            const userDocId = uni.getStorageSync('userDocId') || ''
            if (!nickName || !phone) {
              uni.showToast({ title: '请先登录', icon: 'none' })
              uni.navigateTo({ url: '/pages/login/login' })
              return
            }

            uni.showModal({
                title: '确认预约',
                content: `场地：${currentCourtName}\n日期：${currentDate}\n时间：${currentTime}`,
                success: (res) => {
                    if (!res.confirm) return
                    this.booking = true
                    wx.cloud
                      .callFunction({
                        name: 'userApi',
                        data: {
                          action: 'createBooking',
                          data: {
                            court: currentCourtName,
                            date: currentDate,
                            time: currentTime,
                            venueId: uni.getStorageSync('venue_id') || '',
                            venueName: uni.getStorageSync('venue_name') || '',
                            userName: nickName,
                            phone,
                            userId: userDocId
                          }
                        }
                      })
                      .then((r) => {
                        const result = r.result || {}
                        if (!result.ok) {
                          uni.showToast({ title: result.msg || '预约失败', icon: 'none' })
                          return
                        }
                        uni.showToast({ title: '预约成功', icon: 'success' })
                        this.loadCourtStatus(currentDate)
                        this.currentCourtId = ''
                        this.currentCourtName = ''
                        this.currentTime = ''
                      })
                      .catch((err) => {
                        console.error(err)
                        uni.showToast({ title: '预约失败', icon: 'none' })
                      })
                      .finally(() => {
                        this.booking = false
                      })
                }
            });
        }
    }
};
</script>
<style>
	.sub-title {
	  font-size: 26rpx;
	  color: #888;
	  margin-top: 8rpx;
	}
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
.time-cell.group {
    background: #fce4ec;
    color: #c2185b;
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
</style>
