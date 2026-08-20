/**
 * [INPUT]: 依赖 React 状态/DOM 副作用、设计系统勾选/层级图标、Surface 与 cn 类名工具
 * [OUTPUT]: 对外提供可搜索、可多选、可触发指令项的 DropdownMenu 浮层组件
 * [POS]: ui/src 的高级浮层原语，复用 Raised Surface、语义 Token 与平台无关交互，不感知业务数据
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "./cn";
import { Check, ChevronRight } from "./icons";
import { Surface } from "./primitives";

type DropdownMenuAvatarTone = "violet" | "blue" | "amber" | "teal" | "rose" | "neutral";

interface DropdownMenuAvatarConfig {
  name?: string;
  initials?: string;
  src?: string;
  icon?: ReactNode;
  tone?: DropdownMenuAvatarTone;
  className?: string;
}

interface DropdownMenuBaseItem {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  visual?: ReactNode | DropdownMenuAvatarConfig;
  count?: ReactNode;
  shortcut?: ReactNode;
  keywords?: string[];
  disabled?: boolean;
  className?: string;
}

interface DropdownMenuOptionItem extends DropdownMenuBaseItem {
  type?: "option";
  selected?: boolean;
}

interface DropdownMenuCommandItem extends DropdownMenuBaseItem {
  type: "command";
  nested?: boolean;
  closeOnSelect?: boolean;
}

type DropdownMenuItem = DropdownMenuOptionItem | DropdownMenuCommandItem;

interface DropdownMenuGroup {
  label?: ReactNode;
  items: DropdownMenuItem[];
}

interface DropdownMenuTriggerProps {
  ref: Ref<HTMLButtonElement>;
  type: "button";
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

interface DropdownMenuProps extends Omit<ComponentPropsWithoutRef<"div">, "onSelect"> {
  label: string;
  groups: DropdownMenuGroup[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: (props: DropdownMenuTriggerProps) => ReactNode;
  position?: "absolute" | "static";
  align?: "start" | "end";
  multiple?: boolean;
  activeValue?: string;
  defaultActiveValue?: string;
  onActiveValueChange?: (value: string | undefined) => void;
  selectedValues?: string[];
  defaultSelectedValues?: string[];
  onSelectedValuesChange?: (values: string[], item: DropdownMenuOptionItem) => void;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchValueChange?: (value: string) => void;
  clearSearchOnClose?: boolean;
  searchPlaceholder?: string;
  searchShortcut?: ReactNode;
  emptyMessage?: ReactNode;
  panelClassName?: string;
  listClassName?: string;
  queryMatcher?: (item: DropdownMenuItem, query: string) => boolean;
  onItemSelect?: (item: DropdownMenuItem) => void;
  onCommandSelect?: (item: DropdownMenuCommandItem) => void;
}

const avatarToneClassName: Record<DropdownMenuAvatarTone, string> = {
  violet: "bg-avatar-violet text-avatar-violet-foreground",
  blue: "bg-avatar-blue text-avatar-blue-foreground",
  amber: "bg-avatar-amber text-avatar-amber-foreground",
  teal: "bg-avatar-teal text-avatar-teal-foreground",
  rose: "bg-avatar-rose text-avatar-rose-foreground",
  neutral: "bg-muted text-muted-foreground",
};

const isCommandItem = (item: DropdownMenuItem): item is DropdownMenuCommandItem => item.type === "command";

const getItemKey = (item: DropdownMenuItem) => `${isCommandItem(item) ? "command" : "option"}:${item.value}`;

const normalizeQuery = (value: string) => value.trim().toLocaleLowerCase("zh-CN");

const getSearchableText = (value: ReactNode): string => (
  typeof value === "string" || typeof value === "number" ? String(value) : ""
);

const isDropdownMenuAvatarConfig = (visual: ReactNode | DropdownMenuAvatarConfig): visual is DropdownMenuAvatarConfig => (
  typeof visual === "object"
  && visual !== null
  && ("src" in visual || "icon" in visual || "initials" in visual || "name" in visual || "tone" in visual)
);

const defaultQueryMatcher = (item: DropdownMenuItem, query: string) => {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return true;
  return [
    getSearchableText(item.label),
    getSearchableText(item.description),
    item.value,
    ...(item.keywords ?? []),
  ].join(" ").toLocaleLowerCase("zh-CN").includes(normalizedQuery);
};

const collectInitiallySelectedValues = (groups: DropdownMenuGroup[]) => (
  groups.flatMap((group) => group.items)
    .filter((item): item is DropdownMenuOptionItem => !isCommandItem(item) && Boolean(item.selected))
    .map((item) => item.value)
);

function DropdownMenuAvatar({ visual }: { visual?: ReactNode | DropdownMenuAvatarConfig }) {
  if (!visual) return <span className="size-8 shrink-0" aria-hidden />;
  if (!isDropdownMenuAvatarConfig(visual)) {
    return <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full">{visual}</span>;
  }

  const { name, initials, src, icon, tone = "neutral", className } = visual;
  const fallback = initials ?? name?.trim().split(/\s+/u).map((part) => part[0]).join("").slice(0, 2).toUpperCase() ?? "";

  if (src) {
    return (
      <span className={cn("flex size-8 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-foreground/6", className)}>
        <img src={src} alt={name ?? ""} className="size-full object-cover" />
      </span>
    );
  }

  return (
    <span
      aria-hidden={name ? undefined : true}
      aria-label={name}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ring-1 ring-foreground/6 [&>svg]:size-5",
        avatarToneClassName[tone],
        className,
      )}
    >
      {icon ?? fallback}
    </span>
  );
}

function DropdownMenu({
  label,
  groups,
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  position = "absolute",
  align = "start",
  multiple = false,
  activeValue,
  defaultActiveValue,
  onActiveValueChange,
  selectedValues,
  defaultSelectedValues,
  onSelectedValuesChange,
  searchValue,
  defaultSearchValue = "",
  onSearchValueChange,
  clearSearchOnClose = true,
  searchPlaceholder = "Search...",
  searchShortcut,
  emptyMessage = "没有匹配结果",
  panelClassName,
  listClassName,
  queryMatcher = defaultQueryMatcher,
  onItemSelect,
  onCommandSelect,
  className,
  onBlur,
  ...props
}: DropdownMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalSearchValue, setInternalSearchValue] = useState(defaultSearchValue);
  const [internalSelectedValues, setInternalSelectedValues] = useState(
    () => defaultSelectedValues ?? collectInitiallySelectedValues(groups),
  );
  const [internalActiveValue, setInternalActiveValue] = useState<string | undefined>(
    () => defaultActiveValue ?? groups.flatMap((group) => group.items).find((item) => !item.disabled)?.value,
  );

  const isOpen = open ?? internalOpen;
  const wasOpenRef = useRef(isOpen);
  const query = searchValue ?? internalSearchValue;
  const currentActiveValue = activeValue ?? internalActiveValue;
  const currentSelectedValues = selectedValues ?? internalSelectedValues;
  const selectedValueSet = useMemo(() => new Set(currentSelectedValues), [currentSelectedValues]);
  const visibleGroups = useMemo(() => (
    groups
      .map((group) => ({ ...group, items: group.items.filter((item) => queryMatcher(item, query)) }))
      .filter((group) => group.items.length > 0)
  ), [groups, query, queryMatcher]);
  const visibleItems = useMemo(() => visibleGroups.flatMap((group) => group.items), [visibleGroups]);
  const itemIdByKey = useMemo(() => (
    new Map(visibleItems.map((item, index) => [getItemKey(item), `${menuId}-item-${index}`]))
  ), [menuId, visibleItems]);
  const activeItem = visibleItems.find((item) => item.value === currentActiveValue && !item.disabled);
  const activeItemId = activeItem ? itemIdByKey.get(getItemKey(activeItem)) : undefined;

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const closeMenu = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const setQuery = (nextQuery: string) => {
    if (searchValue === undefined) setInternalSearchValue(nextQuery);
    onSearchValueChange?.(nextQuery);
  };

  const updateSelectedValues = (nextValues: string[], item: DropdownMenuOptionItem) => {
    if (selectedValues === undefined) setInternalSelectedValues(nextValues);
    onSelectedValuesChange?.(nextValues, item);
  };

  const setActiveValue = (nextValue: string | undefined) => {
    if (activeValue === undefined) setInternalActiveValue(nextValue);
    onActiveValueChange?.(nextValue);
  };

  const focusItem = (startIndex: number, direction: 1 | -1 = 1) => {
    if (visibleItems.length === 0) return;
    let index = startIndex;
    for (let checked = 0; checked < visibleItems.length; checked += 1) {
      const item = visibleItems[(index + visibleItems.length) % visibleItems.length]!;
      if (!item.disabled) {
        setActiveValue(item.value);
        itemRefs.current.get(getItemKey(item))?.focus();
        return;
      }
      index += direction;
    }
  };

  const focusRelativeItem = (event: KeyboardEvent<HTMLElement>, direction: 1 | -1) => {
    event.preventDefault();
    const focusedItemIndex = visibleItems.findIndex((item) => itemRefs.current.get(getItemKey(item)) === document.activeElement);
    if (focusedItemIndex >= 0) {
      focusItem(focusedItemIndex + direction, direction);
      return;
    }
    if (direction === 1) {
      const activeIndex = visibleItems.findIndex((item) => item.value === currentActiveValue && !item.disabled);
      focusItem(activeIndex >= 0 ? activeIndex : 0, 1);
      return;
    }
    focusItem(visibleItems.length - 1, -1);
  };

  const selectItem = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    onItemSelect?.(item);

    if (isCommandItem(item)) {
      onCommandSelect?.(item);
      if (item.closeOnSelect) closeMenu(true);
      return;
    }

    const alreadySelected = selectedValueSet.has(item.value);
    const nextValues = multiple
      ? alreadySelected
        ? currentSelectedValues.filter((value) => value !== item.value)
        : [...currentSelectedValues, item.value]
      : [item.value];

    updateSelectedValues(nextValues, item);
    if (!multiple) closeMenu(true);
  };

  const handleItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, item: DropdownMenuItem) => {
    if (event.key === "ArrowDown") focusRelativeItem(event, 1);
    if (event.key === "ArrowUp") focusRelativeItem(event, -1);
    if (event.key === "Home") {
      event.preventDefault();
      focusItem(0, 1);
    }
    if (event.key === "End") {
      event.preventDefault();
      focusItem(visibleItems.length - 1, -1);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectItem(item);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
    }
  };

  useEffect(() => {
    if (!isOpen || position === "static") return;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) closeMenu(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, position]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => searchRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const activeItemVisible = visibleItems.some((item) => item.value === currentActiveValue && !item.disabled);
    if (activeItemVisible) return;
    setActiveValue(visibleItems.find((item) => !item.disabled)?.value);
  }, [currentActiveValue, isOpen, visibleItems]);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    if (wasOpen && !isOpen && clearSearchOnClose && searchValue === undefined) setInternalSearchValue("");
    wasOpenRef.current = isOpen;
  }, [clearSearchOnClose, isOpen, searchValue]);

  const renderedTrigger = trigger?.({
    ref: triggerRef,
    type: "button",
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": menuId,
    onClick: () => setOpen(!isOpen),
    onKeyDown: (event) => {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        closeMenu(false);
        return;
      }
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
      }
    },
  });

  const panel = (
    <Surface
      variant="raised"
      data-slot="dropdown-menu"
      className={cn(
        "dropdown-menu-enter w-[25.75rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.375rem] border-surface-border/75 bg-surface-raised text-surface-foreground shadow-[var(--floating-shadow)] ring-1 ring-foreground/5",
        panelClassName,
      )}
    >
      <div data-slot="dropdown-menu-search" className="flex h-[4.75rem] items-center gap-3 px-7">
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") focusRelativeItem(event, 1);
            if (event.key === "Enter" && currentActiveValue) {
              const activeItem = visibleItems.find((item) => item.value === currentActiveValue);
              if (activeItem) {
                event.preventDefault();
                selectItem(activeItem);
              }
            }
            if (event.key === "Escape") {
              event.preventDefault();
              closeMenu(true);
            }
          }}
          aria-label={`${label} 搜索`}
          aria-controls={menuId}
          aria-activedescendant={activeItemId}
          placeholder={searchPlaceholder}
          className="h-full min-w-0 flex-1 bg-transparent text-[1.55rem] font-normal leading-tight text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        {searchShortcut ? (
          <kbd className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/80 font-mono text-xl leading-none text-muted-foreground shadow-[var(--surface-shadow)]">
            {searchShortcut}
          </kbd>
        ) : null}
      </div>
      <div
        id={menuId}
        role="menu"
        aria-label={label}
        data-slot="dropdown-menu-list"
        className={cn("max-h-[min(52rem,calc(100vh-5rem))] overflow-y-auto px-3 pb-3", listClassName)}
      >
        {visibleGroups.map((group, groupIndex) => {
          const groupId = `${menuId}-group-${groupIndex}`;
          return (
            <div key={groupId} role="group" aria-labelledby={group.label ? groupId : undefined} data-slot="dropdown-menu-group">
              {group.label ? (
                <div id={groupId} data-slot="dropdown-menu-group-label" className="px-4 pb-1.5 pt-3 text-[1.35rem] font-medium leading-7 text-muted-foreground">
                  {group.label}
                </div>
              ) : null}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const key = getItemKey(item);
                  const itemId = itemIdByKey.get(key);
                  const selected = !isCommandItem(item) && selectedValueSet.has(item.value);
                  const active = item.value === currentActiveValue;
                  return (
                    <button
                      key={key}
                      id={itemId}
                      ref={(element) => {
                        if (element) itemRefs.current.set(key, element);
                        else itemRefs.current.delete(key);
                      }}
                      type="button"
                      role={isCommandItem(item) ? "menuitem" : "menuitemcheckbox"}
                      aria-checked={isCommandItem(item) ? undefined : selected}
                      tabIndex={active ? 0 : -1}
                      disabled={item.disabled}
                      data-slot="dropdown-menu-item"
                      data-active={active ? "" : undefined}
                      data-selected={selected ? "" : undefined}
                      className={cn(
                        "group/dropdown-item flex h-16 w-full items-center gap-4 rounded-xl px-4 text-left text-[1.55rem] leading-tight text-foreground outline-none transition-colors hover:bg-surface-selected focus-visible:bg-surface-selected focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-45 data-[active]:bg-surface-selected data-[selected]:font-medium",
                        item.className,
                      )}
                      onFocus={() => setActiveValue(item.value)}
                      onMouseEnter={() => setActiveValue(item.value)}
                      onClick={() => selectItem(item)}
                      onKeyDown={(event) => handleItemKeyDown(event, item)}
                    >
                      <DropdownMenuAvatar visual={item.visual} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <span className="ml-auto flex min-w-12 shrink-0 items-center justify-end gap-5 text-[1.35rem] font-normal text-muted-foreground tabular-nums">
                        {selected ? <Check aria-hidden className="size-6 stroke-[3]" /> : null}
                        {item.count !== undefined && item.count !== null ? <span>{item.count}</span> : null}
                        {item.shortcut !== undefined && item.shortcut !== null ? <span>{item.shortcut}</span> : null}
                        {isCommandItem(item) && item.nested ? <ChevronRight aria-hidden className="size-5" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {visibleItems.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : null}
      </div>
    </Surface>
  );

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block text-left", className)}
      onBlur={(event) => {
        onBlur?.(event);
        if (!isOpen || position === "static") return;
        const nextFocusedElement = event.relatedTarget;
        if (nextFocusedElement instanceof Node) {
          if (!event.currentTarget.contains(nextFocusedElement)) closeMenu(false);
          return;
        }
        window.setTimeout(() => {
          if (!rootRef.current?.contains(document.activeElement)) closeMenu(false);
        }, 0);
      }}
      {...props}
    >
      {renderedTrigger}
      {isOpen ? (
        position === "static" ? panel : (
          <div className={cn("absolute top-full z-50 mt-2", align === "end" ? "right-0" : "left-0")}>
            {panel}
          </div>
        )
      ) : null}
    </div>
  );
}

export { DropdownMenu };
export type {
  DropdownMenuAvatarConfig,
  DropdownMenuAvatarTone,
  DropdownMenuCommandItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuOptionItem,
  DropdownMenuProps,
  DropdownMenuTriggerProps,
};
