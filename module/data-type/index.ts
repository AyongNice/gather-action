const list: string[] = ['vue', 'react', 'wx', 'uniapp'];

export interface Reques {
    //上传数据配置
    requestUrl: string; //上报数据请求地址
    requesHeader: any; //请求头
    requesKey?: string; //上传埋点数据后端接口字段key
    maxRequesGatewayLength?: Number; //最大一次性上次数据条数， 默认10条， 1 ： 实时上传
}

export interface InitParm {
    frameType: string;
    reques?: Reques;
    projectName: String; //项目名
    userInfo: {userCode:string}; //用户信息
    monitoSwitch?: Boolean; //是否开启埋点
    showLog: Boolean; //是否打印日志
    isPosition: Boolean; //是否获取定位信息
    globaMonitoConfigList: ViewIfo[]; //埋点采集配置
}

enum Direction {
    Up = 10, // 值默认为 0
    Down = 13, // 值默认为 1
    Left = 20, // 值默认为 2
    Right // 值默认为 3
}

interface FrameType {
    [key: string]: ['vue', 'react', 'wx', 'uniapp'];
}

export interface CommonData {
    projectName: String; //项目名
    userInfo: unknown; //用户信息
    actionType?: String;
}

export interface EventListenerPar<T extends EventTarget, E extends Event> {
    element: T;
    type: string;
    handler: (e: E) => void;
    useCapture: Boolean;
}

export interface ViewIfo {
    //dom事件采集
    id?: String; //数据ID
    pageUrl?: String; //当前页面地址
    elementText: String; //dom文案
    actionType?: String; //采集类型
    domType?:keyof ['IMG','view']
}

export interface PageInfo {
    //页面事件触发采集第一步数据处理
    id: String; //数据ID
    info: String; //页面信息
    pageUrl: String; //当前页面地址
    actionType: string | String; //采集类型
    oldURL?: String; //页面跳转前地址
}

export interface PageTime {
    //页面事件当前页面&旧页面信息记录板
    //页面停留时间对象
    [key: string]: TimeInfo;
}

export interface TimeInfo {
    //页面事件触发采集页面时间数据处理
    pageUrl: string; //页面地址
    oldURL?: String; //页面跳转前地址
    entetTim: Number; //页面进入时间
    leaveTime?: Number; //页面离开时间
    remainTime?: number; //页面停留时间
    actionType: string; //采集类型
}

export interface Performance {
    //页面加载信息性能数据
    dnsParseTime: Number; //dns解析时间
    tcpCreTime: Number; //tcp创建时间
    whiteScreenTime: Number; //白屏时间
    domRenderingTime: Number; //dom渲染时间
    loadTime: Number; //加载时间
}

export interface SystemData {
    //设备数据
    availWidth: String; //屏幕高度
    availHeight: String; //屏幕宽度
    resolution: String; //屏幕分辨率
    systemType: String; //系统类型
    phoneBrand: String; //手机品牌
    phoneVision: String | RegExpMatchArray | null; //手机系统版本
    position?: Position | String; //经纬度 | 获取失败 报错信息
}

export interface PhoneInfo {
    phoneVision: String | RegExpMatchArray | null; //手机系统版本
    phoneBrand: String; //手机品牌
}

export interface Position {
    //位置
    //手机定位
    latitude: Number; //精度
    longitude: Number; //维度
}

export interface Evt extends Event {
    //基础Event事件对象
    arguments?: any;
    newURL?: String; //当前页面地址
    oldURL?: String; //上一级页面地址
}

export interface PageHandle {
    //页面变化数据处理方法
    pageBack: Function; //页面返回数据处理
    pagejump: Function; //页面跳转数据处理
    pageLoad: Function; //页面首次加载数据处理
}

export interface LogType {
    //页面变化数据处理方法
    logMake: String; //日志标记
    logInfo: unknown; //日志信息
}

export interface GlobalPerformanceData {
    //全部性能数据
    allResourceLoad: Indicators[];
    aboutPerformance: AboutData;
}

export interface Indicators {
    //所以资源请求指标格式
    name: String;
    duration: Number;
}

export interface AboutData {
    //页面大概加载性能数据
    DNS: Number;
    TCP: Number;
    WhitecrSeend: Number;
    DOM: Number;
    Load: Number;
}

export interface WebVitals {
    // WebVitals数据格式
    name: String;
    value: Number | undefined;
}

export interface InteractData {
    // 用户交互采集数据
    id: String; //数据Id
    actionType: String; //采集类型
    elementText: String; //dom文案
    pageUrl: String; //页面路径
    projectName: String; //项目名称
    userInfo: any; //用户信息
    availHeight: String; //屏幕高度
    availWidth: String; //屏幕宽度
    resolution: String; //屏幕像素
    systemType: String; //系统类型
    phoneBrand: String; //手机皮牌
    phoneVision: String; //手机系统版本
    position: Position | String; //定位信息 （定位失败 报错信息）
}

export interface PageData {
    //页面采集数据
    DNS: Number; //nsc时长
    DOM: Number; //dom渲染时长
    Load: Number; //页面加载时长
    TCP: Number; //tcp请求时长
    WhitecrSeend: Number; //白屏时长
    allResourceLoad: Indicators[]; //所以资源加载时间
    actionType: String; //采集类型
    entetTim: Number; //页面进入时间
    leaveTime: Number; //页面离开时间
    remainTime: Number; //页面停留时间
    oldURL: String; //进入前页面
    pageUrl: String; //当前页面
    projectName: String; //项目名称
    userInfo: any; //用户信息
    availHeight: String; //屏幕高度
    availWidth: String; //屏幕宽度
    resolution: String; //屏幕像素
    systemType: String; //系统类型
    phoneBrand: String; //手机皮牌
    phoneVision: String; //手机系统版本
    position: Position | String; //定位信息 （定位失败 报错信息
}
