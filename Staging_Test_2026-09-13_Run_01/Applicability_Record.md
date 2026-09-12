# 📋 QA Applicability Record — Removed Local/Unit-Only Test Cases

**Testing Run:** `Staging_Test_2026-09-13_Run_01`  
**Date:** 2026-09-13  
**Target Environment:** Deployed Staging Application  

---

## 1. Overview of Classification Policy
In accordance with QA staging execution standards, tests specifically designed for local-only harnesses, local database runners, unit functions, or development mode inspection tools are removed from the staging test execution matrix.

| Classification | Action | Description |
|---|---|---|
| **UI Testing** | **Retained** | Test cases where browser automation (Playwright) performs user actions and asserts expected results through the deployed staging UI. |
| **Non-UI Staging Testing** | **Retained** | Test cases verifying real staging behavior whose proof is outside the UI (staging API responses, rate limiter status codes, headers, cookie flags). |
| **Local/Unit-Only** | **Removed** | Unit helper test suites, local database seeding scripts, dev-only toggles, and localhost regression harnesses. |

---

## 2. Removed Test Cases & Components

| Item / Test ID | Component / Scenario | Reason for Removal | Staging Alternative |
|---|---|---|---|
| `TC-VOYAGE-06` | Dev SuperPeek Inspection Tool | **Dev-Only Tool**: `SuperPeek` is explicitly gated behind `process.env.DEV === 'true'` and is compiled out/disabled in staging production builds (`NODE_ENV=production`) to prevent security leaks. | Verify sealed letter body redaction on staging API via `TC-SEC-01`. |
| `UNIT-UTIL-01` | Date Arithmetic Helper Unit Tests (`dates.js`) | **Unit-Only**: Pure functional logic testing date milestone calculations. Does not exercise the deployed staging environment. | Verified end-to-end via UI milestone picker in `TC-WRITE-03`. |
| `UNIT-UTIL-02` | JWT Token Generation & Validation (`jwt.js`) | **Unit-Only**: Pure algorithmic signing and verification unit tests. | Verified end-to-end via staging auth flows `TC-AUTH-05` and `TC-AUTH-07`. |
| `UNIT-UTIL-03` | Password Hashing Rounds (`hash.js`) | **Unit-Only**: Micro-benchmark and unit assertions on bcrypt work factor. | Verified end-to-end via staging registration and login in `TC-AUTH-01` and `TC-AUTH-05`. |
| `UNIT-UTIL-04` | Pirate Rank Threshold Calculator (`rankFor.js`) | **Unit-Only**: Pure function asserting rank name from letter count integer. | Verified end-to-end via profile and navbar bounty in `TC-PROF-01`. |
| `LOCAL-SEED-01`| Database Test Seeding (`seed.js`) | **Local Dev Script**: Node CLI script designed to seed localhost MongoDB with dummy captain records. | Staging tests use dedicated staging test accounts created through standard staging workflows (`TC-AUTH-01`). |
| `LOCAL-SMOKE-01`| Local In-Memory Smoke Test Harness (`smoke.js`) | **Local Harness**: Local automated test harness configured for localhost / Docker test runners. | Staging API tests execute against deployed staging endpoints directly (`TC-SEC-01..04`, `TC-VOYAGE-03..05`). |

---

## 3. Retained Staging Test Count Summary

- **Total Source Test Cases in QA Plan:** 45
- **Local/Unit-Only Test Cases Removed:** 1 (`TC-VOYAGE-06`) + Unit/Local scripts
- **Retained UI Testing Cases:** 37
- **Retained Non-UI Staging Testing Cases:** 7
- **Total Active Staging Test Cases:** 44
