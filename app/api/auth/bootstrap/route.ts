import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { authService } from '@/lib/services/auth.service';
import { z } from 'zod';

const bootstrapSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

export const POST = createApiHandler(async (req: NextRequest) => {
  let email: string | undefined;
  let password: string | undefined;

  try {
    const body = await req.json();
    const parsed = bootstrapSchema.parse(body);
    email = parsed.email;
    password = parsed.password;
  } catch (err) {
    // Body optional for default bootstrap
  }

  const result = await authService.bootstrapAdmin(email, password);
  return successResponse(result, undefined, 201);
});
