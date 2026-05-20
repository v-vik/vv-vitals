# vv-vitals Features

This document lists the planned and implemented features for the vv-vitals app.

## Core App Features

- Personal nutrition and meal tracking
- Reusable food library for storing food items with nutrition facts
- Daily diary entries grouped by date
- Meal categories within each diary entry (Breakfast, Lunch, Dinner, Snacks)
- Food logging inside meals with quantity in grams
- Nutrition totals computed per meal and per day

## Backend Features

- Express API with TypeScript
- SQLite database via `better-sqlite3`
- CORS restricted to the frontend origin in development
- Health check endpoint at `/api/health`
- CRUD routes for food library:
  - `GET /api/foods`
  - `GET /api/foods/:id`
  - `POST /api/foods`
  - `PUT /api/foods/:id`
  - `DELETE /api/foods/:id`
- Diary routes for entries and meals:
  - `GET /api/diary`
  - `GET /api/diary/:date`
  - `POST /api/diary/:date/meals`
  - `POST /api/diary/:date/meals/:mealId/foods`
  - `DELETE /api/diary/meals/:mealId`
  - `DELETE /api/diary/meal-foods/:id`

## Frontend Features

- Vite + React + TypeScript app
- Minimal starter app working in browser
- React Query scaffold prepared for data fetching
- Axios API client scaffold
- Future planned pages:
  - Food Library page to list and add foods
  - Diary page with date navigation and meal view
- Environment-aware frontend API base URL support

## Security / Project Quality Features

- `.gitignore` to exclude `node_modules`, build outputs, `.env`, and database files
- Project guide includes a security considerations checklist
- Backend error handling with sanitized responses
- Input validation guidance for SQL and request payloads
- Avoid raw HTML rendering and raw stack traces in responses
