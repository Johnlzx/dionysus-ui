# Agent Conversation Open / Close · Alignment Report

## Fidelity decision

- Target: visual-level recreation of the supplied 5.465s reference.
- Source: `Screen Recording 2026-08-21 at 09.54.47.mov`, 2834 × 1748, approximately 60fps.
- Evidence: 0.1s whole-frame sampling plus 0.0167s / 0.05s bottom-right crops around both open and both close transitions.
- Scope: the Agent conversation trigger-to-panel and panel-to-trigger motion only. Product imagery, copy, component geometry, and brand styling remain Dionysus-owned.

## Reference timeline

| Time | Observed state | Motion contract |
| --- | --- | --- |
| 0.250–0.267s | The compact trigger begins transferring into the panel. | Trigger stays bottom-right anchored, stretches vertically, and begins fading. |
| 0.267–0.417s | A blank white shell expands rapidly from the same origin. | Final panel width/height exist from frame one; `scaleX` and `scaleY` resolve independently to avoid a generic uniform zoom. |
| 0.417–0.550s | The shell is geometrically stable but deliberately blank. | Shell motion finishes before content is revealed. |
| 0.550–0.700s | Header, conversation, and composer fade in together. | Content opacity is a second phase, delayed from the shell transition. |
| 1.800–2.000s | Panel collapses to the trigger. | Content/surface leave first; the trigger re-enters in a tall rounded state and settles to its compact height. |
| 2.700–3.200s | The same opening sequence repeats. | Repeat must preserve timing and bottom-right origin. |
| 4.283–4.467s | The same closing sequence repeats. | No downward slide or miniature-card detour; trigger finishes at its original geometry. |

## Extracted motion parameters

- Shell enter: 180ms, `cubic-bezier(0.16, 1, 0.3, 1)`, `scaleX 0.46 → 1`, `scaleY 0.30 → 1`, bottom-right transform origin.
- Content enter: 260ms delay followed by 140ms opacity reveal.
- Shell close: 160ms inverse geometry, with surface opacity resolving in 50ms.
- Trigger open geometry: measured silhouette `95 × 35 → 106 × 83 → 112 × 112` at `0 / 17 / 50ms`, equivalent to peak `1.18× / 3.20×`.
- Trigger open contrast: measured green contrast falls approximately `1.00 → 0.70 → 0.53 → 0.21 → 0.16 → 0.10`; the saturated shape does not remain at peak opacity.
- Trigger close geometry: `0.99× / 1.46× → 1.20× / 3.31× → 1.13× / 2.46× → 1.05× / 1.60× → 1× / 1×` over 167ms, without overshoot.
- Trigger content: icon, label glyphs, and corner radius retain their own geometry while an independent colored surface changes outline. Scaling the complete button is not equivalent.
- Resize/maximize remains a separate interaction and continues to use spring `520 / 42 / 0.72`.
- Reduced motion: geometry transfer and delayed reveal become immediate state changes.

## Library finding

- The recording contains pixels only; it does not contain the source DOM, JavaScript bundle, or a product URL. The exact source animation library therefore cannot be proven from this artifact.
- The measured motion has explicit plateaus, no overshoot, and a deterministic opacity falloff. It is consistent with a keyframed tween in CSS/WAAPI, GSAP, or Motion, and inconsistent with treating the trigger transfer as a spring.
- Dionysus implements the verified curve with its existing `motion/react` dependency. Motion is the implementation choice here, not a claim about the inaccessible source code.

## Acceptance checklist

- [x] Open and close preserve one bottom-right spatial origin.
- [x] The panel no longer animates from an arbitrary 360 × 420 intermediate size.
- [x] The trigger visibly transfers energy through a vertical bloom instead of a generic fade/slide.
- [x] Trigger text, icon, WebGL field, and radius are not transform-scaled with the bloom.
- [x] Saturated green reaches peak geometry near 50ms and falls below 25% contrast near 70ms.
- [x] Shell geometry and panel content use separate phases.
- [x] Resize/maximize timing remains independent from open/close timing.
- [x] Reduced-motion behavior remains immediate and readable.

## Evidence

- `reference-dense/contact/`: full-frame 0.1s overview.
- `reference-detail/open-frames/contact/contact_01.jpg`: 60fps-equivalent opening sequence.
- `reference-detail/close-frames/contact/contact_01.jpg`: 60fps-equivalent closing sequence.
- `reference-button-open-geometry.csv` and `reference-button-close-geometry.csv`: measured green silhouette geometry.
- `candidate/refined-open-dense/contact/`: post-repair browser recording sampled every 40ms.
- `comparison-report.md`: timestamped failure diagnosis and final disposition.
