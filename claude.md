# v--v Vitals — Claude Code Guide

> Paste this entire file into Claude Code (VS Code) at the start of your session.
> Work through each phase in order. Each phase has a clear goal.
> Total estimated time: 4–5 hours.

---

## What we are building

**v--v Vitals** is a day-planning nutrition app — the opposite of conventional calorie trackers.
Instead of logging meals *after* you eat, you build your full day of eating *upfront*, see your
running macro totals in real time, and adjust until the day looks right.

### Three ways to add food

| Method | How it works |
|---|---|
| **Search** | Type a food name → query Open Food Facts API → pick from results |
| **Describe** | Type "Big Mac meal with Coke" → Claude AI estimates macros |
| **Screenshot** | Paste or upload a menu photo → Claude AI reads it and extracts items |

All three output the same thing: a food item with calories, protein, carbs, fat + a gram quantity.

### Meal grouping

Foods can be added as standalone items or grouped into named meals (e.g. "Yoghurt bowl").
When you search for berries and you already have yoghurt in your plan, the modal shows an
**"Add to Chobani yoghurt"** button as a contextual third action — it appears automatically
because the app detects an existing group.

### The modal interaction (key UI pattern)

Every food opens a detail modal:
- Shows macros per 100g
- Has a **slider** for quantity in grams — macros update live as you drag
- Shows **day total after adding** so you can see the impact before committing
- Three action buttons: Save to favourites / Add to plan / Add to [existing meal group]

### Favourites library

Foods added from any source (search, AI text, AI image) can be saved to a personal favourites
library stored in SQLite. One click to re-add a favourite to today's plan.

### No targets, no history

The app shows running totals only — no daily calorie targets, no previous days.
Today's plan resets each session. Clean and focused.

---

## Brand

This project lives under the **v--v personal brand**.

- Colours: `#0A0612` void bg, `#8B2635` burgundy accent, `#E5DBCB` parchment text, `#5C1A6B` nebula purple
- Fonts: DM Serif Display (headings) + DM Mono (body/UI)
- Logo mark: `v--v` — the `--` rendered in burgundy, the `v` characters in parchment
- Product name displayed as: **v--v Vitals**

When Claude Code generates UI, reference this brand. The app should feel dark, precise, and
purposeful — not a generic health app.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + TypeScript | Role requirement, industry standard |
| Components | shadcn/ui + Tailwind | Accessibility (Radix primitives), polish |
| Data fetching | React Query | Caching, loading states, async management |
| Validation | Zod | Runtime safety on API + AI responses |
| AI analysis | Anthropic Claude API (claude-sonnet-4-20250514) | Text + vision macro extraction |
| Food database | Open Food Facts API | Free, no API key, 3M+ products |
| Backend | Node.js + Express + TypeScript | Favourites persistence |
| Database | SQLite via better-sqlite3 | Zero config, local, fast |
| Routing | React Router | Multi-view navigation |

---

## Folder structure

```
vv-vitals/
  client/                  ← React + TypeScript frontend
    src/
      components/
        FoodModal.tsx       ← The detail modal with slider
        FoodSearch.tsx      ← Search bar + results list
        DayPlan.tsx         ← Today's plan with meal groups
        MacroTotals.tsx     ← Running totals bar
        FavouritesList.tsx  ← Saved favourites
        AIInput.tsx         ← Text description + image upload
      hooks/
        useFoods.ts         ← React Query hook for food search
        useFavourites.ts    ← React Query hook for favourites CRUD
        useAIAnalysis.ts    ← Hook for Claude API calls
        useDayPlan.ts       ← useReducer hook for today's plan state
      lib/
        api.ts              ← Axios instance + typed API functions
        schemas.ts          ← Zod schemas for all data shapes
        macros.ts           ← Pure macro calculation functions
      types/
        index.ts            ← Shared TypeScript interfaces
      pages/
        PlanPage.tsx        ← Main page (search + plan side by side)
        FavouritesPage.tsx  ← Saved foods library
    index.css
    main.tsx
    App.tsx
  server/
    src/
      index.ts              ← Express entry point
      db.ts                 ← SQLite setup
      routes/
        favourites.ts       ← /api/favourites CRUD
        analyse.ts          ← /api/analyse (proxies Claude API)
      types/
        index.ts
```

---

## Data model

### TypeScript types (client/src/types/index.ts)

