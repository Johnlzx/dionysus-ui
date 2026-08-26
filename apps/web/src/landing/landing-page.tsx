/**
 * [INPUT]: 依赖 React 状态/副作用、React Router、Landing 网站内部原语、Dionysus 图标与 Figma 节点 3:732
 * [OUTPUT]: 对外提供按 Zed 1120px 工程网格、区块节奏与动态语言实现的 Dionysus UI 官网
 * [POS]: web/src/landing 的页面组合根；网站级系统位于 landing-system.*，不进入可发布组件包
 * [PROTOCOL]: 变更时同步检查 landing-system.*、docs/LANDING_SITE_SYSTEM.md 与响应式视觉回归
 */
import { useEffect, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Menu,
  Search,
  Sparkles,
  X,
} from "@dionysus/ui/icons";
import {
  LandingAction,
  LandingKeycap,
  LandingRailSection,
  LandingSectionHeader,
  LandingSlashDivider,
  LandingTextLink,
} from "./landing-system";
import "./landing-system.css";
import "./landing.css";

const FEATURE_STRIP = [
  ["Focused", "低噪声表面、稳定层级与清楚的操作边界，让界面保持安静。"],
  ["Agentic", "为 AI 工作流保留过程状态、人工复核、复制、重试和停止位置。"],
  ["Composable", "同一套组件、Token 与规范服务产品、文档和设计评审。"],
] as const;

const TESTIMONIALS = [
  { quote: "它让高密度工作台依然有清晰层级，组件的默认状态几乎不需要二次解释。", name: "Product design", role: "Interface systems", monogram: "PD" },
  { quote: "Agent 状态不是一组装饰动画，而是从生成、复核到交回控制权的完整协议。", name: "AI platform", role: "Applied agents", monogram: "AI", featured: true },
  { quote: "文档直接消费真实组件，设计、工程和产品终于讨论的是同一个界面。", name: "Engineering", role: "Frontend infrastructure", monogram: "FE" },
  { quote: "动效很克制，但方向、速度和结束位置都能告诉用户刚刚发生了什么。", name: "Research tools", role: "Knowledge workflows", monogram: "RT" },
] as const;

const CATALOG_ITEMS = [
  ["Agent conversation", "可审阅的 Agent 浮动对话、过程状态与人工控制。", "/components/agent-conversation", "agent"],
  ["Floating panel", "布局内浮动右栏、卡片栈与双态触发器。", "/components/floating-panel", "panel"],
  ["Prismatic button", "稀缺高强调操作与可靠的 GPU 降级。", "/components/prismatic-button", "prism"],
  ["Rainbow loading", "真实进度、完成掠过与 reduced motion。", "/components/rainbow-loading", "rainbow"],
  ["Drops progress", "概率液滴前沿、真实进度与自动状态机。", "/components/drops-progress", "drops"],
  ["Inline edit", "锚定浮层、即时提交与失败回滚。", "/components/inline-edit", "inline"],
  ["Dropdown menu", "搜索、多选、分组与键盘指令。", "/components/dropdown-menu", "menu"],
  ["Compact select", "高密度设置行中的稳定单选原语。", "/components/compact-select", "select"],
  ["Illustrated card", "配图生成、裁切与卡片内容解耦。", "/components/illustrated-card", "image"],
  ["Surface", "常驻、浮层、选中与低层级表面。", "/components/surface", "surface"],
] as const;

const ECOSYSTEM = [
  ["Button", "Stable", "Action hierarchy", "/components/button"],
  ["Input", "Stable", "Forms and search", "/components/input"],
  ["Surface", "Stable", "Elevation grammar", "/components/surface"],
  ["Feedback", "12 states", "Status and errors", "/components/feedback"],
  ["Agent conversation", "New", "Reviewable AI", "/components/agent-conversation"],
  ["Rainbow loading", "New", "Progress handoff", "/components/rainbow-loading"],
  ["Drops progress", "New", "Procedural progress", "/components/drops-progress"],
  ["Prismatic button", "New", "Rare emphasis", "/components/prismatic-button"],
  ["Floating panel", "New", "Context rail", "/components/floating-panel"],
  ["Dropdown menu", "New", "Command selection", "/components/dropdown-menu"],
  ["Compact select", "New", "Dense settings", "/components/compact-select"],
  ["Inline edit", "New", "Fast property edits", "/components/inline-edit"],
  ["Illustrated card", "New", "Editorial media", "/components/illustrated-card"],
  ["Colors", "Foundation", "Semantic palette", "/foundations/colors"],
  ["Typography", "Foundation", "Readable hierarchy", "/foundations/typography"],
  ["Motion", "Foundation", "Directional feedback", "/foundations/motion"],
  ["Layout", "Foundation", "Density and grids", "/foundations/layout"],
] as const;

