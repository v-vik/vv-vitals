# v--v Vitals — Design Schematic

> This file is the single source of truth for all visual decisions in v--v Vitals.
> Claude Code should reference this before generating any UI component.
> Every colour, font, spacing, and component pattern is defined here.

---

## Brand philosophy

v--v Vitals belongs to the v--v (Virtual Vision) personal brand.
The aesthetic is **dark, precise, and purposeful** — like looking at a control panel in space.
It should never feel like a generic health app (no greens, no rounded bubbly UI, no white backgrounds).

The tension that makes the brand interesting: **warm parchment text against cold void backgrounds**.
Burgundy is used like a signal light — sparingly, only where attention is needed.

---

## Colour tokens

Define these as CSS custom properties on `:root` in `index.css`.

```css
:root {
  /* Backgrounds — dark mode only */
  --void:          #0A0612;   /* page background — deepest level */
  --deep-space:    #110D1A;   /* card background — one level up */
  --cosmos:        #1A1025;   /* elevated surface — modals, popovers */
  --nebula-dark:   #2E0A40;   /* purple-tinted bg — used sparingly */

  /* Accent — burgundy family */
  --claret:        #6B1F2E;   /* deep accent, shadows, pressed states */
  --burgundy:      #8B2635;   /* PRIMARY accent — borders, CTAs, the -- in v--v */
  --rose:          #B85C6A;   /* soft highlight, hover states */
  --burgundy-dim:  rgba(139, 38, 53, 0.18);  /* subtle burgundy tint on surfaces */
  --burgundy-border: rgba(139, 38, 53, 0.2); /* default card border colour */

  /* Accent — purple family */
  --deep-purple:   #3D0C5E;   /* space accent, background gradients */
  --nebula:        #5C1A6B;   /* section labels, category text */
  --aurora:        #7B3FA0;   /* light purple, decorative only */

  /* Neutrals */
  --ivory:         #F0E9DC;   /* light mode bg — not used in Vitals */
  --parchment:     #E5DBCB;   /* PRIMARY text — all headings and body */
  --ash:           #C8C5BE;   /* muted text — secondary labels */
  --pewter:        #9E9B94;   /* supporting text — captions, metadata */
  --graphite:      #3E3C3A;   /* dark text for light surfaces */

  /* Semantic aliases — use these in components */
  --bg-page:       var(--void);
  --bg-card:       var(--deep-space);
  --bg-elevated:   var(--cosmos);
  --text-primary:  var(--parchment);
  --text-secondary: var(--ash);
  --text-muted:    var(--pewter);
  --text-label:    var(--nebula);
  --accent:        var(--burgundy);
  --accent-dim:    var(--burgundy-dim);
  --border:        var(--burgundy-border);
  --border-active: var(--burgundy);
}
```

### Colour usage rules

| Colour | Use for | Never use for |
|---|---|---|
| Burgundy `#8B2635` | The `--` in `v--v`, active borders, CTA buttons, the V initial in product names | Large background fills, decorative blobs |
| Parchment `#E5DBCB` | All primary text, the wordmark, headings, macro numbers | Backgrounds |
| Nebula `#5C1A6B` | Section labels, category text, atmospheric gradients | Body text — decorative only |
| Void `#0A0612` | Page background | Never pure `#000000` — always use tinted void |
| Pewter `#9E9B94` | Captions, metadata, timestamps, helper text | Primary content |

---

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

:root {
  --font-serif: 'DM Serif Display', Georgia, serif;
  --font-mono:  'DM Mono', monospace;
}
```

### Type scale

| Role | Font | Size | Weight | Colour |
|---|---|---|---|---|
| Wordmark / hero | DM Serif Display | clamp(52px, 12vw, 96px) | 400 | Parchment |
| Page heading | DM Serif Display | 28px | 400 | Parchment |
| Card title | DM Serif Display | 20px | 400 | Parchment |
| Product name (e.g. modal title) | DM Serif Display | 17px | 400 | Parchment |
| Body / UI text | DM Mono | 13px | 400 | Parchment |
| Labels / section headers | DM Mono | 10–11px | 400 | Nebula |
| Captions / metadata | DM Mono | 10–11px | 300 | Pewter |
| Macro numbers (large) | DM Mono | 18–24px | 500 | Parchment |
| Macro numbers (small) | DM Mono | 13px | 500 | Parchment |

### Typography rules

- Section labels are always `letter-spacing: 0.18em; text-transform: uppercase;` in Nebula
- Never use font-weight 700 — DM Serif Display has no bold; DM Mono max weight is 500
- Italic is available on DM Serif Display — use for taglines and decorative callouts only
- Body text line-height: 1.6. Label line-height: 1.2.

---

## The v--v wordmark

```html
<!-- Primary — dark background -->
<span class="wordmark">
  <span style="font-family: var(--font-serif); color: var(--parchment);">v</span>
  <span style="font-family: var(--font-mono); color: var(--burgundy); font-size: 0.55em; letter-spacing: -0.05em; vertical-align: middle; position: relative; top: -2px;">--</span>
  <span style="font-family: var(--font-serif); color: var(--parchment);">v</span>
