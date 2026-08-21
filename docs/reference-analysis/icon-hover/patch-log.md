# Navigation icon hover — patch log

## Objective

Recreate the reference video's icon-to-arrow hover handoff as a reusable Dionysus UI primitive, apply it to the design-system primary navigation, and document its rationale and use rules in the Foundations navigation.

## Passes

1. Reference analysis: extracted 0.5s overview frames and 0.05s transition windows; classified the effect as an interruptible two-layer SVG handoff.
2. Component capture: added `NavArrowMorphIcon` and a shared `data-nav-icon-trigger` interaction contract.
3. Integration: replaced every primary-navigation glyph in the shared desktop/mobile `Navigation` with the component and added the Foundations → 动效 entry.
4. Documentation: added a live specimen, benefits, timing, best practices, accessibility guidance, stable API export, and the durable `DESIGN_SYSTEM.md` contract.
5. Live browser verification: passed desktop expanded/collapsed, 390 × 844 drawer, pointer hover, keyboard focus-visible, semantic DOM, typecheck, and production build.
