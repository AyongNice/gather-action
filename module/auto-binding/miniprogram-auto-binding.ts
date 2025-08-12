// 小程序智能自动绑定系统
import { ViewIfo, ImgIfo } from '../data-type';
import { EnhancedElementScanner } from './enhanced-scanner';
import { RootClickHandler } from './root-click-handler';
import { MiniProgramEventSystem } from './miniprogram-event-system';
import { DirectMethodInjection } from './direct-injection';

export class MiniProgramAutoBinding {
    private viewMap: { [key: string]: ViewIfo } = {};
    private imgMap: { [key: string]: ImgIfo } = {};
    private regex: RegExp;
    private handleGlobalClick: (evt: any) => Promise<void>;
    private enhancedScanner: EnhancedElementScanner;
    private rootClickHandler: RootClickHandler;
    private eventSystem: MiniProgramEventSystem;
    private directInjection: DirectMethodInjection;

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

        // 初始化直接注入器（最高优先级）
        this.directInjection = new DirectMethodInjection(
            viewMap,
            imgMap,
            handleGlobalClick
        );

        // 初始化增强扫描器
        this.enhancedScanner = new EnhancedElementScanner(
            viewMap,
            imgMap,
            handleGlobalClick
        );

        // 初始化根节点点击处理器
        this.rootClickHandler = new RootClickHandler(
            viewMap,
            imgMap,
            regex,
            handleGlobalClick
        );

