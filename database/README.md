# 🗄️ Database Architecture — Dayflow HRMS

Dayflow HRMS uses **PostgreSQL** paired with **Prisma ORM** for type-safe schema modeling, automatic migrations, and relationship management.

---

## 📁 Directory Structure

```
database/
└── prisma/
    ├── schema.prisma         # Complete Database Schema (7 Models & Enums)
    └── seed.ts               # Database Seeding Script with Demo Accounts & Initial Data
```

---

## 📊 Core Data Models

1. **`User`**: Core authentication identity (`email`, `passwordHash`, `role: HR | EMPLOYEE`, `emailVerified`).
2. **`Employee`**: Personnel master profile (`employeeId`, `firstName`, `lastName`, `department`, `designation`, `dateOfJoining`, `isActive`).
3. **`Attendance`**: Daily punch records (`date`, `checkIn`, `checkOut`, `status: PRESENT | ABSENT | HALF_DAY | LEAVE`, `totalHours`).
4. **`Leave`**: Time-off management (`type: PAID | SICK | UNPAID`, `startDate`, `endDate`, `totalDays`, `status: PENDING | APPROVED | REJECTED`, `hrComment`).
5. **`Payroll`**: Compensation & wage registry (`month`, `year`, `basicSalary`, `allowances`, `deductions`, `bonus`, `netSalary`, `paymentStatus: PENDING | PROCESSING | PAID`).
6. **`Notification`**: In-app employee alerts (`type`, `title`, `message`, `isRead`).
7. **`AuditLog`**: System compliance audit trail (`action`, `entity`, `entityId`, `performedBy`, `oldValue`, `newValue`).

---

## ⚡ Setup Commands

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations / push schema
npx prisma db push

# Seed initial database with HR & Employee demo data
npm run db:seed
```
