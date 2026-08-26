/**
 * [INPUT]: 依赖 React 受控值/生命周期、OGL WebGL2 渲染器、IntersectionObserver/ResizeObserver 与 styles.css 的 Drops Progress 视觉契约
 * [OUTPUT]: 对外提供 DropsProgress、默认色板与进度/色板 Props；value 缺省时运行确定性的 Drops 自动状态机
 * [POS]: ui/src 的 GPU 进度反馈原语，用稳定网格、概率前沿和 activity 抖动表达长任务推进，不承载业务控制按钮
 * [PROTOCOL]: 变更时更新此头部，然后检查 docs/DESIGN_SYSTEM.md
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { cn } from "./cn";

const DROPS_PROGRESS_PALETTE = {
  background: "#12160F",
  base: "#0E2405",
  fill: "#2E850F",
  highlight: "#B2FF59",
  title: "#F7FAF4",
  caption: "#9B9F94",
} as const;

type DropsProgressPalette = {
  background: string;
  base: string;
  fill: string;
  highlight: string;
  title: string;
  caption: string;
};

type DropsProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  value?: number;
  max?: number;
  label?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  paused?: boolean;
  speed?: number;
  showPercentage?: boolean;
  palette?: Partial<DropsProgressPalette>;
  onProgressChange?: (value: number) => void;
  canvasClassName?: string;
  contentClassName?: string;
};

type DropsProgressStyle = CSSProperties & {
  "--drops-progress-value": string;
  "--drops-progress-background": string;
  "--drops-progress-base": string;
  "--drops-progress-fill": string;
  "--drops-progress-highlight": string;
  "--drops-progress-title": string;
  "--drops-progress-caption": string;
};

type RuntimeConfig = {
  value: number | undefined;
  max: number;
  paused: boolean;
  speed: number;
  palette: DropsProgressPalette;
  onProgressChange: ((value: number) => void) | undefined;
};

type ProgressSimulation = {
  progress: number;
  activity: number;
  warp: number;
  target: number;
  mode: "pause" | "reset";
  wait: number;
  burst: number;
  seed: number;
};

const VERTEX_SHADER = `#version 300 es
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uProgress;
uniform float uActivity;
uniform float uWarp;
uniform float uScale;
uniform float uJitter;
uniform float uFrontIn;
uniform float uFrontOut;
uniform float uChurn;
uniform float uFeather;
uniform float uCellSize;
uniform float uFill;
uniform float uGrain;
uniform vec4 uBackground;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;

out vec4 fragColor;

float dropsHash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float dropsReverseSmooth(float edge0, float edge1, float value) {
  float t = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  vec2 resolution = max(uResolution, vec2(1.0));
  vec2 pixel = floor(gl_FragCoord.xy) + 0.5;
  vec2 uv = pixel / resolution;
  float aspect = resolution.x / resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float front = mix(uFrontIn, aspect + uFrontOut, clamp(uProgress, 0.0, 1.0));
  float grade = dropsReverseSmooth(front + 0.34, front - 0.30, p.x);
  vec2 grid = vec2(p.x, uv.y) * uScale;
  vec2 cell = floor(grid);
  vec2 local = fract(grid) - 0.5;
  float randomA = dropsHash21(cell);
  float randomB = dropsHash21(cell + 13.0);
  vec2 offset = vec2(
    sin(uWarp * 4.0 * uChurn + randomA * 40.0),
    cos(uWarp * 3.1 * uChurn + randomB * 40.0)
  ) * uActivity * uJitter;

  float enabled = step(1.0 - grade * uFill, randomA);
  float radius = 0.16 + 0.26 * grade;
  radius *= uCellSize;
  float disc = 1.0 - dropsReverseSmooth(
    radius - 0.12 * uFeather,
    radius + 0.04 * uFeather,
    length(local - offset)
  );

  vec3 color = uBackground.rgb;
  color += uColor1.rgb * grade * 0.55;
  color += mix(uColor2.rgb, uColor3.rgb, grade) * disc * enabled;
  color += vec3(dropsHash21(pixel) - 0.5) * uGrain;
  fragColor = vec4(max(color, vec3(0.0)), 1.0);
}
`;

const WEBGL_ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  depth: false,
  stencil: false,
  antialias: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  powerPreference: "default",
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function safeMaximum(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 100;
}

function safeSpeed(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? clamp(value, 0.25, 2.5) : 1;
}

function normalizedValue(value: number | undefined, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value) ? clamp(value / max, 0, 1) : null;
}

function resolvePalette(palette: Partial<DropsProgressPalette> | undefined): DropsProgressPalette {
  return { ...DROPS_PROGRESS_PALETTE, ...palette };
}

function parseHexColor(color: string, fallback: string): [number, number, number, number] {
  const normalized = color.trim().replace(/^#/, "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((character) => character + character).join("")
    : normalized;
  if (!/^[\da-f]{6}$/i.test(expanded)) return parseHexColor(fallback, "#000000");
  return [
    Number.parseInt(expanded.slice(0, 2), 16) / 255,
    Number.parseInt(expanded.slice(2, 4), 16) / 255,
    Number.parseInt(expanded.slice(4, 6), 16) / 255,
    1,
  ];
}

function createSimulation(initialProgress: number): ProgressSimulation {
  const styleIndex = 4;
  return {
    progress: initialProgress,
    activity: 0,
    warp: ((0x9e3779b1 * styleIndex) % 600) / 10,
    target: initialProgress,
    mode: "pause",
    wait: 0.5,
    burst: 0,
    seed: (0x85ebca77 * styleIndex + 0x165667b1) >>> 0,
  };
}

function randomBetween(simulation: ProgressSimulation, minimum: number, maximum: number): number {
  simulation.seed = (Math.imul(simulation.seed, 1664525) + 0x3c6ef35f) >>> 0;
  return minimum + (simulation.seed / 0x100000000) * (maximum - minimum);
}

function stepSimulation(
  simulation: ProgressSimulation,
  deltaSeconds: number,
  config: RuntimeConfig,
  reducedMotion: boolean,
): void {
  const target = normalizedValue(config.value, config.max);
  let active = false;

  if (target !== null) {
    const delta = target - simulation.progress;
    if (Math.abs(delta) > 0.002) {
      simulation.progress += Math.sign(delta) * Math.min(Math.abs(delta), 0.5 * config.speed * deltaSeconds);
      active = true;
    }
  } else if (simulation.mode === "reset") {
    simulation.progress -= config.speed * deltaSeconds;
    active = true;
    if (simulation.progress <= 0) {
      simulation.progress = 0;
      simulation.target = 0;
      simulation.mode = "pause";
      simulation.wait = 0.8;
      active = false;
    }
  } else {
    simulation.wait -= deltaSeconds * config.speed;
    if (simulation.wait <= 0) {
      if (simulation.progress >= 0.999) {
        simulation.mode = "reset";
        active = true;
      } else {
        simulation.target = Math.min(
          1,
          simulation.progress + randomBetween(simulation, 0.01, 0.035),
        );
        simulation.wait = randomBetween(simulation, 0.08, 0.22);
        simulation.burst = 0.3;
      }
    }
    const delta = simulation.target - simulation.progress;
    simulation.progress += delta * Math.min(1, 6.5 * config.speed * deltaSeconds);
    simulation.burst = Math.max(0, simulation.burst - deltaSeconds);
    active = active || simulation.burst > 0;
  }

  simulation.progress = clamp(simulation.progress, 0, 1);
  const response = active ? 1.8 : 0.7;
  const desiredActivity = reducedMotion ? 0 : Number(active);
  simulation.activity += (
    desiredActivity - simulation.activity
  ) * (1 - Math.exp(-response * deltaSeconds));
  simulation.warp += deltaSeconds * (0.45 + simulation.activity * 0.85);
}

const DropsProgress = forwardRef<HTMLDivElement, DropsProgressProps>(function DropsProgress(
  {
    value,
    max = 100,
    label = "Loading progress",
    title = "SYNCING LIBRARY",
    subtitle = "PREPARING YOUR FILES",
    paused = false,
    speed = 1,
    showPercentage = true,
    palette,
    onProgressChange,
    canvasClassName,
    contentClassName,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-valuetext": ariaValueText,
    ...props
  },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const invalidateRef = useRef<() => void>(() => undefined);
  const resolvedMax = safeMaximum(max);
  const resolvedPalette = resolvePalette(palette);
  const safeControlledValue = normalizedValue(value, resolvedMax);
  const configRef = useRef<RuntimeConfig>({
    value,
    max: resolvedMax,
    paused,
    speed: safeSpeed(speed),
    palette: resolvedPalette,
    onProgressChange,
  });
  configRef.current = {
    value,
    max: resolvedMax,
    paused,
    speed: safeSpeed(speed),
    palette: resolvedPalette,
    onProgressChange,
  };

  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    try {
      if (!canvas.getContext("webgl2", WEBGL_ATTRIBUTES)) {
        root.dataset.renderer = "css-fallback";
        return undefined;
      }
    } catch {
      root.dataset.renderer = "css-fallback";
      return undefined;
    }

    const renderer = new Renderer({
      canvas,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "default",
    });
    const gl = renderer.gl;
    gl.clearColor(18 / 255, 22 / 255, 15 / 255, 1);

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      transparent: false,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uResolution: { value: [1, 1] },
        uProgress: { value: safeControlledValue ?? 0 },
        uActivity: { value: 0 },
        uWarp: { value: 0 },
        uScale: { value: 110 },
        uJitter: { value: 0.3 },
        uFrontIn: { value: -0.3 },
        uFrontOut: { value: 0.3 },
        uChurn: { value: 1 },
        uFeather: { value: 1 },
        uCellSize: { value: 1 },
        uFill: { value: 1 },
        uGrain: { value: 0.01 },
        uBackground: { value: [18 / 255, 22 / 255, 15 / 255, 1] },
        uColor1: { value: [14 / 255, 36 / 255, 5 / 255, 1] },
        uColor2: { value: [46 / 255, 133 / 255, 15 / 255, 1] },
        uColor3: { value: [178 / 255, 1, 89 / 255, 1] },
      },
    });
    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });
    const simulation = createSimulation(safeControlledValue ?? 0);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    let animationFrame = 0;
    let accumulator = 0;
    let lastTimestamp = performance.now();
    let lastPercentage = -1;
    let lastPaletteKey = "";
    let visible = true;

    const syncPalette = () => {
      const currentPalette = configRef.current.palette;
      const paletteKey = [
        currentPalette.background,
        currentPalette.base,
        currentPalette.fill,
        currentPalette.highlight,
      ].join("|");
      if (paletteKey === lastPaletteKey) return;
      lastPaletteKey = paletteKey;
      program.uniforms.uBackground.value = parseHexColor(
        currentPalette.background,
        DROPS_PROGRESS_PALETTE.background,
      );
      program.uniforms.uColor1.value = parseHexColor(currentPalette.base, DROPS_PROGRESS_PALETTE.base);
      program.uniforms.uColor2.value = parseHexColor(currentPalette.fill, DROPS_PROGRESS_PALETTE.fill);
      program.uniforms.uColor3.value = parseHexColor(
        currentPalette.highlight,
        DROPS_PROGRESS_PALETTE.highlight,
      );
    };

    const syncSemanticValue = () => {
      const config = configRef.current;
      const percentage = Math.round(simulation.progress * 100);
      if (percentage === lastPercentage) return;
      lastPercentage = percentage;
      root.style.setProperty("--drops-progress-value", `${simulation.progress * 100}%`);
      if (percentageRef.current) percentageRef.current.textContent = String(percentage);
      const semanticValue = Math.round(simulation.progress * config.max * 1_000) / 1_000;
      root.setAttribute("aria-valuenow", String(semanticValue));
      config.onProgressChange?.(simulation.progress * config.max);
    };

    const render = () => {
      syncPalette();
      program.uniforms.uProgress.value = simulation.progress;
      program.uniforms.uActivity.value = simulation.activity;
      program.uniforms.uWarp.value = simulation.warp;
      renderer.render({ scene: mesh });
      syncSemanticValue();
    };

    const stop = () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const tick = (timestamp: number) => {
      const elapsed = Math.min(Math.max(0, timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;
      accumulator += elapsed;
      let steps = 0;
      while (accumulator >= 1 / 60 && steps < 6) {
        stepSimulation(simulation, 1 / 60, configRef.current, motionPreference.matches);
        accumulator -= 1 / 60;
        steps += 1;
      }
      render();
      animationFrame = window.requestAnimationFrame(tick);
    };

    const syncActivity = () => {
      stop();
      const config = configRef.current;
      if (config.paused || !visible || document.hidden) {
        const controlled = normalizedValue(config.value, config.max);
        if (controlled !== null) simulation.progress = controlled;
        simulation.activity = 0;
        render();
        return;
      }
      lastTimestamp = performance.now();
      animationFrame = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      renderer.setSize(root.clientWidth || 1, root.clientHeight || 1);
      program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
      program.uniforms.uScale.value = Math.min(110, Math.max(42, (root.clientHeight || 1) / 2.2));
      render();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      syncActivity();
    }, { threshold: 0.01 });
    intersectionObserver.observe(root);

    const handleVisibility = () => syncActivity();
    const handleMotion = () => syncActivity();
    document.addEventListener("visibilitychange", handleVisibility);
    motionPreference.addEventListener("change", handleMotion);
    invalidateRef.current = syncActivity;
    root.dataset.renderer = "webgl2";
    resize();
    syncActivity();

    return () => {
      invalidateRef.current = () => undefined;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionPreference.removeEventListener("change", handleMotion);
      geometry.remove();
      program.remove();
      delete root.dataset.renderer;
    };
  }, []);

  useEffect(() => {
    invalidateRef.current();
  }, [
    value,
    resolvedMax,
    paused,
    speed,
    resolvedPalette.background,
    resolvedPalette.base,
    resolvedPalette.fill,
    resolvedPalette.highlight,
  ]);

  const componentStyle: DropsProgressStyle = {
    ...style,
    "--drops-progress-value": `${(safeControlledValue ?? 0) * 100}%`,
    "--drops-progress-background": resolvedPalette.background,
    "--drops-progress-base": resolvedPalette.base,
    "--drops-progress-fill": resolvedPalette.fill,
    "--drops-progress-highlight": resolvedPalette.highlight,
    "--drops-progress-title": resolvedPalette.title,
    "--drops-progress-caption": resolvedPalette.caption,
  };
  const semanticValue = value === undefined
    ? 0
    : clamp(Number.isFinite(value) ? value : 0, 0, resolvedMax);

  return (
    <div
      {...props}
      ref={setRootRef}
      role="progressbar"
      aria-label={ariaLabel ?? label}
      aria-valuemin={0}
      aria-valuemax={resolvedMax}
      aria-valuenow={semanticValue}
      aria-valuetext={ariaValueText}
      className={cn("drops-progress", className)}
      data-mode={value === undefined ? "auto" : "controlled"}
      data-paused={paused ? "true" : "false"}
      style={componentStyle}
    >
      <canvas ref={canvasRef} aria-hidden className={cn("drops-progress__canvas", canvasClassName)} />
      <span aria-hidden className="drops-progress__finish" />
      <div className={cn("drops-progress__content", contentClassName)}>
        <div className="drops-progress__copy">
          <div className="drops-progress__title">{title}</div>
          <div className="drops-progress__subtitle">{subtitle}</div>
        </div>
        {showPercentage ? (
          <div className="drops-progress__percentage">
            <span ref={percentageRef}>{Math.round((safeControlledValue ?? 0) * 100)}</span>%
          </div>
        ) : null}
      </div>
    </div>
  );
});

export { DROPS_PROGRESS_PALETTE, DropsProgress };
export type { DropsProgressPalette, DropsProgressProps };
