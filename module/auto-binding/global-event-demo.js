// 全局事件系统演示页面
// 注意：这个页面完全没有手写的埋点代码！

Page({
    data: {
        productList: [
            { id: 1, name: '精选商品 A', price: 299 },
            { id: 2, name: '热门商品 B', price: 399 },
            { id: 3, name: '推荐商品 C', price: 199 },
            { id: 4, name: '特价商品 D', price: 99 }
        ],
        lastClickInfo: '暂无点击',
        trackCount: 0,
        totalClickCount: 0
    },

    onLoad() {
        console.log('全局事件演示页面加载');
        
        // 只需要写业务逻辑，埋点会自动处理
        this.initPageData();
    },

    onReady() {
        console.log('页面渲染完成');
        
        // 检查全局事件方法是否被注入
        console.log('检查注入的方法:');
        console.log('- globalClick:', typeof this.globalClick);
        console.log('- autoTrack:', typeof this.autoTrack);
        console.log('- handleAnyClick:', typeof this.handleAnyClick);
        
        // 如果方法没有被注入，创建备用方法
        if (typeof this.globalClick !== 'function') {
            console.warn('全局事件方法未被注入，创建备用方法');
            this.createBackupMethods();
        }
        
        // 显示使用说明
        this.showUsageInstructions();
    },

    /**
     * 初始化页面数据
     */
    initPageData() {
        console.log('初始化页面数据');
        
        // 这里可以加载真实的业务数据
        // 例如：调用 API 获取商品列表
    },

    /**
     * 创建备用方法（如果全局事件系统没有正常工作）
     */
    createBackupMethods() {
        // 备用的全局点击处理方法
        this.globalClick = (evt) => {
            console.log('备用 globalClick 方法触发', evt);
            this.handleClickEvent(evt, 'globalClick');
        };

        // 备用的自动埋点方法
        this.autoTrack = (evt) => {
            console.log('备用 autoTrack 方法触发', evt);
            this.handleClickEvent(evt, 'autoTrack');
        };

        // 备用的通用点击方法
        this.handleAnyClick = (evt) => {
            console.log('备用 handleAnyClick 方法触发', evt);
            this.handleClickEvent(evt, 'handleAnyClick');
        };

        console.log('备用方法创建完成');
    },

    /**
     * 处理点击事件（备用逻辑）
     */
    handleClickEvent(evt, methodName) {
        const target = evt.target || evt.currentTarget;
        const dataset = target.dataset || {};
        
        // 更新统计信息
        const newTotalCount = this.data.totalClickCount + 1;
        let newTrackCount = this.data.trackCount;
        let clickInfo = `${methodName}: `;

        // 检查是否是需要埋点的元素
        if (dataset.text || dataset.src || dataset.track) {
            newTrackCount++;
            clickInfo += dataset.text || dataset.src || dataset.track || '未知';
            
            // 模拟埋点数据收集
            const trackData = {
                elementText: dataset.text,
                imgSrc: dataset.src,
                trackType: dataset.track,
                pageUrl: this.route || '/pages/demo/demo',
                timestamp: new Date().getTime(),
                method: methodName
            };
            
            console.log('模拟埋点数据:', trackData);
            
            // 这里应该调用真正的埋点上传逻辑
            // 如果全局埋点系统已初始化，可以调用：
            // getApp().globalData?.monitoInit?.handleGlobalClick(evt);
        } else {
            clickInfo += '无埋点数据';
        }

        // 更新页面数据
        this.setData({
            lastClickInfo: clickInfo,
            trackCount: newTrackCount,
            totalClickCount: newTotalCount
        });

        // 处理特殊点击
        this.handleSpecialClicks(dataset);
    },

    /**
     * 处理特殊点击逻辑
     */
    handleSpecialClicks(dataset) {
        if (dataset.text === '清除调试信息') {
            this.clearDebugInfo();
        } else if (dataset.text === '查看埋点数据') {
            this.showTrackData();
        }
    },

    /**
     * 清除调试信息
     */
    clearDebugInfo() {
        this.setData({
            lastClickInfo: '暂无点击',
            trackCount: 0,
            totalClickCount: 0
        });
        
        console.log('调试信息已清除');
        
        wx.showToast({
            title: '调试信息已清除',
            icon: 'success'
        });
    },

    /**
     * 显示埋点数据
     */
    showTrackData() {
        const trackData = {
            页面路径: this.route || '/pages/demo/demo',
            埋点次数: this.data.trackCount,
            总点击次数: this.data.totalClickCount,
            最后点击: this.data.lastClickInfo,
            商品数量: this.data.productList.length,
            当前时间: new Date().toLocaleString()
        };

        console.log('当前埋点数据:', trackData);
        
        wx.showModal({
            title: '埋点数据统计',
            content: JSON.stringify(trackData, null, 2),
            showCancel: false,
            confirmText: '确定'
        });
    },

    /**
     * 显示使用说明
     */
    showUsageInstructions() {
        console.log(`
=== 全局事件系统使用说明 ===

✅ 当前页面特点：
1. 在根容器上绑定了 bindtap="globalClick"
2. 所有子元素的点击都会被自动捕获
3. 系统会自动过滤需要埋点的元素
4. 无需为每个元素单独绑定事件

🎯 埋点元素识别：
- data-text: 文本埋点标识
- data-src: 图片埋点标识  
- data-track: 自定义埋点标识

📊 当前配置的埋点元素：
- 打开按钮、关闭按钮、确认按钮、取消按钮
- banner-image-1、banner-image-2
- 商品项目1、商品项目2、商品项目3、商品项目4
- 用户信息卡片、设置卡片
- special-action-1、special-action-2
- 嵌套容器点击
- 清除调试信息、查看埋点数据

🔧 使用方法：
1. 确保在 app.js 中初始化了埋点组件
2. 在页面根容器上绑定 bindtap="globalClick"
3. 为需要埋点的元素添加相应的 data 属性
4. 系统会自动处理所有埋点逻辑

💡 优势：
- 一次绑定，全局生效
- 自动过滤，按需埋点
- 无需手写埋点代码
- 支持嵌套元素点击
        `);
    },

    /**
     * 页面分享
     */
    onShareAppMessage() {
        return {
            title: '全局事件系统演示',
            path: '/pages/global-event-demo/global-event-demo',
            imageUrl: '/images/share-global-event.jpg'
        };
    }

    // 注意：
    // 1. globalClick、autoTrack、handleAnyClick 方法会被全局事件系统自动注入
    // 2. 如果系统正常工作，上面的备用方法不会被使用
    // 3. 所有埋点逻辑都由全局事件系统自动处理
    // 4. 开发者只需要专注于业务逻辑开发
    // 5. 在根容器上绑定 bindtap="globalClick" 即可实现全局事件捕获
});

/*
全局事件系统工作原理：

1. 系统劫持 Page() 构造函数
2. 自动为每个页面注入 globalClick、autoTrack、handleAnyClick 方法
3. 在页面根容器上绑定 bindtap="globalClick"
4. 用户点击任何子元素时，事件会冒泡到根容器
5. globalClick 方法被触发，获取实际点击的目标元素
6. 检查目标元素是否有埋点相关的 data 属性
7. 如果有，且在配置列表中，则触发埋点数据收集
8. 如果没有，则忽略该点击事件

这种方式的优势：
- 性能好：只绑定一个事件监听器
- 维护简单：无需为每个元素单独绑定
- 扩展性强：新增元素只需要添加 data 属性
- 兼容性好：利用原生的事件冒泡机制
*/
