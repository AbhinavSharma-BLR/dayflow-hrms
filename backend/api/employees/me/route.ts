import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { validateRequestBody } from '@/lib/middleware/withValidation';
import { updateOwnProfileSchema } from '@/lib/validations/employee.schema';
import { employeeService } from '@/lib/services/employee.service';

export const GET = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const employee = await employeeService.getEmployeeByUserId(authUser.id);
  return successResponse(employee);
});

export const PATCH = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const input = await validateRequestBody(req, updateOwnProfileSchema);
  const updated = await employeeService.updateOwnProfile(authUser.id, input);

  return successResponse(updated);
});