</span>

<!-- Product lockup: v--v | Vitals -->
<!-- Mark + burgundy divider line + product name + sub-label -->
```

### Wordmark rules

- The `v` characters are always DM Serif Display
- The `--` is always DM Mono, always Burgundy `#8B2635`
- The `--` sits slightly smaller (0.55em) and vertically centred between the v characters
- Never stretch, rotate, recolour, or outline the mark
- On light backgrounds: `v` characters use Graphite `#3E3C3A`, `--` stays Burgundy
- At favicon/small sizes: use a single `-` instead of `--`

### Product lockup pattern

```
v--v  |  Vitals
      |  Health & Nutrition
```

- Mark on left
- Thin vertical burgundy divider (0.5px, ~32px tall, 40% opacity)
- Product name in DM Serif Display 14px Parchment
- Sub-label in DM Mono 9px Nebula, letter-spacing 0.18em, uppercase

---

## Spacing & layout

```css
:root {
  --radius-sm:   8px;
  --radius-md:   10px;
  --radius-lg:   12px;
  --radius-xl:   16px;

  --space-xs:    4px;
  --space-sm:    8px;
  --space-md:    12px;
  --space-lg:    16px;
  --space-xl:    24px;
  --space-2xl:   32px;
}
```

- Cards use `--radius-md` (10px)
- Modals use `--radius-lg` (12px)
- Badges and pills use `--radius-sm` (8px)
- Page padding: `24px` on desktop, `16px` on mobile
- Card internal padding: `16px 20px`
- Gap between cards in a grid: `8px`

---

## Border rules

- Default card border: `0.5px solid var(--border)` — `rgba(139, 38, 53, 0.2)`
- Active / selected card border: `0.5px solid var(--burgundy)` — `#8B2635`
- Hover state: `rgba(139, 38, 53, 0.5)` — slightly brighter
- Dividers inside cards: `0.5px solid var(--border)`
- Never use `1px` borders — always `0.5px` for the refined precision feel
- No box shadows. Depth is communicated through background colour stepping
  (void → deep-space → cosmos), not shadows.

---

## Component patterns

### Card

```css
.card {
  background: var(--bg-card);         /* #110D1A */
  border: 0.5px solid var(--border);  /* rgba(139,38,53,0.2) */
  border-radius: var(--radius-md);    /* 10px */
  padding: 16px 20px;
  transition: border-color 0.2s;
}
.card:hover {
  border-color: rgba(139, 38, 53, 0.5);
}
.card.active {
  border-color: var(--burgundy);
}
```

### Section label (used above every content block)

```css
.section-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--nebula);               /* #5C1A6B */
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 0.5px solid var(--border);
}
```

### Macro stat card (used in totals bar and modal)

```css
.macro-card {
  background: var(--bg-elevated);     /* #1A1025 */
  border-radius: var(--radius-md);
  padding: 10px 8px;
  text-align: center;
}
.macro-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--pewter);
  margin-bottom: 4px;
}
.macro-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  color: var(--parchment);
}
```

### Badge / tag

```css
.badge {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  background: var(--accent-dim);      /* rgba(139,38,53,0.18) */
  color: var(--rose);                 /* #B85C6A */
  border: 0.5px solid var(--border);
}
```

### Button — primary (Add to plan)

```css
.btn-primary {
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: var(--accent-dim);
  color: var(--parchment);
  border: 0.5px solid var(--burgundy);
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover {
  background: rgba(139, 38, 53, 0.28);
}
```

### Button — secondary (Save to favourites)

```css
.btn-secondary {
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--ash);
  border: 0.5px solid var(--border);
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-secondary:hover {
  border-color: rgba(139, 38, 53, 0.5);
  color: var(--parchment);
}
```

### Button — contextual group add (Add to [meal])

```css
.btn-group-add {
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: rgba(92, 26, 107, 0.15);   /* nebula tint */
  color: var(--parchment);
  border: 0.5px solid rgba(92, 26, 107, 0.4);
  cursor: pointer;
  width: 100%;
  transition: background 0.15s;
}
.btn-group-add:hover {
  background: rgba(92, 26, 107, 0.25);
}
```

