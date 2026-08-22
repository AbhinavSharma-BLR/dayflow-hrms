import { describe, it, expect } from 'vitest';
import {
  analyticsQuerySchema,
  reportExportQuerySchema,
} from '../../lib/validations/analytics.schema';

describe('Phase 5: Analytics & Reports Validation Schemas', () => {
  it('should validate valid analytics query params', () => {
    const valid = analyticsQuerySchema.safeParse({
      year: 2026,
      month: 8,
      department: 'Engineering',
    });
    expect(valid.success).toBe(true);
  });

  it('should validate report export schema for all 4 report types', () => {
    const roster = reportExportQuerySchema.safeParse({
      type: 'EMPLOYEE_ROSTER',
      format: 'CSV',
      department: 'Engineering',
    });
    expect(roster.success).toBe(true);

    const attendance = reportExportQuerySchema.safeParse({
      type: 'ATTENDANCE_SUMMARY',
      format: 'JSON',
      month: 8,
      year: 2026,
    });
    expect(attendance.success).toBe(true);

    const leaves = reportExportQuerySchema.safeParse({
      type: 'LEAVE_LEDGER',
      format: 'CSV',
    });
    expect(leaves.success).toBe(true);

    const payroll = reportExportQuerySchema.safeParse({
      type: 'PAYROLL_REGISTER',
      format: 'CSV',
      month: 8,
      year: 2026,
    });
    expect(payroll.success).toBe(true);
  });

  it('should reject invalid report types', () => {
    const invalid = reportExportQuerySchema.safeParse({
      type: 'UNKNOWN_REPORT_TYPE',
      format: 'CSV',
    });
    expect(invalid.success).toBe(false);
  });
});