const AGENT_TABS = [
  ["Reviewable output", "把生成结果放进可检查、可复制、可重试的会话环境。", "agent"],
  ["Progress signals", "区分排队、生成、工具调用、完成与失败，不用模糊 spinner。", "progress"],
  ["Human control", "高风险动作必须回交给人，停止与撤销永远保持可达。", "control"],
  ["Any model, one grammar", "模型可以变化，界面的状态与控制协议保持稳定。", "models"],
] as const;

const CARE_TABS = [
  ["Semantic tokens", "Light、dark 和高对比主题只消费语义值。", "tokens"],
  ["Keyboard first", "焦点、roving tabindex 与恢复路径属于组件契约。", "keyboard"],
  ["Motion with meaning", "方向、时序和降级均围绕状态变化，而非装饰。", "motion"],
] as const;

const CARE_FEATURES = [
  ["4px foundation", "密度和间距共享同一倍数关系。"], ["Typed variants", "视觉差异通过稳定 API 表达。"],
  ["Visible focus", "键盘路径在每个主题下清晰可见。"], ["Reduced motion", "核心反馈保留，非必要运动立即结束。"],
  ["Async truth", "加载、成功与失败都由真实请求驱动。"], ["Portable DOM", "组件不依赖桌面壳或产品网络层。"],
  ["Living specs", "文档直接渲染生产组件。"], ["Review gates", "新原语先审状态，再进入业务页面。"],
] as const;

const LATEST = [
  { title: "Designing reviewable agent work", copy: "把 AI 输出从一次性回答变成可追踪、可停止、可复核的工作界面。", meta: "Agent patterns · 9 min", tone: "delta", to: "/components/agent-conversation" },
  { title: "Motion is part of the contract", copy: "为什么方向、时长、连续点击和 reduced motion 都应该进入组件规范。", meta: "Foundations · 7 min", tone: "orbit", to: "/foundations/motion" },
  { title: "One source for design and code", copy: "活规范如何减少截图漂移，让页面、组件和文档保持同一事实源。", meta: "Adoption · 6 min", tone: "facet", to: "/resources/adoption" },
] as const;

function DionysusLogotype() {
  return <span className="landing-logo" aria-label="Dionysus UI"><span className="landing-logo__mark" aria-hidden><span>D</span><i /></span><span className="landing-logo__word">Dionysus</span></span>;
}

function HeroOrbit() {
  return (
    <div className="landing-hero-orbit" aria-hidden><svg viewBox="0 0 1000 1000" focusable="false"><g className="landing-hero-orbit__spin">
      {Array.from({ length: 16 }, (_, index) => { const inset = 74 + (index * 18); const size = 1000 - (inset * 2); return <rect key={index} x={inset} y={inset} width={size} height={size} transform={`rotate(${index * 11.25} 500 500)`} />; })}
      {Array.from({ length: 24 }, (_, index) => <line key={index} x1="500" y1="500" x2="500" y2="22" transform={`rotate(${index * 15} 500 500)`} />)}
      <circle cx="500" cy="500" r="312" /><circle cx="500" cy="500" r="180" />
    </g></svg></div>
  );
}

function moveTabFocus(event: KeyboardEvent<HTMLButtonElement>, index: number, count: number, setActive: (index: number) => void) {
  let next = index;
  if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % count;
  else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + count) % count;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = count - 1;
  else return;
  event.preventDefault();
  setActive(next);
  const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  tabs?.[next]?.focus();
}

