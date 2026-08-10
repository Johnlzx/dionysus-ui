# Dionysus Desktop Design System

> 视觉基线来源：Multica `dd692058d7bc050dbc5518d9470e1b4f4b51ab03`；生成等待动效使用 React Bits Pro Fog Sphere 授权源码。业务语义、代码组织与 Electron 安全边界已适配 Dionysus。许可与署名见仓库根目录 `THIRD_PARTY_NOTICES.md`。

## 1. 设计哲学

1. **克制即高级。** 默认做减法。留白、灰度和稳定节奏优先于装饰。
2. **层次依靠中性色，颜色只传递信号。** 品牌、成功、警告、错误和信息色只用于小面积元素。
3. **一致性大于局部个性。** 同类 hover、selected、focus、disabled 在所有页面保持相同反馈。
4. **AI 是受控能力，不是视觉主角。** AI 状态可见，但不得压过内容，也不得用视觉诱导跳过人工确认。

## 2. 真相源与依赖边界

- 唯一 Token 真相源：`app/styles.css`。
- 开发态活规范入口：侧栏 `Design System`；只在 `import.meta.env.DEV` 为真时出现。
- 原子 UI：`shared/ui/`，只依赖 React、浏览器能力和纯样式工具。
- GPU 动效：`shared/ui/fog-sphere.tsx` 只依赖 React、`@react-three/fiber`、Three.js 与语义 Token；不得在业务页面复制 Shader 或维护第二套调色值。
- 页面模式：`shared/layout/`，组合原子组件，不包含文章业务数据。
- 领域业务页面：`features/articles/`、`features/creation/` 与 `features/knowledge-base/`。
- Renderer 禁止导入 `electron`、`node:*`、`fs`、`path`、`child_process`。
- Main、Preload、API、Agent、Contracts 禁止依赖本设计系统。
- 禁止增加平行全局 CSS、Tailwind 配置文件或第二套颜色变量。
- 禁止业务页面硬编码颜色、阴影、圆角或任意基础尺寸；新增值先进入 Token 或稳定组件变体。

## 3. Surface 层级

| 层级 | Token / Class | 用途 |
| --- | --- | --- |
| App Shell | `app-shell` / `bg-app-shell` | 窗口外框、侧栏与主画布留白 |
| Page Canvas | `page-canvas` / `bg-page-canvas` | 页面主体、列表、看板与连续滚动区域 |
| Surface | `surface` / `bg-surface` | 卡片、设置组、列表容器 |
| Raised Surface | `surface-raised` / `bg-surface-raised` | Dialog、Popover、Dropdown 等临时浮层 |
| Hover | `surface-hover` | 指针经过，不表示持续选择 |
| Selected | `surface-selected` | 持续选择；hover 不得覆盖选择语义 |

容器分隔优先级：间距 → 单条 divider → 背景变化 → Card。禁止为每段内容套卡片。

## 4. 颜色契约

### 4.1 核心语义

`background / foreground / card / popover / primary / secondary / muted / accent / destructive / border / input / ring`

组件只能消费语义名。OKLCh 数值只能出现在 `styles.css` 的 Token 定义区。

### 4.2 状态语义

| Token | 语义 | 典型使用 |
| --- | --- | --- |
| `brand` | 产品识别 | Logo、极少量关键强调 |
| `destructive` | 危险、错误 | 删除、失败、不可逆操作 |
| `success` | 成功、审校通过 | 小图标、Badge、状态点 |
| `warning` | 进行中、需注意 | 写作中、高优先级 |
| `info` | 信息、待发布 | 链接、待发布状态 |

每屏语义色不超过三种。大面积背景只使用 `/5` 至 `/12` 的低透明度变体。

### 4.3 Light / Dark

- 两种主题使用完全相同的 Token 名称。
- Dark 使用深灰而非纯黑；边框使用半透明白色。
- 默认跟随系统，允许用户在 system/light/dark 间循环切换。
- 主题控制器只修改根节点 `.dark` 和 `color-scheme`，组件不得感知具体色值。

## 5. 字体与排版

- UI 主字体：Inter Variable；中文依次回退至 PingFang SC、Microsoft YaHei、Noto Sans CJK SC。
- 等宽字体：SFMono-Regular、Consolas、Liberation Mono。
- 字号纪律：`text-base` 用于重要正文，`text-sm` 用于主界面，`text-xs` 用于元数据；`text-[0.8rem]` 仅用于小按钮。
- 字重仅使用 `font-normal` 与 `font-medium`。禁止 `font-bold`、`font-semibold`。
- 同一区块最多两种字号；第三层级优先通过颜色或字重表达。

