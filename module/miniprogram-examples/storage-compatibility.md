# 小程序存储兼容性解决方案

## 🚨 **解决的问题**

1. **CustomEvent 不支持**：小程序环境没有 `CustomEvent` API
2. **IndexedDB 不支持**：小程序环境没有 IndexedDB，需要使用小程序的存储 API

## ✅ **解决方案**

### 1. 存储适配器模式

创建了统一的存储接口，根据环境自动选择合适的存储方式：

```typescript
// Web 环境：使用 IndexedDB
class WebStorageAdapter implements StorageAdapter {
    // 使用原有的 IndexedDB 逻辑
}

// 小程序环境：使用本地存储
class MiniProgramStorageAdapter implements StorageAdapter {
    // 使用 wx.setStorageSync / uni.setStorageSync
}
```

### 2. 事件系统适配

替换 `CustomEvent` 为兼容的事件系统：

```typescript
class EventAdapter {
    // Web 环境：使用 CustomEvent
    // 小程序环境：使用自定义事件系统
}
```

## 📱 **小程序存储方案**

### 微信小程序
```javascript
// 存储数据
wx.setStorageSync('monito_data', JSON.stringify(data));

// 读取数据
const data = wx.getStorageSync('monito_data');

// 清除数据
wx.removeStorageSync('monito_data');
```

### UniApp
```javascript
// 存储数据
uni.setStorageSync('monito_data', JSON.stringify(data));

// 读取数据
const data = uni.getStorageSync('monito_data');

// 清除数据
uni.removeStorageSync('monito_data');
```

## 🔧 **使用方式**

### 1. 自动适配
```typescript
import { StorageAdapterFactory } from '../storage-adapter';

// 自动根据环境选择存储方式
const storageAdapter = StorageAdapterFactory.create();
await storageAdapter.init('myProject');
```

### 2. 事件处理
```typescript
import { eventAdapter } from '../storage-adapter';

// 兼容的事件派发
eventAdapter.dispatchEvent('monito', { data: 'test' });

// 兼容的事件监听
eventAdapter.addEventListener('monito', (event) => {
    console.log('收到事件:', event.detail);
});
```

## 📊 **存储对比**

| 环境 | 存储方式 | 容量限制 | 持久化 | 性能 |
|------|----------|----------|--------|------|
| Web | IndexedDB | 几GB | 是 | 高 |
| 微信小程序 | Storage API | 10MB | 是 | 中 |
| UniApp | Storage API | 10MB | 是 | 中 |

## ⚠️ **注意事项**

### 1. 存储容量限制
- **小程序**：单个 key 最大 1MB，总容量约 10MB
- **建议**：及时上传数据，避免存储过多本地数据

### 2. 数据格式
- 小程序存储只支持字符串，需要 JSON 序列化
- 自动处理序列化和反序列化

### 3. 错误处理
```typescript
try {
    await storageAdapter.add(data);
} catch (error) {
    // 存储失败处理
    console.error('存储失败:', error);
}
```

## 🎯 **最佳实践**

### 1. 数据压缩
```typescript
// 对于大量数据，考虑压缩
const compressedData = JSON.stringify(data);
```

### 2. 分批存储
```typescript
// 避免单次存储过大数据
const batchSize = 50;
const batches = chunk(dataArray, batchSize);
```

### 3. 定期清理
```typescript
// 定期清理过期数据
const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
const now = Date.now();
const filteredData = data.filter(item => 
    now - item.timestamp < maxAge
);
```

## 🚀 **性能优化**

### 1. 异步操作
```typescript
// 所有存储操作都是异步的
await storageAdapter.add(data);
```

### 2. 批量操作
```typescript
// 批量添加数据
const promises = dataArray.map(item => storageAdapter.add(item));
await Promise.all(promises);
```

### 3. 缓存策略
```typescript
// 内存缓存减少存储读取
class CachedStorageAdapter {
    private cache = new Map();
    
    async get(key: string) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const data = await this.storage.get(key);
        this.cache.set(key, data);
        return data;
    }
}
```

这个兼容方案确保了埋点组件在所有环境下都能正常工作，同时保持了数据的完整性和一致性。