function SiteHeader({ onCommand }: { onCommand: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <><a className="landing-skip-link" href="#landing-main">跳到主要内容</a><header className="landing-header"><nav className="landing-header__inner" aria-label="主导航">
      <a className="landing-brand" href="#top"><DionysusLogotype /></a>
      <div className="landing-nav"><a href="#product">Product <ChevronDown aria-hidden /></a><a href="#resources">Resources <ChevronDown aria-hidden /></a><Link to="/components/button">Components</Link><Link to="/overview">Docs</Link><Link to="/resources/adoption">Adoption</Link><Link to="/foundations/colors">Tokens</Link></div>
      <div className="landing-header__actions"><button className="landing-command" type="button" aria-label="打开文档索引" onClick={onCommand}><Search aria-hidden /><LandingKeycap>Ctrl + Shift + P</LandingKeycap></button><span className="landing-nav-divider" aria-hidden /><Link className="landing-nav-button" to="/overview">Sign up <LandingKeycap>S</LandingKeycap></Link><LandingAction className="landing-header-cta" to="/overview" tone="primary" keycap="D">Docs</LandingAction><button className="landing-mobile-menu" type="button" aria-controls="landing-mobile-nav" aria-expanded={open} aria-label={open ? "关闭导航" : "打开导航"} onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden /> : <Menu aria-hidden />}</button></div>
      <div id="landing-mobile-nav" className="landing-mobile-nav" hidden={!open}><a href="#product" onClick={() => setOpen(false)}>Product</a><a href="#resources" onClick={() => setOpen(false)}>Resources</a><Link to="/components/button" onClick={() => setOpen(false)}>Components</Link><Link to="/overview" onClick={() => setOpen(false)}>Docs</Link><Link to="/resources/adoption" onClick={() => setOpen(false)}>Adoption</Link></div>
    </nav></header></>
  );
}

function Announcement() {
  return <LandingRailSection className="landing-announcement"><Link to="/components/agent-conversation"><strong>Introducing:</strong><span>Agent conversation, a reviewable environment for AI product work</span><ArrowRight aria-hidden /></Link></LandingRailSection>;
}

function Hero() {
  return (
    <LandingRailSection className="landing-hero-section" labelledBy="landing-hero-title"><HeroOrbit /><div className="landing-hero-grid" aria-hidden /><div className="landing-hero">
      <h1 id="landing-hero-title">Build serious interfaces, quietly</h1><p>一套为作者型 AI 工作台准备的克制 React 设计系统。</p>
      <div className="landing-hero__actions"><LandingAction to="/overview" tone="primary" icon={<BookOpen aria-hidden />} keycap="D">Browse docs</LandingAction><LandingAction to="/resources/adoption" icon={<Copy aria-hidden />} keycap="C">Clone source</LandingAction></div>
      <small>React 19, TypeScript, Tailwind CSS v4</small>
    </div></LandingRailSection>
  );
}

function FeatureStrip() {
  return <LandingRailSection id="product" className="landing-feature-strip-section"><div className="landing-feature-strip">{FEATURE_STRIP.map(([title, copy]) => <article key={title}><h2>{title}</h2><p>{copy}</p></article>)}</div></LandingRailSection>;
}

function EditorWindow({ compact = false, title = "agent-conversation.tsx" }: { compact?: boolean; title?: string }) {
  return (
    <div className={`landing-editor-window${compact ? " landing-editor-window--compact" : ""}`}><div className="landing-editor-window__chrome"><span /><span /><span /><p><Search aria-hidden /> Search…</p><small>dionysus / main / {title}</small></div><div className="landing-editor-window__body">
      <aside><strong>Foundations</strong><span>Colors</span><span>Typography</span><span>Motion</span><strong>Components</strong><span className="is-active">Agent conversation</span><span>Rainbow loading</span><span>Prismatic button</span></aside>
      <main><div className="landing-editor-window__tabs"><span className="is-active">Specimen</span><span>Usage</span><span>Motion</span></div><div className="landing-code-lines" aria-hidden>{Array.from({ length: compact ? 12 : 20 }, (_, index) => <span key={index} style={{ "--line": index } as CSSProperties} />)}</div><div className="landing-floating-agent"><div><Sparkles aria-hidden /><strong>Agent review</strong><em>Streaming</em></div><p>结构稳定。发布前只需要确认高风险动作是否回交给人。</p><button type="button"><Check aria-hidden /> Apply suggestion</button></div></main>
      <aside className="landing-editor-window__inspector"><strong>Tokens</strong><span>surface / raised</span><span>motion / enter</span><span>state / review</span></aside>
    </div></div>
  );
}

