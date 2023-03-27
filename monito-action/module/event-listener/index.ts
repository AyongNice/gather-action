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
	handler
}: {
	element: T;
	type: string;
	handler: (this: T, evt: E) => void;
}) {
	element.addEventListener(type, handler as (evt: Event) => void);
}
// function addEventListener<T extends EventTarget, E extends Event>(
// 	element: T,
// 	type: string,
// 	handler: (this: T, evt: E) => void
// ) {
// 	element.addEventListener(type, handler as (evt: Event) => void);
// }
// addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) =>
// any, options?: boolean | AddEventListenerOptions): void;

// addEventListener(type: string, listener: EventListenerOrEventelementect, options?: boolean | AddEventListenerOptions): void;

export default {
	addEventListener
};
