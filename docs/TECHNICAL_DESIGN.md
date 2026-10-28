# CivicWatch — Technical Design Document
**Project:** CivicWatch — Citizen-Powered Cleaner Cities  
**Event:** MyBharat Hack for Social Cause (MoYAS / IIT Bombay)  
**Theme:** Clean & Sustainable Communities  
**Team Name:** HackSphere (Tamil Nadu)  
**Team ID:** HSC|TN|03258  
**Team Composition:**  
- **Kamalanathan K** — Team Lead & UI/Frontend Engineer  
- **Gunasri R** — QA, Documentation & Testing Lead  
- **Krishnaprasad S** — Systems & Future Backend Architect  

---

## 1. Project Overview & Scope
CivicWatch is a lightweight, privacy-preserving civic issue reporting and municipal action tracking system. It bridges the communication gap between citizens and urban local bodies (such as the Greater Chennai Corporation) without requiring mandatory identity verification, passwords, or cumbersome mobile applications.

### 1.1 Problem Statement
Urban public spaces frequently suffer from open solid waste accumulation, single-use plastic dumping, blocked stormwater drainage inlets, and illegal construction debris dumping. Existing government reporting mechanisms suffer from three main bottlenecks:
1. **High Citizen Onboarding Friction:** Requiring phone OTP or Aadhaar KYC before reporting discourages spontaneous reporting.
2. **Accountability Deficit:** Lack of transparent status tracking leads to citizen disillusionment.
3. **Supervisor Triage Overload:** Redundant reports for the same incident overwhelm conservancy supervisors.

### 1.2 Prototype Scope
The current prototype is targeted at **Greater Chennai Corporation (GCC) Ward 172 (Adyar / Besant Nagar)**. It provides an end-to-end demonstrable workflow operating client-side with persistent `localStorage`, complete with dual-role views (Citizen vs. Municipal Supervisor), real-time status transitions, client-side canvas photo compression, and an explainable duplicate detection engine.

---

## 2. Functional & Non-Functional Requirements

### 2.1 Functional Requirements
* **FR-01 (Anonymous Reporting):** Citizens can file reports with zero registration. Anonymous reporting is enabled by default.
* **FR-02 (Evidence Capture & Compression):** Photos uploaded via camera/file picker are dynamically downscaled via an offscreen HTML5 canvas to prevent client storage exhaustion.
* **FR-03 (Location Geotagging & Fallback):** Browser Geolocation API captures exact GPS coordinates. If permission is denied or unavailable, manual entry of ward, street, and landmark is fully supported.
* **FR-04 (Explainable Deduplication):** Active reports within 72 hours in the same vicinity and category trigger an advisory modal allowing the user to corroborate (upvote priority) or proceed independently.
* **FR-05 (Unique Tracking Token):** Every report generates a unique identifier formatted as `CW-2025-TN-XXXX`.
* **FR-06 (Dual-Role Console):** Instant toggle between Citizen Portal and Municipal Ward Supervisor Console.
* **FR-07 (Status Workflow):** Sanitation supervisors can update status from `Reported` → `In Progress` → `Resolved` with field inspection notes.

### 2.2 Non-Functional Requirements
* **NFR-01 (Zero-Install & Zero-Cost):** Runs directly in modern desktop and mobile web browsers without paid cloud API dependencies.
* **NFR-02 (Performance):** Page load in under 1 second; photo compression in under 200ms.
* **NFR-03 (Data Minimization):** Zero PII collected unless citizen explicitly opts into SMS notifications.
* **NFR-04 (Accessibility):** WCAG 2.1 AA compliant color contrast, readable classic-editorial typography, and accessible keyboard navigation.

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram
```mermaid
flowchart TD
    subgraph Client Browser [Modern Web Browser Environment]
        subgraph UI Layer [Classic-Elegant UI / Presentation]
            CP[Citizen Portal View]
            SD[Ward Supervisor Console]
            ST[Status & Timeline Tracker]
        end

        subgraph Core Logic Engine [src/app.js]
            DE[Explainable Deduplication Engine]
            CE[Canvas Image Compression Engine]
            GE[Geolocation & Fallback Engine]
            SM[State & Workflow Manager]
        end

        subgraph Storage Layer [Persistence]
            LS[(Browser LocalStorage Engine)]
            SD_SEED[(GCC Ward 172 Seed Data)]
        end
    end

    CP -->|Uploads Raw Photo| CE
    CP -->|Requests GPS Fix| GE
    CP -->|Submits Report Form| DE
    DE -->|If Duplicate Detected| CP
    DE -->|If Unique or Overridden| SM
    SM -->|Persists State| LS
    SD -->|Status Transitions & Field Notes| SM
    LS <-->|Hydrates Initial State| SD_SEED
    ST <-->|Lookups by CW-ID| LS
```

---

