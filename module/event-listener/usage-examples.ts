import eventListener from './index';

// 使用示例

// 1. 基础用法 - 使用 requestIdleCallback 优化
const button = document.querySelector('#myButton') as HTMLButtonElement;
eventListener.addEventListener({
    element: button,
    type: 'click',
    handler: (evt) => {
        console.log('按钮被点击了', evt);
    },
    options: { capture: false }
});

// 2. 禁用 requestIdleCallback 优化（直接执行）
eventListener.addEventListener({
    element: button,
    type: 'mouseenter',
    handler: (evt) => {
        console.log('鼠标进入', evt);
    },
    useIdleCallback: false
});

// 3. 搜索输入框 - 保留所有输入事件用于用户行为分析
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
eventListener.addEventListener({
    element: searchInput,
    type: 'input',
    handler: (evt) => {
        const target = evt.target as HTMLInputElement;
        console.log('用户输入:', target.value);
        // 记录每次输入行为，用于分析用户搜索习惯
    },
    useIdleCallback: true // 使用空闲时间处理，不丢失任何输入事件
});

// 4. 使用节流优化 - 适用于滚动事件
eventListener.addEventListener({
    element: window,
    type: 'scroll',
    handler: (evt) => {
        console.log('页面滚动', window.scrollY);
        // 执行滚动相关逻辑
    },
    throttleDelay: 100 // 100ms 节流
});

// 5. 复杂配置示例 - 触摸事件
const touchArea = document.querySelector('#touchArea') as HTMLDivElement;
eventListener.addEventListener({
    element: touchArea,
    type: 'touchmove',
    handler: (evt) => {
        evt.preventDefault();
        console.log('触摸移动', evt.touches[0]);
    },
    options: { 
        passive: false,
        capture: true 
    },
    throttleDelay: 16 // 约 60fps
});

// 6. 高频事件优化 - 鼠标移动
eventListener.addEventListener({
    element: document,
    type: 'mousemove',
    handler: (evt) => {
        console.log('鼠标位置:', evt.clientX, evt.clientY);
    },
    useIdleCallback: true,
    throttleDelay: 50
});

// 7. 用户行为分析 - 连续点击检测
let clickCount = 0;
let clickTimer: number;

eventListener.addEventListener({
    element: button,
    type: 'click',
    handler: (evt) => {
        clickCount++;
        console.log(`连续点击第 ${clickCount} 次`, evt);

        // 重置计时器
        clearTimeout(clickTimer);
        clickTimer = window.setTimeout(() => {
            if (clickCount > 1) {
                console.log(`用户进行了 ${clickCount} 次连续点击 - 可能表示焦虑或急躁`);
            }
            clickCount = 0;
        }, 1000);

        // 记录每次点击用于行为分析
        // 这里可以发送到数据分析服务
    },
    useIdleCallback: true // 不丢失任何点击事件
});
