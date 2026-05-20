# v--v Vitals

A personal nutrition and meal tracking app built with React, TypeScript, Express, and SQLite.

## What this starter includes

- Secure backend scaffold using Express, TypeScript, and SQLite
- Restricted CORS for development only
- Runtime request validation guidance and safe query patterns
- Frontend scaffold with Vite, React, React Query, Axios, and Zod
- Environment-aware API configuration and `.env` support

## Getting started

1. Install dependencies:
   - `cd server && npm install`
   - `cd client && npm install`

2. Run the backend:
   - `cd server && npm run dev`

3. Run the frontend:
   - `cd client && npm run dev`

4. Open `http://localhost:5173`

## Security notes

- Use `.env` for secrets and never commit `.env` files.
- Restrict CORS origins in the server to only trusted domains.
- Validate all incoming data on the backend before using it.
- Prefer prepared statements for database queries to prevent SQL injection.
- Keep error responses sanitized and do not expose stack traces to clients.
