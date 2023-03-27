import {Reques} from '../data-type';

let request: Reques;//数据上报地址
export function setReques(params: Reques) {
    request = params
    console.log('setReques',request)
}


