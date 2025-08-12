// 小程序根节点点击事件处理器
import { ViewIfo, ImgIfo } from '../data-type';

export class RootClickHandler {
    private viewMap: { [key: string]: ViewIfo } = {};
    private imgMap: { [key: string]: ImgIfo } = {};
    private regex: RegExp;
    private handleGlobalClick: (evt: any) => Promise<void>;

    constructor(
        viewMap: { [key: string]: ViewIfo },
        imgMap: { [key: string]: ImgIfo },
        regex: RegExp,
        handleGlobalClick: (evt: any) => Promise<void>
    ) {
        this.viewMap = viewMap;
        this.imgMap = imgMap;
        this.regex = regex;
        this.handleGlobalClick = handleGlobalClick;
    }

    /**
     * 为小程序页面注入根节点点击处理
     */
    injectRootClickHandler(pageInstance: any) {
        console.log('注入根节点点击处理器');

        // 方案1: 注入全局点击捕获方法
        pageInstance.__rootClickHandler = (evt: any) => {
            console.log('根节点点击事件触发', evt);
            this.processRootClick(evt);
        };

        // 方案2: 注入便捷的埋点方法
        pageInstance.handleAnyClick = (evt: any) => {
            console.log('通用点击处理', evt);
            this.processRootClick(evt);
        };

        // 方案3: 注入自动埋点方法
        pageInstance.autoTrack = (evt: any) => {
            console.log('自动埋点触发', evt);
            this.processRootClick(evt);
        };

        console.log('根节点点击处理器注入完成');
        
        // 输出使用说明
        this.logUsageInstructions();
    }

    /**
     * 处理根节点点击事件
     */
    private async processRootClick(evt: any) {
        try {
            // 获取点击的目标元素
            const target = evt.target || evt.currentTarget;
            const detail = evt.detail || {};
            
            console.log('处理点击事件:', {
                target: target,
                detail: detail,
                dataset: target?.dataset
            });

            // 检查是否是需要埋点的元素
            if (this.shouldTrackElement(target)) {
                console.log('检测到需要埋点的元素，开始处理');
                
                // 构造标准的事件对象
                const standardEvent = this.buildStandardEvent(evt, target);
                
                // 调用埋点处理
                await this.handleGlobalClick(standardEvent);
            } else {
                console.log('元素不需要埋点，忽略');
            }
        } catch (error) {
            console.error('处理根节点点击事件失败:', error);
        }
    }

    /**
     * 判断元素是否需要埋点
     */
    private shouldTrackElement(target: any): boolean {
        if (!target || !target.dataset) {
            return false;
        }

        const dataset = target.dataset;
        
        // 检查是否有埋点相关的 data 属性
        const hasTrackData = dataset.text || dataset.src || dataset.track;
        
        if (!hasTrackData) {
            return false;
        }

        // 检查是否在配置列表中
        if (dataset.text && this.viewMap[dataset.text]) {
            console.log('匹配到文本埋点配置:', dataset.text);
            return true;
        }

        if (dataset.src && this.imgMap[dataset.src]) {
            console.log('匹配到图片埋点配置:', dataset.src);
            return true;
        }

        if (dataset.track) {
            console.log('匹配到自定义埋点配置:', dataset.track);
            return true;
        }

        return false;
    }

    /**
     * 构造标准的事件对象
     */
    private buildStandardEvent(originalEvent: any, target: any): any {
        return {
            type: 'tap',
            timeStamp: originalEvent.timeStamp || Date.now(),
            target: target,
            currentTarget: target,
            detail: originalEvent.detail || {},
            dataset: target.dataset || {},
            // 保留原始事件的其他属性
            ...originalEvent
        };
    }

    /**
     * 输出使用说明
     */
    private logUsageInstructions() {
        const instructions = `
=== 小程序根节点点击处理使用说明 ===

方案1: 在根容器上绑定全局点击事件
<view class="page-container" bindtap="__rootClickHandler">
    <!-- 所有页面内容 -->
    <view data-text="按钮1">按钮1</view>
    <view data-text="按钮2">按钮2</view>
    <image data-src="banner.jpg" />
</view>

方案2: 使用便捷的通用点击方法
<view data-text="任意元素" bindtap="handleAnyClick">
    任意需要埋点的元素
</view>

方案3: 使用自动埋点方法
<view data-text="自动埋点" bindtap="autoTrack">
    自动埋点元素
</view>

注意事项:
1. 确保元素有 data-text、data-src 或 data-track 属性
2. 属性值要与配置列表匹配
3. 根节点绑定会捕获所有子元素的点击事件
4. 系统会自动过滤不需要埋点的元素

推荐使用方案1，在页面根容器上绑定一次即可！
        `;
        
        console.log(instructions);
    }

    /**
     * 生成模板代码
     */
    generateTemplateCode(): string {
        return `
<!-- 推荐方案：在页面根容器上绑定全局点击事件 -->
<view class="page-container" bindtap="__rootClickHandler">
    <!-- 页面内容 -->
    <view class="header">
        <text>页面标题</text>
    </view>
    
    <!-- 需要埋点的元素只需要添加 data 属性 -->
    <view class="content">
        <view data-text="打开按钮" class="btn">打开</view>
        <view data-text="关闭按钮" class="btn">关闭</view>
        <image data-src="banner.jpg" src="/images/banner.jpg" />
        
        <!-- 列表项 -->
        <view wx:for="{{list}}" wx:key="id" data-text="列表项{{item.id}}" class="list-item">
            {{item.name}}
        </view>
        
        <!-- 自定义埋点 -->
        <view data-track="special-action" class="special">特殊操作</view>
    </view>
</view>

<!-- 样式 -->
<style>
.page-container {
    min-height: 100vh;
    padding: 20rpx;
}

.btn {
    padding: 20rpx;
    margin: 10rpx 0;
    background-color: #007aff;
    color: white;
    text-align: center;
    border-radius: 8rpx;
}

.list-item {
    padding: 15rpx;
    margin: 5rpx 0;
    background-color: #f8f8f8;
    border-left: 4rpx solid #007aff;
}

.special {
    padding: 20rpx;
    background-color: #ff3b30;
    color: white;
    text-align: center;
    border-radius: 8rpx;
}
</style>
        `.trim();
    }

    /**
     * 生成页面 JS 代码
     */
    generatePageJSCode(): string {
        return `
// 页面 JS 代码 - 无需手写埋点逻辑
Page({
    data: {
        list: [
            { id: 1, name: '项目1' },
            { id: 2, name: '项目2' },
            { id: 3, name: '项目3' }
        ]
    },

    onLoad() {
        console.log('页面加载');
        // 只需要写业务逻辑
    },

    onReady() {
        console.log('页面渲染完成');
        // __rootClickHandler 方法已被自动注入
        console.log('根节点点击处理器:', typeof this.__rootClickHandler);
    }

    // 注意：
    // 1. __rootClickHandler 方法会被自动注入
    // 2. handleAnyClick 和 autoTrack 方法也会被自动注入
    // 3. 无需手写任何埋点相关代码
    // 4. 在根容器上绑定 bindtap="__rootClickHandler" 即可捕获所有点击
});
        `.trim();
    }
}
