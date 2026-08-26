# Dionysus website design system

> This is the private presentation system for the Dionysus website. It is not part of the publishable `@dionysus/ui` product design system and must not be imported by product surfaces.

## Source and boundary

The system recreates the visual grammar of the supplied Figma capture (`3:732`, 1920px desktop) and the observed interaction behavior of `zed.dev` while retaining Dionysus content and routes.

- Website primitives live in `apps/web/src/landing/landing-system.tsx`.
- Website tokens and primitive styles live in `apps/web/src/landing/landing-system.css`.
- Page-specific compositions live in `apps/web/src/landing/landing-page.tsx` and `landing.css`.
- Public components, semantic product tokens, and docs specimens continue to live in `packages/ui` and `docs/DESIGN_SYSTEM.md`.
- Do not export website primitives from `@dionysus/ui`. A marketing rail, slash divider, or hero orbit is not a product primitive.

## Geometry

The desktop layout uses an engineering-drawing frame instead of free-form containers.

| Role | Value | Contract |
| --- | ---: | --- |
| Header | 57px | Sticky, translucent paper, one-pixel lower rule |
| Announcement | 36px | Centered editorial line; 82px on mobile |
| Content rail | 1120px | Maximum central content width |
| Outer rail | 48px | Viewport construction line on wide screens |
| Hero | 448px | Fixed on desktop and mobile |
| Slash divider | 14px | One-pixel rules with a slow diagonal hatch |
| Footer | 632px | Full blue field with outlined watermark |

Desktop main-section heights follow the source rhythm exactly: `728 / 1115 / 450 / 567 / 755 / 809 / 586 / 579 / 450px`. At 1280px the central rail begins at x=80; at 1920px it begins at x=400. Below 1200px the outer and content rails collapse to 24px, then 16px below 640px.

Every major section uses `LandingRailSection`. It owns the central borders, bottom rule, scroll offset, and diamond nodes. Page code must not redraw those elements.

## Color

All website colors are scoped beneath `.landing-page`.

| Token | Value | Use |
| --- | --- | --- |
| `--site-blue` | `#1348dc` | Brand action, editorial headline, focus |
| `--site-blue-hover` | `#0d3ec6` | Primary action hover |
| `--site-ink` | `#0d0f12` | Primary text and dark UI |
| `--site-copy` | `#393d45` | Body text |
| `--site-muted` | `#727a89` | Metadata and secondary labels |
| `--site-paper` | `#f4f4f2` | Page canvas |
| `--site-panel` | `#ffffff` | Raised light material |
| `--site-line` | blue at 10.5% | Construction rules |
| `--site-line-strong` | blue at 17% | Section boundaries and controls |

The page is intentionally light-only. Themeable product examples can appear inside the dark editor specimens, but the marketing canvas does not inherit the documentation theme.

## Typography

- Body and navigation use the site's Inter Variable stack.
- Hero and small editorial moments use Iowan Old Style / Palatino / Georgia with a Chinese Song serif fallback.
- Code, metrics, keycaps, and tokens use the product mono stack.
- The desktop hero is 48/57.6px, italic, weight 340, tracking −0.96px.
- Normal marketing copy stays between 11px and 14px on desktop. Mobile hero copy rises to 16px.
- Headings use balanced wrapping; paragraphs use pretty wrapping where supported.

## Components

### `LandingRailSection`

The only wrapper for a primary website section. Use `labelledBy` to connect the section to a visible heading. It automatically provides rail borders and diamond nodes.

### `LandingSlashDivider`

Separates major chapters. It is decorative and hidden from assistive technology. Do not place content inside it.

### `LandingAction`

Website link action with `primary`, `secondary`, and `text` tones. It supports an approved icon and optional keyboard hint. Primary actions use an inset lower edge, not a floating gradient.

### `LandingSectionHeader`

The 98px desktop heading band for a chapter. It accepts a title, short description, and a compact action group. Center alignment is reserved for trust/open-source statements.

### `LandingKeycap`

Displays an optional shortcut hint; it never creates keyboard behavior on its own. If a shortcut is shown, the application must implement it before production release.

## Motion

Motion mirrors the observed site timings and remains GPU-friendly.

| Motion | Timing | Behavior |
| --- | --- | --- |
| Hero geometry | 50s linear infinite | Rotates the SVG group only |
| Hero copy | 1.6s, 1.4s delay | `translateY(-14px)` and opacity |
| Product window | 1.2s | `translateY(14px) scale(.99)` to rest |
| Open glyph rows | 300s linear infinite | Paired forward/reverse marquees |
| Footer/finale geometry | 32s linear infinite | Slow rotation |
| Hover feedback | 140–170ms | One-pixel lift, border, or arrow shift |

All continuous motion stops through the global `prefers-reduced-motion` rule in `landing-system.css`. Animations may change only `transform` and `opacity`.

## Responsive behavior

At 640px and below:

- Header navigation becomes a labelled menu button and an in-flow popover menu.
- Announcement wraps to 82px instead of truncating.
- Hero actions become full-width stacked buttons.
- The product cluster reverses so the editor specimen appears before the three benefit statements.
- Multi-column cards become one or two columns according to reading density.
- Interactive tab specimens stack below the tabs.
- Fixed desktop section heights become content-driven.
- Footer becomes two columns and preserves the blue watermark field.

No section may cause viewport-level horizontal scrolling at 320px.

## Accessibility and review gates

- Every section with meaningful content has a heading association.
- Interactive tabs use `tablist`, `tab`, `aria-selected`, and `tabpanel`.
- Menu and tab controls have visible focus rings.
- Decorative geometry, hatches, and marquees are excluded from the accessibility tree.
- The skip link is the first focusable item.
- Links must point to real application routes; the landing page does not use `href="#"` placeholders.
- Verify at 1280×720 and 390×844, with reduced motion enabled, before merging layout or motion changes.
