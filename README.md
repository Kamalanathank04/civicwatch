# CivicWatch — Citizen-Powered Cleaner Cities
**Event:** MyBharat Hack for Social Cause (Ministry of Youth Affairs & Sports / IIT Bombay)  
**Theme:** Clean & Sustainable Communities  
**Team Name:** HackSphere (Tamil Nadu)  
**Team ID:** `HSC|TN|03258`  
**Team Members:**  
- **Kamalanathan K** (Team Lead & UI / Frontend Engineer)  
- **Gunasri R** (QA, Testing & Technical Documentation)  
- **Krishnaprasad S** (Systems & Backend Architecture)  

---

## 1. Project Overview & Problem Statement
In rapidly expanding urban centers across India, open waste dumping, single-use plastics accumulation, clogged storm drains, and illegal construction debris create acute public health hazards and flood vulnerabilities. 

While municipal portals exist, citizens often encounter:
1. **Mandatory KYC/Login Friction:** Requiring OTPs or identity verification prevents spontaneous reporting.
2. **Accountability Deficit:** Complaints enter an opaque administrative pipeline without status transparency.
3. **Supervisor Triage Overload:** Municipal ward supervisors receive dozens of redundant tickets for the same waste pile.

**CivicWatch** solves this through a zero-barrier, privacy-preserving reporting web application. Citizens can snap a photo, confirm GPS or manual street coordinates, and receive a permanent `CW-2025-TN-XXXX` tracking token in under 45 seconds—with zero mandatory personal registration. An explainable deduplication engine clusters nearby reports, allowing citizens to corroborate existing tickets and elevate their priority, while providing ward sanitation supervisors with a clear, actionable triage dashboard.

---

## 2. Key Features
- **Zero-Login Anonymous Reporting:** Full reporting capability by default without storing citizen personal data.
- **Client-Side Image Compression:** Automatically resizes camera photos to < 50KB via HTML5 canvas, ensuring seamless performance and preventing `localStorage` quota errors.
- **Explainable Duplicate Detection Engine:** Transparent heuristic that alerts citizens if an active report exists within 72 hours on the same street/category, offering one-click community corroboration.
- **Browser Geolocation with Resilient Fallback:** Automatically requests GPS coordinates with permission; provides an immediate, graceful manual fallback to ward, street, and landmark fields if denied.
- **Permanent Complaint Tracking ID:** Formats every complaint as `CW-2025-TN-XXXX` with an immutable visual resolution timeline.
- **Dual-View Operational Console:** Single-click toggle between **Citizen Portal** and **Ward Supervisor Console (Murugan - Ward 172 Adyar)** to demonstrate the full civic lifecycle in under 2 minutes.
- **Zero-Dependency Architecture:** Pure HTML5, modern CSS, and vanilla JavaScript—runs entirely in any modern browser without paid API keys, complex installations, or risk of network drops during live presentations.

---

## 3. Technology Stack
- **Frontend Presentation:** Semantic HTML5, Classic-Elegant CSS3 (Warm Ivory, Deep Navy, Restrained Gold).
- **Core Engine:** Vanilla ECMAScript (ES6+) with event-driven architecture.
- **Storage Layer:** Browser Web Storage API (`localStorage`) with pre-seeded synthetic data for Greater Chennai Corporation Ward 172.
- **Testing Suite:** Native Node.js test runner (`assert`).

---

## 4. System Requirements & Prerequisites
- **Node.js:** v16.0.0 or higher (Tested on Node.js v24.21.0).
- **Web Browser:** Any modern browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
- **Operating System:** Windows 10/11, macOS, or Linux.

---

## 5. Local Setup & Quickstart Guide

### Step 1: Open the Project Directory
In Windows PowerShell:
```powershell
cd C:\Users\saran\.gemini\antigravity\scratch\civicwatch
```

On macOS / Linux:
```bash
cd ~/civicwatch
```

### Step 2: Run Automated Regression Tests
Execute the automated test suite to verify core logic, duplicate detection, and schema compliance:
```powershell
node tests/test_civicwatch.js
```
*Expected Output:* `Summary: 8 Passed, 0 Failed`.

