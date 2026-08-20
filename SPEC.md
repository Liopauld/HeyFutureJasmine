# 🏴‍☠️ HeyFutureJasmine! — Full-Stack Technical Specification

**Document Version:** 1.0.0  
**Status:** Active Specification  
**Tech Stack:** React 18 + Vite | Node.js 20+ Express | MongoDB (Mongoose 8+) | Redis + BullMQ | Cloudinary | Resend  

---

## 1. System Overview

**HeyFutureJasmine!** is a full-stack time-capsule web application themed around *One Piece*. Users write letters to their future selves, their partners, or external recipients, seal them inside customized "Treasure Chests," and schedule them to journey across the tides of time to be delivered at a specific future date.

### Core Lifecycle Flow:
1. **Compose & Attach:** User writes rich-text letter via TipTap on parchment paper, attaches photos, records voice notes, and selects optional song embeds.
2. **Seal & Schedule:** User selects recipient (Self, Paired Partner, or External Email), chooses a delivery date, sets visibility (`private` vs. `public_anonymous`/`public_named`), and selects a 3D Chest Theme.
3. **Sailing Period:** Letter is sealed. The content is cryptographically redacted/hidden from both the sender and recipient until delivery.
4. **24-Hour Lock:** Once a letter is within 24 hours of delivery, it is locked against edits or cancellations.
5. **Delivery:** BullMQ (backed by Redis) and a redundant MongoDB Sweep Engine automatically mark the letter as `delivered` on the scheduled date and dispatch email notifications via Resend.
6. **Reveal:** Recipient (or external recipient using a single-use `unlockToken`) opens the chest with a cinematic "chest washed ashore" 3D opening animation.
7. **Public Noticeboard:** Delivered public letters are showcased on a masonry noticeboard with Trident ("🔱") like interactions.

---

## 2. System Architecture

```
                               ┌────────────────────────────────────────┐
                               │           React 18 + Vite SPA          │
                               │  (Tailwind, TanStack Query, Framer)   │
                               └───────────────────┬────────────────────┘
                                                   │ HTTPS / REST JSON
                                                   ▼
                               ┌────────────────────────────────────────┐
                               │           Express.js API Server        │
                               │  (JWT Auth, Rate Limit, DOMPurify)     │
                               └───────┬───────────┬────────────┬───────┘
                                       │           │            │
            ┌──────────────────────────┼───────────┴─────────┐  │
            │                          │                     │  │
            ▼                          ▼                     ▼  ▼
 ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
 │  MongoDB Database  │     │   Redis + BullMQ   │     │  External Services │
 │ (Mongoose Models)  │     │  (Delivery Queue)  │     │ Resend, Cloudinary │
 └────────────────────┘     └────────────────────┘     └────────────────────┘
```

---

## 3. Database Models (MongoDB / Mongoose)

### 3.1. User Model (`server/src/models/User.js`)

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto, Primary Key | Unique user identifier |
| `username` | String | Required, Unique, Trim, min 3, max 30 | Unique handle |
| `displayName` | String | Trim, max 40 | Friendly display name (defaults to username) |
| `email` | String | Required, Unique, Lowercase, Indexed | User email address |
| `passwordHash` | String | Required | bcrypt hashed password |
| `pirateTitle` | String | Default: `"Rookie Pirate"` | Gamified rank title |
| `bounty` | Number | Default: `0` | Calculated pirate bounty |
| `avatar` | Object | `{ url: String, publicId: String }` | Cloudinary avatar image |
| `partner` | ObjectId | Ref: `User`, Default: `null` | Paired partner reference |
| `partnerInviteCode` | String | Unique, Sparse | 8-character pairing code |
| `anniversary` | Date | Optional | Couple milestone / anniversary date |
| `crewMembers` | Array | `[{ name: String, email: String }]` | Saved recipient contacts |
| `refreshTokens` | Array | `[String]` | Active refresh token hashes |
| `emailVerified` | Boolean | Default: `false` | Email verification status |
| `emailVerificationToken` | String | Optional | 24-hour verification token |
| `passwordResetToken` | String | Optional | 1-hour password reset token |
| `passwordResetExpires` | Date | Optional | Expiration timestamp for reset token |
| `createdAt` / `updatedAt` | Date | Timestamps | Document timestamps |

