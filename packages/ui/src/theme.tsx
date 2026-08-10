/**
 * [INPUT]: 依赖浏览器 localStorage、matchMedia、DOM 根节点与 React 状态
 * [OUTPUT]: 对外提供 Theme 类型、主题初始化/应用函数和 ThemeToggle 控件
 * [POS]: ui/src 的平台无关主题边界，统一 system/light/dark 行为而不感知具体 Token 数值
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "./primitives";

type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "dionysus-ui-theme";

const resolveTheme = (theme: Theme): "light" | "dark" => (
  theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : theme
);

const applyTheme = (theme: Theme) => {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  document.documentElement.dataset.theme = theme;
};

const getStoredTheme = (): Theme => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
};

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme("system");
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);

  const next: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
  const label: Record<Theme, string> = { system: "跟随系统", light: "浅色", dark: "深色" };
  const Icon = theme === "system" ? Laptop : theme === "light" ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`当前主题：${label[theme]}，点击切换`}
      title={`当前：${label[theme]}`}
      onClick={() => setTheme(next[theme])}
    >
      <Icon />
    </Button>
  );
}

export { ThemeToggle, applyTheme, getStoredTheme };
export type { Theme };
