# v--v Vitals — Claude Code Guide

> Paste this file into Claude Code (VS Code) at the start of your session.
> Work through each phase in order. Each phase has a clear goal and should take roughly 45–60 minutes.
> Total estimated time: 4 hours.

---

## Project Overview

v--v Vitals is a personal nutrition & meal tracking app — your self-built MyFitnessPal alternative. Built under the v--v personal brand with emphasis on clean TypeScript, real API design, and accessible UI.

Features:
- A reusable **food library** (define foods once, log repeatedly)
- A **daily food diary** (log meals by date)
- A **React + TypeScript frontend** with shadcn/ui components
- A **Node.js + Express + TypeScript backend**
- A **SQLite database** via `better-sqlite3`
- **React Query** for data fetching and caching
- **Zod** for runtime API validation

---

## Prerequisites Checklist

Before starting, make sure you have the following installed:

### Required Software
- [ ] **Node.js** (v18 or higher) — https://nodejs.org — download the LTS version
- [ ] **VS Code** — https://code.visualstudio.com
- [ ] **Git** — https://git-scm.com

### Required VS Code Extensions
Install these from the Extensions panel (Ctrl+Shift+X):
- [ ] **ESLint** (`dbaeumer.vscode-eslint`)
- [ ] **Prettier** (`esbenp.prettier-vscode`)
- [ ] **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- [ ] **Thunder Client** (`rangav.vscode-thunder-client`) — for testing your API

### Verify your installs (run in terminal):
```bash
node --version   # should print v18.x.x or higher
npm --version    # should print 9.x.x or higher
git --version    # should print git version x.x.x
```

---

## Security considerations before you begin

This project should start with secure defaults because it handles personal diary and nutrition data.

- Keep secrets out of source control. Add `.env`, `server/data/`, and any `.db` files to `.gitignore` before committing.
- Restrict CORS to the exact frontend origin in development (`http://localhost:5173`) and to the deployed frontend domain in production.
- Avoid hard-coded API URLs or credentials in the frontend. Use environment variables and runtime config where possible.
- Validate all incoming request data in the backend. Use Zod or explicit validation for query params, body payloads, dates, numeric fields, and enums.
- Use parameterized SQL statements rather than string concatenation to prevent SQL injection.
- Don’t return raw stack traces to clients; use a centralized error handler with sanitized messages.
- Keep the app open during early development, but add at least a simple authentication or access control layer before you deploy or share the API publicly.
- Avoid rendering untrusted HTML in the UI. Display diary notes and food names as plain text only.

---

## Phase 1 — Project Scaffolding (45 min)

**Goal:** Get a running frontend and backend that can talk to each other.

### Step 1.1 — Create the project root

```bash
mkdir vv-vitals
cd vv-vitals
git init
```

### Step 1.2 — Create the frontend (Vite + React + TypeScript)

```bash
npm create vite@latest client -- --template react-ts
cd client
npm install
```

### Step 1.3 — Install frontend dependencies

```bash
# React Query — async data fetching and caching
npm install @tanstack/react-query

# Zod — runtime validation of API responses
npm install zod

# Axios — HTTP client (cleaner than raw fetch)
npm install axios

# shadcn/ui dependencies
npm install tailwindcss @tailwindcss/vite
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

### Step 1.4 — Initialise Tailwind

In `client/vite.config.ts`, add the Tailwind plugin:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Replace the contents of `client/src/index.css` with:
```css
@import "tailwindcss";
```

### Step 1.5 — Set up shadcn/ui

```bash
# From inside the client/ folder
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base colour: **Slate**
- CSS variables: **Yes**

Then add your first components:
```bash
npx shadcn@latest add button card input label tabs badge
```

### Step 1.6 — Create the backend

```bash
# From the project root (vv-vitals/)
mkdir server
cd server
npm init -y
```

Install backend dependencies:
```bash
npm install express better-sqlite3 cors dotenv
npm install -D typescript ts-node-dev @types/express @types/better-sqlite3 @types/cors @types/node
```

Create `server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Add to `server/package.json` scripts:
```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### Step 1.7 — Backend folder structure

Create this structure inside `server/src/`:
```
server/src/
  index.ts          ← Express app entry point
  db.ts             ← SQLite connection and setup
  routes/
    foods.ts        ← /api/foods endpoints
    diary.ts        ← /api/diary endpoints
  types/
    index.ts        ← Shared TypeScript types
```

### Step 1.8 — Minimal working backend (`server/src/index.ts`)

