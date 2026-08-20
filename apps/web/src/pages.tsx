/**
 * [INPUT]: 依赖 React 状态、React Router、设计系统图标、@dionysus/ui 真实原语、文档呈现组件与导航顺序
 * [OUTPUT]: 对外提供所有设计系统页面内容、页内目录、页面分发器和相邻页导航
 * [POS]: web/src 的设计知识主体，以 Foundations→Components→Patterns→Resources 层级呈现视觉语言
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AddIcon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BackIcon,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleCheck,
  CloseIcon,
  ConfirmIcon,
  Clock3,
  CornerDownRight,
  FileText,
  Flag,
  Icon,
  Layers3,
  ListFilter,
  LoaderCircle,
  MailPlus,
  MessageSquareWarning,
  MoreHorizontal,
  Paperclip,
  PanelLeft,
  PanelRight,
  Plus,
  Search,
  SearchIcon,
  Send,
  ShieldCheck,
  Sparkles,
  Tags,
  Type,
  UserRound,
  UserRoundX,
  type IconSize,
  type LucideIcon,
} from "@dionysus/ui/icons";
import {
  Avatar,
  Badge,
  Button,
  CollapsibleSidebar,
  CompactSelect,
  DropdownMenu,
  FloatingSidePanel,
  FloatingSidePanelCard,
  InlineEdit,
  InlineEditSelect,
  Input,
  PrismaticButton,
  SearchField,
  SegmentedControl,
  SidePanelToggle,
  SidebarHeader,
  SidebarToggle,
  Surface,
  cn,
  type CompactSelectOption,
  type DropdownMenuGroup,
  type InlineEditOption,
  type InlineEditSelectValue,
  type PrismaticButtonTone,
  type SegmentedControlItem,
} from "@dionysus/ui";
import { DocSection, InlineCode, PageIntro, PropTable, RuleNote, Specimen, TokenRow } from "./docs-elements";
import { DOC_ITEMS } from "./navigation";

interface TocItem { id: string; label: string }

const PAGE_TOC: Record<string, TocItem[]> = {
  overview: [
    { id: "system-map", label: "系统地图" },
    { id: "principles-at-glance", label: "四项原则" },
    { id: "start", label: "开始使用" },
  ],
  principles: [
    { id: "philosophy", label: "设计哲学" },
    { id: "ai-boundary", label: "AI 边界" },
    { id: "decision-order", label: "决策顺序" },
  ],
  colors: [
    { id: "neutral-foundation", label: "中性色底板" },
    { id: "semantic-signals", label: "语义信号" },
    { id: "surface-ladder", label: "表面层级" },
  ],
  typography: [
    { id: "type-scale", label: "字阶" },
    { id: "reading", label: "阅读排版" },
    { id: "rules", label: "使用规则" },
  ],
  icons: [
    { id: "icon-catalog", label: "精选图标" },
    { id: "icon-sizing", label: "尺寸与笔画" },
    { id: "icon-semantics", label: "语义与入口" },
    { id: "icon-accessibility", label: "无障碍" },
  ],
  layout: [
    { id: "grid", label: "4px 网格" },
    { id: "inset-canvas", label: "Inset canvas" },
    { id: "responsive", label: "响应式" },
  ],
  button: [
    { id: "variants", label: "Variants" },
    { id: "sizes", label: "Sizes" },
    { id: "hierarchy", label: "操作层级" },
    { id: "api", label: "API" },
  ],
  "prismatic-button": [
    { id: "prismatic-live", label: "Live specimen" },
    { id: "prismatic-anatomy", label: "Anatomy" },
    { id: "prismatic-behavior", label: "Behavior" },
    { id: "prismatic-api", label: "API" },
  ],
  input: [
    { id: "text-input", label: "Text input" },
    { id: "search-field", label: "Search field" },
    { id: "input-states", label: "States" },
    { id: "input-api", label: "API" },
  ],
  "compact-select": [
    { id: "compact-select-specimen", label: "Live specimen" },
    { id: "compact-select-anatomy", label: "Anatomy" },
    { id: "compact-select-comparison", label: "vs. Inline Edit" },
    { id: "compact-select-practice", label: "Best practices" },
    { id: "compact-select-accessibility", label: "Accessibility" },
    { id: "compact-select-api", label: "API" },
  ],
  "dropdown-menu": [
    { id: "assignee-menu", label: "Assignee menu" },
    { id: "behavior", label: "Behavior" },
    { id: "dropdown-api", label: "API" },
  ],
  "inline-edit": [
    { id: "inline-edit-specimen", label: "Live specimen" },
    { id: "inline-edit-anatomy", label: "Anatomy" },
    { id: "inline-edit-fields", label: "Field types" },
    { id: "inline-edit-commit", label: "Commit model" },
    { id: "inline-edit-principles", label: "Usage principles" },
    { id: "inline-edit-accessibility", label: "Accessibility" },
    { id: "inline-edit-api", label: "API" },
  ],
  "floating-panel": [
    { id: "floating-panel-specimen", label: "Live specimen" },
    { id: "floating-panel-anatomy", label: "Anatomy" },
    { id: "floating-panel-motion", label: "Motion" },
    { id: "floating-panel-behavior", label: "Behavior" },
    { id: "floating-panel-accessibility", label: "Accessibility" },
    { id: "floating-panel-api", label: "API" },
  ],
  surface: [
    { id: "surface-variants", label: "Variants" },
    { id: "elevation", label: "Elevation" },
    { id: "containment", label: "Containment" },
  ],
  feedback: [
    { id: "badges", label: "Badges" },
    { id: "page-states", label: "Page states" },
    { id: "async", label: "Async feedback" },
  ],
  "app-shell": [
    { id: "anatomy", label: "Anatomy" },
    { id: "sidebar-motion", label: "Sidebar motion" },
    { id: "shell-behavior", label: "Behavior" },
    { id: "shell-rules", label: "Rules" },
  ],
  workspace: [
    { id: "three-zones", label: "Three zones" },
    { id: "progressive-focus", label: "Progressive focus" },
    { id: "workspace-states", label: "States" },
  ],
  adoption: [
    { id: "install", label: "安装" },
    { id: "architecture", label: "架构边界" },
    { id: "review", label: "Review" },
    { id: "license", label: "许可证" },
  ],
};

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-border pl-3">
      <p className="font-mono text-sm font-medium tabular-nums">{value}</p>
      <p className="mt-1 text-micro text-muted-foreground">{label}</p>
    </div>
  );
}

function MiniAppShell({ workspace = false }: { workspace?: boolean }) {
  return (
    <div className="flex h-[22rem] w-full overflow-hidden rounded-xl border border-surface-border bg-app-shell shadow-[var(--surface-shadow)]">
      <aside className="hidden w-36 shrink-0 flex-col p-2 sm:flex">
        <div className="flex h-8 items-center gap-2 px-1">
          <span className="flex size-5 items-center justify-center rounded-md bg-primary text-micro text-primary-foreground">D</span>
          <span className="text-xs font-medium">Dionysus</span>
        </div>
        <div className="mt-4 space-y-1">
          {[
            ["创作", true], ["收件箱", false], ["我的文章", false], ["知识库", false], ["发布中心", false],
          ].map(([label, active]) => (
            <div key={String(label)} className={cn("flex h-7 items-center gap-2 rounded-md px-2 text-micro text-muted-foreground", active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground")}>
              <Circle className="size-2.5" />{label}
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 px-1 py-1">
          <Avatar name="Creator" tone="violet" />
          <span className="text-micro text-muted-foreground">Creator</span>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-9 items-center px-2">
          <span className="rounded-md bg-surface-selected/70 px-2 py-1 text-micro">{workspace ? "文章结构" : "设计系统"}</span>
        </div>
        <div className="mb-1.5 mr-1.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-page-canvas ring-1 ring-surface-border">
          <div className="flex h-9 shrink-0 items-center border-b border-border px-3 text-micro font-medium">{workspace ? "AI Native 产品不是多一个聊天框" : "工作台"}</div>
          {workspace ? (
            <div className="flex min-h-0 flex-1">
              <div className="hidden w-28 shrink-0 border-r border-border bg-surface/35 p-2 md:block">
                <p className="text-micro font-medium">素材上下文</p>
                <div className="mt-3 space-y-1.5">
                  {["产品笔记.md", "访谈摘录.md", "研究材料.md"].map((item, index) => <div key={item} className={cn("rounded-md px-1.5 py-1 text-[0.56rem] text-muted-foreground", index === 0 && "bg-surface-selected text-foreground")}>{item}</div>)}
                </div>
              </div>
              <div className="min-w-0 flex-1 p-3">
                <div className="mx-auto max-w-xs">
                  <div className="mb-3 flex h-9 items-center rounded-full border border-border bg-surface/80 px-3 text-[0.56rem] shadow-[var(--surface-shadow)]">大纲工具 <span className="ml-auto">生成正文</span></div>
                  {["问题与反常识", "交互结构", "权限边界"].map((item, index) => <Surface key={item} padding="sm" className="mb-2"><p className="text-[0.58rem] font-medium">0{index + 1} · {item}</p><p className="mt-1 text-[0.52rem] leading-3 text-muted-foreground">明确这一节的任务和论证路径。</p></Surface>)}
                </div>
              </div>
              <div className="hidden w-32 shrink-0 border-l border-border bg-surface/35 p-2 lg:block">
                <p className="text-micro font-medium">Agent 对话</p>
                <div className="mt-3 rounded-lg bg-surface p-2 text-[0.52rem] leading-3 text-muted-foreground">保留你的原始判断，只调整结构。</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-5">
              <div className="w-full max-w-sm">
                <p className="text-center text-xs font-medium">内容是舞台，界面是脚手架</p>
                <p className="mx-auto mt-2 max-w-xs text-center text-micro leading-4 text-muted-foreground">用灰阶、距离和稳定节奏建立层级。</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Surface variant="subtle" padding="sm" className="h-16" />
                  <Surface variant="card" padding="sm" className="h-16" />
                  <Surface variant="selected" padding="sm" className="h-16" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarMotionSpecimen() {
  const [collapsed, setCollapsed] = useState(false);
  const items = [
    { icon: Plus, label: "新建", active: true },
    { icon: Clock3, label: "最近使用", active: false },
    { icon: FileText, label: "我的文档", active: false },
    { icon: Layers3, label: "知识库", active: false },
  ];

  return (
    <div className="flex h-[24rem] overflow-hidden rounded-xl border border-surface-border bg-app-shell shadow-[var(--surface-shadow)]">
      <CollapsibleSidebar
        aria-label="侧栏动效示例"
        className="flex flex-col bg-sidebar text-sidebar-foreground"
        collapsed={collapsed}
        id="sidebar-motion-specimen"
      >
        <SidebarHeader
          toggle={(
            <SidebarToggle
              aria-controls="sidebar-motion-specimen"
              collapsed={collapsed}
              onClick={() => setCollapsed((current) => !current)}
            >
              <PanelLeft />
            </SidebarToggle>
          )}
        >
          <div className="flex h-10 items-center gap-2 px-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-micro text-primary-foreground">D</span>
            <span className="text-xs font-medium">Dionysus</span>
          </div>
        </SidebarHeader>
        <nav aria-label="示例导航" className="space-y-1 px-2 pt-3">
          {items.map(({ active, icon: Icon, label }) => (
            <div
              aria-label={collapsed ? label : undefined}
              className={cn(
                "flex h-9 min-w-0 items-center overflow-hidden rounded-lg text-xs text-muted-foreground",
                collapsed ? "justify-center px-0" : "gap-2.5 px-3",
                active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
              )}
              key={label}
              title={collapsed ? label : undefined}
            >
              <Icon aria-hidden className="size-4 shrink-0" />
              <span className={cn("min-w-0 truncate", collapsed && "sr-only")}>{label}</span>
            </div>
          ))}
        </nav>
      </CollapsibleSidebar>
      <div className="flex min-w-0 flex-1 flex-col p-2 pl-0">
        <div className="flex h-10 shrink-0 items-center px-3 text-micro text-muted-foreground">Canvas follows the rail · no overlay</div>
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-page-canvas ring-1 ring-surface-border">
          <div className="max-w-xs px-5 text-center">
            <p className="text-sm font-medium">按钮沿水平轨道移动</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">连续点击可中断并反向；主画布通过 Flex 重排跟随侧栏宽度。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingPanelSpecimen() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-[28rem] w-full flex-col overflow-hidden rounded-xl border border-surface-border bg-app-shell shadow-[var(--surface-shadow)]">
      <div className="flex h-11 shrink-0 items-center gap-2 px-3">
        <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-micro text-primary-foreground">D</span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">内容工作台</p>
          <p className="text-micro text-muted-foreground">正文 / 当前草稿</p>
        </div>
        <SidePanelToggle
          aria-controls="floating-panel-specimen"
          className="ml-auto"
          onClick={() => setOpen((current) => !current)}
          open={open}
        >
          <PanelRight />
        </SidePanelToggle>
      </div>
      <div className="flex min-h-0 flex-1">
        <main className="m-2 mr-0 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-page-canvas ring-1 ring-surface-border">
          <div className="flex h-10 shrink-0 items-center border-b border-border px-4 text-micro text-muted-foreground">Draft · 已保存</div>
          <div className="min-h-0 flex-1 overflow-hidden px-6 py-8 sm:px-10">
            <div className="mx-auto max-w-md">
              <p className="text-micro font-medium text-muted-foreground">03 / 交互结构</p>
              <h3 className="mt-3 text-balance text-lg font-semibold tracking-tight">让辅助信息保持在视野内，但不与正文争夺注意力。</h3>
              <p className="mt-4 text-xs leading-6 text-muted-foreground">主内容通过真实布局宽度让位。面板关闭后，画布自然取回空间；打开时，圆角表面与四周留白共同表达它是可临时收起的上下文。</p>
              <div className="mt-7 space-y-3">
                <div className="h-2.5 w-full rounded-full bg-muted" />
                <div className="h-2.5 w-[88%] rounded-full bg-muted" />
                <div className="h-2.5 w-[72%] rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </main>
        <FloatingSidePanel
          aria-label="写作上下文"
          id="floating-panel-specimen"
          open={open}
          width={276}
        >
          <FloatingSidePanelCard>
            <div className="flex items-center border-b border-border/70 px-3 py-2.5">
              <p className="text-xs font-medium">写作计划</p>
              <Badge className="ml-auto" size="xs" variant="success">Ready</Badge>
            </div>
            <div className="space-y-3 p-3">
              {["说明布局让位", "保留浮动间距", "检查按钮双态"].map((item, index) => (
                <div className="flex items-center gap-2 text-micro" key={item}>
                  <span className={cn("flex size-4 items-center justify-center rounded-full border", index < 2 ? "border-success/25 bg-success/10 text-success-foreground" : "border-border text-muted-foreground")}>{index < 2 ? <Check className="size-2.5" /> : index + 1}</span>
                  <span className={index < 2 ? "text-muted-foreground line-through" : "font-medium"}>{item}</span>
                </div>
              ))}
            </div>
          </FloatingSidePanelCard>
          <FloatingSidePanelCard className="p-3">
            <div className="flex items-center gap-2"><FileText className="size-3.5 text-muted-foreground" /><p className="text-xs font-medium">引用材料</p><span className="ml-auto font-mono text-micro text-muted-foreground">3</span></div>
            <p className="mt-3 text-micro leading-4 text-muted-foreground">研究笔记、交互录屏、现有设计规范</p>
          </FloatingSidePanelCard>
          <FloatingSidePanelCard className="min-h-24 p-3">
            <p className="text-xs font-medium">复核记录</p>
            <p className="mt-2 text-micro leading-4 text-muted-foreground">面板与主内容没有硬分割线；空间和表面层级承担边界。</p>
          </FloatingSidePanelCard>
        </FloatingSidePanel>
      </div>
    </div>
  );
}

function OverviewPage() {
  return (
    <>
      <PageIntro
        eyebrow="Getting started"
        title="为作者型 AI 工作台建立一套安静的秩序。"
        description="Dionysus UI 以内容为中心，以中性色建立层级，以小面积语义色表达状态，并把最终判断与发布控制权始终留给用户。"
        status="Active"
        meta={<><Metric value="2" label="Color modes" /><Metric value="10" label="Core primitives" /><Metric value="4px" label="Base grid" /><Metric value="AA" label="Target contrast" /></>}
      />
      <DocSection id="system-map" title="系统地图" description="从共享 Token 到产品工作区，层级越向上越接近业务，越向下越稳定。">
        <MiniAppShell />
        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {[
            ["01", "Foundations", "颜色、字体、间距、动效"],
            ["02", "Components", "可组合的交互原语"],
            ["03", "Patterns", "稳定的页面与工作区结构"],
            ["04", "Product", "创作、知识库与发布流程"],
          ].map(([number, title, copy]) => (
            <div key={number} className="bg-background p-4">
              <span className="font-mono text-micro text-muted-foreground">{number}</span>
              <p className="mt-5 text-xs font-medium">{title}</p>
              <p className="mt-1 text-micro leading-4 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="principles-at-glance" title="四项原则" description="视觉决定必须能回到这四条约束，而不是依赖个人偏好。">
        <div className="grid border-y border-border sm:grid-cols-2">
          {[
            ["01", "克制即高级", "先使用留白、灰阶和排版，最后才增加视觉效果。"],
            ["02", "颜色只传递信号", "品牌、成功、警告与危险色不承担日常装饰。"],
            ["03", "一致性高于局部个性", "同类状态在所有页面拥有同样的反馈强度。"],
            ["04", "AI 不是视觉主角", "能力可见，控制权和真实内容始终更重要。"],
          ].map(([number, title, copy], index) => (
            <div key={number} className={cn("grid grid-cols-[2rem_1fr] gap-3 py-5 sm:px-5", index % 2 === 0 ? "sm:border-r sm:border-border sm:pl-0" : "sm:pr-0", index < 2 && "border-b border-border")}>
              <span className="font-mono text-micro text-muted-foreground">{number}</span>
              <div><p className="text-sm font-medium">{title}</p><p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">{copy}</p></div>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="start" title="从哪里开始" description="先理解基础层级，再选择组件；不要从页面截图反推零散样式。">
        <div className="divide-y divide-border rounded-xl border border-border">
          {[
            ["/foundations/colors", "颜色与表面", "理解 App Shell、Canvas、Surface 和状态色的职责。"],
            ["/components/button", "Button", "用真实操作优先级决定按钮变体。"],
            ["/patterns/app-shell", "App shell", "复用悬浮主画布与侧栏结构。"],
          ].map(([path, label, copy]) => (
            <Link key={path} to={path} className="group flex items-center gap-4 px-4 py-4 outline-none hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring">
              <span className="min-w-0 flex-1"><span className="block text-xs font-medium">{label}</span><span className="mt-1 block text-micro leading-4 text-muted-foreground">{copy}</span></span>
              <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </DocSection>
    </>
  );
}

function PrinciplesPage() {
  return (
    <>
      <PageIntro eyebrow="Getting started" title="设计原则不是口号，而是选择的先后顺序。" description="当页面出现冲突时，先保护内容、状态和控制权，再讨论个性与装饰。" />
      <DocSection id="philosophy" title="设计哲学">
        <div className="divide-y divide-border border-y border-border">
          {[
            ["内容是舞台", "导航、工具栏和容器只负责提供位置感。它们不与文章、大纲和素材竞争视觉注意。"],
            ["层级来自明度与距离", "先通过中性表面、间距和单条 divider 建立关系，Card 是最后手段。"],
            ["状态必须连续", "Rest、hover、pressed、selected、focus-visible 和 disabled 形成可预测的强度阶梯。"],
            ["高级感来自纪律", "同一类尺寸、圆角、阴影和图标描边只保留稳定的少数选择。"],
          ].map(([title, copy], index) => (
            <div key={title} className="grid gap-3 py-6 sm:grid-cols-[3rem_11rem_1fr]">
              <span className="font-mono text-micro text-muted-foreground">0{index + 1}</span>
              <p className="text-sm font-medium">{title}</p>
              <p className="max-w-lg text-xs leading-6 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="ai-boundary" title="AI 边界" description="AI 反馈可以有识别度，但不能通过视觉强度替用户做决定。">
        <RuleNote kind="safety"><strong className="font-medium text-foreground">始终保留人工确认。</strong> 生成、精修和排版可以自动执行；覆盖、账号连接和对外发布必须由用户显式触发。</RuleNote>
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {[
            ["可见", "真实请求状态和当前 Agent 能力"],
            ["克制", "动效只出现在发生变化的局部"],
            ["可回退", "失败保留已有内容和版本"],
          ].map(([title, copy]) => <div key={title} className="bg-background p-4"><p className="text-xs font-medium">{title}</p><p className="mt-2 text-micro leading-4 text-muted-foreground">{copy}</p></div>)}
        </div>
      </DocSection>
      <DocSection id="decision-order" title="决策顺序">
        <ol className="space-y-3">
          {["这个元素是否帮助用户定位、操作或判断？", "能否只用留白和排版表达？", "是否需要 divider 或背景变化？", "Card 是否真的表达独立对象或 elevation？", "颜色和动效是否只对应真实语义？"].map((item, index) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-6"><span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-micro text-muted-foreground">{index + 1}</span><span>{item}</span></li>
          ))}
        </ol>
      </DocSection>
    </>
  );
}

function ColorsPage() {
  return (
    <>
      <PageIntro eyebrow="Foundations" title="颜色负责建立秩序，而不是制造热闹。" description="冷灰底板承载绝大多数界面，语义色只在用户需要识别状态和风险时出现。" meta={<span>OKLCh · Light / Dark · Semantic tokens</span>} />
      <DocSection id="neutral-foundation" title="中性色底板" description="Light 和 Dark 使用相同 Token 名称；组件永远不感知主题中的具体数值。">
        <div className="rounded-xl border border-border px-3">
          <TokenRow name="app-shell" role="应用外框、侧栏和主画布留白" value="L 0.964 · D 0.155" swatchClassName="bg-app-shell" />
          <TokenRow name="page-canvas" role="页面主体与连续工作区" value="L 0.988 · D 0.180" swatchClassName="bg-page-canvas" />
          <TokenRow name="surface" role="常驻信息容器" value="L 1.000 · D 0.210" swatchClassName="bg-surface" />
          <TokenRow name="surface-raised" role="Dialog、Menu 等临时浮层" value="L 1.000 · D 0.235" swatchClassName="bg-surface-raised" />
          <TokenRow name="surface-hover" role="临时经过反馈，不表示选择" value="L 0.967 · D 0.274" swatchClassName="bg-surface-hover" />
          <TokenRow name="surface-selected" role="持续选择与当前位置" value="L 0.935 · D 0.300" swatchClassName="bg-surface-selected" />
        </div>
      </DocSection>
      <DocSection id="semantic-signals" title="语义信号" description="每屏不超过三种状态色；大面积背景保持 5%–12% 浓度。">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Brand", "bg-brand", "关键强调"], ["Info", "bg-info", "链接 / 待发布"], ["Success", "bg-success", "成功 / 已保存"], ["Warning", "bg-warning", "注意 / 进行中"], ["Danger", "bg-destructive", "失败 / 不可逆"],
          ].map(([name, className, role]) => (
            <div key={name} className="min-w-0">
              <div className={cn("h-20 rounded-xl", className)} />
              <p className="mt-2 text-xs font-medium">{name}</p>
              <p className="mt-0.5 text-micro text-muted-foreground">{role}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="info">待发布</Badge><Badge variant="success">已保存</Badge><Badge variant="warning">需要复核</Badge><Badge variant="destructive">保存失败</Badge>
        </div>
      </DocSection>
      <DocSection id="surface-ladder" title="表面层级" description="深度来自相邻表面的细微差值，不来自厚重投影。">
        <Specimen title="Surface ladder" description="从 App Shell 到临时浮层" code={'<Surface variant="card" />\n<Surface variant="raised" />'}>
          <div className="w-full max-w-xl rounded-2xl bg-app-shell p-4">
            <div className="rounded-xl bg-page-canvas p-4 ring-1 ring-surface-border">
              <Surface padding="md">
                <p className="text-xs font-medium">常驻 Surface</p>
                <Surface variant="raised" padding="md" className="mt-4 ml-auto max-w-xs">
                  <p className="text-xs font-medium">Raised Surface</p>
                  <p className="mt-1 text-micro text-muted-foreground">只在临时浮层中使用更远阴影。</p>
                </Surface>
              </Surface>
            </div>
          </div>
        </Specimen>
      </DocSection>
    </>
  );
}

function TypographyPage() {
  return (
    <>
      <PageIntro eyebrow="Foundations" title="紧凑的界面需要安静而明确的字阶。" description="Inter Variable 提供跨平台稳定性；中文使用系统无衬线回退。层级主要由字号、明度和位置建立，只使用 400 与 500 两档字重。" />
      <DocSection id="type-scale" title="字阶" description="同一区块最多出现两种字号；第三层级优先使用颜色或位置。">
        <div className="divide-y divide-border border-y border-border">
          {[
            ["Display", "36 / 40", "text-4xl", "Dionysus UI"],
            ["Title", "30 / 36", "text-3xl", "为内容建立安静的秩序"],
            ["Heading", "20 / 28", "text-xl", "颜色与表面"],
            ["Body", "14 / 28", "text-sm", "长文阅读通过更大的行高保持舒展。"],
            ["Label", "12 / 16", "text-xs", "组件状态与操作标签"],
            ["Nav section", "10 / 14", "text-nav-section", "FOUNDATIONS"],
            ["Micro", "10 / 14", "text-micro", "VERSION 0.1 · UPDATED TODAY"],
          ].map(([role, metrics, token, sample]) => (
            <div key={role} className="grid items-baseline gap-3 py-5 sm:grid-cols-[5rem_6rem_1fr]">
              <span className="text-micro text-muted-foreground">{role}</span>
              <span className="font-mono text-micro text-muted-foreground">{metrics}</span>
              <p className={cn("font-medium", role === "Nav section" ? "uppercase tracking-nav-section" : "tracking-tight", token)}>{sample}</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="reading" title="阅读排版" description="工作区可以很宽，文章行长必须收窄。">
        <Surface variant="flat" className="mx-auto max-w-2xl py-4">
          <p className="text-micro font-medium uppercase tracking-[0.14em] text-muted-foreground">Essay sample</p>
          <h2 className="mt-4 text-2xl font-medium tracking-tight">内容是舞台，界面是脚手架</h2>
          <p className="mt-5 text-sm leading-7 text-foreground/90">真正成熟的工作台不会持续提醒用户它被设计过。导航给出位置，工具给出下一步，视觉层级把注意力留给正在被思考和编辑的内容。</p>
          <p className="mt-3 text-sm leading-7 text-foreground/90">因此，阅读画布使用受控行长和更大行高；树、列表与工具栏则保持更紧凑的操作密度。</p>
          <blockquote className="mt-5 border-l-2 border-brand/45 pl-4 text-sm leading-7 text-muted-foreground">高级感不是效果的数量，而是选择的纪律。</blockquote>
        </Surface>
      </DocSection>
      <DocSection id="rules" title="使用规则">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {[
            ["只用 400 / 500", "避免 Bold 与 Semibold 把每个区块都变成重点。"],
            ["数字使用 tabular", "计数、版本、字数与时间轴保持稳定对齐。"],
            ["长文控制在约 65 字符", "阅读内容使用 max-width，不随工作区无限拉宽。"],
            ["标题收紧 tracking", "20px 以上标题使用轻微负字距建立整体感。"],
          ].map(([title, copy]) => <div key={title} className="bg-background p-4"><p className="text-xs font-medium">{title}</p><p className="mt-2 text-micro leading-4 text-muted-foreground">{copy}</p></div>)}
        </div>
      </DocSection>
    </>
  );
}

const curatedIcons: Array<{ name: string; icon: LucideIcon; usage: string }> = [
  { name: "AddIcon", icon: AddIcon, usage: "创建、添加" },
  { name: "BackIcon", icon: BackIcon, usage: "返回上一层" },
  { name: "CloseIcon", icon: CloseIcon, usage: "关闭、清除" },
  { name: "ConfirmIcon", icon: ConfirmIcon, usage: "确认、完成" },
  { name: "SearchIcon", icon: SearchIcon, usage: "搜索、查找" },
  { name: "CalendarDays", icon: CalendarDays, usage: "日期、日程" },
  { name: "FileText", icon: FileText, usage: "文档、正文" },
  { name: "Layers3", icon: Layers3, usage: "集合、知识库" },
  { name: "ListFilter", icon: ListFilter, usage: "筛选、菜单" },
  { name: "MessageSquareWarning", icon: MessageSquareWarning, usage: "反馈、异常" },
  { name: "PanelLeft", icon: PanelLeft, usage: "侧栏、导航" },
  { name: "ShieldCheck", icon: ShieldCheck, usage: "安全、已验证" },
  { name: "Sparkles", icon: Sparkles, usage: "AI、生成" },
  { name: "Tags", icon: Tags, usage: "标签、分类" },
  { name: "UserRound", icon: UserRound, usage: "成员、负责人" },
];

const iconSizeSamples: IconSize[] = ["xs", "sm", "md", "lg", "xl"];

function IconsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Foundations"
        title="图标是一种界面语言，不是素材库存。"
        description="Lucide 提供底层字形，Dionysus UI 只开放经过选择的子集，并在同一个入口内统一尺寸、笔画、语义和无障碍行为。"
        status="Ready"
        meta={<span>Source: <InlineCode>@dionysus/ui/icons</InlineCode> · Lucide React 1.24.0</span>}
      />
      <DocSection id="icon-catalog" title="精选图标" description="这里只展示设计系统当前允许使用的核心语义；新增图标必须先明确用途，不能因为视觉相近而随意替换。">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {curatedIcons.map(({ name, icon, usage }) => (
            <div key={name} className="group bg-background p-4 transition-colors hover:bg-surface-hover">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon icon={icon} size="lg" />
              </span>
              <code className="mt-5 block truncate font-mono text-micro text-foreground">{name}</code>
              <p className="mt-1 text-micro text-muted-foreground">{usage}</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="icon-sizing" title="尺寸与笔画" description="尺寸跟随组件密度，不由单个页面自由缩放。所有标准尺寸使用 2px viewBox 笔画和 currentColor。">
        <Surface variant="subtle" padding="lg" className="flex flex-wrap items-end justify-between gap-6">
          {iconSizeSamples.map((size) => (
            <div key={size} className="flex min-w-16 flex-col items-center gap-3">
              <span className="flex size-10 items-center justify-center"><Icon icon={Sparkles} size={size} /></span>
              <code className="font-mono text-micro text-muted-foreground">{size}</code>
            </div>
          ))}
        </Surface>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {[["xs", "12px", "微型状态"], ["sm", "14px", "紧凑控件"], ["md", "16px", "默认界面"], ["lg", "20px", "空态与强调"], ["xl", "24px", "低频展示"]].map(([size, pixels, usage]) => (
            <div key={size} className="border-l border-border pl-3"><p className="font-mono text-micro">{pixels}</p><p className="mt-1 text-micro text-muted-foreground">{usage}</p></div>
          ))}
        </div>
      </DocSection>
      <DocSection id="icon-semantics" title="语义与入口" description="应用只依赖 Dionysus 的稳定出口；第三方包名、字形选择和升级节奏留在设计系统内部。">
        <Specimen
          title="Curated import"
          description="静态具名导入保持依赖清晰，并允许构建工具移除未使用图标"
          code={'import { AddIcon, Icon } from "@dionysus/ui/icons"\n\n<Button aria-label="新建" size="icon">\n  <Icon icon={AddIcon} />\n</Button>'}
        >
          <div className="flex items-center gap-3">
            <Button size="icon" aria-label="新建"><Icon icon={AddIcon} /></Button>
            <div><p className="text-xs font-medium">语义名属于产品语言</p><p className="mt-1 text-micro text-muted-foreground">AddIcon 可以在不改变业务代码的前提下更换底层字形。</p></div>
          </div>
        </Specimen>
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          <div className="bg-background p-4"><p className="text-xs font-medium text-success-foreground">Do</p><p className="mt-2 text-micro leading-4 text-muted-foreground">从 <InlineCode>@dionysus/ui/icons</InlineCode> 具名导入；同一语义始终使用同一图标。</p></div>
          <div className="bg-background p-4"><p className="text-xs font-medium text-destructive">Avoid</p><p className="mt-2 text-micro leading-4 text-muted-foreground">直接依赖 <InlineCode>lucide-react</InlineCode>、使用字符串动态查找，或在同一产品中混用多套图标库。</p></div>
        </div>
      </DocSection>
      <DocSection id="icon-accessibility" title="无障碍" description="装饰图标不进入可访问性树；承载独立含义时提供标签；图标按钮的名称始终属于按钮。">
        <div className="grid gap-3 sm:grid-cols-3">
          <Surface padding="md"><Icon icon={Sparkles} /><p className="mt-5 text-xs font-medium">装饰图标</p><p className="mt-1 text-micro leading-4 text-muted-foreground">未提供 label 时，Icon 默认 aria-hidden。</p></Surface>
          <Surface padding="md"><Icon icon={ShieldCheck} label="安全检查已通过" /><p className="mt-5 text-xs font-medium">独立语义</p><p className="mt-1 text-micro leading-4 text-muted-foreground">使用 label 生成 img 语义和可访问名称。</p></Surface>
          <Surface padding="md"><Button size="icon-sm" aria-label="搜索"><Icon icon={SearchIcon} /></Button><p className="mt-5 text-xs font-medium">图标按钮</p><p className="mt-1 text-micro leading-4 text-muted-foreground">按钮提供 aria-label，内部图标保持装饰性。</p></Surface>
        </div>
        <div className="mt-4"><RuleNote kind="safety">颜色和图标不能成为状态的唯一表达。错误、成功和风险还需要可见文本，必要时通过 aria-live 宣告变化。</RuleNote></div>
      </DocSection>
    </>
  );
}

function LayoutPage() {
  return (
    <>
      <PageIntro eyebrow="Foundations" title="先设计空间关系，再设计容器。" description="Dionysus UI 使用 4px 基础网格、稳定的侧栏和 inset canvas，把高密度操作与长文阅读组织在同一工作台中。" />
      <DocSection id="grid" title="4px 网格" description="间距表达关系，而不是单纯填充空白。">
        <div className="flex items-end gap-3 overflow-x-auto rounded-xl border border-border p-5">
          {[4, 8, 12, 16, 24, 32, 48].map((value) => (
            <div key={value} className="flex min-w-12 flex-1 flex-col items-center gap-3">
              <div className="w-full rounded-md bg-foreground/10" style={{ height: `${value * 1.6}px` }} />
              <span className="font-mono text-micro text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 text-xs leading-5 text-muted-foreground sm:grid-cols-4">
          <p><strong className="font-medium text-foreground">4px</strong><br />紧密图标与标签</p>
          <p><strong className="font-medium text-foreground">8px</strong><br />同一控件内部</p>
          <p><strong className="font-medium text-foreground">12–16px</strong><br />组件与区块</p>
          <p><strong className="font-medium text-foreground">24px+</strong><br />页面大节</p>
        </div>
      </DocSection>
      <DocSection id="inset-canvas" title="Inset canvas" description="左侧导航不是 padding，而是稳定工作区；主内容像一张嵌在应用底板上的纸。">
        <MiniAppShell />
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric value="256px" label="Expanded sidebar" /><Metric value="56px" label="Collapsed rail" /><Metric value="48px" label="Page header" /><Metric value="8px" label="Outer inset" />
        </div>
      </DocSection>
      <DocSection id="responsive" title="响应式" description="窄屏不是缩小三栏，而是改变信息出现的顺序。">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[40rem] text-left text-xs">
            <thead className="bg-muted/45 text-muted-foreground"><tr><th className="px-3 py-2.5 font-medium">Viewport</th><th className="px-3 py-2.5 font-medium">Navigation</th><th className="px-3 py-2.5 font-medium">Workspace</th><th className="px-3 py-2.5 font-medium">Canvas</th></tr></thead>
            <tbody className="divide-y divide-border">
              <tr><td className="px-3 py-3 font-mono">≥1280</td><td className="px-3 py-3">256px sidebar</td><td className="px-3 py-3">三栏完整展开</td><td className="px-3 py-3">8px inset + 12px radius</td></tr>
              <tr><td className="px-3 py-3 font-mono">1024–1279</td><td className="px-3 py-3">56px rail</td><td className="px-3 py-3">一次展开一个上下文栏</td><td className="px-3 py-3">保留 inset</td></tr>
              <tr><td className="px-3 py-3 font-mono">768–1023</td><td className="px-3 py-3">Overlay drawer</td><td className="px-3 py-3">单主栏 + sheet</td><td className="px-3 py-3">缩小外侧间距</td></tr>
              <tr><td className="px-3 py-3 font-mono">&lt;768</td><td className="px-3 py-3">Overlay drawer</td><td className="px-3 py-3">按任务流单栏重组</td><td className="px-3 py-3">取消外圆角</td></tr>
            </tbody>
          </table>
        </div>
      </DocSection>
    </>
  );
}

function ButtonPage() {
  const variants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
  return (
    <>
      <PageIntro eyebrow="Components" title="Button" description="Button 触发动作或改变状态。变体表达操作优先级，不用于装饰页面。" status="Ready" meta={<span>Source: <InlineCode>@dionysus/ui</InlineCode></span>} />
      <DocSection id="variants" title="Variants" description="同一区域通常只有一个 default 操作；其余动作逐级降噪。">
        <Specimen title="Button variants" description="六种稳定操作语义" code={'<Button>保存更改</Button>\n<Button variant="outline">预览</Button>\n<Button variant="destructive">删除</Button>'}>
          <div className="flex max-w-lg flex-wrap items-center justify-center gap-2">
            {variants.map((variant) => <Button key={variant} variant={variant}>{variant === "default" ? "保存更改" : variant}</Button>)}
          </div>
        </Specimen>
      </DocSection>
      <DocSection id="sizes" title="Sizes" description="32px 是桌面工作台默认高度；触屏环境通过模式层提升 hit target。">
        <Specimen title="Button sizes" description="从紧凑工具操作到主表单动作" code={'<Button size="xs">XS</Button>\n<Button size="sm">Small</Button>\n<Button size="default">Default</Button>\n<Button size="lg">Large</Button>'}>
          <div className="flex flex-wrap items-center justify-center gap-3"><Button size="xs">XS</Button><Button size="sm">Small</Button><Button>Default</Button><Button size="lg">Large</Button><Button size="icon" aria-label="新建"><Plus /></Button></div>
        </Specimen>
      </DocSection>
      <DocSection id="hierarchy" title="操作层级">
        <div className="divide-y divide-border rounded-xl border border-border">
          {[
            ["Primary", "default", "当前上下文唯一的主完成动作"],
            ["Secondary", "outline / secondary", "保留但不争夺注意力的操作"],
            ["Tertiary", "ghost / link", "工具栏、导航或低频辅助动作"],
            ["Risk", "destructive", "删除、放弃和其他不可逆结果"],
          ].map(([role, variant, copy]) => <div key={role} className="grid gap-2 px-4 py-4 sm:grid-cols-[7rem_9rem_1fr]"><p className="text-xs font-medium">{role}</p><code className="font-mono text-micro text-info-foreground">{variant}</code><p className="text-xs text-muted-foreground">{copy}</p></div>)}
        </div>
        <RuleNote kind="safety"><strong className="font-medium">危险不是颜色问题。</strong> 按钮必须配合清晰的标题、影响说明和显式确认。</RuleNote>
      </DocSection>
      <DocSection id="api" title="API">
        <PropTable rows={[
          { name: "variant", type: '"default" | "outline" | …', defaultValue: '"default"', description: "表达操作层级和风险语义。" },
          { name: "size", type: '"xs" | "sm" | "default" | …', defaultValue: '"default"', description: "控制视觉密度，不替代触屏 hit area 规则。" },
          { name: "disabled", type: "boolean", defaultValue: "false", description: "保留动作可见性并阻止交互。" },
          { name: "aria-label", type: "string", defaultValue: "—", description: "Icon-only Button 必填。" },
        ]} />
      </DocSection>
    </>
  );
}

const PRISMATIC_PALETTE_META: Record<PrismaticButtonTone, { name: string; description: string }> = {
  green: { name: "Green · source", description: "经确认的原始绿色光谱" },
  blue: { name: "Blue · extension", description: "共享光学结构的受控蓝色扩展" },
  violet: { name: "Violet · extension", description: "偏冷的高饱和紫色扩展" },
  amber: { name: "Amber · extension", description: "温暖但保持文字对比的琥珀扩展" },
  rose: { name: "Rose · extension", description: "深玫红到亮红的受控扩展" },
  cyan: { name: "Cyan · extension", description: "深青到亮青的清晰扩展" },
};

const PRISMATIC_TONE_ITEMS: SegmentedControlItem[] = [
  {
    value: "green",
    label: <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: "rgb(var(--prismatic-button-green-ray-2-rgb))" }} />绿色</span>,
  },
  {
    value: "blue",
    label: <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: "rgb(var(--prismatic-button-blue-ray-2-rgb))" }} />蓝色</span>,
  },
  {
    value: "violet",
    label: <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: "rgb(var(--prismatic-button-violet-ray-2-rgb))" }} />紫色</span>,
  },
  {
    value: "amber",
    label: <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: "rgb(var(--prismatic-button-amber-ray-2-rgb))" }} />琥珀</span>,
  },
  {
    value: "rose",
    label: <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: "rgb(var(--prismatic-button-rose-ray-2-rgb))" }} />玫红</span>,
  },
  {
    value: "cyan",
    label: <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: "rgb(var(--prismatic-button-cyan-ray-2-rgb))" }} />青色</span>,
  },
];

const PRISMATIC_TONES = new Set<PrismaticButtonTone>(["green", "blue", "violet", "amber", "rose", "cyan"]);

function toPrismaticTone(value: string): PrismaticButtonTone {
  const tone = value as PrismaticButtonTone;
  return PRISMATIC_TONES.has(tone) ? tone : "green";
}

function PrismaticButtonPage() {
  const [tone, setTone] = useState<PrismaticButtonTone>("green");
  const selectedPalette = PRISMATIC_PALETTE_META[tone];

  return (
    <>
      <PageIntro
        eyebrow="Components"
        title="Prismatic Button"
        description="用于极少量高强调主操作的动态按钮。静态渐变保证稳定对比，OGL/GLSL 光场只作为渐进增强；WebGL 不可用时仍保留完整按钮语义。"
        status="Ready"
        meta={<span>Source: <InlineCode>@dionysus/ui</InlineCode> · OGL 1.0.11</span>}
      />
      <DocSection id="prismatic-live" title="Live specimen" description="使用色板切换器控制同一枚按钮。绿色是经确认的源色板，其余五组是共享光学结构上的受控扩展。静态渐变、六色光谱、hover 辉光和 focus ring 会作为完整色板一起切换。">
        <Specimen
          title="Controlled palette"
          description="六组完整光学 Token，不开放任意取色"
          code={'const [tone, setTone] = useState<PrismaticButtonTone>("green")\n\n<PrismaticButton tone={tone}>Login</PrismaticButton>'}
        >
          <div className="flex w-full max-w-[36rem] flex-col items-center gap-8">
            <div className="flex w-full flex-col gap-3 border-b border-border/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">按钮色板</p>
                <p className="mt-1 text-micro leading-4 text-muted-foreground">切换完整的静态与动态颜色 Token</p>
              </div>
              <SegmentedControl
                value={tone}
                onValueChange={(nextTone) => setTone(toPrismaticTone(nextTone))}
                label="Prismatic Button 色板"
                size="xs"
                className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-6"
                items={PRISMATIC_TONE_ITEMS}
              />
            </div>
            <div className="w-full" style={{ maxWidth: "var(--prismatic-button-reference-width)" }}>
              <div aria-live="polite" className="mb-3 flex items-end justify-between gap-4">
                <p className="font-mono text-micro uppercase tracking-nav-section text-foreground">{selectedPalette.name}</p>
                <p className="text-right text-micro text-muted-foreground">{selectedPalette.description}</p>
              </div>
              <PrismaticButton tone={tone}>Login</PrismaticButton>
            </div>
          </div>
        </Specimen>
        <RuleNote kind="safety"><strong className="font-medium">绿色在这里是受控色板，不是 Success 状态。</strong> 每个 Surface 最多使用一个 Prismatic Button，只用于明确、高价值且可逆的主操作；危险、删除和发布确认继续使用现有风险语义与确认流。</RuleNote>
      </DocSection>
      <DocSection id="prismatic-anatomy" title="Anatomy" description="按钮把稳定语义与 GPU 增强分层，任何视觉层失败都不影响名称、焦点或点击行为。">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Static gradient", "三段底色始终存在，承担对比度与 WebGL 降级。"],
            ["02", "PrismaticBurst", "全屏 Triangle 通过 GLSL 生成 18 束动态棱光。"],
            ["03", "Blur composite", "6px 后置模糊把低成本射线融合为液态光斑。"],
            ["04", "Content layer", "文字与图标位于独立前景层，始终保持清晰。"],
          ].map(([index, title, copy]) => (
            <Surface key={index} padding="md">
              <p className="font-mono text-micro text-muted-foreground">{index}</p>
              <p className="mt-6 text-xs font-medium">{title}</p>
              <p className="mt-2 text-micro leading-4 text-muted-foreground">{copy}</p>
            </Surface>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric value="326×44" label="参考几何（px）" />
          <Metric value="1 DPR" label="固定渲染密度" />
          <Metric value="6" label="Ray-march steps" />
          <Metric value="18" label="受控光束数量" />
        </div>
      </DocSection>
      <DocSection id="prismatic-behavior" title="Behavior" description="动效服从状态、可访问性和设备成本，不制造额外业务含义。">
        <div className="divide-y divide-border rounded-xl border border-border">
          {[
            ["Rest", "静态渐变与连续光场同时存在，不额外缩放或投影。"],
            ["Hover", "只增加同色 4px / 16px 柔和阴影，几何与光场速度不变。"],
            ["Pressed", "缩放到 0.98，不改变布局占位。"],
            ["Focus visible", "显示与 tone 对应的 2px 焦点环，按钮名称来自可见内容。"],
            ["Reduced motion", "停止时间推进并绘制确定性静帧，文字和底色保持不变。"],
            ["WebGL unavailable", "不挂载 Canvas；原生 button 与静态三段渐变继续工作。"],
          ].map(([state, behavior]) => (
            <div key={state} className="grid gap-2 px-4 py-4 sm:grid-cols-[9rem_1fr]">
              <p className="font-mono text-micro text-foreground">{state}</p>
              <p className="text-xs leading-5 text-muted-foreground">{behavior}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Surface variant="subtle" padding="md"><p className="text-xs font-medium">生命周期约束</p><p className="mt-2 text-micro leading-4 text-muted-foreground">IntersectionObserver、visibilitychange 与 ResizeObserver 控制暂停、恢复和尺寸同步；卸载时释放 Geometry、Program 与 Texture。</p></Surface>
          <Surface variant="subtle" padding="md"><p className="text-xs font-medium">性能预算</p><p className="mt-2 text-micro leading-4 text-muted-foreground">参考尺寸每帧约 14,344 个 fragment × 6 次 march；Canvas 只在按钮可见且页面活跃时持续渲染。</p></Surface>
        </div>
      </DocSection>
      <DocSection id="prismatic-api" title="API">
        <PropTable rows={[
          { name: "tone", type: '"green" | "blue" | "violet" | "amber" | "rose" | "cyan"', defaultValue: '"green"', description: "切换受控静态渐变、六色光谱、hover 阴影与焦点环。" },
          { name: "type", type: '"button" | "submit" | "reset"', defaultValue: '"button"', description: "默认避免在表单内意外提交；需要提交时显式选择。" },
          { name: "disabled", type: "boolean", defaultValue: "false", description: "保留完整视觉和可读名称，同时使用原生禁用语义阻止操作。" },
          { name: "className", type: "string", defaultValue: "—", description: "允许覆盖布局宽度；内部光学尺寸和色板继续由 Token 维护。" },
          { name: "…button props", type: "ButtonHTMLAttributes", defaultValue: "—", description: "透传 aria、表单、事件和 data 属性。" },
        ]} />
      </DocSection>
    </>
  );
}

function InputDemo() {
  const [query, setQuery] = useState("设计系统");
  return <div className="w-full max-w-sm space-y-3"><Input aria-label="文章标题" defaultValue="克制如何成为高级感" /><SearchField aria-label="搜索组件" value={query} onChange={(event) => setQuery(event.target.value)} onClear={() => setQuery("")} placeholder="搜索组件…" /></div>;
}

function InputPage() {
  return (
    <>
      <PageIntro eyebrow="Components" title="Input" description="输入控件使用轻边框和清晰焦点环，让状态可见但不把表单做成视觉主角。" status="Ready" />
      <DocSection id="text-input" title="Text input" description="标签和错误属于 Field 模式；Input 本身只维护输入边界。">
        <Specimen title="Text input" description="默认、占位与禁用状态" code={'<Input aria-label="文章标题" placeholder="输入标题" />'}>
          <div className="w-full max-w-sm space-y-4">
            <label className="block space-y-1.5 text-xs font-medium">文章标题<Input defaultValue="克制如何成为高级感" /></label>
            <label className="block space-y-1.5 text-xs font-medium">副标题<Input placeholder="补充一句解释" /></label>
            <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">只读来源<Input disabled value="本地知识库" /></label>
          </div>
        </Specimen>
      </DocSection>
      <DocSection id="search-field" title="Search field" description="搜索图标、清除动作和焦点状态由共享原语统一提供。">
        <Specimen title="Search field" description="受控值与清除操作" code={'const [query, setQuery] = useState("")\n<SearchField value={query} onChange={…} onClear={() => setQuery("")} />'}><InputDemo /></Specimen>
      </DocSection>
      <DocSection id="input-states" title="States">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><p className="mb-2 text-micro font-medium text-muted-foreground">DEFAULT</p><Input placeholder="等待输入" /></div>
          <div><p className="mb-2 text-micro font-medium text-muted-foreground">INVALID</p><Input aria-invalid="true" defaultValue="无效内容" /></div>
          <div><p className="mb-2 text-micro font-medium text-muted-foreground">DISABLED</p><Input disabled value="不可编辑" /></div>
          <div><p className="mb-2 text-micro font-medium text-muted-foreground">MONO DATA</p><Input className="font-mono text-xs" value="DIO-0037" readOnly /></div>
        </div>
      </DocSection>
      <DocSection id="input-api" title="API">
        <PropTable rows={[
          { name: "type", type: "HTML input type", defaultValue: '"text"', description: "透传原生输入类型和浏览器能力。" },
          { name: "aria-invalid", type: "boolean | string", defaultValue: "false", description: "触发危险边框与 focus ring。" },
          { name: "disabled", type: "boolean", defaultValue: "false", description: "禁止交互并降低不透明度。" },
          { name: "onClear", type: "() => void", defaultValue: "—", description: "SearchField 在有值时显示清除动作。" },
        ]} />
      </DocSection>
    </>
  );
}

const homeViewOptions: CompactSelectOption[] = [
  { value: "linear-agent", label: "Linear Agent (default)" },
  { value: "inbox", label: "Inbox" },
  { value: "my-issues", label: "My issues" },
  { value: "all-issues", label: "All issues" },
  { value: "active-issues", label: "Active issues" },
  { value: "current-cycle", label: "Current cycle" },
  { value: "projects", label: "Projects" },
  { value: "initiatives", label: "Initiatives" },
];

const displayNameOptions: CompactSelectOption[] = [
  { value: "username", label: "Username" },
  { value: "full-name", label: "Full name" },
];

const weekStartOptions: CompactSelectOption[] = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "saturday", label: "Saturday" },
];

function CompactSelectDemo() {
  const [homeView, setHomeView] = useState("linear-agent");
  const [displayName, setDisplayName] = useState("username");
  const [weekStart, setWeekStart] = useState("sunday");

  return (
    <div className="w-full max-w-[40rem]">
      <p className="mb-4 px-4 text-sm font-medium">General</p>
      <Surface className="overflow-visible p-0" aria-label="通用设置紧凑选择示例">
        {[
          {
            title: "Default home view",
            description: "Select which view to display when launching Dionysus",
            control: <CompactSelect label="默认首页" value={homeView} onValueChange={setHomeView} options={homeViewOptions} />,
          },
          {
            title: "Display names",
            description: "Select how names are displayed in the interface",
            control: <CompactSelect label="名称显示方式" value={displayName} onValueChange={setDisplayName} options={displayNameOptions} />,
          },
          {
            title: "First day of the week",
            description: "Used for date pickers",
            control: <CompactSelect label="每周起始日" value={weekStart} onValueChange={setWeekStart} options={weekStartOptions} />,
          },
        ].map((item) => (
          <div key={item.title} className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-6 border-b border-border/70 px-4 py-3 last:border-b-0">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{item.title}</p>
              <p className="mt-0.5 truncate text-micro text-muted-foreground">{item.description}</p>
            </div>
            {item.control}
          </div>
        ))}
      </Surface>
    </div>
  );
}

const compactSelectCode = `const [homeView, setHomeView] = useState("linear-agent")

<CompactSelect
  label="Default home view"
  value={homeView}
  onValueChange={setHomeView}
  options={homeViewOptions}
/>`;

function CompactSelectPage() {
  return (
    <>
      <PageIntro
        eyebrow="Components"
        title="Compact Select"
        description="为设置行和高密度工具区设计的单选控件。菜单以当前选中项为锚点展开，让触发器与选项在空间上连续，而不是把用户的视线带到另一个位置。"
        status="New"
        meta={<span>Reference: Linear preferences · Source: <InlineCode>@dionysus/ui</InlineCode></span>}
      />
      <DocSection id="compact-select-specimen" title="Live specimen" description="32px 触发器与选项行、4px 菜单内边距、11px 浮层圆角；菜单宽度由内容和触发器共同决定，并在当前选项处展开。">
        <Specimen title="Selection-anchored select" description="打开任一设置；移动指针或使用方向键并选择新值" code={compactSelectCode} previewClassName="min-h-[32rem] items-start overflow-visible bg-app-shell/65 px-4 py-12 sm:p-12">
          <CompactSelectDemo />
        </Specimen>
      </DocSection>
      <DocSection id="compact-select-anatomy" title="Anatomy" description="视觉连续性来自选中行锚定，而不是额外的位移动效。">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {[
            ["01", "Persistent trigger", "常驻边框、值与 Chevron 明确表示这是可选择的表单控件；查看态不会伪装成纯文本。"],
            ["02", "Selection anchor", "浮层打开时，当前选项中心与触发器中心重合；菜单向上下自然展开并在视口边缘夹取。"],
            ["03", "Compact rows", "触发器和选项均为 32px；外层 4px inset 为高亮行保留轮廓，Check 独立表达选中。"],
            ["04", "Immediate choice", "点击选项即更新本地值并关闭；持久化、错误和撤销由所在设置模式明确承接。"],
          ].map(([index, title, copy]) => (
            <div key={title} className="bg-background p-4">
              <span className="font-mono text-micro text-muted-foreground">{index}</span>
              <p className="mt-7 text-xs font-medium">{title}</p>
              <p className="mt-1 text-micro leading-4 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="compact-select-comparison" title="Compact Select vs. Inline Edit" description="两者都在原页面完成单字段选择，但它们解决的是不同层级的问题。">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[46rem] border-collapse text-left text-xs">
            <thead className="bg-muted/45 text-muted-foreground"><tr><th className="px-3 py-2.5 font-medium">维度</th><th className="px-3 py-2.5 font-medium">Compact Select</th><th className="px-3 py-2.5 font-medium">Inline Edit / InlineEditSelect</th></tr></thead>
            <tbody>
              {[
                ["角色", "紧凑的单选表单原语", "原位编辑模式与提交外壳"],
                ["入口", "始终显示边框与 Chevron，编辑性持续可见", "当前值就是入口，默认弱化控件外观"],
                ["范围", "只处理稳定枚举的单选", "可装载选择、搜索、日期、文本、多选或创建"],
                ["提交", "只发出 onValueChange；不假设保存方式", "内建 optimistic → saving → saved/error → rollback"],
                ["浮层", "选中项覆盖触发器并围绕它展开", "Popover 贴在值的上方或下方，不覆盖触发器"],
                ["适用", "设置页、筛选栏、紧凑工具栏", "对象属性、表格单元格、详情页快速编辑"],
              ].map(([dimension, compact, inline]) => <tr key={dimension} className="border-t border-border align-top"><td className="px-3 py-3 font-medium">{dimension}</td><td className="px-3 py-3 leading-5 text-muted-foreground">{compact}</td><td className="px-3 py-3 leading-5 text-muted-foreground">{inline}</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="mt-4"><RuleNote>关系上，Compact Select 可以成为某个 Inline Edit editor 的视觉基础，但二者不能互相替代：前者是输入控件，后者还负责业务提交状态和失败恢复。</RuleNote></div>
      </DocSection>
      <DocSection id="compact-select-practice" title="Best practices" description="先判断语义，再决定是否采用这种紧凑外观。">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-medium text-success-foreground">Use when</p>
            <ul className="space-y-2 text-xs leading-5 text-muted-foreground">
              <li>设置值来自少量、稳定且互斥的选项</li><li>控件需要长期显示可编辑性，而不是只在 hover 时出现</li><li>选中后可以立即生效，或设置页有统一的保存状态</li><li>菜单内容短、没有分组、搜索、二级指令和多选</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium text-destructive">Choose another pattern</p>
            <ul className="space-y-2 text-xs leading-5 text-muted-foreground">
              <li>需要搜索、多选、成员头像或指令项：使用 DropdownMenu 或 Combobox</li><li>需要保存反馈、失败回滚或编辑多种字段：使用 Inline Edit</li><li>操作会删除、发布、付款或移交权限：进入确认流</li><li>移动端菜单会超出安全命中区：切换原生 Select 或 Bottom Sheet</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Keep labels stable", "选项 value 必须稳定唯一；label 可本地化，但不能充当业务 ID。"],
            ["Show persistence", "异步保存由设置行或页面呈现 saving/error；不要让失败看起来像已成功。"],
            ["Avoid menu creep", "一旦需要分组、搜索、说明或命令，就升级模式而不是继续压缩行高。"],
          ].map(([title, copy]) => <Surface key={title} variant="subtle" padding="md"><p className="text-xs font-medium">{title}</p><p className="mt-1 text-micro leading-4 text-muted-foreground">{copy}</p></Surface>)}
        </div>
      </DocSection>
      <DocSection id="compact-select-accessibility" title="Accessibility" description="视觉上覆盖触发器，语义上仍是 button + listbox。">
        <div className="space-y-3 text-xs leading-5 text-muted-foreground">
          <p><InlineCode>Enter / Space</InlineCode> 打开，<InlineCode>ArrowUp / ArrowDown</InlineCode> 移动，<InlineCode>Home / End</InlineCode> 跳转，<InlineCode>Escape</InlineCode> 关闭并恢复触发器焦点。</p>
          <p>选项使用 <InlineCode>role="option"</InlineCode> 与 <InlineCode>aria-selected</InlineCode>；Check 只是冗余视觉信号，不能替代可访问状态。</p>
          <p>字符键支持 500ms typeahead。系统开启 reduced motion 后，围绕当前选项的缩放淡入会退化为即时显示。</p>
        </div>
      </DocSection>
      <DocSection id="compact-select-api" title="API">
        <PropTable rows={[
          { name: "label", type: "string", defaultValue: "—", description: "触发器和 listbox 的可访问名称；必须描述所编辑字段，而不是当前值。" },
          { name: "options", type: "CompactSelectOption[]", defaultValue: "[]", description: "稳定单选项；支持 label、textValue、visual 和 disabled。" },
          { name: "value / defaultValue", type: "string", defaultValue: "首个可用项", description: "受控或非受控选择值。" },
          { name: "onValueChange", type: "(value, option) => void", defaultValue: "—", description: "选择后立即触发；持久化与失败反馈属于消费方。" },
          { name: "open / defaultOpen", type: "boolean", defaultValue: "false", description: "支持受控和非受控浮层状态。" },
          { name: "align", type: '"start" | "center" | "end"', defaultValue: '"center"', description: "菜单相对触发器的水平锚定；中心对齐最接近参考交互。" },
          { name: "triggerClassName / panelClassName", type: "string", defaultValue: "—", description: "只允许做布局宽度和消费场景适配；不要改变 32px 密度契约。" },
        ]} />
      </DocSection>
    </>
  );
}

function NoAssigneeMark() {
  return (
    <span className="relative flex size-8 items-center justify-center text-foreground">
      <span className="absolute inset-1 rounded-full border-2 border-dashed border-foreground/80" />
      <UserRoundX className="size-5 stroke-[2.35]" />
    </span>
  );
}

function SketchAvatar() {
  return (
    <span className="relative flex size-8 overflow-hidden rounded-full bg-background ring-1 ring-foreground/10">
      <span className="absolute inset-1 rounded-full border border-foreground/15" />
      <span className="absolute left-1 top-2 h-px w-7 rotate-12 bg-foreground/18" />
      <span className="absolute left-0.5 top-3 h-px w-8 -rotate-12 bg-foreground/16" />
      <span className="absolute left-2 top-4 h-px w-6 rotate-45 bg-foreground/18" />
      <span className="absolute left-1.5 top-5 h-px w-7 -rotate-45 bg-foreground/14" />
      <span className="absolute left-3 top-1 h-7 w-px rotate-12 bg-foreground/12" />
      <span className="absolute left-5 top-0.5 h-8 w-px -rotate-12 bg-foreground/10" />
    </span>
  );
}

const dropdownMenuCode = `const [assignees, setAssignees] = useState(["amelia-hart"])
const [inviteOpen, setInviteOpen] = useState(false)

const handleAssigneesChange = (values, item) => {
  setAssignees(item.value === "none" ? ["none"] : values.filter((value) => value !== "none"))
}

<DropdownMenu
  label="Assign issue"
  searchPlaceholder="Assign to..."
  searchShortcut="A"
  multiple
  selectedValues={assignees}
  onSelectedValuesChange={handleAssigneesChange}
  onCommandSelect={() => setInviteOpen(true)}
  groups={[
    { items: [{ value: "none", label: "No assignee", count: 0 }] },
    { label: "Project members", items: projectMembers },
    { label: "New user", items: [{ type: "command", value: "invite", label: "Invite and assign..." }] },
  ]}
/>`;

function AssigneeDropdownDemo() {
  const [assignees, setAssignees] = useState(["amelia-hart"]);
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteQuery, setInviteQuery] = useState("");
  const assigneeGroups: DropdownMenuGroup[] = [
    {
      items: [
        { value: "none", label: "No assignee", count: 0, visual: <NoAssigneeMark /> },
        { value: "amelia-hart", label: "Amelia Hart", count: 1, visual: <SketchAvatar /> },
      ],
    },
    {
      label: "Project members",
      items: [
        { value: "noah-chen", label: "Noah Chen", visual: { initials: "NC", tone: "blue" } },
        { value: "maya-lin", label: "Maya Lin", visual: { initials: "ML", tone: "neutral" } },
        { value: "ethan-brooks", label: "Ethan Brooks", visual: { initials: "EB", tone: "teal" } },
        { value: "sofia-park", label: "Sofia Park", visual: { initials: "SP", tone: "amber" } },
      ],
    },
    {
      label: "Team members",
      items: [
        { value: "leo-martin", label: "Leo Martin", visual: { initials: "LM", tone: "blue" } },
        { value: "nora-patel", label: "Nora Patel", visual: { initials: "NP", tone: "rose" } },
        { value: "clara-wilson", label: "Clara Wilson", visual: { initials: "CW", tone: "amber" } },
      ],
    },
    {
      label: "New user",
      items: [
        {
          type: "command",
          value: "invite",
          label: "Invite and assign...",
          visual: <Send className="-ml-0.5 size-7 -rotate-12 stroke-[2.35] text-muted-foreground" />,
          className: inviteOpen ? "bg-surface-selected font-medium" : undefined,
        },
      ],
    },
  ];
  const inviteGroups: DropdownMenuGroup[] = [
    {
      items: [
        { type: "command", value: "invite-email", label: inviteQuery.includes("@") ? inviteQuery : "name@company.com", visual: { icon: <MailPlus />, tone: "neutral" } },
        { value: "avery-reed", label: "Avery Reed", visual: { initials: "AR", tone: "violet" } },
      ],
    },
    {
      label: "Permission",
      items: [
        { value: "member", label: "Member", count: "default", visual: { initials: "M", tone: "blue" } },
        { value: "guest", label: "Guest", visual: { initials: "G", tone: "neutral" } },
      ],
    },
  ];

  return (
    <div className="relative flex min-h-[46rem] w-full max-w-[47rem] flex-col items-center lg:block">
      <DropdownMenu
        label="Assign issue"
        open
        position="static"
        searchPlaceholder="Assign to..."
        searchShortcut="A"
        searchValue={query}
        onSearchValueChange={setQuery}
        defaultActiveValue="none"
        multiple
        selectedValues={assignees}
        onSelectedValuesChange={(values, item) => {
          setAssignees(item.value === "none" ? ["none"] : values.filter((value) => value !== "none"));
        }}
        onCommandSelect={(item) => {
          if (item.value === "invite") setInviteOpen(true);
        }}
        groups={assigneeGroups}
        className="block w-full max-w-[25.75rem] shrink-0"
        panelClassName="w-full"
      />
      {inviteOpen ? (
        <div className="mt-3 w-full max-w-[20rem] lg:absolute lg:left-[26.75rem] lg:top-[31rem] lg:mt-0">
          <DropdownMenu
            label="Invite user"
            open
            position="static"
            searchPlaceholder="Invite user..."
            searchShortcut="I"
            searchValue={inviteQuery}
            onSearchValueChange={setInviteQuery}
            selectedValues={["member"]}
            groups={inviteGroups}
            className="block w-full"
            panelClassName="w-full rounded-[1.125rem]"
            listClassName="max-h-[18rem]"
          />
        </div>
      ) : null}
    </div>
  );
}

function DropdownMenuPage() {
  return (
    <>
      <PageIntro eyebrow="Components" title="DropdownMenu" description="一个 Linear 式的高密度浮层：顶部搜索像标题一样安静嵌入，列表支持分组、多选、右侧计数，以及可打开下一层弹窗的指令项。" status="New" meta={<span>Source: <InlineCode>@dionysus/ui</InlineCode></span>} />
      <DocSection id="assignee-menu" title="Assignee menu" description="复刻参考图的核心比例：412px 浮层宽度、76px 搜索头、64px 行高、32px 头像列、高亮行使用 Selected Surface。">
        <Specimen title="Linear-style dropdown" description="搜索、多选、分组与指令弹窗" code={dropdownMenuCode} previewClassName="min-h-[50rem] items-start overflow-hidden bg-app-shell/70 p-4 sm:p-10">
          <AssigneeDropdownDemo />
        </Specimen>
      </DocSection>
      <DocSection id="behavior" title="Behavior" description="组件维护浮层打开、搜索过滤、键盘移动和选择状态；业务层只接收选择值或指令回调。">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {[
            [<Check />, "Multi select", "选项使用 menuitemcheckbox；多选时点击不会关闭菜单。"],
            [<CornerDownRight />, "Command item", "指令项触发 onCommandSelect，可打开另一个 DropdownMenu 或 Dialog。"],
            [<Search />, "Search first", "打开后聚焦顶部搜索；ArrowDown 进入结果，Escape 返回触发器。"],
          ].map(([icon, title, copy]) => <div key={String(title)} className="bg-background p-4"><span className="text-muted-foreground [&>svg]:size-4">{icon as ReactNode}</span><p className="mt-6 text-xs font-medium">{title}</p><p className="mt-1 text-micro leading-4 text-muted-foreground">{copy}</p></div>)}
        </div>
        <RuleNote kind="safety">DropdownMenu 不连接网络、不保存业务状态、不理解成员权限；邀请、分配、权限升级等副作用必须由业务层显式处理。</RuleNote>
      </DocSection>
      <DocSection id="dropdown-api" title="API">
        <PropTable rows={[
          { name: "groups", type: "DropdownMenuGroup[]", defaultValue: "[]", description: "按组提供 option 或 command 项；组件只读取展示描述。" },
          { name: "multiple", type: "boolean", defaultValue: "false", description: "开启多选，选项使用 menuitemcheckbox 语义并保持浮层打开。" },
          { name: "selectedValues", type: "string[]", defaultValue: "—", description: "受控选择值；未提供时可用 defaultSelectedValues 或 item.selected 初始化。" },
          { name: "onSelectedValuesChange", type: "(values, item) => void", defaultValue: "—", description: "选项切换时触发，由业务层持久化。" },
          { name: "onCommandSelect", type: "(item) => void", defaultValue: "—", description: "点击 command 项时触发，可打开二级弹窗或确认流。" },
          { name: "clearSearchOnClose", type: "boolean", defaultValue: "true", description: "只清理非受控搜索值；受控搜索由业务在 onOpenChange 中决定是否重置。" },
          { name: "trigger", type: "(props) => ReactNode", defaultValue: "—", description: "渲染触发器并接收 aria、ref、click 与键盘属性。" },
        ]} />
      </DocSection>
    </>
  );
}

const statusOptions: InlineEditOption[] = [
  { value: "backlog", label: "待整理", visual: <Circle className="size-3.5 text-muted-foreground" /> },
  { value: "planned", label: "已计划", visual: <Circle className="size-3.5 fill-muted text-muted-foreground" /> },
  { value: "in-progress", label: "进行中", visual: <LoaderCircle className="size-3.5 text-warning-foreground" /> },
  { value: "completed", label: "已完成", visual: <CircleCheck className="size-3.5 text-success-foreground" /> },
  { value: "canceled", label: "已取消", visual: <Circle className="size-3.5 text-destructive/70" /> },
];

const priorityOptions: InlineEditOption[] = [
  { value: "none", label: "无优先级", visual: <span className="h-px w-3 bg-muted-foreground/55" /> },
  { value: "low", label: "低", visual: <Flag className="size-3.5 text-muted-foreground" /> },
  { value: "medium", label: "中", visual: <Flag className="size-3.5 text-info-foreground" /> },
  { value: "high", label: "高", visual: <Flag className="size-3.5 text-warning-foreground" /> },
  { value: "urgent", label: "紧急", visual: <Flag className="size-3.5 fill-destructive/15 text-destructive" /> },
];

const assigneeOptions: InlineEditOption[] = [
  { value: "lin-yanqiu", label: "林砚秋", description: "产品设计", visual: <Avatar name="林砚秋" tone="blue" /> , keywords: ["lin", "design"] },
  { value: "zhou-qiran", label: "周其然", description: "前端工程", visual: <Avatar name="周其然" tone="teal" />, keywords: ["zhou", "frontend"] },
  { value: "song-jianing", label: "宋嘉宁", description: "内容策略", visual: <Avatar name="宋嘉宁" tone="amber" />, keywords: ["song", "content"] },
  { value: "none", label: "未分配", visual: <UserRound className="size-3.5 text-muted-foreground" /> },
];

const labelOptions: InlineEditOption[] = [
  { value: "research", label: "研究", visual: <span className="size-2.5 rounded-full bg-info" /> },
  { value: "interaction", label: "交互", visual: <span className="size-2.5 rounded-full bg-success" /> },
  { value: "review", label: "待评审", visual: <span className="size-2.5 rounded-full bg-warning" /> },
];

function firstSelectedValue(selected: InlineEditOption[], fallback: ReactNode) {
  const option = selected[0];
  if (!option) return <span className="text-muted-foreground">{fallback}</span>;
  return <span className="inline-flex min-w-0 items-center gap-1.5">{option.visual}<span className="truncate">{option.label}</span></span>;
}

function formatDate(value: string) {
  if (!value) return "未设置";
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", weekday: "short" }).format(new Date(`${value}T00:00:00`));
}

function offsetDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function InlineEditDemo() {
  const [status, setStatus] = useState<InlineEditSelectValue>("in-progress");
  const [priority, setPriority] = useState<InlineEditSelectValue>("high");
  const [assignee, setAssignee] = useState<InlineEditSelectValue>("lin-yanqiu");
  const [labels, setLabels] = useState<InlineEditSelectValue>(["research", "interaction"]);
  const [dueDate, setDueDate] = useState(offsetDate(6));

  return (
    <Surface className="w-full max-w-[34rem] overflow-visible" aria-label="项目属性即时编辑示例">
      <div className="flex items-start justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-medium tracking-tight">研究计划 · Q3</p>
          <p className="mt-1 text-micro text-muted-foreground">直接点击右侧属性值进行修改</p>
        </div>
        <Badge variant="outline" size="xs">实时示例</Badge>
      </div>
      <div className="divide-y divide-border/70 px-3 py-1">
        <div className="grid min-h-11 grid-cols-[6.5rem_minmax(0,1fr)] items-center px-2">
          <span className="text-xs text-muted-foreground">状态</span>
          <InlineEditSelect label="状态" value={status} onValueChange={setStatus} options={statusOptions} renderValue={(selected) => firstSelectedValue(selected, "未设置")} />
        </div>
        <div className="grid min-h-11 grid-cols-[6.5rem_minmax(0,1fr)] items-center px-2">
          <span className="text-xs text-muted-foreground">优先级</span>
          <InlineEditSelect label="优先级" value={priority} onValueChange={setPriority} options={priorityOptions} renderValue={(selected) => firstSelectedValue(selected, "无优先级")} />
        </div>
        <div className="grid min-h-11 grid-cols-[6.5rem_minmax(0,1fr)] items-center px-2">
          <span className="text-xs text-muted-foreground">负责人</span>
          <InlineEditSelect label="负责人" value={assignee} onValueChange={setAssignee} options={assigneeOptions} searchable searchPlaceholder="搜索成员…" renderValue={(selected) => firstSelectedValue(selected, "未分配")} />
        </div>
        <div className="grid min-h-11 grid-cols-[6.5rem_minmax(0,1fr)] items-center px-2">
          <span className="text-xs text-muted-foreground">截止日期</span>
          <InlineEdit<string>
            label="截止日期"
            value={dueDate}
            onValueChange={setDueDate}
            renderValue={(currentValue) => <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-muted-foreground" />{formatDate(currentValue)}</span>}
            panelClassName="w-64"
            editor={({ value: currentValue, commit }) => (
              <div className="p-2">
                <label className="block px-1 pb-2 text-micro font-medium uppercase tracking-[0.1em] text-muted-foreground" htmlFor="inline-edit-date">截止日期</label>
                <Input id="inline-edit-date" autoFocus type="date" value={currentValue} onChange={(event) => void commit(event.target.value)} />
                <div className="mt-2 grid grid-cols-3 gap-1 border-t border-border pt-2">
                  {[{ label: "今天", days: 0 }, { label: "明天", days: 1 }, { label: "下周", days: 7 }].map((preset) => (
                    <Button key={preset.label} size="xs" variant="ghost" onClick={() => void commit(offsetDate(preset.days))}>{preset.label}</Button>
                  ))}
                </div>
              </div>
            )}
          />
        </div>
        <div className="grid min-h-11 grid-cols-[6.5rem_minmax(0,1fr)] items-center px-2">
          <span className="text-xs text-muted-foreground">标签</span>
          <InlineEditSelect
            label="标签"
            value={labels}
            onValueChange={setLabels}
            options={labelOptions}
            multiple
            searchable
            searchPlaceholder="搜索或创建标签…"
            createOption={(query) => ({ value: `custom-${query.toLocaleLowerCase("zh-CN").replace(/\s+/gu, "-")}`, label: query, visual: <span className="size-2.5 rounded-full bg-muted-foreground" /> })}
            renderValue={(selected) => selected.length === 0 ? <span className="text-muted-foreground">添加标签</span> : (
              <span className="inline-flex min-w-0 items-center gap-1.5"><Tags className="size-3.5 text-muted-foreground" /><span className="truncate">{selected.map((option) => option.label).join(" · ")}</span></span>
            )}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border bg-muted/20 px-5 py-3 text-micro text-muted-foreground">
        <CheckCircle2 className="size-3.5 text-success-foreground" />选中即提交；页面上下文和布局保持不变
      </div>
    </Surface>
  );
}

const inlineEditCode = `const [status, setStatus] = useState("in-progress")

<InlineEditSelect
  label="状态"
  value={status}
  onValueChange={setStatus}
  onCommit={(nextValue, previousValue) => saveStatus(nextValue, previousValue)}
  options={statusOptions}
  renderValue={(selected) => <StatusValue option={selected[0]} />}
/>

// 日期等特殊类型复用同一个锚定编辑外壳
<InlineEdit
  label="截止日期"
  value={dueDate}
  onValueChange={setDueDate}
  renderValue={(value) => formatDate(value)}
  editor={({ value, commit }) => (
    <Input type="date" value={value} onChange={(event) => commit(event.target.value)} />
  )}
/>`;

function InlineEditPage() {
  return (
    <>
      <PageIntro eyebrow="Components" title="Inline Edit" description="基于锚定浮层的原位属性编辑。当前值就是编辑入口；组件在不打断页面上下文的前提下完成选择、即时提交、保存反馈和失败回滚。" status="New" meta={<span>Source: <InlineCode>@dionysus/ui</InlineCode></span>} />
      <DocSection id="inline-edit-specimen" title="Live specimen" description="状态、优先级、成员、日期和标签共享相同的空间与提交模型，但使用与字段类型匹配的编辑器。">
        <Specimen title="Property quick edit" description="点击任意属性值；尝试键盘、搜索、多选和创建标签" code={inlineEditCode} previewClassName="min-h-[32rem] overflow-visible bg-app-shell/65 px-4 py-12 sm:p-12">
          <InlineEditDemo />
        </Specimen>
      </DocSection>
      <DocSection id="inline-edit-anatomy" title="Anatomy" description="Inline Edit 是模式组件，不是某一种下拉菜单。它把四项稳定职责留在设计系统内。">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {[
            ["01", "Value trigger", "查看态即入口；hover、focus 和打开态只逐级增强，不制造独立编辑按钮。"],
            ["02", "Anchored popover", "浮层贴近字段，自动翻转并避让视口边缘；不推动页面布局。"],
            ["03", "Typed editor", "枚举使用 Select，成员使用可搜索 Combobox，日期与特殊数据通过 editor 插槽接入。"],
            ["04", "Commit feedback", "选择后乐观更新；保存中、成功与错误都附着在原字段，失败自动恢复旧值。"],
          ].map(([index, title, copy]) => (
            <div key={title} className="bg-background p-4">
              <span className="font-mono text-micro text-muted-foreground">{index}</span>
              <p className="mt-7 text-xs font-medium">{title}</p>
              <p className="mt-1 text-micro leading-4 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="inline-edit-fields" title="Field types" description="选择正确的编辑器比统一外观更重要；只共享外壳、反馈和行为，不强迫所有字段长成一种控件。">
        <div className="overflow-hidden rounded-xl border border-border text-xs">
          {[
            ["状态 / 优先级", "InlineEditSelect", "少量稳定枚举；单选后立即关闭。"],
            ["负责人 / 关联对象", "Searchable select", "选项较多或需要按名称、关键词定位。"],
            ["标签 / 分类", "Multi-select + create", "保持浮层打开，允许连续选择；创建只在查询无精确匹配时出现。"],
            ["日期 / 时间", "InlineEdit + date editor", "复用锚定外壳，编辑区使用日期选择器或明确的快捷值。"],
            ["自由文本", "InlineEdit + Input", "短文本可原位编辑；长文本、富文本与多字段内容改用面板。"],
          ].map(([field, editor, guidance]) => (
            <div key={field} className="grid gap-1 border-b border-border px-3 py-3 last:border-b-0 sm:grid-cols-[9rem_10rem_minmax(0,1fr)] sm:gap-3">
              <span className="font-medium">{field}</span><code className="font-mono text-micro text-info-foreground">{editor}</code><span className="text-muted-foreground">{guidance}</span>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="inline-edit-commit" title="Commit model" description="即时不等于不可靠。视觉反馈可以先发生，持久化结果仍必须被组件接住。">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          {[
            ["1", "Optimistic", "本地立即呈现新值"],
            ["2", "Persist", "onCommit 写入事实源"],
            ["3", "Resolve", "成功确认；失败回滚"],
          ].map(([index, title, copy], itemIndex) => (
            <div key={title} className="contents">
              <Surface variant="subtle" padding="md"><span className="font-mono text-micro text-muted-foreground">{index}</span><p className="mt-4 text-xs font-medium">{title}</p><p className="mt-1 text-micro text-muted-foreground">{copy}</p></Surface>
              {itemIndex < 2 ? <ArrowRight className="hidden size-4 text-muted-foreground sm:block" /> : null}
            </div>
          ))}
        </div>
        <div className="mt-4"><RuleNote kind="safety">只有低风险、单字段、可逆变更默认使用“选中即提交”。删除、发布、付款、权限移交，以及需要同时校验多个字段的操作必须进入明确的确认流或完整表单。</RuleNote></div>
      </DocSection>
      <DocSection id="inline-edit-principles" title="Usage principles" description="是否采用 Inline Edit，先判断任务结构，再判断视觉空间。">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-medium text-success-foreground">Use when</p>
            <ul className="space-y-2 text-xs leading-5 text-muted-foreground">
              <li>单次只修改一个彼此独立的属性</li><li>操作高频、结果容易理解并可撤销</li><li>选项数量较少，或能够通过搜索快速定位</li><li>保留当前对象和相邻信息能帮助用户判断</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium text-destructive">Avoid when</p>
            <ul className="space-y-2 text-xs leading-5 text-muted-foreground">
              <li>字段之间存在复杂联动、解释或校验</li><li>操作不可逆、高风险或需要预览影响</li><li>内容较长，需要比较、编排或多步骤决策</li><li>移动端浮层无法提供可靠命中区；此时转为 Bottom Sheet</li>
            </ul>
          </div>
        </div>
      </DocSection>
      <DocSection id="inline-edit-accessibility" title="Accessibility" description="组件维护浮层的通用焦点路径；具体 editor 仍需提供与字段类型匹配的语义。">
        <div className="space-y-3 text-xs leading-5 text-muted-foreground">
          <p><InlineCode>Enter / Space</InlineCode> 打开；<InlineCode>ArrowDown</InlineCode> 从触发器进入；<InlineCode>Escape</InlineCode> 关闭并把焦点还给字段。</p>
          <p>选择器使用 <InlineCode>combobox + listbox + option</InlineCode>；通用编辑器使用非模态 <InlineCode>dialog</InlineCode>。不要把所有值选择都实现成 action menu。</p>
          <p>保存中、成功与失败通过 <InlineCode>aria-live</InlineCode> 宣告；错误不能只依赖颜色。系统开启 reduced motion 后，浮层过渡自动降为即时变化。</p>
        </div>
      </DocSection>
      <DocSection id="inline-edit-api" title="API">
        <PropTable rows={[
          { name: "value / defaultValue", type: "T", defaultValue: "—", description: "受控或非受控字段值；两者至少提供一个。" },
          { name: "renderValue", type: "(value, state) => ReactNode", defaultValue: "—", description: "渲染查看态；当前值本身始终是编辑入口。" },
          { name: "editor", type: "(context) => ReactNode", defaultValue: "—", description: "自定义字段编辑器；context 提供 value、commit、close、state 和 error。" },
          { name: "onValueChange", type: "(value) => void", defaultValue: "—", description: "乐观值变化时立即触发；失败时组件用旧值再次调用以回滚受控状态。" },
          { name: "onCommit", type: "(next, previous) => Promise<void>", defaultValue: "—", description: "业务持久化边界；reject 会进入错误态并恢复 previousValue。" },
          { name: "closeOnCommit", type: '"start" | "success" | "never"', defaultValue: '"start"', description: "单选默认即时关闭；多选封装固定保持打开。" },
          { name: "options", type: "InlineEditOption[]", defaultValue: "[]", description: "InlineEditSelect 的稳定选项描述，支持 visual、description、keywords 和 disabled。" },
          { name: "searchable / multiple", type: "boolean", defaultValue: "false", description: "按字段数据规模与选择基数开启搜索或多选。" },
          { name: "createOption", type: "(query) => option | Promise<option>", defaultValue: "—", description: "查询没有精确匹配时允许创建；副作用和权限仍由业务层负责。" },
        ]} />
      </DocSection>
    </>
  );
}

function FloatingPanelPage() {
  return (
    <>
      <PageIntro
        eyebrow="Components"
        title="Floating side panel"
        description="在桌面工作区里持续呈现上下文，又不制造一条生硬的纵向分割线。面板通过真实布局让位进入，以 inset、圆角卡片和轻阴影表达可收起的第二层信息。"
        status="New"
        meta={<><Metric value="320px" label="Default card width" /><Metric value="8px" label="Rail inset" /><Metric value="100–180ms" label="Visible transition" /><Metric value="AA" label="Focus target" /></>}
      />
      <DocSection id="floating-panel-specimen" title="Live specimen" description="点击右上角按钮审阅打开/关闭、主内容重排和按钮双态；快速连续点击可直接反向。">
        <Specimen
          title="Inset contextual rail"
          description="主内容让位，卡片保持固有宽度，不在过渡中挤压文字"
          previewClassName="p-0"
          code={'const [open, setOpen] = useState(true)\n\n<header>\n  <SidePanelToggle open={open} aria-controls="writing-plan"\n    onClick={() => setOpen(value => !value)}>\n    <PanelRight />\n  </SidePanelToggle>\n</header>\n\n<div className="flex min-h-0">\n  <main className="min-w-0 flex-1">…</main>\n  <FloatingSidePanel id="writing-plan" open={open}>\n    <FloatingSidePanelCard>…</FloatingSidePanelCard>\n  </FloatingSidePanel>\n</div>'}
        >
          <FloatingPanelSpecimen />
        </Specimen>
        <RuleNote>该模式来自三段参考录屏的共同结构：触发器留在稳定工具栏内，下面的内容区形成 <InlineCode>main + aside</InlineCode> 布局；面板不是覆盖主内容的 Drawer，也不是靠一条全高边线切割页面。</RuleNote>
      </DocSection>
      <DocSection id="floating-panel-anatomy" title="Anatomy" description="Rail 管布局与间距，Card 管表面，Toggle 管状态。三者不能由业务页面重复拼装。">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["A", "Stable trigger", "工具栏中的 28–32px 图标按钮"],
            ["B", "Animated track", "0 → card width + 2 × inset"],
            ["C", "Inset rail", "四周 8px；多卡片间距 8px"],
            ["D", "Floating card", "12px 圆角 + 弱 ring + tinted shadow"],
          ].map(([mark, title, copy]) => (
            <div className="bg-background p-4" key={mark}>
              <span className="font-mono text-micro text-muted-foreground">{mark}</span>
              <p className="mt-4 text-xs font-medium">{title}</p>
              <p className="mt-1 text-micro leading-4 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 divide-y divide-border border-y border-border">
          {[
            ["边界", "优先依赖 8px inset、圆角和低对比阴影；ring 只负责抗锯齿与暗色模式边缘，不承担硬分栏。"],
            ["宽度", "默认卡片宽 320px；检查器可取 320–400px。宽度由任务密度决定，不随内容瞬间跳变。"],
            ["卡片栈", "同一上下文可以拆成多张内容高度卡片；滚动归 Rail 所有，卡片之间保持 8px，不嵌套多层阴影。"],
            ["Header", "全局或页面工具栏跨越整个工作区并保持稳定；面板只参与工具栏下方的内容布局。"],
          ].map(([title, copy]) => (
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]" key={title}>
              <p className="text-xs font-medium">{title}</p>
              <p className="text-xs leading-5 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="floating-panel-motion" title="Motion" description="录屏中的感知变化短而克制：先建立空间，再让内容稳定落位。">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Track", "0 → 336px", "spring 700 / 48 / 0.62"],
            ["Card x", "26 → 0px", "spring 760 / 50 / 0.62"],
            ["Opacity", "0 → 1", "140ms in / 90ms out"],
            ["Observed", "100–180ms", "无缩放、无旋转、无明显回弹"],
          ].map(([title, value, copy]) => (
            <div className="bg-background p-4" key={title}>
              <p className="text-micro uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
              <p className="mt-3 font-mono text-xs font-medium">{value}</p>
              <p className="mt-2 text-micro leading-4 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3 text-xs leading-5 text-muted-foreground">
          <p><strong className="font-medium text-foreground">打开：</strong>Aside 宽度和卡片 x 同时开始；固定宽度的卡片从右侧被逐步揭示，因此文字不会在每一帧重新换行。</p>
          <p><strong className="font-medium text-foreground">关闭：</strong>交互立即失效并退出无障碍树，视觉用更快的 90ms 淡出配合宽度回收；主内容从当前宽度连续取回空间。</p>
          <p><strong className="font-medium text-foreground">中断：</strong>spring 从当前速度反向，不排队、不等待前一次完成。Reduced motion 下宽度、位移和透明度都立即到达终态。</p>
        </div>
      </DocSection>
      <DocSection id="floating-panel-behavior" title="Behavior" description="是否使用 Floating panel，取决于内容是否需要与主任务同时可见。">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-medium text-success-foreground">Use when</p>
            <ul className="space-y-2 text-xs leading-5 text-muted-foreground">
              <li>属性、写作计划、来源或活动需要与主内容并行对照</li>
              <li>用户会反复开关，但不希望离开当前页面或失去滚动位置</li>
              <li>桌面宽度足以让主内容保留其最小可用宽度</li>
              <li>面板内容有自己的分组与滚动，却不需要模态焦点</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium text-destructive">Avoid when</p>
            <ul className="space-y-2 text-xs leading-5 text-muted-foreground">
              <li>用户必须先处理面板才能继续；此时使用 Dialog</li>
              <li>面板是一级导航或完整页面，不是当前对象的辅助上下文</li>
              <li>可用宽度会把主内容压到不可读；小屏切换为 Drawer / Bottom Sheet</li>
              <li>只是显示一句 Tooltip 或少量选项；此时使用 Popover / Menu</li>
            </ul>
          </div>
        </div>
        <RuleNote kind="safety">Floating panel 是非模态布局区，不添加遮罩、不锁定页面滚动、不自动抢焦点。不可逆操作仍需独立确认流。</RuleNote>
      </DocSection>
      <DocSection id="floating-panel-accessibility" title="Accessibility" description="视觉上的浮动感不能削弱结构语义与键盘可达性。">
        <div className="space-y-3 text-xs leading-5 text-muted-foreground">
          <p>触发器必须提供 <InlineCode>aria-controls</InlineCode>、动态 <InlineCode>aria-expanded</InlineCode>、可见 focus ring 和随状态变化的操作名称；打开态同时通过 Selected Surface 表达，不只依赖图标变化。</p>
          <p>关闭后 Aside 立即获得 <InlineCode>aria-hidden</InlineCode> 与 <InlineCode>inert</InlineCode>，避免零宽内容仍进入 Tab 顺序。通过快捷键关闭且焦点原本在面板内时，业务层应把焦点还给触发器。</p>
          <p>面板本身使用 <InlineCode>aside</InlineCode> 和可理解的 <InlineCode>aria-label</InlineCode>；卡片内继续使用真实 heading、section、list 与 form，不把所有内容做成无语义的可点击行。</p>
        </div>
      </DocSection>
      <DocSection id="floating-panel-api" title="API">
        <PropTable rows={[
          { name: "open", type: "boolean", defaultValue: "—", description: "受控终态；同时驱动 Aside 宽度、卡片位移、透明度和 inert 状态。" },
          { name: "width", type: "number", defaultValue: "320", description: "卡片内容宽度（px）；动画轨道还会加上两侧 inset。" },
          { name: "inset", type: "number", defaultValue: "8", description: "Rail 四周间距（px）；同一数值用于浮动关系，不由业务页额外补 margin。" },
          { name: "railClassName", type: "string", defaultValue: "—", description: "只调整 Rail 的滚动与布局；禁止覆盖运动几何。" },
          { name: "FloatingSidePanelCard", type: "HTMLAttributes<HTMLDivElement>", defaultValue: "—", description: "允许一张或多张卡片；统一圆角、语义表面、弱 ring 与面板阴影。" },
          { name: "SidePanelToggle.open", type: "boolean", defaultValue: "—", description: "关闭态为 Ghost，打开态为 Selected；自动设置 aria-expanded、title 与动态名称。" },
        ]} />
      </DocSection>
    </>
  );
}

function SurfacePage() {
  return (
    <>
      <PageIntro eyebrow="Components" title="Surface" description="Surface 表达内容边界与 elevation。只有当分组或前后关系真实存在时，才使用容器。" status="Ready" />
      <DocSection id="surface-variants" title="Variants" description="Card 不是默认布局工具；Flat 和间距往往已经足够。">
        <Specimen title="Surface variants" description="常驻、抬升、低层级、选择和无边界" code={'<Surface variant="card" />\n<Surface variant="raised" />\n<Surface variant="subtle" />\n<Surface variant="selected" />'} previewClassName="items-stretch">
          <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
            <Surface padding="md"><p className="text-xs font-medium">Card</p><p className="mt-1 text-micro text-muted-foreground">常驻信息组</p></Surface>
            <Surface variant="raised" padding="md"><p className="text-xs font-medium">Raised</p><p className="mt-1 text-micro text-muted-foreground">临时浮层</p></Surface>
            <Surface variant="subtle" padding="md"><p className="text-xs font-medium">Subtle</p><p className="mt-1 text-micro text-muted-foreground">低层级分区</p></Surface>
            <Surface variant="selected" padding="md"><p className="text-xs font-medium">Selected</p><p className="mt-1 text-micro text-muted-foreground">持续选择态</p></Surface>
          </div>
        </Specimen>
      </DocSection>
      <DocSection id="elevation" title="Elevation" description="阴影必须与表面用途对应，不能在 hover 时突然改变重量。">
        <div className="grid gap-5 rounded-xl bg-app-shell p-6 sm:grid-cols-3">
          <div><div className="h-24 rounded-xl bg-page-canvas ring-1 ring-surface-border" /><p className="mt-3 text-xs font-medium">Canvas</p><p className="mt-1 text-micro text-muted-foreground">Ring only</p></div>
          <div><Surface className="h-24" /><p className="mt-3 text-xs font-medium">Surface</p><p className="mt-1 text-micro text-muted-foreground">1–2px shadow</p></div>
          <div><Surface variant="raised" className="h-24" /><p className="mt-3 text-xs font-medium">Raised</p><p className="mt-1 text-micro text-muted-foreground">18–48px shadow</p></div>
        </div>
      </DocSection>
      <DocSection id="containment" title="Containment" description="选择容器前按这个顺序检查。">
        <div className="flex flex-wrap items-center gap-2 text-xs"><Badge variant="secondary">间距</Badge><ChevronRight className="size-3 text-muted-foreground" /><Badge variant="secondary">Divider</Badge><ChevronRight className="size-3 text-muted-foreground" /><Badge variant="secondary">背景变化</Badge><ChevronRight className="size-3 text-muted-foreground" /><Badge variant="outline">Surface</Badge></div>
        <RuleNote><strong className="font-medium">如果移除 Card 后信息关系没有变化，就不需要 Card。</strong> 页面结构优先使用分区、对齐和留白。</RuleNote>
      </DocSection>
    </>
  );
}

function FeedbackPage() {
  return (
    <>
      <PageIntro eyebrow="Components" title="Feedback" description="反馈告诉用户系统发生了什么、是否需要行动，以及下一步在哪里。颜色从属于这三个问题。" status="Ready" />
      <DocSection id="badges" title="Badges" description="Badge 只表示状态、类别和紧凑元数据，不承担按钮功能。">
        <Specimen title="Semantic badges" description="中性与五类状态语义" code={'<Badge variant="success">已保存</Badge>\n<Badge variant="warning">待复核</Badge>'}>
          <div className="flex flex-wrap justify-center gap-2"><Badge>Default</Badge><Badge variant="secondary">分类</Badge><Badge variant="info">待发布</Badge><Badge variant="success">已保存</Badge><Badge variant="warning">待复核</Badge><Badge variant="destructive">失败</Badge><Badge variant="outline">v0.1</Badge></div>
        </Specimen>
      </DocSection>
      <DocSection id="page-states" title="Page states" description="Loading、Empty、No results、Permission 和 Error 必须分别表达。">
        <div className="divide-y divide-border rounded-xl border border-border">
          {[
            [<LoaderCircle className="animate-spin" />, "正在读取知识库", "系统正在执行，保留当前上下文。"],
            [<FileText />, "还没有文章", "解释首个可执行动作，而不是只显示空白。"],
            [<Search />, "没有匹配结果", "保留查询并提供清除筛选的路径。"],
            [<AlertTriangle className="text-destructive" />, "保存失败", "说明原因、保留内容并提供安全重试。"],
          ].map(([icon, title, copy]) => (
            <div key={String(title)} className="flex items-center gap-3 px-4 py-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&>svg]:size-3.5">{icon as ReactNode}</span>
              <span className="min-w-0"><span className="block text-xs font-medium">{title}</span><span className="mt-1 block text-micro leading-4 text-muted-foreground">{copy}</span></span>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="async" title="Async feedback" description="进行中反馈必须来自真实请求，不伪造进度。">
        <div className="grid gap-3 sm:grid-cols-3">
          <Surface variant="subtle" padding="md"><LoaderCircle className="size-4 animate-spin text-warning-foreground" /><p className="mt-5 text-xs font-medium">进行中</p><p className="mt-1 text-micro text-muted-foreground">局部状态保持上下文稳定</p></Surface>
          <Surface variant="subtle" padding="md"><CheckCircle2 className="size-4 text-success-foreground" /><p className="mt-5 text-xs font-medium">已完成</p><p className="mt-1 text-micro text-muted-foreground">结果可见，不使用庆祝动画</p></Surface>
          <Surface variant="subtle" padding="md"><AlertTriangle className="size-4 text-destructive" /><p className="mt-5 text-xs font-medium">失败</p><p className="mt-1 text-micro text-muted-foreground">保留原内容，不扩大权限</p></Surface>
        </div>
      </DocSection>
    </>
  );
}

function AppShellPage() {
  return (
    <>
      <PageIntro eyebrow="Patterns" title="App shell" description="全局导航占据稳定左栏，当前任务位于略微抬升的 inset canvas。应用框架安静，工作内容成为视觉中心。" status="Stable" />
      <DocSection id="anatomy" title="Anatomy" description="App Shell 只负责全局定位和主工作面，不承载业务数据。">
        <MiniAppShell />
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {[["A", "Navigation", "256 / 56px"], ["B", "Top strip", "48px"], ["C", "Inset", "8px"], ["D", "Canvas", "12px radius"]].map(([mark, label, meta]) => <div key={mark} className="bg-background p-4"><span className="font-mono text-micro text-muted-foreground">{mark}</span><p className="mt-4 text-xs font-medium">{label}</p><p className="mt-1 font-mono text-micro text-muted-foreground">{meta}</p></div>)}
        </div>
      </DocSection>
      <DocSection id="sidebar-motion" title="Sidebar motion" description="从参考交互提取的可中断折叠模式；点击本页或全局侧栏顶部按钮可直接审阅。">
        <SidebarMotionSpecimen />
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Width", "256 → 56px", "主体宽度 spring：820 / 49 / 0.72"],
            ["Toggle", "x 234 → 28px", "收 1500 / 63；展 850 / 49；mass 0.65"],
            ["Settle", "180–220ms", "临界阻尼附近，不回弹、不缩放"],
            ["Brand", "120ms out", "160ms in + 60ms delay，向左 8px"],
          ].map(([title, value, copy]) => (
            <div className="bg-background p-4" key={title}>
              <p className="text-micro uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
              <p className="mt-3 font-mono text-xs font-medium">{value}</p>
              <p className="mt-2 text-micro leading-4 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 divide-y divide-border border-y border-border">
          {[
            ["按钮轨迹", "展开态距右侧 8px；折叠态位于 56px rail 的水平中心。只改变 x，不改变 y、尺寸或旋转。"],
            ["文字与 Badge", "状态切换时立即进入或退出视觉布局；侧栏 overflow 裁切展开内容，不对文字做缩放。"],
            ["导航图标", "折叠时立即在当前侧栏宽度内居中，展开时立即回到左侧锚点；图标纵向节奏和 16px 尺寸保持不变。"],
            ["画布与中断", "Canvas 由 Flex 随宽度重排；Motion spring 保留当前速度，因此连续点击会自然反向而不是重启动画。"],
            ["Reduced motion", "系统偏好 reduce 时宽度、按钮和品牌反馈都即时到达终态；aria-expanded、title 与 focus ring 始终保留。"],
          ].map(([title, copy]) => (
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]" key={title}>
              <p className="text-xs font-medium">{title}</p>
              <p className="text-xs leading-5 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="shell-behavior" title="Behavior">
        <div className="divide-y divide-border border-y border-border">
          {[
            ["Expand / collapse", "侧栏从 256px 收缩到 56px；按钮移至 rail 中心，图标纵向位置保持稳定。"],
            ["Scroll ownership", "页面内容在 Canvas 内滚动，侧栏和顶栏保持位置。"],
            ["Selection", "当前页面使用 Selected Surface，不用品牌色大面积填充。"],
            ["Responsive", "小于 1024px 后导航成为 Drawer，Canvas 逐步取消外侧装饰。"],
          ].map(([title, copy]) => <div key={title} className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]"><p className="text-xs font-medium">{title}</p><p className="text-xs leading-5 text-muted-foreground">{copy}</p></div>)}
        </div>
      </DocSection>
      <DocSection id="shell-rules" title="Rules">
        <RuleNote>侧栏用于稳定一级导航，不应把所有页面操作都塞入左侧。页面级筛选和主动作属于 Canvas 内的 PageToolbar。</RuleNote>
        <RuleNote kind="safety">Web 不输出 Electron 的窗口拖拽样式；Desktop 通过平台适配层启用。共享 App Shell 不直接读取 <InlineCode>WebkitAppRegion</InlineCode>。</RuleNote>
      </DocSection>
    </>
  );
}

function WorkspacePage() {
  return (
    <>
      <PageIntro eyebrow="Patterns" title="Content workspace" description="素材提供上下文，中央画布承载主要判断，Agent 对话负责辅助修改。三者同时存在，但视觉权重不同。" status="Stable" />
      <DocSection id="three-zones" title="Three zones" description="Context → Canvas → Agent 是创作阶段的空间语法。">
        <MiniAppShell workspace />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Context", "256px", "素材选择、来源与安全说明"],
            ["Canvas", "minmax(0, 1fr)", "大纲、正文和核心判断"],
            ["Inspector", "360px", "Agent 对话、写作计划与复核"],
          ].map(([title, width, copy]) => <div key={title} className="border-l border-border pl-3"><p className="text-xs font-medium">{title}</p><code className="mt-1 block font-mono text-micro text-info-foreground">{width}</code><p className="mt-2 text-micro leading-4 text-muted-foreground">{copy}</p></div>)}
        </div>
      </DocSection>
      <DocSection id="progressive-focus" title="Progressive focus" description="流程前进时收起不再需要的上下文，而不是永久保留三栏。">
        <div className="space-y-3">
          {[
            ["01", "材料成纲", "素材 + 大纲 + 对话", "三栏"],
            ["02", "大纲成文", "正文 + 写作计划", "双栏"],
            ["03", "逐段精修", "正文 + 局部检查器", "双栏"],
            ["04", "发布确认", "预览 + 明确操作", "单主栏"],
          ].map(([number, title, content, mode]) => <div key={number} className="grid items-center gap-2 rounded-xl border border-border px-4 py-3 sm:grid-cols-[2rem_8rem_1fr_auto]"><span className="font-mono text-micro text-muted-foreground">{number}</span><p className="text-xs font-medium">{title}</p><p className="text-xs text-muted-foreground">{content}</p><Badge variant="secondary" size="xs">{mode}</Badge></div>)}
        </div>
      </DocSection>
      <DocSection id="workspace-states" title="States" description="等待态只替换发生变化的区域，Header 与用户上下文保持稳定。">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {[
            [<Sparkles />, "Generating", "中央画布显示受控 AI 状态"],
            [<ShieldCheck />, "Review", "风险和引用在右栏持续可见"],
            [<CircleCheck />, "Ready", "由用户按钮触发下一阶段"],
          ].map(([icon, title, copy]) => <div key={String(title)} className="bg-background p-4"><span className="text-muted-foreground [&>svg]:size-4">{icon as ReactNode}</span><p className="mt-6 text-xs font-medium">{title}</p><p className="mt-1 text-micro leading-4 text-muted-foreground">{copy}</p></div>)}
        </div>
      </DocSection>
    </>
  );
}

function AdoptionPage() {
  return (
    <>
      <PageIntro eyebrow="Resources" title="采用共享源码，而不是复制视觉结果。" description="设计系统的价值来自一个真实的 Token 与组件源。Desktop 和 Web 可以拥有不同能力，但不应该拥有两套按钮和颜色。" />
      <DocSection id="install" title="安装" description="当前包位于同一 pnpm Workspace，由应用直接消费源码。">
        <Specimen title="Workspace dependency" description="在应用中引入共享样式和组件" code={'// package.json\n"@dionysus/ui": "workspace:*"\n\n// main.tsx\nimport "@dionysus/ui/styles.css"\nimport { Button, Surface } from "@dionysus/ui"'}>
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-xs text-primary-foreground">D</span><div><p className="text-xs font-medium">Shared source connected</p><p className="mt-1 font-mono text-micro text-muted-foreground">@dionysus/ui · workspace:*</p></div><Check className="ml-auto size-4 text-success-foreground" /></div>
        </Specimen>
      </DocSection>
      <DocSection id="architecture" title="架构边界" description="稳定依赖方向让视觉资产能跨应用复用而不携带业务副作用。">
        <div className="rounded-xl border border-border p-5">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-xs">
            <div className="grid w-full grid-cols-2 gap-3"><Surface variant="subtle" padding="md" className="text-center font-medium">Desktop</Surface><Surface variant="subtle" padding="md" className="text-center font-medium">Web</Surface></div>
            <ArrowUp className="size-3 rotate-180 text-muted-foreground" />
            <Surface padding="md" className="w-full text-center font-medium">Product views / Patterns</Surface>
            <ArrowUp className="size-3 rotate-180 text-muted-foreground" />
            <Surface variant="selected" padding="md" className="w-full text-center font-medium">@dionysus/ui</Surface>
            <ArrowUp className="size-3 rotate-180 text-muted-foreground" />
            <Surface variant="flat" className="w-full border-y border-border py-3 text-center font-mono text-micro text-muted-foreground">Semantic tokens</Surface>
          </div>
        </div>
        <RuleNote kind="safety"><InlineCode>@dionysus/ui</InlineCode> 不得访问 Electron、Node、Supabase、文件系统、网络请求或产品业务协议。</RuleNote>
      </DocSection>
      <DocSection id="review" title="Review checklist">
        <div className="divide-y divide-border rounded-xl border border-border">
          {[
            "是否只使用语义 Token，没有页面私有颜色？",
            "Light / Dark 是否使用同一组 Token 名称？",
            "Hover 是否轻于 Selected，且键盘 Focus 可见？",
            "组件是否覆盖 disabled、长中文和窄容器？",
            "页面是否优先使用间距与 divider，而不是堆 Card？",
            "AI 与高风险动作是否仍保留真实状态和人工确认？",
          ].map((item) => <div key={item} className="flex items-start gap-3 px-4 py-3 text-xs leading-5"><Check className="mt-0.5 size-3.5 shrink-0 text-success-foreground" /><span>{item}</span></div>)}
        </div>
      </DocSection>
      <DocSection id="license" title="许可证" description="设计原则可以借鉴，受限源码不能默认进入独立公开组件仓库。">
        <RuleNote kind="safety">当前基础包只摘录 Dionysus 的语义 Token 和通用基础原语。React Bits Pro Fog Sphere 不进入公开基础包；Glass Surface、Multica 相关实现与 PrismaticButton 公开分发前仍需完成许可复核或 clean-room 替换。PrismaticButton 的来源和证据边界已单独归档到 <InlineCode>docs/reference-analysis/prismatic-button</InlineCode>。</RuleNote>
      </DocSection>
    </>
  );
}

function PageNavigation({ pageId }: { pageId: string }) {
  const index = DOC_ITEMS.findIndex((item) => item.id === pageId);
  const previous = index > 0 ? DOC_ITEMS[index - 1] : null;
  const next = index >= 0 && index < DOC_ITEMS.length - 1 ? DOC_ITEMS[index + 1] : null;
  return (
    <footer className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {previous ? <Link to={previous.path} className="group rounded-xl border border-border p-4 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-1 text-micro text-muted-foreground"><ArrowLeft className="size-3" />Previous</span><span className="mt-2 block text-xs font-medium">{previous.label}</span></Link> : <span />}
      {next ? <Link to={next.path} className="group rounded-xl border border-border p-4 text-right outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center justify-end gap-1 text-micro text-muted-foreground">Next<ArrowRight className="size-3" /></span><span className="mt-2 block text-xs font-medium">{next.label}</span></Link> : null}
    </footer>
  );
}

function DocsPage({ pageId }: { pageId: string }) {
  let content: ReactNode;
  switch (pageId) {
    case "overview": content = <OverviewPage />; break;
    case "principles": content = <PrinciplesPage />; break;
    case "colors": content = <ColorsPage />; break;
    case "typography": content = <TypographyPage />; break;
    case "icons": content = <IconsPage />; break;
    case "layout": content = <LayoutPage />; break;
    case "button": content = <ButtonPage />; break;
    case "prismatic-button": content = <PrismaticButtonPage />; break;
    case "input": content = <InputPage />; break;
    case "compact-select": content = <CompactSelectPage />; break;
    case "dropdown-menu": content = <DropdownMenuPage />; break;
    case "inline-edit": content = <InlineEditPage />; break;
    case "floating-panel": content = <FloatingPanelPage />; break;
    case "surface": content = <SurfacePage />; break;
    case "feedback": content = <FeedbackPage />; break;
    case "app-shell": content = <AppShellPage />; break;
    case "workspace": content = <WorkspacePage />; break;
    case "adoption": content = <AdoptionPage />; break;
    default: content = <OverviewPage />;
  }
  return <>{content}<PageNavigation pageId={pageId} /></>;
}

export { DocsPage, PAGE_TOC };
