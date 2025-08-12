<template>
  <view class="container">
    <!-- 商品图片 -->
    <image 
      :src="productImage" 
      :data-src="'product-banner.jpg'"
      :data-text="'商品图片'"
      @click="onImageClick"
      class="product-image"
    />

    <!-- 商品信息 -->
    <view class="product-info">
      <text class="product-title">{{ productTitle }}</text>
      <text class="product-price">¥{{ productPrice }}</text>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button 
        class="buy-btn" 
        :data-text="'立即购买'"
        @click="onBuyClick"
      >
        立即购买
      </button>
      
      <button 
        class="cart-btn" 
        :data-text="'加入购物车'"
        @click="onAddToCartClick"
      >
        加入购物车
      </button>
    </view>

    <!-- 其他可点击元素 -->
    <view class="other-actions">
      <text 
        class="share-text" 
        :data-text="'分享商品'"
        @click="handleGlobalClick"
      >
        分享给朋友
      </text>
      
      <text 
        class="favorite-text" 
        :data-text="'收藏商品'"
        @click="handleGlobalClick"
      >
        收藏
      </text>
    </view>

    <!-- 商品详情列表 -->
    <view class="product-details">
      <view 
        v-for="(item, index) in detailList" 
        :key="index"
        class="detail-item"
        :data-text="item.title"
        @click="handleGlobalClick"
      >
        <text>{{ item.title }}: {{ item.value }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import MonitoInit from '../init/index';

// 初始化埋点组件
const monitoInit = new MonitoInit();

// 配置参数
const initParams = {
  projectName: 'my-uniapp',
  frameType: 'uniapp',
  isPosition: false,
  userInfo: { userCode: 'user123' },
  reques: {
    requestUrl: 'https://api.example.com/track',
    maxRequesGatewayLength: 10
  },
  globaMonitoConfigList: [
    {
      elementText: '立即购买',
      actionType: 'purchase'
    },
    {
      elementText: '加入购物车',
      actionType: 'add_to_cart'
    },
    {
      elementText: '分享商品',
      actionType: 'share'
    },
    {
      elementText: '收藏商品',
      actionType: 'favorite'
    }
  ],
  globaMonitoImgList: [
    {
      imgSrc: 'product-banner.jpg'
    }
  ]
};

export default {
  data() {
    return {
      productImage: '/static/images/product.jpg',
      productTitle: '精选商品',
      productPrice: 299,
      detailList: [
        { title: '品牌', value: '知名品牌' },
        { title: '规格', value: '标准版' },
        { title: '颜色', value: '经典黑' }
      ]
    }
  },

  async onLoad() {
    // 初始化埋点
    try {
      await monitoInit.eventInit(initParams);
      console.log('埋点组件初始化完成');
    } catch (error) {
      console.error('埋点组件初始化失败:', error);
    }
    console.log('页面加载');
  },

  methods: {
    // 全局点击事件处理
    handleGlobalClick(e) {
      // 调用埋点组件的点击处理方法
      monitoInit.handleGlobalClick(e);
    },

    // 具体的点击事件
    onBuyClick(e) {
      // 先处理业务逻辑
      console.log('用户点击购买');
      uni.showToast({
        title: '跳转到购买页面',
        icon: 'none'
      });
      
      // 然后调用埋点
      this.handleGlobalClick(e);
    },

    onAddToCartClick(e) {
      console.log('用户点击加入购物车');
      uni.showToast({
        title: '已加入购物车',
        icon: 'success'
      });
      this.handleGlobalClick(e);
    },

    // 图片点击事件
    onImageClick(e) {
      console.log('用户点击图片');
      // 可以显示大图等
      this.handleGlobalClick(e);
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
}

.product-image {
  width: 100%;
  height: 400rpx;
  border-radius: 10rpx;
}

.product-info {
  margin: 20rpx 0;
}

.product-title {
  font-size: 32rpx;
  font-weight: bold;
}

.product-price {
  font-size: 28rpx;
  color: #ff4444;
  margin-left: 20rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin: 30rpx 0;
}

.buy-btn, .cart-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
}

.buy-btn {
  background-color: #ff4444;
  color: white;
}

.cart-btn {
  background-color: #ffa500;
  color: white;
}

.other-actions {
  display: flex;
  justify-content: space-around;
  margin: 30rpx 0;
}

.share-text, .favorite-text {
  color: #666;
  font-size: 28rpx;
}

.product-details {
  margin-top: 30rpx;
}

.detail-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}
</style>
