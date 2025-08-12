// 立即劫持 Page 构造函数 - 在模块加载时就执行
// 这个文件需要在任何页面创建之前被导入

console.log('🚀 立即劫持模块加载');

// 保存原始的 Page 构造函数
const originalPage = (globalThis as any).Page;

if (!originalPage) {
    console.error('❌ Page 构造函数不存在，可能不在小程序环境中');
} else {
    console.log('🔧 开始立即劫持 Page 构造函数');

    // 立即劫持 Page 构造函数
    (globalThis as any).Page = function(options: any) {
        console.log('📄 Page 构造函数被调用，立即注入 globalClick 方法');

        // 确保 options 存在
        if (!options) {
            options = {};
        }

        // 立即注入 globalClick 方法
        options.globalClick = function(evt: any) {
            console.log('📱 globalClick 被调用', evt);
            handleGlobalClickEvent(evt, this);
        };

        // 立即注入其他方法
        options.autoTrack = function(evt: any) {
            console.log('📱 autoTrack 被调用', evt);
            handleGlobalClickEvent(evt, this);
        };

        options.handleAnyClick = function(evt: any) {
            console.log('📱 handleAnyClick 被调用', evt);
            handleGlobalClickEvent(evt, this);
        };

        // 劫持 onLoad 来确认注入成功
        const originalOnLoad = options.onLoad;
        options.onLoad = function(query: any) {
            console.log('📄 页面 onLoad - 检查方法注入:');
            console.log('- globalClick:', typeof this.globalClick);
            console.log('- autoTrack:', typeof this.autoTrack);
            console.log('- handleAnyClick:', typeof this.handleAnyClick);

            // 如果方法不存在，紧急修复
            if (typeof this.globalClick !== 'function') {
                console.error('❌ globalClick 方法仍然不存在！执行紧急修复');
                this.globalClick = function(evt: any) {
                    console.log('🚨 紧急修复的 globalClick');
                    handleGlobalClickEvent(evt, this);
                };
            } else {
                console.log('✅ globalClick 方法注入成功');
            }

            // 调用原始 onLoad
            if (originalOnLoad && typeof originalOnLoad === 'function') {
                originalOnLoad.call(this, query);
            }
        };

        console.log('📄 方法注入完成，调用原始 Page');
        return originalPage.call(this, options);
    };

    console.log('✅ Page 构造函数劫持完成');
}

/**
 * 处理全局点击事件
 */
function handleGlobalClickEvent(evt: any, pageInstance: any) {
    console.log('🎯 处理全局点击事件', evt);
    
    const target = evt.target || evt.currentTarget;
    const dataset = target?.dataset || {};
    
    console.log('点击目标:', { target, dataset });
    
    // 检查是否需要埋点
    if (shouldTrackElement(dataset)) {
        console.log('✅ 检测到需要埋点的元素');
        processTrackingData(dataset, pageInstance);
    } else {
        console.log('⏭️ 元素不需要埋点，忽略');
    }
}

/**
 * 判断是否需要埋点
 */
function shouldTrackElement(dataset: any): boolean {
    if (!dataset) return false;
    
    // 检查是否有埋点相关属性
    return !!(dataset.text || dataset.src || dataset.track);
}

/**
 * 处理埋点数据
 */
function processTrackingData(dataset: any, pageInstance: any) {
    const trackingData = {
        elementText: dataset.text,
        imgSrc: dataset.src,
        trackType: dataset.track,
        pageUrl: pageInstance?.route || 'unknown',
        timestamp: new Date().getTime()
    };
    
    console.log('📊 埋点数据:', trackingData);
    
    // 尝试调用全局埋点处理器
    try {
        const app = getApp();
        
        if (app.globalData && app.globalData.monitoInit && app.globalData.monitoInit.handleGlobalClick) {
            console.log('🌐 调用全局埋点处理器');
            
            // 构造标准事件对象
            const standardEvent = {
                target: { dataset },
                currentTarget: { dataset },
                dataset: dataset,
                timeStamp: trackingData.timestamp
            };
            
            app.globalData.monitoInit.handleGlobalClick(standardEvent);
        } else {
            console.warn('⚠️ 全局埋点处理器未初始化，使用本地处理');
            localTrackingHandler(trackingData);
        }
    } catch (error) {
        console.error('❌ 调用全局埋点处理器失败:', error);
        localTrackingHandler(trackingData);
    }
}

/**
 * 本地埋点处理器
 */
function localTrackingHandler(trackingData: any) {
    console.log('💾 使用本地埋点处理器');
    
    // 显示埋点信息
    if (typeof wx !== 'undefined' && wx.showToast) {
        wx.showToast({
            title: `埋点: ${trackingData.elementText || trackingData.imgSrc || trackingData.trackType}`,
            icon: 'none',
            duration: 1500
        });
    }
    
    // 存储到本地
    try {
        if (typeof wx !== 'undefined' && wx.setStorageSync) {
            const storageKey = 'local_tracking_data';
            let localData = wx.getStorageSync(storageKey) || [];
            
            localData.push(trackingData);
            
            // 限制本地存储数量
            if (localData.length > 100) {
                localData = localData.slice(-100);
            }
            
            wx.setStorageSync(storageKey, localData);
            console.log('✅ 埋点数据已存储到本地');
        }
    } catch (error) {
        console.error('❌ 本地存储失败:', error);
    }
}

// 在全局对象上设置紧急修复方法
(globalThis as any).__emergencyGlobalClick = function(evt: any) {
    console.log('🚨 全局紧急修复方法被调用', evt);
    handleGlobalClickEvent(evt, null);
};

console.log('🚨 紧急修复方法已设置到全局对象');

// 导出处理函数，供其他模块使用
export {
    handleGlobalClickEvent,
    shouldTrackElement,
    processTrackingData,
    localTrackingHandler
};

console.log('✅ 立即劫持模块加载完成');

/*
使用说明：

1. 这个文件必须在任何页面创建之前被导入
2. 建议在 app.js 的最开头导入：

// app.js
import './utils/monito/auto-binding/immediate-page-hijack'; // 立即劫持

import MonitoInit from './utils/monito/index';

App({
    async onLaunch() {
        // 其他初始化逻辑
        await monitoInit.eventInit(config);
    }
});

3. 这样可以确保在页面创建时 globalClick 方法已经存在
4. 即使埋点组件还没有完全初始化，基本的点击处理也能正常工作
*/
