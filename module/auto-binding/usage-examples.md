# 小程序智能自动绑定使用指南

## 🚀 **智能自动绑定特性**

现在您的埋点组件支持在小程序环境中**完全自动**绑定事件，无需手动在模板中添加点击事件！

## ✨ **自动绑定原理**

### 1. 构造函数劫持
- **Page 劫持**：自动劫持 `Page()` 构造函数，为每个页面注入埋点方法
- **Component 劫持**：自动劫持 `Component()` 构造函数，为每个组件注入埋点方法
- **生命周期注入**：在 `onLoad`、`onReady` 等生命周期中自动执行绑定逻辑

### 2. 元素自动扫描
- **智能识别**：自动扫描页面中的 `button`、`image`、`view` 等可点击元素
- **配置匹配**：根据元素的 `data-text` 和 `data-src` 属性与配置列表匹配
- **动态绑定**：为匹配的元素自动创建点击事件处理器

### 3. 全局事件代理
- **页面监控**：监控页面跳转和组件加载
- **自动注入**：为新页面和组件自动注入埋点方法
- **实时绑定**：页面渲染完成后立即执行自动绑定

## 📱 **使用方式**

### 微信小程序 - 零配置使用

```javascript
// app.js - 应用启动时初始化
import MonitoInit from './utils/monito';

const monitoInit = new MonitoInit();

App({
    async onLaunch() {
        // 一次性初始化，全局生效
        await monitoInit.eventInit({
            projectName: 'my-miniprogram',
            frameType: 'miniprogram',
            globaMonitoConfigList: [
                { elementText: '立即购买', actionType: 'purchase' },
                { elementText: '加入购物车', actionType: 'add_to_cart' },
                { elementText: '分享', actionType: 'share' }
            ],
            globaMonitoImgList: [
                { imgSrc: 'product-banner.jpg' },
                { imgSrc: 'ad-banner.jpg' }
            ]
        });
        
        console.log('埋点组件已启动，所有页面将自动支持埋点');
    }
});
```

```javascript
// pages/index/index.js - 页面代码，无需任何埋点相关代码
Page({
    data: {
        productList: []
    },

    onLoad() {
        // 只需要写业务逻辑，埋点会自动工作
        this.loadProducts();
    },

    loadProducts() {
        // 业务逻辑
    },

    // 无需添加任何埋点相关的方法！
    // 自动绑定系统会处理一切
});
```

```xml
<!-- pages/index/index.wxml - 模板中只需要添加 data 属性 -->
<view class="container">
    <!-- 按钮埋点 - 只需要 data-text 属性 -->
    <button class="buy-btn" data-text="立即购买">
        立即购买
    </button>
    
    <button class="cart-btn" data-text="加入购物车">
        加入购物车
    </button>
    
    <!-- 图片埋点 - 只需要 data-src 属性 -->
    <image src="/images/product.jpg" data-src="product-banner.jpg" />
    
    <!-- 文本埋点 -->
    <text data-text="分享">分享给朋友</text>
    
    <!-- 列表埋点 -->
    <view wx:for="{{productList}}" wx:key="id">
        <view data-text="商品详情">
            {{item.name}}
        </view>
    </view>
</view>
```

### UniApp - 零配置使用

```javascript
// main.js - 应用启动时初始化
import MonitoInit from './utils/monito';

const monitoInit = new MonitoInit();

// 全局初始化
monitoInit.eventInit({
    projectName: 'my-uniapp',
    frameType: 'uniapp',
    globaMonitoConfigList: [
        { elementText: '立即购买', actionType: 'purchase' },
        { elementText: '加入购物车', actionType: 'add_to_cart' }
    ]
}).then(() => {
    console.log('UniApp 埋点组件已启动');
});
```

```vue
<!-- pages/index/index.vue - 页面代码 -->
<template>
    <view class="container">
        <!-- 只需要添加 data 属性，无需绑定事件 -->
        <button :data-text="'立即购买'" class="buy-btn">
            立即购买
        </button>
        
        <button :data-text="'加入购物车'" class="cart-btn">
            加入购物车
        </button>
        
        <image :src="productImage" :data-src="'product-banner.jpg'" />
        
        <view v-for="item in productList" :key="item.id">
            <view :data-text="'商品详情'">
                {{ item.name }}
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            productImage: '/static/product.jpg',
            productList: []
        }
    },

    onLoad() {
        // 只需要写业务逻辑
        this.loadProducts();
    },

    methods: {
        loadProducts() {
            // 业务逻辑
        }
        
        // 无需添加任何埋点相关的方法！
    }
}
</script>
```

## 🎯 **自动绑定的优势**

### 1. 零侵入性
- **无需修改现有代码**：只需要在模板中添加 `data-*` 属性
- **无需手动绑定事件**：系统自动处理所有点击事件
- **无需在每个页面写埋点代码**：一次初始化，全局生效

### 2. 智能识别
- **自动扫描元素**：页面渲染完成后自动扫描可点击元素
- **配置匹配**：根据配置列表自动匹配需要埋点的元素
- **动态绑定**：为匹配的元素动态创建事件处理器

### 3. 高性能
- **按需绑定**：只为配置中的元素绑定事件
- **延迟执行**：页面渲染完成后再执行绑定，不影响页面性能
- **内存优化**：自动清理不再需要的事件处理器

## 🔧 **高级配置**

### 1. 自定义扫描规则
```javascript
// 可以通过配置自定义扫描的元素类型
await monitoInit.eventInit({
    // ... 其他配置
    autoBinding: {
        scanSelectors: ['button', 'image', 'view[data-text]', '.clickable'],
        scanInterval: 100, // 扫描间隔
        enableAutoScan: true // 是否启用自动扫描
    }
});
```

### 2. 调试模式
```javascript
// 开启调试模式，查看自动绑定过程
await monitoInit.eventInit({
    // ... 其他配置
    debug: true // 开启调试日志
});
```

## 📊 **效果对比**

### 传统方式（需要手动绑定）
```xml
<!-- 每个元素都需要手动绑定 -->
<button bindtap="handleBuyClick" data-text="立即购买">立即购买</button>
<button bindtap="handleCartClick" data-text="加入购物车">加入购物车</button>
```

```javascript
// 每个页面都需要写埋点代码
Page({
    handleBuyClick(e) {
        monitoInit.handleGlobalClick(e);
        // 业务逻辑
    },
    
    handleCartClick(e) {
        monitoInit.handleGlobalClick(e);
        // 业务逻辑
    }
});
```

### 智能自动绑定（零配置）
```xml
<!-- 只需要 data 属性，无需绑定事件 -->
<button data-text="立即购买">立即购买</button>
<button data-text="加入购物车">加入购物车</button>
```

```javascript
// 页面代码完全专注于业务逻辑
Page({
    onLoad() {
        // 只写业务逻辑，埋点自动工作
    }
});
```

## 🎉 **总结**

智能自动绑定让小程序埋点变得前所未有的简单：

1. **一次配置，全局生效**
2. **零侵入，无需修改现有代码**
3. **智能识别，自动绑定事件**
4. **高性能，按需绑定**

现在您可以专注于业务逻辑开发，埋点系统会自动处理所有用户行为数据收集！
