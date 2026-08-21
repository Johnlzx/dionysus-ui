# Component Catalog · AgentConversationCorner

## Purpose

A bottom-right Agent work layer that can be summoned without hard-splitting the primary workspace. It combines a Prismatic trigger, resizable conversation surface, in-window history, async process feedback, streaming reveal, cancellation, retry, and response feedback.

## Source reference

- Reference: `Screen Recording 2026-08-21 at 09.08.47.mov`
- Relevant intervals: 2.0–15.0s for enter/resize/history; 15.0–25.0s for session management; 37.7–42.5s for compose/thinking/streaming/complete.
- Fidelity: visual-level interaction recreation under Dionysus tokens; source branding and assets are intentionally excluded.

## Public surface

- Component: `AgentConversationCorner`
- Data: `AgentConversation`, `AgentMessage`, `AgentQuickAction`
- Async boundary: `onGenerateResponse(prompt, { conversationId, signal })`
- Persistence boundary: `onConversationsChange(conversations)`
- Product callbacks: `onAttach`, `onFeedback`, `onOpenChange`
- Geometry: `defaultSize`, `minSize`, `AGENT_CORNER_SIZE`

## Timing contract

- Open/close origin: bottom-right.
- Trigger bridge: independent clipped surface; 180ms open with a 50ms geometry peak and rapid contrast decay, 167ms monotonic close settlement. Never transform-scale the trigger content.
- Preset/maximize spring: stiffness 520, damping 42, mass 0.72.
- In-window view transition: 180ms, `cubic-bezier(0.22, 1, 0.36, 1)`.
- Thinking verb cadence: 720ms.
- Energy resolve: 300ms opacity decay.
- Manual resize: direct pointer mapping with no interpolation.

## State contract

`closed → empty → thinking → streaming → complete | stopped | error`

History and resizing are orthogonal window states. A session can be selected while another request finishes; AbortSignal stops the original request, and partial output is marked `stopped` rather than discarded.

## Evidence

- Reference overview contact sheets: `reference/contact/`
- Dense send interval: `reference-dense/contact/`
- Dense open/close measurements and candidate: `../agent-conversation-motion/`
- Candidate closed/open/maximized/thinking/dark states: `candidate/`
- Browser QA: manual left-edge resize changed the panel from 448px to 560px while its right edge remained fixed at 1059px.
- Focus QA: closing the panel restored focus to the `召唤 Agent` trigger.
- Build QA: workspace TypeScript and Vite production build pass.

## Known limits

- The shared component renders returned text progressively; applications with token streaming should adapt the response boundary or evolve it to accept an async iterable.
- Session persistence, attachment selection, feedback storage, authorization, and network protocols remain product responsibilities.
- On narrow containers the desktop surface is clamped to available width/height. Products should still consider a dedicated bottom-sheet pattern when touch targets or task density require it.
