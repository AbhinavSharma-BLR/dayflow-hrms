import { describe, it, expect } from 'vitest';
import { checkInSchema, checkOutSchema, hrAttendanceOverrideSchema } from '../../lib/validations/attendance.schema';
import { AttendanceStatus } from '@prisma/client';

describe('Phase 3: Attendance Validation Schemas', () => {
  it('should validate valid check-in and check-out schemas', () => {
    const inRes = checkInSchema.safeParse({ notes: 'Working remotely' });
    expect(inRes.success).toBe(true);

    const outRes = checkOutSchema.safeParse({});
    expect(outRes.success).toBe(true);
  });

  it('should validate HR manual attendance override schema', () => {
    const validOverride = hrAttendanceOverrideSchema.safeParse({
      employeeId: 'emp_123',
      date: '2026-08-22',
      status: AttendanceStatus.PRESENT,
      totalHours: 8.5,
      notes: 'Manual log approved',
    });
    expect(validOverride.success).toBe(true);
  });

  it('should reject invalid date format in HR override', () => {
    const invalidOverride = hrAttendanceOverrideSchema.safeParse({
      employeeId: 'emp_123',
      date: '22-08-2026', // wrong format
      status: AttendanceStatus.PRESENT,
    });
    expect(invalidOverride.success).toBe(false);
  });
});
