import { notificationRepository } from '../repositories/notification.repository';
import { employeeRepository } from '../repositories/employee.repository';
import { AppError } from '../errors';

export class NotificationService {
  async getMyNotifications(userId: string) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }

    const notifications = await notificationRepository.getEmployeeNotifications(employee.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      unreadCount,
      notifications,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }

    await notificationRepository.markAsRead(notificationId, employee.id);
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }

    await notificationRepository.markAllAsRead(employee.id);
    return { success: true };
  }
}

export const notificationService = new NotificationService();
