# Compact Select patch log

## Pass 1 — semantic split

- Compared the reference with `DropdownMenu` and `InlineEditSelect`.
- Classified the reference as a persistent, compact single-select input rather than an action menu or a full inline-edit persistence pattern.
- Added a separate `CompactSelect` API to keep semantics explicit.

## Pass 2 — reference geometry

- Implemented 32px trigger/options, content-derived menu width, 4px inset and selected-row anchoring.
- Added center alignment, viewport clamping, Portal rendering and origin-aware 110ms transition.
- Integrated light/dark semantic tokens and the live design-system specimen.

## Pass 3 — pixel calibration

- Headless Chrome measured 32px trigger/options, 184×266px eight-item menu and exact selected-row/trigger Y alignment.
- Adjusted trigger/row radius from the system default 10px to the reference 8px.
- Adjusted menu radius from the system default 14px to the reference 11px.
- Included the 1px panel border in the selected-row anchor calculation, removing a 1px vertical offset.

## Pass 4 — interaction regression

- Verified Arrow navigation, Home/End, Escape focus restoration, outside close and selection close.
- Found a one-frame race when typeahead was followed immediately by Enter; changed option focus from deferred animation-frame focus to synchronous focus.
- Re-ran the same sequence successfully: `m` + Enter selects `My issues`, and the menu fully unmounts after exit.
- Verified a non-first selected item and dark-theme token resolution.

