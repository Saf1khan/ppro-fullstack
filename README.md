# PadosiPro Full-Stack Assignment

> Native Android mobile application (Expo) and FastAPI backend service implementing authentication with Argon2id, 6-digit OTP verification, and JWT bearer tokens.

---

## 1. Project Purpose

This repository houses the full-stack implementation for the PadosiPro Full-Stack Developer assignment. It provides an end-to-end user onboarding and service task selection flow:
1. **User Registration:** Email, password, and confirmation password validation.
2. **Email Verification:** Cryptographically secure 6-digit OTP dispatched to local Mailpit, with 10-minute expiry, single-use enforcement, 5-attempt limit, and 30-second resend cooldown.
3. **Authentication:** Argon2id password hashing and stateless JWT bearer tokens.
4. **Onboarding & Profile Setup (Phase 3):** Name, Mobile Number, Address, and Business Name.
5. **Task Selection (Phase 3/4):** Categories, live search, multi-selection, confirmation, and authenticated home dashboard.

---

## 2. Architecture & Tech Stack

```
ppro-fullstack/
├── backend/                  # FastAPI REST API & Database Models
│   ├── alembic/              # Database migration scripts (Async)
│   ├── app/
│   │   ├── api/              # API router and v1 endpoints (/auth, /health)
│   │   │   ├── deps.py       # JWT authentication dependency (get_current_user)
│   │   │   └── v1/endpoints/ # auth.py, health.py
│   │   ├── core/             # Pydantic Settings and Argon2id / HMAC / JWT security
│   │   ├── db/               # SQLAlchemy async engine, sessionmaker, and Base
│   │   ├── models/           # Domain models: User, EmailVerificationOTP
│   │   ├── schemas/          # Pydantic validation schemas (auth, health)
│   │   ├── services/         # Business logic: AuthService, OTPService, EmailService
│   │   └── main.py           # FastAPI entrypoint with CORS & lifecycle
│   ├── tests/                # Automated pytest suite (20 tests covering all auth rules)
│   ├── pyproject.toml
│   └── requirements.txt
├── mobile/                   # Expo / React Native Android Application
│   ├── app/                  # Expo Router directory-based navigation
│   │   ├── (auth)/           # Route group for auth screens (Phase 3 UI)
│   │   ├── (onboarding)/     # Route group for profile & task selection
│   │   ├── (app)/            # Route group for main app / home screen
│   │   ├── _layout.tsx       # Root layout with theme provider & SafeArea
│   │   └── index.tsx         # Foundation status & API connectivity check
│   ├── src/
│   │   ├── components/       # Reusable UI primitives (Button, Card, Input)
│   │   ├── services/         # API client & SecureStore token storage
│   │   └── theme/            # Centralized design tokens (#155C49, 12px radius)
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── DESIGN.md             # Design tokens & Backend Authentication Architecture
├── docker-compose.yml        # PostgreSQL 16 & Mailpit container definitions
├── .env.example              # Canonical environment template
├── .gitignore
└── README.md
```

### Technology Highlights

- **Backend API:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (AsyncIO), Alembic migrations, Pytest.
- **Security:** Argon2id password hashing (`argon2-cffi`), constant-time HMAC-SHA256 OTP hashing with server salt, stateless JWT access tokens (HS256).
- **Data Persistence:** PostgreSQL 16 with persistent named volume storage.
- **Local Email Relay:** Mailpit container (SMTP on `1025`, Web Inspector on `8025`).
- **Mobile Client:** React Native with Expo SDK 52, TypeScript (strict mode), Expo Router, and hardware-backed `expo-secure-store`.

---

## 3. Prerequisites

- **Python:** Python 3.11, 3.12, or 3.13 (`uv` or `venv`)
- **Docker & Docker Compose:** Docker Desktop or Docker Engine
- **Node.js:** v18+ & `npm`

---

## 4. Getting Started

### Step 1: Clone & Configure Environment

Copy the example environment template:

```bash
cp .env.example .env
```

