# 🏴‍☠️ HeyFutureJasmine! — Updated Staging Test Cases & Execution Matrix

**Testing Run ID:** `Staging_Test_2026-09-13_Run_01`  
**Date:** 2026-09-13  
**Target Environment:** Deployed Staging Application  
**Applicability Record:** [Applicability_Record.md](file:///Users/pauldominic/Personal%20Projects/HeyFutureJasmine!/Staging_Test_2026-09-13_Run_01/Applicability_Record.md)  

---

## 📑 Table of Contents
1. [Classification & Execution Summary](#1-classification--execution-summary)
2. [Section A: UI Testing (Playwright Automation Matrix)](#section-a-ui-testing-playwright-automation-matrix)
   - [Module 1: Authentication & Account Security (TC-AUTH)](#module-1-authentication--account-security-tc-auth)
   - [Module 2: Partner Pairing & Crew Management (TC-PAIR)](#module-2-partner-pairing--crew-management-tc-pair)
   - [Module 3: Letter Creation, Editor & Attachments (TC-WRITE)](#module-3-letter-creation-editor--attachments-tc-write)
   - [Module 4: Voyage Progress & Delivery Mechanics (TC-VOYAGE)](#module-4-voyage-progress--delivery-mechanics-tc-voyage)
   - [Module 5: Treasure Chest Unboxing Ceremony (TC-CHEST)](#module-5-treasure-chest-unboxing-ceremony-tc-chest)
   - [Module 6: Grand Line Public Noticeboard (TC-NOTICE)](#module-6-grand-line-public-noticeboard-tc-notice)
   - [Module 7: Wanted Poster & Profile Progression (TC-PROF)](#module-7-wanted-poster--profile-progression-tc-prof)
   - [Module 8: Security, Route Guards & UI Resilience (TC-SEC)](#module-8-security-route-guards--ui-resilience-tc-sec)
3. [Section B: Non-UI Staging Testing (API & Security Matrix)](#section-b-non-ui-staging-testing-api--security-matrix)
   - [Staging API Verification, Rate Limiting & Overdue Sweeps](#staging-api-verification-rate-limiting--overdue-sweeps)

---

## 1. Classification & Execution Summary

| Test Classification | Total Cases | Target Automation Mechanism | Evidence Location |
|---|---|---|---|
| **UI Testing** | 37 | Playwright Browser Automation | `Evidence/UI/` |
| **Non-UI Staging Testing** | 7 | Staging API & Security Test Harness | `Evidence/Non_UI/` |
| **Local / Unit Only (Removed)** | 1 (+ Unit suites) | Documented in Applicability Record | N/A |
| **Total Staging Cases** | **44** | | |

---

## Section A: UI Testing (Playwright Automation Matrix)

### Module 1: Authentication & Account Security (TC-AUTH)

| Test ID | Title | Preconditions | Steps | Expected Result | Status | Actual Result | Evidence | Remarks |
|---|---|---|---|---|---|---|---|---|
| `TC-AUTH-01` | User Registration | Unauthenticated on Staging | 1. Navigate to `/register`<br/>2. Enter unique name, email, and password (≥8 chars)<br/>3. Submit form | User account created (201), session initiated, access token stored, redirected to `/log`. | **PASS** | Registration form submitted successfully; user navigated to `/log` with initial welcome banner. | `TC-AUTH-01_01.png` | Function works as expected. |
| `TC-AUTH-02` | Duplicate Registration Prevention | Existing user on Staging | 1. Enter existing email/username on `/register`<br/>2. Submit form | Staging rejects duplicate; UI displays conflict alert. | **PASS** | Form submission returned conflict alert "Email already taken by another captain". | `TC-AUTH-02_01.png` | Duplicate prevention works as expected. |
| `TC-AUTH-03` | Email Verification Flow | Staging user with verification token | 1. Navigate to `/verify-email/:token` with valid token in browser | UI displays verified badge and congratulatory state. | **PASS** | Verification route resolved; UI showed green verified status. | `TC-AUTH-03_01.png` | Email verification verified on staging. |
| `TC-AUTH-04` | Invalid Verification Token | Unauthenticated on Staging | 1. Visit `/verify-email/invalid-token-12345` | UI displays invalid/expired verification token error state. | **PASS** | Error banner "Invalid or expired parchment seal" displayed. | `TC-AUTH-04_01.png` | Error handling works as expected. |
| `TC-AUTH-05` | User Login with Credentials | Registered staging user | 1. Navigate to `/login`<br/>2. Enter valid email and password<br/>3. Submit form | Session established, cookie attached, redirected to `/log` with toast. | **PASS** | Logged in successfully; redirected to `/log` with "Welcome aboard, Captain" toast. | `TC-AUTH-05_01.png` | Login flow verified. |
| `TC-AUTH-06` | Invalid Password Handling | Registered staging user | 1. Navigate to `/login`<br/>2. Enter incorrect password<br/>3. Submit form | UI displays generic "Invalid credentials" error prompt. | **PASS** | Error toast "Invalid email or password" rendered; password field reset. | `TC-AUTH-06_01.png` | Authentication error prompt confirmed. |
| `TC-AUTH-08` | Password Reset & Recovery Flow | Registered staging user | 1. Navigate to `/forgot-password`<br/>2. Submit email<br/>3. Open reset link in browser<br/>4. Enter new password | Password updated; user able to log in with new password. | **PASS** | Password reset completed; new credentials successfully authenticated. | `TC-AUTH-08_01.png` | Password recovery workflow verified. |

---

### Module 2: Partner Pairing & Crew Management (TC-PAIR)

| Test ID | Title | Preconditions | Steps | Expected Result | Status | Actual Result | Evidence | Remarks |
|---|---|---|---|---|---|---|---|---|
| `TC-PAIR-01` | Generate 8-Char Pairing Code | Logged-in solo user | 1. Navigate to `/profile`<br/>2. Click "Generate Pairing Code" | 8-character uppercase hex code generated and displayed. | **PASS** | Invite code generated and rendered in copyable card. | `TC-PAIR-01_01.png` | Code generation verified. |
| `TC-PAIR-02` | Self-Pairing Rejection | Solo user with invite code | 1. Enter own generated code into the pairing input<br/>2. Click Pair | UI displays error: "You can't pair with yourself". | **PASS** | Warning alert displayed refusing self-pairing attempt. | `TC-PAIR-02_01.png` | Validation rule enforced. |
| `TC-PAIR-03` | Two-Way Mutual Account Linking | User A (code) & User B (solo) | 1. Log in as User B<br/>2. Submit User A's invite code in `/profile` | Both accounts linked mutually; crew badge updated. | **PASS** | Accounts linked successfully; partner card updated to show User A. | `TC-PAIR-03_01.png` | Mutual pairing established. |
| `TC-PAIR-04` | Re-use of Consumed Code | Consumed pairing code | 1. Enter previously consumed code<br/>2. Click Pair | UI displays error: "That code has already been used". | **PASS** | Conflict alert returned stating code is expired/used. | `TC-PAIR-04_01.png` | Code consumption verified. |
| `TC-PAIR-05` | Anniversary Real-Time Synchronization | Paired couple | 1. Update anniversary date in `/profile`<br/>2. Save | Anniversary date updated and visible across both profiles. | **PASS** | Anniversary date saved and reflected immediately. | `TC-PAIR-05_01.png` | Sync confirmed across paired accounts. |
| `TC-PAIR-06` | Crew Address Book Management | Authenticated user | 1. Add new crew member ("Zoro", email)<br/>2. Verify in list<br/>3. Delete member | Member added, selectable in recipient picker, and removed cleanly. | **PASS** | Contact created, displayed in address book, and deleted. | `TC-PAIR-06_01.png` | Crew CRUD verified. |

---

### Module 3: Letter Creation, Editor & Attachments (TC-WRITE)

| Test ID | Title | Preconditions | Steps | Expected Result | Status | Actual Result | Evidence | Remarks |
|---|---|---|---|---|---|---|---|---|
| `TC-WRITE-01` | Rich Text Editor & HTML Formatting | Authenticated user | 1. Navigate to `/write`<br/>2. Format text (Bold, Italic, Blockquote, Lists) in TipTap | Rich text rendered properly; toolbar controls toggle active states. | **PASS** | TipTap rich-text applied styles cleanly with valid markup. | `TC-WRITE-01_01.png` | Rich text editor fully functional. |
| `TC-WRITE-02` | Recipient Picker Routing | Paired user | 1. Toggle recipient between Self, Jasmine, Both, and Other | UI dynamically switches delivery destination and metadata. | **PASS** | Recipient options switch correctly and populate address inputs. | `TC-WRITE-02_01.png` | Recipient routing verified. |
| `TC-WRITE-03` | Delivery Date Milestone Presets | Authenticated user | 1. Click milestone chips (+6 mo, +1 yr, Next Anniversary) | Date picker auto-fills with accurate future date. | **PASS** | Selected milestone calculated future date accurately. | `TC-WRITE-03_01.png` | Milestone calculation verified. |
| `TC-WRITE-04` | Photo Attachment Upload | Cloudinary configured | 1. Upload photo in `PhotoDropzone`<br/>2. Verify thumbnail preview | Image uploaded; thumbnail rendered with remove button. | **PASS** | Photo uploaded successfully and rendered in thumbnail gallery. | `TC-WRITE-04_01.png` | Attachment upload verified. |
| `TC-WRITE-05` | Voice Note Recording & Live Waveform | Mic permissions available | 1. Click "Record Voice Note"<br/>2. Record 5s<br/>3. Click "Stop & Attach" | Live Canvas displays waveform; audio attachment created. | **PASS** | Waveform visualized audio during recording; voice note attached. | `TC-WRITE-05_01.png` | Voice recorder functional. |
| `TC-WRITE-06` | Song Embed Integration | Authenticated user | 1. Paste Spotify/YouTube track URL into song input | Embedded player/preview rendered with track metadata. | **PASS** | Media URL parsed and interactive player card rendered. | `TC-WRITE-06_01.png` | Song embedding verified. |
| `TC-WRITE-07` | Chest Theme Customization | Authenticated user | 1. Select chest capsule theme (Oak, Skypiea, Gold, etc.) | Selected theme preview updates in 3D chest container. | **PASS** | Theme selection applied with themed textures and accents. | `TC-WRITE-07_01.png` | Theme selector verified. |
| `TC-WRITE-08` | Noticeboard Visibility Toggle | Authenticated user | 1. Toggle between Private, Public Anonymous, and Public Named | Visibility mode indicator updates. | **PASS** | Visibility mode state saved and indicated on letter badge. | `TC-WRITE-08_01.png` | Visibility toggle functional. |
| `TC-WRITE-09` | Unfinished Draft Local Auto-Save | Writing letter | 1. Type letter body<br/>2. Navigate to `/log`<br/>3. Return to `/write` | "An unfinished letter is still on your desk" banner displayed. | **PASS** | Draft restoration banner displayed with "Pick it back up" action. | `TC-WRITE-09_01.png` | Draft recovery verified. |
| `TC-WRITE-10` | Unload Guard Warning | Dirty letter form | 1. Attempt page refresh with unsaved changes | Browser beforeunload dialog warns of unsaved data. | **PASS** | Unload confirmation prompt triggered before navigation. | `TC-WRITE-10_01.png` | Unload guard active. |

---

### Module 4: Voyage Progress & Delivery Mechanics (TC-VOYAGE)

| Test ID | Title | Preconditions | Steps | Expected Result | Status | Actual Result | Evidence | Remarks |
|---|---|---|---|---|---|---|---|---|
| `TC-VOYAGE-01` | Grand Line Route Animated Timeline | Sealed sailing letter | 1. View sailing letter card on `/log` | Animated ship icon and progress % reflect elapsed voyage time. | **PASS** | Voyage timeline bar rendered with progress percentage. | `TC-VOYAGE-01_01.png` | Timeline visualization verified. |
| `TC-VOYAGE-02` | 24-Hour Editing Lock Window (Pre-Lock) | Letter delivery >24h away | 1. Click edit on `/log`<br/>2. Edit content<br/>3. Reseal | Letter updated and saved; returned to sailing state. | **PASS** | Letter content modified and resealed successfully. | `TC-VOYAGE-02_01.png` | Pre-lock editing functional. |

---

### Module 5: Treasure Chest Unboxing Ceremony (TC-CHEST)

| Test ID | Title | Preconditions | Steps | Expected Result | Status | Actual Result | Evidence | Remarks |
|---|---|---|---|---|---|---|---|---|
| `TC-CHEST-01` | Delivered Chest Initial Closed State | Letter status = `delivered` | 1. Navigate to `/treasure/:id` | 3D chest rendered closed with glowing lock and open prompt. | **PASS** | Chest rendered closed with gold glow and particle animations. | `TC-CHEST-01_01.png` | Initial closed state verified. |
| `TC-CHEST-02` | 3D Opening Ceremony & Confetti Burst | Closed delivered chest | 1. Click chest lid | Lid opens, radial gold flare animates, confetti explodes. | **PASS** | 3D lid opened with gold radial flare ceremony and confetti burst. | `TC-CHEST-02_01.png` | Unboxing ceremony fully verified. |
| `TC-CHEST-03` | Unrolled Parchment & Thread Preview | Opened chest | 1. Inspect revealed parchment | Formatted HTML body, author, timestamp, and reply thread displayed. | **PASS** | Parchment letter rendered with formatted text and reply thread. | `TC-CHEST-03_01.png` | Letter reveal verified. |
| `TC-CHEST-04` | Gramophone Voice Note Player | Letter with voice note | 1. Click play on gramophone player<br/>2. Scrub timeline slider | Turntable rotates; audio playback and slider seek work smoothly. | **PASS** | Turntable animated during playback; seek slider updated smoothly. | `TC-CHEST-04_01.png` | Gramophone audio verified. |
| `TC-CHEST-05` | Fullscreen Photo Lightbox | Letter with photos | 1. Click photo thumbnail<br/>2. Navigate with arrow keys<br/>3. Press Esc | Modal lightbox opens; navigates photos; closes on Esc. | **PASS** | Fullscreen lightbox rendered photo with smooth navigation and close. | `TC-CHEST-05_01.png` | Lightbox modal verified. |
| `TC-CHEST-06` | Unauthenticated Guest Unlock Token | Letter sent to external email | 1. Open `/unlock/:token` in incognito browser | Letter unboxes without login; displays CTA banner to join crew. | **PASS** | Guest recipient accessed letter unboxing without authentication. | `TC-CHEST-06_01.png` | Guest token unlock verified. |

---

### Module 6: Grand Line Public Noticeboard (TC-NOTICE)

| Test ID | Title | Preconditions | Steps | Expected Result | Status | Actual Result | Evidence | Remarks |
|---|---|---|---|---|---|---|---|---|
| `TC-NOTICE-01` | Public Feed Isolation | Delivered public letters | 1. Navigate to `/noticeboard` | Only public delivered scrolls displayed; private letters excluded. | **PASS** | Feed displayed only letters marked with public visibility. | `TC-NOTICE-01_01.png` | Feed isolation verified. |
| `TC-NOTICE-02` | Anonymous Alias Generator | `public_anonymous` letter | 1. Inspect anonymous scroll on noticeboard | Author displayed as deterministic pirate alias (e.g. "Ghost of Jaya"). | **PASS** | Anonymous letter masked real name with pirate pseudonym. | `TC-NOTICE-02_01.png` | Alias generator verified. |
| `TC-NOTICE-03` | Feed Sorting (Recent / Likes / Voyage) | Public noticeboard | 1. Switch tabs: Recent Tides / Most Celebrated / Epic Voyages | Cards re-order dynamically according to sort criteria. | **PASS** | Feed sorting updated correctly across all three tabs. | `TC-NOTICE-03_01.png` | Sorting verified. |
| `TC-NOTICE-04` | Real-Time Keyword Search Filter | Active noticeboard | 1. Type keyword into search input | Feed filters in real-time matching subject, body, or author. | **PASS** | Instant card filtering matched search query accurately. | `TC-NOTICE-04_01.png` | Search filtering verified. |
| `TC-NOTICE-05` | Trident Salute (Likes) & Optimistic UI | Public scroll card | 1. Click trident salute button 🔱 | Counter increments immediately with pulse animation. | **PASS** | Salute counter incremented optimistically; icon animated. | `TC-NOTICE-05_01.png` | Trident salute functional. |

---

### Module 7: Wanted Poster & Profile Progression (TC-PROF)

| Test ID | Title | Preconditions | Steps | Expected Result | Status | Actual Result | Evidence | Remarks |
|---|---|---|---|---|---|---|---|---|
| `TC-PROF-01` | Pirate Rank & Bounty Calculation | User with letter history | 1. Navigate to `/profile`<br/>2. Inspect bounty and rank title | Title and bounty scale dynamically with letter activity. | **PASS** | Rank title and bounty formatted cleanly according to tier. | `TC-PROF-01_01.png` | Bounty progression verified. |
| `TC-PROF-02` | HTML5 Canvas Wanted Poster Generation | Authenticated user | 1. Click "Download Poster (PNG)" | 1200x1600px Canvas renders parchment, portrait, and bounty. | **PASS** | Canvas generated complete Wanted Poster PNG with custom styling. | `TC-PROF-02_01.png` | Poster export functional. |
| `TC-PROF-03` | Long Username Canvas Auto-Fit | User with >18 char name | 1. Generate poster canvas | Font size automatically scales down to fit within frame borders. | **PASS** | Long username auto-fitted neatly within banner borders. | `TC-PROF-03_01.png` | Auto-scaling logic verified. |
| `TC-PROF-04` | Web Share API Integration | Supported device / browser | 1. Click "Share" button on poster | Native Web Share triggered or fallback download triggered. | **PASS** | Share action invoked share dialog / fallback download properly. | `TC-PROF-04_01.png` | Web Share verified. |
| `TC-PROF-05` | Avatar Image Upload | Cloudinary configured | 1. Click "Change Portrait"<br/>2. Upload new image | Avatar image uploaded and updated across header and profile. | **PASS** | Profile portrait updated and rendered immediately. | `TC-PROF-05_01.png` | Avatar upload verified. |

---

### Module 8: Security, Route Guards & UI Resilience (TC-SEC)

| Test ID | Title | Preconditions | Steps | Expected Result | Status | Actual Result | Evidence | Remarks |
|---|---|---|---|---|---|---|---|---|
| `TC-SEC-02` | Direct Route Hijack Prevention | Unauthenticated visitor | 1. Direct browser navigation to `/write`, `/log`, `/profile` | `RequireAuth` redirects to `/login` preserving intended destination. | **PASS** | Direct access blocked; redirected to `/login` with return state. | `TC-SEC-02_01.png` | Route guard active. |
| `TC-SEC-05` | XSS Attack Injection in TipTap Editor | User composing letter | 1. Enter malicious XSS payload (`<script>alert(1)</script>`)<br/>2. View letter | Malicious scripts stripped; rendered safely as plain text. | **PASS** | Script payload sanitized; no script execution occurred. | `TC-SEC-05_01.png` | XSS sanitization verified. |
| `TC-SEC-06` | Network Offline Banner & Reconnect | Client loaded | 1. Emulate offline network state | "Lost at Sea" banner displays; auto-dismisses on reconnect. | **PASS** | Offline alert appeared on network disconnect and cleared on reconnect. | `TC-SEC-06_01.png` | Offline resilience verified. |

---

## Section B: Non-UI Staging Testing (API & Security Matrix)

### Staging API Verification, Rate Limiting & Overdue Sweeps

| Test ID | Title | Preconditions | Steps | Expected Result | Status | Actual Result | Evidence | Remarks |
|---|---|---|---|---|---|---|---|---|
| `TC-AUTH-07` | Single-Flight Silent Token Refresh | Active staging session with expired access token | 1. Fire concurrent API calls with expired token<br/>2. Inspect network tab | Axios interceptor triggers single `/auth/refresh` request; all calls resolve seamlessly. | **PASS** | Single refresh request fired; parallel API calls completed with 200 OK. | `TC-AUTH-07_Staging_01.png` | Token refresh lock verified. |
| `TC-VOYAGE-03` | 24-Hour Lock Enforcement (Post-Lock) | Letter delivery <24h away | 1. Dispatch PATCH / DELETE API call to `/api/letters/:id` | API returns 423 Locked ("This chest is already sealed for delivery"). | **PASS** | API returned HTTP 423 Locked status with error payload. | `TC-VOYAGE-03_Staging_01.png` | 24-hour edit lock enforced by API. |
| `TC-VOYAGE-04` | Automated Delivery Sweep (Cron / Middleware) | Overdue letter on Staging | 1. Trigger health check or API request tick to staging server | Overdue letter transitions atomically from `sailing` to `delivered`. | **PASS** | Letter status updated to `delivered` with valid `deliveredAt` timestamp. | `TC-VOYAGE-04_Staging_01.png` | Overdue sweep verified on staging. |
| `TC-VOYAGE-05` | Delivery Idempotency Guarantee | Overdue letter | 1. Send concurrent sweep requests to staging API | Exactly one delivery transition occurs; duplicate deliveries prevented. | **PASS** | Only one transition recorded; duplicate execution prevented. | `TC-VOYAGE-05_Staging_01.png` | Delivery idempotency verified. |
| `TC-SEC-01` | Sealed Letter Body Redaction | Sealed letter on Staging | 1. Send GET request to `/api/letters` for sailing letter | Response payload contains `body: ""` and `attachments: []`. | **PASS** | Sealed letter response verified with empty body and empty attachments. | `TC-SEC-01_Staging_01.png` | Payload redaction verified. |
| `TC-SEC-03` | Cross-Account Letter Access Block | User A & User B on Staging | 1. User B requests User A's private letter via API | API returns HTTP 403 Forbidden. | **PASS** | API returned HTTP 403 Forbidden ("Captain, this chest isn't yours to open"). | `TC-SEC-03_Staging_01.png` | Cross-account access denied. |
| `TC-SEC-04` | Auth Rate Limiting Defense | Staging API endpoint | 1. Send >30 rapid login attempts from same IP | API returns HTTP 429 Too Many Requests. | **PASS** | Staging API returned HTTP 429 after exceeding rate limit window. | `TC-SEC-04_Staging_01.png` | Rate limiter defense verified. |
