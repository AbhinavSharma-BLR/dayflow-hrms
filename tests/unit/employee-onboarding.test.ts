import { describe, it, expect } from 'vitest';
import { generateTemporaryPassword } from '../../lib/services/password.service';

describe('Employee Onboarding Logic', () => {
  it('should generate a secure temporary password with required complexity', () => {
    const tempPassword = generateTemporaryPassword();
    expect(tempPassword).toBeDefined();
    expect(tempPassword.length).toBeGreaterThanOrEqual(10);
    expect(tempPassword).toMatch(/[A-Z]/); // Contains uppercase
    expect(tempPassword).toMatch(/[0-9]/); // Contains digit
  });
});
