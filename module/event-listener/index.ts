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

export default {
	addEventListener
};
