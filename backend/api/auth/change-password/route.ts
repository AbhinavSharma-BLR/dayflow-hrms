import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { authService } from '@/lib/services/auth.service';
import { requireAuth } from '@/lib/middleware/withAuth';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New password and confirmation do not match',
  path: ['confirmPassword'],
});

export const POST = createApiHandler(async (req: NextRequest) => {
  const user = await requireAuth(req);
  const body = await req.json();
  const parsed = changePasswordSchema.parse(body);

  const result = await authService.changePassword(user.id, parsed.currentPassword, parsed.newPassword);
  return successResponse(result);
});
