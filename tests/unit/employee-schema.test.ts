import { describe, it, expect } from 'vitest';
import { updateOwnProfileSchema, hrUpdateEmployeeSchema } from '../../lib/validations/employee.schema';

describe('Employee Schema Validation', () => {
  it('should validate allowed own profile fields', () => {
    const input = {
      phone: '+1 555-0199',
      address: '100 Market St',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94105',
    };
    const result = updateOwnProfileSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should ignore non-permitted fields in own profile schema', () => {
    const input = {
      phone: '+1 555-0199',
      department: 'HACKED DEPARTMENT',
      salary: 999999,
    };
    const parsed = updateOwnProfileSchema.parse(input);
    expect((parsed as any).department).toBeUndefined();
    expect((parsed as any).salary).toBeUndefined();
  });

  it('should validate HR profile update schema including department and designation', () => {
    const input = {
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      isActive: true,
    };
    const result = hrUpdateEmployeeSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
