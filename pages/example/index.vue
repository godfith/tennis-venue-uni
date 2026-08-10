<template>
    <view>
        <!-- pages/exampleDetail/index.wxml -->
        <block v-if="type === 'getOpenId'">
            <view class="page-container">
                <view class="title">功能介绍</view>
                <view class="info">云函数无需维护鉴权机制及登录票据，仅一行代码即可获得。</view>
                <view class="title">云函数获取OpenId示例</view>
                <!-- <view class="info">云函数无需维护鉴权机制及登录票据，仅一行代码即可获得。</view> -->
                <view class="block">
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">1</text>
                        quickStartFunctions 云函数代码
                    </view>
                    <view class="code_zone">
                        <rich-text :nodes="'<pre style='overflow: scroll;'>'+(callOpenIdCode)+'</pre>'" />
                    </view>
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">2</text>
                        小程序代码段
                    </view>
                    <view class="code_zone">
                        <rich-text :nodes="'<pre style='overflow: scroll;'>'+(callFunctionCode)+'</pre>'" />
                    </view>
                </view>
                <view class="block">
                    <view class="btn-full" @tap="getOpenId" v-if="!haveGetOpenId">运行示例</view>
                    <view class="box_text">{{ openId ? openId : 'OpenID将展示在这里' }}</view>
                    <cloud-tip-modal :showTipProps="showTip" :title="title" :content="content"></cloud-tip-modal>
                    <view class="button_clear" @tap="clearOpenId" v-if="haveGetOpenId">清空</view>
                </view>
            </view>
        </block>
        <block v-if="type === 'getMiniProgramCode'">
            <view class="page-container">
                <view class="title">功能介绍</view>
                <view class="info">可通过云函数免接口调用凭证，直接生成小程序码。</view>
                <view class="title">云函数获取小程序码示例</view>
                <view class="block">
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">1</text>
                        quickStartFunctions 云函数代码
                    </view>
                    <view class="code_zone">
                        <rich-text :nodes="'<pre style='overflow: scroll;'>'+(callMiniProgramCode)+'</pre>'" />
                    </view>
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">2</text>
                        小程序代码段
                    </view>
                    <view class="code_zone">
                        <rich-text :nodes="'<pre style='overflow: scroll;'>'+(callFunctionCode)+'</pre>'" />
                    </view>
                </view>
                <view class="block">
                    <view class="btn-full" @tap="getCodeSrc" v-if="!haveGetCodeSrc">运行示例</view>
                    <view class="box_text" v-if="!codeSrc">小程序码将展示在这里</view>
                    <view v-if="codeSrc" class="code_box">
                        <image class="code_img" :src="codeSrc"></image>
                    </view>
                    <view class="button_clear" @tap="clearCodeSrc" v-if="haveGetCodeSrc">清空</view>
                    <cloud-tip-modal :showTipProps="showTip" :title="title" :content="content"></cloud-tip-modal>
                </view>
            </view>
        </block>

        <block v-if="type === 'createCollection'">
            <view class="page-container">
                <view class="title">功能介绍</view>
                <view class="info">集合为常用数据库中表的概念。云开发数据库支持自动备份、无损回档，并且QPS高达3千+。</view>
                <view class="title">如何体验</view>
                <view class="info">已自动创建名为“sales”的体验合集，可打开“云开发控制台>数据库>记录列表”中找到该集合。</view>
                <image class="img" src="/static/images/database.png"></image>
                <view class="title">云函数代码示例</view>
                <view class="code_zone">
                    <rich-text :nodes="'<pre style='overflow: scroll;'>'+(callCreateCollectionCode)+'</pre>'" />
                </view>
            </view>
        </block>

        <block v-if="type === 'selectRecord'">
            <view class="page-container">
                <view class="title">功能介绍</view>
                <view class="top_tip">体验查询记录能力，查询数据表中的销量数据。</view>
                <view class="box_text" v-if="!record">销量数据将展示在这里</view>
                <view class="title">数据库操作示例</view>
                <view class="top_tip">参考云函数 quickstartFunctions 示例代码</view>
                <view v-if="record" class="code_box">
                    <view class="code_box_title">地区销量统计</view>
                    <view class="code_box_record">
                        <view class="code_box_record_title">地域</view>
                        <view class="code_box_record_title">城市</view>
                        <view class="code_box_record_title">销量</view>
                        <view class="code_box_record_title">操作</view>
                    </view>
                    <view class="line"></view>
                    <view class="code_box_record" v-for="(item, index) in record" :key="index">
                        <view class="code_box_record_detail">{{ item.region }}</view>

                        <view class="code_box_record_detail">{{ item.city }}</view>

                        <!-- <view class="code_box_record_detail">{{item.sales}}</view> -->

                        <input
                            style="background-color: rgba(0, 0, 0, 0.03)"
                            class="code_box_record_detail"
                            @input="bindInput"
                            :data-index="index"
                            :value="item.sales"
                            type="number"
                        />

                        <view class="code_box_record_detail">
                            <button style="font-size: 12px" @tap="deleteRecord" :data-id="item._id">删除</button>
                        </view>
                    </view>
                </view>
                <view class="btn-full" @tap="getRecord">查询记录</view>
                <view class="btn-full" @tap="updateRecord">更新记录</view>
                <view class="btn-full" @tap="insertRecord">新增记录</view>
                <!-- <view class="button_clear" bindtap="clearRecord" wx:if="{{haveGetRecord}}">清空</view> -->
                <cloud-tip-modal :showTipProps="showTip"></cloud-tip-modal>
            </view>
            <view v-if="showInsertModal" class="modal-mask">
                <view class="modal-content">
                    <view class="modal-title">新增销量记录</view>
                    <input class="modal-input" placeholder="地域" :value="insertRegion" @input="onInsertRegionInput" />
                    <input class="modal-input" placeholder="城市" :value="insertCity" @input="onInsertCityInput" />
                    <input class="modal-input" placeholder="销量" :value="insertSales" @input="onInsertSalesInput" type="number" />
                    <view class="modal-actions">
                        <button @tap="onInsertCancel">取消</button>
                        <button @tap="onInsertConfirm" type="primary">确认</button>
                    </view>
                </view>
            </view>
        </block>

        <block v-if="type === 'uploadFile'">
            <view class="page-container">
                <view class="title">功能介绍</view>
                <view class="top_tip">多存储类型，仅需一个云函数即可完成上传。</view>
                <view class="title">文件上传示例</view>
                <view class="block">
                    <view class="step-title">小程序代码段</view>
                    <view class="code_zone">
                        <rich-text :nodes="'<pre style='overflow: scroll;'>'+(callUploadFileCode)+'</pre>'" />
                    </view>
                </view>
                <view class="btn-full" @tap="uploadImg" v-if="!haveGetImgSrc">运行示例</view>
                <view class="box_text" v-if="!imgSrc">上传的图片将展示在这里</view>
                <view v-if="imgSrc" class="code_box">
                    <image class="code_img" :src="imgSrc"></image>
                    <!-- <view class="img_info">
        <view class="img_info_title">文件路径</view>
        <view class="img_info_detail">{{imgSrc}}</view>
      </view> -->
                </view>
                <view class="button_clear" @tap="clearImgSrc" v-if="haveGetImgSrc">清空</view>
                <cloud-tip-modal :showTipProps="showTip"></cloud-tip-modal>
            </view>
        </block>

        <block v-if="type === 'model-guide'">
            <view class="page-container">
                <view class="title">功能介绍</view>
                <view class="top_tip">腾讯云开发提供 AI 对话能力，支持 Agent，大模型流式对话，可通过 Agent-UI 组件快速集成 AI 能力</view>
                <view class="title">集成 Agent-UI 组件指引</view>
                <view class="block">
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">1</text>
                        拷贝组件源码包
                    </view>
                    <view style="display: flex; align-items: center">
                        点击复制查看组件仓库地址
                        <image mode="widthFix" style="width: 20px; height: 20px" @tap="copyUrl" src="/static/images/copy.svg" />
                    </view>
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">2</text>
                        将组件拷贝至小程序目录中
                    </view>
                    <image class="img" mode="widthFix" src="/static/images/ai_example2.png"></image>
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">3</text>
                        在页面 .json 配置文件中注册组件
                    </view>
                    <view class="code_zone">
                        <rich-text :nodes="'<pre style='overflow: scroll;'>'+(ai_page_config)+'</pre>'" />
                    </view>
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">4</text>
                        在页面 .wxml 文件中引用组件
                    </view>
                    <view class="code_zone">
                        <rich-text :nodes="'<pre style='overflow: scroll;'>'+(ai_wxml_config)+'</pre>'" />
                    </view>
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">4</text>
                        在页面 .js 文件中编写配置
                    </view>
                    <view class="code_zone">
                        <rich-text :nodes="'<pre style='overflow: scroll;'>'+(ai_data_config)+'</pre>'" />
                    </view>
                </view>
            </view>
        </block>

        <block v-if="type === 'cloudbaserun'">
            <view class="page-container">
                <view class="title">功能介绍</view>
                <view class="info">云托管 支持托管用任意语言和框架编写的容器化应用，为开发者提供高可用、自动弹性扩缩的云服务。</view>
                <view class="title">小程序调用云托管示例</view>
                <view class="block">
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">1</text>
                        前往云开发平台开通云托管
                    </view>
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">2</text>
                        新建容器型托管服务，等待部署完成
                    </view>
                    <view class="step-text">此处可使用 Express 示例模板进行安装，此处示例命名为 express-test</view>
                    <view>
                        <image class="img" src="/static/images/create_cbr.png" mode="aspectFill"></image>
                    </view>
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">3</text>
                        小程序端调用
                    </view>
                    <view class="code_zone">
                        <rich-text :nodes="'<pre style='overflow: scroll;'>'+(callcbrCode)+'</pre>'" />
                    </view>
                    <view class="btn-full" @tap="runCallContainer" v-if="!haveGetCallContainerRes">运行示例</view>
                    <view class="box_text">{{ callContainerResStr ? callContainerResStr : '云托管调用结果将展示在这里' }}</view>
                    <view class="button_clear" @tap="clearCallContainerRes" v-if="haveGetCallContainerRes">清空</view>
                </view>
            </view>
        </block>

        <block v-if="type === 'ai-assistant'">
            <view class="page-container">
                <view class="title">AI 智能开发小程序</view>
                <view class="info">连接 AI 开发工具与 MCP 开发小程序</view>

                <view class="block">
                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">1</text>
                        打开扩展面板
                    </view>
                    <view class="step-text">在微信开发者工具中使用快捷键打开扩展面板：</view>
                    <view class="notice-box">
                        <view class="notice-text">
                            <text class="notice-highlight">注意：</text>
                            使用快捷键前需先点击编辑区，将焦点从预览区切换到编辑区。
                        </view>
                    </view>
                    <view class="shortcut-box">
                        <view class="shortcut-item">
                            <view class="shortcut-label">Windows/Linux：</view>
                            <view class="shortcut-key">Ctrl + Shift + X</view>
                        </view>
                        <view class="shortcut-item">
                            <view class="shortcut-label">macOS：</view>
                            <view class="shortcut-key">Shift + Command + X</view>
                        </view>
                    </view>

                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">2</text>
                        搜索并安装插件
                    </view>
                    <view class="step-text">在扩展商店中搜索：</view>
                    <view class="plugin-name-box">
                        <text class="plugin-name">微信云开发 AI ToolKit</text>
                        <view class="copy-btn" @tap="copyPluginName">
                            <image class="copy-icon" src="/static/images/copy.svg" mode="widthFix"></image>
                            <text class="copy-text">复制</text>
                        </view>
                    </view>
                    <view class="step-text">找到插件后点击安装并启用</view>

                    <view class="step-title">
                        <text class="step-left">step</text>
                        <text class="step-right">3</text>
                        打开 AI 开发功能
                    </view>
                    <view class="step-text">安装完成后，选中任意文件，点击左上角打开 AI 开发功能即可使用</view>
                    <image
                        class="img step-img"
                        src="https://tcb-advanced-a656fc-1257967285.ap-shanghai.app.tcloudbase.com/imgs/wechat-ide-extension/ide-extension.png"
                        mode="widthFix"
                    ></image>

                    <view class="divider"></view>

                    <view class="feature-section">
                        <view class="feature-title">✨ 场景示例</view>
                        <view class="feature-list">
                            <view class="feature-item-with-examples">
                                <view class="feature-main">💡 智能代码生成与补全</view>
                                <view class="feature-examples">
                                    <view class="feature-example-wrapper">
                                        <text class="feature-example-text">· 帮我创建一个商品列表页面,包含图片、标题、价格和加入购物车按钮</text>
                                        <view class="feature-copy-btn" @tap="copyPrompt" data-prompt="帮我创建一个商品列表页面,包含图片、标题、价格和加入购物车按钮">
                                            <image class="feature-copy-icon" src="/static/images/copy.svg" mode="widthFix"></image>
                                        </view>
                                    </view>
                                    <view class="feature-example-wrapper">
                                        <text class="feature-example-text">· 帮我完善这个函数,实现商品搜索功能</text>
                                        <view class="feature-copy-btn" @tap="copyPrompt" data-prompt="帮我完善这个函数,实现商品搜索功能">
                                            <image class="feature-copy-icon" src="/static/images/copy.svg" mode="widthFix"></image>
                                        </view>
                                    </view>
                                </view>
                            </view>

                            <view class="feature-item-with-examples">
                                <view class="feature-main">🔧 代码优化与重构建议</view>
                                <view class="feature-examples">
                                    <view class="feature-example-wrapper">
                                        <text class="feature-example-text">· 优化这个页面的间隔，提升信息密度</text>
                                        <view class="feature-copy-btn" @tap="copyPrompt" data-prompt="优化这个页面的间隔，提升信息密度">
                                            <image class="feature-copy-icon" src="/static/images/copy.svg" mode="widthFix"></image>
                                        </view>
                                    </view>
                                    <view class="feature-example-wrapper">
                                        <text class="feature-example-text">· 完善云函数调用的错误处理代码</text>
                                        <view class="feature-copy-btn" @tap="copyPrompt" data-prompt="完善云函数调用的错误处理代码">
                                            <image class="feature-copy-icon" src="/static/images/copy.svg" mode="widthFix"></image>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </block>
    </view>