## 6. 间距、圆角与阴影

- 4px 基础网格：4 紧密关联、8 同组项目、12 组件内区块、16 组间、24 大节。
- 基准圆角 `--radius: 0.625rem`；按钮 8–10px，卡片 10px，看板列与主画布 12px。
- 常驻 Surface 只使用 `--surface-shadow`；浮层使用 `--menu-shadow` 或 `--floating-shadow`。
- Hover 禁止缩放和增加阴影，避免布局与视觉重量跳动。
- Markdown 编辑密度由 `--editor-font-size / --editor-line-height / --editor-content-padding` 统一声明，CodeMirror 配置不得写第二份像素值。

## 7. 交互状态

状态顺序：rest → hover → active/pressed → selected → focus-visible → disabled。

- Hover：轻微背景变化，默认 150ms 颜色过渡。
- Pressed：按钮允许 1px 向下位移，不改变尺寸。
- Selected：背景 + 字重/前景色至少两个维度，且 hover 后仍可辨识。
- Focus：必须使用 `focus-visible` ring；禁止只写 `outline-none`。
- Disabled：禁止交互并降低不透明度，不隐藏原有语义。
- Reduced motion：系统开启后，将动画和过渡压缩到近零。

## 8. 基础组件契约

### Button

- 变体：`default / outline / secondary / glass / ghost / destructive / link`；`glass` 只用于 Glass Surface 内的紧凑工具操作。
- 尺寸：`default / xs / sm / lg / icon / icon-xs / icon-sm`。
- Icon-only Button 必须有 `aria-label` 和 `title`。
- 危险操作使用低饱和背景，不使用整块高纯度红色。

### Badge

- 只表示状态、类别或紧凑元数据。
- 变体：中性、危险、警告、成功、信息、描边。
- 禁止把 Badge 当按钮，除非显式实现键盘和焦点语义。

### Avatar

- 仅使用 Token 化身份色；禁止组件内散落 Tailwind 色板。
- `sm` 用于列表和卡片，`md` 用于页面集合项。

### ShinyText

- 只表达由真实异步请求驱动的短时进行中状态，不用于标题装饰、完成态或静态品牌文案。
- 扫光只在 `muted-foreground → foreground` 之间移动；`prefers-reduced-motion` 下必须退化为可读的静态 muted 文字。

### FogSphere

- 只用于材料成纲请求的大纲展示区等待画布及开发态组件陈列；动效区域内不叠加标题、说明、按钮、骨架屏或其他可见内容，页面 Header 与右侧对话区保持稳定。
- `core / glow / background` 必须读取 `--fog-sphere-*-rgb` light/dark 语义 Token；业务页面只允许调整速度和 GPU 质量参数，不得传入页面私有颜色。
- light 主题自动反转亮度，dark 主题保持体积光；主题切换由组件监听根节点状态，不由业务页判断。
- `prefers-reduced-motion` 下速度和旋转归零，并把 Canvas 帧循环降为 demand；等待语义仍通过不可见的 `role="status"` 可访问名称表达。
- Retina 场景必须限制 DPR；材料成纲等待态固定使用 14 次 ray march、6 次 turbulence 与 DPR 1，避免短时反馈长期占满 GPU。

### Input / SearchField / OneTimeCodeInput

- 输入框的边框、阴影、placeholder、focus-visible、disabled 与 invalid 由 `shared/ui/input.tsx` 统一维护。
- 搜索清除行为由受控 `SearchField` 提供，业务页面不得重复拼接图标、输入框和清除按钮。
- 一次性验证码使用单个 `OneTimeCodeInput`，保留 `autocomplete="one-time-code"`、数字键盘、粘贴与屏幕阅读器能力；禁止拆成六个制造焦点陷阱的输入框。

### Surface

- `card / raised / subtle / selected / flat` 是允许的基础表面变体。
- 业务页面不得重复组合 `border + background + shadow + radius` 创建平行卡片。

### GlassSurface

