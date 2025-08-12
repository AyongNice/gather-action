// 测试批量上传功能的示例代码
// 这个文件展示了修改后的数据格式

// 修改前的格式（错误）：
// await Http.httpRequestPost({ [this.requesKey]: data })
// 发送的数据格式：{ "value": {...} } 或 { "events": {...} }

// 修改后的格式（正确）：
// 实时上传（单条数据）：
// await Http.httpRequestPost([data])
// 发送的数据格式：[{...}]

// 批量上传（多条数据）：
// await Http.httpRequestPost(allData)
// 发送的数据格式：[{...}, {...}, {...}]

console.log('数据格式修改完成：');
console.log('1. 实时上传：发送单条数据包装在数组中 [data]');
console.log('2. 批量上传：直接发送数组格式的数据 allData');
console.log('3. 后端接口可以直接接收 List<TrackingEventDTO> 格式的数据');