</template>

<script>
import cloudTipModal from '@/components/cloudTipModal/index';
// pages/exampleDetail/index.js
export default {
    components: {
        cloudTipModal
    },
    data() {
        return {
            type: '',
            envId: '',
            showTip: false,
            title: '',
            content: '',
            haveGetOpenId: false,
            openId: '',
            haveGetCodeSrc: false,
            codeSrc: '',
            haveGetRecord: false,
            record: [],
            haveGetImgSrc: false,
            imgSrc: '',

            // ai
            modelConfig: {
                modelProvider: 'deepseek',
                // 大模型服务厂商
                quickResponseModel: 'deepseek-v3',
                // 快速响应模型 （混元 turbo, gpt4 turbo版，deepseek v3等）
                logo: 'https://cloudcache.tencent-cloud.com/qcloud/ui/static/static_source_business/2339414f-2c0d-4537-9618-1812bd14f4af.svg',
                // model 头像
                welcomeMsg: '我是deepseek-v3，很高兴见到你！' // model 欢迎语
            },

            callcbrCode: '',
            initEnvCode: '',
            callOpenIdCode: '',
            callMiniProgramCode: '',
            callFunctionCode: '',
            callCreateCollectionCode: '',
            callUploadFileCode: '',
            showInsertModal: false,
            insertRegion: '',
            insertCity: '',
            insertSales: '',
            haveGetCallContainerRes: false,
            callContainerResStr: '',

            ai_page_config: `{
            "usingComponents": {
              "agent-ui":"/components/agent-ui/index"
            },
            }`,

            ai_wxml_config: `&lt;agent-ui agentConfig="{{agentConfig}}" showBotAvatar="{{showBotAvatar}}" chatMode="{{chatMode}}" modelConfig="{{modelConfig}}""&gt;&lt;/agent-ui&gt;`,

            ai_data_config: `data: {
            chatMode: "bot", // bot 表示使用agent，model 表示使用大模型
            showBotAvatar: true, // 是否在对话框左侧显示头像
            agentConfig: {
              botId: "your agent id", // agent id,
              allowWebSearch: true, // 允许客户端选择展示联网搜索按钮
              allowUploadFile: true, // 允许客户端展示上传文件按钮
              allowPullRefresh: true, // 允许客户端展示下拉刷新
              allowUploadImage: true, // 允许客户端展示上传图片按钮
              allowMultiConversation: true, // 允许客户端展示查看会话列表/新建会话按钮
              showToolCallDetail: true, // 是否展示 mcp server toolCall 细节
              allowVoice: true, // 允许客户端展示语音按钮
              showBotName: true, // 允许展示bot名称
            },
            modelConfig: {
              modelProvider: "hunyuan-open", // 大模型服务厂商
              quickResponseModel: "hunyuan-lite", // 大模型名称
              logo: "", // model 头像
              welcomeMsg: "欢迎语", // model 欢迎语
            },
            }`,

            // AI 场景示例数据
            aiScenarios: [
                {
                    title: '💡 智能代码生成与补全',
                    examples: ['帮我创建一个商品列表页面,包含图片、标题、价格和加入购物车按钮', '帮我完善这个函数,实现商品搜索功能']
                },
                {
                    title: '🔧 代码优化与重构建议',
                    examples: ['优化这段代码的性能,减少不必要的渲染', '完善云函数调用的错误处理代码']
                }
            ],

            showUploadTip: false
        };
    },
    onLoad(options) {
        if (options.type === 'cloudbaserunfunction' || options.type === 'cloudbaserun') {
            this.getCallcbrCode();
        }
        if (options.type === 'getOpenId') {
            this.getOpenIdCode();
        }
        if (options.type === 'getMiniProgramCode') {
            this.getMiniProgramCode();
        }
        if (options.type === 'createCollection') {
            this.getCreateCollectionCode();
        }
        if (options.type === 'uploadFile') {
            this.getUploadFileCode();
        }
        this.setData({
            type: options?.type,
            envId: options?.envId
        });
    },
    methods: {
        copyUrl() {
            uni.setClipboardData({
                data: 'https://gitee.com/TencentCloudBase/cloudbase-agent-ui/tree/main/apps/miniprogram-agent-ui/miniprogram/components/agent-ui',
                success: function (res) {
                    uni.showToast({
                        title: '复制成功',
                        icon: 'success'
                    });
                }
            });
        },

        copyPluginName() {
            uni.setClipboardData({
                data: '微信云开发 AI ToolKit',
                success: function (res) {
                    uni.showToast({
                        title: '复制成功',
                        icon: 'success'
                    });
                }
            });
        },

        copyPrompt(e) {
            const prompt = e.currentTarget.dataset.prompt;
            uni.setClipboardData({
                data: prompt,
                success: function (res) {
                    uni.showToast({
                        title: '复制成功',
                        icon: 'success'
                    });
                }
            });
        },

        insertRecord() {
            this.setData({
                showInsertModal: true,
                insertRegion: '',
                insertCity: '',
                insertSales: ''
            });
        },

        deleteRecord(e) {
            // 调用云函数删除记录
            uni.showLoading({
                title: '删除中...'
            });
            wx.cloud
                .callFunction({
                    name: 'quickstartFunctions',
                    data: {
                        type: 'deleteRecord',
                        data: {
                            _id: e.currentTarget.dataset.id
                        }
                    }
                })
                .then((resp) => {
                    uni.showToast({
                        title: '删除成功'
                    });
                    this.getRecord(); // 刷新列表
                    uni.hideLoading();
                })
                .catch((e) => {
                    uni.showToast({
                        title: '删除失败',
                        icon: 'none'
                    });
                    uni.hideLoading();
                });
        },

        // 输入框事件
        onInsertRegionInput(e) {
            this.setData({
                insertRegion: e.detail.value
            });
        },

        onInsertCityInput(e) {
            this.setData({
                insertCity: e.detail.value
            });
        },

        onInsertSalesInput(e) {
            this.setData({
                insertSales: e.detail.value
            });
        },

        // 取消弹窗
        onInsertCancel() {
            this.setData({
                showInsertModal: false
            });
        },

        // 确认插入
        async onInsertConfirm() {
            const { insertRegion, insertCity, insertSales } = this;
            if (!insertRegion || !insertCity || !insertSales) {
                uni.showToast({
                    title: '请填写完整信息',
                    icon: 'none'
                });
                return;
            }
            uni.showLoading({
                title: '插入中...'
            });
            try {
                await wx.cloud.callFunction({
                    name: 'quickstartFunctions',
                    data: {
                        type: 'insertRecord',
                        data: {
                            region: insertRegion,
                            city: insertCity,
                            sales: Number(insertSales)
                        }
                    }
                });
                uni.showToast({
                    title: '插入成功'
                });
                this.setData({
                    showInsertModal: false
                });
                this.getRecord(); // 刷新列表
            } catch (e) {
                console.log('CatchClause', e);
                console.log('CatchClause', e);
                uni.showToast({
                    title: '插入失败',
                    icon: 'none'
                });
                console.error(e);
            } finally {
                uni.hideLoading();
            }
        },

        getOpenId() {
            uni.showLoading({
                title: ''
            });
            wx.cloud
                .callFunction({
                    name: 'quickstartFunctions',
                    data: {
                        type: 'getOpenId'
                    }
                })
                .then((resp) => {
                    this.setData({
                        haveGetOpenId: true,
                        openId: resp.result.openid
                    });
                    uni.hideLoading();
                })
                .catch((e) => {
                    uni.hideLoading();
                    const { errCode, errMsg } = e;
                    if (errMsg.includes('Environment not found')) {
                        this.setData({
                            showTip: true,
                            title: '云开发环境未找到',
                            content: '如果已经开通云开发，请检查环境ID与 `miniprogram/app.js` 中的 `env` 参数是否一致。'
                        });
                        return;
                    }
                    if (errMsg.includes('FunctionName parameter could not be found')) {
                        this.setData({
                            showTip: true,
                            title: '请上传云函数',
                            content: "在'cloudfunctions/quickstartFunctions'目录右键，选择【上传并部署-云端安装依赖】，等待云函数上传完成后重试。"
                        });
                        return;
                    }
                });
        },

        clearOpenId() {
            this.setData({
                haveGetOpenId: false,
                openId: ''
            });
        },

        clearCallContainerRes() {
            this.setData({
                haveGetCallContainerRes: false,
                callContainerResStr: ''
            });
        },

        getCodeSrc() {
            uni.showLoading({
                title: ''
            });
            wx.cloud
                .callFunction({
                    name: 'quickstartFunctions',
                    data: {
                        type: 'getMiniProgramCode'
                    }
                })
                .then((resp) => {
                    this.setData({
                        haveGetCodeSrc: true,
                        codeSrc: resp.result
                    });
                    uni.hideLoading();
                })
                .catch((e) => {
                    uni.hideLoading();
                    console.error(e);
                    const { errCode, errMsg } = e;
                    if (errMsg.includes('Environment not found')) {
                        this.setData({
                            showTip: true,
                            title: '云开发环境未找到',
                            content: '如果已经开通云开发，请检查环境ID与 `miniprogram/app.js` 中的 `env` 参数是否一致。'
                        });
                        return;
                    }
                    if (errMsg.includes('FunctionName parameter could not be found')) {
                        this.setData({
                            showTip: true,
                            title: '请上传云函数',
                            content: "在'cloudfunctions/quickstartFunctions'目录右键，选择【上传并部署-云端安装依赖】，等待云函数上传完成后重试。"
                        });
                        return;
                    }
                });
        },

        clearCodeSrc() {
            this.setData({
                haveGetCodeSrc: false,
                codeSrc: ''
            });
        },

        bindInput(e) {
            const index = e.currentTarget.dataset.index;
            const record = this.record;
            record[index].sales = Number(e.detail.value);
            this.setData({
                record
            });
        },

        getRecord() {
            uni.showLoading({
                title: ''
            });
            wx.cloud
                .callFunction({
                    name: 'quickstartFunctions',
                    data: {
                        type: 'selectRecord'
                    }
                })
                .then((resp) => {
                    this.setData({
                        haveGetRecord: true,
                        record: resp.result.data
                    });
                    uni.hideLoading();
                })
                .catch((e) => {
                    this.setData({
                        showTip: true
                    });
                    uni.hideLoading();
                    console.error(e);
                });
        },

        clearRecord() {
            this.setData({
                haveGetRecord: false,
                record: []
            });
        },

        updateRecord() {
            uni.showLoading({
                title: ''
            });
            wx.cloud
                .callFunction({
                    name: 'quickstartFunctions',
                    data: {
                        type: 'updateRecord',
                        data: this.record
                    }
                })
                .then((resp) => {
                    uni.showToast({
                        title: '更新成功'
                    });
                    uni.hideLoading();
                })
                .catch((e) => {
                    console.log(e);
                    this.setData({
                        showUploadTip: true
                    });
                    uni.hideLoading();
                });
        },

        uploadImg() {
            uni.showLoading({
                title: ''
            });
            // 让用户选择一张图片
            uni.chooseMedia({
                count: 1,
                success: (chooseResult) => {
                    // 将图片上传至云存储空间
                    wx.cloud
                        .uploadFile({
                            // 指定上传到的云路径
                            cloudPath: `my-photo-${new Date().getTime()}.png`,
                            // 指定要上传的文件的小程序临时文件路径
                            filePath: chooseResult.tempFiles[0].tempFilePath
                        })
                        .then((res) => {
                            this.setData({
                                haveGetImgSrc: true,
                                imgSrc: res.fileID
                            });
                        })
                        .catch((e) => {
                            console.log('e', e);
                        });
                },
                complete: () => {
                    uni.hideLoading();
                }
            });
        },

        clearImgSrc() {
            this.setData({
                haveGetImgSrc: false,
                imgSrc: ''
            });
        },

        goOfficialWebsite() {
            const url = 'https://docs.cloudbase.net/toolbox/quick-start';
            uni.navigateTo({
                url: `../web/index?url=${url}`
            });
        },

        runCallContainer: async function () {
            const app = getApp();
            console.log('globalData', app.globalData);
            const c1 = new wx.cloud.Cloud({
                resourceEnv: app.globalData.env
            });
            await c1.init();
            const r = await c1.callContainer({
                path: '/api/users',
                // 填入业务自定义路径
                header: {
                    'X-WX-SERVICE': 'express-test' // 填入服务名称
                },

                // 其余参数同 wx.request
                method: 'GET'
            });
            console.log(r);
            this.setData({
                haveGetCallContainerRes: true,
                callContainerResStr: `${JSON.stringify(r.data.items, null, 2)}`
            });
        },

        getCallcbrCode: function () {
            const app = getApp();
            this.setData({
                callcbrCode: `const c1 = new wx.cloud.Cloud({
    resourceEnv: ${app.globalData.env}
  })
  await c1.init()
  const r = await c1.callContainer({
    path: '/api/users', // 此处填入业务自定义路径， /api/users 为示例路径
    header: {
      'X-WX-SERVICE': 'express-test', // 填入业务服务名称，express-test 为示例服务
    },
    // 其余参数同 wx.request
    method: 'GET',
  })`
            });
        },

        getInitEnvCode: function () {
            const app = getApp();
            this.setData({
                initEnvCode: `wx.cloud.init({
    env: ${app.globalData.env},
    traceUser: true,
  });`
            });
        },

        getCreateCollectionCode: function () {
            this.setData({
                callCreateCollectionCode: `const cloud = require('wx-server-sdk');
  cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  });
  const db = cloud.database();
  // 创建集合云函数入口函数
  exports.main = async (event, context) => {
    try {
      // 创建集合
      await db.createCollection('sales');
      return {
        success: true
      };
    } catch (e) {
      return {
        success: true,
        data: 'create collection success'
      };
    }
  };`
            });
        },

        getOpenIdCode: function () {
            this.setData({
                callOpenIdCode: `const cloud = require('wx-server-sdk');
  cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  });
  // 获取openId云函数入口函数
  exports.main = async (event, context) => {
    // 获取基础信息
    const wxContext = cloud.getWXContext();
    return {
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    };
  };`,
                callFunctionCode: `wx.cloud.callFunction({
    name: 'quickstartFunctions',
    data: {
      type: 'getOpenId'
    }
  }).then((resp) => console.log(resp))`
            });
        },

        getMiniProgramCode: function () {
            this.setData({
                callMiniProgramCode: `const cloud = require('wx-server-sdk');
  cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  });
  // 获取小程序二维码云函数入口函数
  exports.main = async (event, context) => {
    // 获取小程序二维码的buffer
    const resp = await cloud.openapi.wxacode.get({
      path: 'pages/index/index'
    });
    const { buffer } = resp;
    // 将图片上传云存储空间
    const upload = await cloud.uploadFile({
      cloudPath: 'code.png',
      fileContent: buffer
    });
    return upload.fileID;
  };
  `,
                callFunctionCode: `wx.cloud.callFunction({
    name: 'quickstartFunctions',
    data: {
      type: 'getMiniProgramCode'
    }
  }).then((resp) => console.log(resp))`
            });
        },

        getUploadFileCode: function () {
            this.setData({
                callUploadFileCode: `wx.chooseMedia({
  count: 1,
  success: (chooseResult) => {
    // 将图片上传至云存储空间
    wx.cloud
      .uploadFile({
        // 指定上传到的云路径
        cloudPath: "my-photo.png",
        // 指定要上传的文件的小程序临时文件路径
        filePath: chooseResult.tempFiles[0].tempFilePath,
      })
      .then((res) => {
        console.log(res)
      })
      .catch((e) => {
        console.log('e', e)
      });
  }
  });`
            });
        }
    }
};
</script>
<style>
page {
    background-color: white;
    padding-bottom: 50px;
    font-family: PingFang SC;
}

