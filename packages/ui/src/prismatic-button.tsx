/**
 * [INPUT]: 依赖 React 原生 Button 属性、PrismaticBurst 的 OGL/GLSL 光场、styles.css 的 Prismatic Button Token 与 cn
 * [OUTPUT]: 对外提供 PrismaticButton、PrismaticButtonProps 与 PrismaticButtonTone，以六组受控色调复用同一动态棱光和交互语义
 * [POS]: ui/src 的高强调操作原语，用于少量、明确批准的主操作，不替代通用 Button
 * [PROTOCOL]: 变更时更新此头部，然后检查 docs/DESIGN_SYSTEM.md
 */
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";
import { PrismaticBurst } from "./prismatic-burst";

type PrismaticButtonTone = "green" | "blue" | "violet" | "amber" | "rose" | "cyan";
type PrismaticButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: PrismaticButtonTone;
};

const PrismaticButton = forwardRef<HTMLButtonElement, PrismaticButtonProps>(function PrismaticButton(
  { className, children, tone = "green", type = "button", ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      data-slot="prismatic-button"
      data-tone={tone}
      type={type}
      className={cn(
        "prismatic-button relative isolate inline-flex h-[var(--prismatic-button-height)] w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[var(--prismatic-button-radius)] border-0 px-[var(--prismatic-button-padding-x)] [font-family:var(--prismatic-button-font-family)] [font-size:var(--prismatic-button-font-size)] [line-height:var(--prismatic-button-line-height)] font-medium whitespace-nowrap text-[var(--prismatic-button-foreground)] outline-none select-none transition-[transform,box-shadow] duration-[var(--prismatic-button-transition-duration)] ease-[var(--prismatic-button-ease)] enabled:hover:shadow-[var(--prismatic-button-hover-shadow)] enabled:active:scale-[var(--prismatic-button-press-scale)] focus-visible:ring-2 focus-visible:ring-[var(--prismatic-button-focus-ring)] disabled:cursor-not-allowed disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-0 [background:var(--prismatic-button-gradient)]" />
      <span
        aria-hidden
        className="absolute inset-0 overflow-hidden [backface-visibility:hidden] [contain:strict] [filter:blur(var(--prismatic-button-blur))] [transform:translateZ(0)]"
      >
        <PrismaticBurst />
      </span>
      <span className="relative z-30 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
});

export { PrismaticButton };
export type { PrismaticButtonProps, PrismaticButtonTone };
