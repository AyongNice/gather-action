// 小程序智能自动绑定演示页面
// 注意：这个页面完全没有埋点相关代码，但埋点会自动工作！

Page({
    data: {
        // 商品详情数据
        detailList: [
            { id: 1, label: '品牌', value: '知名品牌' },
            { id: 2, label: '型号', value: 'Premium 版' },
            { id: 3, label: '颜色', value: '经典黑' },
            { id: 4, label: '尺寸', value: '标准尺寸' },
            { id: 5, label: '材质', value: '优质材料' },
            { id: 6, label: '保修', value: '一年保修' }
        ],

        // 推荐商品数据
        recommendList: [
            { 
                id: 1, 
                name: '推荐商品1', 
                price: 199, 
                image: '/images/recommend1.jpg' 
            },
            { 
                id: 2, 
                name: '推荐商品2', 
                price: 299, 
                image: '/images/recommend2.jpg' 
            },
            { 
                id: 3, 
                name: '推荐商品3', 
                price: 399, 
                image: '/images/recommend3.jpg' 
            },
            { 
                id: 4, 
                name: '推荐商品4', 
                price: 499, 
                image: '/images/recommend4.jpg' 
            }
        ],

        // 用户评价数据
        reviewList: [
            {
                id: 1,
                userName: '用户A',
                avatar: '/images/avatar1.jpg',
                rating: [1, 1, 1, 1, 1], // 5星
                content: '商品质量很好，物流很快，非常满意！'
            },
            {
                id: 2,
                userName: '用户B',
                avatar: '/images/avatar2.jpg',
                rating: [1, 1, 1, 1, 0], // 4星
                content: '性价比不错，推荐购买。'
            },
            {
                id: 3,
                userName: '用户C',
                avatar: '/images/avatar3.jpg',
                rating: [1, 1, 1, 1, 1], // 5星
                content: '超出预期，会回购的！'
            }
        ],

        // 购物车数量
        cartCount: 0
    },

    /**
     * 页面加载
     */
    onLoad(options) {
        console.log('页面加载，参数:', options);
        
        // 只需要写业务逻辑，埋点会自动工作
        this.initPageData();
        this.loadUserData();
    },

    /**
     * 页面显示
     */
    onShow() {
        console.log('页面显示');
        
        // 更新购物车数量
        this.updateCartCount();
    },

    /**
     * 页面就绪
     */
    onReady() {
        console.log('页面渲染完成');
        
        // 智能自动绑定系统会在这个时候自动扫描页面元素
        // 并为配置中的元素自动绑定点击事件
        // 开发者无需关心埋点逻辑
    },

    /**
     * 初始化页面数据
     */
    initPageData() {
        // 模拟加载商品数据
        console.log('初始化页面数据');
        
        // 可以在这里调用 API 获取真实数据
        // this.loadProductDetail();
        // this.loadRecommendProducts();
        // this.loadUserReviews();
    },

    /**
     * 加载用户数据
     */
    loadUserData() {
        // 模拟加载用户相关数据
        console.log('加载用户数据');
        
        // 获取用户购物车数量
        this.setData({
            cartCount: this.getCartCount()
        });
    },

    /**
     * 更新购物车数量
     */
    updateCartCount() {
        const count = this.getCartCount();
        this.setData({
            cartCount: count
        });
    },

    /**
     * 获取购物车数量（模拟）
     */
    getCartCount() {
        // 这里可以从本地存储或服务器获取真实的购物车数量
        return Math.floor(Math.random() * 10);
    },

    /**
     * 页面分享
     */
    onShareAppMessage() {
        return {
            title: '精选商品推荐',
            path: '/pages/demo/demo',
            imageUrl: '/images/share-image.jpg'
        };
    },

    /**
     * 页面分享到朋友圈
     */
    onShareTimeline() {
        return {
            title: '精选商品推荐',
            imageUrl: '/images/share-image.jpg'
        };
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        console.log('下拉刷新');
        
        // 重新加载数据
        this.initPageData();
        
        // 停止下拉刷新
        setTimeout(() => {
            wx.stopPullDownRefresh();
        }, 1000);
    },

    /**
     * 上拉加载更多
     */
    onReachBottom() {
        console.log('上拉加载更多');
        
        // 加载更多推荐商品
        this.loadMoreRecommends();
    },

    /**
     * 加载更多推荐商品
     */
    loadMoreRecommends() {
        // 模拟加载更多数据
        const moreProducts = [
            { 
                id: Date.now(), 
                name: '新推荐商品', 
                price: 599, 
                image: '/images/new-recommend.jpg' 
            }
        ];

        this.setData({
            recommendList: [...this.data.recommendList, ...moreProducts]
        });
    },

    /**
     * 页面滚动
     */
    onPageScroll(e) {
        // 可以在这里处理滚动相关的业务逻辑
        // 比如显示/隐藏返回顶部按钮
        const scrollTop = e.scrollTop;
        
        if (scrollTop > 500) {
            // 显示返回顶部按钮
        } else {
            // 隐藏返回顶部按钮
        }
    }

    // 注意：这个页面完全没有任何埋点相关的方法！
    // 
    // 传统方式需要写的埋点代码：
    // handleBuyClick(e) { monitoInit.handleGlobalClick(e); },
    // handleCartClick(e) { monitoInit.handleGlobalClick(e); },
    // handleShareClick(e) { monitoInit.handleGlobalClick(e); },
    // handleFavoriteClick(e) { monitoInit.handleGlobalClick(e); },
    // handleServiceClick(e) { monitoInit.handleGlobalClick(e); },
    // handleDetailClick(e) { monitoInit.handleGlobalClick(e); },
    // handleRecommendClick(e) { monitoInit.handleGlobalClick(e); },
    // handleReviewClick(e) { monitoInit.handleGlobalClick(e); },
    // handleNavClick(e) { monitoInit.handleGlobalClick(e); },
    // handleFloatClick(e) { monitoInit.handleGlobalClick(e); },
    // ... 还有更多
    //
    // 现在这些都不需要了！智能自动绑定系统会自动处理所有埋点逻辑
    //
    // 开发者只需要：
    // 1. 在 app.js 中初始化埋点组件
    // 2. 在模板中为需要埋点的元素添加 data-text 或 data-src 属性
    // 3. 专注于业务逻辑开发
    //
    // 埋点数据会自动收集并上传，包括：
    // - 用户点击了哪个按钮/元素
    // - 点击时间
    // - 页面路径
    // - 用户信息
    // - 设备信息
    // - 等等...
});

/*
智能自动绑定的工作流程：

1. 页面加载时，系统自动劫持 Page() 构造函数
2. 在 onReady 生命周期中，自动扫描页面元素
3. 查找带有 data-text 或 data-src 属性的元素
4. 与配置列表进行匹配
5. 为匹配的元素自动创建点击事件处理器
6. 用户点击时，自动触发埋点数据收集
7. 数据自动上传到服务器

这个过程完全透明，开发者无需关心任何埋点细节！
*/