```typescript
// A food item from any source — search, AI text, AI image, or favourites
interface Food {
  id: string
  name: string
  brand?: string
  source: 'search' | 'ai-text' | 'ai-image' | 'favourite'
  per100g: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

// A food added to today's plan, with a quantity
interface PlanItem {
  id: string          // unique instance id (uuid)
  food: Food
  grams: number
  groupId?: string    // if part of a meal group
}

// A named meal group (e.g. "Yoghurt bowl")
interface MealGroup {
  id: string
  name: string        // user-defined label
}

// Today's full plan — managed by useReducer
interface DayPlan {
  items: PlanItem[]
  groups: MealGroup[]
}

// Saved favourite in SQLite
interface Favourite {
  id: number
  foodData: Food      // stored as JSON
  createdAt: string
}
```

### SQLite schema (server/src/db.ts)

```sql
CREATE TABLE IF NOT EXISTS favourites (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  food_data  TEXT NOT NULL,   -- JSON stringified Food object
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## Phase 1 — Scaffolding (45 min)

**Goal:** Two servers running, talking to each other.

### Step 1.1 — Create the project root

```bash
mkdir vv-vitals
cd vv-vitals
git init
```

### Step 1.2 — Frontend (Vite + React + TypeScript)

```bash
npm create vite@latest client -- --template react-ts
cd client
npm install
```

### Step 1.3 — Frontend dependencies

```bash
npm install @tanstack/react-query
npm install zod
npm install axios
npm install react-router-dom
npm install tailwindcss @tailwindcss/vite
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

### Step 1.4 — Tailwind setup

`client/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`client/src/index.css` — replace entire contents with:
```css
@import "tailwindcss";
```

### Step 1.5 — shadcn/ui

```bash
# from inside client/
npx shadcn@latest init
```

Prompts: Style → **Default**, Base colour → **Slate**, CSS variables → **Yes**

```bash
npx shadcn@latest add button card input label tabs badge dialog slider
```

> Note: `dialog` is the shadcn component that powers the food detail modal.
> `slider` is the quantity input inside it.
> These are Radix UI primitives under the hood — keyboard nav and accessibility come for free.

### Step 1.6 — Backend

```bash
# from vv-vitals/ root
mkdir server && cd server
npm init -y
npm install express better-sqlite3 cors dotenv
npm install -D typescript ts-node-dev @types/express @types/better-sqlite3 @types/cors @types/node
```

`server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