.page-container {
    padding: 20rpx 40rpx;
}

.tip {
    font-size: 23rpx;
    color: rgba(0, 0, 0, 0.5);
    width: 90%;
    text-align: center;
    margin: 30rpx auto 0 auto;
}

.top_tip {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.5);
    width: 90%;
    text-align: left;
    margin-top: 30rpx;
    /* margin-left: 20rpx; */
}

.box_text {
    background-color: white;
    text-align: center;
    padding: 300rpx 0;
    margin-top: 30rpx;
    color: rgba(0, 0, 0, 0.5);
}

.button {
    width: 300rpx;
    text-align: center;
    margin: 250rpx auto 0 auto;
    height: 80rpx;
    color: white;
    border-radius: 5px;
    line-height: 80rpx;
    background-color: #07c160;
}

.button_clear {
    width: 300rpx;
    text-align: center;
    margin: 0 auto 0 auto;
    height: 80rpx;
    color: #07c160;
    border-radius: 5px;
    line-height: 80rpx;
    background-color: rgba(0, 0, 0, 0.03);
}

.line {
    height: 1rpx;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.1);
}

.code_box {
    text-align: center;
    background-color: white;
    margin-top: 30rpx;
    padding: 17rpx;
}

.code_box_title {
    color: rgba(0, 0, 0, 0.5);
    font-size: 26rpx;
    margin-bottom: 20rpx;
    text-align: left;
}

