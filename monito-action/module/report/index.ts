import axios from 'axios';


const defaultConfig = {
	timeout: 6000,
}

// TS 封装
class Http {
	constructor() {
		// // 实例化请求响应拦截
		// this.httpInterceptorsRequest()
		// this.httpInterceptorsResponse()
	}
	private static method: string = 'POST';
	private static url: string = '';
	private static config: any = {
		responseType: 'json',
		withCredentials: true
	};//请求头
	static setRequestType(type: string = 'POST'): void {
		this.method = type
	}

	static setRequestUrl(url: string = ''): void {
		this.url = url
	}
	static setRequestConfigs(config: any): void {
		this.url = config.requestUrl;
		this.config = { ...this.config, ...config.requesHeader }
	}
	private static axiosInstance = axios.create(defaultConfig)
	// 封装请求（公有属性） 函数返回类型为一个泛式
	public static httpRequestGet<T>(params?: any): Promise<T> {
		return Http.axiosInstance.get(this.url, this.config).then(res => res.data).catch()
	}

	public static httpRequestPost<T>(params?: any): Promise<T> {
		return Http.axiosInstance.post(this.url, params, this.config).then(res => res.data).catch()
	}

	// // 请求拦截 config 为一个 axios 请求类型
	// private httpInterceptorsRequest() {
	//     Http.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
	//         return config
	//     }, err => {
	//         return Promise.reject(err)
	//     })
	// }

	// // 响应拦截 response 为一个 axios 响应类型
	// private httpInterceptorsResponse() {
	//     Http.axiosInstance.interceptors.response.use((response: AxiosResponse) => {
	//         return response
	//     }, err => {
	//         return Promise.reject(err)
	//     })
	// }


}



export default Http
// wx.onAppRoute(function(res){
// console.log(‘onAppRoute’,{res})
// })
