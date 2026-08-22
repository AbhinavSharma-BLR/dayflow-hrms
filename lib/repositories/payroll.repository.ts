import { BaseRepository } from './base.repository';

export class PayrollRepository extends BaseRepository {
  /**
   * Find a specific payroll record by employee, month, and year
   */
  async findByEmployeeMonthYear(employeeId: string, month: number, year: number) {
    return this.db.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            designation: true,
          },
        },
      },
    });
  }

  /**
   * Find a payroll record by ID with full employee details
   */
  async findById(id: string) {
    return this.db.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            department: true,
            designation: true,
            dateOfJoining: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  /**
   * Create or update a single employee's payroll record
   */
  async upsertPayroll(data: {
    employeeId: string;
    month: number;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    bonus: number;
    netSalary: number;
    currency?: string;
    paymentStatus?: string;
    paymentDate?: Date | null;
    notes?: string;
    createdById?: string;
  }) {
    return this.db.payroll.upsert({
      where: {
        employeeId_month_year: {
          employeeId: data.employeeId,
          month: data.month,
          year: data.year,
        },
      },
      create: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        basicSalary: data.basicSalary,
        allowances: data.allowances,
        deductions: data.deductions,
        bonus: data.bonus,
        netSalary: data.netSalary,
        currency: data.currency || 'INR',
        paymentStatus: data.paymentStatus || 'PENDING',
        paymentDate: data.paymentDate,
        notes: data.notes,
        createdById: data.createdById,
      },
      update: {
        basicSalary: data.basicSalary,
        allowances: data.allowances,
        deductions: data.deductions,
        bonus: data.bonus,
        netSalary: data.netSalary,
        currency: data.currency || undefined,
        paymentStatus: data.paymentStatus || undefined,
        paymentDate: data.paymentDate,
        notes: data.notes || undefined,
      },
      include: {
        employee: true,
      },
    });
  }

  /**
   * Update payment status (e.g. Mark as PAID)
   */
  async updatePaymentStatus(
    id: string,
    status: string,
    paymentDate?: Date | null,
    notes?: string
  ) {
    return this.db.payroll.update({
      where: { id },
      data: {
        paymentStatus: status,
        paymentDate: paymentDate !== undefined ? paymentDate : status === 'PAID' ? new Date() : undefined,
        notes: notes || undefined,
      },
      include: {
        employee: true,
      },
    });
  }

  /**
   * Get employee's personal payroll history
   */
  async getEmployeePayrolls(employeeId: string, year?: number) {
    const where: any = { employeeId };
    if (year) where.year = year;

    return this.db.payroll.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  /**
   * Get organization-wide payroll records with filters and pagination
   */
  async getAllPayrolls(params: {
    month?: number;
    year?: number;
    employeeId?: string;
    department?: string;
    paymentStatus?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (params.month) where.month = params.month;
    if (params.year) where.year = params.year;
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.paymentStatus) where.paymentStatus = params.paymentStatus;

    if (params.department) {
      where.employee = {
        department: params.department,
      };
    }

    const [total, records] = await Promise.all([
      this.db.payroll.count({ where }),
      this.db.payroll.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              designation: true,
              profilePicture: true,
            },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip: params.skip || 0,
        take: params.take || 50,
      }),
    ]);

    return { total, records };
  }

  /**
   * Get summary statistics for a given month/year
   */
  async getMonthStats(month: number, year: number) {
    const records = await this.db.payroll.findMany({
      where: { month, year },
      select: {
        netSalary: true,
        basicSalary: true,
        allowances: true,
        deductions: true,
        paymentStatus: true,
      },
    });

    const totalEmployees = await this.db.employee.count({ where: { isActive: true } });
    const processedCount = records.length;

    let totalBudget = 0;
    let totalDisbursed = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;

    for (const r of records) {
      totalBudget += r.netSalary;
      if (r.paymentStatus === 'PAID') {
        totalDisbursed += r.netSalary;
        paidCount++;
      } else {
        totalPending += r.netSalary;
        pendingCount++;
      }
    }

    return {
      month,
      year,
      totalEmployees,
      processedCount,
      totalBudget: Math.round(totalBudget),
      totalDisbursed: Math.round(totalDisbursed),
      totalPending: Math.round(totalPending),
      paidCount,
      pendingCount,
      unprocessedCount: Math.max(0, totalEmployees - processedCount),
    };
  }

  /**
   * Batch create payroll for all active employees
   */
  async batchCreateForActiveEmployees(params: {
    month: number;
    year: number;
    defaultBasicSalary: number;
    defaultAllowances: number;
    defaultDeductions: number;
    defaultBonus: number;
    currency: string;
    createdById?: string;
  }) {
    const activeEmployees = await this.db.employee.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
    });

    const netSalary =
      params.defaultBasicSalary +
      params.defaultAllowances +
      params.defaultBonus -
      params.defaultDeductions;

    let createdCount = 0;
    let skippedCount = 0;

    for (const emp of activeEmployees) {
      const existing = await this.db.payroll.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month: params.month,
            year: params.year,
          },
        },
      });

      if (!existing) {
        await this.db.payroll.create({
          data: {
            employeeId: emp.id,
            month: params.month,
            year: params.year,
            basicSalary: params.defaultBasicSalary,
            allowances: params.defaultAllowances,
            deductions: params.defaultDeductions,
            bonus: params.defaultBonus,
            netSalary,
            currency: params.currency,
            paymentStatus: 'PENDING',
            createdById: params.createdById,
          },
        });
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      totalActive: activeEmployees.length,
      createdCount,
      skippedCount,
    };
  }
}

export const payrollRepository = new PayrollRepository();
