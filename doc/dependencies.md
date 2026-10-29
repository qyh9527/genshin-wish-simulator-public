# 依赖核验

[返回开发入口](../AGENTS.md) · [技术契约](engineering.md) · [产品契约](product.md) · [规则证据](rules.md) · [构建契约](build.md) · [验收契约](acceptance.md)

本文件回答一件事：为“离线单 HTML 原神抽卡模拟器”选定哪一套依赖，以及每项选择凭什么成立。技术契约的[选型闸门](engineering.md#选型闸门)要求先核实官方仓库、维护现状、兼容性与单文件打包能力再落地，这里是那次核实的记录。

## 证据口径

- 核验日期：2026-10-23。版本号、发布日、`engines`、`peerDependencies` 取自 npm registry 元数据（`https://registry.npmjs.org/<pkg>`）；文档事实取自官方文档与仓库。
- 网络数据可能滞后于日期本身：下文每个版本都带该版本的**实际发布时间**，不以“今天最新”代替来源日期。
- 以下记录保留选型时的一次性验证工程证据，不冒充本项目验收。项目现已实施，工程根与锁文件位于 src/。凡属旧工程实测的结果均保留其来源边界。
- **验证工程已在核验结束后删除**，目录不再存在。当时的路径、目录布局、完整命令与输出摘录保留在文末[验证工程记录](#验证工程记录可复现性附录)，需要复核时按该附录重建（约 1 分钟安装、1 秒级构建）。这是一份“如何重做”的记录，不是可点击的现存文件链接；不要把它当成仍然存在的产物。
- 实测环境：Windows 11 Pro 10.0.26300、Node v24.20.0、npm 12.0.2、系统 Chrome 156.0.8078.47、Playwright 自带 Chromium 153.0.8010.12。
- 测试强度按需求收敛：Vitest 核心小测试 + 单 Chromium 离线冒烟 + 一次百万次运行，不做多浏览器矩阵。

范围前提：模拟对象只有限定角色活动池 A/B 与配套武器活动池，不含常驻池、新手池或其它祈愿类型；常驻角色仅作为活动池歪出结果与星辉输入出现（见[开发入口](../AGENTS.md#目标与边界)）。这不影响依赖选择，但决定了不需要“池类型切换”类组件，也无需为多池菜单引入导航组件。

## 唯一推荐组合

| 类别 | 选择 | 版本 | 许可 | 该版本发布时间 |
| --- | --- | --- | --- | --- |
| 构建工具 | `vite` | 8.3.5 | MIT | 2026-10-21 |
| React 插件 | `@vitejs/plugin-react` | 6.1.2 | MIT | 2026-10-05 |
| 单文件内联 | `vite-plugin-singlefile` | 2.3.4 | MIT | 2026-10-17 |
| 语言与类型检查 | `typescript` | 7.0.2 | Apache-2.0 | 2026-07-08 |
| UI 框架 | `react` / `react-dom` | 19.3.1 | MIT | 2026-10-14 |
| UI 组件库 | `antd` | 6.6.7 | MIT | 2026-10-20 |
| 图标 | `@ant-design/icons` | 6.3.4 | MIT | 2026-08-31 |
| 单元测试 | `vitest` | 5.0.5 | MIT | 2026-10-15 |
| 浏览器冒烟 | `@playwright/test` | 1.64.1 | Apache-2.0 | 2026-10-14 |
| 可复现随机数 | `pure-rand` | 8.4.2 | MIT | 2026-07-10 |
| 类型声明 | `@types/react` / `@types/react-dom` | 19.3.0 | MIT | 2026-09-09 |

归属建议：`dependencies` 放 `react`、`react-dom`、`antd`、`@ant-design/icons`、`pure-rand`（运行时真正打包进产物的）；`devDependencies` 放 `vite`、`@vitejs/plugin-react`、`vite-plugin-singlefile`、`typescript`、`vitest`、`@playwright/test`、`@types/react`、`@types/react-dom`。按上述版本或 `^` 允许的补丁范围声明，**实际落盘版本以 `package-lock.json` 为唯一事实来源**，不在文档、README、代码里二次手抄版本号。

### 兼容性证据（对 Node v24.20.0 逐项核对）

| 包 | `engines` | 是否满足 Node 24.20.0 | `peerDependencies` 关键项 | 结论 |
| --- | --- | --- | --- | --- |
| `vite@8.3.5` | `^20.19.0 \|\| >=22.12.0` | 是 | 全部 optional | 可用 |
| `@vitejs/plugin-react@6.1.2` | `^20.19.0 \|\| >=22.12.0` | 是 | `vite: ^8.0.0`（硬性），`oxc-transform-react` 等为 optional | 与 Vite 8.3.5 匹配 |
| `vite-plugin-singlefile@2.3.4` | `>18.0.0` | 是 | `vite: ^5.4.21 \|\| ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0`；`rollup: ^4.59.0`（optional） | 覆盖 Vite 8 |
| `typescript@7.0.2` | `>=16.20.0` | 是 | 无 | 可用 |
| `react@19.3.1` | 无约束 | 是 | 无 | 可用 |
| `react-dom@19.3.1` | 无 | 是 | `react: ^19.3.1` | 同批版本对齐 |
| `antd@6.6.7` | 未声明 | 不适用 | `react >=18.0.0`、`react-dom >=18.0.0` | 与 React 19.3.1 匹配 |
| `@ant-design/icons@6.3.4` | 未声明 | 不适用 | `react >=16.0.0`、`react-dom >=16.0.0` | 与 React 19.3.1 及 `antd@6` 匹配 |
| `vitest@5.0.5` | `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` | 是（`^24.0.0` 覆盖 24.20.0） | `vite: ^6.4.0 \|\| ^7.0.0 \|\| ^8.0.0` | 与 Vite 8.3.5 匹配 |
| `@playwright/test@1.64.1` | `>=20` | 是 | 无 | 可用 |
| `pure-rand@8.4.2` | 未声明 | 不适用 | 无 | 纯 TS 库，无运行时依赖 |

来源：各包 registry 元数据，例如 <https://registry.npmjs.org/vite>、<https://registry.npmjs.org/vite-plugin-singlefile>、<https://registry.npmjs.org/@vitejs%2fplugin-react>、<https://registry.npmjs.org/antd>、<https://registry.npmjs.org/vitest>、<https://registry.npmjs.org/@playwright%2ftest>、<https://registry.npmjs.org/pure-rand>、<https://registry.npmjs.org/typescript>（均于 2026-10-23 读取）。

### Vite 8 与 Vite 7 的取舍

`vite-plugin-singlefile` 的 CHANGELOG 记录了 2026-03-15 的 2.3.1 起“支持 Vite 8”，并在 2.3.4 中针对 Vite 8 使用 `codeSplitting: false`（Vite ≤7 用 `inlineDynamicImports: true`）——见 <https://github.com/richardtallent/vite-plugin-singlefile/blob/main/CHANGELOG.md>。源码中按 `viteMajor >= 8` 分支判断，见 <https://github.com/richardtallent/vite-plugin-singlefile/blob/main/src/index.ts>。

**推荐 Vite 8.3.5**：它是 `@vitejs/plugin-react@6` 的硬性 peer 目标，且单文件插件已明确适配。代价是 Vite 8 底层换成 Rolldown（`vite@8.3.5` 的 `dependencies` 含 `rolldown ~1.2.14`），生态面比 Vite 7 窄一些。

**记录在案的退路**：若 Vite 8 在真实工程中复现 Rolldown 相关问题，退回 `vite@7.3.7` + `@vitejs/plugin-react@5.2.0`（peer `^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0`）。此组合实测可用（单文件产出仅一个 HTML、内联 Worker 在 `file://` 下成功）。退路只作应急，不作为并行方案。

## 单文件打包

`vite-plugin-singlefile` 把 Vite 产出的 JS、CSS 直接写进 `index.html`，不留附属文件，正是“双击运行”的目标形态。README 明确其定位就是离线单页应用，见 <https://github.com/richardtallent/vite-plugin-singlefile>。

必须知道的行为与限制（均出自该 README 与 CHANGELOG）：

- **单入口**：只支持一个 HTML 入口，多入口场景不受支持且会被标记 `wontfix`。
- **`public/` 静态资源不会被内联**：插件只处理 JS 与 CSS；放在 `public/` 的文件仍会作为独立文件输出。本项目不设 `public/` 静态资源，图标用组件内联 SVG 或图标组件，避免产生外部文件。
- **SVG 不被直接内联**，需放进模板或走 `vite-svg-loader` 之类方案。
- **CSP**：若页面自带 CSP `<meta>` 且 `script-src`/`style-src` 不含 `'unsafe-inline'`、hash 或 nonce，内联脚本会被浏览器拦截；插件会在构建期告警。本项目不添加 CSP meta。
- **Sourcemap**：内联发生在 sourcemap 生成之后，单文件下无意义；`deleteInlinedFiles` 保持默认 `true`。
- **动态 `import()`/懒加载 chunk** 若残留非内联引用，会在 `file://` 下加载失败；README 指向 issue #121 建议换用其它插件。本项目不使用路由或懒加载。
- `outputFileName` 选项（2.3.4 新增）可直接指定产物名，正好满足 `release/genshin抽卡模拟器.html`，无需构建后再改名。

实测（验证工程 `singlefile-spike`，`vite@8.3.5` + `vite-plugin-singlefile@2.3.4`，工程细节见[验证工程记录](#验证工程记录可复现性附录)）：

```
viteSingleFile({ removeViteModuleLoader: true, outputFileName: 'genshin抽卡模拟器.html' })
build.outDir = 'release'
→ release/genshin抽卡模拟器.html
```

中文文件名正常产出（实测）。`build.outDir` 直接设为 `release`，与[技术契约的目录约定](engineering.md#目录约定)一致，不另设 `dist/`。

产物体积参考（实测，均为完整 antd + React 19.3.1 + 单文件插件，产物只有一份 HTML；原始构建输出见[验证工程记录](#验证工程记录可复现性附录)）：

| 页面用到的组件 | 单文件 HTML | gzip |
| --- | --- | --- |
| Form、InputNumber、Button、Progress、Collapse、Table、Tag、Statistic | 905 KB | 289 KB |
| Table、Pagination、Select | 806 KB | 257 KB |
| Button + `PlayCircleOutlined`/`ReloadOutlined`/`StopOutlined` | 371 KB | 123 KB |

量级说明：只要引入 antd，基线就在数百 KB；增量取决于用到的组件与图标数量。单文件没有网络加载成本，体积主要影响首字节解析，900 KB 级别可接受。真实应用的最终体积应在界面铺完后实测记录，不按本节外推。

## Worker：本项目最关键的打包风险

### 事实

1. Vite 默认把 Worker 输出成**独立 chunk 文件**；只有加 `?worker&inline` 才会以 base64/字符串形式内联。官方文档：<https://vite.dev/guide/features>（Web Workers 一节）与 <https://vite.dev/guide/assets#importing-script-as-worker>。
2. `vite-plugin-singlefile` **不会**自动内联 Worker 文件。它只识别 JS/CSS；未被识别的产物走 `NOTE: asset not inlined` 告警后留在磁盘上（源码 `generateBundle` 逻辑，见 <https://github.com/richardtallent/vite-plugin-singlefile/blob/main/src/index.ts>）。社区曾提 PR #115 增加 `inlineWorkers` 选项，截至 2026-10-23 仍为 **open、未合并**（<https://github.com/richardtallent/vite-plugin-singlefile/pull/115>）；issue #100 记录的同样是“`?worker` 后缀被忽略、worker 仍单独输出”（<https://github.com/richardtallent/vite-plugin-singlefile/issues/100>）。
3. `file://` 页面无法用相对路径构造 Worker：`Worker` 构造器的 `url` 必须是同源地址或 `blob:`/`data:` URL（MDN：<https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker>）。`file://` 页面 origin 为 `null`，因此指向独立文件的 Worker 会被拒绝。

### 实测对照（Chromium，`file://` 打开构建产物）

| 写法 | 构建产物 | `file://` 结果 |
| --- | --- | --- |
| `import W from './x?worker&inline'` | 仅 `index.html` | **成功**（走 blob，实际计算正确） |
| `import W from './x?worker'` | 额外 `x-[hash].js` | **失败**：`SecurityError ... cannot be accessed from origin 'null'` |
| `new Worker(new URL('./x.ts', import.meta.url))` | 额外 `x-[hash].js` | **失败**，同上 |
| `?worker&inline` + `worker.format: 'es'` | 仅 `index.html` | **失败**（module blob worker 在 Chromium `file://` 下抛错） |

同一套源码换成 `worker.format` 默认值 `iife` 即恢复正常。可见“内联成功”不等于“能跑”，**Worker 输出格式也是硬约束**。

实测还确认：`?worker&inline` 的包装器先试 `URL.createObjectURL(new Blob(...))`，失败则回退 `new Worker('data:text/javascript...')`；两条路径在 Chromium `file://` 下都能启动纯计算 Worker，页面只产生 `file:` 与 `blob:` 两类请求，无任何网络请求。

### 官方内联方案（本项目的实现约定）

```ts
// 唯一允许的 Worker 引入方式
import SimulationWorker from './simulation.worker?worker&inline'

const worker = new SimulationWorker()
```

配套约束：

- **只写 `?worker&inline`**，禁止裸 `?worker`、禁止 `new Worker(new URL(...))`、禁止 `worker: { format: 'es' }`。以上三点任一出现都会让离线产物失效。
- Worker 源码必须**自包含**：不 `importScripts` 外部文件、不在 Worker 内动态 `import()`、不在 Worker 内 `fetch` 相对路径。`inline` 打包已把依赖合并进字符串，额外的运行时加载会重新引入外部路径。
- `build.assetsInlineLimit` 与 `chunkSizeWarningLimit` 由插件推荐配置自动设置，无需手写；若手动覆盖，保持“一切资源都内联”的语义。
- 取消或重启时 `worker.terminate()`，并回收大型聚合缓冲（对应[技术契约的离线与生命周期](engineering.md#离线与生命周期)）。

### 待验收边界（现在未验证，实施时必须亲自跑）

1. **生产产物只有一份 HTML**：`release/` 目录下除目标 HTML 外无其它文件；构建日志无 `NOTE: asset not inlined`。证据分布要说清：`vite7-spike`（只含 `?worker&inline`）与 `antd-spike` 的 `release/` 下**只有** HTML；`singlefile-spike`（Vite 8）为了做 A/B 对照同时放了一个裸 `?worker`，所以它的构建日志**确实**输出了 `probe.worker-DY13rudu.js`——那是反例证据，不是通过记录。**本项目真实 Worker 尚未编写**，此条必须在项目自己身上重新确认。
2. **真实双击路径可用**：用 `file://` 打开 `release/genshin抽卡模拟器.html`，断网、无 DevTools 特殊开关，Worker 能启动、完成小批次、完成百万次，取消后不残留 Worker。
3. **产物无外部依赖**：抓取全部请求，只允许 `file:` 与 `blob:`（有 `data:` 亦可），不得出现 http(s) 请求、CDN、远程字体。
4. **格式回归**：任何人改动 `vite.config.ts` 的 `worker` 段或新增 Worker 引入，都必须重跑第 1、2 项；建议在构建脚本里加一条“`release/` 下仅 1 个文件”的断言，把这条约束变成机器检查。
5. **Firefox 差异**：本次附带观察到 Chromium 与 Firefox 对 module blob worker 在 `file://` 下的处理不同（Firefox 通过）。这不进入验收矩阵，只作为“为何固定 `iife`”的背景；验收浏览器是 Chromium。

## UI 组件库选型

需求特征（见[产品契约](product.md#呈现约定)）：紧凑深色工具台、大量数字输入与校验、折叠的高级状态、进度、结果表格与排行、中文文案、零运行时网络。以下候选都在 2026-10 仍活跃维护，数据取自 registry 元数据。

| 候选 | 最新版（发布日） | React peer | 包体（unpacked） | 中文与主题 | 结论 |
| --- | --- | --- | --- | --- | --- |
| `antd` | 6.6.7（2026-10-20） | `>=18` | ≈49.0 MB | 内置 `antd/locale/zh_CN`；v6 支持 CSS 变量与 `darkAlgorithm` | **选中** |
| `@arco-design/web-react` | 2.66.18（2026-10-12） | `>=16` | ≈17.2 MB | 有中文包，需额外配置主题 | 备选，组件密度与生态不及 antd |
| `@douyinfe/semi-ui` | 2.104.0（2026-10-09） | `>=16.0.0` | ≈61.0 MB | 中文完善 | 体积最大，收益不抵 |
| `@mantine/core` | 9.7.3（2026-10-17） | `^19.2.0` | ≈10.0 MB | 中文需自行整理；表单强 | 轻，但中文表单要自己补文案 |

来源：<https://registry.npmjs.org/antd>、<https://registry.npmjs.org/@arco-design%2fweb-react>、<https://registry.npmjs.org/@douyinfe%2fsemi-ui>、<https://registry.npmjs.org/@mantine%2fcore>（2026-10-23 读取）。

**选 `antd@6.6.7`。** 理由：

- **开发效率最高**：`Form` + `InputNumber` + `Collapse` + `Progress` + `Table` + `Statistic` 覆盖了产品契约里的全部输入与展示形态，不需要为普通输入、折叠、提示、进度和列表另造组件——这正是[技术契约的选型闸门](engineering.md#选型闸门)要求的。
- **中文与深色开箱可用**：`ConfigProvider locale={zhCN}` 提供中文文案，`theme={{ algorithm: theme.darkAlgorithm }}` 提供深色，紧凑可再用 `componentSize` 与 token 收窄。文档：<https://ant.design/docs/react/i18n-cn/>、<https://ant.design/docs/react/customize-theme>。
- **不需要独立样式表**：antd 5 起采用 CSS-in-JS，样式在运行时注入，没有外部 CSS 需要内联，天然契合单文件；v6 另有 `zeroRuntime` 模式（需手动引入 `antd/dist/antd.css`），本项目**不启用**，保持默认 CSS-in-JS。
- **可离线**：实测单文件产物在断网 `file://` 下渲染正常，中文文案生效，外部请求为 0。

注意项：

- **Vite 生产构建的 locale 陷阱**：官方文档记录过“Vite 生产模式打包后 locale 不生效”，建议从 `antd/es/locale/...` 引入 ESM 形式。本次实测用 `import zhCN from 'antd/locale/zh_CN'` 在 Vite 8.3.5 生产构建下渲染出“暂无数据”，未复现该问题；若出现，改用 `antd/es/locale/zh_CN`。来源：<https://ant.design/components/config-provider-cn/>。
- **v6 只支持现代浏览器**（依赖 CSS 变量），IE 不再支持；本项目目标就是现代浏览器，可接受。<https://ant.design/docs/react/migration-v6/>
- **图标**：见下节，用 `@ant-design/icons@6`，显式声明并只 import 具体图标。

## 图标

**选 `@ant-design/icons@6.3.4`，与 `antd@6` 配套，且只此一套。** MIT、`sideEffects: false`、`peerDependencies` 为 `react >=16.0.0` / `react-dom >=16.0.0`，与 React 19.3.1 和 `antd@6.6.7` 同时匹配。来源：<https://registry.npmjs.org/@ant-design%2ficons>。

选择理由：

- **与 UI 体系同源**：官方图标文档明确要求 `@ant-design/icons@6.x` 配 `antd@6.x`（<https://ant.design/components/icon/>）。用两套图标会出现两套视觉语言与两份包体积，这是技术契约禁止的。
- **SVG 内联，天然离线**：自 3.9.0 起图标为 SVG，官方说明其好处正是“完全不依赖 CDN 图标字体”（同上）。这直接满足无网络字体、无外部资源的离线约束。
- **按需导入即可 tree-shake**：只 `import { PlayCircleOutlined } from '@ant-design/icons'`，不要 `import * as icons`。`sideEffects: false` 保证未用图标被摇掉。
- **不手绘 SVG、不用 emoji 充当操作图标**：按钮上的操作图标一律用该包的 `Outlined`/`Filled` 变体。

注意项：

- `antd@6.6.7` 本身已把 `@ant-design/icons@^6.3.4` 列为直接依赖（见 registry 的 `dependencies`）。仍应在 `dependencies` 中**显式声明**它：直接 import 的包要显式依赖，否则依赖提升行为变化时会意外失效；显式声明同范围也避免出现两份。
- 单文件产物体积由“用了多少组件与图标”决定，不由包体 unpacked 大小决定（unpacked ≈11.1 MB 是发布包体积，不是打包进 HTML 的体积）。实测：antd 的 Form/InputNumber/Button/Progress/Collapse/Table/Tag/Statistic 组合为 905 KB；缩减到 Button + 三个图标为 371 KB。真实应用应在铺完主要界面后**实测**一次产物体积，而非按包体估算。
- 需要图标字体或 iconfont.cn 的场景（`createFromIconfontCN`）**不使用**：它会从 CDN 拉脚本，违反离线约束。

## 测试工具

### Vitest 5.0.5

- 与 Vite 版本同源，复用同一份 `vite.config.ts`，不额外引入打包器。
- 与 Vite 8.3.5 兼容（peer `^6.4.0 || ^7.0.0 || ^8.0.0`），Node 24.20.0 满足 `^24.0.0`。
- **不引入 `jsdom` / `happy-dom`**：规则引擎、试验执行器、统计聚合都是纯 TypeScript，无 DOM 依赖。界面行为交给 Playwright 在真实浏览器里验证，比模拟 DOM 更可信，也少一个依赖。若将来确有组件级测试需求，再单独论证。

测试范围按需求收敛到核心小测试（对应[验收契约](acceptance.md#核心自动化一组小而确定的测试)的五组边界）：概率与保底断点、定轨与目标停机、星辉返还、隔离与复现、统计口径（分母、最近秩分位数、无成功样本）。不做全量状态矩阵、不做覆盖率工程。

实测（仅验证工程 `singlefile-spike`，非本项目；命令与输出见[验证工程记录](#验证工程记录可复现性附录)）：`vitest@5.0.5` 在 Node 24.20.0 + Vite 8.3.5 下 `vitest run` 4 个用例通过（耗时 180 ms），验证了同一 seed 序列一致、不同 seed 序列不同、`jump()` 原地推进、`clone()` 分叉。这只证明工具链能跑，不构成项目验收。

### Playwright 1.64.1

- `engines: >=20`，Node 24.20.0 满足。
- **直接支持 `file://` 导航**：维护者在 issue 中给出 `page.goto(pathToFileURL(...))` 的用法（<https://github.com/microsoft/playwright/issues/7943>），仓库测试 `NA-002 should work with file URL` 亦覆盖该场景（<https://github.com/microsoft/playwright/blob/main/tests/page/page-goto.spec.ts>）。这正好满足[验收契约](acceptance.md#一次浏览器冒烟与一次性能运行)“必须打开 `file://` 产物、开发服务器不能替代”的要求。
- 只用 **Chromium 单浏览器**：一次离线冒烟（打开产物、断网、跑小批次、跑一次百万次、看进度与取消、截 1440px 与 390px 两张图）。不做跨浏览器矩阵。

## 随机数

**`pure-rand@8.4.2`。** MIT、零运行时依赖、`sideEffects: false`、TypeScript 编写，周下载量约 5260 万（`https://api.npmjs.org/downloads/point/last-week/pure-rand`，2026-10-23 读取）。仓库：<https://github.com/dubzzz/pure-rand>。

选用它是因为它把“可复现”和“无偏”都做对了：

- 推荐生成器 `xoroshiro128plus`，`seed: number` 进去，同 seed 得同序列（实测验证）。
- **`uniformInt(rng, min, max)` 是会原地推进 `rng` 的**，返回本次数值；要纯函数风格用 `purify()` 包装成 `[value, nextRng]`。README 两种用法都有。
- **`jump(): void` 原地跳转、返回 `undefined`**；需要分叉用 `clone()`。这一点容易误用，已实测确认（最初按“jump 返回新生成器”写的用例会失败）。
- **只有子路径导出，没有根入口**：必须写 `pure-rand/generator/xoroshiro128plus`、`pure-rand/distribution/uniformInt` 这样的完整路径，`import { … } from 'pure-rand'` 会失败（`exports` 映射无 `.` 键，实测 registry 元数据确认）。类型声明随子路径提供。
- 种子按试验编号派生（对应[技术契约的性能节](engineering.md#百万模拟性能)），使调度变化不影响同种子结果。

性能未达标时再实测替换，不以预判替换换库。

## 明确不引入

| 不引入 | 原因 |
| --- | --- |
| 图表库（ECharts/Recharts 等） | 首期无图表需求，数字指标用 `Table`/`Statistic`/纯 CSS 直方图足够；重型可视化库会显著增大单文件 |
| 全局状态库（Zustand/Redux 等） | 状态规模只有一份配置 + 一份结果，React 自身状态足够；[技术契约](engineering.md#选型闸门)明确“状态规模不构成引入全局状态库的理由” |
| `jsdom` / `happy-dom` | 引擎为纯 TS，界面验证交给真实浏览器 |
| 第二套图标库（Lucide 等） | `@ant-design/icons` 已与 UI 体系配套，够用；“每类只选一个” |
| 图标字体 / `createFromIconfontCN` | 从 CDN 拉脚本或字体，破坏离线 |
| 路由、懒加载、i18n 框架 | 单页、单语言、单文件；动态 `import()` 反而会破坏内联 |

## 落地顺序与风险提示

1. 先固化 `vite.config.ts`：`outDir: 'release'`、`viteSingleFile({ removeViteModuleLoader: true, outputFileName: 'genshin抽卡模拟器.html' })`、**不设** `worker` 段。
   `outputFileName` 是 2.3.4 新增选项，直接产出中文文件名（实测），因此[构建契约](build.md)中“构建后用 Node 文件 API 重命名”的步骤可以简化为构建后校验文件名与目录内容，不必再实现重命名逻辑；该做法仍符合构建契约“用 Node 文件 API 处理重命名和完整性检查，不依赖终端编码”的意图。
2. 第一个 Worker 写出来时立刻做离线验证（不看开发服务器）。这是全项目最容易“看起来完成了、其实双击打不开”的地方。
3. antd 主题先定 token（深色 + 紧凑），再铺组件；避免铺完再统一改密度。
4. 图标只 import 具体组件，禁止 `import * as` 或整包引入；按钮上的操作图标用 `@ant-design/icons`，不手绘 SVG、不用 emoji。
5. TypeScript 用 7.0.2：`tsc --noEmit` 实测通过 React 19 + antd 6 工程（exit 0）。**注意 7.0 不提供稳定的编程式 API，7.1 才补**（<https://www.infoq.com/news/2026/08/typescript-7-released/>，官方说明见 <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/>）。因此凡是依赖 TypeScript 编译器 API 的工具（`typescript-eslint` 等）暂不可用——本项目当前不使用它们；若要引入 ESLint 的类型感知规则，先回到 6.x 或用 `@typescript/typescript6` 并存方案。

## 未验证项

以下事项本文件**没有**证据，实施时必须补齐或明确记录为未完成：

- 本项目自身的构建尚未发生；上述实测全部来自一次性验证工程。
- 真实抽卡 Worker 的离线行为、百万次耗时与取消延迟均未测量。
- `vite.config.ts` 在开发模式（`vite dev`）下的 HMR 行为未验证——只验证了 `vite build`。
- antd 在 390px 窄屏下的实际排版与触屏热区未验证。
- 单文件产物的最终体积与真实 Worker 内联后的增长未测量。
- Vite 8 依赖 Rolldown（`vite@8.3.5` 的 `dependencies` 含 `rolldown ~1.2.14`），本项目仅在极小的验证工程上跑通；大规模工程下的 Rolldown 特有问题未验证。出现问题时按“Vite 8 与 Vite 7 的取舍”一节退回 Vite 7 组合。

## 验证工程记录（可复现性附录）

验证工程为一次性工程，核验结束即删除，**目录已不存在**。以下是当时的完整可重做步骤与原始输出摘录，供复核；按其重建即可复现本文所有“实测”结论。所有命令在 Windows 11、Node v24.20.0、npm 12.0.2 下执行；工程均建在系统临时目录，与本仓库无关。

重建时把 `<tmp>` 替换成自建的临时目录；结论不依赖具体路径。

### 工程 A：Vite 8 + 单文件 + Worker（`singlefile-spike`）

目录位于系统临时目录下（`<tmp>/singlefile-spike`），结构：

```
singlefile-spike/
  package.json      vite ^8.3.5, vite-plugin-singlefile ^2.3.4, typescript ^7.0.2
  vite.config.ts
  index.html
  src/main.ts       Worker 调用方
  src/probe.worker.ts
  src/rng.test.ts   Vitest 用例
```

`vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [viteSingleFile({
    removeViteModuleLoader: true,
    outputFileName: 'genshin抽卡模拟器.html',
  })],
  build: {
    outDir: 'release',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
})
```

命令与输出（逐字摘录）：

```text
$ npm install --no-audit --no-fund
added 18 packages in 6s

$ npm run build
vite v8.3.5 building client environment for production...
✓ 6 modules transformed.
rendering chunks...
[plugin vite:singlefile]
[plugin vite:singlefile] Inlining: index-DlTYglPy.js
computing gzip size...
release/probe.worker-DY13rudu.js     0.12 kB
release/genshin抽卡模拟器.html       1.43 kB │ gzip: 0.80 kB
✓ built in 51ms
```

**这条输出本身就是 Worker 风险的证据**：`probe.worker-DY13rudu.js` 是一个独立文件，留在了 `release/` 里；同一工程里的 `?worker&inline` 引用则在 HTML 内部以 Blob 形式存在，没有产生文件。中文文件名 `genshin抽卡模拟器.html` 由 `outputFileName` 直接产出，构建后无需重命名（实测）。

Vitest（同一工程）：

```text
$ npx vitest run
RUN  v5.0.5 C:/Users/.../singlefile-spike
Test Files  1 passed (1)
     Tests  4 passed (4)
  Duration  180ms
```

浏览器验证方式：用 Playwright 的 Chromium（153.0.8010.12）执行

```js
await page.goto('file:///<tmp>/singlefile-spike/release/genshin抽卡模拟器.html')
```

结果（这些跑分来自同一工程的数轮构建，每轮的对照写法与投入规模略有不同，故 `n` 值不一）：

| 被测写法 | 结果 |
| --- | --- |
| `?worker&inline`（`worker.format` 默认 `iife`） | `OK {"sum":8999994,"n":3000000}` |
| `?worker&inline`（另一轮，`n=1000000`） | `OK {"sum":2999997,"n":1000000}` |
| `?worker`（独立 chunk） | `THROW SecurityError: Failed to construct 'Worker': Script at 'file:///.../probe.worker-DY13rudu.js' cannot be accessed from origin 'null'.` |
| `new Worker(new URL('./probe.worker.ts', import.meta.url))` | `THROW SecurityError`，同上，指向同一个独立文件 |
| `?worker&inline` + `worker: { format: 'es' }` | 同一 `?worker&inline` 导入从 `OK` 变为 `ERROR`（无错误文本）——只改输出格式就破坏了内联 Worker |
| `?worker&inline` 的请求列表 | 仅 `file://.../genshin抽卡模拟器.html` 与 `blob:null/<uuid>`，无任何 http(s) 请求 |

Firefox（1449）对照：同一 `?worker&inline` + `format: 'es'` 产物在 Firefox 下通过。这说明 ES 格式失败是 Chromium `file://` 的具体行为，不是构建配置写错；结论仍是固定 `iife` 以覆盖 Chromium。

### 工程 B：Vite 7 退路（`vite7-spike`）

```
vite@7.3.7 + vite-plugin-singlefile@2.3.4，默认 worker 格式
$ npm run build
vite v7.3.7 building client environment for production...
✓ 4 modules transformed.
release/index.html  1.17 kB
✓ built in 122ms
```

`release/` 下**只有** `index.html`（无 Worker 文件）；Chromium `file://` 下 `?worker&inline` 返回 `OK {"sum":5999995,"n":2000000}`。Vite 7 的产物把 Worker 内联为字符串常量 + Blob，与 Vite 8 行为一致。

### 工程 C：antd 体积与离线（`antd-spike`）

依赖：`react`/`react-dom` 19.3.1、`antd` 6.6.7、`@ant-design/icons` 6.3.4、`@vitejs/plugin-react` 6.1.2、`typescript` 7.0.2。

```text
$ npm run build          # 组件较全：Form/InputNumber/Button/Progress/Collapse/Table/Tag/Statistic
out/index.html  905.06 kB │ gzip: 289.35 kB
✓ built in 473ms
```

缩减到 Table + Pagination + Select：

```text
out/index.html  805.60 kB │ gzip: 256.68 kB
✓ built in 321ms
```

只留 Button + 三个图标：

```text
out/index.html  371.21 kB │ gzip: 123.42 kB
✓ built in 352ms
```

离线渲染核对（Chromium，`file://`）：页面文本为 `组合暂无数据暂无数据50 条12345请选择`，antd 空态文案渲染为中文“暂无数据”，`button svg` 计数为 3（图标为内联 SVG），外部请求为 `[]`，`pageerror` 为 `[]`。

类型检查：

```text
$ npx tsc --version
Version 7.0.2

$ npx tsc --noEmit
EXIT=0
```

（过程中有一次 `TSC_EXIT=1`，原因是我在验证代码里传了 `locale={{}}`，antd 的 `Locale` 类型要求完整对象；改为 `locale={zhCN}` 后通过。这是验证代码的错，不是库或配置问题，记录在此以免被误读为 antd 的缺陷。）

### 工程 D：`file://` 下的 Worker 机制探针

用手写 HTML（非 Vite）分别构造四类 Worker 并读取结果，排除“是不是 Vite 打包导致”的干扰：

| 构造方式 | Chromium `file://` | Firefox `file://` |
| --- | --- | --- |
| `new Worker(URL.createObjectURL(blob))`（classic） | 通过 | 通过 |
| `new Worker(blobUrl, { type: 'module' })` | 失败 | 通过 |
| `new Worker('data:text/javascript,...')` | 通过 | 通过 |
| `new Worker('relative.worker.js')` | `SecurityError ... origin 'null'` | 通过 |

结论：`file://` 下**只能**用 Blob 或 data URL，且 Chromium 不接受 module 类型的 Blob Worker。这正是必须固定 `?worker&inline` + `iife` 的根本原因。

## 来源清单

| 主张 | 来源 | 读取日期 |
| --- | --- | --- |
| Vite Worker 的 `?worker&inline` 语义、默认输出独立 chunk、`worker.format` 默认 `iife` | <https://vite.dev/guide/features> · <https://vite.dev/guide/assets> · <https://vite.dev/config/worker-options> | 2026-10-23 |
| `Worker` 构造器 url 必须同源或 `blob:`/`data:` | <https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker> | 2026-10-23 |
| 单文件插件能力、`public/` 与 SVG 不内联、CSP 告警、单入口限制 | <https://github.com/richardtallent/vite-plugin-singlefile> | 2026-10-23 |
| Vite 8 适配（`codeSplitting` 分支）、`outputFileName` 新增 | <https://github.com/richardtallent/vite-plugin-singlefile/blob/main/CHANGELOG.md> · <https://github.com/richardtallent/vite-plugin-singlefile/blob/main/src/index.ts> | 2026-10-23 |
| 单文件插件不内联 Worker；社区提案未合并 | <https://github.com/richardtallent/vite-plugin-singlefile/pull/115> · <https://github.com/richardtallent/vite-plugin-singlefile/issues/100> | 2026-10-23 |
| antd 中文文案与深色算法、CSS-in-JS 与 `zeroRuntime`、Vite 生产 locale 注意事项 | <https://ant.design/docs/react/i18n-cn/> · <https://ant.design/docs/react/customize-theme> · <https://ant.design/components/config-provider-cn/> · <https://ant.design/docs/react/migration-v6/> | 2026-10-23 |
| Playwright 支持 `file://` 导航 | <https://github.com/microsoft/playwright/issues/7943> · <https://github.com/microsoft/playwright/blob/main/tests/page/page-goto.spec.ts> | 2026-10-23 |
| 图标为内联 SVG、`antd@6` 需配 `@ant-design/icons@6.x` | <https://ant.design/components/icon/> · <https://registry.npmjs.org/@ant-design%2ficons> | 2026-10-23 |
| `pure-rand` 的生成器、分布、`purify`、`jump`/`clone` | <https://github.com/dubzzz/pure-rand> · <https://registry.npmjs.org/pure-rand> | 2026-10-23 |
| TypeScript 7 无编程式 API、7.1 补齐 | <https://www.infoq.com/news/2026/08/typescript-7-released/> · <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/> | 2026-10-23 |
| 各包版本、发布日、`engines`、peer、许可 | `https://registry.npmjs.org/<pkg>`（见“兼容性证据”一节逐包链接） | 2026-10-23 |