.code_box_record {
    display: flex;
}

.code_box_record_title {
    width: 33%;
    font-size: 26rpx;
    color: rgba(0, 0, 0, 0.5);
    padding: 20rpx 0;
}

.code_box_record_detail {
    width: 25%;
    font-size: 26rpx;
    padding: 20rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.title {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: 36rpx;
    font-weight: 500;
    color: #000;
}

.info {
    margin-top: 12px;
    font-size: 28rpx;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.6);
    line-height: 52rpx;
}

.img {
    /* margin-top: 16px; */
    width: 100%;
}

.step-img {
    margin-top: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.code_img {
    width: 360rpx;
    height: 360rpx;
}

.block {
    font-size: 16px;
    line-height: 40px;
}

.step-left {
    color: #fff;
    background-color: #1aad19;
    border: #1aad19 solid 1px;
    padding: 0px 6px;
}

.step-right {
    color: #1aad19;
    background-color: #fff;
    border: #1aad19 solid 1px;
    padding: 0px 6px;
    margin-right: 10px;
}

.code_zone {
    background-color: #0e190e;
    color: rgba(255, 255, 255, 0.7);
    border-radius: 12rpx;
    padding: 16rpx 32rpx;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    position: relative;
    margin-bottom: 24rpx;
}

.btn-full {
    height: 40px;
    border-radius: 4px;
    line-height: 40px;
    color: #fff;
    background-color: #1aad19;
    text-align: center;
    margin-bottom: 5px;
}

.step-title {
    line-height: 37px;
    font-size: 16px;
}

.step-text {
    font-size: 14px;
    line-height: 24px;
    padding: 10px 0px;
    text-align: justify;
}

.modal-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}
.modal-content {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    width: 80%;
}
.modal-title {
    font-size: 18px;
    margin-bottom: 16px;
}
.modal-input {
    margin-bottom: 12px;
    border: 1px solid #eee;
    padding: 8px;
    border-radius: 4px;
    width: 100%;
}
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* AI助手相关样式 */
.notice-box {
    background: linear-gradient(135deg, #fff8e6 0%, #fff3d9 100%);
    border-left: 4rpx solid #ff9800;
    border-radius: 8rpx;
    padding: 20rpx 24rpx;
    margin: 20rpx 0;
    box-shadow: 0 2rpx 8rpx rgba(255, 152, 0, 0.1);
}

.notice-text {
    font-size: 26rpx;
    color: rgba(0, 0, 0, 0.75);
    line-height: 40rpx;
}

.notice-highlight {
    color: #ff6f00;
    font-weight: 600;
}

.shortcut-box {
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 8rpx;
    padding: 24rpx;
    margin: 20rpx 0;
}

.shortcut-item {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
}

.shortcut-item:last-child {
    margin-bottom: 0;
}

.shortcut-label {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.7);
    width: 240rpx;
    flex-shrink: 0;
}