### Input / search field

```css
.input {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--bg-elevated);
  border: 0.5px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--parchment);
  padding: 10px 14px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.input::placeholder {
  color: var(--pewter);
}
.input:focus {
  border-color: var(--burgundy);
}
```

### Range slider (quantity input)

The native `<input type="range">` should be styled via shadcn/ui Slider.
Override its CSS variables to match the brand:

```css
/* Target shadcn Slider track and thumb */
[data-slot="slider-track"] {
  background: var(--bg-elevated);
  border: 0.5px solid var(--border);
  height: 4px;
}
[data-slot="slider-range"] {
  background: var(--burgundy);
}
[data-slot="slider-thumb"] {
  background: var(--parchment);
  border: 1.5px solid var(--burgundy);
  width: 16px;
  height: 16px;
}
```

---

## Page-level background

The page background is not flat — there is a subtle radial gradient providing
atmospheric depth, as if there is a light source far below:

```css
body {
  background-color: var(--void);
  background-image:
    radial-gradient(ellipse 60% 50% at 50% 100%, rgba(92, 26, 107, 0.25) 0%, transparent 70%),
    radial-gradient(ellipse 40% 30% at 20% 50%, rgba(139, 38, 53, 0.08) 0%, transparent 60%);
  min-height: 100vh;
}
```

---

## The food detail modal

This is the centrepiece interaction of the app. Full spec:

```
┌─────────────────────────────────────────────┐
│ [brand/source label — Nebula, uppercase]  [×] │
│ Food name — DM Serif Display 17px Parchment   │
├─────────────────────────────────────────────┤
│ [badge: category]  Per 100g: X cal            │
│                                               │
│ How much are you having?          [  250g  ]  │
│ ──────────●──────────────────────────────     │  ← slider
│ 25g                           500g            │
│                                               │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │Calories│ │Protein │ │ Carbs  │ │  Fat   │  │  ← macro cards
│ │  170   │ │  12g   │ │  18g   │ │   4g   │  │
│ └────────┘ └────────┘ └────────┘ └────────┘  │
│                                               │
│ Day total after adding          1,544 cal     │  ← info row
│                                               │
│ [♡ Save to favourites] [+ Add to plan]        │  ← secondary + primary btn
│                                               │
│ [⬡ Add to Chobani yoghurt]                    │  ← group btn (if groups exist)
│ [⬡ Add to Lunch]                              │  ← one per existing group
└─────────────────────────────────────────────┘
```

### Modal behaviour rules

- Opens as a shadcn/ui `<Dialog>` — focus trapped, Escape closes, backdrop click closes
- Backdrop: `rgba(0, 0, 0, 0.6)` over the page
- Modal background: `var(--cosmos)` — `#1A1025` (one level higher than cards)
- Modal border: `0.5px solid var(--burgundy)` — the active state border
- Slider range: 25g minimum, 500g maximum, step 25g
- Default gram value: the food's standard serving size if available, else 100g
- Macros recalculate on every slider move — no submit needed
- Day total row only appears when there are already items in today's plan
- "Add to [group]" buttons only appear when meal groups exist in the day plan
- Each "Add to [group]" button uses `btn-group-add` style (nebula tint, not burgundy)
- After clicking any add button: close modal, item appears in plan, totals update

---

## Day plan panel

```
┌────────────────────────────────┐
│ Today's plan          3 items  │  ← section header
├────────────────────────────────┤
│ · YOGHURT BOWL                 │  ← meal group label (Nebula, uppercase, mono)
│   Greek Yoghurt   250g  145cal │
│   Mixed Berries   100g   57cal │
│   [+ Add to yoghurt bowl]      │  ← inline add button
├────────────────────────────────┤
│ · LUNCH                        │
│   Chicken Breast  180g  297cal │
│   Brown Rice      150g  165cal │
├────────────────────────────────┤
│ [+ Add new meal group]         │
├────────────────────────────────┤
│ CAL    PROTEIN   CARBS   FAT   │  ← totals bar (sticky bottom of panel)
│ 664     52g       58g    8g    │
└────────────────────────────────┘
```

### Day plan rules

- Meal group headers use the section-label style (Nebula, uppercase, mono, 10px)
- Food rows: name left-aligned, grams + calories right-aligned
- A `×` remove button appears on hover of each food row
- "Add to [group]" inline button sits below the last item in each group
- Totals bar is sticky at the bottom — always visible
- Empty state: a single line of pewter italic text — *"Add foods to start planning your day"*

