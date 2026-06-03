# v--v Vitals — User Flow Research

## Primary user — The Planner

The app is built for one user type: **the Planner**.

> Someone who builds their full day of eating upfront — before they eat — and adjusts
> until the day looks right. They are not logging after the fact. They are designing.

This is the opposite of most nutrition apps, which are retrospective (log what you ate).
v--v Vitals is prospective — the plan comes first, eating follows the plan.

### Where planning actually starts — the supermarket insight

Observation from Yuka usage: the planning process doesn't start at the kitchen or the desk.
**It starts at the supermarket.**

Yuka is used in two distinct moments:
- **Aisle mode** — scan a product before putting it in the basket. The score answers
  "is this worth buying?" in 2 seconds. Often used to compare two similar products.
- **Research mode** — on a computer or phone before the shop. Look up products, decide
  what to put on the shopping list.

This means v--v Vitals has a natural two-stage flow that most nutrition apps miss entirely:

```
Stage 1 — Shop: Scan / evaluate products → decide what to buy
Stage 2 — Plan: Build today's meals from what you bought
```

The score does double duty. At the supermarket: "should I buy this?" At the desk:
"should I eat this today and how much?"

This is a meaningful product differentiator. Most apps only serve Stage 2.
An app that serves Stage 1 becomes a habit that starts before the user even gets home.

### User sessions by location

| Where | Device | What they need |
|---|---|---|
| Supermarket aisle | Mobile | Barcode scan → instant score → compare two products |
| Home desk | Desktop | Search / browse → build day plan → see macro totals |
| Kitchen | Mobile | Quick-add what they're about to cook |
| Restaurant / café | Mobile | AI describe or menu photo |

---

## The core goal

Every flow in this app ends at the same place:
> A food item with a gram quantity lands in today's plan and the macro totals update.

The question is: what is the fastest, least frustrating path to get there — and crucially,
how do we make that moment feel **rewarding**?

---

## Current flow (desktop)

```
Type query → Browse results (scroll to find right one) → Click card
→ Modal opens → Drag slider → Add to plan
```

**Known friction:**
- Search results are poorly ranked — the right item is often not first
- One item at a time — adding a full meal takes many round trips
- Slider is imprecise for specific gram targets (e.g. "178g of chicken")
- No memory of what you usually eat — every session starts cold

---

## Alternative user flows

---

### Flow A — Barcode scan (mobile, packaged food)

**Context:** User is in the kitchen holding a product (yoghurt, protein bar, etc.)

```
Tap scan icon → Camera opens → Point at barcode
→ Product auto-detected → Modal opens with exact product
→ Set grams → Add to plan
```

**Why it's better:** Zero search, zero ambiguity — the barcode identifies the exact product.
Fastest possible flow for packaged goods.

**Already planned:** See `NOTES.md` — `@zxing/browser` chosen for iOS compatibility.

**Key constraint:** Barcode lookup is a GET by barcode, not a text search. Different endpoint, different flow trigger.

---

### Flow B — AI describe (any device, unpackaged food)

**Context:** User just ate "two poached eggs on sourdough with a flat white" and wants to log it.

```
Type natural description → Hit ⌘↵ → AI estimates macros
→ Modal opens with estimate → Confirm grams → Add to plan
```

**Why it's better:** No searching needed for meals that don't have a barcode
(restaurant food, home cooking, combinations).

**Already partially built:** `onAnalyse` in `App.tsx` — currently mocked, not wired to Claude API.

**Weakness:** User has to trust the AI estimate. Should show confidence indicator or
allow manual override of per-100g values.

---

### Flow C — Menu screenshot (mobile, at a restaurant)

**Context:** User is at a café, photos the menu or a dish.

```
Paste / drop image → AI reads visible food items
→ Checklist of detected items appears → Tick what you ordered
→ Gram estimates applied → All selected items added to plan
```

**Why it's better:** No typing at all. Works for restaurant meals where no barcode exists.

**Already partially built:** `AIPanel` component has the UI shell — scan is mocked.

---

### Flow D — Favourite re-use (returning user, daily staples)

**Context:** User eats the same breakfast every day — oats, berries, protein shake.

```
Open Favourites tab → See saved foods
→ Click → Modal opens → Add to plan
```

**Why it's better:** Zero searching for foods you eat regularly.

**Already built:** Favourites exist in-memory. Not yet persisted to backend.

