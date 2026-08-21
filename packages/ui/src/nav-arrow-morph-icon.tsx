/**
 * [INPUT]: 依赖设计系统图标类型、ChevronRight 字形与 cn 类名工具；交互由祖先 data-nav-icon-trigger 驱动
 * [OUTPUT]: 对外提供可复用的 NavArrowMorphIcon，令任意导航图标在 hover / focus 时连续交接为右向箭头
 * [POS]: ui/src 的导航微动效原语，把参考视频中的图形交接沉淀为轻量 CSS/SVG 组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import type { LucideIcon } from "./icons";
import { ChevronRight } from "./icons";
import { cn } from "./cn";

interface NavArrowMorphIconProps {
  className?: string;
  icon: LucideIcon;
}

function NavArrowMorphIcon({ className, icon: Glyph }: NavArrowMorphIconProps) {
  return (
    <span
      aria-hidden
      className={cn("nav-arrow-morph-icon relative inline-grid size-3.5 shrink-0 place-items-center", className)}
      data-slot="nav-arrow-morph-icon"
    >
      <Glyph
        className="nav-arrow-morph-icon__source absolute inset-0 size-full"
        data-slot="nav-arrow-morph-source"
        focusable="false"
      />
      <ChevronRight
        className="nav-arrow-morph-icon__arrow absolute inset-0 size-full"
        data-slot="nav-arrow-morph-arrow"
        focusable="false"
        strokeWidth={2.25}
      />
    </span>
  );
}

export { NavArrowMorphIcon };
export type { NavArrowMorphIconProps };