### Step 3: Launch the Application
You can open `index.html` directly in your browser or run a lightweight local server:

**Option A (Direct File Launch — Recommended for Zero Setup):**
Double-click `index.html` or open it from PowerShell:
```powershell
Start-Process "index.html"
```

**Option B (Local HTTP Server using npx):**
```powershell
npx serve . -l 3000
```
Then navigate to `http://localhost:3000` in your browser.

---

## 6. Environment Variables Documentation
CivicWatch includes a `.env.example` file for reference when deploying to hosted environments:

| Variable | Purpose | Required? | Example Value |
|---|---|---|---|
| `APP_ENV` | Sets the application runtime mode (`demo`, `development`, `production`). | Yes | `demo` |
| `PORT` | Local server port for serving the web app. | No | `3000` |
| `VITE_STORAGE_DRIVER` | Storage engine driver (`localstorage` or `mock_api`). | Yes | `localstorage` |
| `DEFAULT_WARD_ID` | Default municipal ward identifier for synthetic context. | Yes | `GCC-ZONE13-WARD172` |
| `DEFAULT_WARD_NAME` | Display name of the pilot jurisdiction. | Yes | `"Greater Chennai Corporation - Ward 172 (Adyar)"` |
| `NIC_SMS_GATEWAY_KEY`| Placeholder key for future municipal SMS integration. | No | *(Leave blank in demo)* |

---

## 7. Demo Walkthrough & Judging Guide

### Scenario 1: Citizen Reports an Issue
1. Open the app in **Citizen Portal** mode.
2. Select Category: **"Blocked Storm Drain"**.
3. Description: *"Stormwater inlet choked with plastic carry bags near street corner."*
4. Click **"Use Browser GPS"** (or observe the graceful manual fallback).
5. Enter Street: **"2nd Avenue"**.
6. Upload an image (notice instant preview and automatic client-side canvas compression).
7. Keep **"Report Anonymously"** toggled ON.
8. Click **"Submit Civic Complaint"**.
9. Notice the **Explainable Duplicate Alert**: Complaint `#CW-2025-TN-1041` is already active on 2nd Avenue!
10. Click **"👍 Corroborate & Elevate Priority"** — the ticket is automatically updated to **Urgent** priority.

### Scenario 2: Ward Supervisor Dispatches & Resolves
1. Click **"🏢 Ward Supervisor Dashboard"** in the top navigation bar.
2. Review the live metrics: Total Reports, Pending Review, In Progress, Resolved.
3. Locate complaint `CW-2025-TN-1041` in the queue.
4. Click **"Action ▾"**.
5. Change status to **"In Progress"** with note: *"Dispatched mini-tipper truck #TN-07-G-4421."*
6. Click **"Commit Status Update"**.
7. Return to the Citizen Portal → **Track by Complaint ID** → Enter `CW-2025-TN-1041`.
8. Observe the real-time updated accountability timeline with the supervisor's official action note!

---

## 8. Resetting Demo Data
If you test various submissions and want to restore the clean initial state:
- Click the **"🔄 Reset Demo to GCC Seed"** button on the Ward Supervisor Dashboard.
- Alternatively, clear your browser's site data/localStorage.

---

## 9. Limitations & Future Roadmap
- **Current Limitation:** In the standalone demo, data is persisted within the local browser's `localStorage`. Reports filed on one machine are not synced across multiple separate devices without a shared backend.
- **Roadmap Phase 1:** Deploy Node.js REST API with PostgreSQL/PostGIS spatial database for multi-user synchronization.
- **Roadmap Phase 2:** Integrate with Greater Chennai Corporation (GCC) 1913 civic grievance backend.
- **Roadmap Phase 3:** On-device edge classification of waste photos using lightweight TensorFlow.js models.

---

## 10. License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.  
Copyright (c) 2026 Team HackSphere (Kamalanathan K, Gunasri R, Krishnaprasad S).
