---
name: Event ERP
description: Operations console for event-rental businesses — calm, status-forward, disciplined.
colors:
  primary: "#6366f1"
  primary-light: "#818cf8"
  primary-dark: "#4f46e5"
  secondary: "#10b981"
  secondary-light: "#34d399"
  secondary-dark: "#059669"
  ink: "#1e293b"
  ink-muted: "#64748b"
  ink-soft: "#475569"
  bg: "#f8fafc"
  surface: "#ffffff"
  border: "#e2e8f0"
  divider: "#f1f5f9"
  danger: "#ef4444"
  danger-strong: "#dc2626"
  danger-dark: "#991b1b"
  warning: "#f59e0b"
  warning-dark: "#d97706"
  warning-deep: "#92400e"
  primary-deep: "#4338ca"
  success-deep: "#047857"
  success-ink: "#166534"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontWeight: 600
    fontSize: "1.25rem"
    lineHeight: 1.4
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontWeight: 400
    fontSize: "0.875rem"
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontWeight: 500
    fontSize: "0.875rem"
  mono:
    fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace"
    fontWeight: 400
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px"
  table-head:
    backgroundColor: "{colors.divider}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
---

# Design System: Event ERP

## 1. Overview

**Creative North Star: "The Operations Console"**

Event ERP is an operations console, not a marketing surface. The screen is an instrument panel: status-forward, legible at a glance, and quiet enough to live in all day. Decoration is a bug, not a feature. Every pixel earns its place by helping an operator read a number, find a status, or confirm a balance — nothing is there to "look designed." The system is professional, calm, and efficient, in that order.

Depth is carried by 1px hairline borders and tonal separation between the `#f8fafc` canvas and `#ffffff` surfaces, not by shadow or blur. Indigo (`#6366f1`) is the single accent and appears sparingly — on primary actions, the active navigation state, and focus. Emerald (`#10b981`) is reserved for success and positive financial movement; danger red (`#ef4444`) for destructive actions and overdue flags. Everything else is slate ink on a cool near-white.

This system explicitly rejects the look PRODUCT.md calls out: no purple/violet gradients, no gradient text, no glassmorphism or frosted blur, no decorative motion, no SaaS pastel-dashboard chrome, and no flat gray-on-gray palettes that abandon hierarchy. The current codebase still ships a few `#6366f1→#4f46e5` gradients on the drawer header, app bar, and card backgrounds — those are legacy and are scheduled for removal (see Do's and Don'ts). Solid indigo is the primary; gradients of any hue are prohibited.

**Key Characteristics:**
- Status-forward: numbers, balances, and state badges dominate the page, not prose.
- Flat + border-led: hairline `#e2e8f0` borders and canvas-vs-surface contrast carry structure; shadows are rare and stateful only.
- One accent + a documented status ramp: solid indigo on ≤10% of any screen; emerald = positive, amber = warning/pending, red = destructive/overdue.
- System-font clarity: no display typefaces; hierarchy is set by weight and size, not personality.
- Operator-paced: dense but legible, optimized for repeat users who scan and act under load.

## 2. Colors

A restrained slate canvas with a single indigo accent and two semantic roles. Restrained strategy: neutrals carry 90%+ of every screen; the accent is rare on purpose.

### Primary
- **Console Indigo** (`#6366f1`): the single brand accent. Primary buttons, active nav state, focused inputs, key links. Solid only — never as a gradient. Lighter `#818cf8` for hover tints on subtle surfaces; darker `#4f46e5` for button hover/active and pressed states; deeper `#4338ca` for indigo text/tints that must hold contrast on light amber/neutral fills.

### Secondary
- **Verified Emerald** (`#10b981`): success, paid invoices, completed rentals, positive balances. Used as a status indicator, not a decorative color. `#34d399` light for soft fills; `#059669` dark for strong emphasis; `#047857` / `#166534` for success text on light fills (paid/paid-ink) where `#10b981` alone would fail contrast.

### Neutral
- **Console Ink** (`#1e293b`): primary text and headings — slate-900, high contrast on the canvas.
- **Slate Muted** (`#64748b`): secondary text, captions, inactive icons. Must still clear 4.5:1 on `#f8fafc` (it does; do not darken further "for elegance" or lighten it).
- **Slate Soft** (`#475569`): table head text, inactive nav labels.
- **App Canvas** (`#f8fafc`): the application background — a cool near-white, not a warm cream.
- **Surface** (`#ffffff`): cards, papers, inputs, the app bar — sits one step above the canvas.
- **Hairline Border** (`#e2e8f0`): the primary structural device — card edges, dividers, input strokes.
- **Row Divider** (`#f1f5f9`): subtler separators inside tables and lists.

