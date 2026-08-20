/**
 * [INPUT]: 依赖 React 组合内容、Motion 布局动画、共享浮动面板参数、Button 原语与 cn 类名工具
 * [OUTPUT]: 对外提供 FloatingSidePanel、FloatingSidePanelCard 与双态 SidePanelToggle
 * [POS]: ui/src 的桌面上下文面板原语，把 inset 卡片表面、布局让位和触发器状态收敛为单一契约
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./primitives";
import { cn } from "./cn";
import {
  FLOATING_PANEL_CONTENT_SPRING,
  FLOATING_PANEL_SIZE,
  FLOATING_PANEL_SPRING,
} from "./floating-panel-motion";

interface FloatingSidePanelProps {
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  inset?: number;
  open: boolean;
  railClassName?: string;
  width?: number;
}

function FloatingSidePanel({
  "aria-label": ariaLabel,
  children,
  className,
  id,
  inset = FLOATING_PANEL_SIZE.inset,
  open,
  railClassName,
  width = FLOATING_PANEL_SIZE.width,
}: FloatingSidePanelProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const trackWidth = width + inset * 2;
  const contentOffset = Math.min(32, Math.max(16, width * 0.08));

  return (
    <motion.aside
      animate={{ width: open ? trackWidth : 0 }}
      aria-hidden={!open}
      aria-label={ariaLabel}
      className={cn(
        "relative min-h-0 shrink-0 overflow-hidden",
        !open && "pointer-events-none",
        className,
      )}
      data-slot="floating-side-panel"
      data-state={open ? "open" : "closed"}
      id={id}
      inert={!open}
      initial={false}
      transition={reduceMotion ? { duration: 0 } : FLOATING_PANEL_SPRING}
    >
      <motion.div
        animate={{ opacity: open ? 1 : 0, x: open ? 0 : contentOffset }}
        className="absolute inset-y-0 right-0"
        data-slot="floating-side-panel-track"
        initial={false}
        style={{ padding: inset, width: trackWidth }}
        transition={reduceMotion ? { duration: 0 } : {
          opacity: {
            duration: open ? 0.14 : 0.09,
            ease: [0.22, 1, 0.36, 1],
          },
          x: FLOATING_PANEL_CONTENT_SPRING,
        }}
      >
        <div
          className={cn("flex h-full min-h-0 flex-col gap-2 overflow-y-auto", railClassName)}
          data-slot="floating-side-panel-rail"
        >
          {children}
        </div>
      </motion.div>
    </motion.aside>
  );
}

type FloatingSidePanelCardProps = HTMLAttributes<HTMLDivElement>;

const FloatingSidePanelCard = forwardRef<HTMLDivElement, FloatingSidePanelCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "shrink-0 overflow-hidden rounded-xl bg-surface text-surface-foreground shadow-[var(--floating-panel-shadow)] ring-1 ring-inset ring-surface-border",
        className,
      )}
      data-slot="floating-side-panel-card"
      {...props}
    />
  ),
);
FloatingSidePanelCard.displayName = "FloatingSidePanelCard";

type SidePanelToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-expanded"> & {
  open: boolean;
};

function SidePanelToggle({ children, className, open, title, ...props }: SidePanelToggleProps) {
  const actionLabel = open ? "收起侧栏" : "展开侧栏";

  return (
    <Button
      aria-expanded={open}
      aria-label={props["aria-label"] ?? actionLabel}
      className={cn(
        "transition-[color,background-color,border-color,box-shadow,transform] focus-visible:ring-ring",
        open
          ? "bg-surface-selected text-surface-selected-foreground shadow-[var(--surface-shadow)] ring-1 ring-inset ring-surface-border hover:bg-surface-selected"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
        className,
      )}
      data-state={open ? "open" : "closed"}
      size="icon-sm"
      title={title ?? actionLabel}
      variant="ghost"
      {...props}
    >
      {children}
    </Button>
  );
}

export {
  FloatingSidePanel,
  FloatingSidePanelCard,
  SidePanelToggle,
};
export type {
  FloatingSidePanelCardProps,
  FloatingSidePanelProps,
  SidePanelToggleProps,
};
