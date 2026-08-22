import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { Role } from '@prisma/client';
import { attendanceService } from '@/lib/services/attendance.service';
import { attendanceQuerySchema, hrAttendanceOverrideSchema } from '@/lib/validations/attendance.schema';
import { validateRequestBody } from '@/lib/middleware/withValidation';

export const GET = createApiHandler(async (req: NextRequest) => {
  await requireAuth(req, [Role.HR]);
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = attendanceQuerySchema.parse(searchParams);

  const result = await attendanceService.getHROversight(query);
  return successResponse(result.records, { ...result.meta, stats: result.stats }, 200);
});

export const POST = createApiHandler(async (req: NextRequest) => {
  await requireAuth(req, [Role.HR]);
  const input = await validateRequestBody(req, hrAttendanceOverrideSchema);
  const result = await attendanceService.hrOverride(input);

  return successResponse(result);
});
