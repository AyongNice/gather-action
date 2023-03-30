import { SystemData, PhoneInfo, Position } from '../data-type'; //假数据
const systemType: String = getOSname();
const phoneInfo: PhoneInfo = getOSVersion();
const { availHeight, availWidth, width, height } = window.screen;

/**
 * 获取通用硬件数据
 * @param isPosition 是否获取定位
 */
async function getGlobalData({ isPosition }: { isPosition: Boolean }): Promise<SystemData> {
	let position: Position | unknown = '';
	if (isPosition) {
		try {
			position = (await getPosition()) as Position;
		} catch (e) {
			position = e ;
			//TODO handle the exception
		}
	}


	return {
		availWidth: availWidth.toString(),
		availHeight: availHeight.toString(),
		resolution: `${width}*${height}`,
		systemType,
		...phoneInfo,
		position
	};
}
function getOSname() {
	//获取系统
	let e = 'Unknown';
	if (window.navigator.userAgent.indexOf('Windows NT 10.0') !== -1) return (e = 'Windows 10');
	if (window.navigator.userAgent.indexOf('Windows NT 6.2') !== -1) return (e = 'Windows 8');
	if (window.navigator.userAgent.indexOf('Windows NT 6.1') !== -1) return (e = 'Windows 7');
	if (window.navigator.userAgent.indexOf('Windows NT 6.0') !== -1) return (e = 'Windows Vista');
	if (window.navigator.userAgent.indexOf('Windows NT 5.1') !== -1) return (e = 'Windows XP');
	if (window.navigator.userAgent.indexOf('Windows NT 5.0') !== -1) return (e = 'Windows 2000');
	if (window.navigator.userAgent.indexOf('iPhone') !== -1) return (e = 'iPhone');
	if (window.navigator.userAgent.indexOf('Android') !== -1) return (e = 'Android');
	if (window.navigator.userAgent.indexOf('Mac') !== -1) return (e = 'Mac');
	if (window.navigator.userAgent.indexOf('X11') !== -1) return (e = 'UNIX');
	if (window.navigator.userAgent.indexOf('Linux') !== -1) e = 'Linux';
	return e;
}
function getOSVersion() {
	// 获取操作系统版本与手机信息
	const phoneInfo: PhoneInfo = {
		phoneVision: '',
		phoneBrand: ''
	};
	let OSVision: String | RegExpMatchArray | null = '1.0';
	const u = navigator.userAgent;
	const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //Android
	const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
	const list = navigator.userAgent.split(';')[1];
	const phone: RegExpMatchArray | null = u.match(/\(.*?\)/);
	const phoneTypeList: String = phone ? phone[0] : '';
	if (isAndroid) {
		phoneInfo.phoneVision = list.match(/\d/g);
		phoneInfo.phoneBrand = phoneTypeList.split(';')[2];
	}
	if (isIOS) {
		const iosList = list.match(/(\d+)_(\d+)?(\d+)?/);
		phoneInfo.phoneVision = iosList ? iosList[0] : '';
		phoneInfo.phoneBrand = phoneTypeList.split(';')[1];
	}
	return phoneInfo;
}

//获取经纬度
function getPosition(): Promise<Position | String> {
	return new Promise((resolve, reject) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function(position) {
					let latitude = position.coords.latitude;
					let longitude = position.coords.longitude;
					let data = {
						latitude: latitude,
						longitude: longitude
					};
					resolve(data);
				},
				function(e) {
					reject(e);
				}
			);
		} else {
			reject('你的浏览器不支持当前地理位置信息获取');
		}
	});
}

export default {
	getGlobalData,
};
