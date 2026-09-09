---
name: Austo
description: End-to-end digital management platform for jewelers — a dark vault, gold catching light only where it earns it.
colors:
  gold: "#D4AF37"
  gold-light: "#F5C842"
  gold-pale: "#FDE68A"
  gold-deep: "#B8960C"
  gold-shadow: "#6B5408"
  void: "#0A0A0A"
  surface: "#111111"
  surface-raised: "#161616"
  surface-sunken: "#0D0D0D"
  border-hairline: "#1A1A1A"
  ink: "#E5E5E5"
  ink-bright: "#FFFFFF"
  ink-muted: "#888888"
  ink-numeral: "#F5F5F5"
  positive: "#22C55E"
  negative: "#EF4444"
typography:
  display:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "normal"
  headline:
    fontFamily: "Montserrat, Inter, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.04em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Montserrat, Inter, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "28px"
  pill: "9999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, {colors.gold}, {colors.gold-light})"
    textColor: "{colors.void}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "linear-gradient(135deg, {colors.gold}, {colors.gold-light})"
    textColor: "{colors.void}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    rounded: "{rounded.sm}"
    padding: "9px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: "9px 20px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "{colors.void}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Design System: Austo

## Overview

**Creative North Star: "The Vault"**

Austo reads as a secure, low-light interior built to hold something precious. Surfaces sit almost black — the interface recedes so nothing competes with the data or the gold itself. Gold is not a decorative accent applied on top; it is the ambient signature that runs through the whole system — hairline borders, dividers, icon strokes, the sidebar's active state, the live-rate ticker, the hover glow on every card. It is everywhere in small doses rather than reserved for a handful of "special" moments, but it never fills a surface — it traces edges, catches light, and signals liveness (prices moving, an item selected, a border responding to your cursor).

Depth in this system is not built from drop shadows. It's built from light: a soft gold bloom under hover states, a conic-gradient "sweep" that circles a logo mark, a laser-thin "scan" line that travels across borders, a cursor-tracking edge glow (`BorderGlow`) that lights the nearest edge of a card as the pointer approaches. This is the system's depth model, not an incidental effect — surfaces are flat at rest, and glow is how the interface tells you something is alive, active, or worth your attention.

Typography pairs an editorial serif (Playfair Display) for hero-scale display moments with a geometric sans (Montserrat) for structural headings, labels, and navigation, and a humanist sans (Inter) for body copy and data. The pairing reads as ledger-of-record meets refined retail counter, not a financial dashboard.

Interactive elements stay precise and restrained: buttons and inputs are quiet at rest, respond with a controlled gold glow and a 1px lift on hover, and never bounce, overshoot, or perform beyond the interaction that earned it. Austo explicitly is not a generic light, blue-accent SaaS dashboard — no card-grid sameness, no flat Material defaults; every surface should still feel like it belongs inside the Vault.

