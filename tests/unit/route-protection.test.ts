import { describe, it, expect } from 'vitest';
import { Role } from '@prisma/client';
import { requireAuth } from '../../lib/middleware/withAuth';
import { NextRequest } from 'next/server';

describe('Role Authorization Helper', () => {
  it('should extract user from headers and allow authorized role', async () => {
    const req = new NextRequest('http://localhost:3000/hr/dashboard', {
      headers: {
        'x-user-id': 'user_123',
        'x-user-email': 'hr@company.com',
        'x-user-role': Role.HR,
      },
    });

    const user = await requireAuth(req, [Role.HR]);
    expect(user.id).toBe('user_123');
    expect(user.role).toBe(Role.HR);
  });

  it('should reject employee role when HR role is strictly required', async () => {
    const req = new NextRequest('http://localhost:3000/api/employees/emp_123', {
      headers: {
        'x-user-id': 'user_employee',
        'x-user-email': 'emp@company.com',
        'x-user-role': Role.EMPLOYEE,
      },
    });

    await expect(requireAuth(req, [Role.HR])).rejects.toThrowError('You do not have permission');
  });

  it('should throw unauthorized error when no user headers are present', async () => {
    const req = new NextRequest('http://localhost:3000/api/employees/me');
    await expect(requireAuth(req)).rejects.toThrowError('Authentication required');
  });
});