- 采用 React Bits Glass Surface 的尺寸感知位移图：主工具栏可通过 `refractive` 启用 `feDisplacementMap` 背景折射、轻微色散与低透明玻璃底色；普通操作组继续使用稳定的模糊/饱和降级层。
- 只用于正文画布内的紧凑工具栏或操作组，不替代普通信息 Surface、页面 Header 或 Dialog。
- 长画布中的主操作工具栏使用 `shape="capsule"`，可在所属滚动容器内通过 `sticky top-0` 固定；必须保留独立层级，让滚动内容成为真实折射背景，不得脱离页面结构做全局悬浮。
- SVG backdrop filter 不可用时必须自动回落到 `blur + saturate`，轮廓、边框、阴影和操作可用性不得改变。
- 内部操作统一使用 Button `glass` 变体，共享 light/dark 材质 Token；不支持 backdrop-filter 时退化为 Raised Surface。

### Dialog

- 所有模态交互统一使用 `shared/ui/dialog.tsx`；业务只提供标题、说明、内容与 footer 操作。
- 遮罩、Raised Surface、焦点陷阱、Escape/外部关闭和进出场状态由 Base UI 原语维护。
- 危险操作必须在标题与正文中明确说明真实影响，并把最终按钮设为 `destructive`；禁止只用颜色传达风险。

### ContextMenu

- 常规上下文操作统一使用 `shared/ui/context-menu.tsx`，业务层只提供无副作用的菜单描述和动作回调。
- 触发元素模式必须支持右键、长按、`Shift + F10` 与菜单键；受控坐标模式用于由列表或树统一托管当前 occurrence 的菜单。
- 方向键、Enter、Escape、点击外部关闭、关闭后的焦点恢复和视口碰撞由 Base UI 原语维护，业务页面不得重复实现菜单焦点系统。
- 菜单项只允许 `default / destructive` 语义、disabled 状态和 separator；危险操作必须使用 destructive 项，并在后续确认流中说明真实影响。

### TreeView

- 业务层先把层级或 DAG 展开为扁平 occurrence，再交给 `TreeView`；共享组件不理解文件类型或业务关系。
- 必须实现 `tree/treeitem`、`aria-level`、`aria-posinset`、`aria-setsize`、`aria-expanded`、roving tabindex、方向键与 Home/End。
- 同一节点多父时 occurrence ID 必须不同；`aria-selected` 只标记精确 occurrence，解除关系必须保留具体 edge 语义。
- 排序只允许在同一 parent occurrence 内执行；拖拽需显示 before/after 插入线，并提供 `Alt + ArrowUp/ArrowDown` 等价键盘路径；排序不得隐式切换选择或打开文件。
- 右键或键盘菜单键必须先选中精确 occurrence，再把锚点坐标交给业务菜单；共享树不理解具体操作。

### MarkdownEditor

- CodeMirror 只编辑 Markdown 源码，禁止把预览 DOM 或 WYSIWYG 序列化结果写回事实源。
- 内建搜索、撤销历史、GFM 输入、格式工具栏、可见焦点和 `Cmd/Ctrl + S`；保存、冲突与文件身份由业务层负责。
- 编辑器主题只能引用语义 CSS Variables；禁止引入第二套亮暗主题色值。

### Page primitives

- 页面统一使用 `Page → PageHeader → PageToolbar → PageContent`。
- 标题栏和工具栏高度、边界与 padding 由页面原语维护，领域页面只注入内容与操作。

## 8.1 开发态活规范

- `Design System` 菜单仅在开发模式出现，生产构建必须隐藏。
- 活规范直接渲染真实组件，不复制示例实现，因此组件变更会立即反馈到审阅页面。
- 组件按 Actions、Signals & Identity、Inputs & Controls、Surfaces & Theme、Structured content、Page patterns 分区陈列，末尾以 Foundation ledger 汇总语义 Token。
- 每件展品使用统一高度与 `header → specimen → contract footer` 三段网格；同一矩阵禁止出现无理由的高度漂移。
- 展卡本身只能组合 `Surface` 和语义 Token；陈列页面不得为了“好看”创建脱离生产组件的特殊样式分支。
- 每个新基础组件先补充语义 API、light/dark、focus、disabled、长文案审阅，再允许业务页面消费。
- 如果审阅页需要写硬编码样式才能展示组件，说明组件契约尚未完成，应先修组件而不是修样例。

## 9. 页面模式

### Desktop App Shell

