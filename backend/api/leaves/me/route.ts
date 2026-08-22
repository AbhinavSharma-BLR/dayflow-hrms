import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { leaveService } from '@/lib/services/leave.service';

export const GET = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const result = await leaveService.getMyLeaves(authUser.id);

  return successResponse(result);
});
