// import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';
import { AboutData, Indicators } from '.././data-type';

export function observer(): Promise<Indicators[]> {
	return new Promise((resolve, reject) => {
		const res: Indicators[] = [];

		 new PerformanceObserver(数据列表 => {
				for (const 数据 of 数据列表.getEntries()) {
					// console.log("entry111:", entry)
					res.push({
						name: 数据.name,
						duration: 数据.duration
					});
				}
			 resolve(res);
			}).observe({
				entryTypes: [
					'longtask',
					'frame',
					'navigation',
					'resource',
					'mark',
					'measure',
					'paint'
				]
			});
	});
}
export function aboutPerformance(): AboutData {
	const pageLoadInfo = window.performance.timing
	const {
		domainLookupEnd,//
		domainLookupStart,//查询DNS的开始时间。如果请求没有发起DNS请求，如keep-alive，缓存等，则返回fetchStart
		connectEnd,// 完成TCP链接的时间。如果是keep-alive，缓存等，同connectStart
		connectStart,// 开始建立TCP请求的时间。如果请求是keep-alive，缓存等，则返回domainLookupEnd,(secureConnectionStart) 如果在进行TLS或SSL，则返回握手时间
		responseStart,// 服务器开始响应的时间
		navigationStart,//加载起始时间
		domContentLoadedEventEnd,//DomContentLoadedEvent事件结束的时间
		loadEventEnd,//DomContentLoadedEvent事件结束的时间
		loadEventStart//事件执开始的时间，如没有则返回0
	} = pageLoadInfo
	return {
		DNS: domainLookupEnd - domainLookupStart,
		TCP: connectEnd - connectStart,
		WhitecrSeend: responseStart - navigationStart,
		DOM: domContentLoadedEventEnd - navigationStart,
		Load: loadEventEnd - loadEventStart
	}

}
class Performance { //后期增加功能性能指标
	全部性能数据?: Number[]; //Global性能数据
	内部属性获取数据: Indicators[] = [{
		name: '',
		duration: 0
	}];
	// performance: = window.performance;
	constructor() {
		this.init().then(async 结果 => {
			// const cls = await this.getCLS()
			// const fcp = await this.getFCP()
			// const fid = await this.getFID()
			// const inp = await this.getINP()
			// const lcp = await this.getLCP()
			// 结果.push(fid)
			this.内部属性获取数据 = 结果

		});
	}
	aboutPerformance(): AboutData {
		const pageLoadInfo = window.performance.timing
		const {
			domainLookupEnd,//
			domainLookupStart,//查询DNS的开始时间。如果请求没有发起DNS请求，如keep-alive，缓存等，则返回fetchStart
			connectEnd,// 完成TCP链接的时间。如果是keep-alive，缓存等，同connectStart
			connectStart,// 开始建立TCP请求的时间。如果请求是keep-alive，缓存等，则返回domainLookupEnd,(secureConnectionStart) 如果在进行TLS或SSL，则返回握手时间
			responseStart,// 服务器开始响应的时间
			redirectEnd, //重定向结束时间（如果发生了HTTP重定向，每次重定向都和当前文档同域的话，就返回最后一次重定向接受完数据的时间。其他情况则返回0）
			navigationStart,//加载起始时间
			domContentLoadedEventEnd,//DomContentLoadedEvent事件结束的时间
			loadEventEnd,//DomContentLoadedEvent事件结束的时间
			loadEventStart//事件执开始的时间，如没有则返回0
		} = pageLoadInfo
		return {
			DNS: domainLookupEnd - domainLookupStart,
			TCP: connectEnd - connectStart,
			WhitecrSeend: responseStart - navigationStart,
			DOM: domContentLoadedEventEnd - navigationStart,
			Load: loadEventEnd - loadEventStart
		}

	}

	init(): Promise<Indicators[]> {
		return new Promise((resolve, reject) => {
			const res: Indicators[] = [];
			console.log('初始化---')

			new PerformanceObserver(数据列表 => {
				for (const 数据 of 数据列表.getEntries()) {
					res.push({
						name: 数据.name,
						duration: 数据.duration
					});
				}
				resolve(res);
			}).observe({
				entryTypes: [
					'longtask',
					'frame',
					'navigation',
					'resource',
					'mark',
					'measure',
					'paint'
				]
			});
		});
	}
	// getCLS() {
	// 	return new Promise((resolve) => {
	// 		let res: Number = 0;
	// 		function resOnCLS(data?: WebVitals) {
	// 			res = data?.value as Number
	// 		}
	// 		onCLS(resOnCLS);
	// 		setTimeout(() => {
	// 			resolve({
	// 				name: 'CLS',
	// 				duration: res
	// 			});
	// 		}, 500);
	// 	});
	// }
	// //FCP
	// getFCP() {
	// 	return new Promise((resolve, reject) => {
	// 		let res: Number = 0;
	// 		function resOnFCP(data?: WebVitals) {
	// 			res = data?.value as Number
	// 		}
	// 		onFCP(resOnFCP);
	// 		resolve({
	// 			name: 'FCP',
	// 			duration: res
	// 		});
	// 	});
	// }
	// //FID指标影响用户对页面交互性和响应性的第一印象。为了提供良好的用户体验，站点应努力使首次输入延迟小于100毫秒。
	// getFID() {
	// 	return new Promise((resolve, reject) => {
	// 		onFID(data => {
	// 			resolve({
	// 				name: 'FID',
	// 				duration: data.value
	// 			})
	// 		});
	// 	})
	// }
	// //INP测量网页响应用户交互所花费的时间，从用户开始交互到在屏幕上绘制下一帧的那一刻.
	// getINP() {
	// 	return new Promise((resolve) => {
	// 		let res: Number = 0;
	// 		onINP(data => {
	// 			res = data.value
	// 		});
	// 		setTimeout(() => {
	// 			resolve({
	// 				name: 'INP',
	// 				duration: res
	// 			});
	// 		}, 500)

	// 	});

	// }
	// //LCP（最大内容绘制时间）
	// getLCP() {
	// 	return new Promise((resolve) => {
	// 		onLCP(data => {
	// 			resolve({
	// 				lcp: data.value
	// 			})
	// 		});
	// 	})
	// }

}