## 4. User Workflow & Use Case Flow

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant App as CivicWatch App
    participant Engine as Deduplication Engine
    actor Supervisor as Ward Supervisor (Murugan)

    Citizen->>App: Opens CivicWatch (No login required)
    Citizen->>App: Snaps photo + enters street & category
    App->>App: Canvas compresses photo (< 50KB)
    App->>Engine: Evaluates active complaints in Ward 172
    alt Duplicate Detected (< 72h, same street & category)
        Engine-->>Citizen: Shows explainable duplicate modal
        Citizen->>Engine: Clicks "Corroborate & Elevate Priority"
        Engine->>App: Increments duplicateCount, marks Urgent
    else Unique Incident
        Citizen->>App: Submits report
        App->>App: Generates Token CW-2025-TN-XXXX
    end
    App-->>Citizen: Confirms with Complaint ID
    Supervisor->>App: Switches to Ward Supervisor Console
    Supervisor->>App: Reviews photo proof and triage queue
    Supervisor->>App: Changes status: Reported -> In Progress (Dispatches truck)
    Supervisor->>App: Changes status: In Progress -> Resolved (Adds clearance note)
    Citizen->>App: Enters CW-ID in Track Tab
    App-->>Citizen: Displays complete verified resolution timeline
```

---

## 5. Data Flow Diagram

```mermaid
flowchart LR
    A[Citizen Photo & Form Input] --> B[Offscreen Canvas Compression]
    B --> C[Payload: < 50KB Base64]
    D[Browser Geolocation API] --> E{Permission Granted?}
    E -->|Yes| F[GPS Coordinates Tagged]
    E -->|No| G[Manual Street & Landmark Input]
    C & F & G --> H[Deduplication Matcher]
    H --> I[LocalStorage JSON Store]
    I --> J[Public Ward Feed]
    I --> K[Supervisor Triage Table]
    K --> L[Status Transition & Timestamped Notes]
    L --> I
```

---

## 6. Database Schema & Data Dictionary

### 6.1 Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
    COMPLAINT {
        string id PK "CW-2025-TN-XXXX"
        string category "e.g. Blocked Storm Drain"
        string description "Incident description"
        string ward "Ward 172 (Adyar)"
        string street "Street name"
        string landmark "Specific landmark"
        float latitude "GPS Latitude"
        float longitude "GPS Longitude"
        string status "Reported | In Progress | Resolved"
        string severity "Normal | Medium | High | Urgent"
        boolean isAnonymous "Default: true"
        string citizenContact "Optional Phone"
        string photoUrl "Compressed Base64 Image"
        int duplicateCount "Corroboration count"
        datetime createdAt "ISO 8601"
        datetime updatedAt "ISO 8601"
    }

    TIMELINE_ENTRY {
        int id PK "Auto-increment"
        string complaintId FK "References COMPLAINT.id"
        string status "Reported | In Progress | Resolved"
        datetime timestamp "ISO 8601"
        string actor "Citizen | Ward Supervisor"
        string note "Field inspection or citizen comment"
    }

    COMPLAINT ||--o{ TIMELINE_ENTRY : "tracks"
```

### 6.2 Data Dictionary

| Field | Type | Required | Constraints / Values | Description |
|---|---|---|---|---|
| `id` | String | Yes | `^CW-2025-TN-\d{4}$` | Unique public tracking token. |
| `category` | String | Yes | Enumeration (6 categories) | Standardized civic sanitation category. |
| `description` | String | Yes | Minimum 15 characters | Citizen description of the hazard. |
| `ward` | String | Yes | GCC Ward Identifier | Pilot boundary: Greater Chennai Corp Ward 172. |
| `street` | String | Yes | Non-empty string | Road or street name where hazard exists. |
| `landmark` | String | No | Free text | Notable nearby point of reference. |
| `latitude` | Float | No | Range: [-90, 90] | Geolocation coordinate. |
| `longitude` | Float | No | Range: [-180, 180] | Geolocation coordinate. |
| `status` | String | Yes | `Reported`, `In Progress`, `Resolved` | Lifecycle status in municipal workflow. |
| `severity` | String | Yes | `Normal`, `Medium`, `High`, `Urgent` | Priority weighting for conservancy triage. |
| `isAnonymous` | Boolean| Yes | `true` or `false` | Privacy flag. Defaults to `true`. |
| `citizenContact`| String | No | Regex: `^[0-9+\-\s]{8,15}$` | Optional phone for SMS tracking. |
| `photoUrl` | String | Yes | Base64 JPEG or SVG path | Photographic evidence compressed to < 50KB. |
| `duplicateCount`| Integer| Yes | `0` or positive integer | Number of citizen corroborations. |
| `timeline` | Array | Yes | Array of Timeline Objects | Immutable audit log of status actions. |

---

## 7. Future Backend Architecture Roadmap
When transitioning from the hackathon demonstration to a live multi-ward municipal pilot:
- **Backend API:** Node.js / Express or Python FastAPI service with PostgreSQL / PostGIS spatial database for geospatial radius queries (`ST_DWithin`).
- **Authentication:** Role-Based Access Control (RBAC) via DigiLocker / MeriPehchaan for municipal supervisors; zero-login token model preserved for citizens.
- **SMS Gateway:** Integration with NIC National Mobile Governance SMS Gateway for automated status dispatch.
- **Computer Vision Pipeline:** Integration of an edge classification model (MobileNet) to automatically categorize waste types (plastic vs. organic vs. C&D debris) from photos.

```mermaid
flowchart TD
    subgraph Future Production Topology
        CitizenClient[Citizen Web App / PWA]
        OfficerApp[Sanitation Supervisor PWA]
        
        API[Node.js REST API Gateway]
        DB[(PostgreSQL + PostGIS)]
        S3[(Object Storage - Photo Evidence)]
        SMS[NIC SMS Gateway]
    end

    CitizenClient -->|HTTPS POST| API
    OfficerApp -->|OAuth2 / JWT| API
    API --> DB
    API --> S3
    API --> SMS
```
