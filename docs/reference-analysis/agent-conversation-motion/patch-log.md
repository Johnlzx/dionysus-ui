# Agent Conversation Open / Close · Patch Log

## Pass 0 · Reference breakdown

- Classified the request as visual-level fidelity.
- Extracted 55 whole frames at 0.1s and dense bottom-right crops around four transitions.
- Identified a two-stage opening: shell geometry first, content reveal second.
- Identified the trigger's non-uniform vertical bloom as the main continuity cue.

## Pass 1 · Motion contract

- Replaced the panel's `360 × 420 + scale(.94) + spring` entry with fixed final geometry and bottom-right `scaleX / scaleY` resolution.
- Split shell, content, trigger-transfer, resize, and view-switch timing into separate contracts.
- Added the inverse close sequence and kept reduced-motion transitions immediate.
- Updated the public motion exports and design-system documentation.

## Pass 2 · Browser layer correction

- Recorded the implementation at 25fps and sampled the opening every 40ms.
- Confirmed shell settlement and delayed content reveal match the reference sequence.
- Raised the outgoing/incoming trigger above the panel shell so the vertical transfer remains visible during the crossfade instead of being occluded by the new surface.
- Extended trigger overlap through 200ms and moved content reveal to 260ms so the bloom remains legible before the interface fades in.
- Kept the returning trigger at 160ms so its tall peak survives for two 25fps frames before settling, matching the reference close cadence.

## Pass 3 · Silhouette and compositing correction

- Re-measured every 16.7ms reference frame instead of relying on the earlier visual estimate. The source reaches `112 × 112` near 50ms, but its green contrast has already fallen to roughly 53% and drops near 21% on the next frame.
- Identified the actual mismatch: the implementation transform-scaled the complete `PrismaticButton`, stretching its glyphs, WebGL field, and corner radius while keeping the saturated layer visible too long.
- Replaced whole-button `scaleX / scaleY` with an independent clipped green surface. The surface changes outline; the real button and a fixed-size label crossfade without geometric distortion.
- Rebuilt the reverse transition from measured close frames: tall reveal, one-frame square peak, monotonic pill settlement, no spring or overshoot.
- Recorded the repaired browser candidate, extracted 40ms dense contact sheets, and used deterministic Web Animations scrubbing to verify the 0–167ms close keyframes despite recorder frame drops.
- Re-ran both package typechecks after the implementation change: pass.

## Pass 4 · Interrupted-session recovery and final QA

- Resumed from the fixed-timeline capture left by the interrupted task; no completed analysis or implementation work was repeated.
- Generated the timestamp-aligned `candidate/final-open-side-by-side.jpg` from the deterministic `0 / 17 / 50 / 100 / 150 / 180 / 300ms` browser frames.
- Re-checked the open and close contacts against the measured geometry. The ordinary recorder still skips the close peak, so the 16.7ms reference measurements and paused Web Animations keyframes remain the timing source of truth.
- Verified the live documentation route: open disables the trigger; close re-enables it and restores focus to `召唤 Agent`.
- Hid the disabled trigger from the accessibility tree while the panel is open, removing a duplicate inactive control without changing the visual transition.
- Re-ran workspace TypeScript checks, the production build, and `git diff --check`: pass. The existing Vite chunk-size notice remains informational.
