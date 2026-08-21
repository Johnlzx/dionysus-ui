# Laper rainbow loading — frame and runtime analysis

## Conclusion

The rainbow inside the loading progress bar is a custom React component driven by native CSS. It does not use Lottie, GSAP, Three.js, OGL, or Motion for the rainbow movement itself. React updates the progress target; CSS performs the width interpolation and the two continuously repeating color/sheens animations.

The large full-screen color wash visible after the editor appears is a second transition layer. The recording proves that layer exists in the captured build, but the current public loading component does not contain it. Its geometry is a straight, soft, horizontally translated spectrum with no fluid curl, ray-march structure, or mesh deformation. The evidence therefore supports a CSS gradient overlay (optionally mounted/unmounted by Motion), not a shader-based React Bits background.

## Evidence and confidence

| Finding | Evidence | Confidence |
| --- | --- | --- |
| Progress ribbon is custom React + CSS | Current public runtime contains `CountdownProgressEffect`; its DOM is plain spans and its motion is CSS keyframes/transition | 99% |
| Motion is not responsible for the ribbon movement | No Motion element is used inside the progress/ribbon component | 99% |
| OGL/Three/Lottie/GSAP are not used by the ribbon | No renderer, canvas, timeline, or JSON animation appears in the component | 99% |
| Full-screen wash is a large CSS gradient overlay | Straight vertical bands, uniform motion across Y, soft blur, and opacity decay | 90% |
| Exact wrapper/library for the full-screen exit | The captured build's transition wrapper is absent from the current public loader module | Not provable from this recording/runtime pair |

## Reference media

- Resolution: 2920 × 1660
- Duration: 5.425 s
- Frames: 313
- Nominal frame rate: 60 fps; variable-frame-rate stream
- Dense analysis window: 1.850–2.700 s

## Frame timeline

| Time | State |
| --- | --- |
| 1.900 s | Loading overlay; stage text is `Building views` |
| 1.950 s | Last clean loading frame |
| 1.967 s | Editor replaces loading overlay; no strong color wash yet |
| 1.983 s | First measurable chromatic onset |
| 2.000 s | Spectrum enters from the left |
| 2.067 s | Highest measured chroma (P95 chroma 183/255) |
| 2.100 s | Highest whole-frame color displacement |
| 2.167–2.183 s | Leading high-chroma band reaches the right edge |
| 2.233 s | Main band has passed; pastel residual remains |
| 2.400 s | Residual is weak but still visible |
| 2.500–2.650 s | Tail fades into the normal editor color |

Measured full-screen timing:

- Main traversal: approximately 0.20 s
- Strong color phase: approximately 0.25 s
- Residual fade: approximately 0.40–0.45 s
- Total visible transition: approximately 0.65–0.67 s

## Exact progress-bar implementation

### Geometry

- Track: 256 × 8 CSS px (`w-64 h-2`)
- Radius: 16 CSS px (`rounded-2xl`)
- Filled segment: left anchored; width equals `visualPct`
- Fill edge shadow: `2px 0 6px -2px rgba(0,0,0,0.18)`
- Inactive track: `color-mix(in srgb, var(--foreground) 12%, var(--background))`

### Rainbow palette

The ribbon is one 160 CSS px repeating cycle at 90 degrees. Missing CSS positions resolve to the evenly spaced values shown below.

| Stop | Position | Color |
| ---: | ---: | --- |
| 1 | 0 px / 0% | `#E53935` |
| 2 | 13.3 px / 8.31% | `#E65100` |
| 3 | 26.7 px / 16.69% | `#F4A300` |
| 4 | 40 px / 25% | `gold` / `#FFD700` |
| 5 | 53.3 px / 33.31% | `#388E3C` |
| 6 | 66.7 px / 41.69% | `#3D8B68` |
| 7 | 80 px / 50% | `#00A78E` |
| 8 | 93.3 px / 58.31% | `#0277BD` |
| 9 | 106.7 px / 66.69% | `#1976D2` |
| 10 | 120 px / 75% | `#3F51B5` |
| 11 | 133.3 px / 83.31% | `#5E35B1` |
| 12 | 146.7 px / 91.69% | `#D81B60` |
| 13 | 160 px / 100% | `#E53935` |

