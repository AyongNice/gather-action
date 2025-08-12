import { EventListenerPar,Evt } from '../data-type';

//事件模块
/**
 * 优化的事件监听器，支持 requestIdleCallback 和节流
 * @param params 配置对象
 * @param params.element Dom 节点
 * @param params.type 事件类型
 * @param params.handler 事件处理函数
 * @param params.options 事件监听选项
 * @param params.useIdleCallback 是否使用 requestIdleCallback 优化（默认 true）
 * @param params.throttleDelay 节流延迟时间（毫秒），用于高频事件如滚动、鼠标移动
 */

// 节流函数
function throttle<T extends any[]>(func: (...args: T) => void, delay: number) {
	let lastCall = 0;
	return (...args: T) => {
		const now = Date.now();
		if (now - lastCall >= delay) {
			lastCall = now;
			func(...args);
		}
	};
}

function addEventListener<T extends EventTarget, E extends Evt>({
	element,
	type,
	handler,
	options,
	useIdleCallback = true,
	throttleDelay
}: {
	element: T;
	type: string;
	handler: (this: T, evt: E) => void;
	options?: boolean | AddEventListenerOptions;
	useIdleCallback?: boolean; // 是否使用 requestIdleCallback 优化
	throttleDelay?: number; // 节流延迟时间（毫秒），仅用于高频事件如滚动、鼠标移动
}) {
	// 创建基础处理器
	const baseHandler = (evt: Event) => {
		if (useIdleCallback && typeof requestIdleCallback === 'function') {
			// 使用 requestIdleCallback 优化
			requestIdleCallback((deadline) => {
				// 检查是否有足够的空闲时间执行处理器
				if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
					handler.call(element as T, evt as E);
				} else {
					// 如果没有足够时间，延迟到下一个空闲期
					requestIdleCallback(() => {
						handler.call(element as T, evt as E);
					});
				}
			}, { timeout: 1000 }); // 设置超时，确保处理器最终会执行
		} else if (useIdleCallback) {
			// 降级方案：使用 setTimeout
			setTimeout(() => {
				handler.call(element as T, evt as E);
			}, 0);
		} else {
			// 直接执行，不使用优化
			handler.call(element as T, evt as E);
		}
	};

	// 根据配置应用节流优化（仅用于高频事件）
	let optimizedHandler = baseHandler;

	if (throttleDelay && throttleDelay > 0) {
		// 应用节流 - 适用于滚动、鼠标移动等高频事件
		optimizedHandler = throttle(baseHandler, throttleDelay);
	}

	element.addEventListener(type, optimizedHandler, options);
}

export default {
	addEventListener
};
