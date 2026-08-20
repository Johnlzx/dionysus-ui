# Component catalog — CompactSelect

## Summary

`CompactSelect` is a single-select input for settings rows, dense toolbars and short filters. Its menu opens around the current selection: the selected option occupies the exact screen position of the closed trigger, preserving spatial continuity.

## Reference

- Source: `Screen Recording 2026-08-20 at 22.46.32.mov`
- Relevant range: 0.00–6.20s
- Visual evidence: `reference-open-crop.jpg`, `contact/open-dense.jpg`, `contact/second-open-dense.jpg`

## When to use

- a small, stable, mutually exclusive option set
- a setting should remain visibly editable without hover discovery
- the result can apply immediately or the containing settings pattern owns persistence feedback
- no search, grouping, multi-select, descriptions or command items are required

Use `DropdownMenu` / Combobox for richer option discovery. Use `InlineEdit` when the pattern must own optimistic persistence, saving/error feedback, rollback or multiple editor types.

## Public API

- `label`: accessible field name
- `options`: stable `value`, `label`, optional `textValue`, `visual`, `disabled`
- `value` / `defaultValue`: controlled or uncontrolled selection
- `onValueChange(value, option)`: selection boundary; persistence stays outside the primitive
- `open` / `defaultOpen` / `onOpenChange`: controlled or uncontrolled menu state
- `align`: `start | center | end`, with `center` as the reference default
- `triggerClassName` / `panelClassName`: layout adaptation without changing the 32px density contract

## Timing and geometry contract

- trigger: 32px high, 8px radius, 10px horizontal padding, 6px gap
- menu: content width with an 8px minimum bleed beyond the trigger, 4px inset, 11px radius
- option: 32px high, 8px radius, 8px horizontal padding
- placement: selected-option center equals trigger center before viewport clamping
- enter/exit: 110ms, `cubic-bezier(0.22, 1, 0.36, 1)`, scale `0.985 → 1`
- reduced motion: duration 0

## Implementation

- React controlled/uncontrolled state
- React DOM Portal to avoid ancestor clipping
- Motion `AnimatePresence` for a short origin-aware transition
- ResizeObserver plus scroll/resize listeners for collision-safe positioning
- semantic design tokens for Raised Surface, border, hover/selected, ring and shadow
- `button + listbox + option`, roving focus, Home/End, Escape and 500ms typeahead

## Acceptance evidence

- `alignment-report.md`
- `candidate-open.png`
- `candidate-dark.png`
- `visual-qc.mjs` reproducible local Chrome measurement

## Limits

- single-select only
- does not persist data, announce save state or roll back failed writes
- does not infer mobile presentation; consumers switch to native Select or Bottom Sheet when needed
- visual-level alignment only; browser/font rasterization prevents a bit-exact claim

