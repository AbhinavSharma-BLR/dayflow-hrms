import { NextRequest } from 'next/server';
import { Role } from '@prisma/client';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { validateRequestBody } from '@/lib/middleware/withValidation';
import { hrUpdateEmployeeSchema } from '@/lib/validations/employee.schema';
import { employeeService } from '@/lib/services/employee.service';

export const PATCH = createApiHandler(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  // Enforce server-side HR role requirement
  await requireAuth(req, [Role.HR]);
  const employeeId = context?.params?.id;

  if (!employeeId) {
    throw new Error('Employee ID parameter missing');
  }

  const input = await validateRequestBody(req, hrUpdateEmployeeSchema);
  const updated = await employeeService.hrUpdateEmployee(employeeId, input);

  return successResponse(updated);
});
