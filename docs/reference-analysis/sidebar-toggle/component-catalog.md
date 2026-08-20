# Component Catalog — Collapsible App Sidebar

## Component

`CollapsibleSidebar + SidebarHeader + SidebarToggle`

A desktop App Shell pattern that turns a labeled navigation sidebar into an icon rail while the main canvas reflows into the released space.

## Source

- Reference: `Screen Recording 2026-08-20 at 09.22.11.mov`
- Primary motion windows: collapse 1.500–1.750s; expansion 4.450–4.750s.

## When to use

- Persistent desktop navigation where users benefit from reclaiming horizontal space.
- Workspaces where navigation context must remain accessible as icons.
- Layouts with a real flex/grid canvas that can grow as the sidebar narrows.

Do not use this pattern as a mobile drawer, an overlay navigation panel, or a way to hide task-critical status.

## Inputs

| Input | Type | Default | Purpose |
| --- | --- | --- | --- |
| `collapsed` | `boolean` | required | Controlled terminal state. |
| `expandedWidth` | `number` | `256` | Expanded width in px. |
| `collapsedWidth` | `number` | `56` | Icon-rail width in px. |
| `id` | `string` | optional | Target for toggle `aria-controls`. |
| `className` | `string` | optional | Surface/layout styling only. |
| `SidebarHeader.toggle` | `ReactNode` | required | Moving toggle control. |

## Timing contract

- Width: `{ type: "spring", stiffness: 820, damping: 49, mass: 0.72 }`.
- Toggle x on collapse: `{ type: "spring", stiffness: 1500, damping: 63, mass: 0.65 }`; it leads the width toward rail center.
- Toggle x on expansion: `{ type: "spring", stiffness: 850, damping: 49, mass: 0.65 }`; it stays behind the expanding clip edge.
- Width endpoints: 256px → 56px.
- Toggle center endpoints: x=234px → x=28px.
- Visual stability: 180–220ms; no overshoot.
- Brand exit: 120ms, opacity 1→0, x 0→−8px.
- Brand entry: 60ms delay, then 160ms to opacity 1 and x=0.

## Element choreography

1. The controlled state changes immediately.
2. Labels, group headings, shortcuts, and badges enter/leave visual layout immediately.
3. Icons switch between the left anchor and the current sidebar center without scaling.
4. Width and toggle x animate independently from their current values and velocities.
5. Root overflow clips expanding text and brand content.
6. The main canvas reflows through the parent layout; it is never covered by the sidebar.

## Accessibility

- Toggle: `aria-expanded`, `aria-controls`, dynamic `aria-label`, and `title`.
- Collapsed navigation items retain explicit accessible names and tooltips.
- Brand content is inert and hidden from accessibility APIs while visually collapsed.
- Focus-visible rings remain inside the rail.
- `useReducedMotion()` switches all Motion transitions to duration zero.

## Evidence and limits

- Evidence: [`alignment-report.md`](alignment-report.md) and its linked contact sheets.
- Stack: React, Motion, semantic HTML, shared Button and semantic tokens.
- Fidelity claim: visual-level only. Product-specific copy, icons, token widths, colors, and fonts are expected to differ from the source.
