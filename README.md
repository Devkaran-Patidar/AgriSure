# AgriContract — Complete 7-Phase Development Foundation

This repository follows the AgriContract project roadmap:

1. Phase 1 — Marketing website, login and registration UI
2. Phase 2 — Django backend, authentication, roles, profiles and documents
3. Phase 3 — Contract creation, negotiation, approval and signing
4. Phase 4 — Escrow ledger and milestone payment release
5. Phase 5 — Crop monitoring, inspections and quality grading
6. Phase 6 — Notifications, disputes, analytics and admin console
7. Phase 7 — UAT/security/performance/production-readiness checklist

## Application workflow

AgriContract follows a contract-first farming marketplace flow aligned with the 7-phase roadmap:

1. **Register & verify** — Farmers and buyers register, verify OTP, and complete profiles (farm or company details + verification status).
2. **List & discover crops** — Farmers add crops; buyers search available crops and send procurement requests.
3. **Negotiate & agree** — Both parties negotiate price, approve terms, and sign the digital agreement.
4. **Fund escrow** — Buyers fund milestone-based escrow; farmers track pending and released payouts.
5. **Monitor progress** — Farmers submit crop updates; buyers monitor field progress and inspections.
6. **Communicate** — In-app messages and notifications keep both parties aligned.
7. **Admin oversight** — Admins review user verification, agreements, payments, disputes, and platform analytics.

### UI structure

- **Public site** — Marketing pages (Overview, About, Features, How It Works, Contact).
- **Workspace sidebar** — Logged-in users navigate from a left sidebar (no duplicate links in the top navbar).
- **Human-readable labels** — Payments and agreements show crop + farmer + buyer names instead of internal contract IDs.

## Frontend
React + Vite + JSX only.

There are no `.ts` or `.tsx` source files.

## Backend
Django REST Framework + SQLite for local development, PostgreSQL-ready configuration, and JWT.

The active backend is `Backend1`.

## Start

Backend:
```bash
 cd Backend1
python -m venv venv
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
 python manage.py seed_demo
python manage.py createsuperuser
python manage.py runserver
```

`seed_demo` is safe to run repeatedly and creates five demo contracts with farmer/company accounts, escrow, monitoring, inspections, negotiations, notifications, and messages. Demo accounts use password `DemoPass123!`. The seeded admin account is `admin@gmail.com` with password `12345678` for local demonstration only; replace it before deployment.

For production, set `DEBUG=0`, a random `SECURITY_KEY` of at least 50 characters, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`. Serve the application behind HTTPS and configure PostgreSQL, object storage, backups, logging, and provider credentials before deployment.

Frontend:
```bash
cd frontend
npm install
npm run dev
```

The code implements the application workflow, but external payment, e-signature, SMS, KYC/KYB and inspection providers require real provider credentials and production-specific integration.
