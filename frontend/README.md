# 🖥️ Frontend Architecture — Dayflow HRMS

The frontend of **Dayflow HRMS** is built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** design primitives.

---

## 📁 Directory Structure

```
frontend/
├── app/
│   ├── (auth)/               # Authentication Pages (Login, Sign-Up, Verify Email)
│   ├── (employee)/           # Employee Self-Service Portal
│   │   ├── dashboard/        # Personal KPI Dashboard, Punch Clock & Time-Off status
│   │   ├── profile/          # Profile Management & Contact Info
│   │   ├── attendance/       # Live Punch Clock In/Out & Monthly Attendance Ledger
│   │   ├── leave/            # Leave Balances & Time-Off Application Modal
│   │   └── payroll/          # Digital & Printable Payslips Archive
│   ├── (hr)/                 # HR Administrator Console
│   │   ├── dashboard/        # Organization Workforce & Attendance Overview
│   │   ├── employees/        # Employee Directory & Onboarding Modal
│   │   ├── attendance/       # Workforce Attendance Real-Time Tracking & Overrides
│   │   ├── leaves/           # Leave Approvals Inbox (1-Click Approve/Reject)
│   │   ├── payroll/          # Monthly Batch Payroll Generator & Compensation Register
│   │   ├── analytics/        # Workforce & Financial Insights Visualizer
│   │   └── reports/          # Enterprise Data Center (CSV/JSON Export & Print)
│   ├── globals.css           # Global Theme Tokens (Light & Dark Mode)
│   ├── layout.tsx            # Root Shell Layout & Theme Providers
│   └── page.tsx              # Landing & Auth Gateway
└── components/
    ├── ui/                   # Reusable UI Primitives (Button, Card, Input, Badge, Dialog)
    ├── shared/               # Shell Components (Sidebar, Topbar, PageHeader, ThemeToggle)
    └── providers.tsx         # NextThemes & Session Providers
```

---

## 🎨 UI/UX Highlights
- **Full Dark & Light Mode**: Seamless theme switching via `next-themes` and CSS HSL variables.
- **Responsive Shell Layout**: Collapsible desktop sidebar and mobile-friendly navigation.
- **Printable Reports & Payslips**: Direct `@media print` stylesheets for official company salary slips and reports.
- **Dynamic Micro-Interactions**: Toast alerts (`sonner`), animated indicators, and responsive charts.
