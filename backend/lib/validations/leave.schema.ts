import { z } from 'zod';
import { LeaveType, LeaveStatus } from '@prisma/client';

export const applyLeaveSchema = z
  .object({
    type: z.nativeEnum(LeaveType),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
    reason: z.string().min(5, 'Reason must be at least 5 characters long').max(500, 'Reason cannot exceed 500 characters'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be greater than or equal to start date',
    path: ['endDate'],
  });

export const processLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'] as const),
  hrComment: z.string().max(500, 'Comment cannot exceed 500 characters').optional(),
});

export const leaveQuerySchema = z.object({
  status: z.nativeEnum(LeaveStatus).optional(),
  type: z.nativeEnum(LeaveType).optional(),
  employeeId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;
export type ProcessLeaveInput = z.infer<typeof processLeaveSchema>;
export type LeaveQueryInput = z.infer<typeof leaveQuerySchema>;
