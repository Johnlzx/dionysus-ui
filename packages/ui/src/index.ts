/**
 * [INPUT]: 依赖 ui/src 内部原语、Prismatic Button、Rainbow Loading、Agent 对话角、左右侧栏、导航图标微动效、紧凑选择/下拉浮层、原位编辑、配图管线、主题与类名工具模块
 * [OUTPUT]: 对外提供 @dionysus/ui 的稳定公共导出面，以及配图风格、生成管线、CardIllustration 与 IllustratedCard 契约
 * [POS]: ui/src 的包入口，阻止消费者依赖内部文件结构
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
export { cn } from "./cn";
export { CardIllustration } from "./card-illustration";
export type {
  CardIllustrationFade,
  CardIllustrationPlacement,
  CardIllustrationProps,
  CardIllustrationScale,
} from "./card-illustration";
export { IllustratedCard } from "./illustrated-card";
export type { IllustratedCardMetaItem, IllustratedCardProps } from "./illustrated-card";
export {
  createIllustrationGenerationRequest,
  defineIllustrationLibrary,
  runIllustrationPipeline,
} from "./illustration-generation";
export { DIONYSUS_ILLUSTRATIONS, DIONYSUS_ILLUSTRATION_ASSETS } from "./illustration-library";
export type {
  IllustrationAlphaProcessor,
  IllustrationAsset,
  IllustrationBackground,
  IllustrationGenerationProvider,
  IllustrationGenerationRequest,
  IllustrationLibrary,
  IllustrationMediaType,
  IllustrationPipelineOptions,
  IllustrationSafeArea,
  RawIllustration,
} from "./illustration-generation";
export {
  EDITORIAL_CUTOUT_STYLE,
  createIllustrationPrompt,
  defineIllustrationStyle,
} from "./illustration-style";
export type {
  IllustrationPromptInput,
  IllustrationStyle,
  IllustrationSubjectKind,
} from "./illustration-style";
export { AgentConversationCorner } from "./agent-conversation-corner";
export type {
  AgentConversation,
  AgentConversationCornerProps,
  AgentConversationSize,
  AgentFeedbackValue,
  AgentMessage,
  AgentMessageRole,
  AgentMessageStatus,
  AgentQuickAction,
  AgentResponseContext,
} from "./agent-conversation-corner";
export {
  AGENT_CORNER_CONTENT_ENTER,
  AGENT_CORNER_CONTENT_EXIT,
  AGENT_CORNER_ENTER,
  AGENT_CORNER_EXIT,
  AGENT_CORNER_SIZE,
  AGENT_CORNER_SPRING,
  AGENT_CORNER_TRANSFER,
  AGENT_CORNER_VIEW_TRANSITION,
} from "./agent-conversation-motion";
export { CompactSelect } from "./compact-select";
export type { CompactSelectAlign, CompactSelectOption, CompactSelectProps } from "./compact-select";
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
export { InlineEdit, InlineEditSelect } from "./inline-edit";
export type {
  InlineEditAlign,
  InlineEditCloseStrategy,
  InlineEditEditorContext,
  InlineEditOption,
  InlineEditProps,
  InlineEditSelectProps,
  InlineEditSelectValue,
  InlineEditState,
} from "./inline-edit";
export { NavArrowMorphIcon } from "./nav-arrow-morph-icon";
export type { NavArrowMorphIconProps } from "./nav-arrow-morph-icon";
export {
  FloatingSidePanel,
  FloatingSidePanelCard,
  SidePanelToggle,
} from "./floating-panel";
export type {
  FloatingSidePanelCardProps,
  FloatingSidePanelProps,
  SidePanelToggleProps,
} from "./floating-panel";
export {
  FLOATING_PANEL_CONTENT_SPRING,
  FLOATING_PANEL_SIZE,
  FLOATING_PANEL_SPRING,
} from "./floating-panel-motion";
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
export { PrismaticButton } from "./prismatic-button";
export type { PrismaticButtonProps, PrismaticButtonTone } from "./prismatic-button";
export {
  DEFAULT_PROGRESS_CYCLE,
  DEFAULT_RIBBON_DURATION,
  DEFAULT_SHEEN_DURATION,
  DEFAULT_SWEEP_DURATION,
  RAINBOW_PROGRESS_COLORS,
  RAINBOW_SWEEP_COLORS,
  RainbowProgress,
  RainbowSweep,
} from "./rainbow-loading";
export type {
  RainbowProgressProps,
  RainbowSweepDirection,
  RainbowSweepMode,
  RainbowSweepProps,
} from "./rainbow-loading";
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
