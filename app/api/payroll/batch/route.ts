import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { Role } from '@prisma/client';
import { payrollService } from '@/lib/services/payroll.service';
import { batchPayrollSchema } from '@/lib/validations/payroll.schema';
import { validateRequestBody } from '@/lib/middleware/withValidation';

export const POST = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req, [Role.HR]);
  const input = await validateRequestBody(req, batchPayrollSchema);
  const result = await payrollService.runBatchPayroll(authUser.id, input);

  return successResponse(result, undefined, 201);
});
