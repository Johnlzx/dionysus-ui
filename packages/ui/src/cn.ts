/**
 * [INPUT]: 依赖 clsx 条件类名解析与 tailwind-merge 冲突消解
 * [OUTPUT]: 对外提供 cn 类名合并函数
 * [POS]: ui/src 的零业务样式工具，供所有共享原语统一合并 className
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export { cn };
