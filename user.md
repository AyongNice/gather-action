#                           H5全面埋点组件

**全埋点组件特点:**
1. 不入侵业务项目代码(不需要在页面中写代码，只需要在main.js引入，传参数配置即可使用)
2. 通过配置采集所有用户交互交互行为
3. 页面性能(页面所有资源加载性能，页面渲染性能)数据分析与采集
4. 采集的数据上传(传入公司服务器请求配置即可进行数据统一上传)
5. 可搭配业务项目之前的代码埋点采集与全埋点组件数据进行共同存储

目前兼容框架有 uniapp vue2.0  vue3.0 react； 
微信小程序框架目前未做兼容， 阿勇正在玩命开发... 

更新日志公告🪧以 微信公众号为主 ⚠️⚠️⚠️！！！ **(关注公众号) => 阿勇学前端**

**使用方式 1下载 2引入 3调组件init()方法传入参数即可使用**

## 一 : 下载

```javascript
npm i monito-action
```

## 二 :使用 main.js引入组件(vue3.0示例)

<span id="init">init方法调用示例</span>

```js
import {createApp} from 'vue';
import App from './App.vue';
import MonitoAction from './monito-action';
const monitoAction = new MonitoAction();
monitoAction.init({
    frameType:'vue',
    reques:{
        requestUrl:'http://www.liulongbin.top:3006/api/post',
        requerequesKeysHeader:{
            token:'12345678908765'
        },
        requesKey:'value',
        maxRequesGatewayLength:3,
    },
    showLog: true,
    monitoSwitch: true,
    isPosition: true,
    userInfo:{
        userCode:'1540018883'
    },
    projectName: '全埋点组件',
    globaMonitoConfigList: [{
        elementText: 'Hello',
        elementEevent: '',
    },{
        elementText: 'add',
        elementEevent: '',
    }, ]
})

window.addEventListener('monito', async res => {
	const allData = await res.detail.getAllData();
	const countData = await res.detail.getCountData();
	console.log('monito', allData);
	console.log('monitocountData', countData);
});
const app = createApp(App);
app.mount('#app');



```

### 三:init入参方法介绍

| 字段名                | 类型          | 是否必传 | 介绍                                                         |
| --------------------- | ------------- | -------- | ------------------------------------------------------------ |
| frameType             | FrameType     | 必传     | 项目框架类型;见下方详情 [FrameType介绍 ](#FrameType)         |
| globaMonitoConfigList | MonitoList[ ] | 必传     | 埋点采集配置列表;见下方详情  [MonitoList介绍 ](#MonitoList)  |
| userInfo              | UserInfo      | 必传     | 用户信息;见下方详情[userInfo介绍 ](#userInfo)                |
| projectName           | string        | 必传     | 项目名称                                                     |
| reques                | Reques        | 非必传   | 上报数据入参  [reques介绍 ](#reques)                         |
| monitoSwitch          | Boolean       | 非必传   | 是否开启埋点 默认开启 true                                   |
| showLog               | Boolean       | 非必传   | 是否打印日志 默认false不打印                                 |
| isPosition            | Boolean       | 非必传   | 是否获取定位信息 默认不获取 fasle<br/>(获取定位用户页面会收到是否获取定位的系统弹框) |

#### <span id="FrameType">FrameType框架类型字段介绍 </span>

| 值       | 类型   | 介绍                                      |
| -------- | ------ | ----------------------------------------- |
| 'vue'    | string | Vue2  vue3 框架兼容                       |
| 'react', | string | react 框架兼容                            |
| 'uniapp' | string | Uniapp 编译H5兼容 ⚠️不包括uniapp编译小程序 |
| 'wx',    | string | 1.0.0当前版本暂不支持wx框架               |

#### <span id="MonitoList">MonitoList埋点采集配置列表字段介绍</span>

| 值          | 类型     | 介绍                                         |
| ----------- |--------| -------------------------------------------- |
| elementText | string | 需要采集的dom节点文案                        |
| ...         | any    | 该dom节点的其他业务数据直接增加即可 示例如下 |

```js
import MonitoAction from './monito-action';
const monitoAction = new MonitoAction();
const globaMonitoConfigList: [{
        elementText: '登陆',
        businessData: '这是登陆按钮的业务数据',
    },{
        elementText: '查看信息',
        businessData: '这是查看信息按钮的业务数据',
    }, ]

monitoAction.init({
  ... 
  globaMonitoConfigList,
  ....
})
```

#### <span id="userInfo">userInfo埋点采集配置列表字段介绍</span>

| 值      | 类型   | 介绍                                           |
| ------- | ------ | ---------------------------------------------- |
| useCode | string | 用户账号(主要用户采集数据本地存储数据库名唯一) |

#### reques埋点采集配置列表字段介绍

| 值                     | 类型   | 介绍                                                         |
| ---------------------- | ------ | ------------------------------------------------------------ |
| requestUrl             | string | 上报数据地址,不配置组件只采集数据并存储将不会上传,<br/>开发人员自定义上传;自定义上传数据需要[操作采集数据方式见下方详情 ](#getAllData) |
| requesHeader           | Object | 上传请求头:例如token,后端身份验证参数 [使用示例 ](#init)     |
| requesKey              | string | 上传数据时与公司服务器后端接收字段,默认值 : value 例如 {[requesKey]:采集数据}  [使用示例 ](#init) |
| maxRequesGatewayLength | Number | 最大存储量(单位/条)上传;默认10,例如采集10条数据后将进行上传,设置为1时将实时上传,在不传requestUrl字段时需要实时获取采集数据,进行自定义上传数据 [操作采集数据方式见下方详情 ](#getAllData) |



#### <span id="getalldata">**操作上传数据代码示例**</span>

##### 需要监听组件发出的订阅事件 monito

```
window.addEventListener('monito', async res => {
	const allData = await res.detail.getAllData();//获取所有数据
	const countData = await res.detail.getCountData();//获取数据量条数
/****
*  自定义上传数据网络请求
**/
	const clearData = await res.detail.clearData(); //删除所有数据
});
```

## 关注作者公众号。阿勇学前端

<img src="../../../../Library/Application Support/typora-user-images/image-20230326190852937.png" alt="image-20230326190852937" style="zoom:20%;" />

## 如果你觉得该组件帮助到了你的工作:你可以打赏作者,哪怕是一瓶可乐也是作者前进的最大动力!!! 相信这比打赏主播更有意义;<br/>看清生活的本质仍然热爱生活,愿你在奋斗的道路上勇往直前,归来仍是少年

<img src="../../../../Library/Application Support/typora-user-images/image-20230326190957878.png" alt="image-20230326190957878" style="zoom:25%;" />

<img src="../../../../Library/Application Support/typora-user-images/image-20230326191024478.png" alt="image-20230326191024478" style="zoom:20%;" />
