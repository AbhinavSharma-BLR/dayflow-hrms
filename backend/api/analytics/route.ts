import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { Role } from '@prisma/client';
import { analyticsService } from '@/lib/services/analytics.service';
import { analyticsQuerySchema } from '@/lib/validations/analytics.schema';

export const GET = createApiHandler(async (req: NextRequest) => {
  await requireAuth(req, [Role.HR]);
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = analyticsQuerySchema.parse(searchParams);

  const result = await analyticsService.getHRAnalyticsOverview(query);
  return successResponse(result);
});
