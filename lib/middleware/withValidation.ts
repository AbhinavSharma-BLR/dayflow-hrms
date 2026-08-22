import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AppError } from '../errors';

export async function validateRequestBody<T>(req: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw AppError.validation('Invalid request data', error.issues);
    }
    throw AppError.badRequest('Invalid JSON payload');
  }
}

export function validateQueryParams<T>(req: NextRequest, schema: z.ZodSchema<T>): T {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw AppError.validation('Invalid query parameters', error.issues);
    }
    throw AppError.badRequest('Invalid query string');
  }
}
