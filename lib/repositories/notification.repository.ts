import { BaseRepository } from './base.repository';
import { NotificationType } from '@prisma/client';

export class NotificationRepository extends BaseRepository {
  /**
   * Create a notification
   */
  async createNotification(data: {
    employeeId: string;
    type: NotificationType;
    title: string;
    message: string;
  }) {
    return this.db.notification.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
      },
    });
  }

  /**
   * Create notifications for all HR employees
   */
  async notifyAllHR(data: {
    type: NotificationType;
    title: string;
    message: string;
  }) {
    const hrEmployees = await this.db.employee.findMany({
      where: {
        user: { role: 'HR' },
        isActive: true,
      },
      select: { id: true },
    });

    if (hrEmployees.length === 0) return;

    return this.db.notification.createMany({
      data: hrEmployees.map((hr) => ({
        employeeId: hr.id,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
      })),
    });
  }

  /**
   * Get notifications for an employee
   */
  async getEmployeeNotifications(employeeId: string, limit = 20) {
    return this.db.notification.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string, employeeId: string) {
    return this.db.notification.updateMany({
      where: { id, employeeId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for an employee
   */
  async markAllAsRead(employeeId: string) {
    return this.db.notification.updateMany({
      where: { employeeId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationRepository = new NotificationRepository();
