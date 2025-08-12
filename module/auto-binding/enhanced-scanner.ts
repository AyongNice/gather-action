// 增强的元素扫描器 - 解决 view 元素扫描不到的问题
export class EnhancedElementScanner {
    private viewMap: { [key: string]: any } = {};
    private imgMap: { [key: string]: any } = {};
    private handleGlobalClick: (evt: any) => Promise<void>;

    constructor(
        viewMap: { [key: string]: any },
        imgMap: { [key: string]: any },
        handleGlobalClick: (evt: any) => Promise<void>
    ) {
        this.viewMap = viewMap;
        this.imgMap = imgMap;
        this.handleGlobalClick = handleGlobalClick;
    }

    /**
     * 增强的页面扫描方法
     */
    enhancedPageScan(pageInstance: any) {
        console.log('开始增强扫描...');
        
        // 方案1: 多重选择器扫描
        this.multiSelectorScan(pageInstance);
        
        // 方案2: 延迟扫描（等待页面完全渲染）
        setTimeout(() => {
            this.delayedScan(pageInstance);
        }, 200);
        
        // 方案3: 递归扫描所有元素
        setTimeout(() => {
            this.recursiveScan(pageInstance);
        }, 500);
    }

    /**
     * 多重选择器扫描
     */
    private multiSelectorScan(pageInstance: any) {
        const query = pageInstance.createSelectorQuery();
        
        // 分别扫描不同类型的元素
        const scanTasks = [
            // 扫描所有 view 元素
            {
                selector: 'view',
                name: 'view元素'
            },
            // 扫描带有 data-text 的元素
            {
                selector: '[data-text]',
                name: '带data-text的元素'
            },
            // 扫描带有 data-src 的元素
            {
                selector: '[data-src]',
                name: '带data-src的元素'
            },
            // 扫描按钮
            {
                selector: 'button',
                name: '按钮元素'
            },
            // 扫描图片
            {
                selector: 'image',
                name: '图片元素'
            },
            // 扫描文本
            {
                selector: 'text',
                name: '文本元素'
            }
        ];

        scanTasks.forEach((task, taskIndex) => {
            const taskQuery = pageInstance.createSelectorQuery();
            taskQuery.selectAll(task.selector).boundingClientRect();
            taskQuery.exec((res: any) => {
                if (res && res[0] && res[0].length > 0) {
                    console.log(`${task.name}扫描结果:`, res[0].length, '个元素');
                    
                    // 为每个元素尝试绑定事件
                    res[0].forEach((element: any, elementIndex: number) => {
                        this.tryBindElement(pageInstance, element, `${taskIndex}_${elementIndex}`);
                    });
                } else {
                    console.log(`${task.name}扫描结果: 0个元素`);
                }
            });
        });
    }

    /**
     * 延迟扫描
     */
    private delayedScan(pageInstance: any) {
        console.log('执行延迟扫描...');
        
        const query = pageInstance.createSelectorQuery();
        
        // 使用更宽泛的选择器
        query.selectAll('*').boundingClientRect();
        query.exec((res: any) => {
            if (res && res[0]) {
                console.log(`延迟扫描找到 ${res[0].length} 个元素`);
                
                // 过滤出可能需要埋点的元素
                const trackableElements = res[0].filter((element: any) => {
                    // 检查元素是否可能需要埋点
                    return element.width > 0 && element.height > 0; // 有尺寸的元素
                });
                
                console.log(`其中 ${trackableElements.length} 个元素可能需要埋点`);
                
                trackableElements.forEach((element: any, index: number) => {
                    this.tryBindElement(pageInstance, element, `delayed_${index}`);
                });
            }
        });
    }

    /**
     * 递归扫描
     */
    private recursiveScan(pageInstance: any) {
        console.log('执行递归扫描...');
        
        // 尝试扫描所有可能的元素类型
        const allSelectors = [
            'view', 'button', 'image', 'text', 'navigator', 'scroll-view',
            'swiper', 'swiper-item', 'movable-view', 'cover-view', 'cover-image',
            '.btn', '.button', '.clickable', '.item', '.card', '.list-item'
        ];

        allSelectors.forEach((selector, index) => {
            setTimeout(() => {
                const query = pageInstance.createSelectorQuery();
                query.selectAll(selector).boundingClientRect();
                query.exec((res: any) => {
                    if (res && res[0] && res[0].length > 0) {
                        console.log(`递归扫描 ${selector}: ${res[0].length} 个元素`);
                        
                        res[0].forEach((element: any, elementIndex: number) => {
                            this.tryBindElement(pageInstance, element, `recursive_${index}_${elementIndex}`);
                        });
                    }
                });
            }, index * 50); // 错开执行时间
        });
    }

    /**
     * 尝试为元素绑定事件
     */
    private tryBindElement(pageInstance: any, element: any, uniqueId: string) {
        // 创建唯一的处理器名称
        const handlerName = `__autoHandler_${uniqueId}`;
        
        // 检查是否已经绑定过
        if (pageInstance[handlerName]) {
            return;
        }
        
        // 创建事件处理器
        pageInstance[handlerName] = (evt: any) => {
            console.log(`自动绑定的点击事件触发 - ${uniqueId}`, evt);
            
            // 检查是否是需要埋点的元素
            if (this.shouldTrackElement(evt)) {
                this.handleGlobalClick(evt);
            }
        };
        
        console.log(`为元素创建处理器: ${handlerName}`);
    }

    /**
     * 判断元素是否需要埋点
     */
    private shouldTrackElement(evt: any): boolean {
        const target = evt.target || evt.currentTarget;
        
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
     * 为页面注入全局点击处理器
     */
    injectGlobalClickHandler(pageInstance: any) {
        // 注入全局点击处理方法
        pageInstance.handleGlobalClick = (evt: any) => {
            console.log('全局点击处理器触发', evt);
            
            if (this.shouldTrackElement(evt)) {
                this.handleGlobalClick(evt);
            } else {
                console.log('元素不需要埋点，忽略点击');
            }
        };
        
        // 注入便捷的埋点方法
        pageInstance.trackClick = (evt: any) => {
            console.log('手动埋点方法调用', evt);
            this.handleGlobalClick(evt);
        };
        
        console.log('已为页面注入全局点击处理器');
    }

    /**
     * 生成模板绑定代码
     */
    generateTemplateBindings(): string {
        return `
<!-- 在需要埋点的 view 元素上添加以下绑定 -->
<view data-text="打开按钮" bindtap="handleGlobalClick">
    打开
</view>

<!-- 或者使用便捷的埋点方法 -->
<view data-text="打开按钮" bindtap="trackClick">
    打开
</view>

<!-- 支持的所有元素类型 -->
<button data-text="按钮文本" bindtap="handleGlobalClick">按钮</button>
<image data-src="图片标识" bindtap="handleGlobalClick" />
<text data-text="文本内容" bindtap="handleGlobalClick">文本</text>
<navigator data-text="导航链接" bindtap="handleGlobalClick">链接</navigator>

<!-- 自定义埋点属性 -->
<view data-track="custom-event" bindtap="handleGlobalClick">自定义事件</view>
        `.trim();
    }
}
