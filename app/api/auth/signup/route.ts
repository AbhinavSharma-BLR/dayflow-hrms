import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { authService } from '@/lib/services/auth.service';
import { signupSchema } from '@/lib/validations/auth.schema';

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = signupSchema.parse(body);

  const result = await authService.signup(parsed);
  return successResponse(result, undefined, 201);
});