### 3.2. Letter Model (`server/src/models/Letter.js`)

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto, Primary Key | Unique letter identifier |
| `sender` | ObjectId | Ref: `User`, Required, Indexed | Sender reference |
| `letterType` | String | Enum: `["self", "partner", "us", "other"]`, Default: `"self"` | Letter recipient category |
| `isSelfLetter` | Boolean | Default: `true` | Boolean flag for backwards compatibility |
| `recipientEmail` | String | Required, Lowercase, Indexed | Destination email |
| `recipientName` | String | Default: `""` | Recipient display name |
| `subject` | String | Max: 200, Default: `"A Treasure From Your Past"` | Letter title |
| `body` | String | Required, Max: 50,000 | Sanitized HTML content from TipTap |
| `attachments` | [ObjectId] | Ref: `Attachment` | Linked photo/audio attachment IDs |
| `song` | Object | `{ provider, url, title, artist }` | Embedded song metadata |
| `replyTo` | ObjectId | Ref: `Letter`, Default: `null` | Reference to original delivered letter |
| `deliveryDate` | Date | Required, Indexed | Exact scheduled delivery timestamp |
| `sentAt` | Date | Default: `Date.now` | Date when letter was sealed |
| `deliveredAt` | Date | Optional | Date when actually delivered |
| `openedAt` | Date | Optional | Timestamp when recipient first opened chest |
| `status` | String | Enum: `["sealed", "sailing", "delivered", "failed"]`, Indexed | Current lifecycle state |
| `visibility` | String | Enum: `["private", "public_anonymous", "public_named"]`, Default: `"private"` | Noticeboard visibility |
| `likes` | Number | Default: `0` | Trident likes for public letters |
| `unlockToken` | String | Unique, Sparse | UUIDv4 single-use token for non-registered recipients |
| `jobId` | String | Optional | BullMQ delayed job ID |
| `capsuleTheme` | String | Enum: `["default", "gold", "scroll", "davy_jones", "alabasta", "skypiea"]` | Visual theme |
| `createdAt` / `updatedAt` | Date | Timestamps | Document timestamps |

**Indexes:**
- `{ deliveryDate: 1, status: 1 }` (Critical for delivery sweep query)
- `{ sender: 1, createdAt: -1 }`
- `{ recipientEmail: 1, status: 1 }`
- `{ visibility: 1, status: 1, deliveredAt: -1 }` (Noticeboard feed)

### 3.3. Attachment Model (`server/src/models/Attachment.js`)

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto, Primary Key | Unique attachment identifier |
| `letter` | ObjectId | Ref: `Letter`, Indexed | Associated letter ID |
| `uploader` | ObjectId | Ref: `User`, Required, Indexed | Uploader user ID |
| `cloudinaryPublicId` | String | Required | Cloudinary asset identifier |
| `url` | String | Required | Standard URL |
| `secureUrl` | String | Required | HTTPS asset URL |
| `resourceType` | String | Enum: `["image", "video", "raw", "audio"]` | Media type |
| `originalName` | String | Optional | Original filename |
| `fileSize` | Number | Optional | File size in bytes |
| `format` | String | Optional | File extension (webp, mp3, etc.) |

---

## 4. REST API Specifications

### 4.1. Authentication Routes (`/api/auth`)

| Method | Path | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | None | Strict (10/hr) | Register account, dispatch verification email |
| `POST` | `/api/auth/login` | None | Strict (20/15m) | Authenticate user, return access token + refresh cookie |
| `POST` | `/api/auth/logout` | Optional | Standard | Invalidate refresh token and clear cookie |
| `POST` | `/api/auth/refresh` | Cookie | Standard | Issue fresh access token via refresh token rotation |
| `GET` | `/api/auth/verify-email/:token` | None | Standard | Mark email as verified |
| `POST` | `/api/auth/forgot-password` | None | Strict (5/hr) | Generate password reset token and dispatch email |
| `POST` | `/api/auth/reset-password/:token` | None | Strict (5/hr) | Update password hash using valid reset token |

### 4.2. Letter Routes (`/api/letters`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/letters` | Required | Create and seal letter; schedule BullMQ job |
| `GET` | `/api/letters` | Required | Retrieve user's letters (sent + received; sealed bodies redacted) |
| `GET` | `/api/letters/public` | None | Public noticeboard feed (only delivered public letters) |
| `GET` | `/api/letters/:id` | Required | Fetch specific letter details (access restricted to sender/recipient) |
| `GET` | `/api/letters/:id/edit` | Required | Fetch letter for editing (only if >24h before delivery) |
| `PATCH` | `/api/letters/:id` | Required | Update letter content/date (forbidden within 24h of delivery) |
| `DELETE` | `/api/letters/:id` | Required | Delete letter and cancel BullMQ scheduled job |
| `GET` | `/api/letters/unlock/:token`| None | Fetch delivered letter via single-use guest token |
| `POST` | `/api/letters/:id/like` | None | Increment Trident like counter on public delivered letters |

