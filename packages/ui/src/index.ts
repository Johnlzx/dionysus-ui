/**
 * [INPUT]: 依赖 ui/src 内部原语、侧栏、下拉浮层、主题与类名工具模块
 * [OUTPUT]: 对外提供 @dionysus/ui 的稳定公共导出面与 App Shell 侧栏运动契约
 * [POS]: ui/src 的包入口，阻止消费者依赖内部文件结构
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
export { cn } from "./cn";
export { DropdownMenu } from "./dropdown-menu";
export type {
  DropdownMenuAvatarConfig,
  DropdownMenuAvatarTone,
  DropdownMenuCommandItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuOptionItem,
  DropdownMenuProps,
  DropdownMenuTriggerProps,
} from "./dropdown-menu";
export {
  Avatar,
  Badge,
  Button,
  Dialog,
  Input,
  SearchField,
  SegmentedControl,
  Surface,
  badgeVariants,
  buttonVariants,
  surfaceVariants,
} from "./primitives";
export type {
  AvatarProps,
  BadgeProps,
  ButtonProps,
  DialogProps,
  SearchFieldProps,
  SegmentedControlItem,
  SegmentedControlProps,
  SurfaceProps,
} from "./primitives";
export {
  CollapsibleSidebar,
  SidebarHeader,
  SidebarToggle,
} from "./sidebar";
export type {
  CollapsibleSidebarProps,
  SidebarHeaderProps,
  SidebarToggleProps,
} from "./sidebar";
export { SIDEBAR_SIZE, SIDEBAR_SPRING, SIDEBAR_TOGGLE_SPRING } from "./sidebar-motion";
export { ThemeToggle, applyTheme, getStoredTheme } from "./theme";
export type { Theme } from "./theme";
