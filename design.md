# Kesari — Design Guide

> Agent-facing reference for extending the website without changing its visual identity.
> Audited against the current frontend source on 2026-11-05. This is a source-based guide, not a browser-rendered or contrast-tested audit.

## 1. Scope and how to use this guide

The primary system below is the **public storefront**: Kesari by Bhumika Patel. `/admin` is a deliberately different **Kesari Studio** system; see §12. Do not mix the two.

Before building a new section:

1. Identify the closest existing section or component and read its current implementation.
2. Reuse the existing tokens, fonts, media components, controls, and layout primitives below.
3. Match the surrounding page's surface, container width, alignment, and spacing rhythm. Do not give every section an independent background or visual language.
4. Add only the variation the content needs. Cinematic route-specific effects are not a requirement for ordinary sections.
5. Check the result against §13 on mobile, desktop, keyboard, and reduced-motion settings.

**Source of truth:** `frontend/src/app/globals.css` for public tokens/utilities; `frontend/src/app/layout.tsx` for fonts; the nearest active component for composition. This document records shared conventions and recommends defaults where implementations vary. If source and documentation diverge, inspect the current code rather than inventing a replacement design system.

## 2. Brand character

**Warm, tactile, heritage-led luxury fashion editorial.** The site evokes paper, embroidery, an atelier, and Indian architectural details rather than a generic ecommerce dashboard.

- Let garment photography and craft detail lead; typography and ornament support them.
- Use warm parchment, brown-black ink, cream, and restrained antique gold.
- Pair elegant regular-weight serif display type with tiny, widely tracked sans-serif utility labels.
- Create hierarchy with scale, whitespace, alignment, hairlines, and texture—not heavy shadows or repeated boxed cards.
- Use arches, gold inset frames, and geometric motifs selectively. Not every section needs decoration.
- Keep copy concise, assured, and craft-focused. Existing language includes “The House,” “The Work,” “Explore,” and “Write to the house.” Avoid hype-heavy sales copy and unrelated dashboard terminology.

**Avoid:** cool gray/blue UI palettes, neon accents, generic white rounded-card grids, bold sans-serif marketing headings, oversized pill CTAs everywhere, glossy gradients, prominent drop shadows, or introducing another font family.

## 3. Color system

These variables are defined in `globals.css` and exposed through Tailwind v4 `@theme inline`; use semantic utilities such as `bg-parchment-light`, `text-ink`, and `border-gold` rather than duplicating hex values.

| CSS variable / utility name | Value | Intended role |
| --- | --- | --- |
| `--parchment` / `parchment` | `#b8a686` | Core warm paper tone |
| `--parchment-light` / `parchment-light` | `#d9cdb8` | Base body background, light foreground on dark surfaces |
| `--parchment-mid` / `parchment-mid` | `#c4b496` | Intermediate paper tone |
| `--parchment-deep` / `parchment-deep` | `#a89476` | Deeper paper tone |
| `--cream` / `cream` | `#ebe3d4` | Approved footer background, warm light text, inverse controls |
| `--gold` / `gold` | `#c5a059` | Rules, frames, motifs, restrained emphasis |
| `--gold-soft` / `gold-soft` | `#b8a070` | Eyebrows and subdued gold details |
| `--ink` / `ink` | `#2c241c` | Primary text and solid buttons |
| `--ink-soft` / `ink-soft` | `#4a3f35` | Secondary text and button hover |
| `--charcoal` / `charcoal` | `#14110f` | Deep warm dark surface |
| `--footer` / `footer` | `#12100e` | Legacy dark token; still defined in CSS, but no longer used for the footer |

### Pairing and hierarchy

- **Light paper:** ink headings, ink-soft body copy, sparse gold accents.
- **Dark surface:** cream/parchment-light primary text, muted cream secondary text, gold details.
- **Photography:** cream or white text over a deliberate dark scrim; never assume a photo is dark enough.
- White and black are used for media overlays and contrast, but should not displace the warm palette as ordinary page surfaces.
- Observed hierarchy includes `text-cream/65`, `text-white/75`, `border-white/10`, and `border-ink/20`. Treat these as contextual examples, not universally accessible presets.
- Gold is primarily ornamental. Do not assume small gold text on paper meets contrast requirements.
- Media fallback tones such as wine, violet, forest, and saffron in `MediaFrame.tsx` are not additional primary UI colors.
- Some bespoke sections use literal dark browns such as `#1a140e`. Match those when extending that exact composition; prefer existing named tokens for new generic sections.

