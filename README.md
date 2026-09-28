# PadosiPro Full-Stack Assignment

> Production-quality take-home foundation for a native Android mobile application and FastAPI backend service.

---

## 1. Project Purpose

This repository houses the full-stack implementation for the PadosiPro Full-Stack Developer assignment. The application will provide an end-to-end user onboarding and service task selection experience:
1. User registration with email & password
2. Email verification using a 6-digit OTP (local testing via Mailpit)
3. User login & token authentication
4. First-login profile setup (Name, Mobile, Address, Business Name)
5. Service task selection with categorization, live search, and multi-selection
6. Task confirmation and onboarding summary
7. Authenticated Home screen displaying the selected tasks
8. Secure logout

---

## 2. Architecture & Tech Stack

```
ppro-fullstack/
├── backend/                  # FastAPI REST API & Database Models
│   ├── alembic/              # Database migration scripts (Async)
│   ├── app/
│   │   ├── api/              # API router and v1 endpoints (/health, etc.)
│   │   ├── core/             # Pydantic Settings and environment configuration
│   │   ├── db/               # SQLAlchemy async engine, sessionmaker, and Base
│   │   ├── models/           # Domain models (User, Profile, Task - ready for Phase 2)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic layer (Auth, Email, Tasks)
│   │   └── main.py           # FastAPI entrypoint with CORS & lifecycle
│   ├── tests/                # Automated pytest suite
│   ├── pyproject.toml
│   └── requirements.txt
├── mobile/                   # Expo / React Native Android Application
│   ├── app/                  # Expo Router directory-based navigation
│   │   ├── (auth)/           # Phase 2: Auth flow (Register, OTP, Login)
│   │   ├── (onboarding)/     # Phase 3: Profile & Task selection
│   │   ├── (app)/            # Phase 4: Main app / Home screen
│   │   ├── _layout.tsx       # Root layout with theme provider & SafeArea
│   │   └── index.tsx         # Phase 1 Foundation verification screen
│   ├── src/
│   │   ├── components/       # Reusable UI primitives (Button, Card, Input)
│   │   ├── services/         # API client & SecureStore token storage
│   │   └── theme/            # Centralized design tokens (Colors, Typography, Spacing, Radius)
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── DESIGN.md             # PadosiPro visual reference design tokens
├── docker-compose.yml        # PostgreSQL & Mailpit container definitions
├── .env.example              # Canonical environment template
├── .gitignore
└── README.md
```

### Technology Highlights

- **Mobile Client:** React Native with Expo SDK 52, TypeScript (strict mode), Expo Router for navigation, and `expo-secure-store` for hardware-backed token storage. (No WebView).
- **Backend API:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (AsyncIO), Alembic migrations, and Pytest.
- **Data Persistence:** PostgreSQL 16 with persistent volume storage.
- **Email / OTP Testing:** Mailpit container providing an SMTP relay (port 1025) and Web Inspector UI (port 8025).

---

## 3. Prerequisites

Ensure you have the following installed on your host machine:

- **Node.js:** v18+ (Node v20 or v24 recommended) & `npm`
- **Python:** Python 3.11, 3.12, or 3.13 (`uv` or `venv`)
- **Docker & Docker Compose:** Docker Desktop or Docker Engine
- **Mobile Tooling:**
  - [Expo Go](https://expo.dev/go) app on an Android device, **OR**
  - Android Studio with an Android Virtual Device (AVD) emulator

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

To stop the containers:

```bash
docker compose down
```

---

### Step 3: Run the Backend API

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Using uv (fastest):
   uv venv .venv --python 3.13
   .venv\Scripts\activate      # Windows
   # source .venv/bin/activate # macOS/Linux

   # OR using standard venv:
   python -m venv .venv
   .venv\Scripts\activate      # Windows
   # source .venv/bin/activate # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run automated tests:
   ```bash
   pytest -v
   ```

5. Start the development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. Verify the API:
   - Health Endpoint: [http://localhost:8000/health](http://localhost:8000/health)
   - Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Step 4: Run the Mobile Application

1. Navigate to the `mobile/` directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify TypeScript types:
   ```bash
   npm run typecheck
   ```

4. Start the Expo development server:
   ```bash
   npm run start
   ```

5. Launch on Android:
   - **Android Emulator:** Press `a` in the terminal or run `npm run android`.
   - **Physical Device:** Scan the QR code using the **Expo Go** Android app.
   - *Note:* If running on an Android emulator, the default API base URL is `http://10.0.2.2:8000/api/v1`. If running on a physical phone, set `EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000/api/v1` in `mobile/.env` or `.env`.

---

## 5. Current Phase 1 Status

| Milestone | Status | Description |
| :--- | :---: | :--- |
| **Project Structure** | ✅ Completed | Clean multi-package architecture (`backend/`, `mobile/`, `docs/`, `docker-compose.yml`) |
| **Backend Foundation** | ✅ Completed | FastAPI app, CORS, `/health`, async DB session, settings, Alembic init, 100% passing tests |
| **Mobile Foundation** | ✅ Completed | Expo SDK 52 + React Native + Expo Router, TypeScript strict, design tokens, button/card/input primitives |
| **Docker Compose** | ✅ Completed | Validated PostgreSQL 16 with persistent volume + Mailpit SMTP & Web UI |
| **Design Tokens** | ✅ Completed | Observed visual tokens (#155C49 primary, 12px radius, typography) documented in `docs/DESIGN.md` |
| **Business Features** | ⏳ Phase 2+ | Registration, OTP verification, Login, Profile setup, and Task selection to follow |
