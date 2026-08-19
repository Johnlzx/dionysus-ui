# Dionysus 前端设计语言总结与 Web 复用方案

> 文档性质：现状审计、设计语言定义、Desktop → Web 可行性评估与实施路线。  
> 审计日期：2026-08-03。  
> 审计范围：当前仓库 Renderer 源码、现有活规范、代表性业务页面、平台适配器与第三方来源记录。  
> 名称说明：口述中的 “Motica” 根据仓库现有审计记录应为 **Multica**；本文统一使用 Multica。
> 实施进度：已建立 `packages/ui` 与 `apps/web` 第一条纵向切片，包含共享 Token、Button、Badge、Avatar、Input、SearchField、DropdownMenu、Surface、Dialog、SegmentedControl、主题控制、专业设计系统信息架构、浏览器路由、搜索及预览/代码切换；Desktop 消费共享包与完整业务 Web 化仍按本文后续阶段推进。

## 1. 结论先行

这项工作**好做，但不能按字面意义直接复制一份前端**。

当前 Electron Renderer 本质上已经是一套 React 浏览器应用：视觉 Token、基础组件、布局原语和绝大多数页面只使用 DOM、CSS 与浏览器 API。真正与 Electron 绑定的代码集中在少数位置，包括窗口拖拽区、Keychain 会话桥、本地知识库 IPC 与 `dionysus-asset:` 图片协议。因此：

- 只把当前大屏工作台的视觉语言迁移到 Web，属于**中等偏低难度**。
- 把登录、普通列表、文章看板和 AI 创作主界面迁移到 Web，属于**中等难度**。
- 把本地知识库文件系统、SQLite 语义层和本地图片协议在浏览器中做成完全等价体验，属于**中高难度**，它已经不是纯前端复制问题。
- 建设一套真正可复用、可独立维护的设计语言，难点不在 CSS，而在**代码边界、响应式、路由、平台适配和许可证清理**。

推荐的长期结果不是 `desktop-ui` 和 `web-ui` 两份副本，而是：

```text
同一个 monorepo
├── packages/design-tokens   颜色、字体、间距、圆角、阴影和主题
├── packages/ui              Button、Input、DropdownMenu、Surface、Dialog 等原子组件
├── packages/ui-patterns     AppShell、Page、Collection、Workflow 等页面模式
├── packages/product-ui      可选：纯展示型业务视图与 view-model
├── apps/desktop             Electron 平台适配器 + 桌面组合根
└── apps/web                 Web 平台适配器 + URL 路由 + Web 组合根
```

这样 Desktop 与 Web 消费同一套源码，视觉修复只发生一次。本次实施已把增加 `apps/web` 与 `packages/ui` 作为明确的 L1 架构变更，并同步根级与父级地图；Desktop 仍保留现有内部组件，后续迁移完成后才能真正消除双份实现。

## 2. 本次审计看了什么

主要事实来源：

- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)：当前设计原则、组件与页面契约。
- [`../packages/ui/src/styles.css`](../packages/ui/src/styles.css)：当前唯一视觉 Token 和 light/dark 真相源。
- [`../packages/ui/src/primitives.tsx`](../packages/ui/src/primitives.tsx)：当前共享 UI 原语，包括 Button、Badge、Avatar、Input、SearchField、Surface、Dialog 与 SegmentedControl。
- [`../packages/ui/src/dropdown-menu.tsx`](../packages/ui/src/dropdown-menu.tsx)：当前共享 DropdownMenu 原语，覆盖搜索、多选、分组与指令项。
- 历史 Desktop 来源：`app/styles.css`、`shared/layout/`、`shared/ui/` 与 `features/*` 是本方案审计时的视觉和交互基线；当前独立仓库只保留 Web 设计系统纵向切片。
- [`../THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md)：Multica、React Bits 与 React Bits Pro 的来源和本地审计结论。

初次审计以真实组件源码、Token 数值、页面组合和已有活规范为依据；当前独立仓库的验证入口是根目录 `pnpm typecheck` 与 `pnpm build`，需要先安装 Workspace 依赖。

## 3. 这套设计语言是什么

### 3.1 一句话定义

它是一套**冷静、低饱和、内容优先的生产力工作台设计语言**：用大面积中性色搭建安静的应用外壳，把真实工作内容放进略微抬升的 inset canvas，通过细微灰阶、轻边框、短距离层级和紧凑控件表达结构，只在状态、确认和 AI 进行中反馈里使用小面积颜色。

从风格谱系看，它属于 Linear 推动流行的 “quiet productivity UI / neo-utility workspace” 分支，并结合了：

- Multica 的桌面工作台密度、侧栏、看板与表面层级；
- shadcn/ui Base Nova 的中性组件比例和 CSS Variable 组织方式；
- Base UI 的无样式交互与可访问性原语；
- React Bits 的玻璃折射与受控 AI 动效；
- Dionysus 自己的人工确认、可回退和作者最终控制权语义。

### 3.2 视觉气质

这套界面的情绪不是“兴奋”，而是“专注”。它传达的关键词是：

- 理性、克制、安静；
- 精密，但不工程化到冷漠；
- 紧凑，但不拥挤；
- 专业，但不使用传统企业软件的厚重边框；
- 有 AI 能力，但不采用大面积紫蓝渐变、机器人形象或持续发光来抢夺注意力；
- 强调可控和可逆，而不是鼓励用户把判断权交给自动化。

### 3.3 设计哲学

#### 内容是舞台，界面是脚手架

侧栏、顶栏和工具栏的存在是为了让用户知道自己在哪里、能做什么；它们不应与文章、大纲、素材和审校信息竞争。视觉装饰越接近常驻导航，就越应该安静。

#### 层级主要由明度和距离建立

页面不依赖大量彩色卡片。App Shell、Canvas、Surface、Raised Surface 依次通过非常小的明度差、边框与阴影建立前后关系。这种处理让页面在信息密集时仍然稳定。

#### 颜色是语义，不是装饰

蓝色不是“让页面更科技”，绿色不是“让页面更丰富”。品牌、成功、警告、信息和危险色只承担状态意义。看板列的大面积状态色也被压到约 5% 的背景浓度。

#### 状态必须连续可感知

交互不是 rest 和 click 两个瞬间，而是 rest → hover → pressed → selected → focus-visible → disabled 的连续系统。Hover 比 Selected 更轻，避免用户误判临时经过和持续选择。

#### AI 是一种受控能力

AI 可以出现，但不成为视觉中心。只有真实生成中的短时状态允许 Fog Sphere 占据内容画布；发布、覆盖、账号连接等高风险操作仍以明确按钮、说明和确认对话框表达用户主权。

#### 高级感来自纪律，而不是效果数量

圆角、间距、阴影、字重、图标描边和状态反馈必须复用同一套尺度。Glass、Border Beam 和 Fog Sphere 是稀缺资源，只在它们能表达特殊材质或真实状态时出现。

## 4. 布局语言

### 4.1 总体构图：侧栏 + 顶部窄带 + inset canvas

```text
┌──────────────────────────── App Shell / 中性底板 ────────────────────────────┐
│ macOS 窗口区与侧栏工具       │ 48px 顶部标签窄带                             │
│                              ├──────────────────────────────────────────────┤
│ 256px 一级导航               │ ╭──────── 主内容 inset canvas ─────────────╮ │
│ 可收缩为 56px                │ │ PageHeader 48px                           │ │
│                              │ ├───────────────────────────────────────────┤ │
│                              │ │ PageToolbar 约 48px                       │ │
│                              │ ├───────────────────────────────────────────┤ │
│                              │ │ 列表 / 看板 / 编辑器 / 创作工作区         │ │
│ 身份与主题位于底部           │ ╰───────────────────────────────────────────╯ │
└─────────────────────────────────────────────────────────────────────────────┘
```

核心尺寸：

| 区域 | 当前尺寸 | 设计含义 |
| --- | ---: | --- |
| 展开侧栏 | 256px | 承载一级导航、工作区和身份，不挤压文字 |
| 收缩侧栏 | 56px | 只保留图标和 Tooltip/title 语义 |
| 顶部窗口/标签区 | 48px | 桌面拖拽区、当前标签与全局快捷操作 |
| 主画布外侧间隙 | 右 8px、下 8px | 让内容成为悬浮在 App Shell 上的内嵌画布 |
| 主画布圆角 | 12px 左右 | 外层画布比内部控件更柔和 |
| PageHeader | 48px | 页面身份、描述和页面级操作 |
| PageToolbar | 最小 48px | 搜索、筛选、视图切换、主操作 |
| 看板列 | 280px | 横向滚动时保持卡片信息密度 |
| 知识库树 | 288px | 文件名、层级和操作共存的最低稳定宽度 |
| 创作素材栏 | 256px | 与主侧栏形成相同节奏 |
| 创作对话/复核栏 | 当前 360px | 保证对话、写作计划和引用列表可读 |

用户描述的“左侧留白大、上方和右侧留白窄、主体在悬浮卡片里”基本准确。更严格地说，左侧不是单纯 padding，而是一个长期存在的导航工作区；顶部也不是纯留白，而是桌面窗口和标签语义带。主内容通过右下 8px 间隙、12px 圆角、1px ring 和轻阴影成为视觉上的“浮岛”。

### 4.2 布局不是一种，而是四级模式

#### App Shell

负责全局定位，不承载业务内容。侧栏、顶部标签和主画布是稳定骨架。

#### Page primitives

`Page → PageHeader → PageToolbar → PageContent` 提供所有常规页面的垂直节奏。页面标题与工具不会随着内容滚动消失。

#### Workspace patterns

- Collection：标题、搜索/筛选、列表容器、状态行。
- Workflow Board：固定列宽、横向滚动、阶段轻着色。
- Tree → Workbench：左侧组织结构，右侧编辑或阅读。
- Context → Canvas → Agent：素材、大纲/正文和对话三栏协作。

#### Reading canvas

Markdown 阅读区把正文约束在 `max-w-3xl`，长文使用 14px 字号和 28px 行高；工作区可以铺满宽度，阅读内容不能无限拉宽。这是“工作空间宽、阅读行长窄”的双重容器逻辑。

## 5. 颜色与表面

### 5.1 色彩基底

整套颜色是带极轻冷紫倾向的 zinc/gray 家族，而不是纯中性灰。Light 模式不使用同一块白色铺满页面，而是制造四层很小的明度差：

| 层级 | Light | Dark | 作用 |
| --- | --- | --- | --- |
| App Shell | `oklch(0.964435 0.001327 286.375)` | `oklch(0.155 0.005 285.823)` | 应用外框与侧栏底板 |
| Page Canvas | `oklch(0.988087 0 0)` | `oklch(0.18 0.005 285.823)` | 主工作画布 |
| Surface | `oklch(1 0 0)` | `oklch(0.21 0.006 285.885)` | 常驻信息容器 |
| Raised Surface | `oklch(1 0 0)` | `oklch(0.235 0.007 285.885)` | Dialog、Menu 等浮层 |
| Hover | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | 临时指针反馈 |
| Selected | `oklch(0.935 0.003 286.375)` | `oklch(0.3 0.006 286.033)` | 持续选择 |

Dark 模式使用深灰而非纯黑。这样既保留暗色界面的沉浸感，也避免纯黑背景与白色文字形成过硬的 OLED 式反差。

### 5.2 语义色

| 语义 | 色相倾向 | 当前用途 |
| --- | --- | --- |
| Brand | 冷蓝，约 255° | Logo、Composer 聚焦、少量关键强调 |
| Info | 蓝色，约 250° | 链接、待发布和信息状态 |
| Success | 绿色，约 145° | 保存、通过、在线和安全状态 |
| Warning | 琥珀色，约 85° | 进行中、风险、待补材料 |
| Destructive | 红色，约 22–27° | 删除、失败、不可逆动作 |

语义色的使用策略比具体色值更重要：

- 大面积区域只使用约 5%–12% 的透明背景；
- 高纯度颜色主要出现在小图标、文字、Badge、焦点环和极细边框；
- 同一屏不应并列大量状态色；
- 危险操作采用低饱和浅红底和红色文字，而不是整块高纯红按钮；
- Avatar 的紫、蓝、琥珀、青、玫红属于身份区分系统，不进入普通页面装饰。

### 5.3 Surface 层级

当前表面顺序清晰：

1. App Shell：承载应用轮廓。
2. Page Canvas：主要工作面。
3. Surface：卡片、列表、设置组。
4. Raised Surface：临时浮层。
5. Glass Surface：只在长画布的紧凑操作条使用。

分隔策略遵循：**间距优先于 divider，divider 优先于背景变化，背景变化优先于 Card**。这是这套设计避免“满屏卡片”的关键。

### 5.4 阴影和光线

- 常驻 Surface 只有 1–2px 的轻阴影，目的是从近似背景中分离，不制造明显悬浮。
- Menu 与 Dialog 使用更远、更软的阴影。
- Composer 只在 focus-within 后出现品牌色细环和更深阴影。
- Glass Surface 同时使用内高光、内底边和外阴影，模拟单一上方光源。
- Dark 模式阴影明显增强，但背景本身的层级仍然存在，不靠阴影单独区分。

## 6. 字体与信息密度

### 6.1 字体角色

- UI：Inter Variable；中文回退 PingFang SC、Microsoft YaHei、Noto Sans CJK SC。
- 等宽：SFMono-Regular、Consolas、Liberation Mono。
- 数字、编号、路径、快捷键和代码使用等宽或 tabular figures。

Inter 的优势是安静、紧凑、跨平台稳定，符合 Linear 式生产力工具；它的弱点是品牌辨识度有限。当前系统的“独特性”主要来自布局纪律与状态策略，而不是字形人格。

### 6.2 尺度与字重

| 角色 | 当前典型值 |
| --- | ---: |
| Micro 元数据 | 10px / 14px |
| 紧凑按钮 | 12.8px / 16px |
| 次级信息 | 12px |
| 主界面正文 | 14px |
| 重要正文 / 小标题 | 16px |
| 页面级短标题 | 20–24px |
| 长文正文行高 | 28px |

字重只用 Regular 400 与 Medium 500，不使用 Bold/Semibold。层级更多通过明度、留白、字号和位置建立。这让界面不容易出现“每个区域都在喊”的问题。

## 7. 间距、圆角与控件比例

### 7.1 间距

基础节奏是 4px 网格：

- 4px：图标与短标签、紧密同类操作；
- 8px：同一控件内部、连续列表项；
- 12px：卡片内部小分区；
- 16px：区块之间；
- 24px：页面大节和阅读画布外围。

### 7.2 圆角

- 基准 `--radius: 10px`；
- 小按钮和紧凑项约 6–8px；
- 普通按钮、输入框约 8–10px；
- Surface 与主画布约 10–14px；
- 对话气泡可以到 16px，并通过一个角收紧表达方向；
- 圆形只留给 Avatar、计数器和少量 icon-only 操作。

外层容器的圆角通常大于内部控件，形成自然嵌套，而不是所有元素统一一个半径。

### 7.3 控件密度

常规按钮和输入框主要为 32px 高，小按钮为 24–28px，大表单按钮为 36–40px。图标通常为 12–16px，侧栏图标描边约 1.8。它是一套桌面生产力工具密度，不是触屏优先的 44px 控件体系。

## 8. 交互与动效

### 8.1 常规反馈

- Hover：150ms 左右的背景/前景变化，不缩放、不突然加深阴影。
- Pressed：按钮向下移动 1px，模拟实体按压。
- Selected：背景和字重/前景至少改变两个维度。
- Focus-visible：明确 ring，只在键盘焦点需要时出现。
- Disabled：保留原语义并降低不透明度，不把控件彻底隐藏。
- Menu/Dialog：约 100–150ms 的轻微 opacity + 0.98 scale 过渡。

### 8.2 特殊动效

- Shiny Text：只用于真实短时异步过程。
- Border Beam：只有 Composer 内容可发送时才沿圆形发送按钮边框运行。
- Glass Surface：用于长画布内 sticky 工具条，滚动内容成为真实折射背景。
- Fog Sphere：只在材料成纲进行时占据中央大纲区域；Header 和右侧对话保持稳定。

所有特殊动效都支持 `prefers-reduced-motion`。Fog Sphere 还限制 DPR、ray march 和 turbulence 次数，体现“视觉效果必须服从设备成本”的工程意识。

## 9. 组件与页面模式资产盘点

### 9.1 可直接抽成 Web 共享包

| 类别 | 现有资产 | 判断 |
| --- | --- | --- |
| Foundation | CSS Variables、light/dark、字体、滚动条、selection | 高可复用 |
| Actions | Button 6 个变体、7 个尺寸 | 已进入 `packages/ui` |
| Signals | Badge、Avatar | 已进入 `packages/ui`；ShinyText 属于后续原语 |
| Inputs | Input、SearchField | 已进入 `packages/ui`；OneTimeCodeInput 属于后续原语 |
| Surfaces | Surface、Dialog、DropdownMenu | 已进入 `packages/ui`；ContextMenu 属于后续复杂原语 |
| Structure | TreeView、MarkdownEditor | 后续复杂原语，业务契约需要文档化 |
| Layout | Page primitives | 后续布局原语 |
| Theme | ThemeToggle | 高可复用，持久化策略需可注入 |

这些组件没有导入 Electron、Node 或业务 Feature，已经具备设计系统雏形。

### 9.2 需要轻量平台适配

| 资产 | 当前耦合 | Web 处理 |
| --- | --- | --- |
| AppShell | `WebkitAppRegion`、macOS 窗口控制区 | 抽出 `platform="desktop|web"` 或 slots；Web 不输出拖拽样式 |
| Auth Session | `window.desktopAuthSession` / Keychain | 注入 `SessionPersistence`；Web 使用受控 cookie 或明确的浏览器存储策略 |
| Knowledge Base Client | `window.desktopKnowledgeBase` | 注入 `KnowledgeContentGateway`；Web 决定 File System Access API、上传或云库 |
| Local images | `dionysus-asset:` | 由 gateway 返回 Blob URL、受签名 HTTPS URL 或对象存储 URL |
| CreationPage | 直接读取本地知识库桥 | 改由 controller/hook 注入素材读取能力 |

平台耦合只出现在少数文件，说明抽取方向是成立的；但在抽包前应先完成依赖倒置，不应把 `window.*` 条件判断散落到共享组件里。

### 9.3 不应直接放进基础设计系统

- AuthPage、ArticleBoard、CreationPage、KnowledgeBasePage 是业务页面，不是原子组件。
- 大纲卡片、写作计划、素材选择是 Dionysus 产品模式，可以进入 `product-ui`，但不应污染通用 `ui`。
- Supabase 请求、Agent 请求、IPC、文件读取和本地保存都不属于视觉包。
- 页面里的演示数据和中文业务文案不应成为设计系统默认实现。

### 9.4 技术上可移植，但许可证需先处理

- `GlassSurface` 来自 React Bits 的适配研究。
- `FogSphere` 来自 React Bits Pro 授权源码。
- 整体视觉 Token、App Shell 密度和部分组件约定研究自 Multica。

根据仓库现有第三方审计记录，把这些源码放进一个**独立公开的可复用组件仓库**，比作为应用内部实现更容易触发再分发或商业许可问题。尤其 React Bits 的 Commons Clause 与 Pro 许可都不应默认理解为允许单独再分发组件源码。

因此建议：

1. 内部先在当前 monorepo 共享，不立刻对外发布独立 UI 包。
2. 对公开设计系统采用 clean-room 重写，保留设计原则，不照搬受限源码结构。
3. Fog Sphere 不进入公开基础包；作为 Desktop/Web 应用自己的可选、私有授权模块按需加载。
4. Glass 效果若要公开，改写为自主实现或用许可证明确允许再分发的方案。
5. 正式分发、托管或商业化前，重新核对上游最新许可证并进行专业法律审查。本文只做工程风险提示，不构成法律意见。

## 10. 现有系统做得好的地方

### 10.1 Token 真相源已经建立

颜色、表面、阴影、圆角、尺寸和动效没有散成多套主题。业务页面绝大多数使用语义类而不是硬编码 HEX。

### 10.2 Light / Dark 是同构系统

两种主题不是分别设计的皮肤，而是共享相同语义名。组件不需要知道自己处于浅色还是深色。

### 10.3 表面层级克制

它没有给每个段落都套白卡片，而是大量使用 divider、留白和轻背景。这是当前 UI 最接近高级生产力工具的部分。

### 10.4 交互可访问性基础好

已有 focus-visible、ARIA、roving focus、键盘树排序、菜单焦点恢复、验证码自动填充和 reduced-motion。TreeView、ContextMenu、Dialog 的交互深度明显超过“只有样式的组件库”。

### 10.5 AI 状态与产品权限一致

AI 动效只对应真实请求；生成正文需要按钮确认；发布边界在页面中持续可见。设计语言和产品治理不是两套互不相关的叙事。

### 10.6 阅读和操作密度分开处理

工具栏、树和看板保持高密度，文章正文收窄并拉大行高。这种区分比全局统一字号/行距更成熟。

## 11. 当前缺口与不一致

这些问题不会阻止迁移，但应在抽取前解决，否则会被固化进新的 Web 版本。

### 11.1 规范与实现存在一处明显冲突

现有 `DESIGN_SYSTEM.md` 规定创作空态“只显示垂直居中的 Composer，不显示欢迎 Hero”，但 `CreationPage` 实际仍显示“从一个真实想法开始”的标题和说明。应先决定哪一个才是事实，再更新代码或规范。

### 11.2 当前导航不是 Web 路由

虽然依赖中有 `react-router-dom`，Renderer 没有实际使用 Router。导航由 `App.tsx` 的本地 `activeNav` 状态控制。这对单窗口桌面应用够用，但 Web 需要：

- 可复制 URL；
- 刷新后恢复当前位置；
- 浏览器前进/后退；
- 深链接和 404；
- 路由级代码分割；
- 登录回跳和受保护路由。

### 11.3 响应式还不是完整系统

当前布局是 macOS 大屏优先：`h-screen`、`body overflow-hidden`、256/288/360px 固定侧栏和 280px 固定看板列。现有 `sm`、`xl` 主要解决内部网格，并没有解决整个 App Shell 在平板和手机上的重排。

Web 首期可以明确只支持 `≥ 1024px`，但如果要称为通用 Web 设计语言，需要补：

- `100dvh` 与移动浏览器安全区；
- Overlay sidebar / drawer；
- 三栏到双栏、单栏的折叠规则；
- 触屏 44px hit target 变体；
- 横竖屏与软键盘；
- Toolbar overflow / command menu；
- 表格和看板的窄屏替代视图。

### 11.4 个别业务页面仍有私有尺寸

例如创作右栏 `w-[360px]`、对话气泡 `max-w-[88%]`、Markdown 图片 `max-h-[36rem]`。它们不是错误，但若已经跨两个以上页面稳定出现，应升格为命名 Token 或 pattern prop，避免 Web 再复制一次魔法值。

### 11.5 基础组件仍有空白

目前没有完整的 Checkbox、Radio、Switch、Select、Tooltip、Tabs、Toast/Inline notification、Form field、Skeleton 等公共契约。业务中已经出现原生 checkbox 和手工拼装的素材选择框，这说明组件边界开始分叉。

### 11.6 品牌辨识度主要依赖结构，而非视觉资产

Inter + Lucide + zinc + shadcn 比例是当代工具产品的常见组合。它稳定，但也很容易被看成 Linear 风格的高质量变体。若未来希望 Dionysus 形成独立品牌，可以在不破坏克制哲学的前提下增加：

- 更有作者感的品牌字标或标题字体；
- 一套自有图标修饰规则；
- 与“文章、批注、思想编排”有关的专属图形语汇；
- 比通用蓝色更独特、仍然低饱和的单一品牌色。

这不是 Web 迁移的前置条件，不应和抽取工作绑在一起大改。

### 11.7 活规范还不是可交付组件平台

开发态 Design System 页面能显示真实组件，这是好基础，但还缺少：

- 独立构建与可分享预览；
- 组件 API 文档和变更日志；
- 视觉回归截图；
- light/dark、长中文、窄容器、disabled/focus 的自动矩阵；
- a11y 自动检查；
- 包版本和发布策略。

### 11.8 视觉可访问性仍需量化验证

代码具备良好语义基础，但低透明度边框、muted text、Glass Surface 和状态色在不同显示器上的对比度仍需用工具测量。不能仅凭 OKLCh 数值和肉眼判断就宣称达到 WCAG AA。

## 12. 推荐的目标代码架构

### 12.1 分层原则

```text
tokens
  ↓
ui primitives
  ↓
layout / page patterns
  ↓
product views
  ↓
desktop or web controllers
  ↓
Electron IPC / HTTP / browser capabilities
```

任何下层都不能导入上层。特别是：

- `ui` 不知道文章、Agent、知识库或 Supabase；
- `product-ui` 不直接访问 `window.desktop*`、fetch 或文件系统；
- Desktop 与 Web 通过 adapter 提供同一能力接口；
- 高风险操作的确认和审计语义保留在业务层，不塞进通用 Dialog。

### 12.2 建议包职责

#### `@dionysus/design-tokens`

- `tokens.css`：light/dark 语义变量；
- `base.css`：字体、selection、scrollbar、reduced-motion；
- JSON/TS Token 投影：供图表、Canvas 和测试使用；
- 不包含 React。

#### `@dionysus/ui`

- 纯 React + Base UI 原语；
- Button、Badge、Input、DropdownMenu、Surface、Dialog 等；
- peerDependencies 使用 React/React DOM；
- 不直接包含产品文案；
- 输出编译后的组件 CSS，避免消费者漏扫 Tailwind 源码。

#### `@dionysus/ui-patterns`

- AppShell、Page、CollectionPage、WorkflowBoard、SplitWorkbench；
- 通过 slot、render prop 和语义 props 组合；
- AppShell 接收 platform capabilities，不读取 Electron 全局对象；
- 允许产品决定路由和数据。

#### `@dionysus/product-ui`（可选）

- OutlineView、CreationWorkspace、KnowledgeWorkbench 等纯展示组件；
- 只接受序列化 view-model 和 callback；
- Desktop 与 Web 各自提供 controller；
- 不需要为了“复用”把所有业务页面都强行下沉。

### 12.3 平台适配接口

建议优先建立三个窄接口：

```ts
interface SessionPersistence {
  load(): Promise<string | null>;
  save(refreshToken: string): Promise<void>;
  clear(): Promise<void>;
}

interface KnowledgeContentGateway {
  getActive(): Promise<KnowledgeBaseSnapshot | null>;
  readMarkdown(input: ReadMarkdownInput): Promise<MarkdownFile>;
  resolveAssetUrl(input: AssetInput): Promise<string> | string;
}

interface ShellCapabilities {
  platform: "desktop" | "web";
  supportsWindowDragRegion: boolean;
  compactNavigation: "rail" | "drawer";
}
```

接口名和细节应在实施时结合 Contracts 再定；这里的重点是先依赖抽象，再由 Desktop/Web 提供实现。

## 13. Web 端布局策略

推荐先保持“桌面 Web 应用”定位，再逐步扩展响应式，不在第一阶段同时重新设计手机端。

| 宽度 | 建议行为 |
| --- | --- |
| `≥ 1280px` | 保持当前 256px 侧栏、顶部窄带和 inset canvas；三栏工作区完整展开 |
| `1024–1279px` | 默认 56px rail；素材栏或对话栏只展开一个；主内容优先 |
| `768–1023px` | 侧栏改 overlay drawer；右栏改 sheet；工具栏允许横向滚动或 overflow menu |
| `< 768px` | 如果首期不支持，应明确提示；若支持，按任务流重组为单栏，不缩小三栏硬塞 |

Web App Shell 的具体变化：

- Electron 48px 拖拽区改为 Web 顶栏/路由标签区；
- 窗口后退/前进按钮接浏览器 history，或删除重复控件；
- `h-screen` 改为 `min-height: 100dvh` 或受控 app viewport；
- inset canvas 在手机上可取消外侧间隙和大圆角，避免浪费空间；
- 主题初始化在首屏脚本中完成，避免 light/dark 闪烁；
- 需要真实 route、document title、description、favicon 与错误页。

## 14. 迁移路线

### Phase 0：冻结事实与许可证边界

产出：

- 关键页面 light/dark 截图基线；
- 当前 Token 导出表；
- 组件和第三方来源清单；
- 公开/私有/需替换模块标记；
- “创作空态是否保留标题”决策。

完成标准：团队能准确回答“哪些是设计原则，哪些是受限实现，哪些只是当前业务页面”。

### Phase 1：平台依赖倒置

工作：

- 抽出 session、knowledge content、asset URL 和 shell capability 接口；
- 消除共享视图中的 `window.desktop*`；
- 把 `WebkitAppRegion` 变成 Desktop 壳的条件能力；
- 不改变当前桌面功能和视觉。

完成标准：共享视图可以在普通 Vite 浏览器环境中挂载，不需要伪造 Electron 全局对象。

### Phase 2：抽取 Token 与基础 UI

工作：

- 从 `styles.css` 拆出 tokens/base/components 三个责任层，但保持单一真相源；
- 建立 `design-tokens` 和 `ui` 包；
- 补 Checkbox、Tooltip、Tabs、Skeleton 等已经出现真实需求的缺口；
- 为每个组件补 light/dark、focus、disabled、长中文和窄容器示例。

完成标准：Desktop 改为消费共享包，视觉回归无非预期变化。

### Phase 3：抽取页面模式

工作：

- AppShell、Page、Collection、Workflow、SplitWorkbench 进入 patterns；
- 把 360px 等稳定尺寸升格为模式 Token 或 prop；
- 建立 1440、1280、1024、768 四档响应式行为；
- 为大屏原貌建立视觉回归测试。

完成标准：设计系统陈列馆能独立展示完整壳层和页面模式，不依赖业务数据。

### Phase 4：创建 Web App

工作：

- 增加 `apps/web` 与 Vite/React 入口；
- 接入 React Router、protected routes、404 和错误边界；
- 实现 Web session persistence；
- 迁移认证、Collection、Workflow Board 和 Secondary Pages；
- 配置 Web CSP、meta、favicon 和部署基础。

完成标准：Web 能完成登录、导航、主题切换和普通页面操作，URL 可刷新和深链接。

### Phase 5：迁移 AI 创作

工作：

- CreationPage 拆成 controller + pure views；
- 素材来源由 gateway 注入；
- Fog Sphere 懒加载并建立无 WebGL fallback；
- 保留显式成文、风险确认、版本追加和发布控制边界。

完成标准：Desktop 与 Web 使用同一套创作视图，数据来源不同但交互语义相同。

### Phase 6：决定知识库 Web 模型

这一步必须先做产品决策，不能由前端自行假设：

1. 浏览器直接选择本地目录：依赖 File System Access API，浏览器兼容性和授权模型有限。
2. 用户上传/同步到云端：需要对象存储、服务端索引、权限、冲突和保留策略。
3. Web 只读云端引用，编辑仍留 Desktop：范围最小，也最符合当前 local-first。
4. Desktop companion：Web 通过本机服务访问知识库，部署与安全成本最高。

在这个决策前，只迁移 Knowledge Workbench 的纯视图，不承诺文件能力等价。

### Phase 7：质量与发布

- 视觉回归；
- 键盘全流程；
- WCAG 对比度和语义审计；
- Reduced motion；
- 低性能设备与无 WebGL fallback；
- Bundle 分析和路由级懒加载；
- 第三方许可证复核；
- Desktop/Web 同源组件版本策略。

## 15. 工作量估算

以下以 1 名熟悉 React/Tailwind/组件架构的资深前端、现有 API 可用、不包含后端新建为假设。它是计划级估算，不是固定承诺。

| 目标 | 估算 | 难度 |
| --- | ---: | --- |
| 只做视觉壳 + Design Lab Web Demo | 3–5 人日 | 低 |
| 平台依赖倒置 | 4–7 人日 | 中 |
| Token/UI/Patterns 正式抽包 | 7–12 人日 | 中 |
| Web 路由、认证、主题和普通页面 | 5–8 人日 | 中 |
| AI 创作主流程共享 | 6–10 人日 | 中 |
| 响应式与可访问性加固 | 5–8 人日 | 中 |
| 知识库纯视图迁移 | 4–7 人日 | 中 |
| 知识库平台能力等价 | 15–30+ 人日 | 中高到高 |
| 公开独立 UI 仓库 clean-room 与发布工程 | 10–20+ 人日 | 中高 |

综合判断：

- 不含完整知识库等价能力，做到可上线的大屏 Web 版本，单人约 **4–6 周**。
- 包含完整知识库 Web 方案、响应式、测试和许可证替换，单人约 **7–12 周或更长**。
- 如果只要一个忠实的视觉原型，**一周内**可以完成；但那不是可长期复用的设计系统。

## 16. 主要风险

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| 复制出第二份源码 | Desktop/Web 很快分叉 | 同一 monorepo 共享包；禁止复制后独立维护 |
| Multica/React Bits 许可 | 公开或商业分发受限 | 先内部共享；公开前 clean-room/替换/法律复核 |
| 把平台能力误当 UI | 知识库工期失控 | UI、controller、gateway 分开估算 |
| 没有 URL 路由 | Web 体验不完整 | Router 作为 Web 入口的第一阶段能力 |
| 直接把三栏缩到手机 | 可用性崩溃 | 定义断点下的任务流重组，不只做尺寸缩放 |
| Tailwind 包扫描遗漏 | 共享组件上线后样式缺失 | 输出编译 CSS 或明确 package source scanning |
| WebGL/玻璃效果成本 | 低端设备耗电、兼容问题 | 懒加载、质量档、静态 fallback、reduced-motion |
| 规范和代码双真相 | 抽取后不知以谁为准 | Phase 0 先消除冲突并建立视觉回归基线 |

## 17. 验收标准

### 设计一致性

- Desktop 与 Web 的 Token 只来自一个包。
- Button、Input、DropdownMenu、Surface、Dialog 等不在应用内重复实现。
- Light/Dark 的结构、层级和状态语义一致。
- 1440px 大屏下与当前桌面视觉基线保持一致。

### 工程边界

- `packages/ui` 和 `packages/ui-patterns` 中没有 `window.desktop*`、Electron、Node、Supabase 或业务 API。
- `apps/web` 使用 URL 路由，支持刷新、前进后退、深链接和 404。
- Desktop 平台能力通过 adapter 注入，不以条件分支污染所有组件。
- CSS 与组件包有明确版本和变更记录。

### 体验质量

- 关键流程可全键盘完成，Focus 清晰且无焦点陷阱。
- Reduced motion 下没有持续扫光、旋转或高成本 WebGL 循环。
- 关键文本、控件和状态色通过对比度测量。
- 1024px 以上没有横向页面级溢出；看板的局部横向滚动除外。
- 失败、空、无结果、权限不足、离线和加载状态各自可辨识。

### 产品与安全

- AI 不自动触发正文、发布、覆盖或账号连接。
- Web 端不把敏感服务端密钥放入前端。
- 发布和高风险操作继续记录确认与结果。
- 知识库的 Web 数据模型没有用“前端模拟”绕过真实权限和持久化决策。

### 许可证

- 每个第三方来源都能追溯到版本、用途和许可。
- 公开包中不包含无再分发授权的 Pro 源码。
- 若独立发布设计系统，已经完成 Multica/React Bits 相关许可复核或实现替换。

## 18. 最终建议

建议把目标定义为：

> **从 Dionysus Desktop Renderer 中抽取一套平台无关、语义化、可由 Desktop 与 Web 共同消费的生产力工作台设计系统；Web 端复用设计系统和纯展示型业务视图，平台能力通过 adapter 实现。**

不建议把目标定义成“把 `src/renderer` 复制到另一个仓库”。复制可以在几天内得到相似页面，却会同时制造 Token 分叉、组件分叉、Bug 双修、许可证模糊和知识库能力假象。

最合理的第一步不是立即创建 Web 页面，而是用一个小规模验证切片完成：

1. 抽出 Button、Input、DropdownMenu、Surface、Page 和 AppShell；
2. 去掉 AppShell 对窗口拖拽区的硬绑定；
3. 在普通 Vite Web 环境复现登录页与 Article Board；
4. 建立 light/dark 和 1440/1024 两档截图回归；
5. 验证包构建、Tailwind CSS 输出和许可证排除策略。

这个切片通过后，再迁移 CreationPage。知识库能力留到产品模型决策之后。这样可以最快证明设计语言真的可复用，同时把最昂贵、最容易误判的部分留在正确的决策节点。

[PROTOCOL]: 变更时更新此文档，然后检查 `DESIGN_SYSTEM.md`、Renderer `AGENTS.md` 与根级第三方许可记录。
