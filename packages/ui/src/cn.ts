/**
 * [INPUT]: 依赖 clsx 条件类名解析、tailwind-merge 冲突消解与 Dionysus 自定义排版 Token
 * [OUTPUT]: 对外提供能正确区分字号/字距与文字颜色的 cn 类名合并函数
 * [POS]: ui/src 的零业务样式工具，供所有共享原语统一合并 className
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const mergeDionysusClasses = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro", "nav-section", "button-sm"],
      tracking: ["nav-section"],
    },
  },
});

const cn = (...inputs: ClassValue[]) => mergeDionysusClasses(clsx(inputs));

export { cn };
