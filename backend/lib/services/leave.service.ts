import { leaveRepository } from '../repositories/leave.repository';
import { employeeRepository } from '../repositories/employee.repository';
import { attendanceRepository } from '../repositories/attendance.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { AppError } from '../errors';
import { LeaveStatus, LeaveType, AttendanceStatus, NotificationType } from '@prisma/client';
import { ApplyLeaveInput, ProcessLeaveInput, LeaveQueryInput } from '../validations/leave.schema';

// Standard Yearly Leave Policy Allowances
export const LEAVE_ALLOWANCES = {
  PAID: 18,
  SICK: 10,
  UNPAID: 365,
};

export class LeaveService {
  /**
   * Helper to compute working days between two dates (excluding Saturday & Sunday)
   */
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return count;
  }

  /**
   * Employee: Apply for Leave
   */
  async applyLeave(userId: string, input: ApplyLeaveInput) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }

    const startDate = new Date(input.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(input.endDate);
    endDate.setHours(0, 0, 0, 0);

    const workingDays = this.calculateWorkingDays(startDate, endDate);
    if (workingDays <= 0) {
      throw AppError.badRequest('Selected date range contains no working days (weekends only)');
    }

    // 1. Check for overlapping pending or approved leaves
    const overlaps = await leaveRepository.findOverlappingLeaves(employee.id, startDate, endDate);
    if (overlaps.length > 0) {
      throw AppError.conflict(
        'You have an existing pending or approved leave overlapping with these selected dates'
      );
    }

    // 2. Validate leave balance
    const currentYear = startDate.getFullYear();
    const usage = await leaveRepository.getEmployeeLeaveUsage(employee.id, currentYear);

    if (input.type === LeaveType.PAID) {
      const remaining = LEAVE_ALLOWANCES.PAID - usage.PAID;
      if (workingDays > remaining) {
        throw AppError.badRequest(
          `Insufficient Paid Leave balance. You requested ${workingDays} days but have only ${remaining} days available.`
        );
      }
    } else if (input.type === LeaveType.SICK) {
      const remaining = LEAVE_ALLOWANCES.SICK - usage.SICK;
      if (workingDays > remaining) {
        throw AppError.badRequest(
          `Insufficient Sick Leave balance. You requested ${workingDays} days but have only ${remaining} days available.`
        );
      }
    }

    // 3. Create leave record
    const leave = await leaveRepository.createLeave({
      employeeId: employee.id,
      type: input.type,
      startDate,
      endDate,
      totalDays: workingDays,
      reason: input.reason,
    });

    // 4. Notify HR
    await notificationRepository.notifyAllHR({
      type: NotificationType.LEAVE_SUBMITTED,
      title: 'New Leave Application',
      message: `${employee.firstName} ${employee.lastName} has applied for ${workingDays} day(s) of ${input.type} leave.`,
    });

    return {
      message: 'Leave application submitted successfully',
      leave,
    };
  }

  /**
   * Employee: Get My Leaves & Balance Summary
   */
  async getMyLeaves(userId: string) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }

    const currentYear = new Date().getFullYear();
    const [leaves, usage] = await Promise.all([
      leaveRepository.getEmployeeLeaves(employee.id),
      leaveRepository.getEmployeeLeaveUsage(employee.id, currentYear),
    ]);

    const balances = {
      paid: {
        total: LEAVE_ALLOWANCES.PAID,
        used: usage.PAID,
        remaining: Math.max(0, LEAVE_ALLOWANCES.PAID - usage.PAID),
      },
      sick: {
        total: LEAVE_ALLOWANCES.SICK,
        used: usage.SICK,
        remaining: Math.max(0, LEAVE_ALLOWANCES.SICK - usage.SICK),
      },
      unpaid: {
        used: usage.UNPAID,
      },
    };

    return {
      balances,
      leaves,
    };
  }

  /**
   * HR: Get all leave requests with filters & metrics
   */
  async getHRLeaves(query: LeaveQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const [stats, { total, records }] = await Promise.all([
      leaveRepository.getLeaveStats(),
      leaveRepository.getAllLeaves({
        status: query.status,
        type: query.type,
        employeeId: query.employeeId,
        startDate,
        endDate,
        skip,
        take,
      }),
    ]);

    return {
      stats,
      leaves: records,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * HR: Approve or Reject a Leave Request
   */
  async processLeave(hrUserId: string, leaveId: string, input: ProcessLeaveInput) {
    const hrEmployee = await employeeRepository.findByUserId(hrUserId);
    if (!hrEmployee) {
      throw AppError.forbidden('Only authorized HR members can process leave requests');
    }

    const leave = await leaveRepository.findById(leaveId);
    if (!leave) {
      throw AppError.notFound('Leave request not found');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw AppError.badRequest(`This leave request has already been ${leave.status.toLowerCase()}`);
    }

    const now = new Date();
    const updated = await leaveRepository.updateStatus(leaveId, {
      status: input.status as LeaveStatus,
      hrComment: input.hrComment,
      approvedById: hrEmployee.id,
      approvedAt: now,
    });

    // If Approved, synchronize Attendance records for all working days
    if (input.status === 'APPROVED') {
      const cur = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      while (cur <= end) {
        const dayOfWeek = cur.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          await attendanceRepository.upsertAttendance({
            employeeId: leave.employeeId,
            date: new Date(cur),
            status: AttendanceStatus.LEAVE,
            notes: `Approved ${leave.type} Leave`,
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Notify the requesting employee
    await notificationRepository.createNotification({
      employeeId: leave.employeeId,
      type:
        input.status === 'APPROVED'
          ? NotificationType.LEAVE_APPROVED
          : NotificationType.LEAVE_REJECTED,
      title: `Leave Request ${input.status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
      message: `Your ${leave.type} leave application for ${leave.totalDays} day(s) was ${input.status.toLowerCase()} by HR.${
        input.hrComment ? ` Comment: "${input.hrComment}"` : ''
      }`,
    });

    return {
      message: `Leave request ${input.status.toLowerCase()} successfully`,
      leave: updated,
    };
  }
}

export const leaveService = new LeaveService();
