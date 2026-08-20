# 🏴‍☠️ Shipped Features Log

This document tracks all completed and shipped features for HeyFutureJasmine!.

---

### HFJ-001: Public Noticeboard Feed & Trident Salute System (Sprint 1)
- **Delivered Public Feed:** Added `GET /api/letters/public` with sorting (`recent`, `most_liked`, `long_journey`). Only delivered public letters are showcased.
- **Trident Salutes:** Added `POST /api/letters/:id/like` with animated `TridentButton` and optimistic `localStorage` cache.
- **Privacy & Anonymity:** Implemented automatic pirate alias generator (`Ghost of Jaya`, etc.) for `public_anonymous` letters.
- **Client Noticeboard:** Implemented masonry scroll feed at `/noticeboard` with search, filtering, and theme accents.