### Approved footer treatment

The public footer uses a **light warm cream background**, not a dark closing band. This is the approved direction; preserve it when extending or redesigning the footer.

- **Surface:** `bg-cream` (`#ebe3d4`), with `text-ink` (`#2c241c`) as the primary foreground.
- **Logo:** `Logo tone="dark"`; do not use the light/gold logo on this surface.
- **Supporting text:** `text-ink-soft` (`#4a3f35`) for the tagline, column labels, links, and bottom metadata. Footer labels keep the small uppercase Jost treatment but do not use the gold-colored `.eyebrow` class.
- **Dividers:** `border-ink/15`; the circular invitation arrow uses `border-ink/30` and ink text, filling ink with cream text on hover.
- **Invitation heading:** ink, transitioning to ink-soft on hover.
- **Link ornament:** retain the subtle gold hover arrows and underlines.
- **Oversized decorative wordmark:** `text-ink/[0.07]`, not translucent white.
- **Back to top:** inherits the footer's text color, with ink on hover.
- Keep the existing layout, typography, spacing, and interactions. Do not restore `bg-footer`, white functional text, or white dividers here. Dark surfaces elsewhere remain valid where their existing compositions call for them.

## 4. Surfaces and texture

### Shared classes

| Class | Behavior / use |
| --- | --- |
| `parchment-surface` | Radial paper wash: `ellipse 90% 70% at 50% 35%`, `#d4c4a8` → `#b8a484` at 52% → `#9a8668` |
| `parchment-noise` | Procedural grain through `::before`, opacity `0.07`, multiply blending |
| `page-grain` | Same radial wash plus fine paper grain and coarser fibre; establishes `position: relative` and `isolation: isolate` |

`page-grain` uses `/textures/paper-grain-fine.png` at 260px / 14% multiply and `/textures/paper-grain-fibre.png` at 420px / 10% soft-light. Reuse the class instead of recreating these layers.

**Layering matters:** `parchment-noise` deliberately does **not** set positioning. Give its host `relative`, `absolute`, or `fixed` as appropriate; put content in a `relative z-10` wrapper. Its grain is noninteractive. Do not add a positioning declaration to this shared class—it previously interfered with fixed loading screens.

If a page already has `page-grain`, let ordinary sections inherit it. `PageHero bare` exists specifically to avoid painting another surface over the parent.

## 5. Fonts and typography

Fonts are loaded once in the root layout. Do not add font imports to individual sections.

| Role | Font and variable | Available weights | Use |
| --- | --- | --- | --- |
| Editorial serif | **Cas Olgans**, `--font-serif` / `font-serif` | 400, normal | Default body, display headings, product names, editorial copy |
| Utility sans | **Jost**, `--font-sans` / `font-sans` | 300, 400, 500 | Navigation, eyebrows, controls, labels, metadata |
| Script accent | **Great Vibes**, `--font-script` / `.script` | 400 | Sparse signature-like accents, never functional UI or paragraphs |

The active local serif is loaded from `frontend/src/fonts/CasOlgans-Regular.otf`. Preserve the existing font setup; do not substitute a similar-looking serif or synthesize bold Cas Olgans headings.

### Shared typography classes

- `.display`: serif, weight 400, default tracking `0.06em`; size and any uppercase treatment are applied by the component.
- `.eyebrow`: Jost, `0.6rem`, `0.32em` tracking, uppercase, line-height 1.2, gold-soft.
- `.nav-link`: Jost, `0.625rem`, weight 400, `0.24em` tracking, uppercase, line-height 1, no wrapping.
- `.script`: script font only; does not define a size or color.

### Working type scale

This is a **set of recurring reference sizes**, not a strict global h1–h6 scale. Match the nearest component rather than creating another arbitrary clamp.