### 4.3. Upload Routes (`/api/uploads`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/uploads` | Required | Stream file (photo/voice memo) to Cloudinary via Multer memory buffer |
| `DELETE` | `/api/uploads/:id` | Required | Remove attachment from Cloudinary and database |

### 4.4. User & Crew Routes (`/api/users`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Required | Current user profile, rank, bounty, partner status |
| `PATCH` | `/api/users/me` | Required | Update username, displayName, anniversary date |
| `POST` | `/api/users/me/avatar` | Required | Upload and update Wanted Poster avatar |
| `POST` | `/api/users/partner/invite` | Required | Generate single-use 8-character partner pairing code |
| `POST` | `/api/users/partner/pair` | Required | Redeem partner invite code to link accounts |
| `POST` | `/api/users/partner/unpair` | Required | Disconnect partner relationship |
| `GET` | `/api/users/me/crew` | Required | Fetch saved recipient crew contacts |
| `POST` | `/api/users/me/crew` | Required | Add contact to saved crew |
| `DELETE` | `/api/users/me/crew/:id` | Required | Remove crew contact |

### 4.5. Dev Testing Routes (`/api/dev` - Dev/Staging Only)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/dev/deliver/:id` | Required (Sender) | Force immediate delivery of a sealed letter for UI testing |
| `POST` | `/api/dev/sweep` | Required | Manually trigger delivery sweep for overdue letters |

---

## 5. Letter Scheduling & Delivery Engine

### 5.1. Primary Engine: BullMQ + Redis
- Letters scheduled with delay: `delay = new Date(deliveryDate).getTime() - Date.now()`.
- Job ID format: `letter-${letter._id}` (allows deterministic job cancellation on letter deletion).
- Automatic retry with exponential backoff (3 attempts, backoff delay 60s).

### 5.2. Redundant Fail-Safe: Cron & Request Sweep
- If Redis is unavailable or a job fails to execute, a secondary sweep runs every 5 minutes (`node-cron`).
- Additionally, `sweepOnRequest` middleware throttles a lightweight sweep check during active user traffic.
- Query: `Letter.find({ status: "sealed", deliveryDate: { $lte: new Date() } })`.
- Updates status to `"delivered"`, populates `deliveredAt`, and sends delivery notification email via Resend.

---

## 6. Security & Data Protection Invariants

1. **Sealed Letter Privacy (Zero Knowledge Pre-Delivery):**
   - Under no circumstances is a sealed letter's `body`, `attachments`, or `song` exposed via the API to recipients or public feeds before `deliveryDate`.
   - `buildLetterPreview` helper enforces `redactBody: true` on all sealed chests.
2. **24-Hour Lock Window:**
   - Letters cannot be edited (`PATCH`), retrieved in cleartext for editing (`GET /:id/edit`), or deleted (`DELETE`) once `Date.now() >= deliveryDate - 24 hours` (returns HTTP `423 Locked`).
3. **Server-Side HTML Sanitization:**
   - All rich-text inputs are sanitized server-side with `isomorphic-dompurify` prior to database persistence.
4. **Token Security:**
   - Passwords hashed with `bcryptjs` (salt rounds: 12).
   - Access tokens (15m expiry) stored in memory / Zustand store.
   - Refresh tokens (7d expiry) sent via `httpOnly`, `SameSite=Lax`, `Secure` cookies with DB rotation.
   - Non-user unlock tokens use cryptographically random UUIDv4 strings.

---

## 7. Frontend Pages & Routing

```
/                             -> Landing Page (Hero, Feature Chests, Noticeboard CTA)
/login                        -> Pirate Login (Email/Password)
/register                     -> Pirate Registration
/forgot-password              -> Password Reset Request
/reset-password/:token        -> Password Reset Submission
/verify-email/:token          -> Email Verification Landing
/unlock/:token                -> Guest Single-Use Reveal Page (External Recipient)

[Protected Routes]
/write                        -> Write & Seal Letter (TipTap, Voice, Photo, Song, Themes)
/write/:id/edit               -> Edit Existing Sealed Letter (>24h remaining)
/log                          -> Captain's Log Dashboard (Sealed, Delivered, Partner Tabs)
/treasure/:id                 -> Cinematic 3D Chest Reveal Ceremony
/noticeboard                  -> Public Noticeboard Feed (Masonry Grid, Likes)
/profile                      -> Wanted Poster Profile (Stats, Bounty, Partner Pairing)
```

---

## 8. Third-Party Integrations & Environment Variables

```env
# Server (.env)
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/heyfuturejasmine
JWT_ACCESS_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=HeyFutureJasmine <no-reply@heyfuturejasmine.app>
ENABLE_DEV_ROUTES=true

# Client (.env)
VITE_API_URL=http://localhost:5001/api
```