`server/package.json` scripts:
```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### Step 1.7 — Minimal backend to verify

Ask Claude Code:
> "Create server/src/index.ts — a minimal Express + TypeScript server on port 3001,
> CORS allowed for localhost:5173, with GET /api/health returning { status: 'ok' }"

### Step 1.8 — Verify

Terminal 1: `cd server && npm run dev`
Terminal 2: `cd client && npm run dev`

- http://localhost:5173 → Vite default page
- http://localhost:3001/api/health → `{ "status": "ok" }`

**✅ Phase 1 done**

---

## Phase 2 — Types, Schemas & Database (30 min)

**Goal:** Define the data model once, use it everywhere.

### Step 2.1 — TypeScript types

Ask Claude Code:
> "Create client/src/types/index.ts with the Food, PlanItem, MealGroup, DayPlan,
> and Favourite interfaces exactly as defined in the claude.md data model section."

### Step 2.2 — Zod schemas

Ask Claude Code:
> "Create client/src/lib/schemas.ts. Write Zod schemas for:
> - FoodSchema (mirrors the Food interface)
> - PlanItemSchema
> - OpenFoodFactsResponseSchema (for validating raw API responses from Open Food Facts)
> Export inferred TypeScript types using z.infer<>. Explain what z.infer does and
> why we validate at runtime even though we have TypeScript types."

### Step 2.3 — Macro calculation utility

Ask Claude Code:
> "Create client/src/lib/macros.ts with a pure function:
> calculateMacros(food: Food, grams: number): { calories: number, protein: number, carbs: number, fat: number }
> The formula is (per100g value × grams) / 100. Round all results to 1 decimal place.
> Also write a sumMacros() function that takes an array of PlanItems and returns the total.
> Explain why we separate pure calculation logic from React components."

### Step 2.4 — SQLite database

Ask Claude Code:
> "Create server/src/db.ts using better-sqlite3 that:
> 1. Opens/creates a database at ./data/vitals.db
> 2. Enables WAL mode for performance
> 3. Creates the favourites table from the schema in claude.md
> 4. Exports the db instance as default"

**✅ Phase 2 done**

---

## Phase 3 — Backend API (30 min)

**Goal:** Favourites CRUD + AI analysis proxy endpoint.

### Favourites routes (server/src/routes/favourites.ts)

| Method | Path | Description |
|---|---|---|
| GET | /api/favourites | Get all saved favourites |
| POST | /api/favourites | Save a food as favourite |
| DELETE | /api/favourites/:id | Remove a favourite |

Ask Claude Code:
> "Build server/src/routes/favourites.ts — an Express router with the three routes above.
> The POST body is a Food object — store it as JSON in the food_data column.
> The GET response should parse food_data back from JSON before returning.
> Use proper HTTP status codes (200, 201, 404, 500)."

### AI analysis proxy (server/src/routes/analyse.ts)

This route receives either a text description or a base64 image from the frontend,
calls the Anthropic API, and returns structured macro data.

Ask Claude Code:
> "Build server/src/routes/analyse.ts with POST /api/analyse.
> Request body: { type: 'text' | 'image', content: string }
> 
> For type 'text': call the Anthropic API with the claude-sonnet-4-20250514 model,
> send a system prompt that says the model should return ONLY valid JSON in this shape:
> { name: string, estimatedGrams: number, per100g: { calories, protein, carbs, fat } }
> No markdown, no explanation, just JSON.
>
> For type 'image': send the base64 image to the Claude API using the image content block format,
> ask it to identify all food items visible and return an array of the same JSON shape.
>
> Parse and return the structured response. If parsing fails, return a 422 with an error message.
> Explain why we proxy through our backend rather than calling Anthropic directly from the browser."

> **Important note for Claude Code:** The Anthropic API key should be stored in server/.env
> as ANTHROPIC_API_KEY. Never expose it to the frontend.

### Wire up routes

Ask Claude Code:
> "Update server/src/index.ts to mount:
> - favourites router at /api/favourites
> - analyse router at /api/analyse"

**✅ Phase 3 done**

---

## Phase 4 — Frontend Core (60 min)

**Goal:** React Query wired up, API client built, day plan state working.

### Step 4.1 — QueryClientProvider

Ask Claude Code:
> "Update client/src/main.tsx to wrap App in a QueryClientProvider from @tanstack/react-query.
> Enable React Query Devtools in development mode.
> Explain what QueryClientProvider does and why it wraps the entire app."

### Step 4.2 — API client

Ask Claude Code:
> "Create client/src/lib/api.ts with an axios instance pointing to http://localhost:3001.
> Export these typed functions:
> - searchFoods(query: string): Promise<Food[]>  ← calls Open Food Facts API (not our backend)
> - getFavourites(): Promise<Favourite[]>
> - saveFavourite(food: Food): Promise<Favourite>
> - deleteFavourite(id: number): Promise<void>
> - analyseText(description: string): Promise<Food>
> - analyseImage(base64: string): Promise<Food[]>
>
> For searchFoods, the Open Food Facts URL is:
> https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&json=true&page_size=10
> Parse the response through OpenFoodFactsResponseSchema using Zod before returning.
> Explain the difference between calling Open Food Facts directly vs proxying through our backend."

### Step 4.3 — Day plan state with useReducer

This is the most important state in the app. Ask Claude Code:
> "Create client/src/hooks/useDayPlan.ts using useReducer.
> The state shape is DayPlan: { items: PlanItem[], groups: MealGroup[] }
> 
> Actions to handle:
> - ADD_ITEM: { food: Food, grams: number, groupId?: string }
> - REMOVE_ITEM: { id: string }
> - UPDATE_GRAMS: { id: string, grams: number }
> - ADD_GROUP: { name: string }
> - REMOVE_GROUP: { id: string }
> - RESET: clear everything
>
> Export the state and dispatch. Also export a derived selector:
> getDayTotals(items: PlanItem[]) that uses sumMacros() from macros.ts.
>
> Explain why useReducer is better than multiple useState calls here, and what
> a 'discriminated union' type is — use the action type as an example."

### Step 4.4 — React Query hooks

Ask Claude Code:
> "Create client/src/hooks/useFoods.ts — a useQuery hook that calls searchFoods(query).
> Only run the query when query.length >= 2. Explain what the queryKey array does
> and how React Query decides when to refetch.
>
> Create client/src/hooks/useFavourites.ts with:
> - useQuery for getFavourites()
> - useMutation for saveFavourite() — on success, invalidate the favourites query
> - useMutation for deleteFavourite() — on success, invalidate the favourites query
> Explain what query invalidation does and why it's needed."

### Step 4.5 — AI analysis hook

Ask Claude Code:
> "Create client/src/hooks/useAIAnalysis.ts with two useMutation hooks:
> - useAnalyseText(): calls analyseText(), returns a Food object
> - useAnalyseImage(): calls analyseImage(), returns Food[]
> Both should show a loading state while the AI is processing.
> Explain what useMutation is for (as opposed to useQuery) and when to use each."

**✅ Phase 4 done**

---

## Phase 5 — UI Components (60 min)

**Goal:** Build the visual layer. Reference the v--v brand throughout.

### Step 5.1 — MacroTotals bar

Ask Claude Code:
> "Create client/src/components/MacroTotals.tsx.
> Props: totals: { calories: number, protein: number, carbs: number, fat: number }
> Display as a fixed bottom bar or a sticky top section — four stat cards side by side.
> Style it using the v--v brand: dark background (#0A0612), parchment text (#E5DBCB),
> burgundy accents (#8B2635), DM Mono font.
> Use shadcn/ui Card and Badge components."

### Step 5.2 — FoodModal (the key component)

This is the most technically interesting component in the app. Ask Claude Code:
> "Create client/src/components/FoodModal.tsx using shadcn/ui Dialog and Slider.
>
> Props:
> - food: Food | null        (null = modal closed)
> - existingGroups: MealGroup[]
> - currentDayCalories: number
> - onAddToPlan: (food: Food, grams: number, groupId?: string) => void
> - onSaveFavourite: (food: Food) => void
> - onClose: () => void
>
> Behaviour:
> - Slider controls gram quantity (25g to 500g, step 25g)
> - Macros update live as slider moves — use calculateMacros() from macros.ts
> - 'Day total after adding' updates live too
> - Show an 'Add to [group name]' button for EACH existing meal group
>   (e.g. 'Add to Chobani yoghurt') — these appear automatically from existingGroups prop
> - Two primary buttons: 'Save to favourites' and 'Add to plan'
>
> Style it to match the v--v brand.
>
> Explain: what is a controlled component? How does the slider become one?
> What is prop drilling and is it happening here?"

### Step 5.3 — FoodSearch

Ask Claude Code:
> "Create client/src/components/FoodSearch.tsx.
> - Controlled text input, debounced 400ms before triggering useFoods query
> - Explain what debouncing is and why it matters for API calls
> - Show loading spinner while fetching
> - Render search results as clickable cards showing name, brand, calories per 100g
> - Clicking a result opens the FoodModal (lift the selected food up via callback prop)
> - Show a message if no results found"

### Step 5.4 — AIInput

Ask Claude Code:
> "Create client/src/components/AIInput.tsx with two tabs using shadcn/ui Tabs:
>
> Tab 1 — Describe it:
> - Textarea for typing a meal description (e.g. 'large Big Mac meal with Coke')
> - Submit button that calls useAnalyseText()
> - Show a loading state with text like 'Analysing...' while waiting
> - On success, open FoodModal with the returned Food
>
> Tab 2 — Screenshot it:
> - File input accepting image/* or a paste event listener for clipboard images
> - On image selected/pasted, convert to base64 and call useAnalyseImage()
> - If multiple foods returned, show them as a list to add individually
> - Show a preview of the pasted image
>
> Explain: what is base64 encoding and why do we use it to send images?"

### Step 5.5 — DayPlan

Ask Claude Code:
> "Create client/src/components/DayPlan.tsx.
> - Renders today's plan grouped by MealGroup, then ungrouped items below
> - Each group has a header label and its items listed underneath
> - Each item shows: food name, grams, and calculated calories
> - Remove button on each item (calls REMOVE_ITEM dispatch)
> - 'Add new group' button that prompts for a group name
> - Empty state message when no items added yet"

### Step 5.6 — FavouritesList

Ask Claude Code:
> "Create client/src/components/FavouritesList.tsx.
> - Uses useFavourites() hook to fetch saved foods
> - Each favourite shows as a card with name, calories per 100g
> - Clicking it opens FoodModal to add to today's plan
> - Delete button to remove from favourites
> - Empty state if no favourites saved yet"

### Step 5.7 — Pages and routing

Ask Claude Code:
> "Create client/src/pages/PlanPage.tsx — the main page.
> Layout: two-column on desktop, stacked on mobile.
> Left column: FoodSearch + AIInput (the 'find food' side)
> Right column: DayPlan + MacroTotals (the 'today's plan' side)
> FoodModal sits here, controlled by a selectedFood state in this component.
> Wire useDayPlan dispatch into all the child component callbacks.
>
> Create client/src/pages/FavouritesPage.tsx — just renders FavouritesList with a heading.
>
> Update client/src/App.tsx with React Router:
> / → PlanPage
> /favourites → FavouritesPage
> Add a minimal top nav with the v--v Vitals wordmark and a link to Favourites."

**✅ Phase 5 done**

---

## Phase 6 — Polish & Deploy (30 min)

**Goal:** Presentable for portfolio, live on the internet.

### Step 6.1 — .gitignore (project root)

```
node_modules/
dist/
.env
server/data/
*.db
```

### Step 6.2 — Environment variables

`server/.env`:
```
ANTHROPIC_API_KEY=your_key_here
PORT=3001
```

Get a free Anthropic API key at: https://console.anthropic.com

### Step 6.3 — README

Ask Claude Code:
> "Write a professional README.md for v--v Vitals at the project root.
> Include: what it is and the 'plan before you eat' philosophy, tech stack,
> local setup instructions, and a section on key architecture decisions
> (why useReducer, why Zod, why proxy the AI through backend, why shadcn for accessibility)."

### Step 6.4 — Git and GitHub

```bash
git add .
git commit -m "feat: initial v--v Vitals implementation"
```

1. Go to https://github.com/new
2. Create a public repo called `vv-vitals`
3. Follow GitHub's "push existing repo" instructions

### Step 6.5 — Deploy

**Frontend → Vercel (free)**
1. Go to vercel.com → Import Git repository
2. Set root directory to `client/`
3. Deploy — your frontend is live at `vv-vitals.vercel.app`

**Backend → Railway (free tier)**
1. Go to railway.app → New project → Deploy from GitHub
2. Set root to `server/`
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Railway gives you a public URL (e.g. `vv-vitals-backend.up.railway.app`)

**Update the API base URL**
In `client/src/lib/api.ts`, change the axios baseURL from `localhost:3001`
to your Railway backend URL before deploying the frontend.

**✅ Phase 6 done — v--v Vitals is live**

---

## React + TypeScript concepts demonstrated

This is what you can speak to in a JB Hi-Fi interview:

**`useReducer` for complex state**
> "The day plan has items, groups, and derived totals all changing together.
> useReducer with discriminated union action types keeps that predictable —
> every state change goes through one place."

**Controlled components + derived state**
> "The slider is a controlled input — React owns the value, not the DOM.
> The macros aren't stored separately, they're calculated from grams on every render.
> That's the React pattern: store the minimum, derive everything else."

**React Query over useEffect**
> "React Query handles caching, background refetching, and loading states.
> Doing that manually in useEffect produces bugs — stale data, race conditions,
> missing loading states."

**Zod for runtime validation**
> "TypeScript types disappear at runtime. The Open Food Facts API and the Claude AI
> response can return unexpected shapes. Zod validates them at the boundary so
> TypeScript errors stay meaningful rather than silently passing bad data through."

**Accessibility via shadcn/ui**
> "The food modal uses shadcn/ui Dialog, which is built on Radix UI. Focus trapping,
> Escape key to close, and ARIA attributes come for free. The JD mentioned accessibility
> awareness — this is how I approached it practically."

**AI proxied through backend**
> "The Anthropic API key never touches the browser. The frontend sends a description
> or image to our own Express endpoint, which calls Anthropic server-side and returns
> structured JSON. This is the correct security pattern for any third-party API key."

**TypeScript generics on API responses**
> "The searchFoods function has a generic return type. The Zod schema infers its
> TypeScript type — so the schema and the type are the same source of truth."

---

## Troubleshooting

**CORS errors:** Confirm `cors()` middleware in Express allows `http://localhost:5173`.

**`better-sqlite3` install fails:** Run `npm install --build-from-source better-sqlite3`.

**Open Food Facts returns empty results:** Try simpler search terms. The API is fuzzy —
"greek yoghurt" works better than "Chobani Greek Yoghurt 500g".

**Claude API returns non-JSON:** The system prompt must say "return ONLY valid JSON, no
markdown, no explanation". If it still wraps in backticks, strip them in the route handler
before JSON.parse().

**shadcn Slider not styled:** Ensure `@import "tailwindcss"` is the first line of index.css
and the Tailwind Vite plugin is in vite.config.ts.

**TypeScript strict mode errors:** Fix them. Do not add `// @ts-ignore`. Strict mode errors
are teaching you something — ask Claude Code to explain each one before fixing it.
