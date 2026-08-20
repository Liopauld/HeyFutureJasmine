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

