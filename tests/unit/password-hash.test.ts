import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Password Security & Hashing', () => {
  it('should generate a valid bcrypt hash', async () => {
    const rawPassword = 'Password123!';
    const hash = await bcrypt.hash(rawPassword, 10);
    expect(hash).not.toEqual(rawPassword);
    expect(hash).toMatch(/^\$2[ayb]\$.{56}$/);
  });

  it('should verify correct password match', async () => {
    const rawPassword = 'Password123!';
    const hash = await bcrypt.hash(rawPassword, 10);
    const isValid = await bcrypt.compare(rawPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password match', async () => {
    const rawPassword = 'Password123!';
    const wrongPassword = 'WrongPassword456!';
    const hash = await bcrypt.hash(rawPassword, 10);
    const isValid = await bcrypt.compare(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});
