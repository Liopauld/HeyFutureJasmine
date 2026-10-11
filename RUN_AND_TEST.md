# Running & Testing HeyFutureJasmine! — from scratch

A step-by-step guide to get the whole app running locally and to test every major
flow: auth, writing a sealed letter, and the cinematic "chest washes ashore" reveal.

Everything here assumes you're starting from a fresh clone (or a machine you haven't
run this on before).

---

## ⚓ Reminder: push to GitHub after every change

> **This is the important habit.** After any meaningful change — code, this guide,
> anything — commit and push so nothing lives only on this laptop and previous
> commits are always safe to pull.
>
> **Claude: at the end of any turn where you changed files in this repo, remind me
> to push (or offer to do it), and if I say yes, run the three commands below.**

```bash
git add -A
git commit -m "Describe what changed"
git push
```

First-time-only setup (creating the repo + remote) is in
[§10 — Keeping GitHub in sync](#10-keeping-github-in-sync). After that, the three
commands above are all you need day to day.

---

## 0. What you're starting

Three parts, one repo:

| Part | What it is | Runs on |
|---|---|---|
| **server** | Express API + MongoDB + BullMQ/Redis delivery queue | `http://localhost:5001` |
| **client** | React + Vite web app | `http://localhost:5173` |
| **infra** | MongoDB + Redis, via Docker | ports `27017` / `6379` |

> **Ports matter here.** On this machine the server runs on **5001** (see
> `server/.env` → `PORT=5001`), and `client/.env` already points at
> `http://localhost:5001/api`. The `.env.example` files say `5000` — that's just
> the template default. If you ever change one, change both, or the client can't
> reach the API.

---

## 1. Prerequisites (one time)

- **Node 24.14.1** (see `.node-version`) — check with `node -v`
- **Docker Desktop** — for MongoDB + Redis (or bring your own local Mongo/Redis)

You do **not** need Cloudinary, Resend, or Redis accounts to run and test the core
app. Those are optional (see [§7](#7-optional-services)).

---

## 2. First-time setup

Run these once, from the repo root.

```bash
# Install dependencies for both apps
cd server && npm install
cd ../client && npm install
cd ..

# Create env files from the templates (skip any that already exist)
cp server/.env.example server/.env      # then set PORT=5001 (see note above)
cp client/.env.example client/.env      # then set VITE_API_URL=http://localhost:5001/api
```

> On this machine both `.env` files already exist and are set to **5001** — you can
> skip the copy step and just confirm they look right.

Minimum you should confirm in `server/.env`:

```
PORT=5001
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/heyfuturejasmine
ENABLE_DEV_ROUTES=true          # enables the test-only delivery endpoints
```

---

## 3. Start the infrastructure

```bash
docker compose up -d
```

This starts MongoDB and Redis in the background, with data persisted in named
volumes (survives restarts). Verify:

```bash
docker compose ps        # both hfj-mongo and hfj-redis should be "running"
```

To stop later: `docker compose down` (add `-v` to also wipe the data volumes).

---

## 4. Seed test accounts

```bash
cd server && npm run seed
```

This resets and creates two **paired, email-verified** accounts plus sample letters:

| Login | Password |
|---|---|
| `paul@heyfuturejasmine.app` | `grandline` |
| `jasmine@heyfuturejasmine.app` | `grandline` |

Re-run any time you want a clean slate.

---

## 5. Run the app (two terminals)

**Terminal 1 — API:**
```bash
cd server && npm run dev        # Node watch mode → http://localhost:5001
```
Sanity check it's up:
```bash
curl http://localhost:5001/api/health      # → {"status":"ok",...}
```
On boot you should also see `Dev routes enabled at /api/dev` in the log.

**Terminal 2 — web app:**
```bash
cd client && npm run dev        # Vite → http://localhost:5173
```

> **Use the default Vite port (5173).** The server's CORS allow-list only includes
> `CLIENT_URL` (5173). If you start Vite on another port (e.g. `--port 5199`),
> every API call fails with a CORS error in the browser console. If 5173 is taken,
> free it or add the new port to `CLIENT_URL` in `server/.env` and restart the API.

Open **http://localhost:5173** and log in as Paul or Jasmine.

---

## 6. Testing the flows

### 6a. Automated smoke test (fastest confidence check)

Runs the full lifecycle — register → pair → write → **force-deliver → reveal → cron
sweep** — against an in-memory MongoDB. **No Docker or running server needed.**

```bash
cd server && npm run smoke
```

Green output = the whole backend path works end to end. Run this first whenever you
touch the server.

### 6b. Manual walkthrough in the browser

1. **Log in** as `paul@heyfuturejasmine.app` / `grandline`.
2. **Write a letter** (`/write`): pick a type (to future self / to partner / to us),
   write a body, choose a delivery date, optionally add a photo/voice/song, and seal it.
3. **Our Log** (`/log`): the sealed chest appears as *sailing*. It won't open until
   its delivery date — that's expected.
4. To see the **reveal without waiting**, force-deliver it (next section), then open
   the chest from the log for the cinematic "washes ashore" animation.

### 6c. Force a delivery (test the reveal today)

The reveal only triggers once a letter is delivered. Two dev-only ways to make that
happen now (both require `ENABLE_DEV_ROUTES=true` and a logged-in sender's token):

- **From the app:** easiest is to just watch it in the UI after triggering via curl.
- **Via the API** — grab an access token by logging in, then:

```bash
# Force-deliver one specific letter (must be YOUR letter):
curl -X POST http://localhost:5001/api/dev/deliver/<LETTER_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Or run the reliability sweep, which delivers everything now due:
curl -X POST http://localhost:5001/api/dev/sweep \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

After either call, reload **Our Log** and open the chest — it should play the reveal.

> Getting the token/ID by hand is fiddly; for a pure backend check, `npm run smoke`
> already exercises this exact path automatically.

### 6d. Delivery reliability (nice to verify once)

Delivery is intentionally belt-and-suspenders: **BullMQ + Redis** handles precise
timing, and a **cron sweep** catches anything missed. The app even delivers correctly
with **no Redis at all** — the sweep covers it. To see that, you can stop Redis
(`docker compose stop redis`), set a letter's delivery time in the past, and confirm
the sweep still delivers it.

---

## 7. Optional services

All optional — the app runs fully without them:

- **Email (Resend):** without `RESEND_API_KEY`, emails (verification, delivery
  notices) are **logged to the server console** instead of sent. Watch Terminal 1 to
  see them. Add a key + verified sender to send for real.
- **Uploads (Cloudinary):** photos and voice notes need
  `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET`. Without them, the app runs but
  attachment uploads are disabled.

---

## 8. Quick command reference

| Where | Command | Does |
|---|---|---|
| root | `docker compose up -d` | Start Mongo + Redis |
| root | `docker compose down` | Stop them (`-v` wipes data) |
| server | `npm run dev` | Start API on :5001 (Node watch mode) |
| server | `npm run seed` | Reset + seed Paul & Jasmine |
| server | `npm run smoke` | Full end-to-end test, in-memory Mongo |
| client | `npm run dev` | Start web app on :5173 |
| client | `npm run build` | Production build |

---

## 9. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Browser console: **CORS** error on `/api/...` | Client isn't on 5173, or server's `CLIENT_URL` doesn't match. Run Vite on 5173, or add your port to `CLIENT_URL` and restart the API. |
| Client calls fail / wrong port | `client/.env` `VITE_API_URL` must match the server's `PORT`. Both should be **5001** here. Restart Vite after editing `.env`. |
| `MongooseServerSelectionError` / can't connect to DB | Docker isn't up. `docker compose up -d`, then `docker compose ps`. |
| Chest never opens in the UI | It's not delivered yet. Force it with `/api/dev/deliver/:id` or `/api/dev/sweep` (§6c). |
| `/api/dev/...` returns 404 | `ENABLE_DEV_ROUTES=true` missing in `server/.env`; restart the API. |
| No verification/delivery emails arrive | Expected without `RESEND_API_KEY` — check the **server console**, they're logged there. |
| Port 5173 or 5001 already in use | Kill the stray process (`lsof -ti:5173 | xargs kill`) or change the port in **both** places (see the ports note in §0). |

---

## 10. Keeping GitHub in sync

The repo lives on GitHub (private). The golden rule is at the top of this file:
**commit and push after every meaningful change.** This section is the reference.

### Day-to-day (the whole workflow)

```bash
git add -A
git commit -m "Describe what changed"
git push
```

Check what you're about to commit first with `git status`. To pull the latest
before starting work (e.g. on another machine): `git pull`.

> **Secrets never get pushed.** `.env` files are in `.gitignore`, so your JWT
> secrets and API keys stay local. Only `.env.example` (the template) is tracked.
> If you ever add a new secrets file, add it to `.gitignore` before committing.

### First-time setup (already done, here for reference)

If you ever need to recreate the remote from scratch:

```bash
# Create a private repo and push the current branch in one step
gh repo create HeyFutureJasmine --private --source=. --remote=origin --push

# Push any other branches you want backed up too
git push -u origin master
git push -u origin rebuild
```

### Branches here

- **`rebuild`** — the active branch with the current frontend rebuild. Day-to-day
  work happens here.
- **`master`** — the original snapshot, kept for history.

To see everything that's backed up: `git log --oneline --all` or open the repo on
github.com.
