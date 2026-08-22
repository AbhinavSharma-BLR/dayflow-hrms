import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { attendanceService } from '@/lib/services/attendance.service';
import { checkInSchema } from '@/lib/validations/attendance.schema';

export const POST = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    // Body is optional for check-in
  }
  const parsed = checkInSchema.parse(body);
  const result = await attendanceService.checkIn(authUser.id, parsed);

  return successResponse(result, undefined, 200);
});
