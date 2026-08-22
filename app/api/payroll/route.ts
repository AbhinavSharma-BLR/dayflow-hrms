import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { Role } from '@prisma/client';
import { payrollService } from '@/lib/services/payroll.service';
import { payrollQuerySchema, createPayrollSchema } from '@/lib/validations/payroll.schema';
import { validateRequestBody } from '@/lib/middleware/withValidation';

export const GET = createApiHandler(async (req: NextRequest) => {
  await requireAuth(req, [Role.HR]);
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = payrollQuerySchema.parse(searchParams);

  const result = await payrollService.getHRPayrollLedger(query);
  return successResponse(result.records, { ...result.meta, stats: result.stats }, 200);
});

export const POST = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req, [Role.HR]);
  const input = await validateRequestBody(req, createPayrollSchema);
  const result = await payrollService.createOrUpdatePayroll(authUser.id, input);

  return successResponse(result, undefined, 201);
});
