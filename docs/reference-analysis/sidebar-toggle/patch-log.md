# Sidebar Replica Patch Log

## Pass 1 — reference extraction

- Extracted the 7.98s reference at 250ms for overview and at 50ms around both transitions.
- Identified two independent tracks: sidebar width and toggle x.
- Identified immediate label/badge layout switching, overflow clipping, centered collapsed icons, delayed brand return, and stable icon y positions.

## Pass 2 — reusable implementation

- Added `motion` to `@dionysus/ui`.
- Created `packages/ui/src/sidebar.tsx` with controlled root, header, toggle, shared dimensions, and exported spring contract.
- Integrated the component into the real documentation shell.
- Added icon-rail treatment, compact status treatment, accessible names, tooltips, and focus semantics.

## Pass 3 — browser verification

- Verified expanded and collapsed states at 1440×900.
- Verified accessibility snapshots retain every navigation item and control name in collapsed mode.
- Recorded browser candidate and generated 40ms contact sheets.
- Initial video-only reading suggested a shorter duration; `requestAnimationFrame` sampling showed the low-stiffness trial actually had a 293ms 95% settle and a long tail.

## Pass 4 — timing repair

- Measured the reference boundary itself: 28% at 50ms, 68% at 100ms, 87% at 150ms, 96% at 200ms, and 99.7% at 250ms.
- Tuned the critically damped width spring to `820 / 49 / 0.72`.
- Split the toggle trajectory by direction: collapse `1500 / 63 / 0.65` leads the width into rail center; expansion `850 / 49 / 0.65` remains behind the expanding clip edge.
- Measured final width alignment: about 92% at 152ms, 98% at 202ms, and 99.5% at 252ms, matching the reference curve.
- Verified reduced motion reaches terminal width in the next React commit.

## Pass 5 — design-system capture

- Added an interactive `Sidebar motion` section to the App Shell documentation page.
- Added exact endpoints, springs, brand timing, layout choreography, interruption semantics, and accessibility rules to `docs/DESIGN_SYSTEM.md`.
- Captured expanded/collapsed live-spec screenshots and final acceptance evidence.

## Pass 6 — final evidence refresh

- Re-recorded the browser candidate after the final `820 / 49 / 0.72` width spring and asymmetric toggle springs were applied.
- Regenerated the final 40ms collapse/expansion contact sheets and the 1s whole-recording scan from that build.
- Refreshed both live-spec screenshots so their visible parameter labels match the exported motion constants.
- Removed the specimen-only 224px width override so the live example, documented 256px endpoint, and x=234px toggle anchor use the same contract.
- Re-sampled the live component in a clean no-reduced-motion browser: width reached about 90% at 157ms and 97.5% at 206ms, with no overshoot.
- Verified exact 256px/56px terminal states, dynamic `aria-expanded` and accessible names, 80ms interruption/reversal, zero page errors, workspace typecheck, and production build.
