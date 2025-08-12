# 小程序兼容性迁移指南

## 🔄 **主要变更**

### 1. 异步初始化
数据库初始化现在是异步的，需要使用 `await` 或 `.then()`：

```typescript
// 之前
monitoInit.eventInit(initParams);

// 现在
await monitoInit.eventInit(initParams);
// 或者
monitoInit.eventInit(initParams).then(() => {
    console.log('初始化完成');
});
```

### 2. 存储适配器
- **Web 环境**：继续使用 IndexedDB
- **小程序环境**：自动使用小程序存储 API

### 3. 事件系统
- **Web 环境**：继续使用 CustomEvent
- **小程序环境**：使用自定义事件系统

## 📱 **小程序使用方式**

### 微信小程序
```javascript
// pages/index/index.js
import MonitoInit from '../../utils/monito';

const monitoInit = new MonitoInit();

Page({
    async onLoad() {
        try {
            await monitoInit.eventInit({
                projectName: 'my-miniprogram',
                frameType: 'miniprogram',
                // ... 其他配置
            });
            console.log('埋点初始化成功');
        } catch (error) {
            console.error('埋点初始化失败:', error);
        }
    },

    // 全局点击处理
    handleGlobalClick(e) {
        monitoInit.handleGlobalClick(e);
    }
});
```

### UniApp
```vue
<script>
import MonitoInit from '@/utils/monito';

const monitoInit = new MonitoInit();

export default {
    async onLoad() {
        try {
            await monitoInit.eventInit({
                projectName: 'my-uniapp',
                frameType: 'uniapp',
                // ... 其他配置
            });
            console.log('埋点初始化成功');
        } catch (error) {
            console.error('埋点初始化失败:', error);
        }
    },

    methods: {
        handleGlobalClick(e) {
            monitoInit.handleGlobalClick(e);
        }
    }
}
</script>
```

## 🔧 **模板配置**

### 微信小程序 WXML
```xml
<!-- 按钮埋点 -->
<button 
    data-text="立即购买"
    bindtap="handleGlobalClick"
>
    立即购买
</button>

<!-- 图片埋点 -->
<image 
    src="{{imageUrl}}" 
    data-src="product-banner.jpg"
    bindtap="handleGlobalClick"
/>
```

### UniApp 模板
```vue
<template>
    <!-- 按钮埋点 -->
    <button 
        :data-text="'立即购买'"
        @click="handleGlobalClick"
    >
        立即购买
    </button>

    <!-- 图片埋点 -->
    <image 
        :src="imageUrl" 
        :data-src="'product-banner.jpg'"
        @click="handleGlobalClick"
    />
</template>
```

## ⚠️ **注意事项**

### 1. 存储限制
- 小程序存储限制约 10MB
- 建议及时上传数据，避免存储过多本地数据

### 2. 异步处理
- 所有初始化操作都是异步的
- 确保在初始化完成后再进行埋点操作

### 3. 事件绑定
- 小程序需要手动绑定点击事件
- 使用 `data-text` 和 `data-src` 属性传递埋点信息

## 🚀 **性能优化建议**

### 1. 批量上传
```typescript
// 设置较小的最大存储量，及时上传
monitoInit.eventInit({
    // ...
    reques: {
        maxRequesGatewayLength: 5, // 存储5条数据后自动上传
        requestUrl: 'https://api.example.com/track'
    }
});
```

### 2. 错误处理
```typescript
try {
    await monitoInit.eventInit(initParams);
} catch (error) {
    // 初始化失败的降级处理
    console.error('埋点初始化失败，使用降级方案');
}
```

### 3. 条件加载
```typescript
// 只在需要时初始化埋点
if (shouldTrack) {
    await monitoInit.eventInit(initParams);
}
```

## 🔍 **调试建议**

### 1. 开启日志
```typescript
// 在开发环境开启详细日志
const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
    console.log('埋点数据:', data);
}
```

### 2. 存储检查
```typescript
// 检查小程序存储使用情况
const storageInfo = wx.getStorageInfoSync();
console.log('存储使用情况:', storageInfo);
```

### 3. 网络状态
```typescript
// 检查网络状态，决定是否上传
wx.getNetworkType({
    success: (res) => {
        if (res.networkType !== 'none') {
            // 有网络时上传数据
        }
    }
});
```

这个迁移指南确保了您的埋点组件能够在所有环境下正常工作，同时保持了代码的一致性和可维护性。
