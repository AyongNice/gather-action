// 立即导入劫持模块，确保在页面创建前执行
import '../auto-binding/immediate-page-hijack';

import event from '../event-listener';
import DataProcess from '../data-store/data-process';
import {InitParm, Evt, ViewIfo, TimeInfo, ImgIfo} from '../data-type';
import {log} from "../log-output";
import { MiniProgramAutoBinding } from '../auto-binding/miniprogram-auto-binding';

// 环境检测工具
class EnvironmentDetector {
    static isWeb(): boolean {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }

    static isMiniProgram(): boolean {
        // 微信小程序
        if (typeof (globalThis as any).wx !== 'undefined' && (globalThis as any).wx.getSystemInfoSync) {
            return true;
        }
        // 支付宝小程序
        if (typeof (globalThis as any).my !== 'undefined' && (globalThis as any).my.getSystemInfoSync) {
            return true;
        }
        // 百度小程序
        if (typeof (globalThis as any).swan !== 'undefined' && (globalThis as any).swan.getSystemInfoSync) {
            return true;
        }
        // 字节跳动小程序
        if (typeof (globalThis as any).tt !== 'undefined' && (globalThis as any).tt.getSystemInfoSync) {
            return true;
        }
        return false;
    }

    static isUniApp(): boolean {
        return typeof (globalThis as any).uni !== 'undefined';
    }
}

// 兼容的元素获取工具
class ElementHelper {
    /**
     * 兼容的获取点击元素方法
     * @param evt 事件对象
     * @returns 元素信息或null
     */
    static getClickedElement(evt: any): {
        element?: Element | null;
        nodeName?: string;
        textContent?: string;
        src?: string;
        baseURI?: string;
        target?: any;
    } | null {
        if (EnvironmentDetector.isWeb()) {
            // Web 环境
            const pointerEvt = evt as PointerEvent;
            const dom = document.elementFromPoint(pointerEvt.pageX, pointerEvt.pageY);
            return {
                element: dom,
                nodeName: dom?.nodeName,
                textContent: dom?.textContent,
                src: (dom as any)?.src,
                baseURI: dom?.baseURI,
                target: evt.target
            };
        } else if (EnvironmentDetector.isUniApp()) {
            // UniApp 环境 - 使用 event.target
            return {
                element: null,
                nodeName: evt.target?.tagName?.toUpperCase(),
                textContent: evt.target?.dataset?.text || evt.target?.innerText,
                src: evt.target?.src,
                baseURI: (globalThis as any).getCurrentPages?.()[((globalThis as any).getCurrentPages?.().length || 1) - 1]?.route,
                target: evt.target
            };
        } else if (EnvironmentDetector.isMiniProgram()) {
            // 小程序环境 - 使用 event.target 和 dataset
            return {
                element: null,
                nodeName: evt.target?.tagName?.toUpperCase(),
                textContent: evt.target?.dataset?.text || evt.detail?.text,
                src: evt.target?.dataset?.src || evt.detail?.src,
                baseURI: (globalThis as any).getCurrentPages?.()[((globalThis as any).getCurrentPages?.().length || 1) - 1]?.route,
                target: evt.target
            };
        }
        return null;
    }
}

class MonitoInit {
    private dataProcess: DataProcess;//数据处理对象
    private pageMonito = {// 页面采集类型指针
        vue: {
            info: '页面跳转',
            actionType: 'pagejump'
        },
        uniapp: {
            info: '应用首次进入',
            actionType: 'pageLoad'
        }
    }
    private monitoConfigList: ViewIfo[] = [//采集配置
        {
            elementText: '',
            actionType: ''
        }
    ];
    private monitoImgList: ImgIfo[] = [//图片采集配置
        {
            imgSrc: '',
        }
    ];

    constructor() {
        this.dataProcess = new DataProcess();
    }

