# Component Catalog — Prismatic Button

## Component

`PrismaticButton + PrismaticBurst`

一种只用于极少量高强调主操作的按钮。静态三段渐变建立稳定底色，OGL/WebGL2 驱动的 GLSL 光场在其上提供连续棱光；视觉增强失败时，原生按钮、可见文案、焦点和静态底色仍然完整。

## Archive source

- Source workspace: `/Users/zhongxin/Documents/my apps/Dionysus`
- Source branch: `origin/codex/knowledge-intake-writing-workspace`
- Original component: `apps/desktop/src/renderer/shared/ui/prismatic-button.tsx`
- Original renderer: `apps/desktop/src/renderer/shared/ui/prismatic-burst.tsx`
- Original analysis: `apps/desktop/src/renderer/features/design-system/PRISMATIC_BUTTON_IMPLEMENTATION.md`
- Archived into Dionysus UI: 2026-08-20
- Browser evidence: [`design-system-specimen.gif`](design-system-specimen.gif)

本次是源码级迁移，不是依据截图重画。光场 shader、OGL 生命周期、色板读取、尺寸和性能参数保持原实现；唯一平台适配是把原项目的 Base UI Button 外壳替换为当前 `@dionysus/ui` 已统一使用的原生 React button 属性模型，视觉分层和原生交互语义不变。

## Provenance

原实现分析记录了两层视觉来源：Laper 登录按钮的运行时结构，以及 React Bits `PrismaticBurst` 的公开 OGL/GLSL 实现范式。当前归档固定使用 `ogl@1.0.11`，并将 Montserrat Variable 作为组件字体依赖。

这份归档用于当前源码设计系统。独立公开发布、再许可或把组件作为可销售资产分发前，必须重新核验参考实现、React Bits、字体和 OGL 的实际许可证边界；不能仅依据本目录的技术记录推断分发权。

## Visual anatomy

```text
button 326 × 44 / radius 24 / overflow hidden
├── span                       静态三段渐变
├── span blur(6px)             GPU 隔离与后置融合
│   └── PrismaticBurst
│       └── canvas             OGL / WebGL2 / GLSL 光场
└── span z-index 30            清晰文字或图标
```

1. 静态渐变是可靠底色，不依赖 Canvas。
2. `PrismaticBurst` 只负责光场，不持有按钮业务语义。
3. 6px 模糊把射线融合为液态光斑，文字不参与模糊。
4. `tone` 同时切换静态渐变、六色 Texture、hover 阴影和 focus ring。

## Geometry and optical contract

| Property | Value | Source of truth |
| --- | ---: | --- |
| Reference width | 326px | `--prismatic-button-reference-width` |
| Height | 44px | `--prismatic-button-height` |
| Radius | 24px | `--prismatic-button-radius` |
| Horizontal padding | 20px | `--prismatic-button-padding-x` |
| Typography | Montserrat 13px / 19.5px / 500 | `--prismatic-button-font-*` |
| Renderer DPR | 1 | `--prismatic-button-render-dpr` |
| Shader intensity | 15 | `--prismatic-button-intensity` |
| Speed | 0.4 | `--prismatic-button-speed` |
| Distort | 30 | `--prismatic-button-distort` |
| Noise amount | 0.45 | `--prismatic-button-noise-amount` |
| Ray count | 18 | `--prismatic-button-ray-count` |
| Ray-march steps | 6 | fragment shader compile-time constant |
| Blur | 6px | `--prismatic-button-blur` |

## Tone contract

Green is the confirmed source palette. Blue, violet, amber, rose and cyan are controlled extensions over the same optical structure.

| Tone | Static gradient | Hover/focus signal |
| --- | --- | --- |
| Green · source | `#1a4a35 → #2d6a4f → #0fa958` | `26 74 53` |
| Blue | `#1e3a5f → #315f91 → #2563eb` | `37 99 235` |
| Violet | `#321553 → #6d28d9 → #8b5cf6` | `109 40 217` |
| Amber | `#451a03 → #92400e → #d97706` | `146 64 14` |
| Rose | `#4c172e → #9f1239 → #e11d48` | `159 18 57` |
| Cyan | `#083344 → #0e7490 → #06b6d4` | `14 116 144` |

