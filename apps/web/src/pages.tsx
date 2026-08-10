/**
 * [INPUT]: 依赖 React 状态、React Router、Lucide、@dionysus/ui 真实原语、文档呈现组件与导航顺序
 * [OUTPUT]: 对外提供所有设计系统页面内容、页内目录、页面分发器和相邻页导航
 * [POS]: web/src 的设计知识主体，以 Foundations→Components→Patterns→Resources 层级呈现视觉语言
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleCheck,
  FileText,
  Layers3,
  LoaderCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Type,
} from "lucide-react";
import { Avatar, Badge, Button, Input, SearchField, Surface, cn } from "@dionysus/ui";
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
  input: [
    { id: "text-input", label: "Text input" },
    { id: "search-field", label: "Search field" },
    { id: "input-states", label: "States" },
    { id: "input-api", label: "API" },
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

function OverviewPage() {
  return (
    <>
      <PageIntro
        eyebrow="Getting started"
        title="为作者型 AI 工作台建立一套安静的秩序。"
        description="Dionysus UI 以内容为中心，以中性色建立层级，以小面积语义色表达状态，并把最终判断与发布控制权始终留给用户。"
        status="Active"
        meta={<><Metric value="2" label="Color modes" /><Metric value="7" label="Core primitives" /><Metric value="4px" label="Base grid" /><Metric value="AA" label="Target contrast" /></>}
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
            <Link key={path} to={path} className="group flex items-center gap-4 px-4 py-4 outline-none hover:bg-surface-hover focus-visible:bg-surface-hover">
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
            ["Micro", "10 / 14", "text-micro", "VERSION 0.1 · UPDATED TODAY"],
          ].map(([role, metrics, token, sample]) => (
            <div key={role} className="grid items-baseline gap-3 py-5 sm:grid-cols-[5rem_6rem_1fr]">
              <span className="text-micro text-muted-foreground">{role}</span>
              <span className="font-mono text-micro text-muted-foreground">{metrics}</span>
              <p className={cn("font-medium tracking-tight", token)}>{sample}</p>
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
      <DocSection id="shell-behavior" title="Behavior">
        <div className="divide-y divide-border border-y border-border">
          {[
            ["Expand / collapse", "侧栏从 256px 收缩到 56px；图标位置保持稳定。"],
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
        <RuleNote kind="safety">当前基础包只摘录 Dionysus 的语义 Token 和通用基础原语。React Bits Pro Fog Sphere 不进入公开基础包；Glass Surface 与 Multica 相关实现公开分发前仍需完成许可复核或 clean-room 替换。</RuleNote>
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
    case "layout": content = <LayoutPage />; break;
    case "button": content = <ButtonPage />; break;
    case "input": content = <InputPage />; break;
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
