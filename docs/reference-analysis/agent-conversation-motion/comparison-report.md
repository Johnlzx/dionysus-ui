# Agent Trigger Morph · Comparison Report

## Decision

Visual-level pass for the trigger silhouette and compositing behavior. The earlier whole-button transform is rejected.

## First failing frame in the previous implementation

At reference `0.267s` (`+17ms` after activation), the green outline changes from `95 × 35` to `106 × 83`, while the label remains legible at its original glyph proportions. The previous implementation applied `scaleY` to the complete `PrismaticButton`, so text, icon, rounded corners, and the WebGL texture were stretched together. That mismatch created the exaggerated rubber-band impression.

## Measured reference

| Relative time | Green silhouette | Width scale | Height scale | Approx. green contrast |
| --- | ---: | ---: | ---: | ---: |
| 0ms | 95 × 35 | 1.000 | 1.000 | 1.00 |
| 17ms | 106 × 83 | 1.116 | 2.371 | 0.70 |
| 33ms | 106 × 83 | 1.116 | 2.371 | 0.70 |
| 50ms | 112 × 112 | 1.179 | 3.200 | 0.53 |
| 67ms | low-saturation ghost | held | held | 0.21 |
| 100ms | low-saturation ghost | held | held | 0.16 |
| 117ms | low-saturation ghost | held | held | 0.10 |

The close sequence is not the mathematical inverse of the open opacity. Its visible geometry follows `1.46h → 3.31h → 2.46h → 1.60h → 1.37h → 1.11h → 1h` over 167ms.

## Repaired candidate

- Renderer: React + `motion/react` 13.1.0, already owned by this package.
- Geometry technique: animate `clip-path: inset(... round ...)` on an independent green surface; do not scale the interactive button.
- Open duration: 180ms. Peak outline near 50ms. Saturated contrast below 25% near 70ms.
- Close duration: 167ms. Keyframed outline settlement with linear interpolation and no overshoot.
- Shell geometry and content reveal remain independent at 180ms and `260ms + 140ms` respectively.
- Reduced-motion path bypasses the bridge and performs an immediate readable state change.

## Final browser QA

- The trigger and panel now start in the same render cycle; there is no one-frame pause before the green bridge grows.
- While the panel is open, the trigger is disabled, removed from sequential focus, and hidden from the accessibility tree.
- Closing restores focus to the enabled `召唤 Agent` trigger after the state change.
- Workspace TypeScript checks and the Vite production build pass after the compositing repair.

## Library conclusion

The source library is not identifiable from a video-only artifact. There is no DOM, source map, JavaScript bundle, or public product URL in the supplied evidence. The motion signature supports a keyframed tween and does not support a spring. Dionysus therefore uses its existing Motion runtime to reproduce the measurable curve; naming GSAP, Framer Motion, or another source library as fact would be unsupported.

## Evidence

- Reference dense contact: `reference-detail/open-frames/contact/contact_01.jpg`
- Reference geometry: `reference-button-open-geometry.csv`, `reference-button-close-geometry.csv`
- Timestamp-aligned final opening comparison: `candidate/final-open-side-by-side.jpg`
- Repaired browser contacts: `candidate/refined-open-dense/contact/contact_01.jpg`, `candidate/refined-close-dense/contact/contact_01.jpg`
- Repaired recording: `candidate/refined-open-close.webm`
