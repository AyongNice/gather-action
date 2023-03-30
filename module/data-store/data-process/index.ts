import Data from '../data';
import hardware from '../../hardware-data';
import {observer, aboutPerformance} from '../../performance';
import {log} from '../../log-output';
import { clear} from '../data/db';


import {
    PageInfo,
    ViewIfo,
    CommonData,
    SystemData,
    PageHandle,
    PageTime,
    TimeInfo,
    Indicators,
    AboutData,
} from '../../data-type';
import Http from '../.././report';

class DataProcess {
    private projectName: String = ''; //项目名称
    private data: Data; //数据class对象
    private newPageUrl: String = ''; //当前页面地址指针
    private oldPageUrl: String = ''; //旧页面地址指针（应用首次进入为''）
    private pageTimeIfon: PageTime = {};
    private pageAllrecord: { [key: string]: string } = {};//记录进入页面页面

    private isPosition: Boolean = false;
    private userInfo: any = null; //用户信息 任何数据类型 有开发人员参数
    private maxRequesGatewayLength: Number = 10; ////最大一次性上次数据条数， 默认10条， 1 ： 实时上传
    private url: string = ''; //网络请求地址
    private requesKey: string = 'value'; //网络请求请求参数字段

    constructor() {
        this.data = new Data();
    }

    //获取通用数据
    getGlobalData(): Promise<SystemData> {
        return new Promise(async (resolve, reject) => {
            const res = await hardware.getGlobalData({isPosition: this.isPosition});
            resolve(res);
        });
    }

    //获取大概页面性能数据
    async getPerformanceData(): Promise<{ allResourceLoad: Indicators[]; aboutPerformances: AboutData }> {
        const aboutPerformances: AboutData = aboutPerformance();
        const allResourceLoad: Indicators[] = await observer();
        return {allResourceLoad, aboutPerformances};
    }

    //页面事件处理
    pageUrlRecord(newPageUrl: String, oldPageUrl: String = '', actionType: string): void {
        this.oldPageUrl = oldPageUrl;
        this.newPageUrl = newPageUrl;
        this.pageEnter(newPageUrl as string, oldPageUrl as string, actionType);
    }

    // 页面进入方法
    async pageEnter(newPageUrl: string, oldPageUrl: string, actionType: string): Promise<void> {
        const time: Number = new Date().getTime();
        /** * 计算页面进入/离开/停留时间*/
        if (oldPageUrl) {
            this.pageTimeIfon[oldPageUrl as string].leaveTime = time;
            this.pageTimeIfon[oldPageUrl as string].pageUrl = newPageUrl;
            this.pageTimeIfon[oldPageUrl as string].oldURL = oldPageUrl;
            const leaveTime: number = this.pageTimeIfon[oldPageUrl as string].leaveTime as number;
            const entetTim: number = this.pageTimeIfon[oldPageUrl as string].entetTim as number;
            this.pageTimeIfon[oldPageUrl as string].remainTime = leaveTime - entetTim;
            this.track(this.pageTimeIfon[oldPageUrl as string]);
            delete this.pageTimeIfon[oldPageUrl as string];
        }

        try {
            //新增页面记录
            let allResourceLoadList: {
                allResource: Indicators[] | []
            } = {allResource: []}
            if (!this.pageAllrecord[newPageUrl as string]) {
                allResourceLoadList.allResource = await observer();
            }
            const aboutPerformances: AboutData = aboutPerformance();
            this.pageTimeIfon[newPageUrl as string] = {
                actionType,
                pageUrl: newPageUrl,
                entetTim: time,
                ...aboutPerformances,
                ...allResourceLoadList
            };
            this.pageAllrecord[newPageUrl as string] = newPageUrl;

        } catch (logInfo) {
            log({
                logInfo,
                logMake: '页面进入记录报错'
            })
        }
    }

    /**
     * 节点采集数据处理
     *  @param {string } parmas.id 数据id
     *  @param {string } parmas.info  数据信息
     *  @param {string } parmas.pageUrl 页面地址
     *  @param {string } parmas.actionType 数据id
     */
    async track(parmas: TimeInfo | ViewIfo): Promise<void> {
        const GlobalData: SystemData = await this.getGlobalData();

        const data: TimeInfo | ViewIfo | SystemData | CommonData = {
            ...parmas,
            ...GlobalData,
            userInfo: this.userInfo,
            projectName: this.projectName
        };
        let logMake: String = ''
        if (data.actionType === 'click') {
            // @ts-ignore
            logMake = data?.elementText as String;
        } else {
            logMake = data.actionType as String
        }
        log({
            logMake,
            logInfo: data,
        });
        if (this.url && this.maxRequesGatewayLength === 1) {
            try {
                await Http.httpRequestPost({[this.requesKey]: data})
                // @ts-ignore
                await clear()
            } catch (logInfo) {
                log({
                    logInfo,
                    logMake: '上传数据失败',
                });
                // @ts-ignore
                await clear()
            }
        } else {
            this.data.storageData(data);
        }
    }

    /**
     * 页面数据数据处理
     *  @param {string } parmas.id 数据id
     *  @param {string } parmas.info  数据信息
     *  @param {string } parmas.pageUrl 页面地址
     *  @param {string } parmas.actionType 数据id
     */
    pageTrack(parmas: PageInfo): void {
        let urlSplit: RegExpMatchArray | null | string = 'index';
        let url: String = this.newPageUrl;
        if (parmas.pageUrl) {
            // urlSplit = parmas.pageUrl.split('/#')[1];
            // url = urlSplit === '/' ? 'index' : urlSplit;
            // console.log('parmas.pageUrl', parmas.pageUrl);
            const regex = /\/([^\/]*)$/;
            urlSplit = parmas.pageUrl.match(regex);
            url = urlSplit[1] === '' ? 'index' : urlSplit[1];
        }
        const pageHandle: PageHandle = {
            pageBack: () => {
                this.pageUrlRecord(url, this.newPageUrl, parmas.actionType as string);
            },
            pagejump: () => {
                this.pageUrlRecord(url, this.newPageUrl, parmas.actionType as string);
            },
            pageLoad: () => {
                this.pageUrlRecord(url, this.newPageUrl, parmas.actionType as string);
            }
        };
        const hadle: Function = pageHandle[parmas.actionType as keyof PageHandle];
        hadle();
    }


    /**
     * 设置项目名
     */
    setPackageName(projectName: String): void {
        this.projectName = projectName;
        this.data.setPackageName(projectName);
    }

    /**
     * 设置是否获取定位
     */
    setisPosition(isPosition: Boolean): void {
        this.isPosition = isPosition;
    }

    /**
     * 设置是用户信息
     */
    setUserInfo(userInfo: unknown): void {
        this.userInfo = userInfo;
        this.data.setUserInfo(userInfo);
    }

    /**
     * 数据库初始化
     */
    dbInit() {
        this.data.DBinit();
    }

    /**
     * 设置最大存储量
     * @param maxRequesGatewayLength
     */
    setMaxRequesLength(maxRequesGatewayLength: Number = 10): void {
        this.maxRequesGatewayLength = maxRequesGatewayLength;
        this.data.setMaxRequesLength(maxRequesGatewayLength);
    }

    /**
     * 设置网络请求 数据字段
     */
    setRequesKey(requesKey: string): void {
        this.requesKey = requesKey;
        this.data.setRequesKey(requesKey);
    }

    /**
     * 设置网络请求地址
     */
    setUrl(url: string): void {
        this.url = url;
        this.data.setUrl(url);
    }
}

export default DataProcess;
