import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { payrollService } from '@/lib/services/payroll.service';

export const GET = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const searchParams = req.nextUrl.searchParams;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;

  const result = await payrollService.getEmployeePayrolls(authUser.id, year);
  return successResponse(result);
});