| Role | Reference styling |
| --- | --- |
| Standard page title | `display text-[clamp(2.25rem,5vw,3.75rem)] uppercase tracking-[0.12em]` (`PageHero`) |
| Centered ornamental section heading | `display text-[clamp(1.7rem,3.6vw,2.8rem)] uppercase tracking-[0.14em]` (`BentoHeading`) |
| Split editorial heading | `text-2xl md:text-[1.85rem] lg:text-[2.1rem]`, uppercase, `0.08em` tracking (`CraftFeature`) |
| Product / rail title | `display text-xl md:text-2xl leading-tight`; product names need not be uppercase |
| Photo bento title | `clamp(1.05rem,1.8vw,1.6rem)`, uppercase, `0.1em` tracking |
| Body copy | Usually serif, approximately `0.95–1.05rem`, `leading-relaxed`, ink-soft |
| Page introduction | `text-[1.05rem] md:text-lg leading-relaxed` |
| Utility label / CTA | Usually `0.6–0.65rem`, uppercase, `0.24–0.32em` tracking |

- Use regular-weight editorial headings, not bold to create hierarchy.
- Larger editorial headlines may use tight leading; multi-line body copy should remain relaxed.
- Constrain paragraphs, commonly to `max-w-md` or `max-w-2xl`; do not run body copy across the entire wide container.
- Italic serif copy is appropriate for a short craft note or tagline, not all supporting text.
- Very large hero typography is route-specific. Do not apply wedding hero scale to a standard content section.
- Existing labels sometimes fall below `0.6rem`. This is an observed inconsistency, **not a minimum-size target**; prioritize legibility for new functional content.

## 6. Layout, spacing, and responsiveness

### Shared layout primitives

- `.section-pad`: horizontal padding `clamp(1.25rem, 4vw, 3rem)` (20–48px at a 16px root).
- `.site-shell`: column flex layout, minimum height `100dvh`.
- `.site-main`: flexible main content area.
- `.full-bleed`: relative, full width, minimum height `100dvh`, clipped overflow.
- `.full-bleed-center`: centered absolute overlay, `6rem 1.5rem 4rem` padding, `z-index: 2`.
- `--header-h`: `7.5rem`, changing to `5.5rem` at viewport widths ≤767px. This is a shared variable, not a guarantee of the header's measured height.

### Container tiers

Use `mx-auto` and the tier already established on the page:

- **1680px:** broad editorial/collection compositions and footer.
- **1280px:** home bento and product detail compositions.
- **`max-w-6xl` / `max-w-7xl`:** existing split craft sections / collection rails.
- **`max-w-3xl`:** centered title groups.
- **`max-w-2xl` or `max-w-md`:** introductions and body copy.

Do not make every section a different width without a deliberate relationship to neighboring content.

### Rhythm

- Common section spacing: `py-16 md:py-24`, `py-20 md:py-28`, or `py-24 md:py-32`.
- Existing compact craft splits use `py-14 md:py-20`.
- Heading-to-content spacing: often `mb-10 md:mb-14`.
- Eyebrow → heading: approximately `mt-3` or `mt-4`; heading → body: `mt-4` to `mt-6`; body → CTA: often `mt-8`.
- Bento grid gaps: `gap-3 md:gap-4`.
- Editorial splits: `gap-10 md:gap-14 lg:gap-20`.
- Tile caption padding: commonly `p-4 md:p-5` or `p-5 md:p-6`.

### Mobile composition

The project uses Tailwind's default responsive breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px. `md` is the main composition change.

- Stack editorial image/text splits on mobile; switch to two columns at `md`.
- Reverse alternate sections at desktop using order classes without damaging the mobile reading order.
- Recompose dense galleries as horizontal snap rails when appropriate; do not compress desktop grids until captions become unreadable.
- Keep overflow local to a rail. The page itself should not scroll horizontally.
- Test real mobile title wrapping, portrait crops, and header collisions. Hero implementations vary (`aspect-video`, `68dvh`, `100dvh`, `100svh`); there is no universal hero-height token to copy blindly.

## 7. Photography and media

