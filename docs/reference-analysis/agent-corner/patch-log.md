# Agent Conversation Corner · Patch Log

## Pass 0 · Reference breakdown

- Extracted 93 frames at 0.5s across the full 46.5s source.
- Extracted 66 frames at 0.1s across the send/thinking/streaming interval.
- Classified the work as visual-level fidelity under the Dionysus design system.
- Established the reusable component contract and acceptance checklist in `alignment-report.md`.

## Pass 1 · Shared component

- Added `AgentConversationCorner` as a shared `@dionysus/ui` export with controlled/uncontrolled open state.
- Implemented bottom-right enter/close, direct top/left resize, maximize/restore, focus return, and narrow-container clamping.
- Implemented in-window history, new/select session, and a visible two-step deletion confirmation.
- Implemented quick prompts, attachment callback, IME-safe composer, AbortSignal cancellation, error/retry, streamed text reveal, and response feedback.
- Added process verbs, an ASCII glyph cell, and a token-derived three-lobe composer energy field.

## Pass 2 · Design-system adoption

- Added semantic Agent shadow/composer tokens and reduced-motion-compatible animations to the shared stylesheet.
- Added a live documentation route, full specimen, state model, motion contract, accessibility guidance, and API table.
- Registered the component contract in `docs/DESIGN_SYSTEM.md`.

## Pass 3 · Browser verification

- TypeScript: pass for `packages/ui` and `apps/web`.
- Production build: pass; existing Vite chunk-size warning remains informational.
- Manual resize: 448px → 560px while right edge stayed fixed at 1059px.
- History and two-step deletion: pass.
- Send/thinking/streaming/complete/feedback: pass.
- Maximize/restore and focus return to trigger: pass.
- Narrow viewport clamping and dark theme: pass.
- Visual evidence saved under `candidate/`; final comparison in `comparison-report.md`.

## Pass 4 · Interrupted-session recovery

- Re-read the interrupted Codex task and resumed from its last completed verification state instead of rebuilding the component.
- Re-ran workspace TypeScript checks and the Vite production build: pass; the existing informational chunk-size warning remains.
- Re-checked the live documentation route in a real browser: floating open/close, in-window history, visible delete confirmation, completed response actions, maximize/restore, and error/retry all pass.
- Verified that closing the panel restores focus to the `召唤 Agent` trigger.
