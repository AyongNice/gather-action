import Http from '../../report';
import {log} from '../../log-output';
import { StorageAdapterFactory, StorageAdapter, eventAdapter } from '../storage-adapter';

class Data {
    private projectName: String = '';
    private userInfo: { userCode: string } = {userCode:''};
    private url: string = '';
    private http: Http;
    private maxRequesGatewayLength: Number = 10;//最大存储量，达到立刻上传数据
    private storageAdapter: StorageAdapter;

    constructor() {
        this.http = new Http();
        this.storageAdapter = StorageAdapterFactory.create();
    }

    async DBinit() {
        try {
            const dbName = this.projectName + this.userInfo.userCode;
            await this.storageAdapter.init(dbName);
            
            // 派发初始化完成事件
            eventAdapter.dispatchEvent('monito', {
                getAllData: () => this.getAllData(),
                getCountData: () => this.getCountData(),
                clearData: () => this.clearData()
            });
        } catch (error) {
            log({
                logMake: '数据库初始化失败',
                logInfo: error
            });
        }
    }

    // 获取所有数据
    async getAllData(): Promise<any[]> {
        try {
            return await this.storageAdapter.getAll();
        } catch (error) {
            log({
                logMake: '获取数据错误',
                logInfo: error
            });
            return [];
        }
    }

    // 获取数据条数
    async getCountData(): Promise<number> {
        try {
            return await this.storageAdapter.getCount();
        } catch (error) {
            log({
                logMake: '获取数据条数错误',
                logInfo: error
            });
            return 0;
        }
    }

    // 清除数据
    async clearData(): Promise<void> {
        try {
            await this.storageAdapter.clear();
        } catch (error) {
            log({
                logMake: '清除数据错误',
                logInfo: error
            });
        }
    }

    /**
     * 埋点数据存储
     * @param {string} storage.id 数据key
     * @param {Object} storage.info 数据
     */
    async storageData(data: any) {
        try {
            // 使用存储适配器存储数据
            await this.storageAdapter.add(data);
            
            // 派发数据存储事件
            eventAdapter.dispatchEvent('monito', {
                getAllData: () => this.getAllData(),
                getCountData: () => this.getCountData(),
                clearData: () => this.clearData()
            });

            // 检查是否需要上传数据
            const count = await this.getCountData();
            if (this.url && count > Number(this.maxRequesGatewayLength)) {
                const allData = await this.getAllData();
                // 直接发送数组格式的数据，而不是包装在对象中
                const logInfo = await Http.httpRequestPost(allData);
                log({
                    logInfo,
                    logMake: '上传数据成功'
                });
                await this.clearData();
            }
        } catch (logInfo) {
            // 上传失败时清除数据
            await this.clearData();
            log({
                logInfo,
                logMake: '存储或上传数据失败'
            });
        }
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
     * 设置项目名
     */
    setPackageName(projectName: String): void {
        this.projectName = projectName;
    }
}

export default Data;
