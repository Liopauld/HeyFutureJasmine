# 🧭 Database & Migration Conventions

1. **MongoDB / Mongoose Collections**:
   - `users`: User profiles, credentials, partner pairing references, bounty and titles.
   - `letters`: Sealed and delivered time capsules. Indexed on `(deliveryDate, status)` and `(visibility, status, deliveredAt)`.
   - `attachments`: Uploaded media assets tracked via Cloudinary identifiers.

2. **Schema Invariants**:
   - Timestamping (`createdAt`, `updatedAt`) is enabled across all schemas.
   - Zero-knowledge body redaction for sealed chests prior to `deliveryDate`.
   - Sparse index for `partnerInviteCode` and `unlockToken`.
