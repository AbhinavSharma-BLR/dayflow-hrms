import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { Role } from '@prisma/client';
import { payrollService } from '@/lib/services/payroll.service';
import { updatePayrollSchema } from '@/lib/validations/payroll.schema';
import { validateRequestBody } from '@/lib/middleware/withValidation';
import { AppError } from '@/lib/errors';

export const GET = createApiHandler(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const authUser = await requireAuth(req);
  const payrollId = context?.params?.id;

  if (!payrollId) {
    throw AppError.badRequest('Payroll ID is required');
  }

  const payslip = await payrollService.getPayslip(authUser.id, authUser.role, payrollId);
  return successResponse(payslip);
});

export const PATCH = createApiHandler(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const authUser = await requireAuth(req, [Role.HR]);
  const payrollId = context?.params?.id;

  if (!payrollId) {
    throw AppError.badRequest('Payroll ID is required');
  }

  const input = await validateRequestBody(req, updatePayrollSchema);
  const result = await payrollService.markAsPaid(authUser.id, payrollId, input);

  return successResponse(result);
});
