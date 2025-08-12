// 立即修复 globalClick 方法不存在的问题
// 将此代码添加到您的页面 JS 文件中

/**
 * 立即修复方案 - 在页面中直接添加
 */
function immediateFixGlobalClick() {
    console.log('🚨 执行立即修复方案');
    
    // 检查当前页面实例
    const pages = getCurrentPages();
    if (pages.length === 0) {
        console.error('没有找到当前页面');
        return;
    }
    
    const currentPage = pages[pages.length - 1];
    console.log('当前页面:', currentPage);
    
    // 为当前页面注入方法
    injectMethodsToPage(currentPage);
}

/**
 * 为页面注入方法
 */
function injectMethodsToPage(page) {
    console.log('为页面注入方法...');
    
    // 注入 globalClick 方法
    if (typeof page.globalClick !== 'function') {
        page.globalClick = function(evt) {
            console.log('🔧 修复的 globalClick 方法触发', evt);
            handleClickEvent(evt, this);
        };
        console.log('✅ globalClick 方法注入成功');
    }
    
    // 注入 autoTrack 方法
    if (typeof page.autoTrack !== 'function') {
        page.autoTrack = function(evt) {
            console.log('🔧 修复的 autoTrack 方法触发', evt);
            handleClickEvent(evt, this);
        };
        console.log('✅ autoTrack 方法注入成功');
    }
    
    // 注入 handleAnyClick 方法
    if (typeof page.handleAnyClick !== 'function') {
        page.handleAnyClick = function(evt) {
            console.log('🔧 修复的 handleAnyClick 方法触发', evt);
            handleClickEvent(evt, this);
        };
        console.log('✅ handleAnyClick 方法注入成功');
    }
}

/**
 * 处理点击事件
 */
function handleClickEvent(evt, pageInstance) {
    console.log('处理点击事件:', evt);
    
    const target = evt.target || evt.currentTarget;
    const dataset = target.dataset || {};
    
    console.log('点击目标:', { target, dataset });
    
    // 检查是否需要埋点
    if (shouldTrackElement(dataset)) {
        console.log('✅ 需要埋点，处理数据');
        processTrackingData(dataset, pageInstance);
    } else {
        console.log('⏭️ 不需要埋点，忽略');
    }
}

/**
 * 判断是否需要埋点
 */
function shouldTrackElement(dataset) {
    if (!dataset) return false;
    
    // 检查是否有埋点相关属性
    return !!(dataset.text || dataset.src || dataset.track);
}

/**
 * 处理埋点数据
 */
function processTrackingData(dataset, pageInstance) {
    const trackData = {
        elementText: dataset.text,
        imgSrc: dataset.src,
        trackType: dataset.track,
        pageUrl: pageInstance.route || 'unknown',
        timestamp: new Date().getTime()
    };
    
    console.log('埋点数据:', trackData);
    
    // 尝试调用全局埋点处理器
    const app = getApp();
    if (app.globalData && app.globalData.monitoInit && app.globalData.monitoInit.handleGlobalClick) {
        console.log('调用全局埋点处理器');
        app.globalData.monitoInit.handleGlobalClick({
            target: { dataset },
            currentTarget: { dataset },
            dataset: dataset
        });
    } else {
        console.log('全局埋点处理器不存在，使用本地处理');
        // 这里可以添加本地的埋点处理逻辑
        // 例如：存储到本地，稍后上传
    }
}

/**
 * 页面使用示例
 */
const pageFixExample = {
    data: {
        // 页面数据
    },

    onLoad() {
        console.log('页面加载，执行修复');
        
        // 立即修复方法
        this.fixGlobalClickMethods();
    },

    onReady() {
        console.log('页面渲染完成，检查方法');
        
        // 检查方法是否存在
        console.log('方法检查结果:');
        console.log('- globalClick:', typeof this.globalClick);
        console.log('- autoTrack:', typeof this.autoTrack);
        console.log('- handleAnyClick:', typeof this.handleAnyClick);
    },

    /**
     * 修复 globalClick 方法
     */
    fixGlobalClickMethods() {
        const self = this;
        
        // 修复 globalClick
        if (typeof this.globalClick !== 'function') {
            this.globalClick = function(evt) {
                console.log('🔧 页面级修复的 globalClick', evt);
                self.handleGlobalClickEvent(evt);
            };
        }
        
        // 修复 autoTrack
        if (typeof this.autoTrack !== 'function') {
            this.autoTrack = function(evt) {
                console.log('🔧 页面级修复的 autoTrack', evt);
                self.handleGlobalClickEvent(evt);
            };
        }
        
        // 修复 handleAnyClick
        if (typeof this.handleAnyClick !== 'function') {
            this.handleAnyClick = function(evt) {
                console.log('🔧 页面级修复的 handleAnyClick', evt);
                self.handleGlobalClickEvent(evt);
            };
        }
        
        console.log('✅ 页面级方法修复完成');
    },

    /**
     * 处理全局点击事件
     */
    handleGlobalClickEvent(evt) {
        handleClickEvent(evt, this);
    }
};

// 导出修复函数
module.exports = {
    immediateFixGlobalClick,
    injectMethodsToPage,
    handleClickEvent,
    shouldTrackElement,
    processTrackingData,
    pageFixExample
};

/*
使用方法：

1. 将此文件复制到您的项目中
2. 在需要修复的页面 JS 文件中引入：
   const { pageFixExample } = require('../../utils/immediate-fix');

3. 或者直接在页面中添加修复代码：
   Page({
       onLoad() {
           this.fixGlobalClickMethods();
       },
       
       fixGlobalClickMethods() {
           if (typeof this.globalClick !== 'function') {
               this.globalClick = function(evt) {
                   console.log('修复的 globalClick', evt);
                   // 处理点击逻辑
               };
           }
       }
   });

4. 在模板中正常使用：
   <view bindtap="globalClick" data-text="按钮">按钮</view>

这样就可以立即解决 "globalClick" 方法不存在的问题！
*/
