import { EventListenerPar,Evt } from '../data-type';
//事件模块
/**
 * @param {Object} element Dom 节点 HTMLPictureElement
 * @param {String} eventType 事件类型
 * @param {Funtion} complete (e) 方法回掉
 * @param {Boolean} useCapture true 冒泡触发回掉 ,false冒泡触发回掉
 */

function addEventListener<T extends EventTarget, E extends Evt>({
	element,
	type,
	handler,
	options
}: {
	element: T;
	type: string;
	handler: (this: T, evt: E) => void;
	options:{capture:Boolean};
}) {
	element.addEventListener(type, handler as (evt: Event) => void,options);
}

export default {
	addEventListener
};
