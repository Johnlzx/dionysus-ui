/**
 * [INPUT]: 依赖 React 组合内容、Motion 布局动画、共享侧栏运动参数、Button 原语与 cn 类名工具
 * [OUTPUT]: 对外提供可中断的 CollapsibleSidebar、SidebarHeader、SidebarToggle 及统一运动参数
 * [POS]: ui/src 的 App Shell 布局原语，集中管理桌面侧栏宽度与折叠按钮轨迹
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./primitives";
import { cn } from "./cn";
import { SIDEBAR_SIZE, SIDEBAR_SPRING, SIDEBAR_TOGGLE_SPRING } from "./sidebar-motion";

interface SidebarMotionContextValue {
  collapsed: boolean;
  collapsedWidth: number;
  expandedWidth: number;
  reduceMotion: boolean;
}

const SidebarMotionContext = createContext<SidebarMotionContextValue | null>(null);

function useSidebarMotion() {
  const context = useContext(SidebarMotionContext);
  if (!context) throw new Error("SidebarHeader and SidebarToggle must be used inside CollapsibleSidebar.");
  return context;
}

interface CollapsibleSidebarProps {
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
  collapsed: boolean;
  collapsedWidth?: number;
  expandedWidth?: number;
  id?: string;
}

function CollapsibleSidebar({
  "aria-label": ariaLabel,
  children,
  className,
  collapsed,
  collapsedWidth = SIDEBAR_SIZE.collapsed,
  expandedWidth = SIDEBAR_SIZE.expanded,
  id,
}: CollapsibleSidebarProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <SidebarMotionContext.Provider value={{ collapsed, collapsedWidth, expandedWidth, reduceMotion }}>
      <motion.aside
        animate={{ width: collapsed ? collapsedWidth : expandedWidth }}
        aria-label={ariaLabel}
        className={cn("shrink-0 overflow-hidden", className)}
        data-collapsed={collapsed}
        data-slot="collapsible-sidebar"
        id={id}
        initial={false}
        transition={reduceMotion ? { duration: 0 } : SIDEBAR_SPRING}
      >
        {children}
      </motion.aside>
    </SidebarMotionContext.Provider>
  );
}

interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
  toggle: ReactNode;
}

function SidebarHeader({ children, className, toggle }: SidebarHeaderProps) {
  const { collapsed, reduceMotion } = useSidebarMotion();

  return (
    <div className={cn("relative h-14 shrink-0 overflow-hidden", className)} data-slot="sidebar-header">
      <motion.div
        animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -8 : 0 }}
        aria-hidden={collapsed}
        className="absolute left-2 top-2 max-w-[calc(100%-3.25rem)] overflow-hidden whitespace-nowrap"
        inert={collapsed}
        initial={false}
        transition={reduceMotion ? { duration: 0 } : {
          duration: collapsed ? 0.12 : 0.16,
          delay: collapsed ? 0 : 0.06,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
      {toggle}
    </div>
  );
}

type SidebarToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-expanded"> & {
  collapsed: boolean;
};

function SidebarToggle({ children, className, collapsed, title, ...props }: SidebarToggleProps) {
  const { collapsedWidth, expandedWidth, reduceMotion } = useSidebarMotion();
  const buttonSize = 28;
  const expandedInset = 8;
  const x = collapsed
    ? (collapsedWidth - buttonSize) / 2
    : expandedWidth - expandedInset - buttonSize;
  const actionLabel = collapsed ? "展开侧栏" : "折叠侧栏";

  return (
    <motion.div
      animate={{ x }}
      className="absolute left-0 top-3.5 z-10 size-7"
      initial={false}
      transition={reduceMotion ? { duration: 0 } : SIDEBAR_TOGGLE_SPRING[collapsed ? "collapse" : "expand"]}
    >
      <Button
        aria-expanded={!collapsed}
        aria-label={props["aria-label"] ?? actionLabel}
        className={cn(
          "focus-visible:ring-sidebar-ring",
          collapsed
            ? "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            : "bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--surface-shadow)] ring-1 ring-inset ring-sidebar-border hover:bg-sidebar-accent",
          className,
        )}
        data-state={collapsed ? "collapsed" : "expanded"}
        size="icon-sm"
        title={title ?? actionLabel}
        variant="ghost"
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

export {
  CollapsibleSidebar,
  SidebarHeader,
  SidebarToggle,
};
export type { CollapsibleSidebarProps, SidebarHeaderProps, SidebarToggleProps };