- Use real garment, bridal, atelier, and embroidery photography from existing content/assets. Avoid unrelated stock illustrations.
- Prefer `next/image` or the existing `MediaFrame` for imagery. Use a positioned, dimensioned container for `fill`, with `overflow-hidden` and deliberate `sizes`.
- Portrait ratios recur: **3:4** for product/collection cards, **4:5** for craft features, **2:3** in editorial collections. Match the component's ratio.
- Use `object-cover` with a subject-aware focal position; bento photography uses `object-[50%_28%]`. Check that faces, garment silhouettes, and important embroidery are not cropped away.
- Product cards use a bottom scrim such as `from-black/60 via-transparent to-transparent`; collection rails use `from-black/65 via-black/10 to-transparent`. Stronger editorial scrims are context-specific.
- Keep captions in a clear area, usually bottom-left. Do not obscure the garment with a large opaque interface panel by default.
- Image hover is a slow, small push-in: approximately `scale(1.02–1.05)` over `700–900ms`; reuse `.bento-photo` for bento tiles.
- Reuse `AutoLoopVideo` for the existing muted/looping/inline hero treatment. New video sections still need deliberate poster, motion/pause, and readable-overlay behavior; the component is not proof that all accessibility needs are already handled.
- Prioritize only genuinely above-the-fold media. Provide meaningful alt text; use empty alt text for purely decorative images.

## 8. Shapes, borders, ornament, and icons

**Baseline:** rectangular, clipped imagery and square-cornered buttons. Do not round all cards.

| Primitive | Exact convention |
| --- | --- |
| `.mughal-arch` | `border-radius: 999px 999px 0 0`; arched top, flat base |
| `.mughal-frame` | Noninteractive inset frame via `::after`, inset 8px, 1px `rgba(197,160,89,0.55)`, inherits host radius |
| `.hairline` | 2.25rem wide, 1px high, currentColor at 55% opacity |
| `.khatam` | 12px eight-point motif made from two outlined squares, one rotated 45° |

- Prefer existing bento primitives rather than rebuilding their frame and stacking behavior.
- Gold rules, small diamonds, jaali/arch imagery, and khatam motifs are accents. Leave undecorated space around them.
- Circles are appropriate for gallery arrows, small navigation affordances, steps, and floating contact controls—not as a default card shape.
- Use simple arrows and restrained stroke icons. Decorative arrows/motifs should be `aria-hidden`; icon-only actions need accessible names.
- Keep shadows exceptional: media legibility, overlays, or special cinematic compositions. Ordinary content should rely on tone, hairlines, texture, and space.
- Use `Logo` and its existing image assets, not retyped brand text. `dark` is for light surfaces; `light` and `gold` are for dark surfaces. Currently `gold` uses the same light image, not a separately recolored logo.

## 9. Controls, links, forms, and feedback

### Reuse global control classes

| Pattern | Styling and behavior | Use |
| --- | --- | --- |
| `.ghost-btn` | Transparent, 1px currentColor border; padding `0.75rem 1.75rem`; Jost `0.625rem`, uppercase, `0.3em` tracking; subtle white wash on hover | Secondary/editorial action, photo CTA |
| `.ghost-btn.ghost-btn-dark` | Same outline, ink background and cream text on hover | Action on paper |
| `.solid-btn` | Ink fill, cream text, no border; padding `0.85rem 1.85rem`; Jost `0.625rem`, uppercase, `0.28em` tracking; ink-soft hover | Primary transactional action |
| `.ww-explore` | Text + slim arrow; Jost `0.65rem`, uppercase, `0.28em` tracking; partial underline expands on hover/focus | Lightweight editorial exploration |
| `.ww-explore--light` | Cream variant of the text CTA | Dark surface |

- Outline and solid controls acknowledge press with `scale(0.97)`, disabled for reduced motion.
- `.ww-explore` uses a `.ww-explore__arrow` child and provides a visible focus outline. Reuse both instead of approximating the arrow interaction.
- Use links for navigation and buttons for actions. Do not nest a save button inside a card's navigation link.
- Prefer local feedback such as an updated button label, save state, or bag count over adding a new toast system for every action.
- Whole-tile links should have keyboard-visible focus. A hover-only arrow is decoration, not the only indication of interactivity.

### Forms

Existing storefront forms use transparent fields with a bottom border, serif entered text, and small sans-serif labels. Preserve the quiet editorial treatment rather than importing filled dashboard inputs.

