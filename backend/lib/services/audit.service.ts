import { prisma } from '../db/prisma';

export interface AuditLogInput {
  action: string;
  entity: string;
  entityId: string;
  performedBy: string;
  employeeId?: string;
  oldValue?: any;
  newValue?: any;
}

export class AuditService {
  /**
   * Record a critical administrative or workforce action in the audit log
   */
  async logAction(input: AuditLogInput) {
    try {
      return await prisma.auditLog.create({
        data: {
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          performedBy: input.performedBy,
          employeeId: input.employeeId || null,
          oldValue: input.oldValue ?? undefined,
          newValue: input.newValue ?? undefined,
        },
      });
    } catch (err) {
      console.error('Failed to write audit log record:', err);
      return null;
    }
  }

  /**
   * Retrieve recent system audit logs
   */
  async getAuditTrail(limit = 50) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    });
  }
}

export const auditService = new AuditService();
