# CivicWatch — Test Plan & Execution Report
**Project:** CivicWatch — Citizen-Powered Cleaner Cities  
**Event:** MyBharat Hack for Social Cause (MoYAS / IIT Bombay)  
**Team:** HackSphere (Tamil Nadu) | **Team ID:** HSC|TN|03258  
**QA & Documentation Lead:** Gunasri R  

---

## 1. Test Strategy & Scope
The test plan validates the end-to-end functionality of CivicWatch across its core user personas (Citizen Reporter and Ward Sanitation Supervisor). The suite combines executable automated regression tests (`tests/test_civicwatch.js`) running on Node.js with manual functional and accessibility verifications.

---

## 2. Test Execution Matrix

| Test ID | Feature | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| **TC-01** | Seed Data Schema & Ward Integrity | Clean workspace | Run automated test verifying `initial-reports.json` | 4 valid Ward 172 records loaded with valid CW-ID format | 4 records verified, all fields conforming to schema | **PASSED** |
| **TC-02** | Proximity Deduplication Detection | Seed data loaded in storage | Submit report on `2nd Avenue` with category `Overflowing Garbage Bin` | Deduplication engine flags active duplicate `CW-2025-TN-1041` | Detected active duplicate within 72h window on 2nd Avenue | **PASSED** |
| **TC-03** | Resolved Issue Exclusion | Resolved issue exists on `3rd Cross Street` | Submit complaint on `3rd Cross Street` for `Blocked Storm Drain` | Resolved issues are NOT flagged as duplicates | Correctly ignored resolved record, allowed fresh report | **PASSED** |
| **TC-04** | Geographical Separation | Active report on `2nd Avenue` | Submit complaint on distant street (`LB Road`) with same category | System does NOT flag duplicate for different streets | Evaluated as unique incident, no false positive | **PASSED** |
| **TC-05** | Community Corroboration & Upvoting | Duplicate modal displayed | Citizen clicks *"Corroborate & Elevate Priority"* | Increments `duplicateCount` by 1, updates severity to `Urgent`, adds audit note | Counter incremented, priority set to Urgent, timeline updated | **PASSED** |
| **TC-06** | Supervisor Status Lifecycle | Complaint in `Reported` state | Supervisor updates status to `In Progress` then to `Resolved` with field notes | Status updates sequentially, timeline logs supervisor actor and note | Verified: Reported → In Progress → Resolved with timestamped notes | **PASSED** |
| **TC-07** | Input Validation Guards | Report form displayed | Submit with < 15 char description, missing street, or invalid phone | Validation triggers alerts; malformed inputs rejected | Rejected short descriptions (<15 chars) and invalid phone formats | **PASSED** |
| **TC-08** | Client Storage Persistence | LocalStorage available | Store reports, serialize to JSON, reload from mock storage | 100% roundtrip fidelity without data corruption | Verified serialization and retrieval roundtrip | **PASSED** |
| **TC-09** | Photo Compression Safety | Upload raw high-res image (> 2MB) | Process file via HTML5 canvas downsampling to max 640px | Compresses to < 50KB base64 string, preventing quota exhaustion | Verified canvas downsampling keeps output under 50KB | **PASSED** |
| **TC-10** | Geolocation Fallback | GPS permission denied / unavailable | Click *"Use Browser GPS"*, simulate refusal | System displays helpful warning and shifts focus to manual street input | Graceful error message displayed, manual input unobstructed | **PASSED** |
| **TC-11** | Zero-Login Anonymous Privacy | Default form state | Inspect default privacy toggle | "Report Anonymously" checked by default; phone field hidden | Zero personal information collected; phone field hidden | **PASSED** |
| **TC-12** | Mobile Viewport Responsiveness | Viewport set to 375px (Mobile) | Open citizen form, track tab, and supervisor dashboard | Elements stack cleanly, navigation remains touch-accessible | Verified responsive layout without horizontal scrollbars | **PASSED** |

---

## 3. Automated Test Suite Execution Summary
Automated tests are executed using the native Node.js test runner:
```bash
node tests/test_civicwatch.js
```

### Execution Log Output:
```text
====================================================
 CivicWatch Automated Test Runner
 Team HackSphere | Team ID: HSC|TN|03258
====================================================

[PASS] Test 1: Verify Seed Data Schema and GCC Ward 172 Records
[PASS] Test 2: Explainable Deduplication Engine - Detects Active Nearby Duplicate
[PASS] Test 3: Deduplication Engine - Ignores Resolved Reports
[PASS] Test 4: Deduplication Engine - Ignores Distinct Streets / Locations
[PASS] Test 5: Community Corroboration / Upvoting Priority Elevation
[PASS] Test 6: Municipal Supervisor Status Transition Lifecycle
[PASS] Test 7: Input Validation Rules (Min Length, Category, Phone Regex)
[PASS] Test 8: LocalStorage Persistence and Serialization Roundtrip

====================================================
 Summary: 8 Passed, 0 Failed
====================================================
>> All CivicWatch automated regression tests completed successfully.
```

---

## 4. Accessibility & Security Review
- **Color Contrast:** Navy (`#1B2A4A`) on ivory (`#FBF9F5`) exceeds WCAG AAA contrast ratio (> 11:1). Status badges exceed 4.5:1.
- **Data Minimization:** No personal phone numbers or names are stored unless explicitly opted-in for SMS tracking.
- **Local Isolation:** Zero external tracking cookies, analytics pixels, or third-party ad scripts.
