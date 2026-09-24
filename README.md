# AgriSure — Assured Contract Farming System for Stable Market Access

> **A digital contract farming platform designed to connect farmers and buyers through transparent crop procurement, contract management, milestone-based payments, monitoring, and communication.**

AgriSure is a full-stack web application developed to address the uncertainty farmers face in finding reliable markets and securing predictable crop prices.

The platform enables farmers to list crops and manage farming information, while buyers can discover available crops, submit procurement requests, negotiate terms, and establish digital agreements. The system also provides contract monitoring, payment tracking, notifications, messaging, and administrative oversight.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Problem Statement](#-problem-statement)
* [Objectives](#-objectives)
* [Key Features](#-key-features)
* [Application Workflow](#-application-workflow)
* [User Roles](#-user-roles)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Frontend](#-frontend)
* [Backend](#-backend)
* [Database](#-database)
* [Authentication & Security](#-authentication--security)
* [Installation & Setup](#-installation--setup)
* [Demo Data](#-demo-data)
* [Environment Configuration](#-environment-configuration)
* [Production Considerations](#-production-considerations)
* [Future Enhancements](#-future-enhancements)
* [Project Status](#-project-status)
* [License](#-license)

---

## 🌾 Overview

Traditional agricultural markets can expose farmers to uncertain buyers, fluctuating prices, delayed payments, and limited access to reliable procurement channels.

**AgriSure** addresses these challenges by providing a centralized digital platform where farmers and buyers can establish structured procurement relationships.

The platform supports the complete contract farming lifecycle:

```text
Farmer Registration
        ↓
Profile & Verification
        ↓
Crop Listing
        ↓
Buyer Discovery
        ↓
Procurement Request
        ↓
Price & Terms Negotiation
        ↓
Digital Contract
        ↓
Milestone-Based Payment
        ↓
Crop Monitoring
        ↓
Inspection & Delivery
        ↓
Payment Release
        ↓
Contract Completion
```

---

## 🎯 Problem Statement

Farmers may face several challenges when selling agricultural produce:

* Uncertain access to reliable buyers
* Fluctuating market prices
* Lack of transparent procurement agreements
* Delayed or uncertain payments
* Limited communication with buyers
* Difficulty tracking contract progress
* Lack of centralized records for agreements and transactions

AgriSure aims to provide a structured digital environment where farmers and buyers can manage these activities through a single platform.

---

## 🎯 Objectives

The primary objectives of AgriSure are to:

* Provide farmers with access to structured procurement opportunities.
* Connect farmers directly with potential buyers.
* Enable transparent crop and contract information.
* Support digital contract management.
* Provide structured price negotiation.
* Track milestone-based payments.
* Monitor crop and contract progress.
* Improve communication between farmers and buyers.
* Provide administrative monitoring and verification.
* Maintain centralized records of contracts and activities.

---

# 🚀 Key Features

## 👨‍🌾 Farmer Features

Farmers can:

* Create and verify an account using OTP verification.
* Complete and manage their farmer profile.
* Add and manage crop listings.
* Specify crop variety, quantity, price, cultivation information, and expected harvest date.
* Receive procurement requests from buyers.
* Negotiate contract terms.
* Review and approve agreements.
* Track contract progress.
* Monitor payment status.
* Submit crop progress updates.
* Communicate with buyers through in-app messaging.
* Receive platform notifications.

---

## 🏢 Buyer / Company Features

Buyers can:

* Register and verify company accounts.
* Maintain company and procurement information.
* Browse available farmer crops.
* Search and filter crop listings.
* View crop and farmer information.
* Send procurement requests.
* Negotiate prices and contract terms.
* Establish digital agreements.
* Track contract and crop progress.
* Monitor inspections and milestones.
* Track payment and escrow status.
* Communicate with farmers.

---

## 🛡️ Admin Features

Administrators can:

* Monitor registered users.
* Review farmer and company verification status.
* Manage user accounts.
* Monitor contracts and agreements.
* Monitor payment and escrow activities.
* Review disputes and platform activities.
* Monitor inspections and crop progress.
* View platform notifications and messages.
* Access administrative analytics.

---

# 🔄 Application Workflow

### 1. Register & Verify

Farmers and buyers create accounts and complete OTP verification.

```text
Registration
     ↓
Email / OTP Verification
     ↓
Role Selection
     ↓
Profile Completion
     ↓
Verification Status
```

---

### 2. List & Discover Crops

Farmers publish available crops with relevant cultivation and expected production details.

Buyers can discover crops using search and filtering functionality.

```text
Farmer
   ↓
Add Crop
   ↓
Crop Listing
   ↓
Buyer Searches Crops
   ↓
Crop Details
```

---

### 3. Negotiate & Agree

Buyers can submit procurement requests.

Both parties can negotiate relevant contract terms such as:

* Crop
* Quantity
* Price
* Delivery conditions
* Expected harvest
* Contract terms

After agreement, the contract can proceed to the execution stage.

---

### 4. Fund & Track Payments

The platform is designed to support milestone-based payment tracking.

The current project model uses:

```text
20% Advance Payment
        +
Final Payment
        ↓
After Crop Release / Delivery Completion
```

> **Note:** The current implementation provides payment and escrow workflow support. Actual payment processing requires integration with a production payment provider.

---

### 5. Monitor Crop Progress

Farmers can submit crop progress information.

Buyers can monitor:

* Crop progress
* Expected harvest
* Inspection information
* Contract milestones
* Delivery status

---

### 6. Communication

The platform provides communication and notification functionality to keep farmers and buyers informed about:

* Procurement requests
* Contract updates
* Negotiations
* Payment events
* Monitoring updates
* Other contract-related activities

---

### 7. Administrative Oversight

Administrators provide centralized oversight of the platform.

```text
Users
  ├── Verification
  ├── Contracts
  ├── Payments
  ├── Inspections
  ├── Disputes
  └── Platform Activity
```

---

# 👥 User Roles

| Role                | Responsibilities                                                                    |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Farmer**          | Manage profile, list crops, receive requests, negotiate contracts, monitor payments |
| **Buyer / Company** | Discover crops, send requests, negotiate contracts, monitor procurement             |
| **Administrator**   | Verify users, monitor contracts, manage users, oversee platform activities          |

---

# 🛠️ Technology Stack

## Frontend

* **React.js**
* **Vite**
* **JSX**
* **Tailwind CSS**
* **React Router**
* **React Hook Form**
* **JWT-based authentication integration**

> The frontend uses **JSX only**. There are no `.ts` or `.tsx` source files.

## Backend

* **Python**
* **Django**
* **Django REST Framework**
* **JWT Authentication**
* **SQLite** for local development
* **PostgreSQL-ready configuration** for production

## Development Tools

* Git
* GitHub
* VS Code
* npm
* Python Virtual Environment

---

# 🏗️ System Architecture

AgriSure follows a client-server architecture.

```text
                    ┌──────────────────────┐
                    │      React + Vite    │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               │
                    ┌──────────▼───────────┐
                    │ Django REST Framework│
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
             Authentication  Contracts     Users
                 │             │             │
                 └─────────────┼─────────────┘
                               │
                    ┌──────────▼───────────┐
                    │       Database       │
                    │ SQLite / PostgreSQL  │
                    └──────────────────────┘
```

---

# 📁 Project Structure

```text
AgriSure/
│
├── Backend1/
│   ├── manage.py
│   ├── requirements.txt
│   ├── ...
│   └── apps/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── lib/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

> The exact application folders may vary depending on the current project structure.

---

# ⚛️ Frontend

The frontend is built using React and Vite.

The application is divided into:

### Public Website

The public-facing website contains:

* Home
* About
* Features
* How It Works
* Contact
* Farmer Registration
* Company Registration
* Login

### Authenticated Workspace

Logged-in users access their application through a workspace-style interface.

The workspace uses a **left sidebar navigation** rather than duplicating authenticated navigation links in the top navbar.

---

# 🔐 Authentication & Security

AgriSure uses JWT-based authentication for API access.

The authentication workflow includes:

```text
User Registration
       ↓
OTP Verification
       ↓
Account Authentication
       ↓
JWT Access Token
       ↓
Authenticated API Requests
```

Security-related functionality includes:

* JWT authentication
* Role-based access
* Protected API endpoints
* User ownership validation
* OTP-based account verification
* CORS configuration
* CSRF trusted-origin configuration
* Environment-based production configuration

Sensitive credentials should never be committed to the repository.

---

# 🗄️ Database

## Development

The project currently uses:

```text
SQLite
```

SQLite provides a simple database setup for local development and academic demonstration.

## Production

The backend is designed to support:

```text
PostgreSQL
```

For production deployment, PostgreSQL is recommended instead of SQLite.

---

# ⚙️ Installation & Setup

## Prerequisites

Install the following before running the project:

* Python 3.x
* Node.js
* npm
* Git

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd AgriSure
```

---

# 🐍 Backend Setup

Navigate to the active backend:

```bash
cd Backend1
```

### Create Virtual Environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

macOS / Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Seed Demo Data

```bash
python manage.py seed_demo
```

### Create Administrator

```bash
python manage.py createsuperuser
```

### Start Django Server

```bash
python manage.py runserver
```

The backend will normally be available at:

```text
http://127.0.0.1:8000/
```

---

# ⚛️ Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173/
```

---

# 🧪 Demo Data

The project includes a demo data command:

```bash
python manage.py seed_demo
```

The command is designed to be safely executed repeatedly.

It creates demonstration data covering areas such as:

* Farmer accounts
* Company accounts
* Contracts
* Escrow/payment records
* Crop monitoring
* Inspections
* Negotiations
* Notifications
* Messages

### Demo Password

Demo accounts use:

```text
DemoPass123!
```

### Demo Administrator

```text
Email: admin@gmail.com
Password: 12345678
```

> **Security warning:** These credentials are intended only for local demonstration. Replace them before any deployment or public exposure.

---

# 🔧 Environment Configuration

For production, configure environment variables instead of hard-coding secrets.

Important settings include:

```env
DEBUG=0

SECURITY_KEY=<strong-random-secret>

ALLOWED_HOSTS=<your-domain>

CORS_ALLOWED_ORIGINS=<frontend-domain>

CSRF_TRUSTED_ORIGINS=<trusted-frontend-domain>
```

Do not commit production secrets, API keys, passwords, or provider credentials to GitHub.

Add sensitive configuration files to `.gitignore`.

---

# 🚀 Production Considerations

Before deploying AgriSure to a production environment, the following areas require configuration or integration:

### Database

Replace local SQLite with PostgreSQL.

### Payment Integration

The current payment/escrow workflow requires integration with a real payment provider for actual financial transactions.

### E-Signature

Digital agreements require integration with a legally appropriate e-signature provider if legally binding electronic signatures are required.

### OTP / SMS

Production OTP functionality requires a real email/SMS provider and appropriate verification configuration.

### KYC / KYB

Identity and business verification require integration with appropriate KYC/KYB providers.

### Object Storage

Production file uploads should use reliable object storage rather than local development storage.

### Monitoring

Production deployments should include:

* Application logging
* Error monitoring
* Database backups
* Performance monitoring
* Security monitoring

### HTTPS

The application should be deployed behind HTTPS.

---

# 🔮 Future Enhancements

Potential future improvements include:

* Real-time notifications using WebSockets
* Advanced farmer and crop analytics
* Mobile application
* Payment gateway integration
* Digital e-signature integration
* KYC/KYB verification
* AI-assisted crop and price analytics
* Weather and market-data integration
* Advanced dispute-resolution workflow
* Automated contract reminders
* Cloud-based object storage
* Production-grade monitoring and observability

---

# 📊 Project Scope

AgriSure focuses on digitizing the contract farming workflow rather than replacing existing agricultural markets.

The system provides a structured platform for:

```text
Farmer
   ↕
Crop Information
   ↕
Procurement Request
   ↕
Negotiation
   ↕
Contract
   ↕
Payment Tracking
   ↕
Monitoring
   ↕
Delivery
```

The platform's effectiveness in real-world agricultural environments would depend on adoption, participating buyers and farmers, legal requirements, payment infrastructure, verification services, and regional agricultural practices.

---

# 🧪 Project Status

**Development Status:** Active Development

The current system implements the core application workflow, including:

* User registration
* OTP verification
* Role-based accounts
* Farmer profiles
* Company profiles
* Crop management
* Crop discovery
* Procurement requests
* Contract workflow
* Negotiation workflow
* Payment/escrow tracking
* Crop monitoring
* Inspections
* Notifications
* Messaging
* Administrative management

External integrations such as production payment processing, KYC/KYB, e-signatures, SMS services, and third-party inspection services require provider-specific configuration.

---

# 📚 Academic Project

**Project Title:**

> **AgriSure: Assured Contract Farming System for Stable Market Access for Farmers**

AgriSure is developed as a full-stack academic major project exploring how web technologies can be used to improve transparency and coordination between farmers and agricultural buyers.

### Core Technologies

```text
React
   +
Django REST Framework
   +
JWT Authentication
   +
SQLite / PostgreSQL
   +
REST APIs
```

---

# 🤝 Contributing

Contributions are welcome.

To contribute:

```bash
git checkout -b feature/your-feature
```

Make your changes, test them, and commit:

```bash
git add .
git commit -m "Add: your feature"
```

Push the branch:

```bash
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📄 License

This project is developed for academic and educational purposes.

Add an appropriate open-source license if you intend to distribute the project publicly.

---

# 👨‍💻 Author

**Devkaran Patidar**

**Full Stack Web Developer**

Technologies: React.js · Django · Django REST Framework · Python · REST APIs · JWT · SQLite · PostgreSQL

---

## ⭐ AgriSure

**Connecting farmers and buyers through structured digital contract farming.**
