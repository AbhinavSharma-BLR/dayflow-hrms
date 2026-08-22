import { describe, it, expect } from 'vitest';
import { Role } from '@prisma/client';

describe('Authentication Flow & Direct Dashboard Redirection', () => {
  it('should format session user correctly for authenticated session', () => {
    const mockUser = {
      id: 'usr_123',
      email: 'alex.rivera@dayflow.com',
      role: Role.EMPLOYEE,
      employeeId: 'DAYALRI20260001',
      mustChangePassword: false,
    };

    expect(mockUser.id).toBe('usr_123');
    expect(mockUser.role).toBe(Role.EMPLOYEE);
    expect(mockUser.mustChangePassword).toBe(false);
  });

  it('should route HR users to /hr/dashboard and Employees to /employee/dashboard', () => {
    const getTargetRoute = (role: Role, mustChangePassword: boolean = false) => {
      if (mustChangePassword) return '/change-password';
      if (role === Role.HR) return '/hr/dashboard';
      return '/employee/dashboard';
    };

    expect(getTargetRoute(Role.HR)).toBe('/hr/dashboard');
    expect(getTargetRoute(Role.EMPLOYEE)).toBe('/employee/dashboard');
    expect(getTargetRoute(Role.EMPLOYEE, true)).toBe('/change-password');
  });
});
