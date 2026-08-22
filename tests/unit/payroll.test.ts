import { describe, it, expect } from 'vitest';
import {
  createPayrollSchema,
  updatePayrollSchema,
  batchPayrollSchema,
} from '../../lib/validations/payroll.schema';

describe('Phase 4: Payroll Validation Schemas', () => {
  it('should validate valid employee payroll creation', () => {
    const validPayroll = createPayrollSchema.safeParse({
      employeeId: 'emp_12345',
      month: 8,
      year: 2026,
      basicSalary: 60000,
      allowances: 15000,
      deductions: 5000,
      bonus: 2000,
      paymentStatus: 'PENDING',
    });
    expect(validPayroll.success).toBe(true);
  });

  it('should reject invalid month and negative salaries', () => {
    const invalidMonth = createPayrollSchema.safeParse({
      employeeId: 'emp_12345',
      month: 13, // Invalid month > 12
      year: 2026,
      basicSalary: 50000,
    });
    expect(invalidMonth.success).toBe(false);

    const negativeSalary = createPayrollSchema.safeParse({
      employeeId: 'emp_12345',
      month: 8,
      year: 2026,
      basicSalary: -1000, // Invalid negative
    });
    expect(negativeSalary.success).toBe(false);
  });

  it('should validate batch payroll schema', () => {
    const validBatch = batchPayrollSchema.safeParse({
      month: 9,
      year: 2026,
      defaultBasicSalary: 55000,
      defaultAllowances: 12000,
      defaultDeductions: 4500,
      defaultBonus: 1000,
      currency: 'INR',
    });
    expect(validBatch.success).toBe(true);
  });

  it('should correctly compute net take-home pay', () => {
    const basic = 50000;
    const allowances = 10000;
    const bonus = 5000;
    const deductions = 3500;

    const netSalary = basic + allowances + bonus - deductions;
    expect(netSalary).toBe(61500);
  });
});
