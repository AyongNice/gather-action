// 小程序全局事件系统
import { ViewIfo, ImgIfo } from '../data-type';

export class MiniProgramEventSystem {
    private viewMap: { [key: string]: ViewIfo } = {};
    private imgMap: { [key: string]: ImgIfo } = {};
    private handleGlobalClick: (evt: any) => Promise<void>;
    private originalPageConstructor: any;

    constructor(
        viewMap: { [key: string]: ViewIfo },
        imgMap: { [key: string]: ImgIfo },
        handleGlobalClick: (evt: any) => Promise<void>
    ) {
        this.viewMap = viewMap;
        this.imgMap = imgMap;
        this.handleGlobalClick = handleGlobalClick;
        this.originalPageConstructor = (globalThis as any).Page;
    }

    /**
     * 初始化全局事件系统
     */
    init() {
        this.hijackPageConstructor();
        this.setupGlobalEventCapture();
        console.log('小程序全局事件系统已启动');
    }

    /**
     * 劫持 Page 构造函数
     */
    private hijackPageConstructor() {
        if (!this.originalPageConstructor) {
            console.error('原始 Page 构造函数不存在');
            return;
        }

        const self = this;
        console.log('开始劫持 Page 构造函数');

        (globalThis as any).Page = function(options: any) {
            console.log('Page 构造函数被调用，注入全局事件处理', options);

            // 确保 options 是对象
            if (!options || typeof options !== 'object') {
                options = {};
            }

            // 注入全局点击捕获方法
            options.globalClick = async function(evt: any) {
                console.log('globalClick 方法被调用', evt);
                try {
                    await self.processGlobalClick(evt, this);
                } catch (error) {
                    console.error('globalClick 处理失败:', error);
                }
            };

            // 注入其他便捷方法
            options.autoTrack = async function(evt: any) {
                console.log('autoTrack 方法被调用', evt);
                try {
                    await self.processGlobalClick(evt, this);
                } catch (error) {
                    console.error('autoTrack 处理失败:', error);
                }
            };

            options.handleAnyClick = async function(evt: any) {
                console.log('handleAnyClick 方法被调用', evt);
                try {
                    await self.processGlobalClick(evt, this);
                } catch (error) {
                    console.error('handleAnyClick 处理失败:', error);
                }
            };

            // 劫持生命周期
            self.hijackLifecycle(options);

            console.log('方法注入完成，调用原始 Page 构造函数');

            // 调用原始 Page 构造函数
            return self.originalPageConstructor.call(this, options);
        };

        console.log('Page 构造函数劫持完成');
    }

    /**
     * 劫持点击事件方法
     */
    private hijackClickMethods(options: any, originalMethods: any) {
        const self = this;

        // 获取所有方法名
        const methodNames = Object.keys(originalMethods).filter(key => 
            typeof originalMethods[key] === 'function'
        );

        methodNames.forEach(methodName => {
            const originalMethod = originalMethods[methodName];
            
            // 包装原始方法
            options[methodName] = async function(evt: any) {
                console.log(`方法 ${methodName} 被调用`, evt);
                
                // 先执行全局点击处理
                await self.processGlobalClick(evt, this);
                
                // 再执行原始方法
                if (originalMethod) {
                    return originalMethod.call(this, evt);
                }
            };
        });
    }

    /**
     * 注入便捷方法
     */
    private injectConvenienceMethods(options: any) {
        const self = this;

        // 注入全局点击处理方法
        options.globalClick = async (evt: any) => {
            console.log('globalClick 方法调用', evt);
            await self.processGlobalClick(evt, options);
        };

        // 注入自动埋点方法
        options.autoTrack = async (evt: any) => {
            console.log('autoTrack 方法调用', evt);
            await self.processGlobalClick(evt, options);
        };

        // 注入通用点击方法
        options.handleAnyClick = async (evt: any) => {
            console.log('handleAnyClick 方法调用', evt);
            await self.processGlobalClick(evt, options);
        };
    }