function ProductStage() {
  return (
    <LandingRailSection className="landing-product-section" labelledBy="product-stage-title"><div className="landing-product-stage-copy"><p className="landing-eyebrow">Shared source</p><h2 id="product-stage-title">文档不是截图，是产品正在使用的界面语言。</h2><p>把基础原语、异步反馈和 AI 协作状态收进同一套低噪声系统里。</p></div><div className="landing-product-window-wrap"><EditorWindow /><span className="landing-watch-demo"><span aria-hidden>▶</span> Watch demo</span></div></LandingRailSection>
  );
}

function TrustSection() {
  return (
    <LandingRailSection className="landing-trust-section" labelledBy="trust-title"><LandingSectionHeader id="trust-title" align="center" title={<>Trusted by teams building<br />complex software</>} description="从产品原型、研究工具到高密度工作台。" /><div className="landing-wordmarks" aria-label="采用场景"><strong>PRODUCT</strong><strong>RESEARCH</strong><strong>AGENTS</strong><strong>TOOLS</strong><strong>SYSTEMS</strong></div><div className="landing-testimonials">{TESTIMONIALS.map((item) => <article key={item.name} className={("featured" in item && item.featured) ? "is-featured" : undefined}><p>“{item.quote}”</p><footer><span>{item.monogram}</span><div><strong>{item.name}</strong><small>{item.role}</small></div></footer></article>)}</div></LandingRailSection>
  );
}

function MiniPreview({ kind }: { kind: string }) {
  return <div className={`landing-mini-preview landing-mini-preview--${kind}`} aria-hidden><span className="landing-mini-preview__rail" /><span className="landing-mini-preview__rail" /><span className="landing-mini-preview__rail" /><span className="landing-mini-preview__focus" /><i /><i /><i /><i /><i /></div>;
}

function CatalogSection() {
  return (
    <LandingRailSection id="resources" className="landing-catalog-section" labelledBy="catalog-title"><LandingSectionHeader id="catalog-title" title="Components that just work" description="每个组件都包含真实状态、键盘路径、主题适配和降级策略。" actions={<><LandingAction to="/overview" tone="text">View roadmap</LandingAction><LandingAction to="/components/button">View components</LandingAction></>} /><div className="landing-catalog-grid">{CATALOG_ITEMS.map(([name, copy, to, kind], index) => <Link key={name} to={to} className={index < 2 ? "landing-catalog-card landing-catalog-card--wide" : "landing-catalog-card"}>{index < 5 ? <MiniPreview kind={kind} /> : null}<div><h3>{name}</h3><p>{copy}</p></div></Link>)}</div></LandingRailSection>
  );
}

