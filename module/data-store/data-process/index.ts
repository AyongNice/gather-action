import Data from '../data';
import hardware from '../../hardware-data';
import { observer, aboutPerformance } from '../../performance';
import { log } from '../../log-output';
import { clear } from '../data/db';


import {
	PageInfo,
	ViewIfo,
	CommonData,
	SystemData,
	PageHandle,
	PageTime,
	TimeInfo,
	Indicators,
	AboutData,
} from '../../data-type';
import Http from '../.././report';

class DataProcess {
	private projectName : String = ''; //项目名称
	private data : Data; //数据class对象
	private newPageUrl : String = ''; //当前页面地址指针
	private oldPageUrl : String = ''; //旧页面地址指针（应用首次进入为''）
	private pageTimeIfon : PageTime = {};//页面停留事件计算
	private pageAllrecord : { [key : string] : string } = {};//记录进入页面页面

	private isPosition : Boolean = false;
	private userInfo : { userCode : string } | null = null; //用户信息 任何数据类型
	private maxRequesGatewayLength : Number = 10; ////最大一次性上次数据条数， 默认10条， 1 ： 实时上传
	private url : string = ''; //网络请求地址


	constructor() {
		this.data = new Data();
	}

	//获取通用数据
	async getGlobalData() : Promise<SystemData> {
		try {
			return await hardware.getGlobalData({ isPosition: this.isPosition });
		} catch (error) {
			console.error('获取全局数据失败:', error);
			// 返回默认的系统数据，确保程序继续运行
			return {
				availWidth: window.screen.availWidth.toString(),
				availHeight: window.screen.availHeight.toString(),
				resolution: `${window.screen.width}*${window.screen.height}`,
				systemType: 'Unknown',
				phoneBrand: '',
				phoneVision: '',
				position: '获取失败'
			};
		}
	}

	//获取大概页面性能数据
	async getPerformanceData() : Promise<{ allResourceLoad : Indicators[]; aboutPerformances : AboutData }> {
		const aboutPerformances : AboutData = aboutPerformance();
		const allResourceLoad : Indicators[] = await observer();
		return { allResourceLoad, aboutPerformances };
	}

	/**
	 * 页面事件处理
	 * @param newPageUrl 新地址
	 * @param oldPageUrl 旧地址
	 * @param actionType 采集类型
	 */
	pageUrlRecord(newPageUrl : String, oldPageUrl : String = '', actionType : string) : void {
		this.oldPageUrl = oldPageUrl;
		this.newPageUrl = newPageUrl;
		this.pageEnter(newPageUrl as string, oldPageUrl as string, actionType);
	}

	// 页面进入方法
	async pageEnter(newPageUrl : string, oldPageUrl : string, actionType : string) : Promise<void> {
		const time : Number = new Date().getTime();
		/** * 计算页面进入/离开/停留时间*/
		if (oldPageUrl) {
			this.pageTimeIfon[oldPageUrl as string].leaveTime = time;
			this.pageTimeIfon[oldPageUrl as string].pageUrl = newPageUrl;
			this.pageTimeIfon[oldPageUrl as string].oldURL = oldPageUrl;
			const leaveTime : number = this.pageTimeIfon[oldPageUrl as string].leaveTime as number;
			const entetTim : number = this.pageTimeIfon[oldPageUrl as string].entetTim as number;
			this.pageTimeIfon[oldPageUrl as string].remainTime = leaveTime - entetTim;

			/**采集数据处理 **/
			this.track(this.pageTimeIfon[oldPageUrl as string]);
			/**清空已计算结果页面指针 **/
			delete this.pageTimeIfon[oldPageUrl as string];
		}

		try {
			//新增页面记录
			let allResourceLoadList : {
				allResource : Indicators[] | []
			} = { allResource: [] }

			/** 判断页面是否首次加载(observer页面资源只会首次加载进行计算性能分析)**/
			if (!this.pageAllrecord[newPageUrl as string]) {
				allResourceLoadList.allResource = await observer();
			}
			const aboutPerformances : AboutData = aboutPerformance();
			this.pageTimeIfon[newPageUrl as string] = {
				actionType,
				pageUrl: newPageUrl,
				entetTim: time,
				...aboutPerformances,
				...allResourceLoadList
			};
			//页面记录版记录页面
			this.pageAllrecord[newPageUrl as string] = newPageUrl;

		} catch (logInfo) {
			log({
				logInfo,
				logMake: '页面进入记录报错'
			})
		}
	}


