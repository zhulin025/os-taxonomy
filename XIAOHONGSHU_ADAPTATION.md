# 小红书小工具适配说明

## 产品信息

- 名称：儿童知识星图
- 简介：面向 4–13 岁儿童与家长的离线 3D 学习路径图谱，可按学科和年龄筛选知识点，查看前置基础与后续解锁关系。
- 推荐分类：教育 / 学习工具
- 搜索关键词：儿童学习、知识图谱、学习路径、亲子教育、小学知识

## 平台能力适配

- 纯 HTML / CSS / JavaScript，唯一入口为 `index.html`。
- 所有脚本均为包内外置脚本，无内联脚本与行内事件。
- 默认加载完整中文数据 `data/topics.zh-CN.js`；点击 `EN` 后加载包内英文数据 `data/topics.en.js`，切换过程不访问网络。
- 中文源数据保存在 `data/topics.zh-CN.json`，与英文源数据 `data/topics.json` 按相同 ID 一一对应。
- 3D 渲染器为纯 WebGL 实现，不依赖 `eval`、`new Function`、WASM、Worker 或外部纹理。
- 不使用 iframe、文件下载、外链跳转、跨小工具通信、定位、剪贴板和设备传感器。
- 使用响应式竖屏布局，支持单指旋转、双指缩放、点按选中。
- 数据来源与 ODbL 1.0 / CC BY-SA 4.0 归属声明已内置在工具界面中。

## 本地校验

```bash
npm run build:xhs-data
npm run validate:zh
npm run check:xhs
python3 server.py
```

## 上传包

生成后的上传包位于项目根目录 `儿童知识星图-xhs-tool.zip`。压缩包只包含平台支持的 `.html`、`.css` 和 `.js` 文件；源数据 JSON 和翻译缓存不会进入上传包。
