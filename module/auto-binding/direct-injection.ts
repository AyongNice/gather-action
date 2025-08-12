// 直接注入方案 - 确保 globalClick 方法能够正确注入
import { ViewIfo, ImgIfo } from '../data-type';

export class DirectMethodInjection {
    private viewMap: { [key: string]: ViewIfo } = {};
    private imgMap: { [key: string]: ImgIfo } = {};
    private handleGlobalClick: (evt: any) => Promise<void>;
    private isInjected = false;

    constructor(
        viewMap: { [key: string]: ViewIfo },
        imgMap: { [key: string]: ImgIfo },
        handleGlobalClick: (evt: any) => Promise<void>
    ) {
        this.viewMap = viewMap;
        this.imgMap = imgMap;
        this.handleGlobalClick = handleGlobalClick;
    }

    /**
     * 立即执行注入
     */
    inject() {
        if (this.isInjected) {
            console.log('方法已经注入过，跳过');
            return;
        }

        console.log('开始直接注入 globalClick 方法');
        
        // 方案1: 劫持 Page 构造函数
        this.hijackPageConstructor();
        
        // 方案2: 劫持 getCurrentPages 来处理已存在的页面
        this.hijackExistingPages();
        
        // 方案3: 设置全局方法
        this.setupGlobalMethods();
        
        this.isInjected = true;
        console.log('✅ 直接注入完成');
    }

    /**
     * 劫持 Page 构造函数
     */
    private hijackPageConstructor() {
        const originalPage = (globalThis as any).Page;
        
        if (!originalPage) {
            console.error('Page 构造函数不存在');
            return;
        }

        const self = this;
        console.log('劫持 Page 构造函数...');

        (globalThis as any).Page = function(options: any) {
            console.log('🔧 Page 构造函数被调用，注入方法', options);

            // 确保 options 存在
            if (!options) {
                options = {};
            }

            // 直接注入 globalClick 方法
            options.globalClick = function(evt: any) {
                console.log('📱 globalClick 被调用', evt);
                return self.processClick(evt, this);
            };

            // 注入其他方法
            options.autoTrack = function(evt: any) {
                console.log('📱 autoTrack 被调用', evt);
                return self.processClick(evt, this);
            };

            options.handleAnyClick = function(evt: any) {
                console.log('📱 handleAnyClick 被调用', evt);
                return self.processClick(evt, this);
            };

            // 劫持 onLoad 来确认注入成功
            const originalOnLoad = options.onLoad;
            options.onLoad = function(query: any) {
                console.log('📄 页面 onLoad，检查方法注入');
                console.log('- globalClick:', typeof this.globalClick);
                console.log('- autoTrack:', typeof this.autoTrack);
                console.log('- handleAnyClick:', typeof this.handleAnyClick);

                if (typeof this.globalClick !== 'function') {
                    console.error('❌ globalClick 方法注入失败！');
                    // 紧急修复
                    this.globalClick = function(evt: any) {
                        console.log('🚨 紧急修复的 globalClick');
                        return self.processClick(evt, this);
                    };
                } else {
                    console.log('✅ globalClick 方法注入成功');
                }

                // 调用原始 onLoad
                if (originalOnLoad && typeof originalOnLoad === 'function') {
                    originalOnLoad.call(this, query);
                }
            };

            console.log('🔧 方法注入完成，调用原始 Page');
            return originalPage.call(this, options);
        };

        console.log('✅ Page 构造函数劫持完成');
    }

    /**
     * 处理已存在的页面
     */
    private hijackExistingPages() {
        console.log('检查已存在的页面...');
        
        try {
            const getCurrentPages = (globalThis as any).getCurrentPages;
            if (typeof getCurrentPages === 'function') {
                const pages = getCurrentPages();
                console.log(`发现 ${pages.length} 个已存在的页面`);
                
                pages.forEach((page: any, index: number) => {
                    console.log(`为页面 ${index} 注入方法`);
                    this.injectToExistingPage(page);
                });
            }
        } catch (error) {
            console.error('处理已存在页面失败:', error);
        }
    }

