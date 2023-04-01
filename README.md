#monito-action                                         
#H5全埋点组件 
#全埋点 

## npm仓库介绍
该组件已发布npm🪧库
下载方式<br/> 
npm i monito-action<br/>  
具体使用说明见 user.md


## 技术栈介绍

1.  语言： Typescript 
2.  存储数据 IndexDB
3.  上传数据 ： Axios post请求
4.  构建工具使用 ：Vite

### 开发流程 

1.  fork 项目 新建分支进行开发 并提交 项目测试成功后 将由作者进行 npm 库发布升级

### 调试流程

1. 该库属于项目组件不能独立运行；需要将项目拉取到 项目内的node_mlodes 目录下 以便于项目方便引入开发与调试 
2. 在组件当前文件打开终端执行 npm i 或者 yarn 安装组件所需依赖 
3. 调试过程与使用流程相似见项目内使用说明文档 user.md

### 环境要求 

1. 建议使用 Vue3 版本的项目 以便于 更适配 typescript 语言环境,编辑器推荐使用webstorm
2. 项目内也需要添加 tsconfig.json，可以复制组件内的 tsconfig.json
3. 项目需要安装 typescript 依赖

### 组件模块注释

文件顺序按照系统文件排列数据

    |---monito-action //组件外层目录
    |   |---module //组件模块层
    |   |   |--data-store //数据模块
    |   |   |   |--data //数据存储模块
    |   |   |   |  |--db// indexDB ts方法封装
    |   |   |   |  |--index// 数据存储管理类(包含数据上报)
    |   |   |   |--data-process //数据层逻辑整合 (包含数据上报)
    |   |   |   
    |   |   |--data-type//数据类型interface接口 
    |   |   |--event-listener//事件监听功能封装
    |   |   |--global-const//全局常量
    |   |   |--hardware-data//设备硬件数据处理
    |   |   |--init//埋点初始化(点击事件监听, 页面路由监听)
    |   |   |--log-output//日志输出模块
    |   |   |--performance //性能分析模块
    |   |   |--report//数据上报方法封装
    |   |   |---index//模块层入口
    |------index//组件入口 

## 埋点组件架构图
![全埋点架构图](https://user-images.githubusercontent.com/89636513/228181013-fb31866e-a8b0-43ad-bfc7-d668cf9add32.png)
