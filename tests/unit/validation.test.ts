import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema } from '../../lib/validations/auth.schema';

describe('Auth Validation Schemas', () => {
  it('should validate correct login input', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email in login input', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'Password123',
    });
    expect(result.success).toBe(false);
  });

  it('should validate correct signup input', () => {
    const result = signupSchema.safeParse({
      employeeId: 'EMP-001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject mismatched confirm password in signup input', () => {
    const result = signupSchema.safeParse({
      employeeId: 'EMP-001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password456',
    });
    expect(result.success).toBe(false);
  });
});
