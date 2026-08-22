import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { attendanceService } from '@/lib/services/attendance.service';

export const GET = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const searchParams = req.nextUrl.searchParams;
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;

  const data = await attendanceService.getMyAttendanceHistory(authUser.id, { month, year });

  return successResponse(data);
});
