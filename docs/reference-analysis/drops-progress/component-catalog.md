# Drops Progress Component Catalog

## `DropsProgress`

A branded, high-presence progress primitive that renders a deterministic fluorescent droplet front over a dark mineral field.

### Use it for

- one long-running foreground task with a visible title, phase caption, and percentage;
- a branded loading surface where a thin linear bar would understate the moment;
- automatic motion studies when no production progress source is being represented.

Do not use it for multiple simultaneous jobs, background synchronization, success/error semantics, or fake deterministic percentages. Prefer `RainbowProgress` for compact routine progress.

### Inputs

| Prop | Contract |
| --- | --- |
| `value?: number` | Controlled source value. Omit only for the deterministic demo/indeterminate simulation. |
| `max?: number` | Positive normalization maximum; defaults to 100. |
| `title / subtitle` | Visible task and phase copy; both truncate without moving the percentage. |
| `paused?: boolean` | Stops rAF and renders a quiet current frame. |
| `speed?: number` | Clamped to 0.25–2.5 for interpolation and demo cadence. |
| `palette?: Partial<DropsProgressPalette>` | Background, base, fill, highlight, title, and caption colors. |
| `showPercentage?: boolean` | Keeps or removes the visible percentage without changing progressbar semantics. |
| `onProgressChange?: (value) => void` | Reports the current visual value during controlled interpolation or automatic simulation. |

### Timing contract

- Simulation: fixed 1/60 second steps, up to six catch-up steps per animation frame.
- Automatic target increments: 1–3.5% after waits of 80–220ms.
- Target pursuit: `min(1, 6.5 × speed × dt)`.
- Activity burst: 300ms; activity response is 1.8 while active and 0.7 while quiet.
- Controlled pursuit: at most `0.5 × speed` normalized units per second.
- Completed automatic state: reset to zero, then pause for 800ms.

### Implementation

- React 19 component and DOM progressbar semantics.
- OGL WebGL2 renderer with a fullscreen triangle and GLSL fragment shader.
- `ResizeObserver`, `IntersectionObserver`, page visibility, and media-query listeners.
- DPR capped at 2; desktop cell scale 110, height-aware reduction for compact containers.
- Shared CSS owns geometry, responsive typography, CSS fallback, and reduced-motion rules.

### Evidence and limits

- Visual evidence and accepted differences: [`alignment-report.md`](alignment-report.md).
- Standalone editable study: [`../../../tmp-progress-drops-demo.html`](../../../tmp-progress-drops-demo.html).
- Fidelity is visual-level. Do not describe the component as pixel-level or source-identical.
- The MetalForge editor is a behavioral and visual reference; this component does not include its editor UI, exported platform code, or assets.