- 默认侧栏 256px，收缩态 56px。
- 顶部工具栏 48px，Electron 拖拽区与交互区必须分离。
- 主画布使用 inset：外侧保留 8px，12px 圆角、1px ring 和轻阴影。
- 侧栏导航顺序：个人入口 → 工作区入口 → 配置入口。

### Collection Page

- 48px 页面标题栏。
- 48px 搜索/筛选/主操作工具栏。
- 列表容器统一边框、行高、hover、focus 和空状态。
- Loading、Empty、No Results、Permission、Not Found、Error 必须分别表达。

### Workflow Board

- 列宽固定 280px，列间距 16px，外层 padding 8px。
- 卡片内部 padding 10–12px；编号、标题、描述、标签、作者、元数据顺序固定。
- 中性阶段使用 `muted/40`；进行、审校、待发布分别使用 warning/success/info 的 `/5` 背景。
- 横向空间不足时滚动，禁止压缩卡片导致信息层级崩坏。

### Settings Page

- `Settings Tab → Section → Card → Row`。
- 默认一行一项；只读元数据不混入可编辑设置。
- 自动保存和显式保存必须显示清晰状态，不得用 Toast 作为唯一反馈。

### Authentication Page

- 默认入口使用“邮箱 → 一次性验证码”的统一登录/注册路径，同时提供明确的邮箱密码登录/注册切换。
- 页面只保留品牌、标题、说明、认证方式切换、当前方式所需输入和单一主操作；不使用营销插图、装饰卡片或多列布局。
- 标题栏左侧完整让位于 macOS 窗口控制区；品牌标记居中置于认证标题上方，不在窗口标题栏重复应用名。
- 不通过响应文案暴露邮箱是否注册；新用户验证后创建账号，现有用户验证后进入会话。
- 验证码使用单一输入并支持系统自动填充；错误就地显示并通过 `role="alert"` 宣告。
- 密码输入使用标准 `current-password`/`new-password` 自动填充语义；应用不得自行保存或回填密码。
- 客户端重发冷却只减少误操作，不能替代服务端限流；服务端必须保证六位以上、十分钟内失效、单次成功使用且重发不重置失败计数。
- Supabase 认证错误按状态语义归一化；邮件额度、请求频率、验证码和网络失败必须给出可执行提示，禁止直接暴露原始服务端消息。
- 本地 UI 开发可通过显式环境变量启用直接进入旁路；旁路必须同时受 Vite DEV 模式约束、只产生无 Access Token 身份，并明确提示真实 API 仍会拒绝访问；未显式启用时不得接受固定预览验证码。
- Renderer 不持久化 Access Token、Refresh Token、密码或服务端密钥；保持登录只允许经 Preload/Main 将 Refresh Token 交给 `safeStorage` 加密，真实发送、验证、限流和会话签发由 Supabase Auth 完成。

### Agent Creation Page

- “创作”是登录后的默认入口，并固定在侧栏导航顶部；空对话只显示垂直居中的 Composer，不显示欢迎 Hero、建议卡片或底部快捷键说明。
- 空态标题栏只保留“创作”；进入详情后 Header 只显示标题与就绪度。大纲操作放在正文区顶部留白后的 Glass Surface 工具栏，并仅在大纲可写、无保存中或未保存 Section 时开放“生成正文”。
- 创作详情严格分为“大纲 → 正文”两阶段：默认只调用材料成纲 Agent；正文不得自动生成，只能由按钮显式确认触发。生成后主区显示 Markdown 初稿，右侧显示写作计划、阻塞材料、复核记录与下一审阅 Skill。
- 大纲阶段采用“素材上下文栏 → 大纲画布 → Agent 对话”三栏结构；素材栏复用 `w-sidebar`、SearchField、Badge、Button 与语义 Selected 状态，不创建专属颜色、阴影或平行 Checkbox 原语。正文阶段收起素材栏，并在写作计划侧栏展示本稿实际使用的引用快照。
- 素材栏只列出关联知识库的 Markdown，支持标题/相对路径搜索和最多 8 篇多选；选择顺序即 Agent 上下文顺序。知识库未打开、关联不一致、节点失效、空文档或正文超限必须分别给出可执行状态，不得静默忽略。
- 素材栏必须持续说明“云端只保存引用，正文仅随请求发送”；改用其他知识库会清空当前选择，必须经 Dialog 二次确认，且绝不删除本地文件。
- “重新成文”追加新版本，不静默覆盖既有草稿；正文入口只在已有草稿时开放，大纲入口始终可返回。
- Composer 静止态使用中性 Surface；聚焦态只增加品牌冷色细描边、外环和柔和阴影，不使用持续动画。
- 发送按钮仅在输入去除首尾空白后激活；激活态使用沿圆形边框运行的多色 Border Beam，颜色不得扩散到大面积页面背景。
- Enter 发送，Shift + Enter 换行，并兼容输入法 composing 状态；空内容不得提交。
- `prefers-reduced-motion` 开启时停止环绕运动，只保留静态激活边框。
- 大纲生成与更新期间仅中央大纲展示区渲染 `FogSphere`，该区域不叠加 ShinyText 或进度文案；详情 Header、右侧继承对话与 Composer 保持可见。动效必须随真实请求开始/结束，不能伪造进度。
- Agent 状态必须来自真实请求；禁止伪造 AI 回复或“正在生成”状态，失败后保留已存在的大纲和正文版本。

