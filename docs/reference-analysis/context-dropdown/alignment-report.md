# Compact Select alignment report

## Objective

- Reference: `/Users/zhongxin/Desktop/Screen Recording 2026-08-20 at 22.46.32.mov`
- Segment: full 7.866667s recording, 1536×1704, 60fps source stream
- Target: reusable React `CompactSelect` in `packages/ui`
- Fidelity: visual-level pixel alignment, not decoded-frame or bit-exact identity
- Sampling: 0.5s full-timeline scan, with 0.05s sampling around open, hover and selection windows
- Acceptance: geometry, selected-item anchoring, typography scale, surface treatment, state changes, keyboard behavior and light/dark integration

## Reference timeline

| Time | State | Evidence / observation |
| --- | --- | --- |
| 0.00s | Closed | 32px bordered trigger, value + downward Chevron |
| ~0.15s | Pressed | Trigger uses a neutral hover/pressed fill without moving surrounding layout |
| ~0.25s | Open | Menu replaces the trigger visually; the selected row center remains on the trigger center |
| 0.25–1.85s | Navigate | Hover highlight moves across 32px rows; Check remains on the selected value |
| ~1.90s | Select | `My issues` replaces the trigger value and the menu closes immediately |
| ~4.10s | Open second field | Two-item menu uses the same selected-row anchoring and content-derived width |
| 4.30–6.00s | Navigate | `Full name` receives hover while `Username` retains the Check |
| ~6.10s | Select | `Full name` becomes the trigger value; no page reflow or confirmation modal |

## Extracted reference contract

| Property | Reference estimate (CSS px) | Candidate measurement |
| --- | ---: | ---: |
| Trigger height | 32 | 32 |
| Trigger radius | 8 | 8 |
| Trigger horizontal padding | 10 | 10 |
| Trigger gap | 6 | 6 |
| Text size | 13–14 | 13 |
| Menu inset | 4 | 4 |
| Menu radius | ~11 | 11 |
| Option height | 32 | 32 |
| Option radius | 8 | 8 |
| Option horizontal padding | 8 | 8 |
| Eight-item menu width | ~182–184 | 184 |
| Eight-item menu height | ~265–266 | 266 |
| Open transition | visually settled within ~100ms | 110ms |

## Anchor verification

Headless Chrome measured the reference implementation in the design-system specimen:

- closed trigger: `y = 631.5`, `height = 32`
- first selected option: `y = 631.5`, `height = 32`
- non-first selected option (`My issues`): `y = 631.5`, `height = 32`

The selected row therefore remains exactly co-linear with the closed trigger for both the first and a later option. Horizontal centering leaves the menu approximately 4px wider on each side, matching the reference behavior.

## Behavioral verification

- ArrowDown moves active focus from the selected row to `Inbox`.
- Escape closes and restores focus to the trigger.
- Typeahead `m` followed immediately by Enter selects `My issues`.
- Selection closes and fully unmounts the menu after the 110ms exit transition.
- Outside pointer/focus, viewport resize and ancestor scroll close or reposition without page reflow.
- Dark theme resolves Raised Surface, foreground and border exclusively from semantic tokens.
- Reduced motion removes the scale/fade duration.

## Evidence

- `contact/reference-halfsec.jpg`: 0.5s full-timeline contact sheet
- `contact/open-dense.jpg`: 0.05s opening and early hover window
- `contact/select-dense.jpg`: 0.05s first selection window
- `contact/second-open-dense.jpg`: 0.05s second-field opening window
- `reference-open-crop.jpg`: full-resolution reference component crop
- `candidate-open.png`: light-theme candidate in the live design system
- `candidate-dark.png`: dark-theme and non-first-selected anchor verification

## Decision

**Pass — visual-level aligned.** The component contract matches the reference geometry and interaction grammar. It is not described as bit-exact because the candidate is rendered in a different page, browser session and font-rasterization context from the source recording.

