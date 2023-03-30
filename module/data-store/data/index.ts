import {createDB, onDBSelect, getAll, getCount, clear} from './db.ts';
import Http from '../../report';
import {log} from '../../log-output';

async function getAllData() {//获取所有数据
    let data: any = [];
    try {
        data = await getAll('monito')
    } catch (e) {
        log({
            logMake: '获取数据错误',
            logInfo: e
        });
    }

    function map(_?: any) {
        return JSON.parse(_.value)
    }

    return data.map(map)
}

function getCountData() {//获取所有数据条数
    return getCount('monito')
}

function clearData() {//清楚数据
    return clear('monito')
}

class Data {
    private projectName: String = '';
    private userInfo: { userCode: string }  = {userCode:''};
    private requesKey: string = 'value';
    private url: string = '';
    private http: Http;
    private maxRequesGatewayLength: Number = 10;//最大存储量，达到立刻上传数据
    private monito: Event = new CustomEvent('monito', {
        detail: {getAllData, getCountData, clearData}
    });

    constructor() {
        this.http = new Http()
    }


    DBinit() {
        createDB(this.projectName + this.userInfo.userCode, '1', [
            {
                storeName: 'monito',
                option: {
                    keyPath: 'id'
                },
                index: [
                    {
                        name: 'id', //时间戳
                        keyPath: 'id', //主键key
                        unique: true //是否唯一
                    },
                    {
                        name: 'elementText', //dom文案， 页面为 ‘page’
                        keyPath: 'elementText',
                        unique: false
                    },
                    {
                        name: 'pageUrl', //页面地址
                        keyPath: 'pageUrl',
                        unique: false
                    },
                    {
                        name: 'actionType', //采集类型
                        keyPath: 'actionType',
                        unique: false
                    }
                ]
            }
        ]);
    }

    /**
     * 埋点数据存储
     * @param {string} storage.id 数据key
     * @param {Object} storage.info 数据
     */
    storageData(data: any) {

        onDBSelect('monito', '1', async ({add}) => {
            console.log()
            try {
                add({
                    id: data.id || data?.entetTim || new Date().getTime().toString(),
                    elementText: data?.elementText,
                    actionType: data?.actionType,
                    pageUrl: data?.pageUrl,
                    value: JSON.stringify(data)
                });
            } catch (logInfo) {
                log({
                    logInfo,
                    logMake: '存储数据失败'
                });
            }
            try {
                const count = await getCountData();
                window.dispatchEvent(this.monito);
                if (this.url && Number(count) > this.maxRequesGatewayLength) { //超过最大存储量上传
                    const allData = await getAllData();
                    const logInfo = await Http.httpRequestPost({[this.requesKey]: allData})
                    log({
                        logInfo,
                        logMake: '上传数据成功'
                    });
                    await clearData();
                }
            } catch (logInfo) {
                //TODO handle the exception
                await clearData();
                log({
                    logInfo,
                    logMake: '上传数据失败'
                });

            }
        });
    }

    setMaxRequesLength(maxRequesGatewayLength: Number = 10) {
        this.maxRequesGatewayLength = maxRequesGatewayLength;
    }
    /**
     * 设置是用户信息
     */
    setUserInfo(userInfo: any): void {
        this.userInfo = userInfo;
    }

    /**
     * 设置请求url 用于请求开关
     */
    setUrl(url: string): void {
        this.url = url;
    }

    /**
     * 设置网络请求 数据字段
     */
    setRequesKey(requesKey: string): void {
        this.requesKey = requesKey;
    }

    /**
     * 设置项目名
     */
    setPackageName(projectName: String): void {
        this.projectName = projectName;
    }

}

export default Data;
