import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { AppError, ErrorCode } from './errors';

export function successResponse<T>(data: T, meta?: ApiResponse['meta'], status = 200) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(body, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    const body: ApiResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    };
    return NextResponse.json(body, { status: error.statusCode });
  }

  // Sanitize raw Prisma or database driver errors
  const errString = String(error);
  const isDbError =
    errString.includes('PrismaClient') ||
    errString.includes('P1001') ||
    errString.includes('P1002') ||
    errString.includes('Can\'t reach database server') ||
    errString.includes('ECONNREFUSED');

  // Log raw trace only on server
  console.error('[SERVER UNHANDLED ERROR]', error);

  const safeMessage = isDbError
    ? 'We could not complete your request right now. Please try again later.'
    : error instanceof Error && !isDbError
    ? error.message
    : 'An unexpected error occurred';

  const body: ApiResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: safeMessage,
    },
  };

  return NextResponse.json(body, { status: 500 });
}