    /**
     * 初始化点击事件 - 兼容多环境
     */
    private initClickEvent(viewMap: { [key: string]: ViewIfo }, imgMap: { [key: string]: ImgIfo }, regex: RegExp) {
        if (EnvironmentDetector.isWeb()) {
            // Web 环境使用原有逻辑
            event.addEventListener({
                element: document,
                type: 'click',
                handler: async (evt: PointerEvent) => {
                    const timestamp: Number = new Date().getTime();

                    // 兼容不同框架的元素获取方式
                    let elementInfo: Element | null = null;

                    // 方法1: 尝试使用 evt.target (适用于大多数情况)
                    if (evt.target && (evt.target as Element).nodeType === Node.ELEMENT_NODE) {
                        elementInfo = evt.target as Element;
                    }

                    // 方法2: 尝试使用 evt.currentTarget (Vue/React 可能使用)
                    if (!elementInfo && evt.currentTarget && (evt.currentTarget as Element).nodeType === Node.ELEMENT_NODE) {
                        elementInfo = evt.currentTarget as Element;
                    }

                    // 方法3: 使用坐标获取元素 (兜底方案)
                    if (!elementInfo && evt.pageX !== undefined && evt.pageY !== undefined) {
                        elementInfo = document.elementFromPoint(evt.pageX, evt.pageY);
                    }

                    // 方法4: 使用 clientX/clientY (备选坐标)
                    if (!elementInfo && evt.clientX !== undefined && evt.clientY !== undefined) {
                        elementInfo = document.elementFromPoint(evt.clientX, evt.clientY);
                    }

                    if (!elementInfo) return;

                    // 获取实际的文本内容，兼容不同框架
                    const getElementText = (element: Element): string => {
                        // 方法1: 优先使用 innerText（用户看到的渲染文本）
                        if ((element as any).innerText !== undefined && (element as any).innerText !== null) {
                            const innerText = (element as any).innerText.trim();
                            if (innerText) return innerText;
                        }

                        // 方法2: 使用 textContent（包含所有文本节点）
                        if (element.textContent !== undefined && element.textContent !== null) {
                            const textContent = element.textContent.trim();
                            if (textContent) return textContent;
                        }

                        // 方法3: 尝试获取 Vue/React 组件的文本内容
                        // 查找第一个有文本的子元素
                        const findTextInChildren = (el: Element): string => {
                            for (let i = 0; i < el.children.length; i++) {
                                const child = el.children[i];
                                const childText = (child as any).innerText || child.textContent;
                                if (childText && childText.trim()) {
                                    return childText.trim();
                                }
                                // 递归查找
                                const deepText = findTextInChildren(child);
                                if (deepText) return deepText;
                            }
                            return '';
                        };

                        return findTextInChildren(element);
                    };

                    const elementText = getElementText(elementInfo);
         

                    // 处理图片点击
                    if (elementInfo.nodeName === 'IMG' && (elementInfo as any).src) {
                        const res = (elementInfo as any).src.match(regex)?.[1];
                        if (res && (elementInfo as any).src.includes(imgMap[res]?.imgSrc as string)) {
                            await this.dataProcess.track({
                                id: timestamp.toString(),
                                pageUrl: elementInfo.baseURI,
                                actionType: 'click-img',
                                ...imgMap[res]
                            });
                        }
                    }

                    // 处理文本点击
                    if (elementText) {
                        if (viewMap[elementText]) {
                            await this.dataProcess.track({
                                id: timestamp.toString(),
                                pageUrl: elementInfo.baseURI,
                                actionType: 'click',
                                elementText: elementText,
                                ...viewMap[elementText]
                            });
                        }
                    }
                }
            });
        } else {
            // 小程序/UniApp 环境 - 智能自动绑定
            this.initMiniProgramAutoBinding(viewMap, imgMap, regex);
        }
    }

    /**
     * 小程序环境智能自动绑定
     */
    private initMiniProgramAutoBinding(viewMap: { [key: string]: ViewIfo }, imgMap: { [key: string]: ImgIfo }, regex: RegExp) {
        // 使用专门的自动绑定系统
        const autoBinding = new MiniProgramAutoBinding(
            viewMap,
            imgMap,
            regex,
            this.handleGlobalClick.bind(this)
        );

        // 初始化自动绑定
        autoBinding.init();

        console.log('小程序智能自动绑定已启动');
    }

    /**
     * 小程序环境的点击事件处理方法
     * 现在可以自动调用，也支持手动调用
     */
    public async handleGlobalClick(evt: any) {
        const timestamp: Number = new Date().getTime();
        const elementInfo = ElementHelper.getClickedElement(evt);

        if (!elementInfo) return;

        const viewMap: { [key: string]: ViewIfo } = {}
        this.monitoConfigList.forEach(_ => viewMap[_.elementText as string] = _)

        const imgMap: { [key: string]: ImgIfo } = {}
        this.monitoImgList.forEach(_ => imgMap[_.imgSrc as string] = _)
        const regex: RegExp = /\/([^\/]*)$/;

        // 处理图片点击
        if (elementInfo.nodeName === 'IMAGE' && elementInfo.src) {
            const res = elementInfo.src.match(regex)?.[1];
            if (res && elementInfo.src.includes(imgMap[res]?.imgSrc as string)) {
                await this.dataProcess.track({
                    id: timestamp.toString(),
                    pageUrl: elementInfo.baseURI,
                    actionType: 'click-img',
                    ...imgMap[res]
                });
            }
        }

        // 处理文本点击
        if (elementInfo.textContent) {
            const trimmedText = elementInfo.textContent.trim();
            if (viewMap[trimmedText]) {
                await this.dataProcess.track({
                    id: timestamp.toString(),
                    pageUrl: elementInfo.baseURI,
                    actionType: 'click',
                    elementText: elementInfo.textContent,
                    ...viewMap[trimmedText]
                });
            }
        }
    }

