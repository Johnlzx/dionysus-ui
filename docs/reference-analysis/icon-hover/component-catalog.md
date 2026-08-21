# Reusable motion component

## NavArrowMorphIcon

- Purpose: turn a stable navigation glyph into a right arrow on hover or keyboard focus, clarifying that the row leads to another location.
- Source reference: `Screen Recording 2026-08-21 at 08.48.40.mov`, especially 0.45–0.65s, 3.05–3.15s, and 6.30–6.70s.
- Use when: a persistent sidebar or menu row navigates to another page and already has a clear text label.
- Inputs: `icon: LucideIcon`, optional `className`; the interactive ancestor owns `data-nav-icon-trigger`.
- Timing contract: 160ms enter, 120ms exit, `cubic-bezier(0.16, 1, 0.3, 1)`; transforms and opacity only.
- Implementation: React, CSS, two co-located Lucide SVG layers.
- Accessibility: both glyphs are decorative; the row label provides the accessible name; `:focus-visible` mirrors hover; reduced-motion swaps instantly.
- Known limits: this is a visual-level handoff, not path-by-path SVG interpolation. Do not use it on destructive actions, disclosure controls, disabled rows, or icon-only controls whose icon must remain the sole label.
- Evidence: `comparison/motion-state-comparison.jpg`, `reference-recents-dense/contact/contact_01.jpg`, `candidate/candidate-sequence.jpg`, and the measured browser states recorded in `alignment-report.md`.