function OpenSection() {
  const glyphs = ["Aa", "⌘", "↗", "UI", "{}", "D", "↳", "◫", "AI", "↕", "#", "◎", "⌁", "✓", "⌘", "Aa"];
  const doubled = [...glyphs, ...glyphs];
  return (
    <LandingRailSection className="landing-open-section" labelledBy="open-title"><LandingSectionHeader id="open-title" align="center" title="Open by default" description="代码、约束、动效参数与可访问性契约都保持可检查。" /><div className="landing-marquee" aria-hidden><div>{doubled.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div></div><div className="landing-metrics"><div><strong>42</strong><span>Components</span></div><div><strong>138</strong><span>Semantic tokens</span></div><div><strong>27</strong><span>Documented patterns</span></div><div><strong>100%</strong><span>Keyboard reviewed</span></div></div><div className="landing-marquee landing-marquee--reverse" aria-hidden><div>{doubled.map((item, index) => <span key={`${item}-reverse-${index}`}>{item}</span>)}</div></div></LandingRailSection>
  );
}

function AgentSection() {
  const [active, setActive] = useState(0);
  return (
    <LandingRailSection className="landing-agent-section" labelledBy="agent-title"><LandingSectionHeader id="agent-title" title="AI patterns that preserve control" description="Dionysus 不锁定某个模型，它定义人与 Agent 协作时稳定的界面协议。" actions={<LandingAction to="/components/agent-conversation">Learn about agent UI</LandingAction>} /><div className="landing-feature-tabs"><div className="landing-feature-tabs__list" role="tablist" aria-label="Agent 模式">{AGENT_TABS.map(([title, copy], index) => <button id={`landing-agent-tab-${index}`} key={title} type="button" role="tab" aria-selected={active === index} aria-controls="landing-agent-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => moveTabFocus(event, index, AGENT_TABS.length, setActive)}><span>{title}</span>{active === index ? <p>{copy}</p> : null}<i>{active === index ? "−" : "+"}</i></button>)}<LandingTextLink to="/components/agent-conversation">Learn more</LandingTextLink></div><div id="landing-agent-panel" role="tabpanel" aria-labelledby={`landing-agent-tab-${active}`} className={`landing-feature-tabs__visual is-${AGENT_TABS[active][2]}`}><EditorWindow compact title={`${AGENT_TABS[active][2]}.tsx`} /></div></div></LandingRailSection>
  );
}

function EcosystemSection() {
  return (
    <LandingRailSection className="landing-ecosystem-section" labelledBy="ecosystem-title"><LandingSectionHeader id="ecosystem-title" title="A growing component ecosystem" description="从稳定基础原语到适合作者型 AI 产品的复杂交互模式。" actions={<><LandingAction to="/resources/adoption" tone="text">Adoption guide</LandingAction><LandingAction to="/overview">View all docs</LandingAction></>} /><div className="landing-ecosystem-grid">{ECOSYSTEM.map(([name, status, copy, to]) => <Link key={name} to={to}><span><strong>{name}</strong><small>{status}</small></span><p>{copy}</p><em>↗</em></Link>)}</div></LandingRailSection>
  );
}

function CareSection() {
  const [active, setActive] = useState(0);
  return (
    <LandingRailSection className="landing-care-section" labelledBy="care-title"><LandingSectionHeader id="care-title" title="Built with deliberate constraints" description="每条约束都服务可读性、可操作性和长期维护，而不是制造视觉噪声。" actions={<LandingAction to="/principles">Read principles</LandingAction>} /><div className="landing-care-feature"><div className="landing-feature-tabs__list" role="tablist" aria-label="实现约束">{CARE_TABS.map(([title, copy], index) => <button id={`landing-care-tab-${index}`} key={title} type="button" role="tab" aria-selected={active === index} aria-controls="landing-care-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => moveTabFocus(event, index, CARE_TABS.length, setActive)}><span>{title}</span>{active === index ? <p>{copy}</p> : null}<i>{active === index ? "−" : "+"}</i></button>)}</div><div id="landing-care-panel" role="tabpanel" aria-labelledby={`landing-care-tab-${active}`} className={`landing-token-specimen is-${CARE_TABS[active][2]}`}><header><span /><span /><span /><small>foundation.contract</small></header><div><code>--surface-raised</code><i>#ffffff</i></div><div><code>--focus-ring</code><i>#1348dc / 22%</i></div><div><code>--motion-enter</code><i>160ms · out</i></div><div><code>--control-height</code><i>32px</i></div></div></div><div className="landing-care-grid">{CARE_FEATURES.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></LandingRailSection>
  );
}

function LetterSection() {
  return (
    <LandingRailSection className="landing-letter-section" labelledBy="letter-title"><article className="landing-letter"><span className="landing-letter__label">A LETTER</span><h2 id="letter-title">From the maintainers</h2><p>工具正在改变人们组织信息、表达判断和完成复杂工作的方式。Dionysus 希望把这种变化落实成冷静、可靠且能被团队共同维护的界面。</p><hr /><p>我们相信好的设计系统不是组件数量，而是一组持续保护用户注意力、操作信心和人类控制权的约束。</p><footer><span>D</span><div><strong>Dionysus UI</strong><small>Design and engineering</small></div></footer><div className="landing-letter__stamp" aria-hidden><span>D</span></div></article></LandingRailSection>
  );
}

function LatestSection() {
  return (
    <LandingRailSection className="landing-latest-section" labelledBy="latest-title"><LandingSectionHeader id="latest-title" title="The latest from Dionysus" description="组件决策、AI 界面协议与设计系统治理的深入记录。" actions={<LandingAction to="/resources/adoption">View resources</LandingAction>} /><div className="landing-latest-grid">{LATEST.map((item) => <Link key={item.title} to={item.to} className="landing-article-card"><div className={`landing-article-card__visual is-${item.tone}`}><span>D</span><i /><i /></div><div><h3>{item.title}</h3><p>{item.copy}</p><small>{item.meta}</small></div></Link>)}</div></LandingRailSection>
  );
}

function Finale() {
  return (
    <LandingRailSection className="landing-final-section" labelledBy="final-title"><div className="landing-final-orbit" aria-hidden><span /><span /><span /><span /></div><div className="landing-final"><div className="landing-final__mark"><DionysusLogotype /></div><h2 id="final-title">Build quietly with Dionysus UI</h2><p>从真实组件开始，把克制、语义和人工控制权带进产品。</p><div><LandingAction to="/overview" tone="primary" icon={<BookOpen aria-hidden />} keycap="D">Browse docs</LandingAction><LandingAction to="/resources/adoption" icon={<Copy aria-hidden />} keycap="C">Adoption guide</LandingAction></div></div></LandingRailSection>
  );
}

const FOOTER_COLUMNS = [
  ["Product", [["Overview", "/overview"], ["Components", "/components/button"], ["Patterns", "/patterns/app-shell"], ["Tokens", "/foundations/colors"]]],
  ["Resources", [["Principles", "/principles"], ["Adoption", "/resources/adoption"], ["Motion", "/foundations/motion"], ["Layout", "/foundations/layout"]]],
  ["Components", [["Agent conversation", "/components/agent-conversation"], ["Floating panel", "/components/floating-panel"], ["Rainbow loading", "/components/rainbow-loading"], ["Drops progress", "/components/drops-progress"], ["Inline edit", "/components/inline-edit"]]],
  ["Foundations", [["Colors", "/foundations/colors"], ["Typography", "/foundations/typography"], ["Icons", "/foundations/icons"], ["Accessibility", "/principles"]]],
] as const;

function SiteFooter() {
  return (
    <footer className="landing-footer"><div className="landing-footer__inner"><div className="landing-footer__intro"><DionysusLogotype /><p>Dionysus UI © 2026</p><Link to="/resources/adoption">License & adoption</Link></div>{FOOTER_COLUMNS.map(([title, links]) => <nav key={title} aria-label={title}><strong>{title}</strong>{links.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}</nav>)}<div className="landing-footer__watermark" aria-hidden><span>D</span>Dionysus</div></div></footer>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.body.classList.add("landing-active");
    document.title = "Dionysus UI — Calm tools for serious work";
    if (description) description.content = "Dionysus UI: a restrained React design system for AI-native authoring workspaces.";
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        navigate("/overview");
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const route = event.key.toLowerCase() === "d" || event.key.toLowerCase() === "s" ? "/overview" : event.key.toLowerCase() === "c" ? "/resources/adoption" : null;
      if (route) { event.preventDefault(); navigate(route); }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => { window.removeEventListener("keydown", handleShortcut); document.body.classList.remove("landing-active"); document.title = previousTitle; if (description && previousDescription) description.content = previousDescription; };
  }, [navigate]);

  return (
    <div id="top" className="landing-page"><SiteHeader onCommand={() => navigate("/overview")} /><main id="landing-main" className="landing-main"><Announcement /><Hero /><div className="landing-product-cluster"><FeatureStrip /><ProductStage /></div><LandingSlashDivider /><TrustSection /><LandingSlashDivider /><CatalogSection /><LandingSlashDivider /><OpenSection /><LandingSlashDivider /><AgentSection /><LandingSlashDivider /><EcosystemSection /><LandingSlashDivider /><CareSection /><LandingSlashDivider /><LetterSection /><LandingSlashDivider /><LatestSection /><LandingSlashDivider /><Finale /></main><SiteFooter /></div>
  );
}

export { LandingPage };
