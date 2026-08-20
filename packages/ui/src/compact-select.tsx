/**
 * [INPUT]: 依赖 React 状态/布局副作用、React DOM Portal、Motion 浮层过渡、设计系统图标与 cn
 * [OUTPUT]: 对外提供选中项锚定展开的 CompactSelect 单选控件与选项类型
 * [POS]: ui/src 的紧凑表单选择原语，用于设置行和高密度工具区，不承担 Inline Edit 的持久化反馈职责
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "./cn";
import { Check, ChevronDown } from "./icons";

type CompactSelectAlign = "start" | "center" | "end";

interface CompactSelectOption {
  value: string;
  label: ReactNode;
  textValue?: string;
  visual?: ReactNode;
  disabled?: boolean;
}

interface CompactSelectProps extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> {
  label: string;
  options: CompactSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: CompactSelectOption) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: ReactNode;
  disabled?: boolean;
  align?: CompactSelectAlign;
  triggerClassName?: string;
  panelClassName?: string;
}

interface FloatingPosition {
  left: number;
  top: number;
  anchorX: number;
  anchorY: number;
  ready: boolean;
}

const ITEM_HEIGHT = 32;
const PANEL_PADDING = 4;
const PANEL_BORDER = 1;
const VIEWPORT_PADDING = 8;
const TRIGGER_MENU_BLEED = 8;

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

const getOptionText = (option: CompactSelectOption) => (
  option.textValue ?? (typeof option.label === "string" || typeof option.label === "number" ? String(option.label) : option.value)
);

function CompactSelect({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  placeholder = "选择…",
  disabled = false,
  align = "center",
  triggerClassName,
  panelClassName,
  className,
  ...props
}: CompactSelectProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef<number | undefined>(undefined);
  const reduceMotion = useReducedMotion();
  const fallbackValue = defaultValue ?? options.find((option) => !option.disabled)?.value ?? "";
  const [internalValue, setInternalValue] = useState(fallbackValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [activeValue, setActiveValue] = useState<string | undefined>(undefined);
  const [position, setPosition] = useState<FloatingPosition>({ left: 0, top: 0, anchorX: 0, anchorY: 0, ready: false });
  const currentValue = value ?? internalValue;
  const isOpen = !disabled && (open ?? internalOpen);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === currentValue),
    [currentValue, options],
  );
  const enabledOptions = useMemo(() => options.filter((option) => !option.disabled), [options]);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === currentValue));

  const setOpen = useCallback((nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [onOpenChange, open]);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [setOpen]);

  const selectOption = useCallback((option: CompactSelectOption) => {
    if (option.disabled) return;
    if (value === undefined) setInternalValue(option.value);
    onValueChange?.(option.value, option);
    close(true);
  }, [close, onValueChange, value]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const triggerRect = trigger.getBoundingClientRect();
    panel.style.minWidth = `${Math.ceil(triggerRect.width + TRIGGER_MENU_BLEED)}px`;
    const panelRect = panel.getBoundingClientRect();
    const preferredLeft = align === "start"
      ? triggerRect.left - TRIGGER_MENU_BLEED / 2
      : align === "end"
        ? triggerRect.right - panelRect.width + TRIGGER_MENU_BLEED / 2
        : triggerRect.left + (triggerRect.width - panelRect.width) / 2;
    const maximumLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - panelRect.width - VIEWPORT_PADDING);
    const left = clamp(preferredLeft, VIEWPORT_PADDING, maximumLeft);
    const selectedRowCenter = PANEL_BORDER + PANEL_PADDING + selectedIndex * ITEM_HEIGHT + ITEM_HEIGHT / 2;
    const preferredTop = triggerRect.top + triggerRect.height / 2 - selectedRowCenter;
    const maximumTop = Math.max(VIEWPORT_PADDING, window.innerHeight - panelRect.height - VIEWPORT_PADDING);
    const top = clamp(preferredTop, VIEWPORT_PADDING, maximumTop);
    const anchorX = clamp(triggerRect.left + triggerRect.width / 2 - left, 0, panelRect.width);
    const anchorY = clamp(triggerRect.top + triggerRect.height / 2 - top, 0, panelRect.height);

    setPosition({ left, top, anchorX, anchorY, ready: true });
  }, [align, selectedIndex]);

  const focusOption = useCallback((nextValue: string | undefined) => {
    if (!nextValue) return;
    setActiveValue(nextValue);
    optionRefs.current.get(nextValue)?.focus();
  }, []);

  const moveActive = useCallback((event: KeyboardEvent<HTMLElement>, direction: 1 | -1) => {
    if (enabledOptions.length === 0) return;
    event.preventDefault();
    const currentIndex = enabledOptions.findIndex((option) => option.value === activeValue);
    const nextIndex = currentIndex < 0
      ? direction > 0 ? 0 : enabledOptions.length - 1
      : (currentIndex + direction + enabledOptions.length) % enabledOptions.length;
    focusOption(enabledOptions[nextIndex]?.value);
  }, [activeValue, enabledOptions, focusOption]);

  const handleTypeahead = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key.length !== 1 || event.key.trim().length === 0 || event.altKey || event.ctrlKey || event.metaKey) return false;
    const query = `${typeaheadRef.current}${event.key}`.toLocaleLowerCase("zh-CN");
    typeaheadRef.current = query;
    window.clearTimeout(typeaheadTimerRef.current);
    typeaheadTimerRef.current = window.setTimeout(() => { typeaheadRef.current = ""; }, 500);
    const startIndex = Math.max(0, enabledOptions.findIndex((option) => option.value === activeValue));
    const orderedOptions = [...enabledOptions.slice(startIndex + 1), ...enabledOptions.slice(0, startIndex + 1)];
    const match = orderedOptions.find((option) => getOptionText(option).toLocaleLowerCase("zh-CN").startsWith(query));
    if (!match) return false;
    event.preventDefault();
    if (isOpen) focusOption(match.value);
    else selectOption(match);
    return true;
  }, [activeValue, enabledOptions, focusOption, isOpen, selectOption]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition((current) => current.ready ? { ...current, ready: false } : current);
      return;
    }
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updatePosition);
    if (triggerRef.current) observer?.observe(triggerRef.current);
    if (panelRef.current) observer?.observe(panelRef.current);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const initialValue = selectedOption && !selectedOption.disabled ? selectedOption.value : enabledOptions[0]?.value;
    setActiveValue(initialValue);
    const focusFrame = window.requestAnimationFrame(() => focusOption(initialValue));
    const handleViewportChange = () => updatePosition();
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (panelRef.current?.contains(event.target) || triggerRef.current?.contains(event.target)) return;
      close(false);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close(true);
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof Node)) return;
      if (panelRef.current?.contains(event.target) || triggerRef.current?.contains(event.target)) return;
      close(false);
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [close, enabledOptions, focusOption, isOpen, selectedOption, updatePosition]);

  useEffect(() => () => window.clearTimeout(typeaheadTimerRef.current), []);

  const portal = typeof document === "undefined" ? null : createPortal(
    <AnimatePresence>
      {isOpen && !disabled ? (
        <motion.div
          ref={panelRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          data-slot="compact-select-menu"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: position.ready ? 1 : 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.11, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed z-50 w-max max-w-[calc(100vw-1rem)] overflow-hidden rounded-[0.6875rem] border border-surface-border/90 bg-surface-raised p-1 text-surface-foreground shadow-[var(--menu-shadow)] ring-1 ring-foreground/5 outline-none",
            panelClassName,
          )}
          style={{
            left: position.left,
            top: position.top,
            visibility: position.ready ? "visible" : "hidden",
            transformOrigin: `${position.anchorX}px ${position.anchorY}px`,
          }}
        >
          {options.map((option) => {
            const selected = option.value === currentValue;
            const active = option.value === activeValue;
            return (
              <button
                key={option.value}
                ref={(element) => {
                  if (element) optionRefs.current.set(option.value, element);
                  else optionRefs.current.delete(option.value);
                }}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={option.disabled}
                tabIndex={active ? 0 : -1}
                data-active={active ? "" : undefined}
                className="group/compact-option flex h-8 w-full min-w-0 items-center gap-2 rounded-[0.5rem] px-2 text-left text-[0.8125rem] leading-5 outline-none transition-colors hover:bg-surface-selected focus-visible:bg-surface-selected focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40 data-[active]:bg-surface-selected"
                onMouseEnter={() => setActiveValue(option.value)}
                onFocus={() => setActiveValue(option.value)}
                onClick={() => selectOption(option)}
                onKeyDown={(event) => {
                  if (handleTypeahead(event)) return;
                  if (event.key === "ArrowDown") moveActive(event, 1);
                  if (event.key === "ArrowUp") moveActive(event, -1);
                  if (event.key === "Home" && enabledOptions[0]) {
                    event.preventDefault();
                    focusOption(enabledOptions[0].value);
                  }
                  if (event.key === "End" && enabledOptions.at(-1)) {
                    event.preventDefault();
                    focusOption(enabledOptions.at(-1)!.value);
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectOption(option);
                  }
                }}
              >
                {option.visual ? <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>{option.visual}</span> : null}
                <span className="min-w-0 flex-1 truncate whitespace-nowrap">{option.label}</span>
                <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
                  {selected ? <Check className="size-4 stroke-[2.35]" /> : null}
                </span>
              </button>
            );
          })}
          {options.length === 0 ? <p className="px-3 py-6 text-center text-xs text-muted-foreground">没有可选项</p> : null}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div data-slot="compact-select" className={cn("inline-flex", className)} {...props}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        data-open={isOpen ? "" : undefined}
        className={cn(
          "inline-flex h-8 max-w-full items-center gap-1.5 rounded-[0.5rem] border border-input bg-surface px-2.5 text-left text-[0.8125rem] leading-5 text-foreground shadow-[var(--surface-shadow)] outline-none transition-[background-color,border-color,box-shadow,transform] hover:bg-surface-hover focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 data-[open]:bg-surface-selected",
          triggerClassName,
        )}
        onClick={() => setOpen(!isOpen)}
        onKeyDown={(event) => {
          if (handleTypeahead(event)) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={cn("min-w-0 flex-1 truncate whitespace-nowrap", !selectedOption && "text-muted-foreground")}>{selectedOption?.label ?? placeholder}</span>
        <ChevronDown aria-hidden className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 data-[open]:rotate-180" data-open={isOpen ? "" : undefined} />
      </button>
      {portal}
    </div>
  );
}

export { CompactSelect };
export type { CompactSelectAlign, CompactSelectOption, CompactSelectProps };
