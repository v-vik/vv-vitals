# v--v Vitals — Changelog

Running log of what's been built, session by session.

---

## Session 4 — 2026-06-21

### Mobile food-logging (tap-to-add) + deploy prep

The app could only add food by **dragging** a card into a meal slot — unusable on a
phone (touch-drag fought with scroll, and the meal slots were off-screen). Added a
reliable tap path so a full day can be logged on mobile, keeping drag as a desktop delight.

- **Tap-to-add** — tapping any food card (`HeroCard` / `AltCard` in `FoodDiscovery.tsx`)
  opens the `FoodModal`. Cards stay draggable; `onClick` is placed after the dnd-kit
  listener spread so it isn't clobbered.
- **Meal picker in the modal** — `FoodModal` now shows a button per visible meal slot
  (filled meals + the next empty one), each with its current calorie total, so you choose
  where the food lands. Replaces the old single "Add to plan" button. `onAdd` now carries
  a `slotId: MealSlotId` instead of a legacy `groupId`. New exported `MealOption` type.
- **Touch-drag tuning** — replaced the single `PointerSensor` with `MouseSensor`
  (instant, desktop) + `TouchSensor` (180 ms press-hold, 8 px tolerance). A quick tap now
  opens the modal and a vertical swipe scrolls; only a deliberate press-hold starts a drag.
- **Mobile modal** — becomes a bottom sheet (`align-items: flex-end`, rounded top,
  safe-area padding); meal picker collapses to one column for bigger tap targets.
- **Deploy config** — root `vercel.json` builds `client/` and serves `client/dist`, so a
  Vercel import works with the default root directory. Frontend is fully standalone
  (OFF API called directly, AI mocked, favourites in-memory) — no backend needed to deploy.

---

## Session 3 — 2026-06-17 / 2026-06-21

### Vault redesign (mobile + desktop)

- **Mobile vault bar** — shows N food cards dynamically calculated to fit the screen width, no scrolling required. Formula: `Math.max(1, Math.floor((width - 16) / 80) - 1)` — recalculates on window resize.
- **Open vault button** — square card, same size as food cards, placed at the left of the vault bar on mobile (`order: -1`) so the dropdown opens left-aligned.
- **Mobile dropdown** — opens below the vault bar (`top: 100%`), full-width, scrollable up to 60vh. Closes on Escape or click-outside.
- **Desktop vault** — plain infinite-scrolling 2-column grid on the right side. No open button on desktop.
- **Drag-to-vault** — any food card can be dragged and dropped onto the vault to save it as a favourite. Uses `@dnd-kit/core` `useDroppable`. Toast confirms the save.
- **10 example favourites** in `INITIAL_FAVOURITES` for testing (chobani-greek, almond-butter, salmon, chicken-breast, brown-rice, banana, eggs, avocado, rolled-oats, big-mac).
- **Drop target highlight** — vault gets a burgundy left border and tinted background when a food is dragged over it (`.vault--drop-target`).

### New components

| File | What it does |
|---|---|
| `Vault.tsx` | Vault sidebar with mobile dropdown, drag-to-vault, dynamic card limit |
| `VaultModal.tsx` | Full-screen vault overlay (built, not currently used — superseded by dropdown) |
| `FoodDiscovery.tsx` | Food card grid for search results and local DB browse |
| `IngredientPanel.tsx` | Ingredient breakdown view for composite foods (e.g. Big Mac) |
| `MacroBar.tsx` | Sticky macro summary bar showing day totals + live drag delta |
| `StatsPanel.tsx` | Per-slot macro stats panel |

---

## Session 2 — 2026-06-17

### Destiny 1 loadout UI

- **3-column layout** — meal squares (left), food discovery + search (centre-right), vault (far right).
- **MealSlot** — draggable food well that accepts drops. Shows ingredient breakdown when a composite food is equipped. Active slot highlighted.
- **Drag delta preview** — while dragging a food over a slot, the MacroBar shows `+Xcal / +Xg protein` live as a coloured delta overlay. Uses `computeDelta()` in `useDayPlan`.
- **Ingredient decomposition** — composite foods (e.g. Big Mac) expand into sub-ingredients when dropped into a slot. Each ingredient appears as a separate line with its own macros.
- **XMB-style meal row** — horizontal scrolling row of meal squares (temporarily disabled keyboard slide; re-enable instructions in `XMB_SLIDE.md` memory).
- **DragTarget type** — discriminated union: `{ type: 'slot' } | { type: 'ingredient' } | null` — determines whether a drop adds to or swaps within a slot.
- **SWAP_INGREDIENT action** — drag a food from search onto an existing ingredient to replace it in-place.

### Brand + styling

- v--v colour tokens (`--burgundy`, `--parchment`, `--void`, `--nebula`) defined as CSS custom properties.
- DM Serif Display (headings) + DM Mono (body/UI) fonts loaded via Google Fonts.
- Dark void background (#0A0612), burgundy accents (#8B2635), parchment text (#E5DBCB).

---

## Session 1 — 2026-06-17

### Initial scaffold

- Vite + React + TypeScript frontend (`client/`).
- Node.js + Express + TypeScript backend (`server/`).
- SQLite via `better-sqlite3` — `favourites` table.
- `@dnd-kit/core` installed for drag-and-drop.
- `@tanstack/react-query` for data fetching.
- Zod schemas for runtime validation.
- `useDayPlan` — `useReducer` hook managing meal slots, plan state, and day totals.
- `FOOD_DB` — local food database with 17 items across Dairy, Protein, Grain, Fruit, Beverage, Fast Food categories.
- Open Food Facts API search wired up with 400ms debounce.
- `FoodModal` — detail modal with gram slider, live macro preview, add-to-plan action.
- `HeroSearch` + `AIPanel` — search bar and AI text description input.
- `Nav` — top navigation with v--v Vitals wordmark.
