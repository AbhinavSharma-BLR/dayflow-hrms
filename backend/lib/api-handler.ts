import { NextRequest } from 'next/server';
import { errorResponse } from './api-response';

type ApiHandler = (req: NextRequest, params?: { params: Record<string, string> }) => Promise<Response>;

export function createApiHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, params?: { params: Record<string, string> }) => {
    try {
      return await handler(req, params);
    } catch (error) {
      console.error('[API Error]', error);
      return errorResponse(error);
    }
  };
}
