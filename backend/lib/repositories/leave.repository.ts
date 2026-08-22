import { BaseRepository } from './base.repository';
import { LeaveStatus, LeaveType } from '@prisma/client';

export class LeaveRepository extends BaseRepository {
  /**
   * Create a new leave request
   */
  async createLeave(data: {
    employeeId: string;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
  }) {
    return this.db.leave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays: data.totalDays,
        reason: data.reason,
        status: LeaveStatus.PENDING,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
          },
        },
      },
    });
  }

  /**
   * Find overlapping leaves for an employee
   */
  async findOverlappingLeaves(employeeId: string, startDate: Date, endDate: Date) {
    return this.db.leave.findMany({
      where: {
        employeeId,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });
  }

  /**
   * Find leave by ID
   */
  async findById(id: string) {
    return this.db.leave.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            designation: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  /**
   * Get employee's leave history
   */
  async getEmployeeLeaves(employeeId: string, filters?: { status?: LeaveStatus; type?: LeaveType }) {
    const where: any = { employeeId };
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    return this.db.leave.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get leave days taken by type for an employee in a given year
   */
  async getEmployeeLeaveUsage(employeeId: string, year: number) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const approvedLeaves = await this.db.leave.findMany({
      where: {
        employeeId,
        status: LeaveStatus.APPROVED,
        startDate: { gte: startOfYear, lte: endOfYear },
      },
    });

    const usage = {
      PAID: 0,
      SICK: 0,
      UNPAID: 0,
    };

    for (const l of approvedLeaves) {
      usage[l.type] += l.totalDays;
    }

    return usage;
  }

  /**
   * HR Query: Retrieve all leave requests with filters and pagination
   */
  async getAllLeaves(params: {
    status?: LeaveStatus;
    type?: LeaveType;
    employeeId?: string;
    department?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    if (params.employeeId) where.employeeId = params.employeeId;

    if (params.department) {
      where.employee = {
        department: params.department,
      };
    }

    if (params.startDate && params.endDate) {
      where.startDate = { gte: params.startDate };
      where.endDate = { lte: params.endDate };
    }

    const [total, records] = await Promise.all([
      this.db.leave.count({ where }),
      this.db.leave.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              designation: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: params.skip || 0,
        take: params.take || 50,
      }),
    ]);

    return { total, records };
  }

  /**
   * Update leave request status (Approve / Reject)
   */
  async updateStatus(
    id: string,
    data: {
      status: LeaveStatus;
      hrComment?: string;
      approvedById?: string;
      approvedAt?: Date;
    }
  ) {
    return this.db.leave.update({
      where: { id },
      data: {
        status: data.status,
        hrComment: data.hrComment,
        approvedById: data.approvedById,
        approvedAt: data.approvedAt,
      },
      include: {
        employee: true,
      },
    });
  }

  /**
   * Get HR overview statistics for leaves
   */
  async getLeaveStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingCount, approvedThisMonth, activeToday] = await Promise.all([
      this.db.leave.count({ where: { status: LeaveStatus.PENDING } }),
      this.db.leave.count({
        where: {
          status: LeaveStatus.APPROVED,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
      }),
      this.db.leave.count({
        where: {
          status: LeaveStatus.APPROVED,
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
    ]);

    return {
      pendingCount,
      approvedThisMonth,
      activeToday,
    };
  }
}

export const leaveRepository = new LeaveRepository();
