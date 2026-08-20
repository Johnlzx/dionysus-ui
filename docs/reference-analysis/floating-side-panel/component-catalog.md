# Component Catalog — Floating Side Panel

## Component

`FloatingSidePanel + FloatingSidePanelCard + SidePanelToggle`

一种用于桌面工作区的非模态上下文面板：点击稳定工具栏中的按钮后，主内容以真实布局宽度让位，右侧出现一列带四周 inset 的圆角卡片。空间、表面和轻阴影共同建立边界，不使用贯穿全高的硬分割线。

## Reference set

| Reference | Duration | Frame size | Primary evidence |
| --- | ---: | ---: | --- |
| `Screen Recording 2026-08-20 at 14.14.46.mov` | 9.817s | 3822×1916 | 单卡片、内容高度面板；多次快速开关 |
| `Screen Recording 2026-08-20 at 14.14.03.mov` | 13.433s | 3822×1916 | 多卡片属性栈；Rail 内滚动 |
| `Screen Recording 2026-08-20 at 14.11.21.mov` | 16.432s | 3090×1848 | 稳定顶栏触发器、Pinned summary 与双态按钮 |

派生证据位于本目录的 `contact/`、`stills/` 与 `motion/`。Contact sheet 用于判断终态结构，30fps motion sequence 用于判断进入/退出节奏与元素编舞。`design-system-specimen-open.png` 与 `design-system-specimen-closed.png` 是实现后的浏览器验收终态。

## Shared interaction model

三段录屏虽然内容不同，但共享同一空间语法：

1. Toggle 位于稳定的页面 Header / Toolbar，不随面板宽度移动。
2. Header 下方是 `main + aside`；打开时 Aside 获取宽度，Main 真实缩窄。
3. Aside 自身不绘制硬边界，而是给内部卡片留出四周空隙。
4. 一张或多张卡片从右侧被揭示；卡片维持固定宽度，文字不会在每一帧重新排版。
5. 关闭后 Main 取回空间；页面、滚动位置和当前对象都保持不变。

这不是 Overlay Drawer：没有遮罩、没有模态焦点、不会覆盖主任务。它也不是传统 Inspector 分栏：没有贴边全高背景和贯穿页面的 divider。

## Visual anatomy

### 1. Stable trigger

- 28–32px 图标按钮，命中区保持不变。
- Closed：Ghost / transparent，hover 只提供轻背景。
- Open：Selected Surface、清晰前景、弱 ring 和轻阴影。
- 按钮位置不动，视觉状态立即切换；图标可按产品需要改变，但不能成为唯一状态信号。

### 2. Animated track

- 受控宽度从 `0` 到 `cardWidth + 2 × inset`。
- 默认卡片 320px，默认 inset 8px，因此默认终态轨道 336px。
- 轨道负责推动 Main；`overflow: hidden` 负责逐步揭示固定宽度卡片。

### 3. Inset rail

- 四周默认 8px，形成与父容器的空气层。
- 多卡片之间同样采用 8px gap。
- Rail 拥有纵向滚动；卡片表面不承担整个页面的滚动。

### 4. Floating cards

- 12px 圆角，与 App Canvas 的圆角家族一致。
- Surface 使用语义 `surface`，配合低对比 inset ring。
- 阴影比 Dialog 更轻：只需把白色卡片从同色 Canvas 中抬起，不制造悬浮窗口感。
- 单卡片可以按内容高度结束；多卡片可以自然堆叠。只有存在固定 footer 或连续表单时才占满 Rail 高度。

## Geometry and responsive rules

| Token / range | Default | Guidance |
| --- | ---: | --- |
| Card width | 320px | 属性与轻量上下文；复杂 Inspector 可取 360–400px |
| Rail inset | 8px | 四边一致；不再由业务页叠加 margin |
| Card gap | 8px | 多卡片垂直间距 |
| Card radius | 12px | 内部控件使用更小圆角，避免同半径套娃 |
| Trigger | 28–32px | 状态切换不改变尺寸或坐标 |
| Main minimum | product-defined | 无法保留最小宽度时切换 Drawer / Bottom Sheet |

Header 应跨越整个工作区，面板只参与其下方内容区布局。这样 Toggle 的屏幕位置稳定，用户可以连续开关；也避免打开面板时顶栏操作整体漂移。

## Motion contract

### Observed behavior

