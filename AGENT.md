# 🏴‍☠️ AGENT.md — Coding Agent Guide for HeyFutureJasmine!

This document serves as the single source of truth and operating handbook for any AI coding agent developing, extending, or maintaining **HeyFutureJasmine!**.

---

## 1. Core Mission & Architectural Principles

HeyFutureJasmine! is a One Piece–themed time-capsule web application. It combines emotional storytelling with robust backend scheduling and privacy guarantees.

### 1.1. Invariant Rules (NEVER BREAK)
1. **The Sealed Letter Privacy Rule (Zero-Knowledge Pre-Delivery):**
   - Under NO circumstances may the server return the `body`, `attachments`, or `song` of a sealed letter to a recipient or to the public API prior to `deliveryDate`.
   - The sender may only view the full body when accessing the edit endpoint (`GET /api/letters/:id/edit`) before the lock window.
   - All preview/listing queries must use `buildLetterPreview` with `redactBody: true` for sealed letters.
2. **The 24-Hour Lock Window:**
   - Letters CANNOT be modified (`PATCH`), opened for editing (`GET /:id/edit`), or deleted (`DELETE`) once `Date.now() >= deliveryDate - 24 hours`.
   - The API MUST return `423 Locked` with an appropriate seafaring error message if attempted.
3. **Server-Side HTML Sanitization:**
   - Never trust frontend HTML. Always sanitize letter content using `isomorphic-dompurify` on the backend before writing to MongoDB.
4. **Reliability Redundancy:**
   - Never rely exclusively on Redis for letter delivery. Letter scheduling must operate via BullMQ with a continuous background Cron Sweep + `sweepOnRequest` fallback. The app MUST function even if Redis is unavailable.
5. **No Plaintext Passwords or Secrets:**
   - Passwords must be hashed using bcrypt (12 rounds).
   - Secret keys, Cloudinary credentials, and Resend keys must only be read from `process.env`. Never expose secrets to frontend bundles or git.

---

## 2. Project Layout & Directory Structure

```
HeyFutureJasmine!
├── client/                     # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # RequireAuth, AuthShell, PartnerPairCard
│   │   │   ├── common/         # LoadingCompass, ErrorBoundary, EmptyState
│   │   │   ├── effects/        # ParticleCanvas, WaveShimmer
│   │   │   ├── layout/         # Navbar, PageWrapper, OceanBackground
│   │   │   ├── letter/         # TipTap Editor, ChestThemePicker, DatePicker, LetterCard, Reveal
│   │   │   └── ui/             # Button, Input, Badge, Dialog
│   │   ├── hooks/              # useLetters, useAuth, usePartner, useAudioRecorder
│   │   ├── lib/                # api.js (Axios with interceptors), dates.js
│   │   ├── pages/              # Home, WriteLetter, CaptainsLog, TreasureChest, Profile, Noticeboard
│   │   ├── store/              # authStore.js (Zustand state)
│   │   └── styles/             # globals.css (tokens, typography, surfaces)
│   └── tailwind.config.js
│
├── server/                     # Node.js 24.14.1 Express REST API
│   ├── src/
│   │   ├── config/             # db.js, redis.js, cloudinary.js
│   │   ├── controllers/        # authController, letterController, uploadController, userController
│   │   ├── jobs/               # letterQueue.js, letterWorker.js, deliverySweep.js
│   │   ├── middleware/         # auth.js, rateLimiter.js, sweepOnRequest.js, errorHandler.js
│   │   ├── models/             # User.js, Letter.js, Attachment.js
│   │   ├── routes/             # auth.js, letters.js, uploads.js, users.js, dev.js
│   │   ├── scripts/            # seed.js, smoke.js (end-to-end memory tests)
│   │   └── services/           # emailService.js, cloudinaryService.js, letterService.js
│   └── index.js
│
├── shared/                     # Cross-platform Shared Schemas
│   └── schemas/                # letterSchema.js, userSchema.js (Zod)
│
├── docker-compose.yml          # Local Mongo & Redis
├── BRAND.md                    # Visual tokens, palette, and copywriting guide
└── SPEC.md                     # Full REST API and data architecture specification
```

---

## 3. Development Workflow & Standard Commands

### 3.1. Local Ports
- **Server:** Runs on `http://localhost:5001` (configured via `server/.env` `PORT=5001`).
- **Client:** Runs on `http://localhost:5173` (configured via `client/.env` `VITE_API_URL=http://localhost:5001/api`).
- **CORS Notice:** The server's CORS whitelist strictly expects `http://localhost:5173`. Ensure Vite is running on port `5173`.

### 3.2. Essential Commands

| Command | Working Directory | Description |
|---|---|---|
| `docker compose up -d` | Root `/` | Start MongoDB (`27017`) and Redis (`6379`) containers |
| `npm run seed` | `server/` | Reset and seed verified accounts (`paul@heyfuturejasmine.app`, `jasmine@heyfuturejasmine.app` / `grandline`) |
| `npm run smoke` | `server/` | Run 21-point automated smoke test on in-memory Mongo (No Docker needed) |
| `npm run dev` | `server/` | Launch Express API with Node watch mode |
| `npm run dev` | `client/` | Launch Vite React dev server |
| `npm run build` | `client/` | Validate TypeScript/JSX and build production bundle |

---

## 4. Implementation Guidelines for Coding Agents

### 4.1. Server-Side Patterns
- **Controllers & Error Handling:** All async controller methods must catch errors and pass them to `next(err)` to be formatted by `errorHandler.js`.
- **Mongoose Population:** When fetching letters, always populate `sender` (with username, displayName, avatar) and `attachments` where appropriate.
- **Transactions & Hooks:** When deleting a letter, ensure its associated `Attachment` records are cleared and BullMQ scheduled jobs are cancelled via `jobId`.

### 4.2. Frontend Patterns
- **Data Fetching:** Use `@tanstack/react-query` for all server interactions. Define query keys hierarchically (e.g., `["letters"]`, `["letters", id]`, `["user", "me"]`).
- **Form State:** Use `react-hook-form` paired with `zodResolver` against schemas in `shared/schemas/`.
- **Microcopy:** When writing UI strings, always check `BRAND.md` and use the pirate terminology table ("Seal & Set Sail", "Captain's Log", "Washed Ashore").

### 4.3. Pre-Commit Checklist for Agents
Before concluding any feature or bug fix:
1. Run `cd server && npm run smoke` to confirm no regressions in auth, locking, or delivery logic.
2. Run `cd client && npm run build` to confirm no bundling errors or broken imports.
3. Keep git commits clear, atomic, and push to GitHub.