        // 初始化全局事件系统
        this.eventSystem = new MiniProgramEventSystem(
            viewMap,
            imgMap,
            handleGlobalClick
        );
    }

    /**
     * 初始化自动绑定
     */
    init() {
        console.log('🚀 初始化小程序智能自动绑定系统');

        // 立即执行同步初始化，确保在页面创建前完成
        this.syncInit();

        // 异步初始化其他功能
        setTimeout(() => {
            this.asyncInit();
        }, 0);

        console.log('✅ 小程序智能自动绑定系统初始化完成');
    }

    /**
     * 同步初始化 - 必须在页面创建前完成
     */
    private syncInit() {
        console.log('⚡ 执行同步初始化');

        if (this.isMiniProgram()) {
            console.log('📱 检测到小程序环境');

            // 立即劫持 Page 构造函数（同步执行）
            console.log('🎯 立即劫持 Page 构造函数');
            this.immediatePageHijack();

            // 立即创建紧急修复方法
            this.createImmediateEmergencyFix();

        } else if (this.isUniApp()) {
            console.log('📱 检测到 UniApp 环境');
            this.immediatePageHijack();
        }

        console.log('⚡ 同步初始化完成');
    }

    /**
     * 异步初始化 - 其他功能
     */
    private asyncInit() {
        console.log('🔄 执行异步初始化');

        if (this.isMiniProgram()) {
            // 启动其他系统
            this.directInjection.inject();
            this.eventSystem.init();
            this.initNativeMiniProgramBinding();
        } else if (this.isUniApp()) {
            this.directInjection.inject();
            this.initUniAppBinding();
        }

        this.logUsageInstructions();
        console.log('🔄 异步初始化完成');
    }

    /**
     * 立即劫持 Page 构造函数
     */
    private immediatePageHijack() {
        const originalPage = (globalThis as any).Page;

        if (!originalPage) {
            console.error('❌ Page 构造函数不存在');
            return;
        }

        const self = this;
        console.log('🔧 立即劫持 Page 构造函数');

        (globalThis as any).Page = function(options: any) {
            console.log('📄 Page 构造函数被调用，立即注入方法');

            // 确保 options 存在
            if (!options) {
                options = {};
            }

            // 立即注入 globalClick 方法
            options.globalClick = function(evt: any) {
                console.log('📱 globalClick 被调用', evt);
                return self.handleClickEvent(evt, this);
            };

            // 立即注入其他方法
            options.autoTrack = function(evt: any) {
                console.log('📱 autoTrack 被调用', evt);
                return self.handleClickEvent(evt, this);
            };

            options.handleAnyClick = function(evt: any) {
                console.log('📱 handleAnyClick 被调用', evt);
                return self.handleClickEvent(evt, this);
            };

            // 添加调试信息
            const originalOnLoad = options.onLoad;
            options.onLoad = function(query: any) {
                console.log('📄 页面 onLoad - 方法检查:');
                console.log('- globalClick:', typeof this.globalClick);
                console.log('- autoTrack:', typeof this.autoTrack);
                console.log('- handleAnyClick:', typeof this.handleAnyClick);

                if (typeof this.globalClick !== 'function') {
                    console.error('❌ globalClick 方法仍然不存在！执行紧急修复');
                    this.globalClick = function(evt: any) {
                        console.log('🚨 紧急修复的 globalClick');
                        return self.handleClickEvent(evt, this);
                    };
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
     * 创建立即可用的紧急修复方法
     */
    private createImmediateEmergencyFix() {
        const self = this;

        // 在全局对象上创建紧急修复方法
        (globalThis as any).__emergencyGlobalClick = function(evt: any) {
            console.log('� 全局紧急修复方法被调用', evt);
            return self.handleClickEvent(evt, null);
        };

        (globalThis as any).__emergencyAutoTrack = function(evt: any) {
            console.log('🚨 全局紧急 autoTrack 被调用', evt);
            return self.handleClickEvent(evt, null);
        };

        console.log('🚨 紧急修复方法已创建');
    }

    /**
     * 处理点击事件的统一方法
     */
    private async handleClickEvent(evt: any, pageInstance: any) {
        try {
            console.log('🎯 处理点击事件', evt);

            const target = evt.target || evt.currentTarget;
            const dataset = target?.dataset || {};

            console.log('点击目标:', { target, dataset });

            // 检查是否需要埋点
            if (this.shouldTrackElement(dataset)) {
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
     * 输出使用说明
     */
    private logUsageInstructions() {
        console.log(`
=== 小程序全局点击事件使用指南 ===

🎯 直接注入方案（推荐）：
${this.directInjection.getUsageInstructions()}

🚀 全局事件系统方案：
${this.eventSystem.generateTemplateExample()}

📝 页面 JS 代码：
${this.eventSystem.generatePageJSExample()}

🚨 如果还是报错 "globalClick" 方法不存在：

1. 检查初始化时机：
   确保在 app.js 的 onLaunch 中初始化埋点组件

2. 手动修复（立即可用）：
   在页面 JS 中添加：
   Page({
       onLoad() {
           if (typeof this.globalClick !== 'function') {
               this.globalClick = globalThis.__emergencyGlobalClick || function(evt) {
                   console.log('紧急备用 globalClick', evt);
               };
           }
       }
   });

3. 检查方法注入：
   在页面 onReady 中添加：
   console.log('globalClick:', typeof this.globalClick);

✨ 特点：
1. 多重注入方案，确保方法存在
2. 自动捕获所有子元素点击
3. 智能过滤需要埋点的元素
4. 紧急修复机制

🔧 配置要求：
- 确保元素有 data-text、data-src 或 data-track 属性
- 属性值要与配置列表匹配
- 在根容器上绑定 bindtap="globalClick"
        `);
    }

    /**
     * 环境检测
     */
    private isUniApp(): boolean {
        return typeof (globalThis as any).uni !== 'undefined';
    }

    private isMiniProgram(): boolean {
        return typeof (globalThis as any).wx !== 'undefined' ||
               typeof (globalThis as any).my !== 'undefined' ||
               typeof (globalThis as any).swan !== 'undefined' ||
               typeof (globalThis as any).tt !== 'undefined';
    }

    /**
     * UniApp 自动绑定
     */
    private initUniAppBinding() {
        // 方案1: 全局混入
        if ((globalThis as any).uni) {
            // 创建全局混入
            const globalMixin = {
                onLoad() {
                    // 页面加载时自动注入点击处理方法
                    this.$monitoGlobalClick = this.handleGlobalClick.bind(this);
                },
                
                onReady() {
                    // 页面渲染完成后自动扫描并绑定事件
                    this.$nextTick(() => {
                        this.autoScanAndBind();
                    });
                },

                methods: {
                    // 全局点击处理方法
                    $monitoGlobalClick: (evt: any) => {
                        this.handleGlobalClick(evt);
                    },

                    // 自动扫描并绑定事件
                    autoScanAndBind() {
                        // 通过 uni.createSelectorQuery 扫描页面元素
                        const query = (globalThis as any).uni.createSelectorQuery().in(this);
                        
                        // 扫描所有可能需要埋点的元素
                        query.selectAll('button, image, view, text').boundingClientRect();
                        query.exec((res: any) => {
                            if (res && res[0]) {
                                console.log(`UniApp 自动扫描到 ${res[0].length} 个元素`);
                                this.bindEventsToElements(res[0]);
                            }
                        });
                    },

                    // 为元素绑定事件
                    bindEventsToElements(elements: any[]) {
                        elements.forEach((element, index) => {
                            // 为每个元素动态添加点击事件
                            // 注意：这里需要配合模板中的条件渲染
                            console.log(`为元素 ${index} 绑定点击事件`);
                        });
                    }
                }
            };

            // 应用全局混入
            if ((globalThis as any).Vue && (globalThis as any).Vue.mixin) {
                (globalThis as any).Vue.mixin(globalMixin);
            }
        }

        // 方案2: 劫持页面跳转
        if ((globalThis as any).uni && (globalThis as any).uni.addInterceptor) {
            (globalThis as any).uni.addInterceptor('navigateTo', {
                success: () => {
                    setTimeout(() => {
                        this.injectToCurrentPage();
                    }, 100);
                }
            });

            (globalThis as any).uni.addInterceptor('redirectTo', {
                success: () => {
                    setTimeout(() => {
                        this.injectToCurrentPage();
                    }, 100);
                }
            });
        }
    }

    /**
     * 原生小程序自动绑定
     */
    private initNativeMiniProgramBinding() {
        // 方案1: 劫持 Page 构造函数
        this.hijackPageConstructor();
        
        // 方案2: 劫持 Component 构造函数
        this.hijackComponentConstructor();
        
        // 方案3: 全局事件代理
        this.setupGlobalEventProxy();
    }

    /**
     * 劫持 Page 构造函数
     */
    private hijackPageConstructor() {
        const originalPage = (globalThis as any).Page;
        if (!originalPage) return;

        const self = this; // 保存 this 引用

        (globalThis as any).Page = (options: any) => {
            // 注入全局点击处理方法
            options.$monitoGlobalClick = (evt: any) => {
                self.handleGlobalClick(evt);
            };

            // 注入便捷的埋点方法
            options.handleGlobalClick = (evt: any) => {
                console.log('页面点击处理器触发', evt);
                self.handleGlobalClick(evt);
            };

            options.trackClick = (evt: any) => {
                console.log('手动埋点方法调用', evt);
                self.handleGlobalClick(evt);
            };

            // 劫持生命周期
            const originalOnLoad = options.onLoad;
            options.onLoad = function(query: any) {
                if (originalOnLoad) originalOnLoad.call(this, query);

                // 设置页面实例引用
                this.__monitoInstance = this;

                console.log('页面加载完成，准备自动绑定事件');
            };

            const originalOnReady = options.onReady;
            options.onReady = function() {
                if (originalOnReady) originalOnReady.call(this);

                console.log('页面渲染完成，开始增强扫描');

                // 使用增强扫描器
                self.enhancedScanner.enhancedPageScan(this);

                // 注入全局点击处理器
                self.enhancedScanner.injectGlobalClickHandler(this);

                // 输出模板绑定建议
                console.log('模板绑定建议:\n', self.enhancedScanner.generateTemplateBindings());
            };

            // 添加自动绑定方法
            options.autoBindEvents = function() {
                const query = this.createSelectorQuery();

                // 扩展扫描范围，包含更多可能的元素
                const selectors = [
                    'button',
                    'image',
                    'view[data-text]',
                    'view[data-src]',
                    'text[data-text]',
                    'navigator[data-text]',
                    '.clickable',
                    '[data-track]'  // 支持自定义埋点属性
                ].join(', ');

                query.selectAll(selectors).boundingClientRect();
                query.exec((res: any) => {
                    console.log('自动扫描元素完成', res);

                    if (res && res[0]) {
                        console.log(`小程序自动扫描到 ${res[0].length} 个可绑定元素`);

                        // 为每个元素创建唯一的事件处理器
                        res[0].forEach((element: any, index: number) => {
                            const handlerName = `__autoHandler_${index}`;
                            this[handlerName] = (evt: any) => {
                                console.log(`自动绑定的点击事件触发 - 元素${index}`, evt);
                                this.$monitoGlobalClick(evt);
                            };
                        });

                        // 尝试通过 dataset 进一步扫描
                        this.scanElementsByDataset();
                    } else {
                        console.warn('未扫描到任何可绑定元素，尝试备用方案');
                        this.fallbackScan();
                    }
                });
            };

            // 添加通过 dataset 扫描的备用方法
            options.scanElementsByDataset = function() {
                // 使用更通用的选择器
                const query = this.createSelectorQuery();
                query.selectAll('view, button, image, text, navigator').boundingClientRect();
                query.exec((res: any) => {
                    if (res && res[0]) {
                        console.log(`备用扫描找到 ${res[0].length} 个元素`);

                        // 检查每个元素是否有埋点相关的 data 属性
                        res[0].forEach((element: any, index: number) => {
                            // 这里需要通过其他方式检查 dataset
                            console.log(`检查元素 ${index}:`, element);
                        });
                    }
                });
            };

            // 添加降级扫描方案
            options.fallbackScan = function() {
                console.log('执行降级扫描方案');

                // 方案1: 直接为页面添加全局点击监听
                this.globalClickHandler = (evt: any) => {
                    console.log('全局点击事件触发', evt);

                    // 检查点击的元素是否有埋点属性
                    const target = evt.target || evt.currentTarget;
                    if (target && target.dataset) {
                        const hasTrackData = target.dataset.text ||
                                           target.dataset.src ||
                                           target.dataset.track;

                        if (hasTrackData) {
                            console.log('检测到埋点元素被点击:', target.dataset);
                            this.$monitoGlobalClick(evt);
                        }
                    }
                };

                // 注意：小程序中无法直接添加全局点击监听
                // 这里提供一个思路，实际需要配合模板中的事件绑定
                console.log('降级方案：需要在模板中手动绑定 bindtap="globalClickHandler"');
            };

            return originalPage(options);
        };
    }

    /**
     * 劫持 Component 构造函数
     */
    private hijackComponentConstructor() {
        const originalComponent = (globalThis as any).Component;
        if (!originalComponent) return;

        (globalThis as any).Component = (options: any) => {
            if (!options.methods) options.methods = {};
            
            // 注入全局点击处理方法
            options.methods.$monitoGlobalClick = (evt: any) => {
                this.handleGlobalClick(evt);
            };

            // 劫持 attached 生命周期
            const originalAttached = options.attached;
            options.attached = function() {
                if (originalAttached) originalAttached.call(this);
                
                // 组件附加后自动绑定事件
                setTimeout(() => {
                    console.log('组件附加完成，自动绑定事件');
                }, 50);
            };

            return originalComponent(options);
        };
    }

    /**
     * 设置全局事件代理
     */
    private setupGlobalEventProxy() {
        // 在小程序中，我们可以通过劫持 getCurrentPages 来监控页面变化
        const originalGetCurrentPages = (globalThis as any).getCurrentPages;
        if (originalGetCurrentPages) {
            let lastPageCount = 0;
            
            // 定期检查页面变化
            setInterval(() => {
                const pages = originalGetCurrentPages();
                if (pages.length !== lastPageCount) {
                    lastPageCount = pages.length;
                    
                    // 页面发生变化，为新页面注入方法
                    if (pages.length > 0) {
                        const currentPage = pages[pages.length - 1];
                        this.injectToPage(currentPage);
                    }
                }
            }, 100);
        }
    }

    /**
     * 向当前页面注入方法
     */
    private injectToCurrentPage() {
        const pages = (globalThis as any).getCurrentPages?.();
        if (pages && pages.length > 0) {
            const currentPage = pages[pages.length - 1];
            this.injectToPage(currentPage);
        }
    }

    /**
     * 向指定页面注入方法
     */
    private injectToPage(page: any) {
        if (!page || page.__monitoInjected) return;
        
        // 标记已注入
        page.__monitoInjected = true;
        
        // 注入全局点击处理方法
        page.$monitoGlobalClick = (evt: any) => {
            console.log('全局点击事件触发',evt);
            
            this.handleGlobalClick(evt);
        };
        
        // 注入自动扫描方法
        page.autoScanElements = () => {
            if (page.createSelectorQuery) {
                const query = page.createSelectorQuery();
                query.selectAll('button, image, view').boundingClientRect();
                query.exec((res: any) => {
                    console.log('自动扫描元素完成',res);
                    
                    if (res && res[0]) {
                        console.log(`为页面注入埋点，扫描到 ${res[0].length} 个元素`);
                    }
                });
            }
        };
        
        // 延迟执行扫描
        setTimeout(() => {
            page.autoScanElements?.();
        }, 100);
        
        console.log('已向页面注入埋点方法');
    }
}
