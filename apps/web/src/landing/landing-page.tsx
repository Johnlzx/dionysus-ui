/**
 * [INPUT]: 依赖 React 状态/副作用、React Router、Dionysus UI 真实原语与批准图标
 * [OUTPUT]: 对外提供受 Zed 工程制图式构图启发、以 Dionysus 现有设计系统内容为主体的公开 Landing Page
 * [POS]: web/src/landing 的页面组合根，只编排营销内容与活组件示例，不创建第二套基础 Token
 * [PROTOCOL]: 变更时更新此头部，然后检查 docs/DESIGN_SYSTEM.md 与 THIRD_PARTY_NOTICES.md
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Copy,
  FileText,
  Layers3,
  LayoutGrid,
  MessageSquare,
  MousePointer2,
  Palette,
  PanelRight,
  Send,
  ShieldCheck,
  Sparkles,
  TextSelect,
  Type,
} from "@dionysus/ui/icons";
import {
  Avatar,
  Badge,
  Button,
  PrismaticButton,
  RainbowProgress,
  SearchField,
  SegmentedControl,
  Surface,
  ThemeToggle,
  buttonVariants,
  cn,
} from "@dionysus/ui";
import "./landing.css";

type ShowcaseId = "primitives" | "motion" | "workspace";

const SHOWCASE_ITEMS = [
  { value: "primitives", label: "Primitives" },
  { value: "motion", label: "Motion" },
  { value: "workspace", label: "Patterns" },
];

const PRINCIPLES = [
  {
    title: "克制",
    copy: "先使用留白、灰阶与稳定节奏，再考虑装饰。内容始终是舞台。",
  },
  {
    title: "语义",
    copy: "颜色只表达品牌、状态和风险；同类交互共享同一反馈契约。",
  },
  {
    title: "可控",
    copy: "AI 能力清楚可见，但发布、覆盖和高风险动作始终交还给人。",
  },
] as const;

const COMPONENTS = [
  ["Button", "操作层级、尺寸与完整状态", "Stable"],
  ["Prismatic Button", "稀缺高强调操作与 GPU 降级", "New"],
  ["Rainbow Loading", "真实进度与完成交接", "New"],
  ["Agent conversation", "悬浮对话、缩放与生成反馈", "New"],
  ["Compact Select", "紧凑、稳定的单选控件", "Stable"],
  ["Dropdown Menu", "搜索、多选、分组与指令", "Stable"],
  ["Inline Edit", "即时提交、失败回滚与就地反馈", "New"],
  ["Floating Panel", "不遮挡主画布的上下文侧栏", "New"],
  ["Illustrated Card", "配图生成与布局装配解耦", "New"],
  ["Surface", "常驻、浮层、选中与低层级表面", "Stable"],
  ["App Shell", "侧栏、顶栏与 inset canvas", "Pattern"],
  ["Content Workspace", "素材、画布与 Agent 三栏协作", "Pattern"],
] as const;

const LAYERS = [
  ["App Shell", "全局定位与安静底板"],
  ["Page Canvas", "连续工作的主画布"],
  ["Surface", "常驻信息与控件组合"],
  ["Raised Surface", "菜单、对话框与临时上下文"],
] as const;

function DionysusMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={cn("landing-mark", inverse && "landing-mark--inverse")} aria-hidden>
      <span>D</span>
    </span>
  );
}

function GridSection({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn("landing-section", className)}>
      <span className="landing-grid-node landing-grid-node--left" aria-hidden />
      <span className="landing-grid-node landing-grid-node--right" aria-hidden />
      {children}
    </section>
  );
}

function LandingHeader() {
  return (
    <>
      <a className="landing-skip-link" href="#landing-main">跳到主要内容</a>
      <header className="landing-header">
        <div className="landing-header__inner">
          <a className="landing-brand" href="#top" aria-label="Dionysus UI 首页">
            <DionysusMark />
            <span>Dionysus UI</span>
          </a>
          <nav className="landing-nav" aria-label="Landing 导航">
            <a href="#principles">原则</a>
            <a href="#components">组件</a>
            <a href="#patterns">模式</a>
            <Link to="/resources/adoption">采用</Link>
          </nav>
          <div className="landing-header__actions">
            <ThemeToggle />
            <Link className={cn(buttonVariants({ variant: "default", size: "sm" }), "landing-header__cta")} to="/overview">
              浏览文档
              <ArrowRight />
            </Link>
          </div>
        </div>
      </header>
      <div className="landing-announcement">
        <Link to="/components/agent-conversation">
          <span>New:</span> Agent conversation 已进入活规范
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </>
  );
}

function WorkbenchPreview() {
  const [query, setQuery] = useState("");
  const [showcase, setShowcase] = useState<ShowcaseId>("primitives");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const source = showcase === "primitives"
    ? `import { Button, Badge,\n  Surface } from \"@dionysus/ui\";\n\n<Surface variant=\"raised\">\n  <Badge variant=\"success\">\n    Ready\n  </Badge>\n  <Button>Apply changes</Button>\n</Surface>`
    : showcase === "motion"
      ? `import { RainbowProgress,\n  PrismaticButton } from \"@dionysus/ui\";\n\n<RainbowProgress\n  value={72}\n  label=\"Generation progress\"\n/>\n<PrismaticButton tone=\"blue\">\n  Generate outline\n</PrismaticButton>`
      : `import { FloatingSidePanel }\n  from \"@dionysus/ui\";\n\n<Workspace>\n  <SourceRail />\n  <WritingCanvas />\n  <FloatingSidePanel>\n    <AgentReview />\n  </FloatingSidePanel>\n</Workspace>`;

  return (
    <div className="landing-workbench" aria-label="Dionysus UI 活组件工作台">
      <div className="landing-workbench__titlebar">
        <div className="landing-window-controls" aria-hidden><span /><span /><span /></div>
        <SearchField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="搜索设计资产…"
          aria-label="搜索设计资产"
          wrapperClassName="landing-workbench__search"
        />
        <div className="landing-workbench__path"><span>dionysus-ui</span><span>/</span><strong>components</strong></div>
        <Avatar name="Dionysus" tone="blue" />
      </div>

      <div className="landing-workbench__body">
        <aside className="landing-workbench__sidebar" aria-label="组件分类">
          <p className="landing-workbench__eyebrow">LIBRARY</p>
          {["Foundations", "Components", "Patterns", "Resources"].map((label, index) => (
            <div key={label} className={cn("landing-workbench__nav-item", index === 1 && "is-active")}>
              {index === 0 ? <Palette /> : index === 1 ? <MousePointer2 /> : index === 2 ? <LayoutGrid /> : <BookOpen />}
              <span>{label}</span>
              {index === 1 ? <Badge size="counter" variant="secondary">12</Badge> : null}
            </div>
          ))}
          <div className="landing-workbench__sidebar-footer">
            <span className="landing-status-dot" />
            <span>Shared source</span>
            <Badge size="xs" variant="outline">v0.1</Badge>
          </div>
        </aside>

        <div className="landing-workbench__canvas">
          <div className="landing-workbench__canvas-header">
            <div>
              <p className="landing-workbench__eyebrow">LIVE SPECIMEN</p>
              <h3>{SHOWCASE_ITEMS.find((item) => item.value === showcase)?.label}</h3>
            </div>
            <SegmentedControl
              value={showcase}
              items={SHOWCASE_ITEMS}
              onValueChange={(value) => setShowcase(value as ShowcaseId)}
              label="切换活组件预览"
            />
          </div>
          <div className="landing-workbench__preview" data-showcase={showcase}>
            {showcase === "primitives" ? <PrimitivesPreview /> : null}
            {showcase === "motion" ? <MotionPreview /> : null}
            {showcase === "workspace" ? <WorkspacePreview /> : null}
          </div>
        </div>

        <aside className="landing-workbench__code" aria-label="组件代码示例">
          <div className="landing-workbench__code-header">
            <span>specimen.tsx</span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={copyStatus === "copied" ? "已复制示例" : copyStatus === "error" ? "复制失败" : "复制示例"}
              title={copyStatus === "copied" ? "已复制" : copyStatus === "error" ? "复制失败" : "复制示例"}
              onClick={() => {
                if (!navigator.clipboard) {
                  setCopyStatus("error");
                  window.setTimeout(() => setCopyStatus("idle"), 1_200);
                  return;
                }
                void navigator.clipboard.writeText(source)
                  .then(() => setCopyStatus("copied"))
                  .catch(() => setCopyStatus("error"))
                  .finally(() => window.setTimeout(() => setCopyStatus("idle"), 1_200));
              }}
            >
              {copyStatus === "copied" ? <Check /> : <Copy />}
            </Button>
          </div>
          <pre><code>{source}</code></pre>
          <div className="landing-workbench__tokens">
            <span>Surface</span><strong>semantic</strong>
            <span>Grid</span><strong>4px</strong>
            <span>Theme</span><strong>system</strong>
          </div>
        </aside>
      </div>

      <div className="landing-workbench__statusbar">
        <span><Check /> Type safe</span>
        <span><Sparkles /> Reduced motion ready</span>
        <span className="landing-workbench__statusbar-end">React 19&nbsp;&nbsp;·&nbsp;&nbsp;TypeScript</span>
      </div>
    </div>
  );
}

function PrimitivesPreview() {
  return (
    <Surface variant="raised" padding="lg" className="landing-preview-card">
      <div className="landing-preview-card__head">
        <div>
          <Badge variant="success" size="xs"><Check /> Ready</Badge>
          <h4>发布前审校</h4>
          <p>每个状态都由真实原语表达。</p>
        </div>
        <Avatar name="Editor" tone="teal" size="md" />
      </div>
      <div className="landing-checklist">
        {["结构完整", "引用已核对", "作者最终确认"].map((item, index) => (
          <div key={item}><span className={cn("landing-check", index < 2 && "is-complete")}>{index < 2 ? <Check /> : null}</span><span>{item}</span><small>{index < 2 ? "完成" : "待确认"}</small></div>
        ))}
      </div>
      <div className="landing-preview-card__actions">
        <Button variant="ghost">返回修改</Button>
        <Button>确认发布 <ArrowRight /></Button>
      </div>
    </Surface>
  );
}

function MotionPreview() {
  return (
    <div className="landing-motion-preview">
      <div className="landing-motion-preview__copy">
        <Badge variant="info" size="xs"><Sparkles /> Async state</Badge>
        <h4>状态必须连续可感知</h4>
        <p>真实进度、明确阶段与随时可停止的操作，共享同一套反馈纪律。</p>
        <div className="landing-motion-progress">
          <div><span>正在组织内容结构</span><strong>72%</strong></div>
          <RainbowProgress value={72} animateOnMount={false} label="内容结构生成进度" />
        </div>
      </div>
      <PrismaticButton tone="blue" className="landing-prismatic-button"><Sparkles /> 生成文章大纲</PrismaticButton>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div className="landing-mini-workspace">
      <div className="landing-mini-workspace__sources">
        <p>素材上下文</p>
        {["产品笔记.md", "访谈摘录.md", "研究材料.md"].map((item, index) => <span key={item} className={index === 0 ? "is-active" : undefined}><FileText />{item}</span>)}
      </div>
      <div className="landing-mini-workspace__document">
        <Badge size="xs" variant="outline">Draft 03</Badge>
        <h4>AI Native 产品不是多一个聊天框</h4>
        <p>真正的工作流需要上下文、可见状态，以及人的最终判断。</p>
        <span /><span /><span className="is-short" />
      </div>
      <div className="landing-mini-workspace__agent">
        <div><Avatar name="Agent" tone="blue" /><strong>Agent review</strong></div>
        <p>结构已经稳定。第二节与结论有一处重复，需要合并吗？</p>
        <Button size="xs">应用建议</Button>
      </div>
    </div>
  );
}

function PrincipleStrip() {
  return (
    <div id="principles" className="landing-principles">
      {PRINCIPLES.map((principle) => (
        <div key={principle.title}>
          <strong>{principle.title}</strong>
          <p>{principle.copy}</p>
        </div>
      ))}
    </div>
  );
}

function MetricsSection() {
  return (
    <GridSection className="landing-metrics-section">
      <div className="landing-section-heading landing-section-heading--center landing-reveal">
        <p className="landing-kicker">ONE SOURCE OF TRUTH</p>
        <h2>从 Token 到工作流，使用同一套语言</h2>
        <p>组件文档不是静态陈列。这里展示的，就是产品真正消费的源码。</p>
      </div>
      <div className="landing-metrics landing-reveal">
        <div><strong>4px</strong><span>基础间距网格</span></div>
        <div><strong>22</strong><span>稳定文档入口</span></div>
        <div><strong>2</strong><span>同名主题契约</span></div>
        <div><strong>1</strong><span>共享组件来源</span></div>
      </div>
    </GridSection>
  );
}

function FeatureMatrix() {
  const featureCells = [
    { title: "真实组件，而不是截图", copy: "Landing、活规范与产品共同消费 @dionysus/ui；视觉修复只发生一次。", icon: Layers3, large: true },
    { title: "状态从一开始就完整", copy: "Rest、hover、pressed、selected、focus-visible 与 disabled 共同定义组件。", icon: MousePointer2, large: true },
    { title: "Semantic tokens", copy: "颜色、表面和风险只通过语义名进入组件。", icon: Palette },
    { title: "Motion contracts", copy: "时序、降级与连续操作都有清晰边界。", icon: Sparkles },
    { title: "Platform neutral", copy: "共享层不依赖 Electron、Node 或业务协议。", icon: ShieldCheck },
  ];
  return (
    <GridSection id="components" className="landing-feature-section">
      <div className="landing-section-heading landing-section-heading--split landing-reveal">
        <div><p className="landing-kicker">DIONYSUS, JUST WORKS</p><h2>为真实产品准备，不为展厅准备</h2></div>
        <p>基础原语保持安静，少量高强调动效只在它们能表达真实状态时出现。</p>
      </div>
      <div className="landing-feature-matrix landing-reveal">
        {featureCells.map(({ title, copy, icon: Icon, large }) => (
          <article key={title} className={cn("landing-feature-cell", large && "landing-feature-cell--large")}>
            <Icon />
            <div><h3>{title}</h3><p>{copy}</p></div>
            <ArrowRight className="landing-feature-cell__arrow" aria-hidden />
          </article>
        ))}
      </div>
    </GridSection>
  );
}

function LayersSection() {
  return (
    <GridSection id="patterns" className="landing-layers-section">
      <div className="landing-blueprint landing-reveal">
        <div className="landing-blueprint__intro">
          <p className="landing-kicker">SURFACE SYSTEM</p>
          <h2>层级依靠距离与明度，不依靠满屏卡片</h2>
          <p>稳定的四级表面让高密度工作区保持安静，也让浮层真正拥有临时性。</p>
          <Link to="/foundations/colors">查看颜色与表面 <ArrowRight /></Link>
        </div>
        <div className="landing-layer-stack" aria-label="Dionysus UI 表面层级">
          {LAYERS.map(([name, description], index) => (
            <div key={name} style={{ "--layer-index": index } as CSSProperties}>
              <span>0{index + 1}</span>
              <strong>{name}</strong>
              <small>{description}</small>
            </div>
          ))}
        </div>
      </div>
    </GridSection>
  );
}

function AgentSection() {
  return (
    <GridSection className="landing-agent-section">
      <div className="landing-section-heading landing-section-heading--split landing-reveal">
        <div><p className="landing-kicker">AI WITH BOUNDARIES</p><h2>AI 是受控能力，不是视觉主角</h2></div>
        <p>异步链路、停止、错误和人工确认都拥有明确位置。光效从不替代状态文字。</p>
      </div>
      <div className="landing-agent-demo landing-reveal">
        <div className="landing-agent-demo__timeline">
          {[
            ["01", "Thinking", "过程动词持续更新，状态对辅助技术可见。"],
            ["02", "Streaming", "真实结果逐步进入，不用装饰性假进度。"],
            ["03", "Human review", "完成后保留复制、重试、反馈和人工确认。"],
          ].map(([number, title, copy], index) => (
            <div key={title} className={cn(index === 1 && "is-active")}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></div>
          ))}
        </div>
        <Surface variant="raised" className="landing-agent-window">
          <div className="landing-agent-window__header">
            <div><Avatar name="Dionysus Agent" tone="blue" /><span><strong>Agent conversation</strong><small>正在审阅文章结构</small></span></div>
            <Badge variant="info" size="xs"><span className="landing-pulse" /> Streaming</Badge>
          </div>
          <div className="landing-agent-window__messages">
            <p className="landing-agent-window__user">保留作者的判断，只优化结构和重复表达。</p>
            <div className="landing-agent-window__answer">
              <span className="landing-ascii-mark" aria-hidden>⌁</span>
              <p>我会保留核心立场。当前第二节与结论重复，建议把“人工控制权”收束到结尾，并在正文中只保留一个具体例子。</p>
              <div><Button variant="ghost" size="xs"><Copy />复制</Button><Button variant="ghost" size="xs">重试</Button></div>
            </div>
          </div>
          <div className="landing-agent-window__composer">
            <span>Message the agent — @ 添加上下文</span><Button size="icon-sm" aria-label="发送消息"><Send /></Button>
          </div>
        </Surface>
      </div>
    </GridSection>
  );
}

function ComponentCatalog() {
  return (
    <GridSection className="landing-catalog-section">
      <div className="landing-section-heading landing-section-heading--split landing-reveal">
        <div><p className="landing-kicker">COMPONENT CATALOG</p><h2>持续生长的组件系统</h2></div>
        <div className="landing-heading-actions"><Link to="/components/button">从 Button 开始 <ArrowRight /></Link><Link to="/overview">查看全部文档 <ArrowRight /></Link></div>
      </div>
      <div className="landing-catalog landing-reveal">
        {COMPONENTS.map(([name, description, status]) => (
          <Link key={name} to={name === "Prismatic Button" ? "/components/prismatic-button" : name === "Rainbow Loading" ? "/components/rainbow-loading" : name === "Agent conversation" ? "/components/agent-conversation" : name === "Compact Select" ? "/components/compact-select" : name === "Dropdown Menu" ? "/components/dropdown-menu" : name === "Inline Edit" ? "/components/inline-edit" : name === "Floating Panel" ? "/components/floating-panel" : name === "Illustrated Card" ? "/components/illustrated-card" : name === "Surface" ? "/components/surface" : name === "App Shell" ? "/patterns/app-shell" : name === "Content Workspace" ? "/patterns/content-workspace" : "/components/button"}>
            <span><strong>{name}</strong><small>{status}</small></span>
            <p>{description}</p>
            <ArrowRight aria-hidden />
          </Link>
        ))}
      </div>
    </GridSection>
  );
}

function CareSection() {
  const careItems = [
    [Type, "Typography", "两种字重也能建立清晰层级。"],
    [Palette, "Semantic color", "颜色承担语义，不承担热闹。"],
    [TextSelect, "Inline editing", "高频、可逆变化留在原位。"],
    [PanelRight, "Context panels", "上下文进入布局，不遮挡主任务。"],
    [Clock3, "Motion timing", "从当前状态自然反向，不排队。"],
    [ShieldCheck, "Accessibility", "键盘、焦点、降级和 live region。"],
  ] as const;
  return (
    <GridSection className="landing-care-section">
      <div className="landing-section-heading landing-section-heading--split landing-reveal">
        <div><p className="landing-kicker">BUILT WITH CARE</p><h2>高级感来自纪律，不来自效果数量</h2></div>
        <Link to="/principles">阅读设计原则 <ArrowRight /></Link>
      </div>
      <div className="landing-care-demo landing-reveal">
        <div className="landing-care-demo__copy">
          <Badge variant="outline" size="xs">FOUNDATION / MOTION</Badge>
          <h3>方向反馈，不改变布局</h3>
          <p>导航图标在原槽位内交接为箭头。标签、行高和点击区域保持稳定，连续扫过时从当前进度自然反向。</p>
          <Link to="/foundations/motion">查看 Motion contract <ArrowRight /></Link>
        </div>
        <div className="landing-care-demo__visual" aria-hidden>
          <div className="landing-motion-path"><span /><span /><span /><span /></div>
          <div className="landing-nav-specimen"><Palette /><strong>颜色与表面</strong><ArrowRight /></div>
          <div className="landing-motion-measure landing-motion-measure--x">160ms</div>
          <div className="landing-motion-measure landing-motion-measure--y">3px</div>
        </div>
      </div>
      <div className="landing-care-grid landing-reveal">
        {careItems.map(([Icon, name, copy]) => <div key={name}><Icon /><strong>{name}</strong><p>{copy}</p></div>)}
      </div>
    </GridSection>
  );
}

function LetterSection() {
  return (
    <GridSection className="landing-letter-section">
      <article className="landing-letter landing-reveal">
        <div className="landing-letter__pattern" aria-hidden />
        <DionysusMark />
        <p className="landing-kicker">A LETTER</p>
        <h2>From the system</h2>
        <p>生产力工具的界面不需要不断证明自己的存在。它应该帮助人定位、判断和行动，然后退回背景。</p>
        <p>Dionysus UI 把设计决策写成共享 Token、组件契约和可验证的动效参数，让每一次采用都保留同样的安静、精密与人工控制权。</p>
        <footer><strong>Dionysus UI</strong><span>Design system · React source</span></footer>
      </article>
    </GridSection>
  );
}

function UpdatesSection() {
  const updates = [
    { title: "Prismatic Button", copy: "为每个 Surface 中唯一、高价值且可逆的主操作保留。", meta: "OGL · WebGL2", icon: Sparkles, href: "/components/prismatic-button" },
    { title: "Rainbow Loading", copy: "把真实进度与一次性完成交接拆成两个明确原语。", meta: "Motion · Feedback", icon: Clock3, href: "/components/rainbow-loading" },
    { title: "Agent conversation", copy: "浮动对话、过程状态、缩放与人工复核进入同一契约。", meta: "Pattern · AI", icon: MessageSquare, href: "/components/agent-conversation" },
  ];
  return (
    <GridSection className="landing-updates-section">
      <div className="landing-section-heading landing-section-heading--split landing-reveal">
        <div><p className="landing-kicker">LATEST FROM DIONYSUS UI</p><h2>最近进入活规范</h2></div>
        <Link to="/overview">浏览系统总览 <ArrowRight /></Link>
      </div>
      <div className="landing-updates landing-reveal">
        {updates.map(({ title, copy, meta, icon: Icon, href }) => (
          <Link key={title} to={href}>
            <div className="landing-update-visual"><span className="landing-update-grid" /><Icon /></div>
            <h3>{title}</h3><p>{copy}</p><small>{meta}</small>
          </Link>
        ))}
      </div>
    </GridSection>
  );
}

function FinalCta() {
  return (
    <GridSection className="landing-final-section">
      <div className="landing-final landing-reveal">
        <DionysusMark />
        <h2>Build quietly with Dionysus UI</h2>
        <p>从真实组件开始，把克制、语义和人工控制权带进产品。</p>
        <div>
          <Link className={buttonVariants({ variant: "default", size: "lg" })} to="/overview">浏览设计系统 <ArrowRight /></Link>
          <Link className={buttonVariants({ variant: "outline", size: "lg" })} to="/resources/adoption">查看采用方式</Link>
        </div>
      </div>
    </GridSection>
  );
}

function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand"><DionysusMark inverse /><strong>Dionysus UI</strong><span>© 2026 · Shared source</span></div>
        <nav aria-label="Footer 导航">
          <div><strong>System</strong><Link to="/overview">总览</Link><Link to="/principles">原则</Link><Link to="/foundations/colors">颜色与表面</Link><Link to="/foundations/motion">动效</Link></div>
          <div><strong>Components</strong><Link to="/components/button">Button</Link><Link to="/components/rainbow-loading">Rainbow Loading</Link><Link to="/components/agent-conversation">Agent conversation</Link><Link to="/components/illustrated-card">Illustrated Card</Link></div>
          <div><strong>Patterns</strong><Link to="/patterns/app-shell">App shell</Link><Link to="/patterns/content-workspace">Content workspace</Link><Link to="/resources/adoption">采用与治理</Link></div>
        </nav>
      </div>
      <div className="landing-footer__watermark" aria-hidden>Dionysus</div>
    </footer>
  );
}

function LandingPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.body.classList.add("landing-active");
    document.title = "Dionysus UI — Calm tools for serious work";
    if (description) description.content = "Dionysus UI：一套面向作者型 AI 工作台的克制型 React 设计系统。";
    return () => {
      document.body.classList.remove("landing-active");
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  return (
    <div id="top" className="landing-page">
      <LandingHeader />
      <main id="landing-main" className="landing-frame">
        <GridSection className="landing-hero-section">
          <div className="landing-hero">
            <p className="landing-kicker landing-rise landing-rise--one">DIONYSUS DESIGN SYSTEM</p>
            <h1 className="landing-rise landing-rise--two">让内容站上舞台</h1>
            <p className="landing-hero__copy landing-rise landing-rise--three">一套冷静、低饱和、内容优先的生产力工作台语言。为真实工作流而设计，也为人工判断留下空间。</p>
            <div className="landing-hero__actions landing-rise landing-rise--four">
              <Link className={cn(buttonVariants({ variant: "default", size: "lg" }), "landing-primary-cta")} to="/overview">浏览设计系统 <ArrowRight /></Link>
              <a className={buttonVariants({ variant: "outline", size: "lg" })} href="#components">查看真实组件</a>
            </div>
            <p className="landing-hero__meta landing-rise landing-rise--four">React 19 · TypeScript · Tailwind CSS v4</p>
          </div>
          <PrincipleStrip />
          <div className="landing-workbench-wrap landing-rise landing-rise--five"><WorkbenchPreview /></div>
        </GridSection>
        <MetricsSection />
        <FeatureMatrix />
        <LayersSection />
        <AgentSection />
        <ComponentCatalog />
        <CareSection />
        <LetterSection />
        <UpdatesSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}

export { LandingPage };
