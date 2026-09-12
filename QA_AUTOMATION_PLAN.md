# 🏴‍☠️ HeyFutureJasmine! — QA Test Cases & Automation Master Plan

This document establishes the end-to-end Quality Assurance (QA) test plan, user test cases, automated test suite architecture, and regression verification protocols for **HeyFutureJasmine!** (Time Capsule Web Application).

---

## 📑 Table of Contents
1. [Test Strategy & Automation Pyramid](#1-test-strategy--automation-pyramid)
2. [Target Personas & Test Matrix](#2-target-personas--test-matrix)
3. [Master Test Cases Matrix](#3-master-test-cases-matrix)
   - [Module 1: Authentication & Account Security (TC-AUTH)](#module-1-authentication--account-security-tc-auth)
   - [Module 2: Partner Pairing & Crew Management (TC-PAIR)](#module-2-partner-pairing--crew-management-tc-pair)
   - [Module 3: Letter Creation, Editor & Attachments (TC-WRITE)](#module-3-letter-creation-editor--attachments-tc-write)
   - [Module 4: Voyage Progress & Delivery Mechanics (TC-VOYAGE)](#module-4-voyage-progress--delivery-mechanics-tc-voyage)
   - [Module 5: Treasure Chest Unboxing Ceremony (TC-CHEST)](#module-5-treasure-chest-unboxing-ceremony-tc-chest)
   - [Module 6: Grand Line Public Noticeboard (TC-NOTICE)](#module-6-grand-line-public-noticeboard-tc-notice)
   - [Module 7: Wanted Poster & Profile Progression (TC-PROF)](#module-7-wanted-poster--profile-progression-tc-prof)
   - [Module 8: Security, Rate Limiting & Edge Cases (TC-SEC)](#module-8-security-rate-limiting--edge-cases-tc-sec)
4. [Automated Test Suite Architecture](#4-automated-test-suite-architecture)
5. [Continuous Integration & Automated Pipeline (CI/CD)](#5-continuous-integration--automated-pipeline-cicd)
6. [Defect Classification & Severity Matrix](#6-defect-classification--severity-matrix)
7. [Step-by-Step QA Execution Runbook](#7-step-by-step-qa-execution-runbook)

---

## 1. Test Strategy & Automation Pyramid

```
                ▲
               / \
              /E2E\     13 User Journey Steps (Puppeteer/Playwright)
             /-----\    Full browser flows, Canvas export, Confetti, Modals
            /  API  \   64 Integration Smoke Checks (smoke.js)
           /---------\  Auth, Pairing, Cron Sweep, Ranks, Redaction, CRUD
          / Unit/Core \ Pure Functions (dates.js, hash.js, jwt.js, rankFor)
         /-------------\
```

| Layer | Coverage Scope | Tooling | Automation Frequency |
|---|---|---|---|
| **E2E UI Journey** | Complete visual flows, Canvas rendering, Lightbox, TipTap editor, 3D Chests | Puppeteer / Playwright | PR merges & Pre-release |
| **API Integration** | Endpoints, MongoDB Models, Token Auth, Overdue Sweeps, Role Access Control | Node.js Test Harness / `npm run smoke` | Every Commit / Pull Request |
| **Build & Static Analysis** | Vite production bundle, CSS bundling, dead code, syntax validation | `vite build` / ESLint | Pre-commit & CI Build |

---

## 2. Target Personas & Test Matrix

| Persona | Description | Key User Journey |
|---|---|---|
| **Solo Voyager** | User writing capsules to their future self. | Register ➔ Verify Email ➔ Write Self Letter ➔ Track on Captain's Log ➔ Open on Delivery. |
| **Crew of Two (Couple)** | Paired captains (Paul & Jasmine). | Share 8-character code ➔ Pair ➔ Sync Anniversary ➔ Dispatch Partner Letter ➔ Bilateral Reveal. |
| **External Nakama (Guest)** | Non-registered recipient. | Receives email with one-time link ➔ Visits `/unlock/:token` ➔ Unboxes chest without account. |
| **Community Voyager** | User reading public scrolls. | Browse Noticeboard ➔ Filter/Search ➔ Read public scrolls ➔ Send Trident salutes (likes). |

---

## 3. Master Test Cases Matrix

### Module 1: Authentication & Account Security (TC-AUTH)

| Test ID | Title | Preconditions | Steps | Expected Result | Automation Tier |
|---|---|---|---|---|---|
| `TC-AUTH-01` | User Registration | Unauthenticated | 1. Navigate to `/register`<br/>2. Enter unique name, email, and password (≥8 chars)<br/>3. Submit | User created (201), verification email dispatched, access token issued, redirected to `/log`. | **API + E2E** |
| `TC-AUTH-02` | Duplicate Registration Prevention | Existing user in DB | 1. Enter existing email/username on `/register`<br/>2. Submit | 409 Conflict returned; UI displays clear pirate warning. | **API** |
| `TC-AUTH-03` | Email Verification Flow | Registered user | 1. Navigate to `/verify-email/:token` with valid token | `emailVerified: true` stamped in DB; UI displays verified badge. | **API + E2E** |
| `TC-AUTH-04` | Invalid Verification Token | Unauthenticated | 1. Visit `/verify-email/fake-uuid` | 404 error returned; UI indicates invalid/expired token. | **API** |
| `TC-AUTH-05` | User Login with Credentials | Registered user | 1. Navigate to `/login`<br/>2. Enter valid email and password<br/>3. Submit | 200 OK, `httpOnly` refresh cookie set, access token in memory, toast "Welcome aboard, Captain." | **API + E2E** |
| `TC-AUTH-06` | Invalid Password Handling | Registered user | 1. Enter invalid password on `/login`<br/>2. Submit | 401 Unauthorized; generic "Invalid credentials" error shown. | **API + E2E** |
| `TC-AUTH-07` | Single-Flight Silent Token Refresh | Active session with expired access token | 1. Issue parallel API requests with expired token | Axios interceptor triggers single `/auth/refresh` call; requests retry and succeed transparently. | **API** |
| `TC-AUTH-08` | Password Reset & Multi-Device Revocation | Active user logged in | 1. POST `/auth/forgot-password`<br/>2. POST `/auth/reset-password/:token`<br/>3. Test old refresh tokens | Password updated; `user.refreshTokens = []` completely revokes all previous sessions. | **API + E2E** |

---

### Module 2: Partner Pairing & Crew Management (TC-PAIR)

| Test ID | Title | Preconditions | Steps | Expected Result | Automation Tier |
|---|---|---|---|---|---|
| `TC-PAIR-01` | Generate 8-Char Pairing Code | Logged-in solo user | 1. Navigate to `/profile`<br/>2. Click "Generate Pairing Code" | 8-character uppercase hex code generated; saved to `user.partnerInviteCode`. | **API + E2E** |
| `TC-PAIR-02` | Self-Pairing Rejection | Solo user with code | 1. Enter own generated code in pairing box | 400 Bad Request ("You can't pair with yourself"). | **API** |
| `TC-PAIR-03` | Two-Way Mutual Account Linking | User A (code), User B (solo) | 1. User B submits User A's invite code | Both users' `partner` fields set to each other; code consumed; anniversary synced. | **API + E2E** |
| `TC-PAIR-04` | Re-use of Consumed Code | Code already redeemed | 1. User C attempts to submit consumed code | 409 Conflict ("That code has already been used"). | **API** |
| `TC-PAIR-05` | Anniversary Real-Time Synchronization | Paired couple | 1. User A updates anniversary in `/profile` | User B's anniversary date automatically updates in MongoDB. | **API + E2E** |
| `TC-PAIR-06` | Crew Address Book Management | Authenticated user | 1. Add contact ("Zoro", email)<br/>2. Select recipient in `/write`<br/>3. Delete contact | Contact persisted in `user.crewMembers`; auto-fills in letter composer; deletes cleanly. | **API + E2E** |

---

### Module 3: Letter Creation, Editor & Attachments (TC-WRITE)

| Test ID | Title | Preconditions | Steps | Expected Result | Automation Tier |
|---|---|---|---|---|---|
| `TC-WRITE-01` | Rich Text Editor & HTML Formatting | Authenticated user | 1. Type formatted letter in TipTap (bold, italic, quotes, lists) | Clean HTML generated; DOMPurify sanitizes input on server. | **API + E2E** |
| `TC-WRITE-02` | Recipient Picker Routing | Paired user | 1. Toggle Self / Jasmine / Both / Other | Auto-populates recipient fields; verifies partner constraint. | **API + E2E** |
| `TC-WRITE-03` | Delivery Date Milestone Presets | Authenticated user | 1. Select "+6 months", "+1 year", or "Next Anniversary" | Automatically calculates future Date; rejects past/current timestamps with 400. | **API + E2E** |
| `TC-WRITE-04` | Photo Attachment Upload | Cloudinary configured | 1. Drop 1-3 JPEG/PNG images into `PhotoDropzone` | Uploads to Cloudinary (`kind: photo`); returns thumbnails with remove action. | **API + E2E** |
| `TC-WRITE-05` | Voice Note Recording & Live Waveform | Mic permissions granted | 1. Click "Record Voice Note"<br/>2. Speak for 5s<br/>3. Click "Stop & Attach" | Live Canvas visualizes audio wave; audio encoded to webm/m4a; uploaded to Cloudinary (`kind: voice`). | **E2E** |
| `TC-WRITE-06` | Song Embed Integration | Authenticated user | 1. Paste Spotify/YouTube/Apple Music track URL | Metadata parsed (provider, title, artist); embedded in letter preview. | **API + E2E** |
| `TC-WRITE-07` | Chest Theme Customization | Authenticated user | 1. Select theme (Oak, Gold, Scroll, Davy Jones, Alabasta, Skypiea) | Saved in `letter.capsuleTheme`; reflects in 3D chest render. | **API + E2E** |
| `TC-WRITE-08` | Noticeboard Visibility Toggle | Authenticated user | 1. Choose `private`, `public_anonymous`, or `public_named` | Flag saved in database; determines post-delivery noticeboard display. | **API + E2E** |
| `TC-WRITE-09` | Unfinished Draft Local Auto-Save | Writing letter | 1. Type letter without saving<br/>2. Close or navigate away<br/>3. Return to `/write` | "An unfinished letter is still on your desk" banner appears with "Pick it back up". | **E2E** |
| `TC-WRITE-10` | Unload Guard Warning | Active dirty form | 1. Attempt to refresh browser with unsaved text | Browser beforeunload prompt warns user before losing draft. | **E2E** |

---

### Module 4: Voyage Progress & Delivery Mechanics (TC-VOYAGE)

| Test ID | Title | Preconditions | Steps | Expected Result | Automation Tier |
|---|---|---|---|---|---|
| `TC-VOYAGE-01` | Grand Line Route Animated Timeline | Sealed sailing letter | 1. View letter card in `/log` | Animated pirate ship icon displays accurate progress % between sent date and delivery date. | **E2E** |
| `TC-VOYAGE-02` | 24-Hour Editing Lock Window (Pre-Lock) | Letter delivery > 24h away | 1. Click Edit icon on `/log`<br/>2. Modify text in `/write/:id/edit`<br/>3. Reseal | Letter updated (200 OK); recipient remains sealed. | **API + E2E** |
| `TC-VOYAGE-03` | 24-Hour Lock Enforcement (Post-Lock) | Letter delivery < 24h away | 1. Attempt to GET `/letters/:id/edit` or PATCH/DELETE | 423 Locked returned ("This chest is already sealed for delivery"). | **API** |
| `TC-VOYAGE-04` | Automated Delivery Sweep (Cron / Middleware) | Overdue letter in DB | 1. Trigger sweep or send any HTTP request to server | Letter status atomically flips to `delivered`; `deliveredAt` stamped; delivery email sent. | **API** |
| `TC-VOYAGE-05` | Delivery Idempotency Guarantee | Overdue letter | 1. Trigger BullMQ job and Cron sweep simultaneously | Only 1 worker claims delivery (`$ne: "delivered"`); exactly 1 notification email sent. | **API** |
| `TC-VOYAGE-06` | Dev SuperPeek Inspection Tool | Dev mode (`DEV=true`) | 1. Click "SuperPeek" button on sailing card | Modal displays unredacted body in dev mode without mutating DB sealed state. | **API + E2E** |

---

### Module 5: Treasure Chest Unboxing Ceremony (TC-CHEST)

| Test ID | Title | Preconditions | Steps | Expected Result | Automation Tier |
|---|---|---|---|---|---|
| `TC-CHEST-01` | Delivered Chest Initial Closed State | Letter status = `delivered` | 1. Navigate to `/treasure/:id` | 3D chest rendered in closed state with gold particles and "Open Chest" prompt. | **E2E** |
| `TC-CHEST-02` | 3D Opening Ceremony & Confetti Burst | Closed delivered chest | 1. Click chest lid | Open sound plays; lid rotates open; gold radial flare triggers; gold confetti explodes. | **E2E** |
| `TC-CHEST-03` | Unrolled Parchment & Thread Preview | Opened chest | 1. Observe revealed letter | Subject, sender name, formatted HTML body, and parent letter reply thread render cleanly. | **E2E** |
| `TC-CHEST-04` | Gramophone Voice Note Player | Letter with voice note | 1. Click Gramophone play button<br/>2. Scrub progress slider | Disc rotates smoothly; audio plays; scrub updates currentTime. | **E2E** |
| `TC-CHEST-05` | Fullscreen Photo Lightbox | Letter with photos | 1. Click memory thumbnail<br/>2. Press arrow keys (Left/Right)<br/>3. Press Esc | Modal opens; switches active photo; closes on Esc or backdrop click. | **E2E** |
| `TC-CHEST-06` | Unauthenticated Guest Unlock Token | Letter to external email | 1. Visit `/unlock/:token` in incognito browser | Letter unboxes without login; displays CTA banner to join crew. | **API + E2E** |

---

### Module 6: Grand Line Public Noticeboard (TC-NOTICE)

| Test ID | Title | Preconditions | Steps | Expected Result | Automation Tier |
|---|---|---|---|---|---|
| `TC-NOTICE-01` | Public Feed Isolation | Mixed letters in DB | 1. Navigate to `/noticeboard` | Only letters with `status: delivered` AND `visibility: public_*` appear. Private letters never leak. | **API + E2E** |
| `TC-NOTICE-02` | Anonymous Alias Generator | `public_anonymous` letter | 1. Inspect letter card on noticeboard | Sender name replaced with deterministic pirate alias (e.g. "Ghost of Jaya"); avatar hidden. | **API + E2E** |
| `TC-NOTICE-03` | Feed Sorting (Recent / Likes / Voyage) | Multiple public scrolls | 1. Switch tabs: Recent Tides / Most Celebrated / Epic Voyages | Re-fetches with correct MongoDB sort parameters (`deliveredAt`, `likes`, `sentAt`). | **API + E2E** |
| `TC-NOTICE-04` | Real-Time Keyword Search Filter | Active noticeboard feed | 1. Type query in search input | Filters cards client-side across subject, body text, and sender name. | **E2E** |
| `TC-NOTICE-05` | Trident Salute (Likes) & Optimistic UI | Public letter card | 1. Click trident button 🔱 | Counter increments immediately; pulse animation fires; localStorage prevents double-vote. | **API + E2E** |

---

### Module 7: Wanted Poster & Profile Progression (TC-PROF)

| Test ID | Title | Preconditions | Steps | Expected Result | Automation Tier |
|---|---|---|---|---|---|
| `TC-PROF-01` | Pirate Rank & Bounty Calculation | User with N letters | 1. Check bounty in `/profile` and navbar | 0 letters: Landlubber (฿0) ➔ 1-3: Rookie (฿1M) ➔ 4-10: Sea Dog (฿50M) ➔ 51+: Pirate King (฿1.5B). | **API + E2E** |
| `TC-PROF-02` | HTML5 Canvas Wanted Poster Generation | Authenticated user | 1. Click "Download Poster (PNG)" | Canvas (1200x1600px) awaits `document.fonts.ready`; draws parchment, avatar, title, bounty. | **E2E** |
| `TC-PROF-03` | Long Username Canvas Auto-Fit | User with >18 char name | 1. Generate poster canvas | Text measurement loop reduces font size dynamically so name never overflows borders. | **E2E** |
| `TC-PROF-04` | Web Share API Integration | Supported device / browser | 1. Click "Share" | Triggers native `navigator.share({ files: [posterPng] })`; falls back to download if unsupported. | **E2E** |
| `TC-PROF-05` | Avatar Image Upload | Cloudinary configured | 1. Click "Change Portrait" ➔ Select image | Uploads and updates `user.avatar`; previous Cloudinary publicId purged. | **API + E2E** |

---

### Module 8: Security, Rate Limiting & Edge Cases (TC-SEC)

| Test ID | Title | Preconditions | Steps | Expected Result | Automation Tier |
|---|---|---|---|---|---|
| `TC-SEC-01` | Sealed Letter Body Redaction | Sealed letter in DB | 1. Authenticated user GET `/api/letters` | Server returns `body: ""` and `attachments: []` for all non-delivered letters. | **API** |
| `TC-SEC-02` | Direct Route Hijack Prevention | Unauthenticated visitor | 1. Direct browser navigation to `/write`, `/log`, `/profile` | `RequireAuth` redirects to `/login` with `state: { from }` redirect preservation. | **E2E** |
| `TC-SEC-03` | Cross-Account Letter Access Block | User A and User B | 1. User B attempts GET `/api/letters/:userA_letterId` | 403 Forbidden ("Captain, this chest isn't yours to open"). | **API** |
| `TC-SEC-04` | Auth Rate Limiting Defense | Any IP | 1. Fire >30 rapid requests to `/api/auth/login` | 429 Too Many Requests ("Too many login attempts. Please rest at port"). | **API** |
| `TC-SEC-05` | XSS Attack Injection in TipTap Editor | User creating letter | 1. Inject `<script>alert(1)</script><img src=x onerror=alert(1)>` | Server-side DOMPurify strips malicious tags; rendered safely. | **API + E2E** |
| `TC-SEC-06` | Network Offline Banner & Reconnect | Client loaded | 1. Simulate offline network in browser | `OfflineBanner` displays "Lost at Sea — check your connection"; auto-clears on reconnect. | **E2E** |

---

## 4. Automated Test Suite Architecture

### Test Directory Layout
```
HeyFutureJasmine!/
├── server/
│   └── src/
│       └── scripts/
│           ├── smoke.js              # 64 API integration test cases
│           └── seed.js               # Test database seeding script
├── client/
│   └── src/
│       └── __tests__/ (or scratch/test_whole_flow.js) # 13 Puppeteer E2E phases
└── .github/
    └── workflows/
        ├── qa-automation.yml         # CI/CD Automated Test Pipeline
        └── keepalive.yml             # Health ping & delivery tick
```

---

## 5. Continuous Integration & Automated Pipeline (CI/CD)

The automated QA pipeline is codified in GitHub Actions:

```yaml
name: QA Automated Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  qa-smoke-and-build:
    name: Backend Smoke Tests & Client Build
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: |
          npm ci
          npm --prefix server ci
          npm --prefix client ci

      - name: Run Backend Integration Smoke Suite (64 Checks)
        env:
          NODE_ENV: test
          MONGODB_URI: mongodb://localhost:27017/heyfuturejasmine_test
          JWT_ACCESS_SECRET: test_access_secret_1234567890
          JWT_REFRESH_SECRET: test_refresh_secret_1234567890
        run: npm run smoke

      - name: Verify Client Production Build
        run: npm run build
```

---

## 6. Defect Classification & Severity Matrix

| Severity | Criteria | Example | SLA |
|---|---|---|---|
| **P0 — Blocker** | Core functionality broken, security leak, data loss. | Letters failing to deliver; sealed content exposed in API payload; authentication bypass. | Immediate (<4 hours) |
| **P1 — Critical** | Major feature impaired without workaround. | Partner pairing failing; Cloudinary uploads crashing; password reset token not sending. | <24 hours |
| **P2 — Medium** | Feature works but with UI/UX glitch or edge case error. | Gold flare animation glitch; Canvas text overflowing border; sort dropdown jitter. | Next sprint |
| **P3 — Minor** | Cosmetic imperfection, typo, or minor styling nuance. | Minor color contrast issue in dark mode; icon alignment on mobile viewports. | As prioritized |

---

## 7. Step-by-Step QA Execution Runbook

### Quick Local Test Execution
To execute the complete QA suite locally:

```bash
# 1. Run all 64 Backend Integration Smoke Tests
npm run smoke

# 2. Verify Client Production Build (Zero errors)
npm run build

# 3. Seed Local MongoDB with Test Captains (Paul & Jasmine)
npm --prefix server run seed

# 4. Start Local Dev Servers
# Terminal 1:
npm run dev:server
# Terminal 2:
npm run dev:client

# 5. Run Headless E2E Browser Test Suite (Captures 13 Screenshots)
node ./scratch/test_whole_flow.js
```
