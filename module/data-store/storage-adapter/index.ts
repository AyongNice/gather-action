// 存储适配器 - 兼容多环境
import { log } from '../../log-output';

// 环境检测
class EnvironmentDetector {
    static isWeb(): boolean {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }
    
    static isMiniProgram(): boolean {
        return typeof (globalThis as any).wx !== 'undefined' || 
               typeof (globalThis as any).my !== 'undefined' || 
               typeof (globalThis as any).swan !== 'undefined' || 
               typeof (globalThis as any).tt !== 'undefined';
    }
    
    static isUniApp(): boolean {
        return typeof (globalThis as any).uni !== 'undefined';
    }
}

// 存储接口
export interface StorageAdapter {
    init(dbName: string): Promise<void>;
    add(data: any): Promise<void>;
    getAll(): Promise<any[]>;
    getCount(): Promise<number>;
    clear(): Promise<void>;
}

// Web 环境 - IndexedDB 实现
class WebStorageAdapter implements StorageAdapter {
    private dbName: string = '';
    private storeName: string = 'monito';
    
    async init(dbName: string): Promise<void> {
        this.dbName = dbName;
        // 使用原有的 IndexedDB 逻辑
        const { createDB } = await import('../data/db');
        await createDB(dbName, '1', [
            {
                storeName: this.storeName,
                option: { keyPath: 'id' },
                index: [
                    { name: 'id', keyPath: 'id', unique: true },
                    { name: 'elementText', keyPath: 'elementText', unique: false },
                    { name: 'pageUrl', keyPath: 'pageUrl', unique: false },
                    { name: 'actionType', keyPath: 'actionType', unique: false }
                ]
            }
        ]);
    }
    
    async add(data: any): Promise<void> {
        const { onDBSelect } = await import('../data/db');
        return new Promise((resolve, reject) => {
            onDBSelect(this.storeName, '1', async ({ add }) => {
                try {
                    await add({
                        id: data.id || data?.entetTim || new Date().getTime().toString(),
                        elementText: data?.elementText,
                        actionType: data?.actionType,
                        pageUrl: data?.pageUrl,
                        value: JSON.stringify(data)
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
    
    async getAll(): Promise<any[]> {
        const { getAll } = await import('../data/db');
        const data = await getAll(this.storeName);
        return data.map((item: any) => JSON.parse(item.value));
    }
    
    async getCount(): Promise<number> {
        const { getCount } = await import('../data/db');
        return await getCount(this.storeName);
    }
    
    async clear(): Promise<void> {
        const { clear } = await import('../data/db');
        await clear(this.storeName);
    }
}

// 小程序环境 - 本地存储实现
class MiniProgramStorageAdapter implements StorageAdapter {
    private storageKey: string = '';
    
    async init(dbName: string): Promise<void> {
        this.storageKey = `monito_${dbName}`;
    }
    
    async add(data: any): Promise<void> {
        try {
            const allData = await this.getAll();
            const newItem = {
                id: data.id || data?.entetTim || new Date().getTime().toString(),
                elementText: data?.elementText,
                actionType: data?.actionType,
                pageUrl: data?.pageUrl,
                value: JSON.stringify(data),
                timestamp: new Date().getTime()
            };
            allData.push(newItem);
            
            if (EnvironmentDetector.isUniApp()) {
                // UniApp 环境
                (globalThis as any).uni.setStorageSync(this.storageKey, JSON.stringify(allData));
            } else {
                // 原生小程序环境
                const storage = this.getStorageAPI();
                storage.setStorageSync(this.storageKey, JSON.stringify(allData));
            }
        } catch (error) {
            log({
                logMake: '小程序存储失败',
                logInfo: error
            });
            throw error;
        }
    }
    
    async getAll(): Promise<any[]> {
        try {
            let dataStr = '';
            if (EnvironmentDetector.isUniApp()) {
                dataStr = (globalThis as any).uni.getStorageSync(this.storageKey) || '[]';
            } else {
                const storage = this.getStorageAPI();
                dataStr = storage.getStorageSync(this.storageKey) || '[]';
            }
            
            const allData = JSON.parse(dataStr);
            return allData.map((item: any) => JSON.parse(item.value));
        } catch (error) {
            log({
                logMake: '小程序读取数据失败',
                logInfo: error
            });
            return [];
        }
    }
    
    async getCount(): Promise<number> {
        const allData = await this.getAll();
        return allData.length;
    }
    
    async clear(): Promise<void> {
        try {
            if (EnvironmentDetector.isUniApp()) {
                (globalThis as any).uni.removeStorageSync(this.storageKey);
            } else {
                const storage = this.getStorageAPI();
                storage.removeStorageSync(this.storageKey);
            }
        } catch (error) {
            log({
                logMake: '小程序清除数据失败',
                logInfo: error
            });
        }
    }
    
    private getStorageAPI() {
        // 根据不同小程序平台返回对应的存储 API
        if (typeof (globalThis as any).wx !== 'undefined') {
            return (globalThis as any).wx;
        } else if (typeof (globalThis as any).my !== 'undefined') {
            return (globalThis as any).my;
        } else if (typeof (globalThis as any).swan !== 'undefined') {
            return (globalThis as any).swan;
        } else if (typeof (globalThis as any).tt !== 'undefined') {
            return (globalThis as any).tt;
        }
        throw new Error('未知的小程序环境');
    }
}

// 事件系统适配器
export class EventAdapter {
    private listeners: { [key: string]: Function[] } = {};
    
    // 兼容的事件派发
    dispatchEvent(eventName: string, detail?: any) {
        if (EnvironmentDetector.isWeb()) {
            // Web 环境使用 CustomEvent
            const event = new CustomEvent(eventName, { detail });
            window.dispatchEvent(event);
        } else {
            // 小程序环境使用自定义事件系统
            const listeners = this.listeners[eventName] || [];
            listeners.forEach(listener => {
                try {
                    listener({ detail });
                } catch (error) {
                    log({
                        logMake: '事件处理失败',
                        logInfo: error
                    });
                }
            });
        }
    }
    
    // 兼容的事件监听
    addEventListener(eventName: string, listener: Function) {
        if (EnvironmentDetector.isWeb()) {
            // Web 环境
            window.addEventListener(eventName, listener as EventListener);
        } else {
            // 小程序环境
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = [];
            }
            this.listeners[eventName].push(listener);
        }
    }
    
    // 移除事件监听
    removeEventListener(eventName: string, listener: Function) {
        if (EnvironmentDetector.isWeb()) {
            window.removeEventListener(eventName, listener as EventListener);
        } else {
            const listeners = this.listeners[eventName];
            if (listeners) {
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }
    }
}

// 存储适配器工厂
export class StorageAdapterFactory {
    static create(): StorageAdapter {
        if (EnvironmentDetector.isWeb()) {
            return new WebStorageAdapter();
        } else {
            return new MiniProgramStorageAdapter();
        }
    }
}

// 全局事件适配器实例
export const eventAdapter = new EventAdapter();
