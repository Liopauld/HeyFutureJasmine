# 🏴‍☠️ HeyFutureJasmine!

A One Piece–themed **time-capsule for two**. Write letters to your own future self or to
each other, seal them in a treasure chest, and let the tides deliver them on a chosen day —
opened as a cinematic "chest washing ashore."

## Stack
- **client** — React 18 + Vite, Tailwind, TanStack Query, TipTap, Framer Motion
- **server** — Express + MongoDB (Mongoose), JWT auth, BullMQ + Redis, Cloudinary, Resend
- **shared** — Zod schemas shared by both

## Highlights
- Three letter types: to your future self, to your partner, or **to us** (opened together)
- Partner pairing (a crew of two) via an invite code
- Voice notes, photos, and a song embed inside each chest
- A cinematic **Reveal** with "you sealed this N ago" context + reply-across-time
- **Reliable delivery**: BullMQ for precise timing, plus a cron **sweep** so a letter can't be
  lost — the app even delivers correctly with no Redis at all

## Local setup

Prereqs: Node 20+, and Docker (for Mongo + Redis) or a local MongoDB.

```bash
# 1. Install deps
cd server && npm install
cd ../client && npm install

# 2. Environment (defaults target the local docker services)
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Start infrastructure (MongoDB + Redis)
docker compose up -d

# 4. Seed two paired, verified accounts (Paul & Jasmine) + sample letters
cd server && npm run seed

# 5. Run both apps (in two terminals)
npm run dev            # server → http://localhost:5000
cd ../client && npm run dev   # client → http://localhost:5173
```

Seeded logins (password `grandline`): `paul@heyfuturejasmine.app`, `jasmine@heyfuturejasmine.app`.

### Optional services
- **Email** — without `RESEND_API_KEY`, emails are logged to the console. Add a key + verified
  sender to actually send.
- **Uploads** — photos/voice notes need Cloudinary keys; without them the app still runs.
- **Redis** — optional. Without it, the delivery **sweep** handles everything.

## Scripts
| Where | Command | Does |
|---|---|---|
| server | `npm run dev` | Start API (nodemon) |
| server | `npm run seed` | Reset + seed Paul & Jasmine |
| server | `npm run smoke` | End-to-end test on an in-memory Mongo (no Docker needed) |
| client | `npm run dev` | Start the web app |
| client | `npm run build` | Production build |

## Testing the reveal without waiting
When `ENABLE_DEV_ROUTES=true`, `POST /api/dev/deliver/:id` force-delivers one of your letters
so you can open the chest immediately. `POST /api/dev/sweep` triggers the delivery sweep.
