# AgriContract — Complete 7-Phase Development Foundation

This repository follows the AgriContract project roadmap:

1. Phase 1 — Marketing website, login and registration UI
2. Phase 2 — Django backend, authentication, roles, profiles and documents
3. Phase 3 — Contract creation, negotiation, approval and signing
4. Phase 4 — Escrow ledger and milestone payment release
5. Phase 5 — Crop monitoring, inspections and quality grading
6. Phase 6 — Notifications, disputes, analytics and admin console
7. Phase 7 — UAT/security/performance/production-readiness checklist

## Frontend
React + Vite + JSX only.

There are no `.ts` or `.tsx` source files.

## Backend
Django REST Framework + PostgreSQL + JWT.

## Start

Backend:
```bash
cd backend
python -m venv venv
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

The code implements the application workflow, but external payment, e-signature, SMS, KYC/KYB and inspection providers require real provider credentials and production-specific integration.
