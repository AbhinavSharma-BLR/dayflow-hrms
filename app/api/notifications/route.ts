import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware/withAuth';
import { notificationService } from '@/lib/services/notification.service';

export const GET = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const result = await notificationService.getMyNotifications(authUser.id);

  return successResponse(result);
});

export const PATCH = createApiHandler(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    // Body can be empty for mark all as read
  }

  if (body?.id) {
    await notificationService.markAsRead(authUser.id, body.id);
  } else {
    await notificationService.markAllAsRead(authUser.id);
  }

  return successResponse({ success: true });
});
