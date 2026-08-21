# Agent Conversation Corner · Reference Analysis

## Fidelity decision

- Target: visual-level recreation of the interaction language, adapted to Dionysus tokens and product semantics.
- Source: `Screen Recording 2026-08-21 at 09.08.47.mov`, 2920 × 1660, 46.497s, approximately 60fps.
- Evidence: 0.5s overview sampling and 0.1s dense sampling from 36.0–42.5s in this directory.
- Deliberate difference: the reference application’s imagery, copy, and brand chrome are not copied. The component preserves its window geometry, state changes, feedback rhythm, and interaction model.

## Visual thesis

A quiet white workspace gains one warm, precise floating instrument: the Agent is present and spatially independent, but it never hard-splits or permanently compresses the primary canvas.

## Content plan

1. A single Prismatic trigger marks availability without competing with the workspace.
2. A bottom-right floating conversation surface owns empty, history, thinking, streaming, complete, and error states.
3. Header actions expose history, new conversation, resize/maximize, and close without adding a second navigation system.
4. The composer remains the stable anchor while conversation content and feedback change above it.

## Interaction thesis

1. The trigger and panel share a bottom-right origin; open/close and maximize preserve that spatial relationship.
2. Resize is continuous from the top and left edges, while preset/maximize transitions use a restrained spring and can reverse immediately.
3. Sending creates a short “energy transfer” around the composer, paired with changing process verbs and an ASCII signal; the effect resolves as answer text streams in.

## Reference timeline

| Time | Observed state | Implementation contract |
| --- | --- | --- |
| 0.0–2.0s | Main workspace with a small green trigger at bottom-right. | Trigger is the only high-emphasis action in its surface and uses `PrismaticButton`. |
| 2.0–2.7s | A compact card grows from the trigger origin. | Bottom/right stay fixed; opacity, y, scale, width, and height settle together. No page split or overlay scrim. |
| 4.0–11.5s | The window repeatedly moves between compact, intermediate, and near-full sizes. | Continuous top/left edge resize plus a maximize toggle; content keeps stable line measures and composer anchoring. |
| 14.0–15.0s | Conversation view changes to history. | In-window horizontal view transition; parent panel geometry does not jump. |
| 15.0–19.0s | History list, new conversation, and a populated previous conversation are reviewed. | Sessions remain operable without leaving or recreating the panel. |
| 20.0–22.5s | Delete affordance enters a confirmation state with helper text. | First activation arms deletion and changes label/state; second activation confirms; timeout cancels the arm state. |
| 23.0–25.0s | History is closed and the empty conversation returns. | Header controls retain position and focus continuity. |
| 29.0–31.0s | Add-file affordance is inspected. | Composer actions provide tooltips and never shift input geometry. |
| 34.0–36.0s | Window expands to a large writing mode. | Maximize is reversible and restores the last manual size. |
| 37.7–38.5s | Text is composed and sent. | Enter submits, Shift+Enter inserts a line break, and IME composition cannot submit early. |
| 38.6–40.5s | User message appears; green status glyph/word begins; luminous color spreads behind the composer. | Thinking state is announced in a live region, cycles verbs without layout shift, exposes stop, and keeps the input surface stable. |
| 40.5–41.7s | Answer streams while the energy field decays. | Content reveals progressively; the feedback field resolves rather than cutting off. |
| 41.7s onward | Answer is complete and response actions appear. | Copy, retry, positive, and negative feedback become keyboard reachable only after completion. |

## Motion parameters

- Panel enter: 320–420ms spring, origin at bottom-right, scale 0.94 → 1, y 18 → 0, opacity 0 → 1.
- Panel close: 150–180ms ease-in, inverse of enter, with trigger focus restored.
- Resize/maximize: manual resize is direct; preset changes use spring `stiffness 520 / damping 42 / mass 0.72`.
- View switch: 160–200ms x/opacity transition; direction preserves history ↔ conversation hierarchy.
- Thinking verb: 720ms cadence with a 140ms y/opacity handoff; the ASCII cell keeps a fixed width.
- Composer energy: three blurred token-derived lobes, 1.6s loop, decaying over roughly 300ms after streaming completes.
- Stream reveal: character/chunk reveal in the demo; consumers can replace it with real stream updates.
- Reduced motion: no resizing interpolation, no cycling glyph transform, no moving energy field; readable status and final states remain.

## Acceptance checklist

- [x] Opens as a floating card with no hard workspace split and no scrim.
- [x] Compact, manual resize, maximize, restore, close, and reopen all preserve a bottom-right origin.
- [x] History, new session, session selection, and two-step deletion work with keyboard and pointer.
- [x] Composer supports suggestions, attachment callback, multiline input, IME safety, submit, and cancel.
- [x] Thinking, streaming, completion, error, retry, and response feedback are visible and announced.
- [x] Light/dark themes consume only shared semantic tokens.
- [x] `prefers-reduced-motion` produces an equivalent, readable flow.
