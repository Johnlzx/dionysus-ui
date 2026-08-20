# Dionysus UI Design System

> 当前仓库是 Dionysus 设计系统的 React 源码预览：`packages/ui` 提供共享 Token 与基础原语，`apps/web` 使用真实共享组件生成活文档。Desktop、FogSphere、GlassSurface 等更完整产品原语仍属于后续迁移/发布范围。视觉基线来源、授权边界与再分发限制见仓库根目录 `THIRD_PARTY_NOTICES.md`。

## 1. 设计哲学

1. **克制即高级。** 默认做减法。留白、灰度和稳定节奏优先于装饰。
2. **层次依靠中性色，颜色只传递信号。** 品牌、成功、警告、错误和信息色只用于小面积元素。
3. **一致性大于局部个性。** 同类 hover、selected、focus、disabled 在所有页面保持相同反馈。
4. **AI 是受控能力，不是视觉主角。** AI 状态可见，但不得压过内容，也不得用视觉诱导跳过人工确认。

## 2. 真相源与依赖边界

- 唯一 Token 真相源：`packages/ui/src/styles.css`。
- 共享原语入口：`packages/ui/src/index.ts`；图标入口：`packages/ui/src/icons.tsx`。消费者只从 `@dionysus/ui`、`@dionysus/ui/icons` 和 `@dionysus/ui/styles.css` 引入。
- 当前稳定原语：`Button / Badge / Avatar / Input / SearchField / DropdownMenu / InlineEdit / InlineEditSelect / Surface / Dialog / SegmentedControl / ThemeToggle`。
- Web 活规范入口：`apps/web`，侧栏、搜索、示例和页面模式必须消费真实共享组件。
- Web 站点样式：`apps/web/src/styles.css` 只定义文档呈现、动画和打印规则，不创建第二套基础视觉 Token。
- 后续产品原语：`FogSphere / GlassSurface / TreeView / MarkdownEditor / Page primitives` 等必须先进入 `packages/ui` 或明确标注为路线图，再允许业务消费。
- Desktop / Electron 适配层可以消费本设计系统，但本设计系统不得导入 `electron`、`node:*`、`fs`、`path`、`child_process` 或业务协议。
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
- 字号纪律：`text-base` 用于重要正文，`text-sm` 用于主界面，`text-xs` 用于操作标签，`text-micro` 用于元数据；`text-button-sm` 仅用于小按钮。
- 导航分组使用语义角色 `nav-section-label`：复用 Micro 10/14 字阶、500 字重与大写，字距固定为 `tracking-nav-section` (0.08em)；不允许页面内追加任意 tracking。
- 新增 `--text-*` 或 `--tracking-*` Token 时，必须同步登记到共享 `cn()` 的 tailwind-merge 配置，避免字号被文字颜色类误删。
- 字重仅使用 `font-normal` 与 `font-medium`。禁止 `font-bold`、`font-semibold`。
- 同一区块最多两种字号；第三层级优先通过颜色或字重表达。

## 5.1 图标

- 基础字形统一使用 `lucide-react`，但第三方包只允许出现在 `packages/ui/src/icons.tsx`；业务应用不得直接依赖或导入 `lucide-react`。
- `@dionysus/ui/icons` 只开放批准使用的静态子集。优先使用 `AddIcon / BackIcon / CloseIcon / ConfirmIcon / SearchIcon` 等语义别名，使底层字形可替换。
- 标准尺寸为 `xs 12px / sm 14px / md 16px / lg 20px / xl 24px`，标准笔画为 `2`，颜色继承 `currentColor`。
- 使用 `Icon` 包装器时，未提供 `label` 的图标默认作为装饰隐藏；独立表达含义时传入 `label`。Icon-only Button 的可访问名称必须由按钮提供。
- 只使用静态具名导入；禁止 `import * as Icons`、字符串动态查找、复制完整 SVG 集或混用第二套图标库。
- 新图标必须先确认现有子集无法表达目标语义，再补充出口、活文档和许可证审查。

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

- 当前变体：`default / outline / secondary / ghost / destructive / link`。
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

### Dialog

