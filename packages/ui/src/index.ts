/**
 * [INPUT]: 依赖 ui/src 内部原语、主题与类名工具模块
 * [OUTPUT]: 对外提供 @dionysus/ui 的稳定公共导出面
 * [POS]: ui/src 的包入口，阻止消费者依赖内部文件结构
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
export { cn } from "./cn";
export {
  Avatar,
  Badge,
  Button,
  Input,
  SearchField,
  Surface,
  badgeVariants,
  buttonVariants,
  surfaceVariants,
} from "./primitives";
export type { AvatarProps, BadgeProps, ButtonProps, SearchFieldProps, SurfaceProps } from "./primitives";
export { ThemeToggle, applyTheme, getStoredTheme } from "./theme";
export type { Theme } from "./theme";