Ask Claude Code to generate this file. Tell it:
> "Create a minimal Express server in TypeScript that listens on port 3001, enables CORS for localhost:5173, and has a health check route GET /api/health that returns { status: 'ok' }"

### Step 1.9 — Verify Phase 1

Run both servers side by side (two terminal tabs):

Terminal 1 (backend):
```bash
cd server && npm run dev
```

Terminal 2 (frontend):
```bash
cd client && npm run dev
```

Open http://localhost:5173 — you should see the Vite + React default page.
Open http://localhost:3001/api/health — you should see `{ "status": "ok" }`.

**✅ Phase 1 complete when both servers run without errors.**

---

## Phase 2 — Database Schema & Types (45 min)

**Goal:** Define your data model in SQLite and mirror it in TypeScript.

### The data model

```
foods                    ← your reusable food library
  id, name, calories_per_100g, protein_per_100g,
  carbs_per_100g, fat_per_100g, created_at

diary_entries            ← one row per day
  id, date (YYYY-MM-DD), notes, created_at

diary_meals              ← meals within a diary entry (Breakfast, Lunch, etc.)
  id, diary_entry_id (FK), meal_name, created_at

diary_meal_foods         ← foods logged within a meal
  id, diary_meal_id (FK), food_id (FK),
  quantity_grams, created_at
```

### Step 2.1 — Create the database (`server/src/db.ts`)

Ask Claude Code:
> "Create a db.ts file using better-sqlite3 that:
> 1. Opens/creates a SQLite database at ./data/tracker.db
> 2. Enables WAL mode for performance
> 3. Creates the four tables above with proper foreign keys and ON DELETE CASCADE
> 4. Exports the db instance"

### Step 2.2 — Create shared TypeScript types (`server/src/types/index.ts`)

Ask Claude Code:
> "Create TypeScript interfaces for Food, DiaryEntry, DiaryMeal, and DiaryMealFood matching the database schema. Also create corresponding 'Create' types (omitting id and created_at) for use in POST request bodies."

### Step 2.3 — Create Zod schemas on the frontend

Inside `client/src/lib/schemas.ts`, ask Claude Code:
> "Create Zod schemas that mirror the Food and DiaryEntry TypeScript types. Export inferred TypeScript types from them using z.infer<>. Explain what Zod infer does."

**✅ Phase 2 complete when the database file is created on first server start and types are defined.**

---

## Phase 3 — Backend API Routes (45 min)

**Goal:** Build all the API endpoints your frontend will need.

### Foods routes (`server/src/routes/foods.ts`)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/foods | Get all foods in the library |
| GET | /api/foods/:id | Get a single food |
| POST | /api/foods | Add a new food |
| PUT | /api/foods/:id | Update a food |
| DELETE | /api/foods/:id | Delete a food |

### Diary routes (`server/src/routes/diary.ts`)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/diary | Get all diary entries (date + summary) |
| GET | /api/diary/:date | Get full diary for a specific date (with meals and foods) |
| POST | /api/diary/:date/meals | Add a meal to a date |
| POST | /api/diary/:date/meals/:mealId/foods | Log a food in a meal |
| DELETE | /api/diary/meals/:mealId | Delete a meal |
| DELETE | /api/diary/meal-foods/:id | Remove a food from a meal |

### Step 3.1 — Ask Claude Code to build the foods routes

> "Build the Express foods router in TypeScript using the db instance. Each route should use proper HTTP status codes. The POST route should validate that required fields exist before inserting. Return JSON."

### Step 3.2 — Ask Claude Code to build the diary routes

> "Build the Express diary router. The GET /api/diary/:date route should return the full nested structure: diary entry → meals → foods with nutrition info joined from the foods table."

### Step 3.3 — Test with Thunder Client

Use the Thunder Client VS Code extension to manually test each route before moving to the frontend. This saves debugging time later.

**✅ Phase 3 complete when all routes return correct data in Thunder Client.**

---

## Phase 4 — Frontend (60 min)

**Goal:** Build the two main views — Food Library and Daily Diary.

### Step 4.1 — Set up React Query (`client/src/main.tsx`)

Ask Claude Code:
> "Wrap the App component in a QueryClientProvider from @tanstack/react-query. Explain what QueryClientProvider does and why it needs to wrap the whole app."

### Step 4.2 — Create an API client (`client/src/lib/api.ts`)

Ask Claude Code:
> "Create an axios instance pointed at http://localhost:3001. Export typed functions for each API endpoint: getFoods, createFood, deleteFood, getDiaryEntry, addMealToDate, logFoodInMeal. Each function should have TypeScript return types."

