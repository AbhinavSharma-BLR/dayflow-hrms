import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { Role } from '@prisma/client';
import { leaveService } from '@/lib/services/leave.service';
import { applyLeaveSchema, leaveQuerySchema } from '@/lib/validations/leave.schema';
import { validateRequestBody } from '@/lib/middleware/withValidation';

export const POST = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const input = await validateRequestBody(req, applyLeaveSchema);
  const result = await leaveService.applyLeave(authUser.id, input);

  return successResponse(result, undefined, 201);
});

export const GET = createApiHandler(async (req: NextRequest) => {
  await requireAuth(req, [Role.HR]);
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = leaveQuerySchema.parse(searchParams);

  const result = await leaveService.getHRLeaves(query);
  return successResponse(result.leaves, { ...result.meta, stats: result.stats }, 200);
});
