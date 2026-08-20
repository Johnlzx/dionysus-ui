/**
 * [INPUT]: 依赖 Lucide React 的受控图标子集、React SVG 属性与 Dionysus 类名工具
 * [OUTPUT]: 对外提供设计系统批准的图标、语义别名、统一 Icon 包装器与尺寸契约
 * [POS]: ui/src 的图标治理边界，阻止应用绕过设计系统直接依赖第三方图标全集
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "./cn";

export {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  Clipboard,
  Clock3,
  Columns3,
  Compass,
  CornerDownRight,
  FileQuestion,
  FileText,
  Flag,
  Info,
  Laptop,
  Layers3,
  LayoutDashboard,
  LayoutGrid,
  ListFilter,
  LoaderCircle,
  MailPlus,
  Menu,
  MessageSquareWarning,
  Moon,
  MoreHorizontal,
  MousePointer2,
  Palette,
  PanelLeft,
  PanelRight,
  PanelsTopLeft,
  Paperclip,
  Plus,
  Search,
  Send,
  Shapes,
  ShieldCheck,
  Sparkles,
  Sun,
  Tags,
  TextCursorInput,
  TextSelect,
  Type,
  UserRound,
  UserRoundX,
  X,
  ArrowLeft as BackIcon,
  Plus as AddIcon,
  Check as ConfirmIcon,
  Search as SearchIcon,
  X as CloseIcon,
} from "lucide-react";

const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

const ICON_STROKE_WIDTH = 2;

type IconSize = keyof typeof ICON_SIZES;

interface IconProps extends Omit<LucideProps, "aria-hidden" | "aria-label" | "children" | "role" | "size" | "strokeWidth"> {
  icon: LucideIcon;
  size?: IconSize;
  label?: string;
}

function Icon({ icon: Glyph, size = "md", label, className, ...props }: IconProps) {
  return (
    <Glyph
      {...props}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={cn("shrink-0", className)}
      data-slot="icon"
      focusable="false"
      role={label ? "img" : undefined}
      size={ICON_SIZES[size]}
      strokeWidth={ICON_STROKE_WIDTH}
    />
  );
}

export { ICON_SIZES, ICON_STROKE_WIDTH, Icon };
export type { IconProps, IconSize, LucideIcon, LucideProps };
