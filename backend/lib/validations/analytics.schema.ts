import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  year: z.coerce.number().min(2020).max(2100).optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  department: z.string().optional(),
});

export const reportTypeEnum = z.enum([
  'EMPLOYEE_ROSTER',
  'ATTENDANCE_SUMMARY',
  'LEAVE_LEDGER',
  'PAYROLL_REGISTER',
]);

export const reportFormatEnum = z.enum(['JSON', 'CSV']).default('JSON');

export const reportExportQuerySchema = z.object({
  type: reportTypeEnum,
  format: reportFormatEnum,
  department: z.string().optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2020).max(2100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type ReportExportQueryInput = z.infer<typeof reportExportQuerySchema>;
export type ReportType = z.infer<typeof reportTypeEnum>;
export type ReportFormat = z.infer<typeof reportFormatEnum>;
