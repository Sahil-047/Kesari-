# Kesari Studio — Design System (Master)

Source of truth for the CMS at `/admin`. Derived from the **ui-ux-pro-max** skill data
(product profiles *Luxury/Premium Brand* + *Productivity Tool*, style *Minimalism & Swiss*,
pairing *Classic Elegant*). Page-specific overrides go in `pages/<page>.md`.

Implementation: tokens in `frontend/src/components/admin/AdminProviders.tsx` (Ant Design
`ConfigProvider`), mirrored as CSS variables in `frontend/src/app/admin/admin.css`.

## Direction

- **Pattern:** data-dense back office for a luxury fashion house. Clarity over ornament.
- **Style:** Minimalism & Swiss, with micro-interactions for feedback. One primary colour,
  no decoration, surfaces separated by borders (not shadows); only floating layers
  (popovers, drawers, toasts) get elevation.
- **Avoid:** glassmorphism and chromatic effects (the skill suggests them for *storefronts*,
  not internal tools), gradients, multi-hue status colours, emoji icons, slow (400ms+) motion.

## Colour (warm stone, one ink)

| Role | Token | Hex | Use |
|---|---|---|---|
| Primary / ink | `STUDIO.ink` | `#1c1917` | Primary buttons, selection, focus ring, chart bars, solid badges |
| Ink soft | `inkSoft` | `#44403c` | Hover/pressed ink, form labels |
| Foreground | `text` | `#0c0a09` | Body and headings |
| Muted text | `muted` | `#57534e` | Secondary text (7.6:1 on white) |
| Faint text | `faint` | `#78716c` | Tertiary text, helper text; **lowest allowed for text** (4.8:1) |
| Disabled | `disabled` | `#a8a29e` | Disabled and decorative only, never text that must be read |
| Border | `border` | `#d6d3d1` | Inputs, cards |
| Hairline | `hairline` | `#e7e5e4` | Dividers, table rules |
| Wash | `wash` | `#f5f5f4` | Hover/selected fills, soft badges |
| Canvas | `subtle` | `#fafaf9` | Page background |
| Accent (gold) | `gold` | `#a16207` | **Brand only**: logo mark, active-nav rule. Never carries meaning |
| Destructive | `danger` | `#dc2626` | Errors, delete actions only |

Status is shown by **badge weight, not hue** (`StatusTag`): solid = done/live,
outline + dot = needs attention, soft = in progress, muted = off. Mapping lives in
`frontend/src/lib/admin/format.ts`.

## Typography

- **Display:** Playfair Display 600, page titles (28px), login hero, drawer titles, brand mark.
  Never on controls, tables or figures.
- **UI / body:** Inter 400/500/600. Body 14px / 1.55. Labels 500. Headings 600.
- **Figures:** tabular numerals for money, counts and tables.
- **Table headers:** 12px, uppercase, 0.05em tracking, muted.
- Scale: 12 · 14 · 16 · 19 · 26 (KPI) · 28 (title) · 48 (hero).

## Shape, space, motion

- Radius: 4 (thumbnails) · 6 (controls) · 10 (cards). Badges are pills.
- Spacing: 8pt scale; page gutters 32px; max content width 1280px.
- Motion: 100ms feedback, 180ms state changes, 240ms surfaces; ease-out
  `cubic-bezier(0.23, 1, 0.32, 1)`. Buttons press to 0.98. Everything collapses under
  `prefers-reduced-motion`.

## Accessibility (must keep)

- Text contrast ≥ 4.5:1 (see colour table); visible 2px ink focus ring on keyboard focus.
- "Skip to content" link targets `#studio-main`.
- Icon-only controls carry `aria-label` (sidebar toggle, account menu, media card actions,
  repeater move/remove).
- Charts expose a text summary via `aria-label`; values are also available in tables.
- Destructive actions confirm first (`Popconfirm`) and are visually separated from primary actions.
- Field errors sit under the field; save errors also appear in an alert at the top of the drawer.

## Components

| Component | Notes |
|---|---|
| `AdminShell` | Light sider with hairline border, translucent sticky header, gold active-nav rule |
| `ScreenHeader` / `ScreenBody` | Title in display serif on the canvas; consistent 1280px container |
| `ResourceManager` | Table + Drawer form, sections as small cards, hints as helper text |
| `StatusTag` | The only status indicator; do not use coloured Ant `Tag`s |
| `MediaDrop` / gallery | Upload.Dragger on canvas tone, ink on hover |
| `RevenueChart` | Ink bars, subtle dashed grid, tooltip, screen-reader summary |
