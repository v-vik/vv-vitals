# v--v Vitals

A personal nutrition planning app — built as a portfolio project to demonstrate production-quality React and TypeScript.

The core idea is the opposite of conventional calorie trackers: instead of logging meals *after* you eat, you plan your full day *upfront*, watch your macro totals update in real time, and adjust until the day looks right.

---

## Features

### Food discovery
- **Hero search** — large serif input that filters the food database as you type, with a `/` keyboard shortcut to focus it from anywhere
- **Food/Drink/Favourite tabs** — vertical browse column with item counts; filters the results grid instantly
- **Sort controls** — sort by Default / Protein / Carbs / Fat / Calories with a pill-style button group

### Food cards
- Grid layout with a custom monoline SVG icon per food (yoghurt bowl, salmon, espresso, etc.)
- Macro ratio bar — a thin coloured strip showing the protein/carb/fat split, scaled logarithmically so dense foods don't overwhelm the chart
- Category colour tinting on the glyph badge (burgundy for protein, rose for fruit, nebula for vegetables, etc.)

### Food modal
- Opens with an origin-anchored animation — grows from the card's position using `useLayoutEffect` and CSS transitions
- Gram slider (25g–500g, step 25g) with live macro recalculation on every drag
- "Day total after adding" line — shows the running total impact before committing
- Save to favourites / Add to plan buttons
- Contextual "Add to [meal group]" buttons for every existing group in the cart

### Cart (day plan)
- Fixed right-side panel, collapsible via the nav cart button
- Foods displayed as bubbles: glyph icon | name + gram/macro summary | calorie count + remove button
- Meal grouping — multiple items auto-group and show a "Save meal" prompt; click to name the group (e.g. "Yoghurt bowl")
- Inline rename flow with keyboard support (Enter to save, Esc to cancel)
- "+ Add new meal group" button
- Totals bar: Cal / Protein / Carbs / Fat

### AI features (mocked, ready to wire up)
- **AI Describe** — type a meal description in the hero search, press ⌘↵, and the app simulates an AI response (~1.1s latency) opening the food modal with an "AI estimate" badge
- **Scan a menu** — paste or drop a menu screenshot; simulates a scan returning detected items as an addable checklist

### Stats bar
- Sticky sub-nav showing today's Cal / Protein / Carbs / Fat with icons (flame, drumstick, wheat, droplet, bean)
- Calories display in burgundy accent; all values update live as items are added or removed

### UX details
- Toast notifications — 2s auto-dismiss, appears on every add/remove/favourite action
- Cart pulse animation — the nav cart icon scales up on every item count increase (force-reflow trick to re-trigger CSS animation)
- ESC closes the modal; clicking the backdrop closes it
- Body scroll locks while the modal is open

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Vanilla CSS (2,780-line hand-tuned design system, no Tailwind/shadcn) |
| State | `useState` + `useReducer` patterns, no external store |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite via `better-sqlite3` |
| Fonts | DM Serif Display + DM Mono (Google Fonts) |

---

## Architecture decisions

### No UI library
The entire visual identity lives in a single hand-authored `styles.css` — 2,780 lines of custom properties, component classes, and animations. No Tailwind, no shadcn, no Radix. This makes the design system the portfolio piece, not a third-party library.

### Flat TypeScript types over inference
Every data shape is defined once in `src/types.ts` (`Food`, `PlanGroup`, `PlanItem`, `Macros`, `Totals`) and imported wherever needed. The food database module re-exports typed helper functions (`computeMacros`, `planTotals`, `groupCal`) that are pure and easily testable.

### `useState` over a global store
The cart (plan) state is a flat array of `PlanGroup[]` managed in `App.tsx` with `useState` and immutable update patterns. State flows down via props; mutations flow up via callbacks. No Redux, no Zustand — demonstrating that React's built-in model scales to this complexity without additional dependencies.

### `useCallback` + `useMemo` for performance hygiene
All callbacks passed to child components are wrapped in `useCallback`. Derived values (totals, counts, filtered results) are wrapped in `useMemo`. This prevents unnecessary re-renders without resorting to external state management.

### Custom hooks for cross-cutting concerns
- `useToast` — timer-managed toast state with `useRef` to avoid stale closure on repeated calls
- `useKeyboardShortcut` — event listener lifecycle managed cleanly in `useEffect`

### Origin-anchored modal animation
When a food card is clicked, its `DOMRect` is captured and passed to `FoodModal`. A `useLayoutEffect` calculates the translation and scale delta between the card's position and the modal's centered position, then applies a CSS transition from the card outward. This is a pure DOM measurement pattern with no animation library.

---

## Project structure

```
vv-vitals/
  client/
    src/
      styles/
        globals.css          ← 2,780-line design system (copied verbatim from prototype)
      types.ts               ← Food, PlanGroup, PlanItem, Macros, Totals, ViewMode, SortKey
      data/
        foods.ts             ← Food DB + computeMacros, planTotals, groupCal, fmt helpers
      components/
        Icon.tsx             ← 18 monoline SVG icons, typed with IconProps
        Nav.tsx              ← Wordmark lockup + cart button with pulse animation
        FilterBar.tsx        ← Day stats strip + BrowseColumn (Food/Drink/Favourite tabs)
        HeroSearch.tsx       ← Large search input + AI Describe shortcut
        FoodGlyph.tsx        ← Per-food SVG icon + category colour tinting
        ResultsGrid.tsx      ← FoodCard grid, MacroRatioBar, sort controls
        AIPanel.tsx          ← Scan-a-menu bar with paste/drop/scan flow
        Cart.tsx             ← Fixed side panel: groups, bubbles, rename, totals
        FoodModal.tsx        ← Gram slider + live macros + origin animation + group buttons
        Toast.tsx            ← 2s auto-dismiss notification
      hooks/
        useToast.ts          ← Timer-managed toast state
        useKeyboardShortcut.ts ← Keyboard event listener with proper cleanup
      App.tsx                ← Root: all state, all callbacks, layout orchestration
      main.tsx               ← Entry point
  server/
    src/
      index.ts               ← Express entry point (port 3001, CORS for localhost:5173)
      db.ts                  ← SQLite setup (WAL mode, foods table)
      routes/
        foods.ts             ← GET /api/foods, POST /api/foods, DELETE /api/foods/:id
        diary.ts             ← Diary entry and meal logging endpoints
```

---

## Running locally

```bash
# Backend
cd server && npm install && npm run dev

# Frontend (separate terminal)
cd client && npm install && npm run dev
```

Open `http://localhost:5173`

---

## Design system

The visual identity is the v--v personal brand:

| Token | Value | Usage |
|---|---|---|
| `--void` | `#F2EADA` | Page background (warm cream) |
| `--deep-space` | `#EBE2CD` | Card background |
| `--cosmos` | `#F7F0E0` | Elevated surfaces (modals) |
| `--burgundy` | `#8B2635` | Primary accent |
| `--nebula` | `#6B2A7E` | Section labels, small caps |
| `--parchment` | `#2A2826` | Primary text (dark graphite) |
| `--pewter` | `#837E76` | Secondary / muted text |
| `--font-serif` | DM Serif Display | Headlines, food names, wordmark |
| `--font-mono` | DM Mono | Body, labels, numbers, UI |