For new fields, provide real labels, useful autocomplete, clear focus, error text, disabled/submitting behavior, and an explicit success state. Use `role="alert"` for actionable errors and a suitable status announcement for confirmation. Do not rely on color alone.

### Important cascade caveat

Global rules are unlayered after the Tailwind import. Rules such as `a { color: inherit }`, `.display`, `.eyebrow`, and button classes can override Tailwind utilities on the same element. A class list alone does not prove the resulting color, tracking, size, or font.

Inspect computed styles if an override appears ineffective. Reuse the component's existing modifier pattern; `BentoPhoto`, for example, puts caption color on inner spans. Do not accumulate conflicting utilities or change global primitives merely to force a local exception.

## 10. Motion vocabulary

| Kind | Shared direction |
| --- | --- |
| UI feedback | Typically 150–300ms for color, opacity, underline, press, and count updates |
| Editorial reveal | Restrained opacity/vertical entrance; often slower than UI feedback |
| Image hover | Approximately 700–900ms, small scale change |
| CSS easing | `--ease-out: cubic-bezier(0.23,1,0.32,1)`; `--ease-in-out: cubic-bezier(0.77,0,0.175,1)` |
| Common Framer easing | `[0.22, 1, 0.36, 1]` |

- Framer Motion is already available; use it only where CSS is insufficient or neighboring components already establish that behavior.
- Prefer transforms and opacity, small distances, and subtle staggering. Avoid bouncy springs, constant movement, or unrelated entrance effects for every item.
- `.bento-photo` hover zoom is gated to a fine pointer with hover support.
- The What's New architectural arcade, cursor effects, and wedding auto-advancing panels are bespoke storytelling experiences—not templates for ordinary sections.
- New motion must respect `prefers-reduced-motion` / `useReducedMotion`: remove parallax and large transforms, avoid forced auto-advancement, and keep content available without animation. Existing coverage is uneven; do not reproduce gaps.

## 11. Reusable compositions and source map

All paths below are relative to the repository root.

| Need | Reuse / inspect |
| --- | --- |
| Global public tokens, textures, controls, rails | `frontend/src/app/globals.css` |
| Font registration / root providers | `frontend/src/app/layout.tsx` |
| Centered page introduction | `frontend/src/components/PageHero.tsx` (`compact`, `bare`) |
| Header and logo | `frontend/src/components/Header.tsx`, `frontend/src/components/Logo.tsx` |
| Cream footer / invitation band | `frontend/src/components/Footer.tsx` |
| House bento composition | `frontend/src/components/HomeShowcase.tsx` |
| Photo tile / text tile / ornamental heading | `frontend/src/components/bento/BentoTile.tsx`: `BentoPhoto`, `BentoPanel`, `BentoHeading` |
| Alternating image + editorial copy | `frontend/src/components/CraftFeature.tsx` (`reverse`) |
| Product card / collection rail | `frontend/src/components/ProductCard.tsx`, `frontend/src/components/CollectionRail.tsx` |
| Media and video handling | `frontend/src/components/MediaFrame.tsx`, `frontend/src/components/AutoLoopVideo.tsx` |
| Large editorial chapters and mobile rails | `frontend/src/components/WomenswearChapters.tsx`, `frontend/src/components/MenswearChapters.tsx` |
| Product detail | `frontend/src/components/ProductDetail.tsx` |
| Underlined form treatment | `frontend/src/components/atelier/AtelierEnquiry.tsx`, `frontend/src/components/BagClient.tsx` |

### Section recipes

**A. Standard editorial section**

- Inherit the page's paper surface; use `section-pad py-16 md:py-24` or match its neighboring sections.
- Center a container at the appropriate existing width.
- Use an eyebrow, regular serif heading, constrained ink-soft body, and one existing CTA style.
- For an image/text split, follow `CraftFeature`: mobile stack, desktop two columns, 4:5 media, generous column gap.

**B. House/craft bento**

- Use `BentoHeading`, `BentoPhoto`, and `BentoPanel` inside a compact-gap grid.
- Home establishes two columns on mobile and four on desktop; larger text panels may span two columns.
- Mix rectangular and selected arched tiles. Keep the gold inset frame and caption treatment consistent.
- Ensure text panels have enough height and top clearance when arched; do not put headings into the narrow arch crown.