Review `.env` to verify default ports and database credentials.

---

### Step 2: Start PostgreSQL & Mailpit (Docker Compose)

Start the database and local SMTP inspector:

```bash
docker compose up -d
```

Verify running containers:

```bash
docker compose ps
```

- **PostgreSQL:** `localhost:5432` (database: `padosipro_db`, user: `padosipro`)
- **Mailpit Web UI:** Open [http://localhost:8025](http://localhost:8025) in your browser to view incoming emails/OTPs.
- **Mailpit SMTP:** `localhost:1025`

---

### Step 3: Run Backend Migrations & Start API

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Using uv:
   uv venv .venv --python 3.13
   .venv\Scripts\activate      # Windows
   # source .venv/bin/activate # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run Alembic database migrations:
   ```bash
   alembic upgrade head
   ```

5. Run the automated test suite:
   ```bash
   pytest -v
   ```

6. Start the development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. Verify API & Interactive Documentation:
   - Health Endpoint: [http://localhost:8000/health](http://localhost:8000/health)
   - Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Step 4: Start the Mobile Application (Expo)

1. Navigate to the `mobile/` directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure API Base URL:
   The mobile app dynamically resolves the backend URL via [`mobile/src/config/api.ts`](file:///c:/Projects/ppro-fullstack/mobile/src/config/api.ts):
   - **Android Emulator (default):** Automatically routes to `http://10.0.2.2:8000/api/v1` (the emulator's loopback alias to host `localhost:8000`).
   - **iOS Simulator / Web:** Automatically routes to `http://localhost:8000/api/v1`.
   - **Physical Device over Wi-Fi / Custom Host:** Create `mobile/.env` or set in root `.env`:
     ```env
     EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:8000/api/v1
     ```

4. Run TypeScript validation:
   ```bash
   npm run typecheck
   ```

5. Launch the Expo development server:
   ```bash
   npm run start
   ```

6. Open on device:
   - **Android Emulator:** Press `a` in the Expo terminal.
   - **Physical Android Device:** Scan the QR code using the **Expo Go** application.

### Step 5: How to Build the Android APK

Per the assignment brief (*"an APK for Android, and/or an IPA or TestFlight link for iOS. Android alone is completely fine"*), the repository includes full configuration to build a standalone Android `.apk` file.

#### Method A: Cloud APK Build with EAS (Recommended & Easiest)
1. Install the EAS CLI globally (or run via npx):
   ```bash
   npm install -g eas-cli
   ```
2. Navigate to the `mobile/` directory:
   ```bash
   cd mobile
   ```
3. Run the APK build command using the pre-configured `preview` profile:
   ```bash
   eas build -p android --profile preview
   ```
   *(EAS will compile the standalone `.apk` in the cloud and provide a direct download URL that can be installed on any physical Android device or emulator.)*

#### Method B: Local Standalone Build (Expo Prebuild / Gradle)
If you have Android Studio & Android SDK installed locally:
1. Generate the native Android project folder:
   ```bash
   cd mobile
   npx expo prebuild -p android
   ```
2. Compile the release APK locally with Gradle:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   The built APK will be located at:
   `android/app/build/outputs/apk/release/app-release.apk`

---

## 5. End-to-End User Journey (Implemented & Verified)

1. **User Registration:** Email, password, and confirmation password validation with inline client-side checks and server-side Argon2id hashing.
2. **Email Verification:** Cryptographically secure 6-digit OTP dispatched to local Mailpit, with 10-minute expiry, single-use enforcement, 5-attempt limit, and 30-second resend cooldown.
3. **Authentication & Session:** JWT bearer token issued and stored in hardware-backed `expo-secure-store`.
4. **First-Login Profile Setup (Shown Once):** Captures Full Name, Indian Mobile (`+91` 10 digits), Service Area Address, and optional Business Name. Un-profiled users are routed here directly; returning users with profiles bypass onboarding straight to dashboard.
5. **Task Catalogue & Selection:**
   - 24 tasks across 4 categories (*Deep Cleaning, Plumbing, Electrical, Appliances*).
   - Real-time instant search across titles and descriptions.
   - Horizontal category filter chips.
   - Multi-select interactive checkbox cards.
6. **Task Confirmation Step:** Grouped review screen displaying chosen services before saving.
7. **Home Dashboard:** Displays active provider details, verified badge, and the complete list of selected tasks with an "Edit Services" shortcut and secure Logout.

---

## 6. Complete REST API Reference (Backend)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| **Health** | | | |
| `GET` | `/health` | Service and database connectivity health probe | No |
| `GET` | `/api/v1/health` | Versioned health check | No |
| **Authentication** | | | |
| `POST` | `/api/v1/auth/register` | Register an unverified account & dispatch 6-digit OTP | No |
| `POST` | `/api/v1/auth/verify-email` | Verify email with OTP (10 min expiry, 5 attempt limit) | No |
| `POST` | `/api/v1/auth/resend-otp` | Request a new OTP (enforces 30s cooldown) | No |
| `POST` | `/api/v1/auth/login` | Authenticate credentials & issue JWT token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user status & `has_profile` flag | Bearer JWT |
| **Profile** | | | |
| `GET` | `/api/v1/profile/me` | Fetch current user's profile details | Bearer JWT |
| `POST` | `/api/v1/profile` | Create profile (Name, Indian phone +91, Address, Business) | Bearer JWT |
| `PUT` | `/api/v1/profile` | Update profile details | Bearer JWT |
| **Tasks** | | | |
| `GET` | `/api/v1/tasks/categories` | Get catalogue of 24 tasks grouped by 4 categories | No |
| `GET` | `/api/v1/tasks` | Live search tasks by query string (`?search=...`) | No |
| `POST` | `/api/v1/tasks/select` | Persist selected task IDs for authenticated user | Bearer JWT |
| `GET` | `/api/v1/tasks/my-selection` | Retrieve user's currently confirmed tasks | Bearer JWT |

---

## 7. Automated Test Suite (35/35 Passing)

All risky logic, auth constraints, profile validation, catalogue counts, and user task isolation are covered with 100% passing tests:

```bash
cd backend
.venv\Scripts\pytest.exe -v
```

* **18 Authentication Tests:** Argon2id hashing, OTP attempt exhaustion, 10-minute expiration, 30s cooldown, unverified user login block, token issuance.
* **2 Health Tests:** Root and API v1 health checks.
* **8 Profile Tests:** Indian phone normalization, 422 invalid phone rejection, 1-to-1 duplicate creation conflict, optional business name, PUT update.
* **7 Task Tests:** Minimum 20 tasks / 4 categories check, query search filtering, 401 auth guard, selection persistence, invalid task ID rejection, user isolation.

---

## 8. Project Status & Completed Milestones

| Phase | Milestone | Status | Key Deliverables |
| :---: | :--- | :---: | :--- |
| **Phase 1** | Foundation & Architecture | ✅ Completed | FastAPI, Alembic, Docker Compose (PostgreSQL 16 & Mailpit), design tokens |
| **Phase 2** | Backend Authentication & Security | ✅ Completed | Argon2id, 6-digit OTP lifecycle, JWT bearer tokens, 20/20 tests passing |
| **Phase 3** | Mobile Native Authentication | ✅ Completed | Register, OTP timer, Login, SecureStore JWT persistence, Route Guard |
| **Phase 4** | First-Login Profile Onboarding | ✅ Completed | 1-to-1 UserProfile model, Indian phone validation, optional business name, 28/28 tests |
| **Phase 5** | Task Catalogue & Selection Flow | ✅ Completed | 24 tasks / 4 categories, search, multi-select, confirm step, Home dashboard tasks list, 35/35 tests |
| **Part C** | Deliverables & Quality | ✅ Completed | APK build config (`eas.json`), comprehensive `README.md`, 1-page `DESIGN.md` |

