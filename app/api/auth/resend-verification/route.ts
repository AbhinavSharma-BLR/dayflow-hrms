import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { validateRequestBody } from '@/lib/middleware/withValidation';
import { resendVerificationSchema } from '@/lib/validations/auth.schema';
import { authService } from '@/lib/services/auth.service';

export const POST = createApiHandler(async (req: NextRequest) => {
  const input = await validateRequestBody(req, resendVerificationSchema);
  const result = await authService.resendVerification(input.email);

  return successResponse({
    message: 'If an unverified account exists with that email address, a verification link has been sent.',
    ...(process.env.NODE_ENV === 'development' && result.verifyUrl ? { devVerifyUrl: result.verifyUrl } : {}),
  });
});
