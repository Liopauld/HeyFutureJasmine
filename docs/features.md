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
- **E2E Smoke Testing:** Added automated assertions in `smoke.js` verifying token generation, crew persistence, and unauthenticated guest unlock.