### Ribbon motion

- Ribbon left offset: −160 px
- Ribbon width: `calc(100% + 160px)`
- Translation: 0 → +160 px
- Duration: 3.2 s
- Easing: linear
- Repeat: infinite
- Nominal travel speed: 50 CSS px/s

### Sheen layer

- Gradient angle: 100 degrees
- Cycle: 120 px, with a 122 px seam allowance
- Stops:
  - transparent at 0 px
  - white at 5.1% alpha at 38 px
  - white at 22.0% alpha at the implicit 60 px midpoint
  - white at 5.1% alpha at 82 px
  - transparent at 120 px
- Left offset: −122 px
- Translation: 0 → +122 px
- Duration: 5.6 s
- Easing: linear
- Repeat: infinite
- Nominal travel speed: 21.79 CSS px/s

### Vertical gloss

- Top: white at 25% alpha
- 55%: white at 6% alpha
- Bottom: transparent white
- Direction: top to bottom

### Progress interpolation

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- First transition from zero to at most 30%: 520 ms
- Other transitions: `round(clamp(6200 × abs(next − previous), 1800, 4200))` ms
- Target change is committed on the next `requestAnimationFrame`
- The ribbon and sheen pause through `IntersectionObserver` when the bar is off-screen

### Stage anchors

| Stage | Progress anchor |
| --- | ---: |
| Resolving project | 0% |
| Starting engine | 6% |
| Connecting | 14% |
| Downloading | 26% |
| Applying data | 68% |
| Building views | 74% |
| Loading script | 80% |
| Rendering | 88% |
| Preparing board | 88% |
| Ready | 100% |

When byte/item progress is available inside a stage, the value is linearly interpolated toward the next anchor before the CSS easing is applied.

## Full-screen sweep: observed colors

These are post-composite colors sampled from the recording, not source tokens. At 2.133 s, the upper flat UI region reads approximately:

`#D9C0D9 → #CAC9F7 → #C1D3FC → #7DCAEC → #94E784 → #E7CA75 → #F3C594`

The sequence is pastel magenta/lavender → blue → cyan → green → yellow → orange. The colored layer preserves UI detail underneath, so it is an overlay/composite rather than a scene replacement.

## Best-fit full-screen replica parameters

These values are inferred from the recording and should not be represented as extracted source:

- Renderer: DOM/CSS overlay
- Gradient direction: approximately 270 degrees
- Gradient width: about 100–120 vw for one spectrum cycle
- Main translation: one viewport in 0.20–0.23 s, approximately linear
- Blur: 40–56 CSS px; 48 px is the best starting value
- Peak opacity: 0.72–0.82 over a light UI
- Saturation: 1.10–1.20
- Opacity envelope:
  - 0 at 0 ms
  - peak at 100–120 ms
  - approximately 45% of peak at 220 ms
  - below 10% at 400 ms
  - 0 at 650–670 ms
- Pointer events: none
- Compositing: normal blend is the safest match; screen/color blend produces highlights that are too bright

The exact progress palette above is a strong starting palette for the large wash, but the recording's reversed visible order and pastel composite indicate that the full-screen layer either reverses the stop order or uses a separately authored brand spectrum.

## Exclusions

- React Bits Color Bends: curved luminous strands and noise deformation do not match.
- React Bits Iridescence: continuously warped shader field does not match.
- React Bits Splash Cursor: fluid curl/splat topology does not match.
- React Bits Prismatic Burst: radial ray field does not match.
- Lottie: no vector-shape/JSON animation signature and the effect scales as a CSS field.
- GSAP: no GSAP timeline is present in the current loader component.
- OGL/Three.js: used elsewhere in Laper, but not in the exact progress ribbon component.

## Artifacts

- `transition-keyframes-labeled.jpg`: labeled frame contact sheet
- `frame-metrics.csv`: dense frame measurements
- `analyze_reference.py`: repeatable extraction/measurement script