Every tone owns six dynamic texture roles from a dark anchor through bright spectral peaks. All six share geometry, shader, speed, noise, blur and state behavior. Adding another tone requires a complete namespaced token family and a design-system specimen; copying the shader or component is forbidden.

## Motion and state model

| State | Contract |
| --- | --- |
| Rest | Static gradient and continuous WebGL field; no shadow or scale |
| Hover | Same-color `0 4px 16px / 40%` shadow; geometry does not change |
| Pressed | `scale(0.98)` without changing layout |
| Focus visible | 2px tone-matched ring |
| Disabled | Native disabled semantics; full visual remains readable |
| Reduced motion | rAF stops and renderer draws deterministic `uTime = 6.4` frame |
| Off-screen / hidden | Rendering pauses through IntersectionObserver / visibilitychange |
| WebGL2 unavailable | Canvas is omitted; static gradient and native button remain |

## Performance contract

At the reference size, the Canvas covers 14,344 CSS pixels. With DPR 1 and six fixed ray-march steps, the renderer performs roughly 86,000 march steps per frame before the CSS blur composite. Rendering only continues while the button intersects the viewport, the document is visible and reduced motion is off.

The component owns and releases `Renderer`, `Program`, `Triangle`, `Mesh` and `Texture`. `ResizeObserver` keeps the backing store synchronized with the button; `MutationObserver` updates tone tokens without rebuilding the program.

## Archive verification · 2026-08-20

- `pnpm typecheck` passes for `packages/ui` and `apps/web`.
- `pnpm build` produces the Web design-system production bundle with OGL and Montserrat assets included.
- Production-preview geometry matches the contract: `326 × 44px`, 24px radius and Montserrat 13px/500; all controlled tones reuse a `326 × 44` Canvas at DPR 1.
- Two normal-motion captures 900ms apart contain changed Canvas pixels; two reduced-motion captures 900ms apart are pixel-identical.
- Hover produces the tone-matched 16px glow, keyboard navigation reaches a `:focus-visible` native button, and a 390px viewport has no horizontal overflow.
- Chrome launched with WebGL disabled creates no Canvas while preserving the 326 × 44 button, white label and complete green static gradient.

## Accessibility

- Uses a real `<button>` and forwards native button attributes.
- Defaults to `type="button"` to avoid accidental form submission.
- Visual layers are `aria-hidden`; the accessible name comes from visible children.
- Keyboard focus uses `focus-visible`, not a permanent outline suppression.
- Disabled behavior uses the native attribute; color is never the only disabled signal.
- Reduced motion keeps a deterministic visual frame instead of removing contrast or content.

## Usage rules

- Use for one clearly approved, high-value primary action in a Surface or focused flow.
- Green is a component palette, not the design system's `success` semantic.
- Do not use for destructive actions, passive status, progress, navigation rows or multiple competing CTAs.
- Do not expose intensity, speed, ray count or arbitrary colors as product-level props.
- Product code imports only `PrismaticButton`; it does not import `PrismaticBurst` or `ogl`.

## Public API

```tsx
import { PrismaticButton } from "@dionysus/ui";

<PrismaticButton tone="green" type="submit">
  Login
</PrismaticButton>
```

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `tone` | `"green" \| "blue" \| "violet" \| "amber" \| "rose" \| "cyan"` | `"green"` | Selects the complete optical token family |
| `type` | native button type | `"button"` | Controls form behavior |
| `disabled` | `boolean` | `false` | Native non-interactive state |
| `className` | `string` | — | Layout width override; optical values remain tokenized |
| other props | `ButtonHTMLAttributes` | — | aria, events, form and data attributes |

## Current integration map

- `packages/ui/src/prismatic-button.tsx`: semantic button assembly.
- `packages/ui/src/prismatic-burst.tsx`: OGL/GLSL rendering and lifecycle.
- `packages/ui/src/styles.css`: tone, geometry, typography, optical and interaction tokens.
- `packages/ui/src/index.ts`: public package export.
- `apps/web/src/pages.tsx`: live specimen, contract and API documentation.
- `apps/web/src/navigation.ts`: stable `/components/prismatic-button` route and search entry.