- 所有模态交互统一使用 `Dialog`；业务只提供标题、说明、内容与 footer 操作。
- 遮罩、Raised Surface、Escape 关闭、初始焦点、Tab 焦点循环、遮罩关闭和关闭后的焦点恢复由共享原语维护。
- 危险操作必须在标题与正文中明确说明真实影响，并把最终按钮设为 `destructive`；禁止只用颜色传达风险。

### SegmentedControl

- 用于少量互斥视图切换，例如预览/代码。
- 必须实现 `tablist/tab`、`aria-selected`、roving tabindex、方向键与 Home/End。
- 视图状态如果影响可分享页面，应同步到 URL；纯局部示例状态可以保持组件内部状态。

### Input / SearchField / OneTimeCodeInput

- 输入框的边框、阴影、placeholder、focus-visible、disabled 与 invalid 由 `packages/ui/src/primitives.tsx` 统一维护。
- 搜索清除行为由受控 `SearchField` 提供，业务页面不得重复拼接图标、输入框和清除按钮。
- 一次性验证码属于后续原语；实现时使用单个 `OneTimeCodeInput`，保留 `autocomplete="one-time-code"`、数字键盘、粘贴与屏幕阅读器能力；禁止拆成六个制造焦点陷阱的输入框。

### Surface

- `card / raised / subtle / selected / flat` 是允许的基础表面变体。
- 业务页面不得重复组合 `border + background + shadow + radius` 创建平行卡片。

### FloatingSidePanel

- 桌面端属性、写作计划、来源、活动等上下文统一使用 `FloatingSidePanel + FloatingSidePanelCard + SidePanelToggle`；它是工具栏下方内容区中的 `main + aside` 布局，不是覆盖主内容的 Drawer。
- 默认卡片宽 320px、Rail 四周 inset 8px、多卡片间距 8px。Rail 宽度包含卡片和两侧 inset；页面不得再追加平行 margin、硬分割线或另一层全高 Card。
- 主内容必须以 `min-width: 0; flex: 1` 真实让位并保留自身最小可用宽度。卡片在动画中保持固有宽度，由父级 `overflow` 揭示；禁止把卡片本身从 0 拉伸到终态，避免文字逐帧换行。
- 宽度使用 Motion spring `700 / 48 / 0.62`，卡片 x 使用 `760 / 50 / 0.62`，进入淡入 140ms、退出淡出 90ms。感知完成控制在约 100–180ms；不缩放、不旋转、不明显回弹，连续点击必须从当前速度反向。
- 触发器固定在不参与面板宽度重排的 Header / Toolbar 中；关闭态使用 Ghost，打开态使用 Selected Surface、弱 ring 与轻阴影，并保留同一尺寸、位置和图标笔画。状态不能只依赖图标或颜色。
- 组件是非模态区：不显示遮罩、不锁主页面滚动、不自动抢焦点。关闭时 Aside 立即进入 `aria-hidden + inert`；Toggle 必须提供 `aria-controls`、动态 `aria-expanded`、操作名称、tooltip 和 focus-visible。
- Rail 拥有自己的纵向滚动，卡片可以按内容高度堆叠；只在单一信息连续且需要固定 footer 时使用一张满高卡片。嵌套 Card、重阴影和卡片内卡片都会破坏浮动层级。
- 当主内容无法保持可读宽度时，产品层应在断点处切换为 Drawer / Bottom Sheet；共享组件不自行推断断点。需要阻断操作时使用 Dialog，少量锚定信息使用 Popover / Menu。
- `prefers-reduced-motion: reduce` 下宽度、位移和透明度立即到达终态。通过快捷键关闭且焦点原本在面板内时，业务层负责把焦点还给 Toggle。

### DropdownMenu

- 用于搜索型下拉选择、成员分配、标签选择和轻量 command palette；支持分组、多选、右侧计数与指令项。
- 同一个菜单内的 `value` 必须稳定且唯一；组件用它维护 active、selection 和键盘状态。
- 顶部搜索栏是浮层的一部分，不额外套 Input 外框；打开后优先聚焦搜索，`ArrowDown` 进入结果，`Escape` 关闭并返回触发器。
- 多选项使用 `menuitemcheckbox` 与 `aria-checked`；选中通过勾选和字重表达，高亮/hover 行使用 `surface-selected`，两种状态不得混淆。
- 指令项只触发 `onCommandSelect`，可以打开另一个 `DropdownMenu` 或 `Dialog`；邀请、分配、权限升级等业务副作用不得进入组件库。
- 非受控搜索默认在关闭后清空；受控搜索值由业务层在 `onOpenChange` 中决定是否清理。
- 浮层使用 `Raised Surface`、`--floating-shadow`、语义 Token 和平台无关 DOM 事件；不得访问 Electron、Node、网络请求或产品协议。

