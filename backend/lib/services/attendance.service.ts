import { attendanceRepository } from '../repositories/attendance.repository';
import { employeeRepository } from '../repositories/employee.repository';
import { AppError } from '../errors';
import { AttendanceStatus } from '@prisma/client';
import { CheckInInput, CheckOutInput, HRAttendanceOverrideInput, AttendanceQueryInput } from '../validations/attendance.schema';

export class AttendanceService {
  /**
   * Helper to get employee record by user ID
   */
  private async getEmployee(userId: string) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }
    return employee;
  }

  /**
   * Employee Check-In for today
   */
  async checkIn(userId: string, input?: CheckInInput) {
    const employee = await this.getEmployee(userId);
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const existing = await attendanceRepository.findByEmployeeAndDate(employee.id, today);
    if (existing && existing.checkIn) {
      throw AppError.conflict('You have already checked in for today');
    }

    const record = await attendanceRepository.recordCheckIn(
      employee.id,
      today,
      now,
      input?.notes
    );

    return {
      message: 'Checked in successfully',
      attendance: record,
    };
  }

  /**
   * Employee Check-Out for today
   */
  async checkOut(userId: string, input?: CheckOutInput) {
    const employee = await this.getEmployee(userId);
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const existing = await attendanceRepository.findByEmployeeAndDate(employee.id, today);
    if (!existing || !existing.checkIn) {
      throw AppError.badRequest('You have not checked in today yet');
    }

    if (existing.checkOut) {
      throw AppError.conflict('You have already checked out for today');
    }

    const checkInTime = new Date(existing.checkIn);
    const diffMs = now.getTime() - checkInTime.getTime();
    const totalHours = Math.max(0.1, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);

    // Business rule: < 4 hours = HALF_DAY, >= 4 hours = PRESENT (standard 8hr day)
    let status: AttendanceStatus = AttendanceStatus.PRESENT;
    if (totalHours < 4) {
      status = AttendanceStatus.HALF_DAY;
    }

    const updated = await attendanceRepository.recordCheckOut(
      existing.id,
      now,
      totalHours,
      status,
      input?.notes
    );

    return {
      message: 'Checked out successfully',
      attendance: updated,
    };
  }

  /**
   * Get employee's live attendance status for today
   */
  async getTodayStatus(userId: string) {
    const employee = await this.getEmployee(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await attendanceRepository.findByEmployeeAndDate(employee.id, today);

    let currentHours = 0;
    if (record?.checkIn && !record.checkOut) {
      const diffMs = Date.now() - new Date(record.checkIn).getTime();
      currentHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    } else if (record?.totalHours) {
      currentHours = record.totalHours;
    }

    return {
      date: today.toISOString().split('T')[0],
      isCheckedIn: !!record?.checkIn,
      isCheckedOut: !!record?.checkOut,
      checkInTime: record?.checkIn || null,
      checkOutTime: record?.checkOut || null,
      totalHours: currentHours,
      status: record?.status || AttendanceStatus.ABSENT,
      notes: record?.notes || null,
    };
  }

  /**
   * Get employee's attendance history and metrics
   */
  async getMyAttendanceHistory(userId: string, query: { month?: number; year?: number }) {
    const employee = await this.getEmployee(userId);
    const now = new Date();
    const year = query.year || now.getFullYear();
    const month = query.month || now.getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await attendanceRepository.getEmployeeAttendanceHistory(
      employee.id,
      startDate,
      endDate
    );

    // Compute month summary statistics
    const presentDays = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const halfDays = records.filter((r) => r.status === AttendanceStatus.HALF_DAY).length;
    const leaveDays = records.filter((r) => r.status === AttendanceStatus.LEAVE).length;
    const totalHoursWorked = records.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const effectiveDays = presentDays + halfDays * 0.5;
    const avgDailyHours = effectiveDays > 0 ? Math.round((totalHoursWorked / effectiveDays) * 10) / 10 : 0;

    return {
      month,
      year,
      summary: {
        presentDays,
        halfDays,
        leaveDays,
        totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
        avgDailyHours,
        recordsCount: records.length,
      },
      records,
    };
  }

  /**
   * HR Oversight: Get all attendance logs + today's workforce overview
   */
  async getHROversight(query: AttendanceQueryInput) {
    const today = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (query.month && query.year) {
      startDate = new Date(query.year, query.month - 1, 1);
      endDate = new Date(query.year, query.month, 0, 23, 59, 59, 999);
    }

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [stats, { total, records }] = await Promise.all([
      attendanceRepository.getDateStats(startDate || today),
      attendanceRepository.getAllAttendance({
        startDate,
        endDate,
        employeeId: query.employeeId,
        status: query.status,
        skip,
        take,
      }),
    ]);

    return {
      stats,
      records,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * HR Manual Attendance Override
   */
  async hrOverride(input: HRAttendanceOverrideInput) {
    const date = new Date(input.date);
    const checkIn = input.checkIn ? new Date(input.checkIn) : undefined;
    const checkOut = input.checkOut ? new Date(input.checkOut) : undefined;

    let totalHours = input.totalHours;
    if (!totalHours && checkIn && checkOut) {
      const diffMs = checkOut.getTime() - checkIn.getTime();
      totalHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
    }

    const record = await attendanceRepository.upsertAttendance({
      employeeId: input.employeeId,
      date,
      status: input.status,
      checkIn,
      checkOut,
      totalHours,
      notes: input.notes,
    });

    return {
      message: 'Attendance record updated successfully',
      attendance: record,
    };
  }
}

export const attendanceService = new AttendanceService();
