/**
 * [INPUT]: 依赖 React 受控进度/生命周期、IntersectionObserver 与 styles.css 的 Rainbow Loading 动效契约
 * [OUTPUT]: 对外提供 RainbowProgress、RainbowSweep、默认色板与可复用的加载完成转场参数
 * [POS]: ui/src 的轻量 CSS 动效原语，用连续彩虹进度与一次性掠过表达真实加载及完成交接
 * [PROTOCOL]: 变更时更新此头部，然后检查 docs/DESIGN_SYSTEM.md
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { cn } from "./cn";

const RAINBOW_PROGRESS_COLORS = [
  "#E53935",
  "#E65100",
  "#F4A300",
  "#FFD700",
  "#388E3C",
  "#3D8B68",
  "#00A78E",
  "#0277BD",
  "#1976D2",
  "#3F51B5",
  "#5E35B1",
  "#D81B60",
] as const;

// Reconstructed source colors for the full-screen layer from the composited
// samples in docs/reference-analysis/rainbow-loading/alignment-report.md.
const RAINBOW_SWEEP_COLORS = [
  "#CEAECE",
  "#BBBAF5",
  "#B0C7FB",
  "#58BBE7",
  "#76E061",
  "#E0BB4E",
  "#F0B576",
] as const;

const DEFAULT_PROGRESS_CYCLE = 160;
const DEFAULT_RIBBON_DURATION = 3_200;
const DEFAULT_SHEEN_DURATION = 5_600;
const DEFAULT_SWEEP_DURATION = 660;

type RainbowStyle = CSSProperties & Record<`--rainbow-${string}`, string | number>;

type RainbowProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  value: number;
  max?: number;
  label?: string;
  colors?: readonly string[];
  cycleWidth?: number;
  ribbonDuration?: number;
  sheenDuration?: number;
  transitionDuration?: number;
  animateOnMount?: boolean;
  paused?: boolean;
  indicatorClassName?: string;
};

type RainbowSweepDirection = "left-to-right" | "right-to-left";
type RainbowSweepMode = "viewport" | "container";

type RainbowSweepProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onAnimationEnd"> & {
  active?: boolean;
  direction?: RainbowSweepDirection;
  mode?: RainbowSweepMode;
  colors?: readonly string[];
  duration?: number;
  intensity?: number;
  blur?: number;
  saturation?: number;
  onComplete?: () => void;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function finitePositive(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function progressSpectrum(colors: readonly string[], cycleWidth: number): string {
  const palette = colors.length >= 2 ? colors : RAINBOW_PROGRESS_COLORS;
  const stops = palette.map((color, index) => {
    const position = (index / palette.length) * cycleWidth;
    return `${color} ${position.toFixed(2)}px`;
  });
  stops.push(`${palette[0]} ${cycleWidth}px`);
  return `repeating-linear-gradient(90deg, ${stops.join(", ")})`;
}

function sweepSpectrum(colors: readonly string[]): string {
  const palette = colors.length >= 2 ? colors : RAINBOW_SWEEP_COLORS;
  const lastIndex = palette.length - 1;
  const stops = palette.map((color, index) => `${color} ${((index / lastIndex) * 100).toFixed(2)}%`);
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

function progressTransitionDuration(previous: number, next: number): number {
  if (previous === 0 && next > 0 && next <= 0.3) return 520;
  return Math.round(clamp(6_200 * Math.abs(next - previous), 1_800, 4_200));
}

const RainbowProgress = forwardRef<HTMLDivElement, RainbowProgressProps>(function RainbowProgress(
  {
    value,
    max = 100,
    label = "Loading progress",
    colors = RAINBOW_PROGRESS_COLORS,
    cycleWidth = DEFAULT_PROGRESS_CYCLE,
    ribbonDuration = DEFAULT_RIBBON_DURATION,
    sheenDuration = DEFAULT_SHEEN_DURATION,
    transitionDuration,
    animateOnMount = true,
    paused = false,
    indicatorClassName,
    className,
    style,
    "aria-label": ariaLabel,
    ...props
  },
  forwardedRef,
) {
  const safeMax = finitePositive(max, 100);
  const safeValue = Number.isFinite(value) ? clamp(value, 0, safeMax) : 0;
  const targetProgress = safeValue / safeMax;
  const [visualProgress, setVisualProgress] = useState(() => (animateOnMount ? 0 : targetProgress));
  const [transitionMs, setTransitionMs] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const previousTargetRef = useRef(animateOnMount ? 0 : targetProgress);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  useEffect(() => {
    if (targetProgress === previousTargetRef.current) return;
    const duration = transitionDuration === undefined
      ? progressTransitionDuration(previousTargetRef.current, targetProgress)
      : finitePositive(transitionDuration, 1);
    setTransitionMs(duration);
    const frame = window.requestAnimationFrame(() => {
      previousTargetRef.current = targetProgress;
      setVisualProgress(targetProgress);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [targetProgress, transitionDuration]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry?.isIntersecting ?? true));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const safeCycleWidth = finitePositive(cycleWidth, DEFAULT_PROGRESS_CYCLE);
  const componentStyle: RainbowStyle = {
    ...style,
    "--rainbow-progress-value": `${visualProgress * 100}%`,
    "--rainbow-progress-transition-duration": `${transitionMs}ms`,
    "--rainbow-progress-cycle": `${safeCycleWidth}px`,
    "--rainbow-progress-spectrum": progressSpectrum(colors, safeCycleWidth),
    "--rainbow-progress-ribbon-duration": `${finitePositive(ribbonDuration, DEFAULT_RIBBON_DURATION)}ms`,
    "--rainbow-progress-sheen-duration": `${finitePositive(sheenDuration, DEFAULT_SHEEN_DURATION)}ms`,
  };

  return (
    <div
      {...props}
      ref={setRootRef}
      role="progressbar"
      aria-label={ariaLabel ?? label}
      aria-valuemax={safeMax}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={cn("rainbow-progress", className)}
      data-paused={paused || !isVisible ? "true" : "false"}
      style={componentStyle}
    >
      <span className={cn("rainbow-progress__indicator", indicatorClassName)}>
        <span aria-hidden className="rainbow-progress__ribbon" />
        <span aria-hidden className="rainbow-progress__sheen" />
        <span aria-hidden className="rainbow-progress__gloss" />
      </span>
    </div>
  );
});

const RainbowSweep = forwardRef<HTMLDivElement, RainbowSweepProps>(function RainbowSweep(
  {
    active = false,
    direction = "left-to-right",
    mode = "viewport",
    colors = RAINBOW_SWEEP_COLORS,
    duration = DEFAULT_SWEEP_DURATION,
    intensity = 0.78,
    blur = 48,
    saturation = 1.15,
    onComplete,
    className,
    style,
    ...props
  },
  ref,
) {
  const safeIntensity = Number.isFinite(intensity) ? clamp(intensity, 0, 1) : 0.78;
  const componentStyle: RainbowStyle = {
    ...style,
    "--rainbow-sweep-duration": `${finitePositive(duration, DEFAULT_SWEEP_DURATION)}ms`,
    "--rainbow-sweep-peak-opacity": safeIntensity,
    "--rainbow-sweep-mid-opacity": safeIntensity * 0.46,
    "--rainbow-sweep-tail-opacity": safeIntensity * 0.09,
    "--rainbow-sweep-blur": `${Math.max(0, Number.isFinite(blur) ? blur : 48)}px`,
    "--rainbow-sweep-saturation": Math.max(0, Number.isFinite(saturation) ? saturation : 1.15),
    "--rainbow-sweep-spectrum": sweepSpectrum(colors),
  };

  return (
    <div
      {...props}
      ref={ref}
      aria-hidden="true"
      className={cn("rainbow-sweep", className)}
      data-active={active ? "true" : "false"}
      data-direction={direction}
      data-mode={mode}
      style={componentStyle}
    >
      <span
        className="rainbow-sweep__field"
        onAnimationEnd={(event) => {
          if (event.animationName.startsWith("rainbow-sweep-")) onComplete?.();
        }}
      />
    </div>
  );
});

export {
  DEFAULT_PROGRESS_CYCLE,
  DEFAULT_RIBBON_DURATION,
  DEFAULT_SHEEN_DURATION,
  DEFAULT_SWEEP_DURATION,
  RAINBOW_PROGRESS_COLORS,
  RAINBOW_SWEEP_COLORS,
  RainbowProgress,
  RainbowSweep,
};
export type {
  RainbowProgressProps,
  RainbowSweepDirection,
  RainbowSweepMode,
  RainbowSweepProps,
};
