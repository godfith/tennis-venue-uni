<script>
export default {
    data() {
        return {};
    },
    onLaunch() {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力');
        } else {
            wx.cloud.init({
                env: 'cloud1-d0gmljq45868f5766',
                // 你的环境ID
                traceUser: true
            });
        }
    },
    globalData: {}
};
</script>
<style>
/**app.wxss**/
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}

button {
    background: initial;
}

button:focus {
    outline: 0;
}

button::after {
    border: none;
}

page {
    background: #f6f6f6;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}
</style>
