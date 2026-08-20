# 🏴‍☠️ Shipped Features Log

This document tracks all completed and shipped features for HeyFutureJasmine!.

---

### HFJ-001: Public Noticeboard Feed & Trident Salute System (Sprint 1)
- **Delivered Public Feed:** Added `GET /api/letters/public` with sorting (`recent`, `most_liked`, `long_journey`). Only delivered public letters are showcased.
- **Trident Salutes:** Added `POST /api/letters/:id/like` with animated `TridentButton` and optimistic `localStorage` cache.
- **Privacy & Anonymity:** Implemented automatic pirate alias generator (`Ghost of Jaya`, etc.) for `public_anonymous` letters.
- **Client Noticeboard:** Implemented masonry scroll feed at `/noticeboard` with search, filtering, and theme accents.
### HFJ-002: Arbitrary External Recipient Flow & Guest Unlock Link (Sprint 1)
- **External Email Recipient:** Added support for `letterType: "other"` allowing letters to be sent to any external email address with UUIDv4 `unlockToken`.
- **Guest Single-Use Unlock:** Added unauthenticated `/unlock/:token` endpoint and reveal ceremony page with registration banner.
- **Crew Contact Book Integration:** Added 'Add to Crew' option when writing to external recipients, automatically persisting contacts to MongoDB.
### HFJ-003: Admin SuperPeek & Dev Letter Inspector (Sprint 1)
- **SuperPeek Endpoint:** Added `GET /api/dev/peek/:id` enabled only in non-production environments (`ENABLE_DEV_ROUTES=true`) to preview sealed letters unredacted without modifying delivery timestamps or database state.
- **Client DevInspectorBar:** Added floating developer bar with 1-click MongoDB reliability sweep trigger and dev tools status.
- **LetterCard SuperPeek Button:** Integrated instant SuperPeek drawer/modal in dev mode directly from Captain's Log.
- **E2E Smoke Tests:** Added automated assertions in `smoke.js` validating SuperPeek payload and database immutability.
### HFJ-004: Pirate Rank Progression & Bounty Showcase (Sprint 1)
- **Rank Tier Calculation:** Configured dynamic pirate titles and bounty scaling: Landlubber (฿0), Rookie Pirate (฿1,000,000), Sea Dog (฿50,000,000), Warlord of Letters (฿300,000,000), Yonko Scribe (฿1,000,000,000), Pirate King (฿1,500,000,000).
- **Auto-Sync:** User profile in MongoDB automatically syncs bounty and title whenever letters are sealed or deleted.
- **Wanted Poster UI:** Implemented authentic 'DEAD OR ALIVE' poster on `/profile` with portrait upload, golden bounty counter, and visual rank tier guide.
- **Navbar Badge:** Displayed active pirate title pill directly in navigation bar.
### HFJ-005: 24-Hour Edit Lock & End-to-End Suite (Sprint 1)
- **Lock Window Security:** Enforced strict HTTP 423 Locked responses across `GET /:id/edit`, `PATCH /:id`, and `DELETE /:id` when within 24 hours of scheduled `deliveryDate`.
- **UI Lock Feedback:** Displayed '🔒 Locked (<24h)' badge on Captain's Log cards and rich seafaring notification banner on `/write/:id/edit`.
- **Comprehensive E2E Suite:** Built 43-point in-memory automated smoke test suite in `server/src/scripts/smoke.js` exercising 100% of auth, pairing, locking, external delivery, guest reveals, dev inspector, and sweep fallbacks.
### HFJ-006: Offline Caching & Add to Home Screen Support (Sprint 2)
- **Service Worker Caching:** Implemented `sw.js` with static asset pre-caching, cache-first strategies for fonts and media, and network-first navigation with offline fallback.
- **Progressive Web App Manifest:** Configured `site.webmanifest` with standalone display mode, theme colors (`#150C22`), and SVG/PNG icon sets for iOS and Android home screen installation.
### HFJ-007: Atmospheric Ocean Sounds & Reveal Audio (Sprint 2)
- **Procedural Web Audio Engine:** Implemented zero-dependency procedural audio synthesis in `soundEffects.js` generating ocean surf wash and creaking golden treasure chime on chest opening.
- **Audio Controls:** Built persistent `AmbientAudio.jsx` toggle in `Navbar.jsx` supporting mute preferences in `localStorage` with mobile Safari autoplay safety.
- **Treasure Ceremony Hook:** Integrated reveal audio trigger into `TreasureChest.jsx` when opening unboxed time capsules.
### HFJ-008: Grand Line Partner Pairing & Pairing Code Exchange (Sprint 3)
- **Pairing System:** Built 8-character uppercase pairing code generation and bidirectional account linking with self-pairing and duplicate consumption guards.
- **Client PartnerPairCard:** Added dedicated `PartnerPairCard.jsx` and segmented `CodeInput.jsx` on `/profile` with copy-to-clipboard, live pairing badges, partner stats, and unpairing confirmation.
### HFJ-009: Saved Crew Management & Address Book (Sprint 3)
- **Crew Contacts API:** Added `POST /api/users/me/crew` and `DELETE /api/users/me/crew/:id` with duplicate email validation.
- **Profile CrewManager:** Built `CrewManager.jsx` allowing users to save and delete recurring contacts directly from settings.
- **Reactive Recipient Picker:** Wired `useCrew` hook into `RecipientPicker.jsx` for 1-click quick-picking saved contacts during letter composition.
- **E2E Smoke Tests:** Added CRUD assertions and duplicate prevention checks in `smoke.js`.
### HFJ-010: Shared Anniversary & Couple Capsule Milestones (Sprint 3)
- **Shared Anniversary Sync:** Updating anniversary date automatically synchronizes the date with the paired partner in MongoDB.
- **Countdown Widget:** Added live anniversary countdown widget in `PartnerPairCard.jsx` showing days until next shared milestone.
- **Composer Milestone Presets:** Added 'On Our Next Anniversary' 1-click preset button in `DeliveryDatePicker.jsx`.
- **Couple Capsule Ribbon:** Added '💖 Crew of Two' badge to partner and shared capsules in `LetterCard.jsx`.
### HFJ-011: In-Browser Voice Memo Recording & Audio Waveform Visualizer (Sprint 4)
- **Voice Memo Recording:** Built native in-browser voice memo recording using `MediaRecorder` API with live duration timer.
- **Waveform Canvas Visualizer:** Implemented real-time audio waveform canvas visualizer in `VoiceRecorder.jsx` using Web Audio API `AnalyserNode`.
- **Vintage Gramophone Player:** Created `GramophonePlayer.jsx` for delivered letters featuring spinning vinyl disc animation, scrub progress bar, and duration tracker.
### HFJ-012: Drag-and-Drop Photo Upload Pipeline & Cloudinary Attachment Manager (Sprint 4)
- **Photo Dropzone:** Enhanced `PhotoDropzone.jsx` with multi-image drop support, upload spinner, and thumbnail deletion.
- **Interactive Photo Lightbox:** Created `PhotoLightbox.jsx` supporting arrow key navigation, keyboard Esc shortcuts, full-screen zoom, and direct download links.
- **Chest Lightbox Integration:** Integrated click-to-open photo lightbox gallery in `TreasureChest.jsx`.
### HFJ-013: Music & Song Embed Integrations (Sprint 4)
- **Multi-Provider Song Support:** Built URL parsing and canonical iframe embeds for Spotify, YouTube, and Apple Music in `song.js`.
- **Composer Song Preview:** Enhanced `SongInput.jsx` with automatic provider detection, title/artist tagging, and instant preview pills.
- **Chest Soundtrack Player:** Rendered embedded responsive audio player widget at the top of delivered treasure chests in `TreasureChest.jsx`.
### HFJ-014: Cinematic 3D Treasure Chest Unboxing & Confetti Ceremony (Sprint 5)
- **3D Chest Animation:** Created `TreasureChest3D.jsx` featuring dynamic perspective transforms, rotating key-unlock effects, and theme-matching particle bursts.
- **Canvas Confetti Launcher:** Built `GoldConfetti.jsx` launching a celebratory multi-colored golden confetti shower when unboxing delivered letters.
### HFJ-015: 'Reply to the Past' Letter Chain & Response Threading (Sprint 5)
- **Letter Threading API:** Enabled `replyTo` relationship tracking and populated thread previews with parent letter subject and sender details.
- **Composer Reply Banner:** Added `location.state.replyTo` handling with an informative link banner and unlink capability in `WriteLetter.jsx`.
- **Delivered Thread Viewer:** Created `LetterThreadCard.jsx` displaying the linked past time capsule with 1-click navigation in `TreasureChest.jsx`.
### HFJ-016: Interactive Canvas Wanted Poster PNG Card Exporter (Sprint 5)
- **Canvas Poster Generator:** Created `canvasPosterExport.js` rendering a 1200x1600 high-res authentic One Piece wanted poster with user avatar, title, and formatted bounty.
- **Direct Download & Web Share:** Added 1-click 'Download Poster (PNG)' button and mobile Web Share API integration in `Profile.jsx`.
- **E2E Smoke Tests:** Retained full green status across 59/59 in-memory assertions.