### InlineEdit / InlineEditSelect

- `InlineEdit` 是基于锚定 Popover 的非模态原位编辑外壳：当前值同时承担查看与编辑入口，编辑器不得推动页面布局或遮蔽整个工作区。
- `InlineEditSelect` 是枚举、成员、标签等高频属性的默认实现；单选在选择开始时关闭，多选保持浮层打开，并按需开启搜索或创建。
- 字段类型决定 editor 语义：少量枚举使用 listbox，成员使用 searchable combobox，日期使用 date picker；禁止因为视觉相似就把所有选择器实现成 action menu。
- 选择后先乐观更新本地值，再由业务层 `onCommit(nextValue, previousValue)` 写入事实源；Promise reject 时组件必须恢复 `previousValue`，显示就地错误并通过 live region 宣告。
- 保存中、成功和错误反馈附着在原字段，不使用 Toast 作为唯一反馈。失败不得静默关闭；错误不能只依赖颜色。
- `Enter / Space / ArrowDown` 可以打开，`Escape` 关闭并恢复触发器焦点；Popover 自动翻转、避让视口边缘，并在滚动或窗口变化时重新定位。
- 只对单字段、低风险、高频、可逆变更默认使用“选中即提交”。删除、发布、付款、权限移交、复杂联动和多字段校验必须使用确认流、Dialog、侧栏或完整表单。
- 移动端若无法保证浮层宽度和命中区，应由产品模式层切换为 Bottom Sheet；共享组件不自行推断业务断点。
- `InlineEdit` 不连接网络、不持久化业务数据、不判断权限；消费者负责真实保存函数、冲突策略、审计记录和可选撤销能力。

### GlassSurface

- 采用 React Bits Glass Surface 的尺寸感知位移图：主工具栏可通过 `refractive` 启用 `feDisplacementMap` 背景折射、轻微色散与低透明玻璃底色；普通操作组继续使用稳定的模糊/饱和降级层。
- 只用于正文画布内的紧凑工具栏或操作组，不替代普通信息 Surface、页面 Header 或 Dialog。
- 长画布中的主操作工具栏使用 `shape="capsule"`，可在所属滚动容器内通过 `sticky top-0` 固定；必须保留独立层级，让滚动内容成为真实折射背景，不得脱离页面结构做全局悬浮。
- SVG backdrop filter 不可用时必须自动回落到 `blur + saturate`，轮廓、边框、阴影和操作可用性不得改变。
- 若后续引入 `glass` Button 变体，内部操作必须共享 light/dark 材质 Token；不支持 backdrop-filter 时退化为 Raised Surface。

### ContextMenu

- 常规上下文操作后续统一进入 `packages/ui`，业务层只提供无副作用的菜单描述和动作回调。
- 触发元素模式必须支持右键、长按、`Shift + F10` 与菜单键；受控坐标模式用于由列表或树统一托管当前 occurrence 的菜单。
- 方向键、Enter、Escape、点击外部关闭、关闭后的焦点恢复和视口碰撞由 Base UI 原语维护，业务页面不得重复实现菜单焦点系统。
- 菜单项只允许 `default / destructive` 语义、disabled 状态和 separator；危险操作必须使用 destructive 项，并在后续确认流中说明真实影响。

### TreeView

- `TreeView` 是后续复杂原语。业务层先把层级或 DAG 展开为扁平 occurrence，再交给 `TreeView`；共享组件不理解文件类型或业务关系。
- 必须实现 `tree/treeitem`、`aria-level`、`aria-posinset`、`aria-setsize`、`aria-expanded`、roving tabindex、方向键与 Home/End。
- 同一节点多父时 occurrence ID 必须不同；`aria-selected` 只标记精确 occurrence，解除关系必须保留具体 edge 语义。
- 排序只允许在同一 parent occurrence 内执行；拖拽需显示 before/after 插入线，并提供 `Alt + ArrowUp/ArrowDown` 等价键盘路径；排序不得隐式切换选择或打开文件。
- 右键或键盘菜单键必须先选中精确 occurrence，再把锚点坐标交给业务菜单；共享树不理解具体操作。

