import { describe, it, expect } from 'vitest';
import { applyLeaveSchema, processLeaveSchema } from '../../lib/validations/leave.schema';
import { LeaveType } from '@prisma/client';

describe('Phase 3: Leave Validation Schemas', () => {
  it('should validate valid leave application', () => {
    const validLeave = applyLeaveSchema.safeParse({
      type: LeaveType.PAID,
      startDate: '2026-08-25',
      endDate: '2026-08-28',
      reason: 'Family vacation trip',
    });
    expect(validLeave.success).toBe(true);
  });

  it('should reject when endDate is before startDate', () => {
    const invalidDates = applyLeaveSchema.safeParse({
      type: LeaveType.SICK,
      startDate: '2026-08-28',
      endDate: '2026-08-25',
      reason: 'Medical recovery',
    });
    expect(invalidDates.success).toBe(false);
  });

  it('should reject reasons that are too short', () => {
    const shortReason = applyLeaveSchema.safeParse({
      type: LeaveType.PAID,
      startDate: '2026-08-25',
      endDate: '2026-08-25',
      reason: 'sick', // < 5 characters
    });
    expect(shortReason.success).toBe(false);
  });

  it('should validate HR decision schema', () => {
    const approveDecision = processLeaveSchema.safeParse({
      status: 'APPROVED',
      hrComment: 'Approved by HR',
    });
    expect(approveDecision.success).toBe(true);

    const rejectDecision = processLeaveSchema.safeParse({
      status: 'REJECTED',
      hrComment: 'Sprint deadline conflict',
    });
    expect(rejectDecision.success).toBe(true);
  });
});
