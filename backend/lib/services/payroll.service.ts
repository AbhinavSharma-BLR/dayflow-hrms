import { payrollRepository } from '../repositories/payroll.repository';
import { employeeRepository } from '../repositories/employee.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { AppError } from '../errors';
import { NotificationType, Role } from '@prisma/client';
import {
  CreatePayrollInput,
  UpdatePayrollInput,
  BatchPayrollInput,
  PayrollQueryInput,
} from '../validations/payroll.schema';

export class PayrollService {
  /**
   * Helper to fetch employee by user ID
   */
  private async getEmployee(userId: string) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }
    return employee;
  }

  /**
   * Employee: Get personal payslips and earnings summary
   */
  async getEmployeePayrolls(userId: string, year?: number) {
    const employee = await this.getEmployee(userId);
    const targetYear = year || new Date().getFullYear();

    const payrolls = await payrollRepository.getEmployeePayrolls(employee.id, targetYear);

    // Compute Year-to-Date Summary
    let ytdGross = 0;
    let ytdDeductions = 0;
    let ytdNet = 0;
    let paidCount = 0;

    for (const p of payrolls) {
      if (p.paymentStatus === 'PAID') {
        ytdGross += p.basicSalary + p.allowances + p.bonus;
        ytdDeductions += p.deductions;
        ytdNet += p.netSalary;
        paidCount++;
      }
    }

    return {
      year: targetYear,
      summary: {
        ytdGross: Math.round(ytdGross),
        ytdDeductions: Math.round(ytdDeductions),
        ytdNet: Math.round(ytdNet),
        paidCount,
        totalPayslips: payrolls.length,
        currentMonthlySalary: payrolls.length > 0 ? payrolls[0].netSalary : 0,
      },
      payrolls,
    };
  }

  /**
   * Employee / HR: Get individual payslip details
   */
  async getPayslip(userId: string, userRole: Role, payrollId: string) {
    const payroll = await payrollRepository.findById(payrollId);
    if (!payroll) {
      throw AppError.notFound('Payslip not found');
    }

    if (userRole !== Role.HR) {
      const employee = await this.getEmployee(userId);
      if (payroll.employeeId !== employee.id) {
        throw AppError.forbidden('You do not have permission to view this payslip');
      }
    }

    return payroll;
  }

  /**
   * HR: Get organization payroll ledger and statistics
   */
  async getHRPayrollLedger(query: PayrollQueryInput) {
    const now = new Date();
    const month = query.month || now.getMonth() + 1;
    const year = query.year || now.getFullYear();

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [stats, { total, records }] = await Promise.all([
      payrollRepository.getMonthStats(month, year),
      payrollRepository.getAllPayrolls({
        month: query.month,
        year: query.year,
        employeeId: query.employeeId,
        department: query.department,
        paymentStatus: query.paymentStatus,
        skip,
        take,
      }),
    ]);

    return {
      stats,
      records,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * HR: Create or update a single employee's payroll
   */
  async createOrUpdatePayroll(hrUserId: string, input: CreatePayrollInput) {
    const hrEmployee = await this.getEmployee(hrUserId);
    const targetEmployee = await employeeRepository.findById(input.employeeId);
    if (!targetEmployee) {
      throw AppError.notFound('Target employee not found');
    }

    const netSalary = input.basicSalary + input.allowances + input.bonus - input.deductions;
    if (netSalary < 0) {
      throw AppError.badRequest('Net salary cannot be negative');
    }

    const paymentDate = input.paymentDate ? new Date(input.paymentDate) : input.paymentStatus === 'PAID' ? new Date() : null;

    const payroll = await payrollRepository.upsertPayroll({
      employeeId: input.employeeId,
      month: input.month,
      year: input.year,
      basicSalary: input.basicSalary,
      allowances: input.allowances,
      deductions: input.deductions,
      bonus: input.bonus,
      netSalary,
      currency: input.currency || 'INR',
      paymentStatus: input.paymentStatus || 'PENDING',
      paymentDate,
      notes: input.notes,
      createdById: hrEmployee.id,
    });

    if (input.paymentStatus === 'PAID') {
      await notificationRepository.createNotification({
        employeeId: targetEmployee.id,
        type: NotificationType.PAYROLL_UPDATED,
        title: 'Salary Slip Updated / Paid',
        message: `Your salary slip for ${input.month}/${input.year} of ${input.currency || 'INR'} ${netSalary.toLocaleString()} has been marked as Paid.`,
      });
    }

    return {
      message: 'Payroll record saved successfully',
      payroll,
    };
  }

  /**
   * HR: Run batch payroll generation for all active employees
   */
  async runBatchPayroll(hrUserId: string, input: BatchPayrollInput) {
    const hrEmployee = await this.getEmployee(hrUserId);

    const result = await payrollRepository.batchCreateForActiveEmployees({
      month: input.month,
      year: input.year,
      defaultBasicSalary: input.defaultBasicSalary,
      defaultAllowances: input.defaultAllowances,
      defaultDeductions: input.defaultDeductions,
      defaultBonus: input.defaultBonus,
      currency: input.currency || 'INR',
      createdById: hrEmployee.id,
    });

    return {
      message: `Batch payroll processed: ${result.createdCount} payslip(s) generated, ${result.skippedCount} already existed.`,
      result,
    };
  }

  /**
   * HR: Mark a payroll as PAID / Disbursed
   */
  async markAsPaid(
    hrUserId: string,
    payrollId: string,
    updateData: UpdatePayrollInput
  ) {
    const payroll = await payrollRepository.findById(payrollId);
    if (!payroll) {
      throw AppError.notFound('Payroll record not found');
    }

    let basicSalary = updateData.basicSalary ?? payroll.basicSalary;
    let allowances = updateData.allowances ?? payroll.allowances;
    let deductions = updateData.deductions ?? payroll.deductions;
    let bonus = updateData.bonus ?? payroll.bonus;
    let netSalary = basicSalary + allowances + bonus - deductions;

    const paymentStatus = updateData.paymentStatus || 'PAID';
    const paymentDate = updateData.paymentDate ? new Date(updateData.paymentDate) : paymentStatus === 'PAID' ? new Date() : null;

    const updated = await payrollRepository.upsertPayroll({
      employeeId: payroll.employeeId,
      month: payroll.month,
      year: payroll.year,
      basicSalary,
      allowances,
      deductions,
      bonus,
      netSalary,
      currency: payroll.currency,
      paymentStatus,
      paymentDate,
      notes: updateData.notes ?? payroll.notes ?? undefined,
    });

    if (paymentStatus === 'PAID') {
      await notificationRepository.createNotification({
        employeeId: payroll.employeeId,
        type: NotificationType.PAYROLL_UPDATED,
        title: 'Salary Disbursed',
        message: `Your salary for ${payroll.month}/${payroll.year} (${payroll.currency} ${netSalary.toLocaleString()}) has been disbursed.`,
      });
    }

    return {
      message: 'Payroll status updated successfully',
      payroll: updated,
    };
  }
}

export const payrollService = new PayrollService();
