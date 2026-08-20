# Sidebar Toggle Visual Alignment Report

## Objective

- Reference: `/Users/zhongxin/Desktop/Screen Recording 2026-08-20 at 09.22.11.mov`
- Scope: desktop sidebar expand/collapse, toggle trajectory, content choreography, canvas reflow, and reduced-motion behavior.
- Fidelity: visual-level replication. The product copy, icons, viewport, colors, and sidebar tokens intentionally follow Dionysus UI rather than Laper, so pixel-level metrics are not applicable.
- Implementation: React 19 + `motion/react` 13.1.0.

## Reference timeline

The source is 480×1034, nominally 60fps, duration 7.98s. Dense samples use 50ms intervals.

| Time | State | Observed behavior |
| --- | --- | --- |
| 1.500s | expanded | Toggle is right-aligned; brand, labels, and badge are fully visible. |
| 1.550s | collapse start | Labels/badge leave visual layout immediately; icons center inside the current width; toggle has already moved strongly toward the rail center. |
| 1.600s | collapsing | Sidebar boundary continues inward; brand is clipped/fading; icons retain their vertical positions. |
| 1.650s | collapsing | Toggle remains on a horizontal path; main canvas is exposed by real width reflow. |
| 1.700s | near terminal | Width is about 87% through the path; brand is nearly gone and the toggle is already close to rail center. |
| 1.750–1.800s | collapsed | Width moves from about 96% to terminal; icon sizes and row rhythm are unchanged. |
| 4.450s | collapsed | Toggle is centered on the rail. |
| 4.500–4.550s | expand start | Text re-enters layout immediately and is clipped by the narrow boundary; icons switch back to the left anchor. |
| 4.600–4.700s | expanding | Brand fades in after width begins moving; toggle travels toward the right anchor without vertical movement. |
| 4.750–4.800s | expanded | Width moves from about 96% to terminal; brand, labels, badge, and toggle are stable. |

## Normalized component comparison

| Contract | Reference | Dionysus candidate | Result |
| --- | --- | --- | --- |
| Width | Real sidebar boundary changes; canvas is revealed beside it. | Motion animates `aside.width`; Flex reflows the canvas. | Pass |
| Toggle endpoints | Right inset when expanded; rail center when collapsed. | Center x=234px at 256px; center x=28px at 56px. | Pass |
| Toggle path | Horizontal only; no scale, rotation, or y shift. | Independent x spring; fixed 28px box and fixed y. | Pass |
| Labels and badges | Removed immediately on collapse; clipped during expansion. | Visual layout switches immediately; root `overflow-hidden` performs clipping. | Pass |
| Navigation icons | Center in collapsed width; return to left anchor on expansion; y rhythm is stable. | Conditional justify mode with fixed icon dimensions and row heights. | Pass |
| Brand | Exits during collapse and returns slightly after expansion begins. | 120ms exit; 160ms entry after 60ms delay; x offset 8px. | Pass |
| Interruption | Repeated clicks reverse without a hard reset. | Motion spring starts from current value and velocity. | Pass |
| Reduced motion | Not shown in source. | One React commit to terminal width; semantics/focus remain. | Pass (system requirement) |

## Timing evidence

Browser `requestAnimationFrame` sampling of the final collapse:

| Elapsed | Sidebar width | Toggle center |
| --- | ---: | ---: |
| 1ms | 256.00px | 234.00px |
| 57ms | 231.19px | 189.95px |
| 106ms | 123.08px | 62.32px |
| 157ms | 75.22px | 33.12px |
| 206ms | 60.94px | 28.69px |
| 256ms | 57.20px | 28.09px |
| 306ms | 56.28px | 28.00px |

The first frame records the React state change before visible displacement. At 106ms the toggle is about 83% through its path while width is about 66%, preserving the source's leading toggle. Width reaches about 90% at 157ms and 97.5% at 206ms; the remaining critically damped tail is about 1.2px at 256ms and 0.3px at 306ms, with no overshoot. A separate 80ms collapse → expand → collapse interruption test converged to the exact 56px terminal state without a hard restart.

## Evidence

- Reference overview: [`contact/contact_01.jpg`](contact/contact_01.jpg)
- Reference collapse, 50ms: [`collapse-dense/contact/contact_01.jpg`](collapse-dense/contact/contact_01.jpg)
- Reference expansion, 50ms: [`expand-dense/contact/contact_01.jpg`](expand-dense/contact/contact_01.jpg)
- Candidate expanded: [`candidate-expanded.png`](candidate-expanded.png)
- Candidate collapsed: [`candidate-collapsed.png`](candidate-collapsed.png)
- Live specification expanded: [`design-system-specimen.png`](design-system-specimen.png)
- Live specification collapsed: [`design-system-specimen-collapsed.png`](design-system-specimen-collapsed.png)
- Final browser recording: [`candidate-motion-final.webm`](candidate-motion-final.webm)
- Final collapse contact: [`candidate-final-collapse/contact/contact_01.jpg`](candidate-final-collapse/contact/contact_01.jpg)
- Final expansion contact: [`candidate-final-expand/contact/contact_01.jpg`](candidate-final-expand/contact/contact_01.jpg)

## Decision

**Pass — visual-level alignment.** The reusable motion grammar, endpoints, choreography, interruption model, and 180–220ms visual timing match the reference. Accepted differences are product-specific content, tokenized widths, colors, typography, and viewport.
