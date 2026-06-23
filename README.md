# v--v Vitals

A nutrition **day-planner** — the inverse of a conventional calorie tracker. Instead of logging
meals *after* you eat, you build your whole day upfront, watch your macro totals update in real
time, and adjust until the day looks right.

Built as a portfolio project to demonstrate production-quality React + TypeScript, a hand-authored
design system, and a genuinely novel interaction model.

> **Live demo:** _add your Vercel URL here_

![v--v Vitals](verify-01-full.png)

---

## The idea

Most trackers are retrospective and guilt-driven. v--v Vitals is the opposite:

- **Plan, don't log** — assemble the full day before you eat it.
- **See the impact before you commit** — drag a food over a meal slot and the macro bar previews
  the *delta* it would add, in real time, before you drop it.
- **No targets, no history, no scores** — running totals only. Today's plan is the whole product.

The UI takes its cues from the **Destiny 1 character screen**: your day is a row of meal "slots"
you equip foods into, with a persistent stats bar across the top.

---

## Key interactions

### Drag-to-equip
Foods are dragged from the discovery grid onto numbered meal slots. Built on
[`@dnd-kit`](https://dndkit.com/) with separate **mouse** and **touch** sensors — desktop drags
start after 6px of movement, while touch requires a 180ms press-and-hold so that a quick tap opens
the detail modal and a vertical swipe still scrolls the page.

### Live macro-delta preview
While a food hovers over a slot, the top macro bar shows the **change** it would make to the day —
not just the food's own macros. Dropping onto an existing ingredient computes a true *swap delta*
(`new − old`). All of this is derived state, recomputed on every drag-over via a pure
`computeDelta()` function — nothing is stored twice.

### Ingredient swapping
Drop a food directly onto an ingredient already in a meal and it swaps in place, keeping the slot
intact. The drop target is a **discriminated union** (`{ type: 'slot' } | { type: 'ingredient' } | null`),
so the type system forces every drop case to be handled.

### Progressive meal reveal
The day starts as a single empty slot. As you fill slots, the next empty one appears — filled slots
plus exactly one trailing drop target — so the row grows with your plan instead of showing six empty
boxes up front.

### The Vault
A drag target for saving foods to a personal favourites library. Drag any food to the Vault to keep
it; it stays one drag away from re-entering tomorrow's plan.

### Food detail modal
Tap any food to open a detail modal with a gram slider (live macro recalculation as you drag) and a
meal picker so you can choose which slot it lands in.

---

## Food data

- **Live search** against the [Open Food Facts](https://world.openfoodfacts.org/) API (3M+ products,
  no API key). Queries are debounced 400ms, normalised into the app's `Food` shape, auto-categorised
  from OFF's `categories_tags`, and energy is converted from kJ to kcal when kcal isn't provided.
- A curated **local food database** seeds the discovery grid before you search, including multi-
  ingredient foods (e.g. a yoghurt bowl) that expand into their components when added.
- **AI features** (describe-a-meal and scan-a-menu-photo) are currently **simulated stubs** with
  realistic latency, designed to be wired to a Claude API proxy on the backend — the request/response
  shapes and UI flows are already in place.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Drag & drop | `@dnd-kit/core` (custom mouse/touch sensors) |
| State | `useReducer` + discriminated-union actions; `useState` for UI state |
| Styling | Hand-authored CSS design system (~2,850 lines) — no Tailwind, no component library |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite via `better-sqlite3` (WAL mode) |
| External API | Open Food Facts |
| Fonts | DM Serif Display + DM Mono |
| Deploy | Vercel (client) |

---

## Architecture decisions

**`useReducer` for the day plan.** Meal slots, their items, and the derived day/slot totals all
change together. A single reducer with discriminated-union action types (`ADD_TO_SLOT`,
`SWAP_INGREDIENT`, `REMOVE_FROM_SLOT`, `CLEAR_SLOT`, …) keeps every mutation in one predictable
place. ([client/src/hooks/useDayPlan.ts](client/src/hooks/useDayPlan.ts))

**Store the minimum, derive the rest.** Macros, day totals, slot totals, the visible-slot set, and
the drag delta are all `useMemo`-derived from `{ slots, knownFoods }`. The only stored state is the
gram quantity and which food sits in which slot — everything else is computed.

**Discriminated unions over booleans.** The drag target and the reducer actions are tagged unions, so
TypeScript's exhaustiveness checking catches an unhandled case at compile time rather than at runtime.

**No UI library.** The entire visual identity lives in one hand-tuned stylesheet
([client/src/styles/globals.css](client/src/styles/globals.css)) — custom properties, component
classes, and animations. The design system *is* the portfolio piece, not a third-party theme.

**Accessibility-minded drag.** Touch and mouse are handled by distinct sensors with their own
activation constraints so the gesture set (tap-to-open vs. hold-to-drag vs. swipe-to-scroll) stays
unambiguous on mobile.

**Custom hooks for cross-cutting concerns.** `useToast` (timer-managed, `useRef` to avoid stale
closures) and `useKeyboardShortcut` (`/` focuses search) keep `App.tsx` focused on orchestration.

---

## Project structure

```
vv-vitals/
  client/
    src/
      App.tsx                  ← Root: DnD context, drag handlers, layout orchestration
      types.ts                 ← Food, MealSlot, PlanItem, DragTarget (union), Macros, Totals
      data/foods.ts            ← Local food DB + computeMacros / fmt helpers
      lib/openFoodFacts.ts     ← Open Food Facts search + normalisation to Food
      hooks/
        useDayPlan.ts          ← useReducer day-plan store + computeDelta()
        useToast.ts            ← Timer-managed toast state
        useKeyboardShortcut.ts ← Keyboard listener with clean lifecycle
      components/
        MealSlot.tsx           ← Destiny-style meal square (drop target)
        FoodDiscovery.tsx      ← Searchable food grid (drag sources)
        Vault.tsx              ← Favourites library + drop target
        MacroBar.tsx           ← Top stats bar with live delta preview
        FoodModal.tsx          ← Gram slider + meal picker
        AIPanel.tsx            ← Scan-a-menu flow (simulated)
        HeroSearch.tsx         ← Search input + AI-describe shortcut
        FoodGlyph.tsx / Icon.tsx / Nav.tsx / Toast.tsx
      styles/globals.css       ← ~2,850-line design system
  server/
    src/
      index.ts                 ← Express entry (port 3001, CORS, error handler)
      db.ts                    ← SQLite setup (WAL mode)
      routes/
        foods.ts               ← Foods CRUD (GET/POST/PUT/DELETE)
        diary.ts               ← Diary entries, meals, and meal-food logging
```

---

## Running locally

```bash
# Backend  (terminal 1)
cd server && npm install && npm run dev      # http://localhost:3001

# Frontend (terminal 2)
cd client && npm install && npm run dev      # http://localhost:5173
```

The client runs standalone on the local food database + Open Food Facts search, so you can explore
the full planner UI without the backend running.

---

## Design system

A warm, parchment-toned identity under the **v--v** personal brand:

| Token | Value | Usage |
|---|---|---|
| `--void` | `#F2EADA` | Page background (warm cream) |
| `--deep-space` | `#EBE2CD` | Card background |
| `--cosmos` | `#F7F0E0` | Elevated surfaces (modals) |
| `--burgundy` | `#8B2635` | Primary accent |
| `--nebula` | `#6B2A7E` | Section labels, small caps |
| `--parchment` | `#2A2826` | Primary text |
| `--pewter` | `#837E76` | Secondary / muted text |
| `--font-serif` | DM Serif Display | Headlines, food names, wordmark |
| `--font-mono` | DM Mono | Body, labels, numbers, UI |
