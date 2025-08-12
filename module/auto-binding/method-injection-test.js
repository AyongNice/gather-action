// 方法注入测试页面
// 用于验证 globalClick 等方法是否正确注入

Page({
    data: {
        testResults: [],
        injectionStatus: '检测中...'
    },

    onLoad() {
        console.log('=== 方法注入测试页面加载 ===');
        
        // 立即检查方法是否存在
        this.checkMethodInjection();
    },

    onReady() {
        console.log('=== 页面渲染完成，再次检查方法注入 ===');
        
        // 页面渲染完成后再次检查
        setTimeout(() => {
            this.checkMethodInjection();
            this.updateTestResults();
        }, 100);
    },

    /**
     * 检查方法注入情况
     */
    checkMethodInjection() {
        const methods = ['globalClick', 'autoTrack', 'handleAnyClick'];
        const results = [];
        
        console.log('检查方法注入情况:');
        
        methods.forEach(methodName => {
            const exists = typeof this[methodName] === 'function';
            const result = {
                method: methodName,
                exists: exists,
                type: typeof this[methodName]
            };
            
            results.push(result);
            console.log(`- ${methodName}: ${exists ? '✅ 存在' : '❌ 不存在'} (${typeof this[methodName]})`);
        });

        // 检查页面实例上的所有方法
        console.log('页面实例上的所有方法:');
        Object.getOwnPropertyNames(this).forEach(prop => {
            if (typeof this[prop] === 'function') {
                console.log(`- ${prop}: function`);
            }
        });

        this.setData({
            testResults: results,
            injectionStatus: results.every(r => r.exists) ? '✅ 注入成功' : '❌ 注入失败'
        });

        return results;
    },

    /**
     * 更新测试结果
     */
    updateTestResults() {
        const results = this.checkMethodInjection();
        
        // 如果方法没有注入，尝试手动创建
        if (!results.every(r => r.exists)) {
            console.warn('检测到方法注入失败，尝试手动创建备用方法');
            this.createBackupMethods();
        }
    },

    /**
     * 创建备用方法
     */
    createBackupMethods() {
        console.log('创建备用方法...');

        // 创建 globalClick 备用方法
        if (typeof this.globalClick !== 'function') {
            this.globalClick = (evt) => {
                console.log('备用 globalClick 方法触发', evt);
                this.handleBackupClick(evt, 'globalClick');
            };
            console.log('✅ 创建备用 globalClick 方法');
        }

        // 创建 autoTrack 备用方法
        if (typeof this.autoTrack !== 'function') {
            this.autoTrack = (evt) => {
                console.log('备用 autoTrack 方法触发', evt);
                this.handleBackupClick(evt, 'autoTrack');
            };
            console.log('✅ 创建备用 autoTrack 方法');
        }

        // 创建 handleAnyClick 备用方法
        if (typeof this.handleAnyClick !== 'function') {
            this.handleAnyClick = (evt) => {
                console.log('备用 handleAnyClick 方法触发', evt);
                this.handleBackupClick(evt, 'handleAnyClick');
            };
            console.log('✅ 创建备用 handleAnyClick 方法');
        }

        // 重新检查
        setTimeout(() => {
            this.checkMethodInjection();
        }, 100);
    },

    /**
     * 备用点击处理
     */
    handleBackupClick(evt, methodName) {
        const target = evt.target || evt.currentTarget;
        const dataset = target.dataset || {};
        
        console.log(`${methodName} 处理点击:`, {
            dataset: dataset,
            target: target,
            event: evt
        });

        // 显示点击信息
        wx.showToast({
            title: `${methodName} 触发`,
            icon: 'success'
        });

        // 模拟埋点处理
        if (dataset.text || dataset.src || dataset.track) {
            console.log('模拟埋点数据:', {
                elementText: dataset.text,
                imgSrc: dataset.src,
                trackType: dataset.track,
                method: methodName,
                timestamp: new Date().getTime()
            });
        }
    },

    /**
     * 测试按钮点击
     */
    testButtonClick(evt) {
        console.log('测试按钮点击', evt);
        
        wx.showModal({
            title: '测试结果',
            content: `测试按钮点击成功！\n方法注入状态: ${this.data.injectionStatus}`,
            showCancel: false
        });
    },

    /**
     * 重新检测
     */
    recheck() {
        console.log('重新检测方法注入...');
        this.checkMethodInjection();
        
        wx.showToast({
            title: '重新检测完成',
            icon: 'success'
        });
    },

    /**
     * 显示详细信息
     */
    showDetails() {
        const details = {
            页面路径: this.route,
            注入状态: this.data.injectionStatus,
            测试结果: this.data.testResults,
            页面方法: Object.getOwnPropertyNames(this).filter(prop => 
                typeof this[prop] === 'function'
            ),
            检测时间: new Date().toLocaleString()
        };

        console.log('详细信息:', details);
        
        wx.showModal({
            title: '详细信息',
            content: JSON.stringify(details, null, 2),
            showCancel: false
        });
    }
});

/*
使用说明：

1. 将此页面添加到您的小程序项目中
2. 确保埋点组件已在 app.js 中初始化
3. 打开此页面查看方法注入情况
4. 如果显示"注入成功"，说明全局事件系统正常工作
5. 如果显示"注入失败"，会自动创建备用方法

测试步骤：
1. 查看控制台日志，确认方法注入情况
2. 点击测试按钮，验证方法是否正常工作
3. 如果有问题，点击"重新检测"按钮
4. 点击"显示详细信息"查看完整的检测结果

预期结果：
- globalClick: ✅ 存在 (function)
- autoTrack: ✅ 存在 (function)  
- handleAnyClick: ✅ 存在 (function)
- 注入状态: ✅ 注入成功
*/