### Local Knowledge Base Workbench

- 首次进入不得展示演示数据；只显示“打开本地知识库”和“创建新知识库”，并说明正文、图片与绝对路径留在本机。
- 挂载后使用 `Tree → Workbench` 双栏：左侧 288px 节点树，右侧按内容类型切换 Markdown 编辑/预览/分屏或图片查看。
- Markdown 保存状态持续可见，900ms 停顿后自动保存并支持显式保存；外部版本变化必须进入冲突确认，禁止静默覆盖。
- 文件树是物理单父结构；引用边允许多父。树中以小面积 Link 标记引用 occurrence，不为同一文件制造重复内容；右键操作必须绑定精确 occurrence，同父拖拽与 `Alt + ArrowUp/ArrowDown` 共享持久化顺序语义。
- “解除当前关联”只删除 reference edge；“移到废纸篓”删除真实本地资源，必须使用不同图标/文案并把最终确认交给 Main 原生对话框。
- 资源图片只允许通过 `dionysus-asset:` 只读协议加载；预览不执行 raw HTML，也不默认请求远程图片；链接必须区分页内锚点、知识库内 Markdown 与外部 HTTPS，HTTP 明文默认拒绝。

## 10. 内容与 AI 边界

- 页面始终显示保存状态和发布控制权说明。
- AI 精修、审校等局部状态使用小面积图标或文本；只有材料成纲的短时等待态允许 FogSphere 占据大纲展示区，且不得与大纲内容并存。
- 发布、覆盖、账号连接等不可逆动作必须进入显式确认流。
- 错误状态不得自动扩大权限或改用更高风险路径。

## 11. Review Checklist

- [ ] 是否只使用语义 Token，没有组件硬编码色值？
- [ ] Light / Dark Token 是否对称？
- [ ] 是否复用现有 Button、Badge、Avatar 与 AppShell？
- [ ] 是否复用 Input、SearchField、Surface 与 Page primitives，而不是在业务页重复拼接？
- [ ] 认证是否默认保持验证码登录/注册同路、密码入口避免账号枚举，并且未在 Renderer 持久化 Token 或密码？
- [ ] Agent Composer 是否只在聚焦时高亮、只在非空时激活发送，并正确处理 Enter/Shift+Enter/输入法？
- [ ] 大纲素材栏是否只保存引用、在请求时现读正文、明确展示选择/失效/超限状态，并在切换知识库前确认？
- [ ] 材料成纲期间是否仅在大纲展示区显示 FogSphere，并保留 Header/右侧对话，且 light/dark、DPR 上限与 reduced-motion 都来自共享契约？
- [ ] 新基础组件是否已经进入开发态 Design System 页面供人工 Review？
- [ ] Dialog、ContextMenu、TreeView、MarkdownEditor 是否保持键盘、焦点、长中文与 light/dark 契约？
- [ ] 页面属于 Collection、Workflow Board、Settings 或明确的新模式吗？
- [ ] Hover 是否轻于 Selected，且不会覆盖 Selected？
- [ ] 键盘焦点是否可见？Icon-only 控件是否有可访问名称？
- [ ] 长标题、中文、窄窗口和滚动是否经过验证？
- [ ] Renderer 是否仍未跨越 Electron 安全边界？
- [ ] 新源文件 L3 与相应 L2/L1 是否同步？
- [ ] 对外发布是否仍由用户显式确认？

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
