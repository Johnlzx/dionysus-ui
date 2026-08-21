# Navigation icon hover — alignment objective

## Fidelity and scope

- Fidelity: visual-level recreation of the icon-to-arrow hover behavior.
- Reference: `Screen Recording 2026-08-21 at 08.48.40.mov`, 470 × 580, 8.993s, 60fps source.
- Target: Dionysus UI desktop and mobile-drawer primary navigation.
- Acceptance: the idle icon remains recognizable; hover and keyboard focus hand it off to a right arrow in roughly 100–160ms; exit reverses cleanly; reduced motion preserves the state change without spatial travel.
- Evidence: fixed 0.5s scan plus 0.05s samples around Recents, Quick Video, and Community transitions.

## Reference timeline

| Timestamp | Visible state | Motion note |
| --- | --- | --- |
| 0.450s | Recents clock, idle | Pointer approaches the row. |
| 0.500s | Clock begins to soften | Hover surface enters; source remains dominant. |
| 0.550s | Clock and chevron overlap | Source compresses toward the right while the arrow expands from the left. |
| 0.600s | Chevron, stable | Handoff completes without bounce or overshoot. |
| 1.100s | Chevron, leaving | Pointer exits the row. |
| 1.150s | Chevron and clock overlap | Reverse handoff uses the same spatial grammar. |
| 2.550–3.000s | Quick Video, arrow stable | Confirms the end state is independent of source-icon geometry. |
| 3.100–3.150s | Quick Video exits; Screenwriting enters | Adjacent rows can reverse and enter without waiting for one another. |
| 6.300–6.450s | Community enters | Book geometry compresses and crossfades into the same chevron. |
| 6.500–6.700s | Community exits; Trash enters | Fast pointer travel stays interruptible and does not queue animation. |

## Motion contract

- Material: two co-located SVG layers; no path interpolation dependency.
- Enter: source `x 0 → 3px`, `scaleX 1 → 0.56`, `opacity 1 → 0`; arrow `x -3px → 0`, `scaleX 0.48 → 1`, `opacity 0 → 1`.
- Timing: 160ms exponential ease-out; the reference appears visually settled around 100–120ms.
- Exit: 120ms reverse handoff, making departure slightly faster than arrival.
- Trigger: fine-pointer hover and keyboard `:focus-visible`.
- Reduced motion: instant layer swap through the system-level transition-duration override.

## Evidence

- Full scan: `reference-scan/contact/contact_01.jpg`
- Recents dense scan: `reference-recents-dense/contact/contact_01.jpg`
- Quick Video dense scan: `reference-quick-video-dense/contact/contact_01.jpg`
- Community dense scan: `reference-community-dense/contact/contact_01.jpg`
- Reference/candidate state comparison: `comparison/motion-state-comparison.jpg`

## Candidate status

Visual-level pass for the reusable motion grammar.

- Desktop expanded sidebar: idle source icon and stable arrow preserve the same 14px slot, row height, label anchor, and selected surface.
- Desktop collapsed sidebar: measured width remains 56px; the active arrow remains centered and reaches opacity `1`.
- Keyboard: focusing the active navigation link produces `:focus-visible = true`, source opacity `0`, arrow opacity `1`.
- Mobile drawer: the same navigation remains readable at a 390 × 844 viewport; text and selected state carry meaning without hover.
- Runtime: source and arrow remain two mounted SVG layers, so fast pointer travel reverses the current CSS transition rather than queueing a sequence.
- Build evidence: workspace typecheck and production Vite build pass. The only mechanical detector warning is the incumbent Montserrat font declaration, outside this motion change.

Candidate sequence: `candidate/candidate-sequence.jpg` (`desktop-idle.png`, `desktop-mid.png`, `desktop-hover.png`). The motion-state comparison pairs these with the reference idle / handoff / arrow samples.

The reference and candidate belong to different products and layouts, so whole-frame PSNR/SSIM would not be meaningful. Approval is limited to timing, slot continuity, arrow end state, interruption model, and interaction parity; it is not a pixel-level claim.
