#                           H5全面埋点组件

## **全埋点组件特点:**

1. 不入侵业务项目代码(不需要在页面中写代码，只需要在main.js引入，传参数配置即可使用)
2. 通过配置采集所有交互交互行为(采集数据类型如下)
3. 页面性能(页面所有资源加载性能，页面渲染性能)数据分析与采集(采集数据类型如下)
4. 采集的数据上传(传入公司服务器请求配置即可进行数据统一上传,也可操作存储的采集数据自定义上传)
5. 可搭配业务项目之前的代码埋点采集调用组件tack方法存储数据与全埋点组件数据进行共同存储

目前兼容框架有 uniapp vue2.0  vue3.0 react；
微信小程序框架目前未做兼容， 阿勇正在玩命开发...

更新日志公告🪧以 微信公众号为主 ⚠️⚠️⚠️！！！ **(关注公众号) => 阿勇学前端**

## 埋点组件采集数据字段介绍、采集数据分三类

1. #### 交互数据:  点击文案 与绑定的业务数据

2. #### 页面数据&&性能数据 :页面停留时间 与页面资源加载性能时间分析

3. #### 通用数据:包含 项目信息 设备硬件信息。交互数据与页面数据

#### 用户交互信息介绍

| 字段介绍     | 类型   | 说明                                                      |
| ------------ | ------ | --------------------------------------------------------- |
| id           | string | 数据唯一id                                                |
| actionType   | string | 采集类型 见下方详情                                       |
| elementText  | string | 用户交互节点文案(actionType=click时才有)                  |
| ....业务数据 | string | 插入当前文案所绑定的业务数据,使用方式见 组件init 方法调用 |

#### 页面采集数据

| 字段介绍        | 类型         | 说明                                   |
| --------------- | ------------ | -------------------------------------- |
| actionType      | string       | 采集类型 见下方详情                    |
| DNS             | number       | nsc时长                                |
| DOM             | number       | dom渲染时长                            |
| Load            | number       | 页面加载时长                           |
| TCP             | number       | tcp请求时长                            |
| WhitecrSeend    | number       | 白屏时长                               |
| allResourceLoad | Indicators[] | 项目所以资源加载(图片,JS,link,CSS)时间 |
| entetTim        | number       | 页面进入时间戳                         |
| leaveTime       | number       | 页面离开时间戳                         |
| remainTime      | number       | 页面停留时间                           |
| oldURL          | string       | 跳转前的页面                           |



#### 通用信息介绍

| 字段介绍    | 类型     | 说明                                                         |
| ----------- | -------- | ------------------------------------------------------------ |
| pageUrl     | string   | 当前页面路径                                                 |
| projectName | string   | 项目名称                                                     |
| userInfo    | userInfo | 一般信息                                                     |
| availHeight | string   | 屏幕高度                                                     |
| availWidth  | string   | 屏幕宽度                                                     |
| resolution  | string   | 屏幕像素                                                     |
| systemType  | string   | 系统类型                                                     |
| phoneBrand  | string   | 手机品牌                                                     |
| phoneVision | string   | 手机系统版本                                                 |
| position    | string   | 定位信息 （定位失败时候是 报错信息）<br/> 默认不获取定位信息,<br/>获取定位需要在组件使用时传入参数配置详情见使用方式 |

#### 采集类型actionType字段介绍

| 字段介绍 | 类型   | 说明     |
| -------- | ------ | -------- |
| click    | string | 用户点击 |
| pageLoad | string | 页面加载 |
| pagejump | string | 页面跳转 |
| pageBack | string | 页面返回 |

**当前页面首次所有资源加载性能allResourceLoad字段介绍**

| 字段介绍 | 类型   | 说明         |
| -------- | ------ | ------------ |
| name     | string | 资源加载地址 |
| duration | number | 页面加载     |

**使用方式 1下载 2引入 3调组件init()方法传入参数即可使用**

## 一 : 下载

在项目没有package.json情况下需要
```javascript
npm init -y
```

```javascript
npm install monito-action
// 或
//yarn add monito-action
```

## 二 :新建js文件引入组件使用并导出实例对象(vue3.0示例)

<span id="init">init方法调用示例</span>
新建J S文件并导出实例对象原因 是因为,在Vue3中没有this, 实例对象中的tack方法必须通用过引入JS文件调用

    如果是vue2项目可直接在main.js引入 ,通过挂载全局对象,在页面中使用this进行调用