    getUrl( ){
        
    }

    async eventInit(parmas: InitParm) {
        this.monitoConfigList = parmas.globaMonitoConfigList;
        this.monitoImgList = parmas.globaMonitoImgList ?? [];

        this.dataProcess.setisPosition(parmas.isPosition);
        this.dataProcess.setPackageName(parmas.projectName);
        this.dataProcess.setUserInfo(parmas.userInfo);
        this.dataProcess.setMaxRequesLength(parmas.reques?.maxRequesGatewayLength)
        this.dataProcess.setUrl(parmas.reques?.requestUrl as string)

        await this.dataProcess.dbInit();

   
        // 初始化当前页面的停留时间记录
        this.dataProcess.pageTrack({
            id: new Date().getTime().toString(),
            info: '应用首次进入',
            pageUrl: document.baseURI,
            actionType: 'pageLoad'
        });

        /** view采集哈希表 **/
        const viewMap: { [key: string]: ViewIfo } = {}
        this.monitoConfigList.forEach(_ => viewMap[_.elementText as string] = _)

        /** img采集哈希表 **/
        const imgMap: { [key: string]: ImgIfo } = {}
        this.monitoImgList.forEach(_ => imgMap[_.imgSrc as string] = _)
        const regex: RegExp = /\/([^\/]*)$/;

        // 全局点击事件 - 兼容多环境
        this.initClickEvent(viewMap, imgMap, regex);
        //页面显示/隐藏
        event.addEventListener({
            element: document,
            type: 'visibilitychange',
            handler: event => {
                if (!document.hidden) {
                    // 如果是显示状态执行相应的事件
                } else {
                    // 如果是隐藏状态执行相应的事件
                }
            }
        });

        //页面返回
        event.addEventListener({
            element: window,
            type: 'popstate',
            handler: event => {
                // this.pageUrlRecord(event.newURL as String, event.oldURL as String);
                this.dataProcess.pageTrack({
                    id: event.timeStamp.toString(),
                    info: '页面返回',
                    pageUrl: document.baseURI as string,
                    actionType: 'pageBack'
                });
            }
        });

        const _wr = function <T extends keyof History>(type: T) {
            const orig: Function = history[type];
            return function () {
                const rv = orig.apply(history, arguments);
                const e: Evt = new Event(type);
                e.arguments = arguments;
                window.dispatchEvent(e);
                return orig;
            };
        };
        history.pushState = _wr('pushState');
        history.replaceState = _wr('replaceState');
        //页面首次加载 || ('vue', 'react' 项目跳转 首次)
        event.addEventListener({
            element: window,
            type: 'replaceState',
            handler: event => {
                const url: String = document.baseURI as String;
                this.dataProcess.pageTrack({
                    id: event.timeStamp.toString(),
                    info: this.pageMonito.uniapp.info,
                    pageUrl: url,
                    actionType: this.pageMonito.uniapp.actionType
                });

                if (['vue', 'react'].includes(String(parmas.frameType))) {//vue项目 页面进入类型指针 互换
                    this.pageMonito.uniapp = this.pageMonito.vue
                }
            }
        });
   

        if (String(parmas.frameType) === 'uniapp') {
                 //获取页面地址拦地址

            event.addEventListener({
                element: window,
                type: 'pushState',
                handler: event => {
                    const url: String = event.arguments[2] as String;
     

                    console.log('页面跳转', url);
                    // this.pageUrlRecord(url as String, this.newPageUrl as String);
                    this.dataProcess.pageTrack({
                        id: event.timeStamp.toString(),
                        info: '页面跳转',
                        pageUrl: url,
                        actionType: 'pagejump'
                    });
                }
            });
        }
        // 	//页面路由变化

    }

    /**
     * @param {Object} params 数据处理
     */
    async track(params: TimeInfo | ViewIfo): Promise<void> {
        try {
            await this.dataProcess.track(params);
        } catch (logInfo) {
            log({logInfo, logMake: 'initTrack错误'})
        }
    }
}

export default MonitoInit;
