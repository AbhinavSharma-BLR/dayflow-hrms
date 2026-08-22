# ⚙️ Backend Architecture — Dayflow HRMS

The backend of **Dayflow HRMS** is implemented following a strict **Layered Service-Repository Pattern** with robust data validations, Role-Based Access Control (RBAC), and enterprise security measures.

---

## 📁 Directory Structure

```
backend/
├── api/                      # REST API Route Handlers
│   ├── auth/                 # Authentication & Bootstrap Endpoints
│   ├── employees/            # Employee CRUD & Profile Management
│   ├── attendance/           # Punch In, Punch Out, Daily & Monthly Attendance
│   ├── leaves/               # Leave Application & HR Approval Pipeline
│   ├── payroll/              # Individual & Batch Payroll Runner
│   ├── analytics/            # Workforce & Financial Aggregations
│   ├── reports/              # Standard Enterprise Report Generator & CSV Exporter
│   ├── health/               # System Health Probe & Database Latency Monitor
│   └── notifications/        # Real-time In-App Notification Delivery
└── lib/
    ├── services/             # Business Logic Layer (Auth, Leave, Payroll, Analytics, Audit)
    ├── repositories/         # Data Access Layer (Prisma Database Queries)
    ├── validations/          # Zod Request Schemas
    ├── security/             # Rate Limiter & Security Utilities
    ├── middleware/           # RBAC Authorization Guards (withAuth)
    ├── errors.ts             # Centralized AppError & ErrorCode Mapping
    ├── api-handler.ts        # Typed API Handler Wrapper
    └── api-response.ts       # Standardized { success, data, error, meta } Response Envelope
```

---

## 🛡️ Security Features
- **Role-Based Access Control (RBAC)**: Enforces `HR` and `EMPLOYEE` permission scopes on all protected routes.
- **Sliding-Window Rate Limiter**: Protects against brute-force and DDoS attacks on auth and financial APIs.
- **Audit Logging Service**: Captures administrative operations (salary adjustments, leave decisions, employee profile changes).
- **HTTP Security Headers**: HSTS, CSP, X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`).
- **Standardized Error Handling**: Prevents internal stack leaks with structured error codes.
