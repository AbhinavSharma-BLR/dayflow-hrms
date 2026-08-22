import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { attendanceService } from '@/lib/services/attendance.service';

export const GET = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const status = await attendanceService.getTodayStatus(authUser.id);

  return successResponse(status);
});