    /**
     * 劫持生命周期
     */
    private hijackLifecycle(options: any) {
        const originalOnLoad = options.onLoad;
        const originalOnReady = options.onReady;

        options.onLoad = function(query: any) {
            console.log('页面加载，全局事件捕获准备就绪');

            // 确保方法存在
            if (typeof this.globalClick !== 'function') {
                console.warn('globalClick 方法不存在，可能注入失败');
            } else {
                console.log('globalClick 方法注入成功');
            }

            // 调用原始 onLoad
            if (originalOnLoad && typeof originalOnLoad === 'function') {
                originalOnLoad.call(this, query);
            }
        };

        options.onReady = function() {
            console.log('页面渲染完成，检查全局事件方法');

            // 检查方法是否正确注入
            console.log('方法检查结果:');
            console.log('- globalClick:', typeof this.globalClick);
            console.log('- autoTrack:', typeof this.autoTrack);
            console.log('- handleAnyClick:', typeof this.handleAnyClick);

            // 调用原始 onReady
            if (originalOnReady && typeof originalOnReady === 'function') {
                originalOnReady.call(this);
            }

            // 输出使用说明
            console.log(`
=== 全局事件捕获使用说明 ===

✅ 在模板中使用：
<view class="page" bindtap="globalClick">
    <view data-text="按钮1">按钮1</view>
    <view data-text="按钮2">按钮2</view>
</view>

🔧 确保：
1. 元素有 data-text、data-src 或 data-track 属性
2. 属性值在配置列表中
3. 在根容器上绑定 bindtap="globalClick"
            `);
        };
    }

    /**
     * 设置全局事件捕获
     */
    private setupGlobalEventCapture() {
        // 在小程序环境中，我们通过劫持方法调用来实现全局捕获
        // 这比直接监听 DOM 事件更可靠
        console.log('设置全局事件捕获机制');
    }

    /**
     * 处理全局点击事件
     */
    private async processGlobalClick(evt: any, pageInstance: any) {
        try {
            const target = evt.target || evt.currentTarget;
            
            if (!target || !target.dataset) {
                return;
            }

            const dataset = target.dataset;
            console.log('处理全局点击', { dataset, target });

            // 检查是否需要埋点
            if (this.shouldTrackElement(dataset)) {
                console.log('检测到需要埋点的元素');
                
                // 构造标准事件对象
                const standardEvent = {
                    ...evt,
                    target,
                    currentTarget: target,
                    dataset
                };

                // 调用埋点处理
                await this.handleGlobalClick(standardEvent);
            }
        } catch (error) {
            console.error('处理全局点击失败:', error);
        }
    }

    /**
     * 判断是否需要埋点
     */
    private shouldTrackElement(dataset: any): boolean {
        if (!dataset) return false;

        // 检查文本埋点
        if (dataset.text && this.viewMap[dataset.text]) {
            console.log('匹配文本埋点:', dataset.text);
            return true;
        }

        // 检查图片埋点
        if (dataset.src && this.imgMap[dataset.src]) {
            console.log('匹配图片埋点:', dataset.src);
            return true;
        }

        // 检查自定义埋点
        if (dataset.track) {
            console.log('匹配自定义埋点:', dataset.track);
            return true;
        }

        return false;
    }

    /**
     * 生成模板代码示例
     */
    generateTemplateExample(): string {
        return `
<!-- 方案1: 根容器全局捕获（推荐） -->
<view class="page-container" bindtap="globalClick">
    <!-- 页面内容，所有点击都会被捕获 -->
    <view class="header">
        <text>页面标题</text>
    </view>
    
    <view class="content">
        <!-- 需要埋点的元素只需要 data 属性 -->
        <view data-text="打开按钮" class="btn">打开</view>
        <view data-text="关闭按钮" class="btn">关闭</view>
        <image data-src="banner.jpg" src="/images/banner.jpg" />
        
        <!-- 列表项 -->
        <view wx:for="{{list}}" wx:key="id" data-text="列表项{{item.id}}">
            {{item.name}}
        </view>
    </view>
</view>

<!-- 方案2: 单独绑定 -->
<view data-text="独立按钮" bindtap="autoTrack" class="btn">
    独立按钮
</view>

<!-- 方案3: 通用方法 -->
<view data-text="通用点击" bindtap="handleAnyClick" class="btn">
    通用点击
</view>
        `.trim();
    }

    /**
     * 生成页面 JS 示例
     */
    generatePageJSExample(): string {
        return `
Page({
    data: {
        list: [
            { id: 1, name: '项目1' },
            { id: 2, name: '项目2' }
        ]
    },

    onLoad() {
        // 只需要写业务逻辑
        console.log('页面加载');
    },

    onReady() {
        // 全局事件捕获已自动就绪
        console.log('全局事件捕获已就绪');
    }

    // 注意：
    // 1. globalClick、autoTrack、handleAnyClick 方法已自动注入
    // 2. 所有原有的方法都会被包装，自动处理埋点
    // 3. 无需手写任何埋点代码
    // 4. 在根容器上绑定 bindtap="globalClick" 即可捕获所有点击
});
        `.trim();
    }
}
