/**
 * [INPUT]: 依赖 React 状态/副作用、React Router、Lucide、共享 UI 交互与侧栏运动原语、导航模型与页面目录元数据
 * [OUTPUT]: 对外提供含可折叠 Motion 桌面侧栏、移动抽屉、顶栏、搜索面板、页内目录和 inset canvas 的 DocsShell
 * [POS]: web/src 的顶级文档壳，用 Dionysus 自身布局语言呈现整个设计系统
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Columns3,
  Compass,
  Layers3,
  LayoutDashboard,
  LayoutGrid,
  ListFilter,
  Menu,
  MessageSquareWarning,
  MousePointer2,
  Palette,
  PanelLeft,
  PanelsTopLeft,
  Search,
  TextCursorInput,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Badge,
  Button,
  CollapsibleSidebar,
  Dialog,
  SearchField,
  SidebarHeader,
  SidebarToggle,
  ThemeToggle,
  cn,
} from "@dionysus/ui";
import { DOC_ITEMS, DOC_NAVIGATION } from "./navigation";
import { PAGE_TOC } from "./pages";

function Brand() {
  return (
    <Link to="/overview" className="group flex h-10 items-center gap-2.5 rounded-lg px-2 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
      <span className="inline-flex size-6 items-center justify-center rounded-lg bg-primary text-[0.68rem] font-medium text-primary-foreground shadow-[var(--surface-shadow)]">D</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium tracking-tight">Dionysus UI</span>
        <span className="block text-micro text-muted-foreground">Design system</span>
      </span>
    </Link>
  );
}

const NAV_ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  principles: Compass,
  colors: Palette,
  typography: Type,
  layout: LayoutGrid,
  button: MousePointer2,
  input: TextCursorInput,
  "dropdown-menu": ListFilter,
  surface: Layers3,
  feedback: MessageSquareWarning,
  "app-shell": PanelLeft,
  workspace: Columns3,
  adoption: BookOpenCheck,
};

function Navigation({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="设计系统导航"
      className={cn(
        "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 pb-6 pt-2",
        collapsed && "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {DOC_NAVIGATION.map((group) => (
        <div key={group.label} className={cn("last:mb-0", collapsed ? "mb-3" : "mb-5")}>
          <p className={cn("mb-1.5 px-2 text-micro font-medium uppercase tracking-[0.12em] text-muted-foreground/80", collapsed && "sr-only")}>{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.path;
              const Icon = NAV_ICONS[item.id] ?? PanelsTopLeft;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group/nav flex h-8 min-w-0 items-center overflow-hidden rounded-md text-xs text-muted-foreground outline-none transition-colors hover:bg-sidebar-accent/65 hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    collapsed ? "justify-center px-0" : "gap-2 px-2",
                    active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon aria-hidden className="size-3.5 shrink-0" />
                  <span className={cn("min-w-0 flex-1 truncate", collapsed && "sr-only")}>{item.label}</span>
                  {!collapsed && item.badge ? <span className="tabular-nums text-micro text-muted-foreground">{item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SearchPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return !normalized ? DOC_ITEMS.slice(0, 7) : DOC_ITEMS.filter((item) => (
      `${item.label} ${item.description}`.toLocaleLowerCase("zh-CN").includes(normalized)
    )).slice(0, 8);
  }, [query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="搜索设计系统"
      description="输入关键词定位组件、Token 或页面模式"
      panelClassName="search-enter max-w-xl"
    >
        <div className="flex h-12 items-center gap-3 border-b border-border px-3">
          <SearchField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
            wrapperClassName="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-within:border-transparent focus-within:ring-0"
            className="text-sm"
            placeholder="搜索组件、Token 或模式…"
            aria-label="搜索"
          />
          <kbd className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-micro text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[24rem] overflow-y-auto p-1.5">
          {results.map((item) => (
            <Link key={item.id} to={item.path} onClick={() => onOpenChange(false)} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 outline-none hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><BookOpen className="size-3.5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium">{item.label}</span>
                <span className="mt-0.5 block truncate text-micro text-muted-foreground">{item.description}</span>
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          ))}
          {results.length === 0 ? <p className="px-3 py-10 text-center text-xs text-muted-foreground">没有找到相关条目。</p> : null}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/25 px-3 py-2 text-micro text-muted-foreground">
          <span>输入关键词定位设计资产</span>
          <span>{DOC_ITEMS.length} 个条目</span>
        </div>
    </Dialog>
  );
}

function DocsShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeItem = DOC_ITEMS.find((item) => item.path === pathname) ?? DOC_ITEMS[0]!;
  const activeGroup = DOC_NAVIGATION.find((group) => group.items.some((item) => item.path === pathname));
  const toc = PAGE_TOC[activeItem.id] ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    document.title = `${activeItem.label} — Dionysus UI`;
  }, [activeItem]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-app-shell">
      <CollapsibleSidebar
        aria-label="设计系统侧栏"
        className="hidden flex-col bg-sidebar text-sidebar-foreground lg:flex"
        collapsed={sidebarCollapsed}
        id="docs-sidebar"
      >
        <SidebarHeader
          toggle={(
            <SidebarToggle
              aria-controls="docs-sidebar"
              collapsed={sidebarCollapsed}
              onClick={() => setSidebarCollapsed((current) => !current)}
            >
              <PanelLeft />
            </SidebarToggle>
          )}
        >
          <Brand />
        </SidebarHeader>
        <div className="px-2 py-2">
          <Button
            aria-label={sidebarCollapsed ? "搜索文档" : undefined}
            onClick={() => setSearchOpen(true)}
            title={sidebarCollapsed ? "搜索文档" : undefined}
            variant="ghost"
            className={cn(
              "h-8 w-full overflow-hidden border-sidebar-border bg-surface/55 text-xs text-muted-foreground shadow-[var(--surface-shadow)] hover:bg-surface-hover hover:text-foreground focus-visible:ring-sidebar-ring",
              sidebarCollapsed ? "justify-center px-0" : "justify-start px-2",
            )}
          >
            <Search className="size-3.5" />
            <span className={cn("flex-1 text-left", sidebarCollapsed && "sr-only")}>搜索文档</span>
            {!sidebarCollapsed ? <kbd className="rounded border border-sidebar-border px-1 py-0.5 font-mono text-micro">⌘K</kbd> : null}
          </Button>
        </div>
        <Navigation collapsed={sidebarCollapsed} />
        <div
          aria-label="System status：Shared source，版本 0.1"
          className={cn(
            "m-2 flex shrink-0 items-center rounded-lg border border-sidebar-border bg-surface/35",
            sidebarCollapsed ? "h-10 justify-center p-0" : "justify-between px-2.5 py-2",
          )}
          role="status"
          title={sidebarCollapsed ? "System status · Shared source · v0.1" : undefined}
        >
          <div className={cn(sidebarCollapsed && "sr-only")}>
            <p className="text-xs font-medium">System status</p>
            <p className="mt-0.5 text-micro text-muted-foreground">Shared source · v0.1</p>
          </div>
          <span className="size-1.5 rounded-full bg-success shadow-[0_0_0_3px_color-mix(in_oklab,var(--success)_14%,transparent)]" />
        </div>
      </CollapsibleSidebar>

      <Dialog
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title="设计系统导航"
        description="浏览 Dionysus UI 的 Foundations、Components、Patterns 和 Resources"
        overlayClassName="z-40 items-stretch justify-start p-0 pt-0 lg:hidden"
        panelClassName="drawer-enter flex h-full w-[min(19rem,88vw)] max-w-none flex-col rounded-none bg-sidebar shadow-[var(--floating-shadow)] ring-0"
      >
            <div className="flex items-center justify-between px-2 pb-1 pt-2">
              <Brand />
              <Button variant="ghost" size="icon-sm" aria-label="关闭导航" onClick={() => setMobileOpen(false)}><X /></Button>
            </div>
            <div className="px-2 py-2">
              <Button onClick={() => { setMobileOpen(false); setSearchOpen(true); }} variant="ghost" className="h-8 w-full justify-start border-sidebar-border bg-surface/55 px-2 text-xs text-muted-foreground shadow-[var(--surface-shadow)] hover:bg-surface-hover focus-visible:ring-sidebar-ring">
                <Search className="size-3.5" /><span className="flex-1 text-left">搜索文档</span><kbd className="rounded border border-sidebar-border px-1 py-0.5 font-mono text-micro">⌘K</kbd>
              </Button>
            </div>
            <Navigation onNavigate={() => setMobileOpen(false)} />
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-2 sm:px-3">
          <Button variant="ghost" size="icon-sm" aria-label="打开导航" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu /></Button>
          <Link to="/overview" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden">
            <span className="flex size-5 items-center justify-center rounded-md bg-primary text-micro text-primary-foreground">D</span>
            <span className="text-xs font-medium">Dionysus UI</span>
          </Link>
          <div className="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="hidden sm:inline">{activeGroup?.label}</span>
            <span className="hidden sm:inline" aria-hidden>/</span>
            <span className="truncate font-medium text-foreground">{activeItem.label}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex" onClick={() => setSearchOpen(true)}><Search />搜索</Button>
            <Badge variant="outline" size="xs" className="hidden sm:inline-flex">v0.1</Badge>
            <ThemeToggle />
          </div>
        </header>

        <main className="relative flex min-h-0 flex-1 overflow-hidden bg-page-canvas ring-1 ring-surface-border shadow-[var(--surface-shadow)] lg:mb-2 lg:mr-2 lg:rounded-xl">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
            <div className="mx-auto grid w-full max-w-[77rem] grid-cols-1 gap-12 px-5 pb-20 pt-10 sm:px-8 lg:px-12 xl:grid-cols-[minmax(0,50rem)_11rem] xl:px-14">
              <article className="page-enter min-w-0">{children}</article>
              <aside className="hidden xl:block">
                <div className="sticky top-10">
                  <p className="mb-3 text-micro font-medium uppercase tracking-[0.12em] text-muted-foreground">On this page</p>
                  <nav aria-label="页内目录" className="border-l border-border pl-3">
                    {toc.map((item) => (
                      <a key={item.id} href={`#${item.id}`} className="block rounded-sm py-1.5 text-xs leading-4 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring">{item.label}</a>
                    ))}
                  </nav>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>

      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

export { DocsShell };
