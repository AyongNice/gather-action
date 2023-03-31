import event from '../event-listener';
import DataProcess from '../data-store/data-process';
import {InitParm, Evt, ViewIfo, TimeInfo, ImgIfo} from '../data-type';
import {log} from "../log-output";

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

    eventInit(parmas: InitParm) {
        this.monitoConfigList = parmas.globaMonitoConfigList;
        this.monitoImgList = parmas.globaMonitoImgList ?? [];

        this.dataProcess.setisPosition(parmas.isPosition);
        this.dataProcess.setPackageName(parmas.projectName);
        this.dataProcess.setUserInfo(parmas.userInfo);
        this.dataProcess.setMaxRequesLength(parmas.maxRequesGatewayLength)
        this.dataProcess.setRequesKey(parmas.reques?.requesKey as string)
        this.dataProcess.setUrl(parmas.reques?.requestUrl as string)

        this.dataProcess.dbInit();

        /** view采集哈希表 **/
        const viewMap: { [key: string]: ViewIfo } = {}
        this.monitoConfigList.forEach(_ => viewMap[_.elementText as string] = _)

        /** img采集哈希表 **/
        const imgMap: { [key: string]: ImgIfo } = {}
        this.monitoImgList.forEach(_ => imgMap[_.imgSrc as string] = _)
        const regex: RegExp = /\/([^\/]*)$/;

        // 全局点击事件
        event.addEventListener({
            element: window,
            type: 'click',
            handler: async (evt: PointerEvent) => {
                const timestamp: Number = new Date().getTime();
                //通过配置信息进行过滤点击选择
                const dom = document.elementFromPoint(evt.pageX, evt.pageY);

                if (dom?.nodeName === 'IMG') {
                    // @ts-ignore
                    const res = dom?.src.match(regex)[1];
                    // @ts-ignore
                    if (dom?.src.includes(imgMap[res]?.imgSrc)) {
                        await this.dataProcess.track({
                            id: timestamp.toString(),
                            pageUrl: dom.baseURI,
                            actionType: 'click-img',
                            // @ts-ignore
                            imgSrc:imgMap[res]?.imgSrc,
                            ...imgMap[imgMap[res]?.imgSrc as string]
                        });
                    }
                }
                if (dom) {
                    if (viewMap[dom?.textContent?.trim() as string]) {
                        await this.dataProcess.track({
                            id: timestamp.toString(),
                            pageUrl: dom.baseURI,
                            actionType: 'click',
                            // @ts-ignore
                            "elementText": dom?.textContent,
                            ...viewMap[dom?.textContent?.trim() as string]
                        });
                    }

                }
            }
        });
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

                if (['vue', 'react'].includes(parmas.frameType as string)) {//vue项目 页面进入类型指针 互换
                    this.pageMonito.uniapp = this.pageMonito.vue
                }
            }
        });
        if (parmas.frameType as string === 'uniapp') {
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
     * @param {Object} parmas 数据处理
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