	/**
	 * 页面数据数据处理
	 *  @param {string } parmas.id 数据id
	 *  @param {string } parmas.info  数据信息
	 *  @param {string } parmas.pageUrl 页面地址
	 *  @param {string } parmas.actionType 数据id
	 */
	pageTrack(parmas : PageInfo) : void {
		let urlSplit : RegExpMatchArray | null | string = 'index';
		let url : String = this.newPageUrl;
		if (parmas.pageUrl) {
			const regex = /\/([^\/]*)$/;
			urlSplit = parmas.pageUrl.match(regex);
			// @ts-ignore
			url = urlSplit[1] === '' ? 'index' : urlSplit[1];
		}
		const pageHandle : PageHandle = {
			pageBack: () => {
				this.pageUrlRecord(url, this.newPageUrl, parmas.actionType as string);
			},
			pagejump: () => {
				this.pageUrlRecord(url, this.newPageUrl, parmas.actionType as string);
			},
			pageLoad: () => {
				this.pageUrlRecord(url, this.newPageUrl, parmas.actionType as string);
			}
		};
		const hadle : Function = pageHandle[parmas.actionType as keyof PageHandle];
		hadle();
	}

	//采集数据最终处理
	async track(parmas : TimeInfo | ViewIfo) : Promise<void> {
		
		const GlobalData : SystemData = await this.getGlobalData();
		console.log('track', parmas, GlobalData);
		/**采集数据+通用数据 = 全量数据 **/
		const data : TimeInfo | ViewIfo | SystemData | CommonData = {
			...parmas,
			...GlobalData,
			userInfo: this.userInfo,
			projectName: this.projectName
		};
		let logMake : String = data.actionType || 'unknown';
		if (data.actionType === 'click') {
			// @ts-ignore
			logMake = (data?.elementText as String) || 'click';
		}
		if (data.actionType === 'click-img') {
			// @ts-ignore
			logMake = (data.imgSrc as String) || 'click-img';
		}
		log({
			logMake,
			logInfo: data,
		});
		/**实时上传数据 **/
		if (this.url && this.maxRequesGatewayLength === 1) {
			try {
				// 直接发送数组格式的数据，而不是包装在对象中
				await Http.httpRequestPost([data])
				// @ts-ignore
				await clear('monito')
				log({
					logInfo: data,
					logMake: '上传数据',
				});
			} catch (logInfo) {
				log({
					logInfo,
					logMake: '上传数据失败',
				});
				// @ts-ignore
				await clear('monito')
			}
		} else {
			this.data.storageData(data);
		}
	}

	/**
	 * 设置项目名
	 */
	setPackageName(projectName : String) : void {
		this.projectName = projectName;
		this.data.setPackageName(projectName);
	}

	/**
	 * 设置是否获取定位
	 */
	setisPosition(isPosition : Boolean) : void {
		this.isPosition = isPosition;
	}

	/**
	 * 设置是用户信息
	 */
	setUserInfo(userInfo : any) : void {
		this.userInfo = userInfo as { userCode: string } | null;
		this.data.setUserInfo(userInfo);
	}

	/**
	 * 数据库初始化
	 */
	async dbInit() {
		await this.data.DBinit();
	}

	/**
	 * 设置最大存储量
	 * @param maxRequesGatewayLength
	 */
	setMaxRequesLength(maxRequesGatewayLength : Number = 10) : void {
		this.maxRequesGatewayLength = maxRequesGatewayLength;
		this.data.setMaxRequesLength(maxRequesGatewayLength);
	}



	/**
	 * 设置网络请求地址
	 */
	setUrl(url : string) : void {
		this.url = url;
		this.data.setUrl(url);
	}
}

export default DataProcess;