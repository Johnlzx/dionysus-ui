# Drops Progress Visual Alignment Report

## Decision

- Fidelity: visual-level recreation.
- Status: pass for the declared 60% manual state and responsive component contract.
- Not claimed: pixel-level or bit-exact output.
- Reference: [MetalForge Progress / Drops editor](https://metalforge.xyz/editor#effect=progress&style=drops&autoplay=auto&progress=60&speed=1&scale=110&jitter=0.3&frontIn=-0.3&frontOut=0.3&churn=1&feather=1&cellSize=1&fill=1&grain=0.01&aspect=3.6&corner=0.144&background=%2312160F&color1=%230E2405&color2=%232E850F&color3=%23B2FF59).
- Candidate: `packages/ui/src/drops-progress.tsx` plus the shared rules in `packages/ui/src/styles.css`.

## Source behavior preserved

1. A deterministic cell hash creates stable droplets without per-frame random flashing.
2. A reverse smoothstep maps normalized progress to a broad probability front.
3. `progress`, `activity`, and `warp` remain separate so motion becomes active while progress changes and quiet while it pauses.
4. The automatic mode advances in small irregular target steps, approaches each target exponentially, resets after completion, and uses a fixed 60 Hz simulation step.
5. The title, subtitle, and percentage remain DOM text above the GPU canvas.
6. The component uses the 3.6 aspect ratio, dark mineral palette, bright green front, capped DPR, visibility pausing, reduced-motion handling, and a CSS fallback layer.

## Evidence

| View | Candidate | Result |
| --- | --- | --- |
| Standalone study | [`standalone-study.png`](standalone-study.png) | Establishes the full demo composition and 60% shader state. |
| Desktop component | [`candidate-desktop.png`](candidate-desktop.png) | 960 × 266.66 CSS px, 3.6:1, 36px radius, WebGL2, no text or page overflow. |
| Mobile component | [`candidate-mobile.png`](candidate-mobile.png) | 345.59 × 96 CSS px, 3.6:1, 15.6px radius, WebGL2, no text or page overflow. |

The browser interaction check advanced the controlled component from 60 to 70 and observed `aria-valuenow="70"` on both viewports. The final run reported no console or page errors. The full workspace typecheck and production build passed.

## Accepted differences

- The original browser preview uses native WebGPU/WGSL. The shared component uses OGL/WebGL2/GLSL because the project already carries OGL and needs broader browser coverage. The standalone research page retains a native WebGPU path plus WebGL2 fallback.
- The formal component deliberately removes the study page title, playback controls, mode switch, and slider; it is a product primitive, not an editor.
- Containers shorter than the desktop reference reduce grid density from 110 according to height to avoid sub-pixel moire. Desktop remains at the reference scale.
- Browser font rasterization, DPR, and WebGL implementations can produce small anti-aliasing differences; these prevent a pixel-level claim.

## First failing timestamp

Not applicable: this is an interactive progress state rather than a reference video timeline. The declared comparison state is manual 60%, with adjacent controlled-state verification at 70%.