**Gap:** Favourites are individual foods, not meals. A user can't save "my breakfast" as a
single tap.

---

### Flow E — Meal template (power user, repeating meals)

**Context:** User meal preps — lunch is always the same 5 ingredients.

```
Open Meals tab → Pick saved meal (e.g. "Meal prep bowl")
→ All items added to plan at once with saved gram quantities
```

**Why it's better:** One tap to add 5 foods. Huge time saving for structured eaters.

**Not yet built.** Requires:
- Ability to save a `PlanGroup` as a named template
- Template library UI
- Apply template → bulk `ADD_ITEM` dispatch

---

### Flow F — Quick-add by typing (power user, fast entry)

**Context:** User knows exactly what they ate and just wants to type it in fast.

```
Type "180g chicken 150g rice 80g spinach" → Parse → 3 items added
→ No modal, no clicking
```

**Why it's better:** Experienced users are slowed down by the modal for every food.
This is a command-line style flow — bypasses the UI for speed.

**Not yet built.** Requires a natural language parser for the format
`{quantity}g {food name}` — could be a thin Claude call or regex + fuzzy match.

---

### Flow G — Yesterday's plan (habit user)

**Context:** User eats similarly every day and wants to start from a baseline.

```
"Same as yesterday" button → Plan pre-populated with previous day's items
→ Remove / adjust anything that changed → Done
```

**Why it's better:** For consistent eaters, building from scratch every day is unnecessary work.

**Not yet built.** Requires localStorage history (or backend). Conflicts with the
"no history" design principle in `CLAUDE.md` — worth a conversation.

---

### Flow H — Recipe import (home cook)

**Context:** User is cooking from a recipe and wants to log the whole thing.

```
Paste recipe URL or raw text → AI extracts ingredients + quantities
→ Review list → Choose serving count → Add macros-per-serving to plan
```

**Why it's better:** Home cooking often involves many ingredients — this logs them all at once.

**Not yet built.** Most complex flow — requires AI text/URL parsing + serving size maths.

---

## Flow comparison

| Flow | Device | Speed | Accuracy | Built? |
|---|---|---|---|---|
| A — Barcode scan | Mobile | ★★★★★ | ★★★★★ | Planned |
| B — AI describe | Any | ★★★★☆ | ★★★☆☆ | Mocked |
| C — Menu screenshot | Mobile | ★★★★☆ | ★★★☆☆ | Mocked |
| D — Favourite re-use | Any | ★★★★☆ | ★★★★★ | Partial |
| E — Meal template | Any | ★★★★★ | ★★★★★ | No |
| F — Quick-add typing | Desktop | ★★★★★ | ★★★★☆ | No |
| G — Yesterday's plan | Any | ★★★★★ | ★★★★☆ | No |
| H — Recipe import | Desktop | ★★★☆☆ | ★★★☆☆ | No |
| Current (text search) | Desktop | ★★☆☆☆ | ★★★☆☆ | Yes |

---

## Recommended build order

1. **Fix search ranking** — `sort_by=unique_scans_n` on OFF query. One line, immediate improvement to the existing flow.
2. **Barcode scan (Flow A)** — highest accuracy, natural mobile behaviour, already researched in `NOTES.md`.
3. **Wire AI describe (Flow B)** — already has UI, just needs the Claude API call.
4. **Persist favourites (Flow D)** — backend is already built, just not connected.
5. **Meal templates (Flow E)** — high value for returning users, builds on existing `PlanGroup` data model.
6. **Quick-add typing (Flow F)** — power user feature, relatively low effort once AI describe is wired.

---

## Desktop vs mobile — flows are not the same

The same goal (add food to plan) looks very different depending on the device.
This matters for both which flows to build and how the UI is structured.

### Desktop context

- User is typically **planning ahead** — building tomorrow's meals in the morning, or
  reviewing macros while sitting at a desk
- Has a **keyboard** — typing a search query or a natural language description is fast
- **Large screen** — results grid, plan panel, and macro bar can all be visible at once
- No camera access in practice — barcode scan and menu photo are not natural here
- Best flows: text search, AI describe (typed), meal templates, quick-add typing

### Mobile context

- User is typically **logging in the moment** — standing in the kitchen, at a café,
  post-workout
- **Thumb-driven** — typing is slow and error-prone; tapping and camera are natural
- **Small screen** — can only show one panel at a time; modals must be full-screen
- Camera is always available — barcode scan and menu photo are the natural primary flows
- Best flows: barcode scan, menu screenshot, favourite re-use, AI describe (voice or short text)

