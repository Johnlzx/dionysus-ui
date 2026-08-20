/**
 * [INPUT]: 依赖 React DOM 属性、CVA 变体系统、设计系统搜索图标与 cn 类名工具
 * [OUTPUT]: 对外提供 Button、Badge、Avatar、Input、SearchField、Surface、Dialog、SegmentedControl 等平台无关 UI 原语
 * [POS]: ui/src 的核心组件层，从 Desktop 视觉基线摘录并维持同一密度、状态和语义 Token
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";
import { Search, X } from "./icons";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/45 active:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/82",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/25 dark:hover:bg-input/45",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/55",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/18 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5",
        xs: "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-md px-2.5 text-button-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center overflow-hidden rounded-full border border-transparent font-medium whitespace-nowrap [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/10 text-destructive",
        warning: "bg-warning/12 text-warning-foreground",
        success: "bg-success/12 text-success-foreground",
        info: "bg-info/12 text-info-foreground",
        outline: "border-border text-foreground",
        ghost: "text-muted-foreground",
      },
      size: {
        default: "h-5 gap-1 px-2 py-0.5 text-xs [&>svg]:size-3",
        xs: "h-4.5 gap-0.5 px-1.5 text-micro [&>svg]:size-2.5",
        counter: "size-4 p-0 text-micro [&>svg]:size-2.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

const avatarTone = {
  violet: "bg-avatar-violet text-avatar-violet-foreground",
  blue: "bg-avatar-blue text-avatar-blue-foreground",
  amber: "bg-avatar-amber text-avatar-amber-foreground",
  teal: "bg-avatar-teal text-avatar-teal-foreground",
  rose: "bg-avatar-rose text-avatar-rose-foreground",
} as const;

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  tone?: keyof typeof avatarTone;
  size?: "sm" | "md";
}

function Avatar({ className, name, tone = "violet", size = "sm", ...props }: AvatarProps) {
  const initials = name.trim().split(/\s+/u).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "D";
  return (
    <span
      aria-label={name}
      data-slot="avatar"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium ring-1 ring-foreground/5",
        avatarTone[tone],
        size === "sm" ? "size-5 text-micro" : "size-7 text-xs",
        className,
      )}
      {...props}
    >
      {initials}
    </span>
  );
}

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground shadow-[var(--surface-shadow)] outline-none transition-[color,background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
  wrapperClassName?: string;
}

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, onClear, value, wrapperClassName, ...props }, ref) => {
    const hasValue = typeof value === "string" && value.length > 0;
    return (
      <div
        data-slot="search-field"
        className={cn(
          "flex h-8 min-w-40 items-center gap-2 rounded-lg border border-input bg-background px-2 text-muted-foreground shadow-[var(--surface-shadow)] transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
          wrapperClassName,
        )}
      >
        <Search aria-hidden className="size-3.5 shrink-0" />
        <input
          ref={ref}
          type="search"
          value={value}
          className={cn("min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden", className)}
          {...props}
        />
        {hasValue && onClear ? (
          <Button variant="ghost" size="icon-xs" aria-label="清除搜索" title="清除搜索" onClick={onClear} className="-mr-1">
            <X />
          </Button>
        ) : null}
      </div>
    );
  },
);
SearchField.displayName = "SearchField";

const surfaceVariants = cva("text-surface-foreground", {
  variants: {
    variant: {
      card: "rounded-xl border border-surface-border bg-surface shadow-[var(--surface-shadow)]",
      raised: "rounded-xl bg-surface-raised shadow-[var(--floating-shadow)] ring-1 ring-surface-border",
      subtle: "rounded-xl bg-muted/40",
      selected: "rounded-xl bg-surface-selected text-surface-selected-foreground ring-1 ring-surface-border",
      flat: "bg-surface",
    },
    padding: { none: "", sm: "p-2", md: "p-3", lg: "p-4" },
  },
  defaultVariants: { variant: "card", padding: "none" },
});

type SurfaceProps = ComponentPropsWithoutRef<"div"> & VariantProps<typeof surfaceVariants>;

const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} data-slot="surface" className={cn(surfaceVariants({ variant, padding }), className)} {...props} />
  ),
);
Surface.displayName = "Surface";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

interface DialogProps extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
  children: ReactNode;
}

function Dialog({
  open,
  onOpenChange,
  title,
  description,
  overlayClassName,
  panelClassName,
  className,
  children,
  ...props
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const siblingState = Array.from(overlay?.parentElement?.children ?? [])
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== overlay)
      .map((element) => ({
        element,
        inert: element.inert,
        ariaHidden: element.getAttribute("aria-hidden"),
      }));
    siblingState.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    const focusFirstElement = () => {
      const focusable = panel?.querySelector<HTMLElement>(focusableSelector);
      (focusable ?? panel)?.focus();
    };
    const frame = window.requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      siblingState.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }
      });
      previousActiveElement?.focus();
    };
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 flex items-start justify-center overscroll-contain bg-foreground/12 px-4 pt-[12vh] backdrop-blur-[2px]", overlayClassName)}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <Surface
        ref={panelRef}
        variant="raised"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn("w-full max-w-lg overflow-hidden outline-none focus-visible:ring-3 focus-visible:ring-ring/30", panelClassName, className)}
        {...props}
      >
        <div className="sr-only">
          <h2 id={titleId}>{title}</h2>
          {description ? <p id={descriptionId}>{description}</p> : null}
        </div>
        {children}
      </Surface>
    </div>
  );
}

interface SegmentedControlItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string;
  items: SegmentedControlItem[];
  onValueChange: (value: string) => void;
  label: string;
  size?: NonNullable<VariantProps<typeof buttonVariants>["size"]>;
}

function SegmentedControl({
  value,
  items,
  onValueChange,
  label,
  size = "xs",
  className,
  ...props
}: SegmentedControlProps) {
  const controlRef = useRef<HTMLDivElement>(null);
  const enabledItems = items.filter((item) => !item.disabled);
  const focusItem = (nextValue: string) => {
    window.requestAnimationFrame(() => {
      controlRef.current?.querySelector<HTMLButtonElement>(`[data-segmented-value="${CSS.escape(nextValue)}"]`)?.focus();
    });
  };
  const selectRelativeItem = (event: KeyboardEvent<HTMLDivElement>, offset: number) => {
    const currentIndex = enabledItems.findIndex((item) => item.value === value);
    if (currentIndex < 0 || enabledItems.length === 0) return;
    event.preventDefault();
    const nextItem = enabledItems[(currentIndex + offset + enabledItems.length) % enabledItems.length]!;
    onValueChange(nextItem.value);
    focusItem(nextItem.value);
  };
  const selectEdgeItem = (event: KeyboardEvent<HTMLDivElement>, edge: "first" | "last") => {
    const nextItem = edge === "first" ? enabledItems[0] : enabledItems[enabledItems.length - 1];
    if (!nextItem) return;
    event.preventDefault();
    onValueChange(nextItem.value);
    focusItem(nextItem.value);
  };

  return (
    <div
      ref={controlRef}
      role="tablist"
      aria-label={label}
      data-slot="segmented-control"
      className={cn("flex items-center rounded-lg bg-muted p-0.5", className)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") selectRelativeItem(event, 1);
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") selectRelativeItem(event, -1);
        if (event.key === "Home") selectEdgeItem(event, "first");
        if (event.key === "End") selectEdgeItem(event, "last");
      }}
      {...props}
    >
      {items.map((item) => (
        <Button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          tabIndex={value === item.value ? 0 : -1}
          variant={value === item.value ? "secondary" : "ghost"}
          size={size}
          disabled={item.disabled}
          data-segmented-value={item.value}
          onClick={() => onValueChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}

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
};
export type {
  AvatarProps,
  BadgeProps,
  ButtonProps,
  DialogProps,
  SearchFieldProps,
  SegmentedControlItem,
  SegmentedControlProps,
  SurfaceProps,
};
