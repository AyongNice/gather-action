import { LogType } from '../data-type';
let isShowLog:Boolean = false;//是否打印日志
export function setShowLog(isShow) {
	isShowLog = isShow
}
//日志模块


export function log({
	logMake = '',
	logInfo = ''
}: LogType) {
	if (!isShowLog) return;
	console.log([logMake, logInfo])
}
