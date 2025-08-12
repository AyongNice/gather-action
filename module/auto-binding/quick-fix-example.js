// 快速修复示例页面
// 直接复制这个代码到您的 pages/index/index.js 中

Page({
    data: {
        message: 'Hello World',
        testItems: [
            { id: 1, name: '测试项目1' },
            { id: 2, name: '测试项目2' },
            { id: 3, name: '测试项目3' }
        ]
    },

    onLoad() {
        console.log('🚀 页面加载，立即修复 globalClick 方法');
        
        // 立即修复方法
        this.fixGlobalClickMethods();
        
        // 检查修复结果
        this.checkMethodsAfterFix();
    },

    onReady() {
        console.log('📱 页面渲染完成');
        
        // 再次检查方法
        this.checkMethodsAfterFix();
    },

    /**
     * 🔧 修复 globalClick 相关方法
     */
    fixGlobalClickMethods() {
        console.log('开始修复方法...');
        
        const self = this;
        
        // 修复 globalClick 方法
        if (typeof this.globalClick !== 'function') {
            this.globalClick = function(evt) {
                console.log('✅ 修复的 globalClick 方法被调用', evt);
                self.handleTrackingClick(evt);
            };
            console.log('✅ globalClick 方法修复完成');
        } else {
            console.log('ℹ️ globalClick 方法已存在，无需修复');
        }
        
        // 修复 autoTrack 方法
        if (typeof this.autoTrack !== 'function') {
            this.autoTrack = function(evt) {
                console.log('✅ 修复的 autoTrack 方法被调用', evt);
                self.handleTrackingClick(evt);
            };
            console.log('✅ autoTrack 方法修复完成');
        }
        
        // 修复 handleAnyClick 方法
        if (typeof this.handleAnyClick !== 'function') {
            this.handleAnyClick = function(evt) {
                console.log('✅ 修复的 handleAnyClick 方法被调用', evt);
                self.handleTrackingClick(evt);
            };
            console.log('✅ handleAnyClick 方法修复完成');
        }
    },

    /**
     * 🔍 检查方法修复结果
     */
    checkMethodsAfterFix() {
        console.log('=== 方法检查结果 ===');
        console.log('globalClick:', typeof this.globalClick, this.globalClick ? '✅' : '❌');
        console.log('autoTrack:', typeof this.autoTrack, this.autoTrack ? '✅' : '❌');
        console.log('handleAnyClick:', typeof this.handleAnyClick, this.handleAnyClick ? '✅' : '❌');
        
        const allMethodsExist = 
            typeof this.globalClick === 'function' &&
            typeof this.autoTrack === 'function' &&
            typeof this.handleAnyClick === 'function';
            
        if (allMethodsExist) {
            console.log('🎉 所有方法修复成功！');
        } else {
            console.error('❌ 仍有方法缺失');
        }
    },

    /**
     * 🎯 处理埋点点击事件
     */
    handleTrackingClick(evt) {
        console.log('🎯 处理埋点点击事件', evt);
        
        const target = evt.target || evt.currentTarget;
        const dataset = target.dataset || {};
        
        console.log('点击目标信息:', {
            target: target,
            dataset: dataset
        });
        
        // 检查是否需要埋点
        if (this.shouldTrack(dataset)) {
            console.log('✅ 检测到需要埋点的元素');
            this.processTracking(dataset);
        } else {
            console.log('ℹ️ 元素不需要埋点');
        }
    },

    /**
     * 🔍 判断是否需要埋点
     */
    shouldTrack(dataset) {
        if (!dataset) return false;
        
        // 检查埋点相关属性
        const hasTrackData = !!(dataset.text || dataset.src || dataset.track);
        
        if (hasTrackData) {
            console.log('发现埋点属性:', {
                text: dataset.text,
                src: dataset.src,
                track: dataset.track
            });
        }
        
        return hasTrackData;
    },

    /**
     * 📊 处理埋点数据
     */
    processTracking(dataset) {
        const trackingData = {
            elementText: dataset.text,
            imgSrc: dataset.src,
            trackType: dataset.track,
            pageUrl: this.route || '/pages/index/index',
            timestamp: new Date().getTime(),
            userAgent: 'miniprogram'
        };
        
        console.log('📊 埋点数据:', trackingData);
        
        // 显示埋点信息
        wx.showToast({
            title: `埋点: ${dataset.text || dataset.src || dataset.track}`,
            icon: 'success',
            duration: 1500
        });
        
        // 尝试调用全局埋点处理器
        this.callGlobalTracker(trackingData);
    },

    /**
     * 🌐 调用全局埋点处理器
     */
    callGlobalTracker(trackingData) {
        try {
            const app = getApp();
            
            if (app.globalData && app.globalData.monitoInit) {
                console.log('🌐 调用全局埋点处理器');
                
                // 构造标准事件对象
                const standardEvent = {
                    target: { dataset: trackingData },
                    currentTarget: { dataset: trackingData },
                    dataset: trackingData,
                    timeStamp: trackingData.timestamp
                };
                
                if (typeof app.globalData.monitoInit.handleGlobalClick === 'function') {
                    app.globalData.monitoInit.handleGlobalClick(standardEvent);
                } else {
                    console.warn('全局埋点处理器方法不存在');
                }
            } else {
                console.warn('全局埋点处理器未初始化');
                // 本地处理埋点数据
                this.localTrackingHandler(trackingData);
            }
        } catch (error) {
            console.error('调用全局埋点处理器失败:', error);
            this.localTrackingHandler(trackingData);
        }
    },

    /**
     * 💾 本地埋点处理器
     */
    localTrackingHandler(trackingData) {
        console.log('💾 使用本地埋点处理器');
        
        // 存储到本地
        try {
            const storageKey = 'local_tracking_data';
            let localData = wx.getStorageSync(storageKey) || [];
            
            localData.push(trackingData);
            
            // 限制本地存储数量
            if (localData.length > 100) {
                localData = localData.slice(-100);
            }
            
            wx.setStorageSync(storageKey, localData);
            console.log('✅ 埋点数据已存储到本地');
        } catch (error) {
            console.error('本地存储失败:', error);
        }
    },

    /**
     * 🧪 测试按钮点击
     */
    onTestButtonClick() {
        console.log('🧪 测试按钮被点击');
        
        wx.showModal({
            title: '测试结果',
            content: '普通按钮点击成功！这是一个不需要埋点的按钮。',
            showCancel: false
        });
    },

    /**
     * 📋 显示本地埋点数据
     */
    showLocalTrackingData() {
        try {
            const localData = wx.getStorageSync('local_tracking_data') || [];
            
            wx.showModal({
                title: '本地埋点数据',
                content: `共 ${localData.length} 条数据\n\n${JSON.stringify(localData.slice(-3), null, 2)}`,
                showCancel: false
            });
        } catch (error) {
            wx.showToast({
                title: '读取数据失败',
                icon: 'error'
            });
        }
    },

    /**
     * 🗑️ 清除本地数据
     */
    clearLocalData() {
        try {
            wx.removeStorageSync('local_tracking_data');
            wx.showToast({
                title: '数据已清除',
                icon: 'success'
            });
        } catch (error) {
            wx.showToast({
                title: '清除失败',
                icon: 'error'
            });
        }
    }
});

/*
使用说明：

1. 将此代码复制到您的 pages/index/index.js 文件中
2. 确保对应的 WXML 模板中有以下结构：

<view class="container" bindtap="globalClick">
    <view data-text="打开按钮" class="btn">打开</view>
    <view data-text="关闭按钮" class="btn">关闭</view>
    <image data-src="banner.jpg" src="/images/banner.jpg" />
</view>

3. 打开页面，查看控制台日志
4. 点击带有 data-text 属性的元素测试埋点功能

预期结果：
- 控制台显示 "所有方法修复成功！"
- 点击元素时显示埋点信息
- 不再出现 "globalClick" 方法不存在的错误

这个方案可以立即解决您的问题！
*/
