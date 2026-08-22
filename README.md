# Dayflow — Human Resource Management System (HRMS)

Dayflow is a modern, enterprise-ready Human Resource Management System built with Next.js 14 App Router, TypeScript, Prisma ORM, PostgreSQL, Tailwind CSS, and shadcn/ui.

---

## 🏗 Architecture & Layers

Dayflow follows a strict layered monorepo architecture:

```
UI Components (app/ & components/)
       ↓
API Layer (app/api/ & lib/api-handler.ts)
       ↓
Service Layer (lib/services/)
       ↓
Repository / Data Access Layer (lib/repositories/)
       ↓
Database Layer (Prisma ORM & PostgreSQL)
```

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript (Strict)
- **Styling**: Tailwind CSS + shadcn/ui primitives + NextThemes (Light/Dark Mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication Scaffolding**: NextAuth.js v5 (Auth.js) foundation
- **Validation**: Zod (Shared frontend/backend schemas)
- **State Management**: Zustand (Global UI state) + TanStack Query (Server state)
- **Testing**: Vitest (Unit & Integration)

---

## 📁 Repository Directory Structure

```
dayflow-hrms/
├── frontend/                     # 🖥️ Complete Frontend Application
│   ├── app/                      # App Router UI (Auth, Employee Portal, HR Console)
│   ├── components/               # UI Primitives & Shell Layout Components
│   └── README.md                 # Frontend Architecture Documentation
├── backend/                      # ⚙️ Complete Backend Application
│   ├── api/                      # REST API Endpoints (Auth, Employees, Attendance, Leaves, Payroll, Analytics, Reports)
│   ├── lib/                      # Services, Repositories, Validations, Security & Middleware
│   └── README.md                 # Backend Architecture Documentation
├── database/                     # 🗄️ Database Layer
│   ├── prisma/                   # Prisma Schema (7 Models) & Seed Scripts
│   └── README.md                 # Database Architecture & ER Documentation
├── app/                          # Runnable Next.js App Router Root
├── components/                   # Design System Primitives & Shells
├── lib/                          # Backend Services, Repositories & Utilities
├── prisma/                       # Prisma ORM Schema & Database Configuration
├── tests/                        # Vitest Automated Test Suite (12 Suites, 36 Tests)
├── middleware.ts                 # Route Authorization & Security Middleware
├── tailwind.config.ts            # Design System Configuration
├── tsconfig.json                 # Strict TypeScript Configuration
└── package.json                  # Root Dependencies & Project Scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18
- PostgreSQL database instance

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and set your connection strings:
```bash
cp .env.example .env.local
```

### 4. Database Setup
Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma db push # or npx prisma migrate dev --name init
```

### 5. Running the Application
```bash
# Development server
npm run dev

# TypeScript checking
npm run typecheck

# Unit testing
npm run test:unit

# Production build
npm run build
```

---

## 🛡 API Response Format

All API endpoints return responses adhering to this standard shape:

```json
{
  "success": true,
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

## 🗓 6-Phase Execution Roadmap

- [x] **Phase 1 — Foundation & Project Setup** (Complete)
- [x] **Phase 2 — Authentication + Employee Core** (Complete)
- [x] **Phase 3 — Attendance + Leave Management** (Complete)
- [x] **Phase 4 — HR Management + Payroll** (Complete)
- [x] **Phase 5 — Analytics + Reports + Polish** (Complete)
- [x] **Phase 6 — Security + Testing + Production Readiness** (Complete)

---

## 🔑 Demo Seed Accounts

| Role | Email | Password | Primary Features |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `admin.hr@dayflow.com` | `Admin123!` | Employee Directory, Attendance Oversight, Leave Approvals, Batch Payroll, Analytics, Reports |
| **Employee** | `alex.rivera@dayflow.com` | `Employee123!` | Personal Dashboard, Profile Editing, Punch Clock In/Out, Leave Applications, Digital Payslips |

---

## 🧪 Verification & Production Readiness

- **36 Comprehensive Unit Tests**: `npm run test:unit`
- **Strict TypeScript Validation**: `npm run typecheck` (0 errors)
- **Production Build**: `npm run build` (All 42 routes compiled)
- **System Health Endpoint**: `GET /api/health`