### Semantic
- **Alert Red** (`#ef4444`): destructive actions (logout, delete) and error/overdue flags. `#dc2626` (strong) for red status text and badges that need weight; `#991b1b` (dark) for red text on light fills to keep contrast.
- **Caution Amber** (`#f59e0b`): warning, pending, low-stock, and partial states — the "needs attention but not broken" role. `#d97706` (dark) for amber text/badges; `#92400e` (deep) for amber text on light fills where contrast requires it. Pair with an icon; never use amber alone to convey state (colorblind-safe).

### Named Rules
**The Solid-Only Rule.** Indigo is used as a solid color only. Any `linear-gradient`, `radial-gradient`, or mesh/aurora background — indigo or otherwise — is prohibited. This is the line between "operations console" and "AI-generated SaaS." The existing drawer/app-bar/card gradients are legacy; replace with solid `#6366f1`, solid `#ffffff`, or solid `#f8fafc`.

**The One-Voice Rule.** The indigo accent occupies ≤10% of any given screen. Its rarity is the point: a primary button, an active nav row, a focused input ring. If two indigo elements compete for the eye, one is wrong.

**The Earned-Color Rule.** Emerald, amber, and red are semantic, not decorative. They appear only where state must be unambiguous (paid / pending / overdue, success / warning / error, active / inactive). Never tint a surface green, amber, or red for visual variety.

**The Status-Ramp Rule.** Status color comes from the documented ramp only: indigo (primary/active), emerald (success), amber (warning), red (danger). Do **not** introduce off-system hues — violet (`#8b5cf6`, `#7c3aed`) or generic blue (`#3b82f6`) — for notification types, stat cards, or icons. Off-system color reads as drift and, in the violet case, collides directly with PRODUCT.md's anti-references.

## 3. Typography

**Display Font:** System sans stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`)
**Body Font:** Same system sans stack.
**Label/Mono Font:** System sans for labels; `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace` for code and numeric/code-style data only.

**Character:** No custom typeface, on purpose. A system stack maximizes legibility, loads instantly, and reads as native to the operator's machine — which is exactly the right feel for a tool they live in. Personality is not the goal; clarity and trust are. Hierarchy is carried by weight and size, not by font swaps.

### Hierarchy
- **Display** (`700`, page titles via the app bar, `1.25–1.5rem`, `1.2`): the single page title in the top bar. Never larger; this is a console, not a landing page.
- **Headline** (`600`, card/section headings, `1.1rem`, `1.3`): card titles, section labels inside a page.
- **Title** (`600`, `1.25rem`, `1.4`): prominent in-page headings when a page has multiple sections.
- **Body** (`400`, `0.875rem` / 14px, `1.5`): all table data, form values, body copy. Cap line length at 65–75ch where prose appears.
- **Label** (`500`, `0.875rem`): buttons, table head cells, nav items, form labels. Weight does the emphasis work.
- **Mono** (`400`, IDs, reference codes, ledger entries where monospaced alignment aids scanning): use sparingly, only where digit alignment earns it.

### Named Rules
**The Weight-Does-The-Work Rule.** Establish hierarchy with weight (400/500/600/700) and size, never by introducing a second typeface. Two fonts would fight the system-stack clarity that defines this console.

**The No-Shouting Rule.** No oversized display type. Page titles stay at app-bar scale; there is no hero. If a number needs to dominate a screen (a balance, a count), size that number up — not the surrounding headings.

## 4. Elevation

This system is **flat by default**. Depth is conveyed by the canvas/surface tonal step (`#f8fafc` → `#ffffff`) and by 1px hairline borders (`#e2e8f0`). Shadows are rare and always stateful — they appear only on raised, hovering, or temporarily-elevated elements (menus, dialogs, popovers), never as decoration on resting cards.

### Shadow Vocabulary
- **Resting Hairline** (`border: 1px solid #e2e8f0`, no shadow): the default treatment for cards, papers, and inputs. The border is the elevation.
- **Low Lift** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): the current MUI `elevation1`/Paper/Card resting shadow — acceptable, but prefer the hairline alone where the canvas/surface contrast already separates the card.
- **Mid Lift** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): hovering menus, sticky headers.
- **High Lift** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): dialogs, popovers, dropdowns — elements that float above the page.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest with a 1px `#e2e8f0` border. Shadows appear only as a response to state (hover, elevation, focus, floating). A resting card with a heavy shadow reads as decorative and is wrong for this console.

**The No-Glass Rule.** No `backdrop-filter`, frosted blur, or translucent fills. Depth is opaque and tonal, never blurred.

## 5. Components

Components are restrained and reliable: predictable MUI-tuned controls with no flourish. Trust comes from familiarity — operators should never have to learn a new affordance twice.

### Buttons
- **Shape:** gently rounded (`8px` radius).
- **Primary:** solid Console Indigo (`#6366f1`) background, `#ffffff` text, `500` weight, `text-transform: none`, padding `8px 16px`. The main action of any form or page — there should rarely be two on a screen.
- **Hover / Focus:** background darkens to `#4f46e5`; focus shows a clear indigo ring (never just an outline-color change — the ring must be visible).
- **Secondary / Ghost / Tertiary:** MUI `outlined` and `text` variants — `#e2e8f0` border or borderless, ink text. Used for cancel, secondary actions, and toolbar controls.
- **Destructive:** Alert Red (`#ef4444`) text or border; reserve solid red fills for irreversible confirmations.