    /**
     * 为已存在的页面注入方法
     */
    private injectToExistingPage(page: any) {
        if (!page) return;

        const self = this;

        // 检查是否已经有方法
        if (typeof page.globalClick === 'function') {
            console.log('页面已有 globalClick 方法，跳过注入');
            return;
        }

        // 注入方法
        page.globalClick = function(evt: any) {
            console.log('📱 已存在页面的 globalClick 被调用', evt);
            return self.processClick(evt, this);
        };

        page.autoTrack = function(evt: any) {
            console.log('📱 已存在页面的 autoTrack 被调用', evt);
            return self.processClick(evt, this);
        };

        page.handleAnyClick = function(evt: any) {
            console.log('📱 已存在页面的 handleAnyClick 被调用', evt);
            return self.processClick(evt, this);
        };

        console.log('✅ 已存在页面方法注入完成');
    }

    /**
     * 设置全局方法
     */
    private setupGlobalMethods() {
        console.log('设置全局方法...');
        
        // 在全局对象上设置方法，作为最后的备用方案
        (globalThis as any).__monitoGlobalClick = (evt: any) => {
            console.log('🌐 全局 globalClick 被调用', evt);
            return this.processClick(evt, null);
        };

        console.log('✅ 全局方法设置完成');
    }

    /**
     * 处理点击事件
     */
    private async processClick(evt: any, pageInstance: any) {
        try {
            console.log('🎯 处理点击事件', evt);
            
            const target = evt.target || evt.currentTarget;
            const dataset = target?.dataset || {};

            console.log('点击目标:', { target, dataset });

            // 检查是否需要埋点
            if (this.shouldTrack(dataset)) {
                console.log('✅ 需要埋点，调用处理器');
                await this.handleGlobalClick(evt);
            } else {
                console.log('⏭️ 不需要埋点，忽略');
            }
        } catch (error) {
            console.error('❌ 处理点击事件失败:', error);
        }
    }

    /**
     * 判断是否需要埋点
     */
    private shouldTrack(dataset: any): boolean {
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
     * 创建紧急修复方法
     */
    static createEmergencyFix(
        viewMap: { [key: string]: ViewIfo },
        imgMap: { [key: string]: ImgIfo },
        handleGlobalClick: (evt: any) => Promise<void>
    ) {
        console.log('🚨 创建紧急修复方法');
        
        const emergencyHandler = async (evt: any) => {
            console.log('🚨 紧急修复方法被调用', evt);
            
            const target = evt.target || evt.currentTarget;
            const dataset = target?.dataset || {};

            if (dataset.text && viewMap[dataset.text]) {
                await handleGlobalClick(evt);
            } else if (dataset.src && imgMap[dataset.src]) {
                await handleGlobalClick(evt);
            } else if (dataset.track) {
                await handleGlobalClick(evt);
            }
        };

        // 设置到全局
        (globalThis as any).__emergencyGlobalClick = emergencyHandler;
        
        return emergencyHandler;
    }

    /**
     * 获取使用说明
     */
    getUsageInstructions(): string {
        return `
=== 直接注入使用说明 ===

✅ 推荐用法（根容器绑定）：
<view class="page" bindtap="globalClick">
    <view data-text="按钮1">按钮1</view>
    <view data-text="按钮2">按钮2</view>
</view>

🔧 备用方法：
- globalClick: 全局点击处理
- autoTrack: 自动埋点
- handleAnyClick: 通用点击处理

🚨 如果还是报错，请在页面 JS 中添加：
Page({
    onLoad() {
        if (typeof this.globalClick !== 'function') {
            this.globalClick = globalThis.__emergencyGlobalClick || function(evt) {
                console.log('紧急备用方法', evt);
            };
        }
    }
});

📱 检查方法是否存在：
console.log('globalClick:', typeof this.globalClick);
        `.trim();
    }
}