.shortcut-key {
    font-size: 28rpx;
    color: #1aad19;
    font-weight: 500;
    background-color: rgba(26, 173, 25, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
    white-space: nowrap;
}

.plugin-name-box {
    background-color: rgba(26, 173, 25, 0.05);
    border-left: 4rpx solid #1aad19;
    padding: 20rpx;
    margin: 20rpx 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.plugin-name {
    font-size: 32rpx;
    color: #1aad19;
    font-weight: 500;
    flex: 1;
}

.copy-btn {
    display: flex;
    align-items: center;
    padding: 6rpx 16rpx;
    background-color: rgba(26, 173, 25, 0.1);
    border: 1rpx solid rgba(26, 173, 25, 0.3);
    border-radius: 8rpx;
    margin-left: 20rpx;
    transition: all 0.2s;
}

.copy-btn:active {
    background-color: rgba(26, 173, 25, 0.2);
}

.copy-icon {
    width: 24rpx;
    height: 24rpx;
    margin-right: 6rpx;
    filter: invert(52%) sepia(73%) saturate(2034%) hue-rotate(90deg) brightness(92%) contrast(84%);
}

.copy-text {
    font-size: 24rpx;
    color: #1aad19;
    font-weight: 500;
}

.divider {
    height: 1rpx;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    margin: 40rpx 0;
}

.feature-section {
    margin-top: 20rpx;
}

.feature-title {
    font-size: 32rpx;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 20rpx;
}

.feature-list {
    padding-left: 0;
}

.feature-item {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.65);
    line-height: 48rpx;
    margin-bottom: 12rpx;
}

/* 带示例的功能项 */
.feature-item-with-examples {
    margin-bottom: 20rpx;
    padding: 20rpx;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 12rpx;
}

.feature-item-with-examples:last-child {
    margin-bottom: 0;
}

.feature-main {
    font-size: 30rpx;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 12rpx;
    padding-bottom: 8rpx;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
}

.feature-examples {
    padding-left: 0;
}

.feature-example {
    font-size: 26rpx;
    color: rgba(0, 0, 0, 0.55);
    line-height: 44rpx;
    margin-bottom: 8rpx;
}

.feature-example-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4rpx;
    padding: 8rpx 12rpx;
}

.feature-example-text {
    flex: 1;
    font-size: 26rpx;
    color: rgba(0, 0, 0, 0.55);
    line-height: 40rpx;
}

.feature-copy-btn {
    padding: 12rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12rpx;
    flex-shrink: 0;
    transition: all 0.2s;
}

.feature-copy-btn:active {
    background-color: rgba(0, 0, 0, 0.08);
}

.feature-copy-icon {
    width: 32rpx;
    height: 32rpx;
    opacity: 0.5;
    transition: opacity 0.2s;
}

.feature-copy-btn:active .feature-copy-icon {
    opacity: 0.8;
}
</style>
