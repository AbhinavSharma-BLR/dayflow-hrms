import { NextRequest } from 'next/server';
import { Role } from '@prisma/client';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { authService } from '@/lib/services/auth.service';
import { employeeRepository } from '@/lib/repositories/employee.repository';
import { requireAuth } from '@/lib/middleware/withAuth';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  dateOfJoining: z.string().optional(),
});

export const POST = createApiHandler(async (req: NextRequest) => {
  // Requires HR role authorization
  await requireAuth(req, [Role.HR]);

  const body = await req.json();
  const parsed = createEmployeeSchema.parse(body);

  const result = await authService.createEmployeeByHR({
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    email: parsed.email,
    phone: parsed.phone,
    department: parsed.department,
    designation: parsed.designation,
    dateOfJoining: parsed.dateOfJoining ? new Date(parsed.dateOfJoining) : undefined,
  });

  return successResponse(result, undefined, 201);
});

export const GET = createApiHandler(async (req: NextRequest) => {
  await requireAuth(req, [Role.HR]);
  const employees = await employeeRepository.findAll();
  return successResponse(employees);
});
