import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { Role } from '@prisma/client';
import { analyticsService } from '@/lib/services/analytics.service';
import { reportExportQuerySchema } from '@/lib/validations/analytics.schema';

export const GET = createApiHandler(async (req: NextRequest) => {
  await requireAuth(req, [Role.HR]);
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = reportExportQuerySchema.parse(searchParams);

  const report = await analyticsService.generateReport(query);

  if (query.format === 'CSV') {
    return new NextResponse(report.csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${query.type.toLowerCase()}_report_${Date.now()}.csv"`,
      },
    });
  }

  return successResponse(report);
});
