import { BaseRepository } from './base.repository';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceRepository extends BaseRepository {
  /**
   * Find attendance record for an employee on a specific calendar date
   */
  async findByEmployeeAndDate(employeeId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.db.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: startOfDay,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
          },
        },
      },
    });
  }

  /**
   * Record check-in
   */
  async recordCheckIn(employeeId: string, date: Date, checkInTime: Date, notes?: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.db.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: startOfDay,
        },
      },
      create: {
        employeeId,
        date: startOfDay,
        checkIn: checkInTime,
        status: AttendanceStatus.PRESENT,
        notes,
      },
      update: {
        checkIn: checkInTime,
        status: AttendanceStatus.PRESENT,
        notes: notes || undefined,
      },
    });
  }

  /**
   * Record check-out and update total hours & status
   */
  async recordCheckOut(
    attendanceId: string,
    checkOutTime: Date,
    totalHours: number,
    status: AttendanceStatus,
    notes?: string
  ) {
    return this.db.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOut: checkOutTime,
        totalHours,
        status,
        notes: notes || undefined,
      },
    });
  }

  /**
   * Retrieve attendance history for an employee within a date range
   */
  async getEmployeeAttendanceHistory(employeeId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = { employeeId };

    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      whereClause.date = { gte: startDate };
    } else if (endDate) {
      whereClause.date = { lte: endDate };
    }

    return this.db.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
  }

  /**
   * HR Query: Retrieve organization attendance with optional filters & pagination
   */
  async getAllAttendance(params: {
    startDate?: Date;
    endDate?: Date;
    employeeId?: string;
    department?: string;
    status?: AttendanceStatus;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (params.startDate && params.endDate) {
      where.date = {
        gte: params.startDate,
        lte: params.endDate,
      };
    } else if (params.startDate) {
      where.date = { gte: params.startDate };
    }

    if (params.employeeId) {
      where.employeeId = params.employeeId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.department) {
      where.employee = {
        department: params.department,
      };
    }

    const [total, records] = await Promise.all([
      this.db.attendance.count({ where }),
      this.db.attendance.findMany({
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
        orderBy: { date: 'desc' },
        skip: params.skip || 0,
        take: params.take || 50,
      }),
    ]);

    return { total, records };
  }

  /**
   * Get organization-wide summary statistics for a given date
   */
  async getDateStats(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const [totalEmployees, records] = await Promise.all([
      this.db.employee.count({ where: { isActive: true } }),
      this.db.attendance.findMany({
        where: { date: startOfDay },
      }),
    ]);

    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const halfDay = records.filter((r) => r.status === AttendanceStatus.HALF_DAY).length;
    const onLeave = records.filter((r) => r.status === AttendanceStatus.LEAVE).length;
    const markedCount = present + halfDay + onLeave;
    const absent = Math.max(0, totalEmployees - markedCount);

    return {
      totalEmployees,
      present,
      halfDay,
      onLeave,
      absent,
      attendanceRate: totalEmployees > 0 ? Math.round(((present + halfDay) / totalEmployees) * 100) : 0,
    };
  }

  /**
   * HR Manual Upsert / Override
   */
  async upsertAttendance(data: {
    employeeId: string;
    date: Date;
    status: AttendanceStatus;
    checkIn?: Date;
    checkOut?: Date;
    totalHours?: number;
    notes?: string;
  }) {
    const startOfDay = new Date(data.date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.db.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: data.employeeId,
          date: startOfDay,
        },
      },
      create: {
        employeeId: data.employeeId,
        date: startOfDay,
        status: data.status,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalHours: data.totalHours,
        notes: data.notes,
      },
      update: {
        status: data.status,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalHours: data.totalHours,
        notes: data.notes,
      },
      include: {
        employee: true,
      },
    });
  }
}

export const attendanceRepository = new AttendanceRepository();
