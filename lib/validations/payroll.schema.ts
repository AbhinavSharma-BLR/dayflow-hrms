import { z } from 'zod';

export const createPayrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  month: z.coerce.number().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.coerce.number().min(2020).max(2100, 'Year must be a valid 4-digit year'),
  basicSalary: z.coerce.number().min(0, 'Basic salary must be non-negative'),
  allowances: z.coerce.number().min(0, 'Allowances must be non-negative').default(0),
  deductions: z.coerce.number().min(0, 'Deductions must be non-negative').default(0),
  bonus: z.coerce.number().min(0, 'Bonus must be non-negative').default(0),
  currency: z.string().default('INR'),
  paymentStatus: z.enum(['PENDING', 'PROCESSING', 'PAID']).default('PENDING'),
  paymentDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const updatePayrollSchema = z.object({
  basicSalary: z.coerce.number().min(0).optional(),
  allowances: z.coerce.number().min(0).optional(),
  deductions: z.coerce.number().min(0).optional(),
  bonus: z.coerce.number().min(0).optional(),
  paymentStatus: z.enum(['PENDING', 'PROCESSING', 'PAID']).optional(),
  paymentDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const batchPayrollSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
  defaultBasicSalary: z.coerce.number().min(0).default(50000),
  defaultAllowances: z.coerce.number().min(0).default(10000),
  defaultDeductions: z.coerce.number().min(0).default(5000),
  defaultBonus: z.coerce.number().min(0).default(0),
  currency: z.string().default('INR'),
});

export const payrollQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2020).max(2100).optional(),
  employeeId: z.string().optional(),
  paymentStatus: z.enum(['PENDING', 'PROCESSING', 'PAID']).optional(),
  department: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreatePayrollInput = z.infer<typeof createPayrollSchema>;
export type UpdatePayrollInput = z.infer<typeof updatePayrollSchema>;
export type BatchPayrollInput = z.infer<typeof batchPayrollSchema>;
export type PayrollQueryInput = z.infer<typeof payrollQuerySchema>;
