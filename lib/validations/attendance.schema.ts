import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const checkInSchema = z.object({
  notes: z.string().max(255).optional(),
});

export const checkOutSchema = z.object({
  notes: z.string().max(255).optional(),
});

export const hrAttendanceOverrideSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  status: z.nativeEnum(AttendanceStatus),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  totalHours: z.number().min(0).max(24).optional(),
  notes: z.string().max(255).optional(),
});

export const attendanceQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(30),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type HRAttendanceOverrideInput = z.infer<typeof hrAttendanceOverrideSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