### Implications for the UI

| Concern | Desktop | Mobile |
|---|---|---|
| Primary input | Keyboard search / AI describe | Camera (barcode or photo) |
| Layout | Side-by-side (search left, plan right) | Single panel, tab-switched |
| Modals | Centred overlay, grows from card | Full-screen slide-up sheet |
| Gram input | Slider (mouse-friendly) | Stepper buttons or number pad |
| Results | Grid of cards | Scrollable list (easier to tap) |
| Navigation | Persistent sidebar or top nav | Bottom tab bar |

### What this means for build order

Flows A (barcode) and C (menu screenshot) should be treated as **mobile-first features** —
building them without a mobile layout will make them feel wrong.

Before implementing the camera flows, the layout needs a responsive breakpoint that switches
from the current desktop grid to a single-column mobile view with a bottom tab bar.

The desktop text search flow can be improved independently (ranking fix, submit-on-enter)
without touching the mobile layout.

---

## Gamification direction — the Yuka model

**Reference app:** [Yuka](https://yuka.io) — food barcode scanner that gives each product
an instant score (0–100) with a colour verdict (red / orange / yellow / green) and a plain-
English explanation. Users describe it as "addicting" because every scan delivers an
immediate emotional response — the green score feels like a reward.

### Yuka's user flow (step by step)

```
1. Open app → scanner is the default screen
2. Point camera at barcode → instant decode (no button press)
3. Score appears immediately: 0–100, colour-coded green / orange / red
4. Tap score for breakdown:
     - Nutritional quality detail (sugar, salt, fat, protein, fibre)
     - Additives list with individual risk ratings (green / yellow / orange / red dot)
     - Organic certification badge (if applicable)
5. Swipe to see "better alternatives" — similar products with higher scores
6. Heart a product to save it to favourites / clean list
```

**What makes the UX fast:** The score appears before the user has done anything except
point the camera. There is no search, no typing, no loading state visible to the user.
The result feels instant.

**Known limitation:** Yuka cannot score unpackaged foods — fresh produce, deli items,
bakery, restaurant meals. This is a genuine gap the AI describe / menu photo flows in
v--v Vitals can fill.

### Yuka's scoring model (exact breakdown)

| Component | Weight | What it measures |
|---|---|---|
| Nutritional quality | 60% | Based on Nutri-Score: penalises sugar, sodium, saturated fat, calories — rewards protein, fibre, fruit/veg content |
| Additives | 30% | Each additive rated: risk-free (green) / limited (yellow) / moderate (orange) / high-risk (red). Any high-risk additive caps the total score at 49/100 |
| Organic certification | 10% | Bonus for certified organic products (EU Regulation 2018/848) |

**Nutri-Score** is a European science-based label used as the nutritional quality input.
It produces an A–E grade (A = best) which Yuka converts to a 0–60 numerical component.

**Key insight:** Yuka's model is explicitly **not** about calories alone. It rewards
nutritional density (protein, fibre) and penalises additives and processing. A 100-calorie
product with high sugar and additives scores worse than a 300-calorie whole food.
This aligns exactly with what a health-conscious planner cares about.

### What makes Yuka psychologically compelling

1. **Instant verdict** — no reading required. One colour, one number. You know immediately.
2. **Emotional colour coding** — green triggers a reward feeling. Red triggers mild anxiety.
   Both are motivating in different ways.
3. **Discovery loop** — scanning unknown products is genuinely exciting. You don't know
   what you'll get. That uncertainty is addicting.
4. **Feeling smart** — Yuka makes users feel informed and in control. That feels good.
5. **Better alternative** — when a product scores badly, Yuka suggests a swap. Keeps
   the user engaged rather than just punished.

### How this maps to v--v Vitals (the Planner version)

Yuka rewards good individual food choices. v--v Vitals can reward **building a good day** —
which is more powerful, because the user is optimising *before* eating, not discovering
problems after.

The gratification loop for the Planner:
```
Add a food → Day score updates instantly → Score goes up → Feels good → Add another
```

If the score goes down (e.g. they add something processed or calorie-dense without
nutritional payoff), that mild friction is useful — it prompts a swap or a portion adjust.

### Specific gamification mechanics to build

| Mechanic | What it does | Yuka equivalent |
|---|---|---|
| **Day score (0–100)** | Rates the full day's plan on nutritional quality. Updates live as foods are added. | Overall product score |
| **Food quality badge** | Each food card shows a small coloured dot or score — green for nutrient-dense, red for low-quality. Visible before clicking. | Per-product score on scan |
| **Macro balance ring** | A circular progress ring per macro (protein, carbs, fat). Satisfying to watch fill. Turns green when balanced. | N/A — Planner-specific |
| **Protein-per-calorie ratio** | Show P:Cal ratio on each card. Rewards high-protein, efficient foods. | Nutriment detail panel |
| **"Level up" moments** | Animated celebration when a macro target is hit (protein goal reached, calorie budget balanced). | N/A |
| **Smart swap suggestion** | When a low-scoring food is added, surface a better alternative inline. | "Better alternative" feature |
| **Day streak** | Track consecutive days where the day score exceeded a threshold. Shown in the nav. | N/A |

### What the day score is based on

The score should reward what a health-conscious planner actually cares about:

- **Protein density** — grams of protein per 100 calories (weighted heavily)
- **Macro balance** — whether protein / carbs / fat are in a reasonable ratio
- **Whole food bias** — penalise ultra-processed foods (detectable from OFF's `nova_group` field — 1 = whole food, 4 = ultra-processed)
- **Calorie efficiency** — not going too far over or under a reasonable range
- **Variety** — penalise plans that are all one category

The score is **not** about hitting arbitrary calorie targets. It reflects nutritional quality
of the foods chosen, not adherence to a number.

### The emotional arc of a good session

```
Open app (score: 0, rings empty)
→ Add oats + berries (score jumps to 42, protein ring starts filling — feels good)
→ Add chicken breast (score hits 71, protein ring goes green — small celebration)
→ Add olive oil (score dips slightly — fat is high — prompts awareness)
→ Swap to less oil (score recovers)
→ Add spinach (score hits 84 — "Excellent day" label appears)
→ User feels satisfied. Day is planned. Ready to eat.
```

This arc — with its small rewards, mild friction, and satisfying resolution — is what makes
the app feel addicting rather than functional.

### Design principles for gamification

- **Instant feedback** — every food added must visibly change the score and rings within
  ~100ms. No waiting.
- **Positive framing** — the score goes up when you do well, not just down when you don't.
  Start at 0 and climb, don't start at 100 and lose points.
- **No shaming** — low-scoring foods are flagged gently, not harshly. The tone is
  informative, not punishing.
- **Transparency** — tapping the score shows exactly why it is what it is. No black box.
- **The plan is the product** — the satisfaction is in the plan itself looking good,
  not in post-meal logging. This is a key differentiator from every other app.

---

## UI concept — Destiny 1 weapon loadout

### The reference

Destiny 1's weapon loadout screen shows three weapon slots (Primary / Secondary / Heavy)
side by side against a dark atmospheric background. Each slot displays the weapon image
prominently, with stat bars (Impact, Range, Stability) beneath it. Selecting a slot
highlights it and shows a detail panel. Slots start empty and waiting.

The aesthetic — dark, precise, cinematic — maps directly onto the v--v brand
(`#0A0612` void background, burgundy accents, DM Mono typography).

### The mapping

| Destiny 1 | v--v Vitals |
|---|---|
| Primary weapon slot | Breakfast / Morning |
| Secondary weapon slot | Lunch / Midday |
| Heavy weapon slot | Dinner / Evening |
| Weapon image | Hero food photo (largest item or most recent addition) |
| Stat bars (Impact, Range…) | Macro bars (Protein, Carbs, Fat) |
| Overall Light Level | Day total — calories + macro summary |
| Drag weapon to slot | Drag food from search results into meal slot |
| Inspect weapon | Expand slot to see all ingredients |

### Interaction model

**Collapsed slot (default view):**
```
┌──────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░  │  ← hero food photo, fills slot
│  ░░░░░░░░░░░░░░░░░░░░░░  │
│  BREAKFAST               │  ← meal label
│  P ████████░░  38g       │  ← macro bars
│  C ██████░░░░  52g       │
│  F ███░░░░░░░  18g       │
│  420 cal                 │  ← meal calorie total
└──────────────────────────┘
```

**Expanded slot (clicked):**
```
┌──────────────────────────────────────────┐
│  BREAKFAST                    [collapse] │
├──────────────────────────────────────────┤
│  [img]  Rolled Oats      50g   189 cal  │
│         P 6.5g  C 33g  F 3.2g  [━━●━━] │
├──────────────────────────────────────────┤
│  [img]  Mixed Berries   100g    57 cal  │
│         P 0.7g  C 14g  F 0.3g  [━━●━━] │
├──────────────────────────────────────────┤
│  [img]  Honey            15g    46 cal  │
│         P 0g    C 12g  F 0g    [━━●━━] │
├──────────────────────────────────────────┤
│  MEAL TOTAL: 292 cal  P 7.2g C 59g F 3.5g│
└──────────────────────────────────────────┘
```

Each ingredient row has a slider for gram adjustment — macros update live as you drag.

**Adding a food — drag to equip:**
```
User searches "chicken breast" → result appears as a draggable card
User drags card over Lunch slot → slot highlights (drag-over state)
Delta preview appears simultaneously on:
  - The lunch slot:  + 31g protein  + 165 cal
  - The top day bar: + 31g protein  + 165 cal  (ghost numbers, greyed)
User drops → food equips into slot → delta animates into the real total
```

**The delta preview** is the key instant-gratification mechanic. Before committing,
the user sees the impact on both their meal and their entire day. This is what makes
adding each food feel meaningful and satisfying.

### Overall layout

```
┌────────────────────────────────────────────────────────┐
│  DAY TOTAL:  1,840 cal  ·  P 142g  ·  C 198g  ·  F 54g │  ← pinned top bar
├──────────────────┬──────────────────┬───────────────────┤
│   BREAKFAST      │   LUNCH          │   DINNER          │  ← three slots
│   [food photo]   │   [food photo]   │   [  empty  ]     │
│   P ████  38g    │   P ████  62g    │   + add foods     │
│   C ████  52g    │   C ████  89g    │                   │
│   F ███   18g    │   F ███   28g    │                   │
│   420 cal        │   830 cal        │                   │
├──────────────────┴──────────────────┴───────────────────┤
│  🔍  Search foods or ingredients…               [📷]   │  ← search bar
├────────────────────────────────────────────────────────┤
│  [draggable card]  [draggable card]  [draggable card]  │  ← search results
│   Chicken Breast    Brown Rice        Spinach           │     (draggable)
│   P 31g  165 cal    P 2.6g  110 cal   P 2.9g  23 cal   │
└────────────────────────────────────────────────────────┘
```

### React / TypeScript showcase value

This UI requires the most sophisticated React patterns in the codebase:

| Pattern | Where |
|---|---|
| `useReducer` with discriminated union actions | `ADD_TO_SLOT`, `REMOVE_FROM_SLOT`, `UPDATE_GRAMS`, `EXPAND_SLOT`, `COLLAPSE_SLOT` |
| Derived state via `useMemo` | Meal totals, day totals, delta preview — all computed, never stored |
| Drag and drop (`@dnd-kit/core`) | Draggable food cards, droppable meal slots |
| Drag state lifted to root | `draggingFood` + `hoverSlotId` read by both the slot AND the top bar simultaneously |
| TypeScript discriminated unions | `SlotState: 'empty' \| 'filled' \| 'drag-over'`, `MealSlotId: 'breakfast' \| 'lunch' \| 'dinner'` |
| Compound components | `MealSlot`, `MealSlot.Collapsed`, `MealSlot.Expanded`, `MealSlot.IngredientRow` |
| Controlled components | Gram slider inside each ingredient row |
| `useLayoutEffect` for animation | Delta numbers animating into the total on drop |

### Data model changes required

```typescript
type MealSlotId = 'breakfast' | 'lunch' | 'dinner';

interface MealSlot {
  id: MealSlotId;
  label: string;
  items: PlanItem[];         // ingredients in this meal
  expanded: boolean;
}

interface DayPlan {
  slots: MealSlot[];         // replaces PlanGroup[]
}

// Lifted drag state — read by slots AND the top bar
interface DragState {
  food: Food | null;
  overSlotId: MealSlotId | null;
  grams: number;             // preview gram quantity
}

// Derived — never stored
interface MacroDelta {
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
}
```

### Ingredient swap mechanic

When a slot is expanded, the user can drag a new food from search results **onto an
existing ingredient row** to replace it — not just add to the slot.

**Scenario:**
```
Breakfast slot expanded, contains: Chobani Greek + Berries + Honey
User searches "Farmers Union Greek" → drags it over the Chobani row

While hovering over the Chobani row:
  ┌─────────────────────────────────────────────┐
  │  [img]  Chobani → Farmers Union  250g       │  ← old fades, new ghosts in
  │         P  +5.0g ↑               ← green   │
  │         C  +8.3g ↑               ← green   │
  │         F  +4.5g ↑               ← green   │
  │         Cal +76  ↑               ← amber   │
  ├─────────────────────────────────────────────┤
  │  MEAL TOTAL  +76 cal  +5g P      ← propagates up to meal
  │  DAY TOTAL   +76 cal  +5g P      ← propagates up to day bar
  └─────────────────────────────────────────────┘

User drops → Chobani replaced by Farmers Union → deltas animate into real totals
```

Positive deltas shown in green, negative in red/burgundy — so if the new food has
less protein, the user sees `−3g P ↓` immediately. No judgement — just information.
The user decides whether the trade-off is worth it.

**Why this is the Destiny analogy completed:**
In Destiny 1, hovering a new weapon over an equipped slot shows `+12 Impact / −4 Stability`
before you swap. The user sees the trade-off and decides. This is that mechanic, applied
to nutrition. It's instantly legible and satisfying in the same way.

### Dual drop target types

The slot must distinguish between two drag-over states:

```
Drop on slot background  →  ADD new ingredient
Drop on ingredient row   →  SWAP that ingredient
```

This requires a typed drop target that carries context:

```typescript
type DragTarget =
  | { type: 'slot';       slotId: MealSlotId }
  | { type: 'ingredient'; slotId: MealSlotId; itemId: string }
  | null;
```

The delta calculation changes based on target type:

```typescript
// ADD:  delta = newFood macros (full addition)
// SWAP: delta = newFood macros − existingFood macros (net difference)
```

This discriminated union is the centrepiece TypeScript showcase in the codebase —
the type system enforces that every drop case is handled, and the delta logic is
fully type-safe. An interviewer reading this will immediately see disciplined
TypeScript thinking.

### Build order for this feature

1. Update data model — replace `PlanGroup[]` with `MealSlot[]`
2. Update `useReducer` — add `ADD_TO_SLOT`, `SWAP_INGREDIENT`, `REMOVE_FROM_SLOT`, `UPDATE_GRAMS`, `EXPAND_SLOT`, `COLLAPSE_SLOT` actions
3. Build `MealSlot` component — collapsed and expanded states
4. Build draggable food cards in search results (`@dnd-kit/core`)
5. Build droppable slot targets (background = add, ingredient row = swap)
6. Add `DragTarget` discriminated union + `DragState` to root
7. Wire delta preview — `computeDelta(draggingFood, target, plan)` feeds both the hovered slot and the top bar simultaneously
8. Animate the drop — delta numbers transition into real totals on release

---

## Destiny UI — what was actually built (current implementation)

The Destiny 1 concept was implemented but evolved significantly. This section documents
what is currently in the codebase — use this as ground truth for a new context window.

### Slot design — minimalist 120×120 squares

Meal slots are **120×120px squares with `border-radius: 20px`**, not full-width panels.
The squares sit in a flex row and never change size. The original expand-in-place mechanic
was removed in favour of a separate popup below.

- **Empty slot:** label + "+" dashed circle icon. Drag target only — no click interaction.
- **Filled slot:** food glyph collage + macro edge bars + hover × to clear.
- Clicking a filled slot opens a **separate ingredient popup below** it (not an expansion).

### Progressive slot reveal

Only Meal 1 is visible initially. When Meal 1 has at least one food, Meal 2 appears.
When Meal 2 has food, Meal 3 appears — up to 6 meals maximum.

```typescript
// in useDayPlan.ts
const visibleSlots = useMemo(() => {
  let lastFilledIdx = -1;
  slots.forEach((s, i) => { if (s.items.length > 0) lastFilledIdx = i; });
  const count = Math.max(1, Math.min(lastFilledIdx + 2, slots.length));
  return slots.slice(0, count);
}, [slots]);
```

### Glyph collage system

The slot face shows a responsive collage of food glyphs, not a single hero image:

| Items in slot | Layout | Glyph size |
|---|---|---|
| 1 | Single centered | 64px |
| 2–4 | 2×2 grid | 36px |
| 5–9 | 3×3 grid (first 9 shown) | 24px |

Implemented in `SlotGlyphGrid` component inside `MealSlot.tsx`.

### Macro edge bars

Four bars run along the inside edges of each slot bubble, clipped by the border-radius.
They grow symmetrically from the midpoint of each edge outward.

| Edge | Macro | Colour |
|---|---|---|
| Top | Calories | `var(--burgundy)` `#8B2635` |
| Bottom | Protein | `var(--nebula)` `#7B3FA0` |
| Left | Carbs | `#E55B1F` (orange) |
| Right | Fat | `#C8941A` (amber) |

**Scale:** linear proportion of the day total. If a slot has 40% of the day's calories,
the top bar is at 40% of the edge length. Bars never reach full edge unless the slot
holds 100% of the day's food. Animates on change via CSS transition.

The same `EdgeBars` component is reused inside each ingredient cell (see below), where
the scale is proportional to the **slot total** instead of the day total.

### Ingredient popup (3×3 grid)

Clicking a filled slot toggles a popup. **Only one popup is open at a time** — the
`expandedSlotId: string | null` state lives in `App.tsx` and is passed down as the
`expanded` prop.

The popup is **220×220px**, centred under the slot via `left: 50%; transform: translateX(-50%)`,
absolutely positioned so it floats over content without disturbing the slot row.

Each ingredient cell (~66×66px):
- Shows the food glyph (size 22) with `EdgeBars` (proportional to slot total)
- Is a `useDroppable` target — drag any food card onto it to **swap** that ingredient
- Shows a small burgundy × button on hover to **remove** that ingredient
- Has `position: relative; overflow: hidden` for bar clipping

Empty cells in the 3×3 (when a slot has fewer than 9 ingredients) show as faint dashed placeholders.

### Remove mechanics

| Target | How | Action dispatched |
|---|---|---|
| Single ingredient | Hover ingredient cell → × top-right → click | `REMOVE_FROM_SLOT` |
| Entire meal | Hover meal slot → × top-right → click | `CLEAR_SLOT` |

### Theme — light cream

The UI runs on a warm cream palette (switched from the original dark void spec):

```css
--bg-page:     #F5F0E8  /* warm cream page background */
--bg-card:     #FDFAF5  /* slightly off-white cards */
--bg-elevated: #FFFFFF  /* modal, popup backgrounds */
--parchment:   #2A1810  /* primary text — dark warm ink */
--ash:         #6B5A52  /* secondary text */
--pewter:      #9C8A82  /* muted/label text */
--burgundy:    #8B2635  /* accent — unchanged */
--nebula:      #7B3FA0  /* purple accent — slightly darkened for light bg */
```

### useReducer actions (current state)

```typescript
type Action =
  | { type: 'ADD_TO_SLOT';      slotId: MealSlotId; food: Food; grams: number }
  | { type: 'SWAP_INGREDIENT';  slotId: MealSlotId; itemId: string; food: Food }
  | { type: 'REMOVE_FROM_SLOT'; slotId: MealSlotId; itemId: string }
  | { type: 'CLEAR_SLOT';       slotId: MealSlotId }
  | { type: 'UPDATE_GRAMS';     slotId: MealSlotId; itemId: string; grams: number }
  | { type: 'EXPAND_SLOT';      slotId: MealSlotId }  // exists but unused
  | { type: 'COLLAPSE_SLOT';    slotId: MealSlotId }  // exists but unused
  | { type: 'RESET' };
```

### MealSlotId type (differs from original spec)

```typescript
type MealSlotId = `meal-${number}`;  // 'meal-1' through 'meal-6'
```

The original spec used `'breakfast' | 'lunch' | 'dinner'`. The template literal type
allows arbitrary slot counts without hardcoding meal names.

### DragTarget discriminated union (unchanged from spec)

```typescript
type DragTarget =
  | { type: 'slot';       slotId: MealSlotId }
  | { type: 'ingredient'; slotId: MealSlotId; itemId: string }
  | null;
```

This is the TypeScript showcase centrepiece — enforces that all drop cases are handled.

### Component tree (MealSlot.tsx)

```
MealSlot
├── EdgeBars          — shared; renders 4 absolute bars. Used by slot AND ingredient cells.
├── SlotGlyphGrid     — renders glyph collage (1 / 2×2 / 3×3 layout)
├── IngredientCell    — droppable ingredient cell; has EdgeBars + remove button
└── DeltaChip         — +/- preview chip shown during drag hover
```

### Key prop flows for a new context

```
App.tsx
├── dayTotals            → MealSlot → EdgeBars (slot-level bar scale)
├── expandedSlotId       → MealSlot (expanded prop) — mutual exclusion
├── onToggle             → MealSlot → toggles expandedSlotId in App
├── onRemove             → MealSlot → IngredientCell → REMOVE_FROM_SLOT dispatch
└── onClear              → MealSlot → CLEAR_SLOT dispatch

MealSlot (internal)
└── slotTotals (computed from items + knownFoods)
    └── → IngredientCell → EdgeBars (ingredient-level bar scale)
```

### DEFAULT_DRAG_GRAMS

When dragging a food card, the delta preview uses `DEFAULT_DRAG_GRAMS = 150` as the
assumed serving size. The actual grams are set after drop via the ingredient popup
(future: add a gram adjustment UI to the ingredient cells).

---

## Departure from Yuka — no good/bad scoring

### The problem with food scoring

A consistent criticism of Yuka and similar apps is that labelling foods as "bad" or
giving them a low score creates an unhealthy relationship with food. Users report:

- Feeling guilty or anxious about foods they enjoy
- Avoiding foods that score poorly but are nutritionally fine in context
- The score feeling arbitrary or culturally biased (e.g. French cheese scoring poorly)
- It reduces complex nutritional decisions to a single number, which oversimplifies

A registered dietitian would never call a food "bad." They would say: *"here's how this
compares to your other options, given what you're trying to achieve today."*

### The alternative — contextual stat comparison

When a user selects a food, instead of showing a score verdict, show a **stat comparison
panel** — similar foods side by side with their key numbers, letting the user make an
informed choice without any judgement language.

**Example interaction:**
```
User searches "greek yoghurt" → taps Chobani Plain

Panel shows:
┌──────────────────┬──────────┬──────────┬──────────┐
│                  │ Chobani  │ Farmers  │ Jalna    │
│                  │ Plain    │ Union    │ Full Fat │
├──────────────────┼──────────┼──────────┼──────────┤
│ Calories/100g    │   59     │   94     │  105     │
│ Protein/100g     │   9.5g   │   4.8g   │   5.2g   │
│ Fat/100g         │   0.4g   │   4.5g   │   7.1g   │
│ Carbs/100g       │   3.8g   │  12.1g   │   7.3g   │
│ Protein:Cal      │  ████░░  │  ███░░░  │  ██░░░░  │  ← visual bar
└──────────────────┴──────────┴──────────┴──────────┘
         [Add this →]         [Add this →]  [Add this →]
```

No scores. No colours indicating good or bad. Just the numbers, side by side.
The user sees immediately which option has more protein, fewer calories — and decides
based on their own goals.

### Why this is better

- **Non-judgmental** — no food is labelled bad. Context determines the right choice.
- **Goal-aware** — a user optimising for protein picks differently than one watching
  calories. The comparison serves both without prescribing an answer.
- **More informative** — you understand *why* one option might suit you better,
  not just that it "scored 72."
- **More engaging** — comparison is inherently interesting. Discovery of a better
  alternative is satisfying without the guilt trip.
- **Defensible in an interview** — shows product maturity and user research awareness.

### How similar foods are sourced

When a food is selected, the comparison panel populates by:

1. Taking the selected food's `categories_tags` from Open Food Facts
2. Running a secondary search for foods in the same category
3. Returning the top 2–3 results by protein density or relevance
4. Displaying them alongside the selected food

This is a second OFF API call, triggered only when a food is opened — not on every
search. It should be debounced and cached.

### TypeScript / React showcase value

This feature requires more sophisticated architecture than a simple score badge:

- `FoodComparison` type — typed structure holding the selected food + alternatives
- `StatDelta` type — the numerical difference between two foods on a given metric
- `useFoodComparison(food: Food)` custom hook — fetches and returns similar foods,
  manages loading state, caches results
- `ComparisonPanel` compound component — renders the side-by-side table
- Type guards to handle foods with missing nutrition data gracefully
- `useMemo` to derive the protein:calorie ratio and sort order

All of this is clean, testable, strongly-typed logic — exactly what an interviewer
wants to see.

---

## Open questions

- **Flow G (yesterday's plan)** conflicts with the "no history" principle. Is that principle worth keeping, or was it a simplifying assumption for the MVP?
- **Flow F (quick-add)** — regex parser or Claude call? Regex is instant and free; Claude handles edge cases better.
- **Mobile layout** — Flows A, C, and D are predominantly mobile. The current layout is desktop-first. These flows probably need a dedicated mobile view before they feel right.