### Table (primary data surface)
- **Head:** `#f1f5f9` background, Slate Soft (`#475569`) text, `500–600` weight — the canonical way to scan columns of operational data.
- **Rows:** separated by `1px solid #f1f5f9` bottom borders; zebra striping is not used (borders carry the rhythm).
- **Cells:** `12–16px` padding; numbers right-aligned; IDs/codes in mono where alignment aids scanning.

### Cards / Containers
- **Corner:** `12px` radius (default).
- **Background:** solid `#ffffff` — never a gradient. The current white→`#f8fafc` card gradient is legacy; replace with solid white.
- **Border:** `1px solid #e2e8f0`. This is the elevation.
- **Shadow:** none at rest (optional Low Lift on hover/stateful cards).
- **Padding:** `16px` standard.

### Inputs / Fields
- **Style:** `#ffffff` fill, `1px solid #e2e8f0` stroke, `8px` radius, `14px` body text.
- **Focus:** stroke shifts to Console Indigo (`#6366f1`) with a visible indigo ring — the single most important focus treatment in the system.
- **Error:** Alert Red stroke + red helper text; Disabled: muted fill, `#64748b` text.

### Navigation (sidebar)
- **Shell:** `260px` permanent drawer (desktop) / temporary (mobile), `1px solid #e2e8f0` right border, solid header — not a gradient.
- **Items:** icon + label, `16px` radius pill, `8px 12px` padding. Inactive: Slate Soft text (`#475569`), muted icon (`#64748b`). Active: Console Indigo text + icon (`#6366f1`) — the accent marks "you are here."
- **Badges:** small count chips for pending items (Rentals, Invoices, etc.) — muted, not indigo, so they don't compete with the active state.

### App Bar
- **Style:** solid `#ffffff` (not a gradient), `1px solid #e2e8f0` bottom border, Low Lift shadow, page title in Slate Ink (`#1e293b`) at `600` weight.

## 6. Do's and Don'ts

Concrete, forceful guardrails. Every prohibition here echoes PRODUCT.md's anti-references so the visual spec carries the strategic line through.

### Do:
- **Do** use solid Console Indigo (`#6366f1`) for the single primary action and the active nav state, and keep it under ~10% of any screen (The One-Voice Rule).
- **Do** carry depth with 1px `#e2e8f0` hairline borders and the `#f8fafc` → `#ffffff` canvas/surface step (The Flat-By-Default Rule).
- **Do** reserve emerald for success/positive, amber for warning/pending, and red for destructive/overdue — color is semantic, never decorative, and always from the documented status ramp (The Earned-Color Rule).
- **Do** keep body text at Slate Ink (`#1e293b`) on the canvas; verify ≥4.5:1 contrast, including placeholders.
- **Do** build hierarchy with weight and size within the single system-font stack (The Weight-Does-The-Work Rule).
- **Do** show a visible indigo focus ring on every focusable element — operators tab through data all day.
- **Do** replace the existing `#6366f1→#4f46e5` gradients (drawer header, app bar, card backgrounds) with solid fills as surfaces are touched.

### Don't:
- **Don't** use `linear-gradient` / `radial-gradient` / mesh / aurora backgrounds of any hue — indigo gradients included (The Solid-Only Rule). PRODUCT.md bans "purple/violet AI gradients" by name.
- **Don't** use `background-clip: text` with a gradient (gradient text). Emphasize with weight or size, in a single solid color.
- **Don't** use `backdrop-filter`, frosted blur, glassmorphism, or translucent fills (The No-Glass Rule). Depth is opaque and tonal.
- **Don't** apply decorative motion, hover-scale parallax, or auto-rotating carousels. Motion is state-feedback only, and always ships a `prefers-reduced-motion` alternative.
- **Don't** ship SaaS pastel-dashboard chrome — oversized hero metrics with gradient accents, identical icon-card grids, or all-caps tracked eyebrows above every section.
- **Don't** use flat gray-on-gray palettes that abandon hierarchy. The slate ramp (`#1e293b` → `#64748b` → `#475569`) exists to preserve it; use the steps deliberately.
- **Don't** introduce off-system hues for status, stat cards, or icons — no violet (`#8b5cf6`, `#7c3aed`) or generic blue (`#3b82f6`) (The Status-Ramp Rule). The "Low Stock Alerts" purple gradient in `Notifications.jsx` and the blue icon in `Rentals.jsx` are the current offenders; replace with amber and indigo respectively.
- **Don't** use `border-left` / `border-right` greater than 1px as a colored accent stripe on cards, list items, or alerts.
- **Don't** put a shadow on a resting card for decoration. Shadows are stateful only (The Flat-By-Default Rule).
