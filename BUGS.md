# Bug Tracker

This document captures issues encountered during the vv-vitals project setup and the steps used to resolve them.

## 1. Backend startup error: `initDb is not defined`
- **Symptom:** Server failed to start with `ReferenceError: initDb is not defined`.
- **Cause:** `server/src/index.ts` still called `initDb()` after switching to `import './db'`.
- **Fix:** Removed the redundant `initDb()` call in `server/src/index.ts` and kept the module side-effect import.

## 2. Backend port conflict on `3001`
- **Symptom:** Server crashed with `EADDRINUSE: address already in use :::3001`.
- **Cause:** A previous Node process was still listening on port `3001`.
- **Fix:** Identified the process with `netstat -ano | findstr :3001`, confirmed it was `node.exe`, then terminated it with `taskkill /PID <pid> /F`.

## 3. PowerShell HTTP request alias/quoting issues
- **Symptom:** POST requests to the API via PowerShell failed with header and quoting syntax errors.
- **Cause:** PowerShell's `curl` alias and command quoting behave differently than Unix-style `curl`.
- **Fix:** Used `node -e` and native `fetch()` from Node.js to verify API behavior reliably.

## 4. Basic route validation / missing features
- **Symptom:** The backend routes were scaffolded, but the diary routes still require deeper validation and UI wiring.
- **Cause:** Initial implementation focused on project scaffolding; diary endpoint behavior is partially complete.
- **Fix / next step:** Continue by verifying and expanding the diary endpoint routes, then connect them in the frontend.
