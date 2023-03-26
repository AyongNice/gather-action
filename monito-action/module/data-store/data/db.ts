const win: { [k: string]: any } = window || globalThis;
const indexedDB =
	win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;
const dbs: { [k: string]: IDBDatabase } = {};
let databaseName: string;
let request: IDBOpenDBRequest;
interface AnyEvent {
	[k: string]: any;
}

export interface TableOption {
	storeName: string;
	option: { [K: string]: any };
	index: { name: string; keyPath: string; unique: Boolean }[];
}

export const createDB = (
	name: string,
	version?: string,
	options?: TableOption[],
) =>
	new Promise<IDBDatabase>((resolve, reject) => {
		if (!indexedDB) reject('浏览器不支持indexedDB');
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		databaseName = name;
		if (dbs?.[name]) {
			resolve(dbs[name]);
			return;
		}
		request = indexedDB.open(name, version);
		createTable(options)?.then((db: IDBDatabase) => resolve(db));
		request.onsuccess = (event: AnyEvent) => {
			// IDBDatabase
			const db = event.target.result;
			// 缓存起来
			dbs[name] = db;
			resolve(db);
		};
		request.onerror = (event: AnyEvent) => reject(event);
	});

export const createTable = (options?: TableOption[]) => {
	if (!options) return;
	return new Promise<IDBDatabase>((resolve) => {
		request.onupgradeneeded = (event: AnyEvent) => {
			const db = event.target.result;
			dbs[databaseName] = db;
			for (const i in options) {
				// 判断是否存在表
				if (!db.objectStoreNames.contains(options[i].storeName)) {
					const objectStore = db.createObjectStore(
						options[i].storeName,
						options[i].option,
					);
					for (const j of options[i].index) {
						objectStore.createIndex(j.name, j.keyPath, {
							unique: j.unique,
						});
					}
				}
			}
			resolve(db);
		};
	});
};

const getTransaction = async (name: string, version?: string) => {
	let db: IDBDatabase;
	// 先从缓存获取
	if (dbs[databaseName]) {
		db = dbs[databaseName];
	} else {
		db = await createDB(databaseName, version);
	}
	return db.transaction(name, 'readwrite');
};

const getObjectStore = async (
	name: string,
	version?: string,
): Promise<IDBObjectStore> => {
	const transaction = await getTransaction(name, version);
	return transaction.objectStore(name);
};

const getStore = (name: string, type: string, data?: any) =>
	new Promise<IDBDatabase>((resolve) => {
		getObjectStore(name).then((objectStore: IDBObjectStore | any) => {
			const request = objectStore[type](data);
			request.onsuccess = (event: AnyEvent) =>
				resolve(event.target.result);
			// request.onerror = (event: AnyEvent) => Promise.reject(event);
		});
	});

const findStore = (
	name: string,
	start: any,
	end: any,
	startInclude: any,
	endInclude: any,
) =>
	new Promise<IDBDatabase>((resolve, reject) => {
		getObjectStore(name).then((objectStore: IDBObjectStore) => {
			const request = objectStore.openCursor(
				IDBKeyRange.bound(start, end, startInclude, endInclude),
			);
			request.onsuccess = (event: AnyEvent) =>
				resolve(event.target.result);
			request.onerror = (event: AnyEvent) => reject(event);
		});
	});


export interface DBSelect {
	add: (data: any) => Promise<IDBDatabase>;
	get: (data: any) => Promise<IDBDatabase>;
	del: (data: any) => Promise<IDBDatabase>;
	clear: (data: any) => Promise<IDBDatabase>;
	put: (key: string, data: any) => Promise<IDBDatabase>;
	find: (
		start: any,
		end: any,
		startInclude: any,
		endInclude: any,
	) => Promise<IDBDatabase>;
	getAll: () => Promise<IDBDatabase>;
	getCount: () => Promise<IDBDatabase>;
}
export  function getAll(name: string){
	return getStore(name, 'getAll')
}
export  function getCount(name: string){
	return getStore(name, 'count')
}
export  function clear(name: string){
	return getStore(name, 'clear')
}
// 获取一个store
export const onDBSelect = async (
	name: string,
	version: string,
	callback: (options: DBSelect) => void,
): Promise<DBSelect> => {
	const add = (data: any) => getStore(name, 'add', data);
	const get = (data: any) => getStore(name, 'get', data);
	const del = (data: any) => getStore(name, 'delete', data);
	const clear = (data: any) => getStore(name, 'clear', data);
	const put = (data: any) => getStore(name, 'put', data);
	const getAll = () => getStore(name, 'getAll');
	const getCount = () => getStore(name, 'count');
	const find = (start: any, end: any, startInclude: any, endInclude: any) =>
		findStore(name, start, end, startInclude, endInclude);
	const options: DBSelect = { add, get, clear, del, put, find, getAll, getCount };
	getObjectStore(name, version);
	callback(options);
	return options;
};