**C. Product/collection rail**

- Reuse `ProductCard` or `CollectionRail` rather than styling another card family.
- `.card-rail`: 1rem gap, mandatory horizontal snap, thin scrollbar, nonshrinking children.
- `.rail-hide-scroll`: 0.85rem gap, same snap behavior, hidden scrollbar.
- `CollectionRail` uses 3:4 cards, `72vw` mobile width, minimum 240px / maximum 300px, then 260px at `sm` and 300px at `md`.
- Keep captions/controls usable on touch and keyboard; essential information must not require hover.

**D. Full-bleed image/video story**

- Match the closest active hero's height and mobile composition; reserve space for any overlay header.
- Layer media, scrim, and readable content deliberately.
- Use one eyebrow, one serif title, and one CTA. Do not copy unused or commented-out showcase variants as the standard.

## 12. Separate system: Kesari Studio (`/admin`)

Admin is an intentional exception, scoped to `.cms`. For admin work, inspect `frontend/src/app/admin/admin.css`, `frontend/src/app/admin/layout.tsx`, and `frontend/src/components/admin/` instead of applying storefront recipes.

- **Character:** technical/isometric paper workspace, 30°/150° grid, extruded block edges.
- **Fonts:** Sora (`--font-cms`, weights 300–700) and JetBrains Mono (`--font-cms-mono`, weights 400–600).
- **Core colors:** canvas `#f3efe7`, surface `#fffdf9`, ink `#1f1c19`, border `#ddd4c4`, saffron action `#dc7426` / hover `#c4621a`.
- **Status colors:** success `#2f7d55`, warning `#9a6200`, danger `#b42318`; secondary teal `#2f6f6a` is for diagrams.
- **Shape:** 4px radius, 1px outlines, hard offset extrusions; `.cms-card` and `.cms-card-quiet` are the established card patterns.
- **Type:** 14px base / 1.55 line-height; `.cms-display` uses weight 600 with negative tracking; `.cms-eyebrow` uses 10.5px mono, uppercase, `0.12em` tracking.

Do not bring saffron action fills, technical mono headings, or isometric card shadows into public sections. Conversely, do not use decorative storefront serif headings for CMS controls.

## 13. Acceptance checklist for new sections

### Cohesion

- [ ] Uses existing palette and font roles; no new font, arbitrary accent, or replacement design system.
- [ ] Matches adjacent surfaces, container width, and section rhythm.
- [ ] Reuses the nearest component and global control classes where appropriate.
- [ ] Preserves restrained square/arched shapes and sparse gold ornament.
- [ ] Photography remains the focus; crops and scrims work at every tested width.
- [ ] Computed styles confirm intended typography and colors despite global cascade rules.

### Responsive and accessible behavior

These are requirements for **new work**, not claims that every current component already satisfies them.

- [ ] Test narrow mobile, around the 768px composition change, and wide desktop; no text collisions or page-level horizontal overflow.
- [ ] Use semantic sections/headings, logical reading order, descriptive links, and actual buttons for actions.
- [ ] Provide visible keyboard focus, accessible names, and keyboard equivalents for meaningful hover behavior.
- [ ] Verify text contrast (WCAG AA: 4.5:1 normal text, 3:1 large text) and useful control contrast; do not blindly copy faint small labels.
- [ ] Make touch targets generous; aim for 44×44px for new standalone controls even when their visual icon is smaller.
- [ ] Honor reduced motion and provide appropriate control of prolonged autoplay/moving content.
- [ ] New dialogs/lightboxes handle focus entry, trapping, Escape, restoration, and background scroll.
- [ ] Forms expose labels, errors, and status feedback; essential state is not color-only.
- [ ] Images have appropriate alt text, responsive sizes, and reserved layout dimensions.

### Scope discipline

- [ ] Do not normalize existing one-off cinematic effects into mandatory conventions.
- [ ] Do not copy known accessibility gaps, cascade workarounds, tiny metadata, or hardcoded color drift as design requirements.
- [ ] Do not alter shared CSS, navigation, fonts, or unrelated sections unless the task actually requires it.
- [ ] Update this guide if a deliberate, shared design convention changes.