### Step 4.3 — Create React Query hooks (`client/src/hooks/`)

Ask Claude Code:
> "Create custom hooks useFoods() and useDiaryEntry(date: string) using useQuery from React Query. Explain the difference between useQuery and useEffect for data fetching, and what the queryKey does."

Also create mutation hooks:
> "Create useCreateFood() and useLogFood() using useMutation from React Query. After each mutation succeeds, invalidate the relevant query so the UI refreshes automatically."

### Step 4.4 — Food Library view (`client/src/pages/FoodLibrary.tsx`)

Ask Claude Code:
> "Build a Food Library page using shadcn/ui components. It should:
> - List all foods in cards showing name, calories, protein, carbs, fat per 100g
> - Have an 'Add Food' form with inputs for all nutrition fields
> - Show a loading state while fetching
> - Show an error state if the fetch fails
> Use the useFoods hook and useCreateFood mutation."

### Step 4.5 — Diary view (`client/src/pages/Diary.tsx`)

Ask Claude Code:
> "Build a Diary page that:
> - Defaults to today's date, with prev/next day navigation
> - Shows meals grouped by name (Breakfast, Lunch, Dinner, Snacks)
> - Shows total calories and macros for the day
> - Has an 'Add Meal' button and a way to log a food from the library into a meal
> Use shadcn/ui Tabs for meal grouping and the useDiaryEntry hook."

### Step 4.6 — Navigation (`client/src/App.tsx`)

Ask Claude Code:
> "Set up React Router with two routes: / for the Diary and /foods for the Food Library. Add a simple top nav bar using shadcn/ui components."

Install React Router first:
```bash
cd client && npm install react-router-dom
```

**✅ Phase 4 complete when you can add foods to the library and log them in a diary entry.**

---

## Phase 5 — Polish & README (15 min)

**Goal:** Make the project presentable for a portfolio.

### Step 5.1 — Create a `.gitignore` at the project root

```
node_modules/
dist/
.env
server/data/
*.db
```

### Step 5.2 — Create `README.md` at the project root

Ask Claude Code:
> "Write a professional README for this project including: project description, tech stack, setup instructions, and a brief explanation of key architecture decisions (why React Query, why Zod, why SQLite)."

### Step 5.3 — First Git commit

```bash
git add .
git commit -m "feat: initial v--v Vitals implementation"
```

### Step 5.4 — Push to GitHub

1. Go to https://github.com/new
2. Create a new **public** repo called `vv-vitals`
3. Follow the "push existing repo" instructions GitHub shows you

**✅ Phase 5 complete when your repo is live on GitHub.**

---

## Talking Points for Interviews

When you discuss this project at JB Hi-Fi, you can speak to:

- **TypeScript generics** — "I used generics on my API response types so the fetch functions were reusable but still type-safe"
- **React Query over useEffect** — "React Query handles caching, background refetching, and loading states — writing that manually in useEffect gets messy fast"
- **Zod for validation** — "The API could return unexpected shapes, so I validate responses at runtime with Zod rather than trusting TypeScript types alone"
- **Accessibility** — "I used shadcn/ui which is built on Radix UI primitives, so keyboard navigation and ARIA attributes are handled correctly by default"
- **Separation of concerns** — "The frontend never touches the database directly — it only talks to the Express API, which is the same pattern you'd use with any real backend"

---

## Troubleshooting

**CORS errors in the browser:**
Make sure your Express server has `cors()` middleware applied before your routes, and that it allows `http://localhost:5173`.

**`better-sqlite3` install fails:**
Run `npm install --build-from-source better-sqlite3` — it needs to compile native bindings.

**shadcn components not styled:**
Make sure `@import "tailwindcss"` is at the top of `index.css` and that the Tailwind Vite plugin is in `vite.config.ts`.

**TypeScript errors on the backend:**
Check that `"strict": true` is in your `tsconfig.json` — this is intentional. Fix the errors rather than disabling strict mode; it's teaching you good habits.

---

## Deploying Later (Optional)

Once the app is working locally, here's how to make it publicly accessible:

1. **Frontend → Vercel** (free): Connect your GitHub repo at vercel.com, set the root directory to `client/`, done.
2. **Backend → Railway** (free tier): Connect your GitHub repo at railway.app, set the root to `server/`, add a start command of `npm start`.
3. **Update the API base URL** in `client/src/lib/api.ts` to point at your Railway URL instead of `localhost:3001`.

Note: SQLite on Railway works fine for a portfolio project. For a production app you'd migrate to a hosted Postgres.
