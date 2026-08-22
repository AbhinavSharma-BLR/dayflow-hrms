export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: ErrorCode = ErrorCode.INTERNAL_ERROR, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static unauthorized(message = 'Unauthorized access'): AppError {
    return new AppError(message, ErrorCode.UNAUTHORIZED, 401);
  }

  static forbidden(message = 'Access forbidden'): AppError {
    return new AppError(message, ErrorCode.FORBIDDEN, 403);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, ErrorCode.NOT_FOUND, 404);
  }

  static badRequest(message = 'Bad request', details?: unknown): AppError {
    return new AppError(message, ErrorCode.BAD_REQUEST, 400, details);
  }

  static validation(message = 'Validation failed', details?: unknown): AppError {
    return new AppError(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }

  static conflict(message = 'Resource already exists'): AppError {
    return new AppError(message, ErrorCode.CONFLICT, 409);
  }
}