- 三个参考的主要可见变化约在 100–180ms 内完成。
- 进入和退出都只有水平位移、裁切与很弱的透明度变化。
- 没有缩放、旋转或明显 overshoot。
- 快速连续点击时，运动从当前状态反向，没有排队等待。

### Adopted motion

| Layer | Value | Role |
| --- | --- | --- |
| Track width | spring `700 / 48 / 0.62` | 让 Main 连续释放 / 获取空间 |
| Card x | spring `760 / 50 / 0.62` | 从右侧 16–32px 落位，强化方向 |
| Opacity in | 140ms, `0.22, 1, 0.36, 1` | 消除裁切边缘的突兀感 |
| Opacity out | 90ms, same easing | 先停止内容干扰，再完成空间回收 |

打开时宽度和 x 同时启动；关闭时交互与无障碍状态立即关闭，视觉淡出略快于轨道回收。Motion spring 保留当前速度，因此 Toggle 可以在任意中间帧反向。

`prefers-reduced-motion: reduce` 下三条轨迹全部为 0ms；状态和布局仍正确，不用另一套 DOM。

## State model

| State | Toggle | Aside | Main |
| --- | --- | --- | --- |
| Closed | Ghost, `aria-expanded=false` | width 0, `aria-hidden`, `inert` | 占满可用宽度 |
| Opening | Selected immediately | width grows; card moves x→0 | 连续缩窄 |
| Open | Selected + weak ring/shadow | stable rail and scroll | 保持可用最小宽度 |
| Closing | Ghost immediately | inert; fast fade; width shrinks | 连续取回空间 |

打开 / 关闭是受控终态。业务层可以持久化偏好，但组件本身不读写 localStorage，也不推断屏幕断点。

## Accessibility

- Toggle：`aria-controls`、动态 `aria-expanded`、动态操作名称、title / tooltip、可见 focus ring。
- Aside：语义 `<aside>` 与具体 `aria-label`，例如“写作计划”或“项目属性”。
- Closed Aside：立即设置 `aria-hidden` 和 `inert`，零宽内容不能进入 Tab 顺序。
- 非模态：不设置 `aria-modal`，不加 overlay，不做焦点陷阱，不自动把焦点送进面板。
- 快捷键关闭：如果焦点位于 Aside 内，消费者负责将焦点恢复到 Toggle。
- 卡片内部：继续使用 heading、section、list、form 等真实结构，不能用视觉卡片替代语义。

## When to use

- 属性、写作计划、引用来源、活动历史、轻量 Inspector。
- 用户需要一边查看主内容、一边反复比对辅助上下文。
- 打开 / 关闭不应改变路由、当前对象或主内容滚动位置。

## When not to use

- 需要用户先处理才能继续：使用 Dialog。
- 一级导航、完整详情页：使用 App Shell 或路由页面。
- 少量锚定信息 / 操作：使用 Popover 或 Menu。
- 移动端或主内容无法保留可用宽度：由产品层切换 Drawer / Bottom Sheet。

## Public API

```tsx
const [open, setOpen] = useState(true);

<header>
  <SidePanelToggle
    open={open}
    aria-controls="writing-plan"
    onClick={() => setOpen((value) => !value)}
  >
    <PanelRight />
  </SidePanelToggle>
</header>

<div className="flex min-h-0">
  <main className="min-w-0 flex-1">…</main>
  <FloatingSidePanel
    id="writing-plan"
    aria-label="写作计划"
    open={open}
  >
    <FloatingSidePanelCard>…</FloatingSidePanelCard>
    <FloatingSidePanelCard>…</FloatingSidePanelCard>
  </FloatingSidePanel>
</div>
```

## Integration notes

- `packages/ui/src/floating-panel.tsx` 是 DOM、状态和视觉契约。
- `packages/ui/src/floating-panel-motion.ts` 是尺寸与运动事实源。
- `packages/ui/src/styles.css` 提供 `--floating-panel-shadow` 和 spacing tokens。
- 左侧 `SidebarToggle` 同步采用 Closed / Expanded 双态视觉：Collapsed rail 中为 Ghost，Expanded 时为 Selected。这让同一产品内的“面板存在”状态拥有一致反馈强度。

## Evidence limits

该分析是对用户提供录屏的视觉与运动级 clean-room 归纳。参考产品的真实 CSS、源码、弹性参数与无障碍实现不可见；数值是根据帧序列、几何比例和 Dionysus 现有 4px 网格校准后的设计系统取值，不声明源码级一致。
