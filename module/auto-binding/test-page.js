// 埋点测试页面
Page({
    data: {
        testList: [
            { id: 1, name: '测试项目1' },
            { id: 2, name: '测试项目2' },
            { id: 3, name: '测试项目3' }
        ],
        lastClickInfo: '暂无',
        trackCount: 0,
        normalClickCount: 0
    },

    onLoad() {
        console.log('测试页面加载');
        
        // 初始化埋点配置（如果还没有初始化的话）
        this.initTrackingIfNeeded();
    },

    onReady() {
        console.log('测试页面渲染完成');
        console.log('检查方法注入情况:');
        console.log('- handleGlobalClick:', typeof this.handleGlobalClick);
        console.log('- trackClick:', typeof this.trackClick);
        
        // 如果方法没有被自动注入，手动创建
        if (typeof this.handleGlobalClick !== 'function') {
            console.warn('handleGlobalClick 方法未被注入，手动创建');
            this.createManualHandlers();
        }
    },

    /**
     * 如果需要，初始化埋点配置
     */
    initTrackingIfNeeded() {
        // 这里可以检查全局埋点是否已经初始化
        // 如果没有，可以进行本地初始化
        console.log('检查埋点初始化状态');
    },

    /**
     * 手动创建处理器（备用方案）
     */
    createManualHandlers() {
        // 手动创建 handleGlobalClick 方法
        this.handleGlobalClick = (evt) => {
            console.log('手动创建的 handleGlobalClick 触发', evt);
            
            const target = evt.target || evt.currentTarget;
            const dataset = target.dataset || {};
            
            // 更新调试信息
            this.setData({
                lastClickInfo: `埋点: ${dataset.text || dataset.src || '未知'}`,
                trackCount: this.data.trackCount + 1
            });
            
            // 这里应该调用真正的埋点处理逻辑
            // 如果全局埋点已初始化，可以调用全局方法
            if (typeof getApp().globalData?.monitoInit?.handleGlobalClick === 'function') {
                getApp().globalData.monitoInit.handleGlobalClick(evt);
            } else {
                console.log('模拟埋点数据收集:', {
                    elementText: dataset.text,
                    imgSrc: dataset.src,
                    pageUrl: this.route,
                    timestamp: new Date().getTime()
                });
            }
        };

        // 手动创建 trackClick 方法
        this.trackClick = (evt) => {
            console.log('手动创建的 trackClick 触发', evt);
            
            const target = evt.target || evt.currentTarget;
            const dataset = target.dataset || {};
            
            // 更新调试信息
            this.setData({
                lastClickInfo: `自定义埋点: ${dataset.track || '未知'}`,
                trackCount: this.data.trackCount + 1
            });
            
            // 处理自定义埋点
            console.log('自定义埋点数据:', {
                trackType: dataset.track,
                pageUrl: this.route,
                timestamp: new Date().getTime()
            });
        };

        console.log('手动处理器创建完成');
    },

    /**
     * 普通点击（无埋点）
     */
    normalClick(evt) {
        console.log('普通点击事件', evt);
        
        this.setData({
            lastClickInfo: '普通点击（无埋点）',
            normalClickCount: this.data.normalClickCount + 1
        });
    },

    /**
     * 清除调试信息
     */
    clearDebugInfo() {
        this.setData({
            lastClickInfo: '暂无',
            trackCount: 0,
            normalClickCount: 0
        });
        
        console.log('调试信息已清除');
    },

    /**
     * 显示埋点数据
     */
    showTrackData() {
        const trackData = {
            页面路径: this.route,
            埋点次数: this.data.trackCount,
            普通点击次数: this.data.normalClickCount,
            最后点击: this.data.lastClickInfo,
            页面数据: this.data.testList
        };

        console.log('当前埋点数据:', trackData);
        
        wx.showModal({
            title: '埋点数据',
            content: JSON.stringify(trackData, null, 2),
            showCancel: false
        });
    },

    /**
     * 页面分享
     */
    onShareAppMessage() {
        return {
            title: '埋点测试页面',
            path: '/pages/test/test'
        };
    }

    // 注意：
    // 1. handleGlobalClick 和 trackClick 方法应该被自动注入
    // 2. 如果没有被注入，上面的 createManualHandlers 会创建备用方法
    // 3. 所有带有 data-text、data-src 或 data-track 属性的元素点击都会被处理
    // 4. 通过调试信息可以验证埋点是否正常工作
});

/*
使用说明：

1. 将此页面添加到您的小程序项目中
2. 确保埋点组件已经在 app.js 中初始化
3. 配置埋点列表包含以下项目：
   - { elementText: '打开按钮', actionType: 'open' }
   - { elementText: '关闭按钮', actionType: 'close' }
   - { elementText: '确认按钮', actionType: 'confirm' }
   - { elementText: '文本点击', actionType: 'text_click' }
   - { elementText: '列表项1', actionType: 'list_item' }
   - { elementText: '列表项2', actionType: 'list_item' }
   - { elementText: '列表项3', actionType: 'list_item' }
   - { elementText: '卡片点击', actionType: 'card_click' }
   - { imgSrc: 'test-image' }

4. 打开页面后，点击不同的元素测试埋点功能
5. 查看控制台日志和调试信息验证结果

预期结果：
- 所有带有 bindtap="handleGlobalClick" 的元素点击都会触发埋点
- 控制台会显示详细的埋点日志
- 调试信息区域会实时更新点击统计
- 埋点数据会被正确收集和处理
*/