```javascript

Vue.prototype.$monitoAction = monitoAction;
```
```js

import MonitoAction from 'monito-action';
export const monitoAction = new MonitoAction();

monitoAction.init({
    frameType:'vue',
    reques:{
        requestUrl:'http://www.liulongbin.top:3006/api/post',
        requerequesKeysHeader:{},
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
    }, ],
    globaMonitoImgList:[
        {imgSrc:'ayong.jpeg',businessData:'1号广告位置'}
    ]
})
export default monitoAction
```
### 在 main.js该js文件(vue3.0示例)
```js
import {createApp} from 'vue';
import App from './App.vue';
import './action'
const app = createApp(App);
app.use(router).use(ElementPlus).use(store).mount('#app');

```
### 三:tack方法方法介绍 主要用于JS方法采集数据、代码埋点调用组件实例方法进行数据存储，方法如参数随意搭配
```template
<<template>>
  <div @click="monitoAction.track({actionType:(+ new Date()).toString()})">tack</div>
</template>
```

```vue3
<script lang="ts" setup>
import monitoAction from '../../action'
</script>
```

### 四:init入参方法介绍

| 字段名                | 类型            | 是否必传 | 介绍                                                |
| --------------------- |---------------| -------- |---------------------------------------------------|
| frameType             | FrameType     | 必传     | 项目框架类型;见下方详情 [FrameType介绍 ](#FrameType)           |
| globaMonitoConfigList | MonitoList[ ] | 必传     | 埋点采集配置列表;见下方详情  [MonitoList介绍 ](#MonitoList)      |
| userInfo              | UserInfo      | 必传     | 一般信息;见下方详情[userInfo介绍 ](#userInfo)                |
| projectName           | string        | 必传     | 项目名称                                              |
| reques                | Reques        | 非必传   | 上报数据入参  [reques介绍 ](#reques)                      |
| monitoSwitch          | Boolean       | 非必传   | 是否开启埋点 默认开启 true                                  |
| showLog               | Boolean       | 非必传   | 是否打印日志 默认false不打印                                 |
| isPosition            | Boolean       | 非必传   | 是否获取定位信息 默认不获取 fasle<br/>(获取定位用户页面会收到是否获取定位的系统弹框) |
| globaMonitoImgList            | ImgList[]     | 非必传   | 项目图片交互数据采集 数据格式详情[ImgList介绍 ](#ImgList)                                  |

#### <span id="FrameType">FrameType框架类型字段介绍 </span>

| 值       | 类型   | 介绍                                      |
| -------- | ------ | ----------------------------------------- |
| 'vue'    | string | Vue2  vue3 框架兼容                       |
| 'react', | string | react 框架兼容                            |
| 'uniapp' | string | Uniapp 编译H5兼容 ⚠️不包括uniapp编译小程序 |
| 'wx',    | string | 1.0.0当前版本暂不支持wx框架               |

#### <span id="MonitoList">MonitoList埋点采集配置列表字段介绍</span>

| 值          | 类型   | 介绍                        |
| ----------- | ------ |---------------------------|
| elementText | string | 需要采集的dom节点文案              |
| ...         | any    | 该dom节点的其他业务数据；字段名直接增加即可 示例如下 |

```js
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
#### <span id="ImgList">ImgList图片埋点采集配置列表字段介绍</span>

| 值          | 类型   | 介绍                        |
| ----------- | ------ |---------------------------|
| imgSrc | string | 需要采集的图片文件名（包含文件后缀）        |
| ...         | any    | 该图片的其他业务数据；字段名直接增加即可 示例如下 |

```js
const globaMonitoConfigList: [{
        imgSrc: 'star.jpeg',
        businessData: '这是星星图片业务数据',
    },{
    imgSrc: 'pasword.png',
        businessData: '这是验证码图片业务数据',
    }, ]

monitoAction.init({
    ...
        globaMonitoConfigList,
    ....
})
```
#### <span id="userInfo">userInfo埋点采集配置列表字段介绍</span>

| 值      | 类型   | 介绍                                               |
| ------- | ------ | -------------------------------------------------- |
| useCode | string | 唯一字符 (主要用于采集数据本地存储时 数据库名唯一) |

#### reques埋点采集配置列表字段介绍

| 值                     | 类型   | 介绍                                                         |
| ---------------------- | ------ | ------------------------------------------------------------ |
| requestUrl             | string | 上报数据地址,不配置组件只采集数据并存储将不会上传,<br/>需要开发人员自定义上传;自定义上传数据需要[操作采集数据方式见下方详情 ](#getAllData) |
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

## 该组件开发源码放置 GitHbu 仓库(有需要参与贡献与开发可以自行拉去代码开发提交)不要忘了给阿勇点颗星星哟

https://github.com/AyongNice/gather-action
