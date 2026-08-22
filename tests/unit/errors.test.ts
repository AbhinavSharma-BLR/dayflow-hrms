import { describe, it, expect } from 'vitest';
import { AppError, ErrorCode } from '../../lib/errors';

describe('AppError', () => {
  it('should create an AppError with correct status code and error code', () => {
    const err = AppError.unauthorized('Invalid token');
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(err.message).toBe('Invalid token');
  });

  it('should create forbidden error with 403', () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should create validation error with 400', () => {
    const details = [{ field: 'email', message: 'Invalid email' }];
    const err = AppError.validation('Validation error', details);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(err.details).toEqual(details);
  });
});
