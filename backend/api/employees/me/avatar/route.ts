import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { AppError } from '@/lib/errors';
import { employeeService } from '@/lib/services/employee.service';

export const POST = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    throw AppError.badRequest('No image file uploaded');
  }

  const result = await employeeService.uploadProfilePicture(authUser.id, file);
  return successResponse(result);
});

export const DELETE = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const result = await employeeService.deleteProfilePicture(authUser.id);
  return successResponse(result);
});
