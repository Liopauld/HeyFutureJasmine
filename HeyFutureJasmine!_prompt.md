# 🏴‍☠️ HeyFutureJasmine! — Full-Stack App Build Prompt

> **One Piece–themed time capsule letter app** where users seal letters as "treasures" that are delivered at a future date — to themselves or others. Built web-first with a clean architecture that can be ported to iOS (React Native) later.

---

## 🌊 APP OVERVIEW

**App Name:** HeyFutureJasmine!
**Tagline:** *"Seal your treasure. Set it sail. Let the tides deliver it."*  
**Inspired by:** [FutureMe.org](https://www.futureme.org)  
**Theme:** One Piece anime — letters are treasures locked in chests, journeying across the Grand Line of time to reach their recipient on the destined day.

### Core Concept
Users write letters ("Treasure Letters") and seal them into a "Treasure Chest" with a lock date. On that date, the recipient (self or another person) receives the letter via email — and can view it in-app — as if a chest finally washed ashore. Letters can carry text, images, and files. They can be private, or shared anonymously to a public feed called the **"Pirate's Noticeboard."**

---

## 🧱 TECH STACK

### Frontend (Web — iOS-compatible architecture)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v3 + CSS Variables for theme tokens
- **Routing:** React Router v6
- **State / Data Fetching:** TanStack Query (React Query) v5
- **Forms:** React Hook Form + Zod validation
- **Rich Text Editor:** TipTap (extensible, works in React Native later)
- **Animation:** Framer Motion
- **Date Picker:** React DayPicker
- **File Upload UI:** React Dropzone
- **Toast Notifications:** Sonner
- **Icons:** Lucide React
- **Fonts (Google Fonts):**
  - Display: `"Pirata One"` (One Piece pirate feel, used for headings)
  - Body: `"Crimson Pro"` (elegant, parchment-like serif)
  - UI: `"DM Sans"` (clean, readable sans for buttons, labels)

### Backend (Node.js API)
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database ORM:** Mongoose 8+
- **Database:** MongoDB Atlas (cloud) or local MongoDB
- **Media Storage:** Cloudinary (images, attachments, video)
- **Authentication:** JWT (access + refresh tokens) + bcryptjs
- **Email Delivery:** Resend (or Nodemailer with SMTP fallback)
- **Job Scheduling:** BullMQ + Redis (for timed letter delivery)
- **Validation:** Zod (shared with frontend)
- **File Upload Middleware:** Multer → Cloudinary stream
- **Environment Config:** dotenv
- **Rate Limiting:** express-rate-limit

### Infrastructure / DevOps
- **Containerization:** Docker Compose (Node + Redis)
- **Hosting suggestion:** Railway (backend) + Vercel (frontend)
- **CI/CD:** GitHub Actions (optional scaffolding)

### iOS Path (Future)
- Shared Zod schemas and API contracts between web and React Native
- TipTap has a React Native version for the editor
- Use Expo (managed workflow) for the iOS app targeting the same REST API
- JWT auth tokens stored in Expo SecureStore

---

## 📁 FOLDER STRUCTURE

```
HeyFutureJasmine!
├── client/                        # React + Vite frontend
│   ├── public/
│   │   └── assets/                # Static images, One Piece textures
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Button, Input, Modal, Badge, etc.
│   │   │   ├── letter/            # LetterEditor, LetterCard, TreasureChest
│   │   │   ├── layout/            # Navbar, Sidebar, PageWrapper
│   │   │   └── common/            # Avatar, LoadingAnchor, EmptyState
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── WriteLetter.jsx    # Compose new letter
│   │   │   ├── CaptainsLog.jsx    # Dashboard (sent + received)
│   │   │   ├── TreasureChest.jsx  # View unlocked letter
│   │   │   ├── Noticeboard.jsx    # Public anonymous letters feed
│   │   │   ├── Profile.jsx        # Wanted Poster profile page
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── hooks/
│   │   │   ├── useLetters.js
│   │   │   ├── useAuth.js
│   │   │   └── useUpload.js
│   │   ├── lib/
│   │   │   ├── api.js             # Axios instance with auth interceptors
│   │   │   ├── cloudinary.js      # Upload helpers
│   │   │   └── schemas.js         # Shared Zod schemas
│   │   ├── store/
│   │   │   └── authStore.js       # Zustand auth state
│   │   ├── styles/
│   │   │   ├── globals.css        # CSS variables, base styles
│   │   │   └── theme.js           # Tailwind theme extension
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                        # Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── letterController.js
│   │   │   ├── uploadController.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Letter.js
│   │   │   └── Attachment.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── letters.js
│   │   │   ├── uploads.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verify middleware
│   │   │   ├── rateLimiter.js
│   │   │   └── errorHandler.js
│   │   ├── jobs/
│   │   │   ├── letterQueue.js     # BullMQ queue definition
│   │   │   └── letterWorker.js    # Worker: sends email on unlock date
│   │   ├── services/
│   │   │   ├── emailService.js    # Resend integration
│   │   │   ├── cloudinaryService.js
│   │   │   └── letterService.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── hash.js
│   │   │   └── dateUtils.js
│   │   └── app.js
│   ├── index.js                   # Entry point
│   └── .env.example
│
├── shared/
│   └── schemas/                   # Zod schemas shared across client/server
│       ├── letterSchema.js
│       └── userSchema.js
│
├── docker-compose.yml
└── README.md
```

---

## 🗃️ MONGODB SCHEMAS

### 1. User Model (`/server/src/models/User.js`)

```js
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  // "Wanted Poster" profile
  pirateTitle: {
    type: String,
    default: "Rookie Pirate",   // upgrades as user sends more letters
    // Examples: "Rookie Pirate" → "Sea Dog" → "Warlord" → "Emperor"
  },
  bounty: {
    type: Number,
    default: 0,                 // increases with each letter sent
  },
  avatar: {
    url: String,                // Cloudinary URL
    publicId: String            // Cloudinary public_id for deletion
  },
  crewMembers: [{               // saved recipient contacts
    name: String,
    email: String
  }],
  refreshTokens: [String],      // for refresh token rotation
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });
```

### 2. Letter Model (`/server/src/models/Letter.js`)

```js
const LetterSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Recipient can be self or another person
  recipientEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  recipientName: {
    type: String,
    default: ""
  },
  isSelfLetter: {
    type: Boolean,
    default: true
  },
  // The letter content
  subject: {
    type: String,
    default: "A Treasure From Your Past"
  },
  body: {
    type: String,              // HTML string from TipTap editor
    required: true,
    maxlength: 50000
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attachment"
  }],
  // Timing
  deliveryDate: {
    type: Date,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: Date,           // set when actually delivered
  // Status
  status: {
    type: String,
    enum: ["sealed", "sailing", "delivered", "failed"],
    default: "sealed"
    // sealed   = waiting, not yet time
    // sailing  = delivery queued (within 24h of delivery date)
    // delivered = email sent + viewable
    // failed   = delivery error
  },
  // Visibility
  visibility: {
    type: String,
    enum: ["private", "public_anonymous", "public_named"],
    default: "private"
  },
  // One-time unlock token for recipients not on the platform
  unlockToken: {
    type: String,
    unique: true,
    sparse: true
  },
  // BullMQ job ID for cancellation
  jobId: String,
  // Social
  likes: {
    type: Number,
    default: 0
  },
  // Capsule "theme" — visual style for the treasure chest
  capsuleTheme: {
    type: String,
    enum: [
      "default",        // classic wooden chest
      "gold",           // golden treasure chest
      "scroll",         // ancient scroll in a bottle
      "davy_jones",     // dark, deep sea chest
      "alabasta",       // desert/sandstone chest
      "skypiea",        // golden celestial chest
    ],
    default: "default"
  }
}, { timestamps: true });

// Index for the delivery job worker
LetterSchema.index({ deliveryDate: 1, status: 1 });
LetterSchema.index({ sender: 1 });
LetterSchema.index({ recipientEmail: 1 });
```

### 3. Attachment Model (`/server/src/models/Attachment.js`)

```js
const AttachmentSchema = new mongoose.Schema({
  letter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Letter"
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  secureUrl: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    enum: ["image", "video", "raw"],  // Cloudinary resource types
    required: true
  },
  originalName: String,
  fileSize: Number,              // bytes
  format: String,                // jpg, png, pdf, mp4, etc.
}, { timestamps: true });
```

---

## 🔌 REST API ENDPOINTS

### Auth Routes — `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register new user, send verification email |
| POST | `/login` | Login, return access + refresh tokens |
| POST | `/logout` | Invalidate refresh token |
| POST | `/refresh` | Get new access token via refresh token |
| GET | `/verify-email/:token` | Verify email address |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password/:token` | Reset password |

### Letter Routes — `/api/letters`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | ✅ | Create & seal a new letter |
| GET | `/` | ✅ | Get all letters for current user (sent + received) |
| GET | `/public` | ❌ | Get public anonymous letters feed |
| GET | `/:id` | ✅ | Get letter by ID (with access check) |
| GET | `/unlock/:token` | ❌ | Unlock letter via one-time token (for non-users) |
| PATCH | `/:id` | ✅ | Edit a letter (only if not yet delivered) |
| DELETE | `/:id` | ✅ | Delete a letter (cancels delivery job) |
| POST | `/:id/like` | ❌ | Like a public letter |

### Upload Routes — `/api/uploads`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | ✅ | Upload file to Cloudinary, return attachment doc |
| DELETE | `/:id` | ✅ | Delete attachment from Cloudinary + DB |

### User Routes — `/api/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | ✅ | Get current user profile |
| PATCH | `/me` | ✅ | Update profile (username, pirateTitle) |
| POST | `/me/avatar` | ✅ | Upload profile avatar |
| GET | `/me/crew` | ✅ | Get saved crew members |
| POST | `/me/crew` | ✅ | Add crew member |
| DELETE | `/me/crew/:id` | ✅ | Remove crew member |

---

## ⏰ LETTER DELIVERY JOB SYSTEM (BullMQ)

### Overview
When a letter is created, a BullMQ job is scheduled with a delay equal to `deliveryDate - now`. Redis persists the queue across restarts. On execution, the worker sends the email and updates the letter status.

```js
// letterQueue.js
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const letterQueue = new Queue("letter-delivery", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 60000 }, // retry after 1min, 2min, 4min
    removeOnComplete: { age: 3600 },   // keep completed jobs for 1hr
    removeOnFail: { age: 86400 * 7 }   // keep failed jobs for 7 days
  }
});

// Schedule a letter delivery
export async function scheduleDelivery(letter) {
  const delay = new Date(letter.deliveryDate) - Date.now();
  if (delay <= 0) throw new Error("Delivery date must be in the future");

  const job = await letterQueue.add(
    "deliver",
    { letterId: letter._id.toString() },
    { delay, jobId: `letter-${letter._id}` }
  );
  return job.id;
}
```

```js
// letterWorker.js
import { Worker } from "bullmq";
import { Letter } from "../models/Letter.js";
import { sendLetterEmail } from "../services/emailService.js";

const worker = new Worker("letter-delivery", async (job) => {
  const { letterId } = job.data;
  const letter = await Letter.findById(letterId).populate("sender attachments");

  if (!letter || letter.status === "delivered") return;

  await sendLetterEmail(letter);

  letter.status = "delivered";
  letter.deliveredAt = new Date();
  await letter.save();
}, { connection: redisConnection });
```

---

## 🖼️ CLOUDINARY INTEGRATION

### Setup
```js
// server/src/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
```

### Upload Strategy
- Use Multer with `memoryStorage` to receive files as buffers
- Stream buffers directly to Cloudinary (no temp files on disk)
- Store returned `public_id`, `secure_url`, and `resource_type` in the Attachment model
- For images: apply Cloudinary transformations (resize, format convert to WebP)
- Organize uploads in Cloudinary folders: `HeyFutureJasmine!/avatars/` and `HeyFutureJasmine!/attachments/`

### Signed Uploads (security)
- Always upload from the **server**, not directly from the browser
- This protects your Cloudinary API secret

```js
// Upload helper
export async function uploadToCloudinary(buffer, folder, resourceType = "auto") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `HeyFutureJasmine!/${folder}`,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
        // For images: auto-optimize
        ...(resourceType === "image" && {
          transformation: [{ quality: "auto", fetch_format: "auto" }]
        })
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}
```

---

## 🎨 ONE PIECE DESIGN SYSTEM

### Color Palette (CSS Variables)
```css
:root {
  /* Primary — Deep ocean & gold */
  --color-ocean:        #0B1D2E;   /* dark navy, main background */
  --color-deep-sea:     #071322;   /* darker panels */
  --color-grand-line:   #1A3A5C;   /* card backgrounds */
  --color-gold:         #F5C518;   /* primary accent — treasure gold */
  --color-gold-light:   #FFD966;   /* hover states */
  --color-gold-dark:    #C9920A;   /* pressed states */

  /* Secondary — Straw Hat red & parchment */
  --color-straw-red:    #D4302F;   /* Luffy's hat brim — CTAs */
  --color-parchment:    #F7ECD8;   /* letter writing area bg */
  --color-parchment-dark: #E8D5B0; /* parchment borders */
  --color-ink:          #2C1A0E;   /* text on parchment */

  /* Status */
  --color-sealed:       #5B7FA6;   /* letter in transit color */
  --color-sailing:      #F5C518;   /* close to delivery */
  --color-delivered:    #3CB043;   /* delivered / opened */
  --color-failed:       #D4302F;   /* delivery failed */

  /* Text */
  --color-text-primary:   #F0E6D3;
  --color-text-secondary: #9BB5C8;
  --color-text-muted:     #5A7A90;
}
```

### Typography
```css
/* In index.html or via Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&display=swap');

.font-display  { font-family: 'Pirata One', cursive; }
.font-serif    { font-family: 'Crimson Pro', serif; }
.font-ui       { font-family: 'DM Sans', sans-serif; }
```

### UI Component Guidelines

**Treasure Chest Lock Badge** — used on every sealed letter card:
- Animated padlock icon that jiggles on hover
- Shows countdown: "Opens in 342 days" or "Opening soon!"
- Gold ring glow when within 7 days of delivery

**Letter Card (sealed):**
- Dark navy card with faded map-texture overlay (subtle CSS background image)
- Gold border on hover
- Shows: recipient, subject, delivery date, status badge
- Blurred/obscured body preview (content hidden until delivery)

**Letter Writing Area (Compose):**
- Light parchment background (`--color-parchment`)
- Slight paper texture (CSS noise filter or SVG texture)
- Ink-colored text (`--color-ink`)
- Typewriter cursor styling
- Wax seal button animation when "sealing" (submitting) the letter

**Wax Seal Button** — the submit/send CTA:
```
[🔮 SEAL & SET SAIL]
```
- Red wax seal aesthetic
- Pulse animation on hover
- On click: wax dripping animation before API call
- Shows loading state as spinning compass rose

**Timeline / Grand Line Tracker:**
- Horizontal progress bar from `sentAt` → `deliveryDate`
- Styled as a sea route on a map
- Ship icon (🚢) moves along the route based on current progress
- Islands at key milestones (25%, 50%, 75%)

**Noticeboard (public feed):**
- Letter cards displayed in a masonry grid
- Anonymous: show a random pirate name generator ("From: Ghost of Jaya") 
- Each card has a Like (🔱 Trident) counter

---

## 📧 EMAIL TEMPLATES

### 1. Letter Sealed Confirmation (sent immediately after creation)
- Subject: `"⚓ Your treasure has been sealed, Captain [Username]!"`
- Body: Confirm delivery date, recipient, and a preview of first 100 chars
- Include: "Edit or cancel" link (valid until delivery)
- One Piece themed: parchment background, map art, wax seal image

### 2. Letter Delivery Email (sent on deliveryDate)
- Subject: `"🏴‍☠️ A treasure from your past has arrived!"`
- Body: Full letter rendered in parchment HTML email
- Include: "Open your treasure chest" CTA button → links to `/treasure/:unlockToken` 
- For users: links directly to the letter in-app
- For non-users: the unlock token allows one-time viewing without registration

### 3. Verification Email
- Subject: `"Verify your log pose, Nakama!"`
- Body: Confirm email link with 24hr expiry

---

## 📱 PAGES & USER FLOWS

### 1. 🏠 Landing Page (`/`)
**Hero Section:**
- Full-screen ocean background (CSS animated waves)
- Headline: *"Seal your words. Let the tides carry them."*
- Sub: *"Write a letter to your future self or a nakama. Lock it. Set your destination. We'll deliver it when the time is right."*
- Two CTAs: `[Write a Letter]` `[Explore the Noticeboard]`

**Features Section:**
- 3 feature cards: "Write", "Seal & Set Sail", "Discover Your Treasure"
- Animated treasure chest in the "Discover" card (opens on scroll)

**Testimonials / Stats:**
- "X,XXX letters sealed" counter
- Public letter previews (anonymous)

### 2. ✍️ Write Letter (`/write`)
**Step 1 — The Letter:**
- TipTap editor on parchment background
- Toolbar: Bold, Italic, Underline, Bullet list, Quote, Heading
- Word counter (bottom right)
- "Subject" input at top (optional, defaults to "A Treasure From Your Past")

**Step 2 — The Recipient:**
- Toggle: "To myself" / "To another Nakama"
- If other: email + name input
- "Add to Crew" checkbox (saves contact)
- Crew quick-select dropdown (previously saved contacts)

**Step 3 — Set Sail Date:**
- Preset chips: `6 months` `1 year` `3 years` `5 years` `10 years`
- Custom date picker (must be at least 7 days in future)
- Grand Line preview: animated ship route visualization from today → delivery date

**Step 4 — Capsule Settings:**
- Visibility: Private / Anonymous Public / Named Public
- Chest Theme: 6 visual styles for the treasure chest
- Allow comments (if public)

**Step 5 — Seal:**
- Summary review card
- Wax seal animation
- `[🔮 SEAL & SET SAIL]` button

### 3. 📋 Captain's Log Dashboard (`/log`) — Requires Auth
**Tabs:**
- "Sealed" — letters sent, not yet delivered (locked chests)
- "Delivered" — received or sent letters that have been opened
- "From Others" — letters received from other users
- Stats: Total sealed, Delivered, Nakama count, Bounty

**Each letter card shows:**
- Chest thumbnail (themed)
- Delivery countdown or delivered date
- Status badge
- Quick actions: View (if delivered), Edit, Delete

### 4. 💌 Treasure Chest View (`/treasure/:id` or `/unlock/:token`)
- Full-screen reveal animation: chest lid opens
- Letter displayed on parchment background with sender info
- Attachment gallery below
- Share button (if public)
- "Write back" prompt (if from another user)

### 5. 🗺️ Noticeboard (`/noticeboard`)
- Masonry grid of public anonymous letters
- Filter: Recent | Most Liked | Long Journey (sorted by how far in the future it was sent)
- Search bar

### 6. 👤 Profile — Wanted Poster (`/profile`)
- Styled as a One Piece "WANTED" poster
- Shows: Avatar, username, pirate title, bounty (letters sent × weight)
- Letter stats displayed as a treasure manifest
- Edit profile inline

---

## 🔐 AUTHENTICATION FLOW

- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Refresh tokens stored in MongoDB + httpOnly cookie
- Access token stored in memory (Zustand), NOT localStorage
- Auto-refresh via Axios interceptor on 401
- Email verification required before creating letters
- Guest users can view public noticeboard; creation requires account

---

## ⚙️ ENVIRONMENT VARIABLES

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/HeyFutureJasmine!

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=no-reply@HeyFutureJasmine!.com

# Client .env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧩 KEY IMPLEMENTATION DETAILS

### 1. Letter Access Control
- Sealed letters: only the sender can view (blurred/redacted until delivery)
- Delivered letters: sender + recipient (matched by email) can view
- Public letters: anyone can view after delivery
- Admin flag: `superPeek` for debugging (dev only)

### 2. Recipient Not On Platform
- On delivery, send email with a unique `unlockToken` (UUID)
- Link: `https://HeyFutureJasmine!.com/unlock/[token]`
- Token is single-use: marks as "viewed" on first access
- Prompt: "Join the crew to send your own letters!"

### 3. Letter Edit / Cancel Rules
- Letters can be edited or cancelled up to 24 hours before delivery date
- After that, the letter is "locked" (no changes, cannot cancel)
- Show clear UI indicator: "⚠️ This letter is sealed for delivery in 18 hours. No changes possible."

### 4. Bounty / Gamification (Pirate Rank System)
| Letters Sent | Title | Bounty Display |
|---|---|---|
| 0 | Landlubber | 0 |
| 1-3 | Rookie Pirate | 1,000,000 |
| 4-10 | Sea Dog | 50,000,000 |
| 11-25 | Warlord of Letters | 300,000,000 |
| 26-50 | Yonko Scribe | 1,000,000,000 |
| 51+ | Pirate King | ??? |

### 5. Letter Body Sanitization
- Sanitize TipTap HTML output server-side with `isomorphic-dompurify` before storing in MongoDB
- Prevent XSS when rendering saved HTML content

### 6. Rate Limiting
- Letter creation: max 5 letters/hour per user
- Public noticeboard: max 100 reads/min per IP

---

## 🚀 MVP FEATURE CHECKLIST

**Must Have (v1.0):**
- [ ] User registration + login + email verification
- [ ] Write letter with TipTap editor
- [ ] Set delivery date (preset + custom)
- [ ] Send to self or others by email
- [ ] Private / public visibility
- [ ] BullMQ scheduled delivery + email send
- [ ] Captain's Log dashboard (sent/received)
- [ ] Treasure Chest reveal page
- [ ] Public Noticeboard feed
- [ ] Image attachment via Cloudinary
- [ ] One Piece design system (full theme)

**Nice to Have (v1.5):**
- [ ] Chest theme customizer (6 themes)
- [ ] Pirate rank / bounty system
- [ ] Comment on public letters
- [ ] Crew member management
- [ ] Password reset flow
- [ ] Letter delivery failure retry + notification

**Future / iOS (v2.0):**
- [ ] Migrate to React Native (Expo) using shared API
- [ ] Push notifications (Expo Notifications)
- [ ] Audio message attachment
- [ ] Video message attachment
- [ ] Group letters ("Send to the whole crew")

---

## 🏴‍☠️ TONE & COPY GUIDE

Write all UI microcopy in One Piece voice:

| Generic | HeyFutureJasmine! Version |
|---|---|
| "Send Letter" | "Set Sail" / "Seal & Set Sail" |
| "Save Draft" | "Anchor in Port" |
| "My Letters" | "Captain's Log" |
| "Received Letters" | "Treasure Found" |
| "Delete Letter" | "Send to Davy Jones" |
| "Profile" | "Wanted Poster" |
| "Contacts" | "My Crew" |
| "Loading..." | "Charting the Course..." |
| "Error" | "Taken by the Sea..." |
| "Empty state (no letters)" | "Your log is empty, Captain. Set sail on your first adventure." |
| "Letter delivered!" | "Your treasure has washed ashore!" |
| "Letter sealed!" | "Your treasure is sealed and sailing the Grand Line!" |
| "Date picker" | "Chart Your Destination" |

---

*Built with love and a dream to find the One Piece. 🏴‍☠️*
