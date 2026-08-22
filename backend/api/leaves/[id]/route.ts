import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { Role } from '@prisma/client';
import { leaveService } from '@/lib/services/leave.service';
import { processLeaveSchema } from '@/lib/validations/leave.schema';
import { validateRequestBody } from '@/lib/middleware/withValidation';
import { AppError } from '@/lib/errors';

export const PATCH = createApiHandler(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const authUser = await requireAuth(req, [Role.HR]);
  const leaveId = context?.params?.id;

  if (!leaveId) {
    throw AppError.badRequest('Leave ID parameter is missing');
  }

  const input = await validateRequestBody(req, processLeaveSchema);
  const result = await leaveService.processLeave(authUser.id, leaveId, input);

  return successResponse(result);
});
