// 微信小程序使用示例
import MonitoInit from '../init/index';

// 初始化埋点组件
const monitoInit = new MonitoInit();

// 配置参数
const initParams = {
    projectName: 'my-miniprogram',
    frameType: 'miniprogram',
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
        }
    ],
    globaMonitoImgList: [
        {
            imgSrc: 'product-banner.jpg'
        }
    ]
};

// 初始化（异步）
monitoInit.eventInit(initParams).then(() => {
    console.log('埋点组件初始化完成');
}).catch(error => {
    console.error('埋点组件初始化失败:', error);
});

// 页面示例
Page({
    data: {
        // 页面数据
    },

    onLoad() {
        console.log('页面加载');
    },

    // 全局点击事件处理
    handleGlobalClick(e) {
        // 调用埋点组件的点击处理方法
        monitoInit.handleGlobalClick(e);
    },

    // 具体的点击事件
    onBuyClick(e) {
        // 先处理业务逻辑
        console.log('用户点击购买');
        
        // 然后调用埋点
        this.handleGlobalClick(e);
    },

    onAddToCartClick(e) {
        console.log('用户点击加入购物车');
        this.handleGlobalClick(e);
    },

    // 图片点击事件
    onImageClick(e) {
        console.log('用户点击图片');
        this.handleGlobalClick(e);
    }
});

// 导出供其他页面使用
export { monitoInit };