### MarkdownEditor

- `MarkdownEditor` 是后续复杂原语。
- CodeMirror 只编辑 Markdown 源码，禁止把预览 DOM 或 WYSIWYG 序列化结果写回事实源。
- 内建搜索、撤销历史、GFM 输入、格式工具栏、可见焦点和 `Cmd/Ctrl + S`；保存、冲突与文件身份由业务层负责。
- 编辑器主题只能引用语义 CSS Variables；禁止引入第二套亮暗主题色值。

### Page primitives

- Page primitives 是后续布局原语。成熟页面统一使用 `Page → PageHeader → PageToolbar → PageContent`。
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
- 侧栏使用 `CollapsibleSidebar + SidebarHeader + SidebarToggle` 组合；宽度通过 Motion spring `stiffness: 820 / damping: 49 / mass: 0.72` 过渡。按钮轨迹具有方向性：折叠使用 `1500 / 63 / 0.65` 先进入 rail 中心，展开使用 `850 / 49 / 0.65` 随宽度向右，避免越过裁切边界；视觉稳定时间控制在 180–220ms 且不允许回弹、缩放或旋转。
- 展开态按钮固定在侧栏右侧 8px，28px 控件中心位于 x=234px；折叠态按钮位于 56px rail 中心 x=28px。按钮只沿水平轴移动，纵向位置、命中区和图标方向不变；快速连续点击必须从当前速度自然反向。
- 折叠触发时，分组标题、导航文字、快捷键和 Badge 立即退出视觉布局，导航图标在侧栏当前宽度内居中；展开触发时文字立即回到布局并由侧栏 `overflow` 自然裁切，禁止按字逐个出现、缩放文字或等待宽度结束后再整体淡入。
- 品牌区独立于宽度与按钮轨迹：折叠 120ms 淡出并左移 8px，展开等待 60ms 后用 160ms 恢复。折叠态底部状态只保留居中的语义点或头像，完整文字通过 `aria-label/title` 保留。
- 主画布必须由 Flex 随侧栏真实宽度重排，不得用覆盖层或只做 `transform: scaleX()`；Canvas 的 8px inset、12px 圆角、ring 和滚动归属在整个过渡中保持不变。
- `prefers-reduced-motion: reduce` 下宽度、按钮和品牌立即到达终态；`aria-expanded`、`aria-controls`、icon-only 的名称/tooltip 与 focus-visible ring 不得因折叠丢失。
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
- [ ] 是否复用现有 Button、Badge、Avatar、DropdownMenu、InlineEdit、Dialog 与 SegmentedControl？
- [ ] 是否复用 Input、SearchField、Surface 与已发布页面模式，而不是在业务页重复拼接？
- [ ] 认证是否默认保持验证码登录/注册同路、密码入口避免账号枚举，并且未在 Renderer 持久化 Token 或密码？
- [ ] Agent Composer 是否只在聚焦时高亮、只在非空时激活发送，并正确处理 Enter/Shift+Enter/输入法？
- [ ] 大纲素材栏是否只保存引用、在请求时现读正文、明确展示选择/失效/超限状态，并在切换知识库前确认？
- [ ] 材料成纲期间是否仅在大纲展示区显示 FogSphere，并保留 Header/右侧对话，且 light/dark、DPR 上限与 reduced-motion 都来自共享契约？
- [ ] 新基础组件是否已经进入开发态 Design System 页面供人工 Review？
- [ ] Dialog、SegmentedControl 以及后续 ContextMenu、TreeView、MarkdownEditor 是否保持键盘、焦点、长中文与 light/dark 契约？
- [ ] 页面属于 Collection、Workflow Board、Settings 或明确的新模式吗？
- [ ] Hover 是否轻于 Selected，且不会覆盖 Selected？
- [ ] 键盘焦点是否可见？Icon-only 控件是否有可访问名称？
- [ ] 长标题、中文、窄窗口和滚动是否经过验证？
- [ ] Renderer 是否仍未跨越 Electron 安全边界？
- [ ] 新源文件 L3 与相应 L2/L1 是否同步？
- [ ] 对外发布是否仍由用户显式确认？

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
