/**
 * [INPUT]: 依赖 React 状态/布局副作用、React DOM Portal、Motion 浮层过渡、设计系统状态图标、Surface 与 cn
 * [OUTPUT]: 对外提供通用 InlineEdit 锚定编辑外壳、InlineEditSelect 选择器和相应类型契约
 * [POS]: ui/src 的非模态原位编辑模式层，统一即时提交、失败回滚、焦点恢复、视口避让与轻量保存反馈
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
import { Check, CircleAlert, LoaderCircle, Plus } from "./icons";
import { Surface } from "./primitives";

type InlineEditState = "idle" | "saving" | "saved" | "error";
type InlineEditAlign = "start" | "center" | "end";
type InlineEditCloseStrategy = "start" | "success" | "never";

interface InlineEditEditorContext<T> {
  value: T;
  state: InlineEditState;
  error: ReactNode;
  commit: (nextValue: T) => Promise<boolean>;
  close: (restoreFocus?: boolean) => void;
}

interface InlineEditProps<T> extends Omit<ComponentPropsWithoutRef<"div">, "children" | "defaultValue" | "onChange"> {
  label: string;
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  onCommit?: (nextValue: T, previousValue: T) => void | Promise<void>;
  onCommitError?: (error: unknown, attemptedValue: T, previousValue: T) => void;
  renderValue: (value: T, state: InlineEditState) => ReactNode;
  editor: (context: InlineEditEditorContext<T>) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  state?: InlineEditState;
  errorMessage?: ReactNode;
  getErrorMessage?: (error: unknown) => ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  closeOnCommit?: InlineEditCloseStrategy;
  align?: InlineEditAlign;
  sideOffset?: number;
  panelClassName?: string;
  triggerClassName?: string;
  popupRole?: "dialog" | "listbox";
}

interface FloatingPosition {
  left: number;
  top: number;
  side: "top" | "bottom";
  ready: boolean;
}

const focusableSelector = [
  "[autofocus]",
  "input:not([disabled])",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

function getDefaultErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "保存失败，已恢复原值";
}

function InlineEdit<T>({
  label,
  value,
  defaultValue,
  onValueChange,
  onCommit,
  onCommitError,
  renderValue,
  editor,
  open,
  defaultOpen = false,
  onOpenChange,
  state,
  errorMessage,
  getErrorMessage = getDefaultErrorMessage,
  disabled = false,
  readOnly = false,
  closeOnCommit = "start",
  align = "start",
  sideOffset = 6,
  panelClassName,
  triggerClassName,
  popupRole = "dialog",
  className,
  ...props
}: InlineEditProps<T>) {
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const commitIdRef = useRef(0);
  const savedTimerRef = useRef<number | undefined>(undefined);
  const currentValueRef = useRef<T>((value ?? defaultValue) as T);
  const [internalValue, setInternalValue] = useState<T>((value ?? defaultValue) as T);
  const [optimisticValue, setOptimisticValue] = useState<T | undefined>(undefined);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalState, setInternalState] = useState<InlineEditState>("idle");
  const [internalError, setInternalError] = useState<ReactNode>(null);
  const [position, setPosition] = useState<FloatingPosition>({ left: 0, top: 0, side: "bottom", ready: false });
  const reduceMotion = useReducedMotion();
  const isOpen = open ?? internalOpen;
  const currentState = state ?? internalState;
  const currentError = errorMessage ?? internalError;
  const currentValue = optimisticValue ?? (value !== undefined ? value : internalValue);
  currentValueRef.current = currentValue;

  const setOpen = useCallback((nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (nextOpen && state === undefined && internalState === "error") {
      setInternalState("idle");
      setInternalError(null);
    }
  }, [internalState, onOpenChange, open, state]);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [setOpen]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const triggerRect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const viewportPadding = 8;
    const availableBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
    const availableAbove = triggerRect.top - viewportPadding;
    const side = panelRect.height > availableBelow && availableAbove > availableBelow ? "top" : "bottom";
    const preferredLeft = align === "end"
      ? triggerRect.right - panelRect.width
      : align === "center"
        ? triggerRect.left + (triggerRect.width - panelRect.width) / 2
        : triggerRect.left;
    const maximumLeft = Math.max(viewportPadding, window.innerWidth - panelRect.width - viewportPadding);
    const left = clamp(preferredLeft, viewportPadding, maximumLeft);
    const preferredTop = side === "top"
      ? triggerRect.top - panelRect.height - sideOffset
      : triggerRect.bottom + sideOffset;
    const maximumTop = Math.max(viewportPadding, window.innerHeight - panelRect.height - viewportPadding);
    const top = clamp(preferredTop, viewportPadding, maximumTop);

    setPosition({ left, top, side, ready: true });
  }, [align, sideOffset]);

  const commit = useCallback(async (nextValue: T) => {
    const previousValue = currentValueRef.current;
    const commitId = commitIdRef.current + 1;
    commitIdRef.current = commitId;
    setOptimisticValue(nextValue);
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    if (state === undefined) {
      setInternalState("saving");
      setInternalError(null);
    }
    if (closeOnCommit === "start") close(true);

    try {
      await onCommit?.(nextValue, previousValue);
      if (!mountedRef.current || commitIdRef.current !== commitId) return false;
      setOptimisticValue(undefined);
      if (state === undefined) {
        setInternalState("saved");
        window.clearTimeout(savedTimerRef.current);
        savedTimerRef.current = window.setTimeout(() => {
          if (mountedRef.current) setInternalState("idle");
        }, 1_400);
      }
      if (closeOnCommit === "success") close(true);
      return true;
    } catch (error) {
      if (!mountedRef.current || commitIdRef.current !== commitId) return false;
      setOptimisticValue(undefined);
      if (value === undefined) setInternalValue(previousValue);
      onValueChange?.(previousValue);
      if (state === undefined) {
        setInternalState("error");
        setInternalError(getErrorMessage(error));
      }
      onCommitError?.(error, nextValue, previousValue);
      return false;
    }
  }, [close, closeOnCommit, getErrorMessage, onCommit, onCommitError, onValueChange, state, value]);

  useEffect(() => {
    if (value !== undefined && currentState !== "saving") setOptimisticValue(undefined);
  }, [currentState, value]);

  useEffect(() => () => {
    mountedRef.current = false;
    window.clearTimeout(savedTimerRef.current);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition((current) => current.ready ? { ...current, ready: false } : current);
      return;
    }
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updatePosition);
    if (panelRef.current) observer?.observe(panelRef.current);
    if (triggerRef.current) observer?.observe(triggerRef.current);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });
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
  }, [close, isOpen, updatePosition]);

  const statusLabel = currentState === "saving"
    ? "正在保存"
    : currentState === "saved"
      ? "已保存"
      : currentState === "error"
        ? String(currentError ?? "保存失败")
        : "";
  const canEdit = !disabled && !readOnly;
  const portal = typeof document === "undefined" ? null : createPortal(
    <AnimatePresence>
      {isOpen && canEdit ? (
        <motion.div
          ref={panelRef}
          id={panelId}
          role={popupRole}
          aria-label={label}
          aria-modal="false"
          data-slot="inline-edit-popover"
          data-side={position.side}
          initial={reduceMotion ? false : { opacity: 0, y: position.side === "top" ? 4 : -4, scale: 0.985 }}
          animate={{ opacity: position.ready ? 1 : 0, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: position.side === "top" ? 2 : -2, scale: 0.99 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 760, damping: 52, mass: 0.7 }}
          className="fixed z-50 origin-top-left outline-none"
          style={{ left: position.left, top: position.top, visibility: position.ready ? "visible" : "hidden" }}
        >
          <Surface
            variant="raised"
            className={cn(
              "w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border-surface-border/85 bg-surface-raised shadow-[var(--menu-shadow)] ring-1 ring-foreground/5",
              panelClassName,
            )}
          >
            {editor({ value: currentValue, state: currentState, error: currentError, commit, close })}
          </Surface>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div data-slot="inline-edit" className={cn("inline-flex min-w-0 max-w-full items-center", className)} {...props}>
      <button
        ref={triggerRef}
        type="button"
        disabled={!canEdit}
        aria-label={canEdit ? `编辑${label}` : label}
        aria-haspopup={popupRole}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-invalid={currentState === "error" || undefined}
        data-open={isOpen ? "" : undefined}
        data-state={currentState}
        className={cn(
          "group/inline-edit inline-flex min-h-7 min-w-0 max-w-full items-center gap-1.5 rounded-md px-1.5 text-left text-xs text-foreground outline-none transition-[color,background-color,box-shadow,transform] hover:bg-surface-hover focus-visible:ring-3 focus-visible:ring-ring/35 active:translate-y-px disabled:cursor-default disabled:opacity-70 disabled:hover:bg-transparent data-[open]:bg-surface-selected data-[state=error]:text-destructive",
          triggerClassName,
        )}
        onClick={() => {
          if (!canEdit) return;
          setOpen(!isOpen);
        }}
        onKeyDown={(event) => {
          if (!canEdit) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="min-w-0 truncate">{renderValue(currentValue, currentState)}</span>
        <span className="flex size-3.5 shrink-0 items-center justify-center" aria-hidden>
          {currentState === "saving" ? <LoaderCircle className="size-3 animate-spin text-muted-foreground" /> : null}
          {currentState === "saved" ? <Check className="size-3 text-success-foreground" /> : null}
          {currentState === "error" ? <CircleAlert className="size-3 text-destructive" /> : null}
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{statusLabel}</span>
      {portal}
    </div>
  );
}

interface InlineEditOption {
  value: string;
  label: ReactNode;
  textValue?: string;
  description?: ReactNode;
  visual?: ReactNode;
  keywords?: string[];
  disabled?: boolean;
}

type InlineEditSelectValue = string | string[];

interface InlineEditSelectProps extends Omit<InlineEditProps<InlineEditSelectValue>, "editor" | "renderValue" | "popupRole" | "closeOnCommit"> {
  options: InlineEditOption[];
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  placeholder?: ReactNode;
  emptyMessage?: ReactNode;
  renderValue?: (selectedOptions: InlineEditOption[], state: InlineEditState) => ReactNode;
  createOption?: (query: string) => InlineEditOption | Promise<InlineEditOption>;
  renderCreateLabel?: (query: string) => ReactNode;
}

interface InlineEditSelectEditorProps {
  label: string;
  context: InlineEditEditorContext<InlineEditSelectValue>;
  options: InlineEditOption[];
  multiple: boolean;
  searchable: boolean;
  searchPlaceholder: string;
  emptyMessage: ReactNode;
  createOption?: (query: string) => InlineEditOption | Promise<InlineEditOption>;
  renderCreateLabel: (query: string) => ReactNode;
  onOptionCreated: (option: InlineEditOption) => void;
}

const getOptionText = (option: InlineEditOption) => (
  option.textValue ?? (typeof option.label === "string" || typeof option.label === "number" ? String(option.label) : option.value)
);

const normalizeSelectedValues = (value: InlineEditSelectValue, multiple: boolean) => (
  multiple ? (Array.isArray(value) ? value : value ? [value] : []) : [Array.isArray(value) ? value[0] ?? "" : value]
);

function InlineEditSelectEditor({
  label,
  context,
  options,
  multiple,
  searchable,
  searchPlaceholder,
  emptyMessage,
  createOption,
  renderCreateLabel,
  onOptionCreated,
}: InlineEditSelectEditorProps) {
  const listboxId = useId();
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const [query, setQuery] = useState("");
  const [activeValue, setActiveValue] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const selectedValues = normalizeSelectedValues(context.value, multiple);
  const selectedValueSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const visibleOptions = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((option) => [getOptionText(option), option.value, ...(option.keywords ?? [])]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
      .includes(normalizedQuery));
  }, [normalizedQuery, options]);
  const enabledOptions = visibleOptions.filter((option) => !option.disabled);
  const exactMatch = options.some((option) => getOptionText(option).toLocaleLowerCase("zh-CN") === normalizedQuery);
  const canCreate = Boolean(createOption && query.trim() && !exactMatch);

  useEffect(() => {
    if (activeValue && enabledOptions.some((option) => option.value === activeValue)) return;
    setActiveValue(enabledOptions.find((option) => selectedValueSet.has(option.value))?.value ?? enabledOptions[0]?.value);
  }, [activeValue, enabledOptions, selectedValueSet]);

  const selectOption = (option: InlineEditOption) => {
    if (option.disabled) return;
    const nextValue = multiple
      ? selectedValueSet.has(option.value)
        ? selectedValues.filter((selectedValue) => selectedValue !== option.value)
        : [...selectedValues, option.value]
      : option.value;
    void context.commit(nextValue);
  };

  const moveActive = (event: KeyboardEvent<HTMLElement>, offset: number, moveFocus: boolean) => {
    if (enabledOptions.length === 0) return;
    event.preventDefault();
    const currentIndex = enabledOptions.findIndex((option) => option.value === activeValue);
    const nextIndex = currentIndex < 0
      ? offset > 0 ? 0 : enabledOptions.length - 1
      : (currentIndex + offset + enabledOptions.length) % enabledOptions.length;
    const nextValue = enabledOptions[nextIndex]!.value;
    setActiveValue(nextValue);
    if (moveFocus) window.requestAnimationFrame(() => optionRefs.current.get(nextValue)?.focus());
  };

  const handleCreate = async () => {
    if (!createOption || !query.trim() || creating) return;
    setCreating(true);
    try {
      const option = await createOption(query.trim());
      onOptionCreated(option);
      const nextValue = multiple ? [...selectedValues, option.value] : option.value;
      await context.commit(nextValue);
      setQuery("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div data-slot="inline-edit-select-editor">
      {searchable ? (
        <div className="border-b border-border p-2">
          <input
            autoFocus
            type="search"
            role="combobox"
            aria-label={`${label}搜索`}
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeValue ? `${listboxId}-${activeValue}` : undefined}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") moveActive(event, 1, false);
              if (event.key === "ArrowUp") moveActive(event, -1, false);
              if (event.key === "Enter") {
                const activeOption = enabledOptions.find((option) => option.value === activeValue);
                if (activeOption) {
                  event.preventDefault();
                  selectOption(activeOption);
                } else if (canCreate) {
                  event.preventDefault();
                  void handleCreate();
                }
              }
            }}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-lg bg-muted/55 px-2.5 text-xs text-foreground outline-none ring-1 ring-transparent placeholder:text-muted-foreground focus:ring-ring/40"
          />
        </div>
      ) : null}
      <div id={listboxId} role="listbox" aria-label={label} aria-multiselectable={multiple || undefined} className="max-h-72 overflow-y-auto p-1.5">
        {visibleOptions.map((option) => {
          const selected = selectedValueSet.has(option.value);
          const active = activeValue === option.value;
          return (
            <button
              key={option.value}
              ref={(element) => {
                if (element) optionRefs.current.set(option.value, element);
                else optionRefs.current.delete(option.value);
              }}
              id={`${listboxId}-${option.value}`}
              type="button"
              role="option"
              aria-selected={selected}
              disabled={option.disabled}
              tabIndex={searchable ? -1 : active ? 0 : -1}
              data-active={active ? "" : undefined}
              className="group/inline-option flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-xs outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-selected focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-45 data-[active]:bg-surface-hover aria-selected:font-medium"
              onMouseEnter={() => setActiveValue(option.value)}
              onFocus={() => setActiveValue(option.value)}
              onClick={() => selectOption(option)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") moveActive(event, 1, true);
                if (event.key === "ArrowUp") moveActive(event, -1, true);
                if (event.key === "Home" && enabledOptions[0]) {
                  event.preventDefault();
                  setActiveValue(enabledOptions[0].value);
                  optionRefs.current.get(enabledOptions[0].value)?.focus();
                }
                if (event.key === "End" && enabledOptions.at(-1)) {
                  event.preventDefault();
                  const lastOption = enabledOptions.at(-1)!;
                  setActiveValue(lastOption.value);
                  optionRefs.current.get(lastOption.value)?.focus();
                }
              }}
            >
              {option.visual ? <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden>{option.visual}</span> : null}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{option.label}</span>
                {option.description ? <span className="mt-0.5 block truncate text-micro font-normal text-muted-foreground">{option.description}</span> : null}
              </span>
              <span className="flex size-4 shrink-0 items-center justify-center text-foreground" aria-hidden>
                {selected ? <Check className="size-3.5 stroke-[2.5]" /> : null}
              </span>
            </button>
          );
        })}
        {visibleOptions.length === 0 && !canCreate ? <p className="px-3 py-8 text-center text-xs text-muted-foreground">{emptyMessage}</p> : null}
        {canCreate ? (
          <button
            type="button"
            disabled={creating}
            className="mt-1 flex min-h-9 w-full items-center gap-2 rounded-lg border-t border-border px-2.5 pt-2 text-left text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
            onClick={() => void handleCreate()}
          >
            {creating ? <LoaderCircle className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            <span className="truncate">{renderCreateLabel(query.trim())}</span>
          </button>
        ) : null}
      </div>
      {context.state === "error" && context.error ? <p role="alert" className="border-t border-destructive/15 bg-destructive/5 px-3 py-2 text-micro text-destructive">{context.error}</p> : null}
    </div>
  );
}

function InlineEditSelect({
  options,
  multiple = false,
  searchable = false,
  searchPlaceholder = "搜索选项…",
  placeholder = "未设置",
  emptyMessage = "没有匹配选项",
  renderValue,
  createOption,
  renderCreateLabel = (query) => `创建“${query}”`,
  value,
  defaultValue,
  panelClassName,
  ...props
}: InlineEditSelectProps) {
  const [createdOptions, setCreatedOptions] = useState<InlineEditOption[]>([]);
  const allOptions = useMemo(() => {
    const baseValues = new Set(options.map((option) => option.value));
    return [...options, ...createdOptions.filter((option) => !baseValues.has(option.value))];
  }, [createdOptions, options]);
  const fallbackValue: InlineEditSelectValue = defaultValue ?? (multiple ? [] : "");

  return (
    <InlineEdit<InlineEditSelectValue>
      {...props}
      value={value}
      defaultValue={fallbackValue}
      popupRole="dialog"
      closeOnCommit={multiple ? "never" : "start"}
      panelClassName={cn("w-64", panelClassName)}
      renderValue={(currentValue, currentState) => {
        const selectedValueSet = new Set(normalizeSelectedValues(currentValue, multiple));
        const selectedOptions = allOptions.filter((option) => selectedValueSet.has(option.value));
        if (renderValue) return renderValue(selectedOptions, currentState);
        if (selectedOptions.length === 0) return <span className="text-muted-foreground">{placeholder}</span>;
        return <>{selectedOptions.map((option) => option.label).reduce<ReactNode[]>((result, item, index) => (
          index === 0 ? [item] : [...result, ", ", item]
        ), [])}</>;
      }}
      editor={(context) => (
        <InlineEditSelectEditor
          label={props.label}
          context={context}
          options={allOptions}
          multiple={multiple}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          emptyMessage={emptyMessage}
          createOption={createOption}
          renderCreateLabel={renderCreateLabel}
          onOptionCreated={(option) => setCreatedOptions((current) => (
            current.some((item) => item.value === option.value) ? current : [...current, option]
          ))}
        />
      )}
    />
  );
}

export { InlineEdit, InlineEditSelect };
export type {
  InlineEditAlign,
  InlineEditCloseStrategy,
  InlineEditEditorContext,
  InlineEditOption,
  InlineEditProps,
  InlineEditSelectProps,
  InlineEditSelectValue,
  InlineEditState,
};
