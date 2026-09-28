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

---

## 5. Mobile Authentication Flow (Phase 3)

The native mobile app implements the full client-side authentication journey:

1. **Session Bootstrap:** On app mount, `AuthContext` checks `expo-secure-store` for an existing JWT. If present, it validates the token against `GET /api/v1/auth/me`. If valid, it enters the authenticated area without flashing unauthenticated screens; if invalid/expired, it clears the token and lands on Login.
2. **Registration Screen:** Collects email, password, and confirm password. Enforces client-side email format and password match before dispatching to `POST /api/v1/auth/register`. Displays inline server errors (e.g. 409 Conflict). On success, seamlessly forwards to Verify Email.
3. **Verify Email Screen:** Displays the target email, provides a 6-digit numeric input with monospace typography, and calls `POST /api/v1/auth/verify-email`. Features an active 30-second countdown timer for the "Resend Code" button to respect backend rate limits, handles remaining attempt countdowns, and routes to Login on confirmation.
4. **Login Screen:** Authenticates email and password via `POST /api/v1/auth/login`. Handles `401 Unauthorized` (bad credentials) and `403 Forbidden` (unverified account) with a direct "Verify Email Now" quick action. Stores the issued JWT in `expo-secure-store`.
5. **Route Protection:** Expo Router `NavigationGuard` prevents unauthenticated access to `(app)` and redirects authenticated users away from `(auth)` screens.
6. **Protected Landing Screen:** Displays verified session metadata (email, verification status, user ID) and provides a secure "Log Out" action that clears SecureStore tokens and resets auth context state.

---

## 6. Authentication API Overview (Backend)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Service and database connectivity health probe | No |
| `GET` | `/api/v1/health` | Versioned health check | No |
| `POST` | `/api/v1/auth/register` | Register an unverified account & dispatch 6-digit OTP | No |
| `POST` | `/api/v1/auth/verify-email` | Verify email with OTP (10 min expiry, 5 attempt limit) | No |
| `POST` | `/api/v1/auth/resend-otp` | Request a new OTP (enforces 30s cooldown) | No |
| `POST` | `/api/v1/auth/login` | Authenticate credentials & issue JWT token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & verification status | Bearer JWT |

---

## 7. Project Status & Roadmap

| Phase | Milestone | Status | Details |
| :---: | :--- | :---: | :--- |
| **Phase 1** | Foundation & Infrastructure | ✅ Completed | Clean multi-package architecture, Docker PostgreSQL & Mailpit, design system tokens |
| **Phase 2** | Backend Authentication & DB | ✅ Completed | Argon2id, 6-digit OTP lifecycle, JWT bearer tokens, Alembic migrations, 20/20 Pytest passing |
| **Phase 3** | Mobile Authentication Flow | ✅ Completed | Expo Router auth screens (Register, OTP, Login), AuthContext, SecureStore JWT persistence, Route Guard |
| **Phase 4** | Onboarding & Task Selection | ⏳ Next | First-login profile setup (Name, Phone, Address, Business) & Categorized task selection flow |