---

## Search results list

```
┌────────────────────────────────────┐
│ 🔍 [search input]                  │
├────────────────────────────────────┤
│ ┌──────────────────────────────┐   │
│ │ Rokeby Farms Strawberry      │   │  ← result card
│ │ Smoothie                     │   │
│ │ Open Food Facts · per 100g   │   │  ← source label (Pewter)
│ │                      68 cal  │   │  ← cal right-aligned (Burgundy)
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ Chobani Greek Yoghurt...     │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

- Result cards use the standard `.card` style with hover border brightening
- Calorie value is right-aligned in Burgundy to draw the eye
- Source label (Open Food Facts / AI estimate) in Pewter italic
- Clicking a result opens FoodModal — the card does not navigate away

---

## AI input panel

Two tabs: **Describe it** and **Screenshot it**

### Describe it tab

```
┌─────────────────────────────────────────────┐
│ Describe what you're eating...               │
│ e.g. "large Big Mac meal with Diet Coke"     │
│                                              │  ← textarea, 3 rows
│                                 [Analyse ↗] │
└─────────────────────────────────────────────┘
```

- While loading: button text becomes "Analysing..." with a subtle pulse animation
- On success: FoodModal opens with the AI-returned food
- Textarea background: `var(--bg-elevated)`, border: `var(--border)`

### Screenshot it tab

```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │   Paste or drop a menu screenshot   │    │  ← drop zone
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  [Preview of pasted image if available]      │
│                                    [Scan ↗] │
└─────────────────────────────────────────────┘
```

- Drop zone border: `1px dashed var(--border)` — dashed to signal interactivity
- On image paste: show a small preview thumbnail (max 120px tall)
- While scanning: "Scanning menu..." with pulse animation
- On success with multiple foods: show a checklist of returned items,
  each with an [Add] button to add individually

---

## Navigation bar

```
v--v  |  Vitals             [Today's plan]  [Favourites]
```

- Full width, background: `var(--deep-space)` — `#110D1A`
- Bottom border: `0.5px solid var(--border)`
- Left: wordmark lockup (mark + divider + product name)
- Right: nav links in DM Mono 12px Pewter, active link in Parchment
- Height: 52px
- Padding: `0 24px`
- No hamburger menu — keep it desktop-first for the portfolio

---

## Favourites page

A grid of saved food cards, 2–3 columns.

Each card:
```
┌──────────────────┐
│ V Chobani Greek  │  ← V initial in Burgundy, name in Parchment Serif
│   Yoghurt        │
│                  │
│ 97 cal / 100g    │  ← Pewter mono
│ P 9g  C 4g  F 5g │  ← macro pills
│                  │
│ [Add to plan] [×]│
└──────────────────┘
```

- The first letter of the food name is rendered large in Burgundy (the "product name V" pattern from the brand)
- Macro pills: tiny badges showing P/C/F values inline

---

## Responsive breakpoints

| Breakpoint | Layout |
|---|---|
| `> 768px` | Two columns: Search/AI left, Plan right |
| `≤ 768px` | Single column, stacked. Plan panel moves below search. |
| `≤ 480px` | Macro stat cards collapse to 2×2 grid instead of 1×4 row |

---

## Animation principles

Keep animations subtle — this is a precision tool, not a consumer app.

- Card hover border transition: `0.2s ease`
- Modal open/close: shadcn/ui Dialog handles this — do not override with custom animation
- Loading states: a slow `opacity` pulse, `1s ease-in-out infinite` between `0.4` and `1`
- Macro numbers updating: no animation — instant update reinforces the "live calculation" feel
- Avoid bounce, spring, or playful easing — use `ease` or `ease-out` only

---

## What to avoid

| Do not use | Use instead |
|---|---|
| Pure black `#000000` | `--void` `#0A0612` |
| Pure white `#ffffff` | `--parchment` `#E5DBCB` or `--ivory` `#F0E9DC` |
| Green for "healthy" cues | Burgundy or Nebula for all accents |
| Rounded pill buttons | `border-radius: var(--radius-md)` — 10px max |
| Box shadows for depth | Background colour stepping (void → deep-space → cosmos) |
| Inter, Roboto, or system fonts | DM Serif Display + DM Mono only |
| Gradients on components | Flat fills only — gradient only on page background |
| Weight 600 or 700 | Max weight 500 (DM Mono) or 400 (DM Serif Display) |
| Bright greens, blues, or teals | Palette is warm (parchment, burgundy) + cool (purple/nebula) only |