**Key Characteristics:**
- Near-black void surfaces (#0A0A0A) with almost no pure white — text tops out at #F5F5F5
- Gold as ambient signature: borders, icon strokes, dividers, and glow carry it everywhere, but never as a fill
- Depth = light, not shadow: glow, sweep, and scan animations are the elevation system
- Serif display (Playfair Display) for hero moments; geometric sans (Montserrat) for structure; humanist sans (Inter) for body/data
- Precise, restrained interaction: controlled hover response, never playful or bouncy
- Explicit anti-reference: generic light-mode SaaS dashboards (blue accents, uniform card grids, flat Material Design)

## Colors

A near-monochrome dark palette (void black through hairline grays) carries the interface; a single metallic gold family is the system's only color signal, deployed as ambient signature rather than a rare accent. Two semantic colors (green/red) exist solely for financial direction (price up/down, positive/negative states).

### Primary
- **Gold** (`#D4AF37`): The system's signature color. Used on icon strokes, hairline borders (`rgba(212,175,55,0.08–0.3)`), active nav state, primary CTA gradients, focus rings, live-price ticker highlights, and every hover-glow effect. Appears as translucent tints (8–30% alpha) far more often than at full opacity — it traces and glows rather than fills.
- **Gold Light** (`#F5C842`): The lifted end of every gold gradient (buttons, avatar badges, the animated logo sweep). Pairs with Gold and Gold Deep in 135°/90° gradients to read as brushed/liquid metal rather than a flat swatch.
- **Gold Deep** (`#B8960C`): The grounded end of gold gradients and darker hover states; also used in the primary-button gradient's second stop.

### Neutral
- **Void** (`#0A0A0A`): The base background — body, sidebar main area, input fields. Nothing sits darker than this.
- **Surface** (`#111111`): Card and panel background, one step up from Void. The default resting surface for `.card`, `.stat-card`, sidebar user block, and modals.
- **Surface Raised** (`#161616`): The lighter end of the stat-card's diagonal gradient (`linear-gradient(160deg,#161616,#0E0E0E)`) — used to give elevated stat tiles a subtle top-lit quality without a shadow.
- **Hairline Border** (`#1A1A1A` / `rgba(212,175,55,0.08–0.15)`): Card and table-row dividers. Gold-tinted hairlines are preferred over pure gray wherever the border sits near an interactive surface.
- **Ink** (`#E5E5E5`): Primary body text on dark surfaces.
- **Ink Bright** (`#FFFFFF`, Tailwind `text-white`): The system's standard high-emphasis text color — headings, modal titles, table cell primary values, names. Used far more broadly than a rare accent; this is the default for anything that needs to read as the most prominent text in its context.
- **Ink Numeral** (`#F5F5F5`): A very slightly softer white reserved specifically for large tabular-numeral values (dashboard stat cards) — close enough to Ink Bright to read as the same tier, distinct enough to keep numerals from competing with true headings.
- **Ink Muted** (`#888888`): The accessible floor for secondary/caption text — table headers, empty/loading states, form sub-labels, search icons, timestamps, badges. Every piece of informational text at this tier or lighter must clear 4.5:1 against Void; darker grays (`#3a3a3a`–`#7D7D7D`) are reserved for non-text use (borders, dividers, disabled icon glyphs) or decorative punctuation, never for text a user needs to read.

### Semantic
- **Positive** (`#22C55E`): Price increases, success badges, the "live" pulse dot. Always paired with a translucent background tint (`rgba(34,197,94,0.12)`) and matching border, never a solid fill.
- **Negative** (`#EF4444`): Price decreases, destructive actions (`btn-danger`), error badges. Same translucent-fill-plus-border treatment as Positive.

### Named Rules
**The No-Fill Rule.** Gold and the semantic colors appear as translucent tints, borders, strokes, and gradients — never as an opaque fill covering a large surface. A gold-filled button gradient is the one sanctioned exception, and even there it fades to Void text, not white.

**The Ambient Signature Rule.** Unlike a "rare accent" system, gold is allowed to appear on nearly every surface — sidebar, header, cards, badges, dividers — as long as it stays translucent or confined to edges/icons/text. Restraint comes from opacity and placement, not from scarcity of appearances.

**The Legible Floor Rule.** Any text that conveys information — not pure decoration — must clear 4.5:1 contrast against its background (3:1 for large/bold text). Ink Muted (`#888888`) is the darkest gray permitted for real text; anything darker is for borders, dividers, and non-text decoration only.

## Typography

**Display Font:** Playfair Display (with Georgia, serif fallback)
**Headline/Label Font:** Montserrat (with Inter, sans-serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)

**Character:** An editorial serif for hero-scale marketing moments against a geometric sans used for every structural heading, page title, label, and the nav — the pairing reads as a ledger-of-record crossed with a refined retail counter, never as a generic app UI.

### Hierarchy
- **Display** (600 weight, `clamp(2.5rem, 6vw, 4.5rem)`, 1.05 line-height): Landing-page hero headlines only. Playfair Display, sometimes italic for emphasis phrases.
- **Headline / Page Title** (400 weight, 22px, letter-spacing 0.04em): The `.page-title` class — every in-app page header. Montserrat.
- **Title** (500–700 weight, 15–16px): Card titles, modal headers, nav item current-page labels. Montserrat or Inter depending on context (structural chrome uses Montserrat; content titles use Inter).
- **Body** (400 weight, 14px, 1.5 line-height): Table cells, form inputs, paragraph copy, buttons. Inter.
- **Data / Numeric** (600–800 weight, tabular-nums): Stat-card values, prices, the header clock. Always `font-variant-numeric: tabular-nums` so figures don't shift width as they update live.
- **Label** (600 weight, 11–12px, letter-spacing 0.05–0.08em, uppercase): Form field labels, stat-card eyebrows, badge text, ticker codes. Montserrat, always uppercase, always wide-tracked.

### Named Rules
**The Tabular Numerals Rule.** Any number that updates live (prices, the clock, stat values) uses `tabular-nums` — the Vault's ticking data must never cause layout jitter.

## Layout

The app shell is a fixed-height, no-page-scroll layout: a 240px (`w-60`) fixed sidebar on the left, a slim header (ticker + language switcher + clock) across the top of the content area, and a scrollable `<main>` region — the sidebar and header never scroll with content. Below `lg`, the sidebar collapses to an off-canvas drawer triggered by a hamburger, with a dark scrim overlay behind it.

Content density is comfortable but compact: page padding is 24px (`p-6`), card internal padding sits around 20px, and form/table rows use 8–14px vertical rhythm. Dashboard content composes in a responsive grid of stat cards (min-height 130px) above larger content panels (charts, quick-sale panel, recent activity).

The landing page (marketing surface) breaks from the fixed-shell density: full-bleed sections, generous vertical rhythm between sections, and a horizontally-draggable feature carousel with scale/opacity falloff by distance from center.

## Elevation & Depth

Austo is flat at rest and lit on interaction — there is no traditional drop-shadow elevation scale. Depth and hierarchy come from light instead:

- **Ambient glow**: `box-shadow` blooms in gold (`0 0 20px rgba(212,175,55,0.15)` resting, `0 0 40px rgba(212,175,55,0.25)` emphasized) appear on hover for cards, sidebar items, and buttons.
- **Animated sweep**: a conic-gradient mask rotating around the logo mark (`sweepglow`, 6s linear) for ambient liveness on brand marks.
- **Scan line**: a thin bright line plus a wide soft bloom (`scan-border-layer` / `scan-border-glow`) that travels across a surface — used for "processing / live" states.
- **Cursor-tracking edge light** (`BorderGlow`): the signature interactive-depth component. A hero/feature card's nearest edge lights up in a warm gold glow that follows the cursor's angle and proximity, using layered conic/radial masks and `mix-blend-mode: plus-lighter`. This is the system's most distinctive depth effect and should be treated as a protected pattern, not reproduced ad hoc with plain box-shadows.

### Named Rules
**The Flat-at-Rest Rule.** No card, button, or panel carries a resting shadow. Every glow effect is a *response* to hover, focus, active state, or live data — never a static decoration.

**The Light-Is-Depth Rule.** When a new surface needs to feel "elevated," reach for a gold glow bloom or the BorderGlow pattern before reaching for a conventional drop shadow. Depth in the Vault comes from light catching an edge, not from a surface casting a shadow.

## Shapes

Corners are consistently rounded and scale with a component's size: 8px for buttons, inputs, and selects; 12–16px for cards and stat tiles; up to 28px for the signature `BorderGlow` hero cards. Pills (`border-radius: 9999px`) are reserved for badges, status chips, and the sub-value indicator under stat cards. Borders are hairline (1px) and gold-tinted at low opacity rather than solid gray — even a "neutral" card border carries a trace of gold (`rgba(212,175,55,0.08–0.15)`).

## Components

### Buttons
- **Shape:** 8px radius (`rounded-sm` token), consistent across all variants.
- **Primary (`btn-gold`):** Gold gradient (`linear-gradient(135deg,#D4AF37,#F5C842)`) background, Void text, 600 weight, 10px/20px padding. Hover: opacity 0.9, gold glow bloom, 1px lift (`translateY(-1px)`). Disabled: 0.4 opacity, no lift.
- **Outline (`btn-outline`):** Transparent background, gold text and 1px gold border at 40% opacity. Hover: soft gold-tinted background fill (8% opacity), border brightens to full gold.
- **Ghost (`btn-ghost`):** Transparent, muted gray text and border. Hover: lightens to a dark-gray fill and brighter text — used for tertiary/cancel actions.
- **Danger (`btn-danger`):** Translucent red fill and border, red text. Hover: fill and border intensify. Used exclusively for destructive actions.

### Cards
- **Corner Style:** 12px (`.card`) to 16px (`.stat-card`) radius.
- **Background:** Surface (`#111`) at rest; stat cards use a subtle diagonal gradient (`#161616` → `#0E0E0E`) for top-lit dimension.
- **Border:** 1px, gold at 12% opacity at rest.
- **Hover:** Border brightens to full gold plus an 18px gold glow bloom (see Elevation & Depth).
- **Stat Card signature detail:** a 2px gold gradient accent line across the top edge, and a large (140px), low-opacity (0.25) watermark icon bleeding off the bottom-right corner with a multi-directional drop-shadow "stroke" effect.

### Inputs / Fields
- **Style:** Void background, 1px gray border (`#2A2A2A`), 8px radius, 10px/14px padding, Inter body font.
- **Focus:** Border shifts to gold at 50% opacity plus a soft 3px gold glow ring (`box-shadow: 0 0 0 3px rgba(212,175,55,0.08)`) — no harsh outline.
- **Placeholder:** Ink Faint-adjacent gray (`#555`).

### Badges
- **Style:** Pill-shaped (9999px radius), translucent tinted background + matching border + saturated text, in the relevant semantic or brand color (gold / green / red / gray). 11px, 600 weight text, tight padding (2px/10px).

### Navigation (Sidebar)
- **Style:** Vertical list of `sidebar-item` rows — icon + label, 8px radius, muted gray text at rest.
- **Hover / Active:** Gold-tinted background fill (5–10% opacity), gold text, plus the same edge-glow treatment used on cards (`box-shadow: 0 0 0 1px rgba(212,175,55,0.65), 0 0 18px rgba(212,175,55,0.25)`) — navigation glows exactly like a card, reinforcing one glow language across the whole system.
- **Mobile:** Off-canvas drawer with a dark scrim; identical item styling.

### Live Ticker (signature component)
A horizontally auto-scrolling marquee of live gold/currency prices in the header, masked to fade at both edges, pausing on hover. Gold-colored labels for precious-metal codes, gray for currency codes, green/red directional arrows with the semantic colors. This is one of the system's clearest expressions of "ambient gold signals liveness."

### BorderGlow (signature component)
A cursor-tracking edge-lighting card wrapper (see Elevation & Depth) — the system's most distinctive interactive-depth pattern, used for feature/hero cards on the landing page.

## Do's and Don'ts

### Do:
- **Do** keep new surfaces flat at rest and add depth only as a response to hover/focus/live-state, using gold glow or BorderGlow rather than conventional shadows.
- **Do** use translucent gold (8–30% opacity) for borders, fills, and tints rather than solid/opaque gold outside of gradient buttons.
- **Do** pair Playfair Display (hero/display only) with Montserrat (structure/labels) and Inter (body/data) — don't introduce a fourth typeface.
- **Do** use `tabular-nums` on any figure that updates live.
- **Do** keep hover/focus responses controlled and quick (150–300ms) — a lift of 1px, a glow bloom, a border-color shift; nothing bouncy or springy.
- **Do** use pure white (`#FFFFFF`) as the standard color for headings, table cell values, and other high-emphasis text — it is the system's default bright ink, not a rare exception.
- **Do** keep any real text (labels, captions, timestamps, empty/loading states) at Ink Muted (`#888888`) or brighter; never ship informational text below 4.5:1 contrast against Void.

### Don't:
- **Don't** let this read as a generic light-mode SaaS dashboard — no blue accent color, no uniform white card grid, no flat Material Design defaults.
- **Don't** fill a large surface with opaque gold; gold traces edges and lights icons/text, it doesn't paint backgrounds.
- **Don't** add a conventional `box-shadow` drop-shadow for elevation — reach for the glow/BorderGlow language instead.
- **Don't** use a kicker/eyebrow label above a heading (e.g. a small pill or uppercase line before an `<h2>`) — the heading carries its own weight.
- **Don't** give buttons, cards, or inputs bouncy/springy motion — interaction stays precise and restrained, not playful.
