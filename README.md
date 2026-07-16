# 儿童知识星图 · 小红书小工具版

这是 [`zhulin025/os-taxonomy`](https://github.com/zhulin025/os-taxonomy) 的小红书小工具适配分支，面向 4–13 岁儿童与家长，以完全离线的 WebGL 3D 星图展示 1,590 个知识点和 3,221 条前置依赖关系。

## 版本与分支

| 分支 | 用途 |
| --- | --- |
| [`main`](https://github.com/zhulin025/os-taxonomy/tree/main) | 原始线上 Web 版 |
| [`xiaohongshu-tool`](https://github.com/zhulin025/os-taxonomy/tree/xiaohongshu-tool) | 小红书小工具离线适配版 |

两个版本彼此独立。小红书版的界面、离线数据包和平台校验脚本只维护在 `xiaohongshu-tool` 分支，不会改变线上 `main` 分支。

## 直接上传

已验证的上传包位于项目根目录：

- [`儿童知识星图-xhs-tool.zip`](儿童知识星图-xhs-tool.zip)

ZIP 内以 `index.html` 为根入口，仅包含平台支持的 HTML、CSS 和 JavaScript 文件。上传后仍需在小红书创作服务平台中自行完成资料审核与最终提交。

## 小工具版能力

- `v1.2.0` 默认进入“星球”形态，并使用与线上版一致的高饱和学科色板。
- 默认显示简体中文，可通过右上角 `EN` / `中` 在中英文之间切换。
- 中文与英文数据均预编译在包内，运行时不请求翻译接口或其他网络资源。
- 支持知识点搜索、学科筛选、4–13 岁年龄筛选和知识依赖关系查看。
- 提供“星球”“成长”“知识环”三种 WebGL 图谱布局。
- 支持单指拖动旋转、双指缩放和明暗主题切换。
- 第一次点按知识点会高亮全部前置与后续路径；再次点按同一知识点才打开详情。
- 已针对小红书 App 顶部原生按钮区域和底部安全区优化移动端布局。
- 不使用 `fetch`、XHR、外部脚本、iframe、WASM、Worker、`eval` 或动态代码执行。

更完整的平台适配边界与上传资料见 [`XIAOHONGSHU_ADAPTATION.md`](XIAOHONGSHU_ADAPTATION.md)。

## 本地预览

```bash
python3 server.py
```

按照终端提示，在浏览器中打开本地地址即可。`server.py` 默认从 `8000` 端口开始寻找可用端口。

## 数据文件

- [`data/topics.json`](data/topics.json)：英文知识点源数据。
- [`data/topics.zh-CN.json`](data/topics.zh-CN.json)：按相同 ID 对齐的完整简体中文知识点数据。
- [`data/dependencies.json`](data/dependencies.json)：知识点前置依赖关系。
- `data/topics.en.js`、`data/topics.zh-CN.js`、`data/dependencies.js`：供小工具离线运行的构建产物。
- [`data/curriculum-standards.json`](data/curriculum-standards.json)：课程标准数据。
- [`data/clusters.json`](data/clusters.json)：学科与年龄段聚类数据。

中文数据保留英文版的 ID、类型、学科、年龄范围、课程标准代码和证据条数，只翻译页面实际展示的主题领域、名称、描述、亲子提问与掌握证据。

## 构建与验证

```bash
# 校验原始数据引用与校验和
npm run validate

# 校验中英文 ID、结构、占位符和证据条数一致
npm run validate:zh

# 重新生成中英文离线 JavaScript 数据包
npm run build:xhs-data

# 扫描小红书平台不支持的 API 与资源引用
npm run check:xhs
```

生成上传 ZIP 时只应包含：

```text
index.html
styles.css
app.js
data/dependencies.js
data/topics.en.js
data/topics.zh-CN.js
assets/xhs-icon.png
```

## 小红书物料

- `assets/xhs-icon.png`：小工具图标。
- `assets/xhs-icon.svg`：图标矢量源文件。
- `assets/xhs-preview-mobile.png`：移动端预览图。

## 数据来源与许可

Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · <https://withmarble.com>

- 数据库结构与关系：ODbL 1.0，详见 [`LICENSE`](LICENSE)。
- Marble 文本内容及其翻译：CC BY-SA 4.0，详见 [`LICENSE-CONTENT`](LICENSE-CONTENT)。
- 课程标准版权归相应教育机构所有，完整来源见 [`PROVENANCE.md`](PROVENANCE.md)。
- 学术或工程引用格式见 [`CITATION.cff`](CITATION.cff)。
