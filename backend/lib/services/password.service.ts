import crypto from 'crypto';

/**
 * Generates a cryptographically secure random temporary password.
 * Format: 1 uppercase, 1 digit, lowercase alphanumeric (e.g., Temp#8k2p9m)
 */
export function generateTemporaryPassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const lowercase = 'abcdefghijkmnpqrstuvwxyz';

  const uChar = uppercase[crypto.randomInt(0, uppercase.length)];
  const dChar = digits[crypto.randomInt(0, digits.length)];

  const randomBytes = crypto.randomBytes(6).toString('hex'); // 12 hex chars

  return `Temp#${uChar}${dChar}${randomBytes.slice(0, 6)}`;
}
