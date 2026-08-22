import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { validateRequestBody } from '@/lib/middleware/withValidation';
import { verifyEmailSchema } from '@/lib/validations/auth.schema';
import { authService } from '@/lib/services/auth.service';

export const POST = createApiHandler(async (req: NextRequest) => {
  const input = await validateRequestBody(req, verifyEmailSchema);
  const result = await authService.verifyEmail(input.token);

  return successResponse({
    message: 'Email verified successfully. You can now sign in to your account.',
    email: result.email,
  });
});
