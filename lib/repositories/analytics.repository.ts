import { BaseRepository } from './base.repository';
import { AttendanceStatus, LeaveStatus, LeaveType } from '@prisma/client';

export class AnalyticsRepository extends BaseRepository {
  /**
   * Get workforce headcount & department distribution
   */
  async getWorkforceDistribution() {
    const employees = await this.db.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        department: true,
        designation: true,
        createdAt: true,
        dateOfJoining: true,
      },
    });

    const departmentMap: Record<string, number> = {};
    const designationMap: Record<string, number> = {};

    for (const emp of employees) {
      const dept = emp.department || 'General';
      const desig = emp.designation || 'Staff Member';
      departmentMap[dept] = (departmentMap[dept] || 0) + 1;
      designationMap[desig] = (designationMap[desig] || 0) + 1;
    }

    const departmentDistribution = Object.entries(departmentMap).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / employees.length) * 100),
    }));

    const designationDistribution = Object.entries(designationMap).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      totalEmployees: employees.length,
      departmentDistribution,
      designationDistribution,
    };
  }

  /**
   * Get attendance trends over the last 30 days
   */
  async getAttendanceTrends(days = 30) {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [totalEmployees, records] = await Promise.all([
      this.db.employee.count({ where: { isActive: true } }),
      this.db.attendance.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Aggregate by date string YYYY-MM-DD
    const dateMap: Record<string, { present: number; halfDay: number; onLeave: number; totalHours: number }> = {};

    for (const r of records) {
      const dStr = r.date.toISOString().split('T')[0];
      if (!dateMap[dStr]) {
        dateMap[dStr] = { present: 0, halfDay: 0, onLeave: 0, totalHours: 0 };
      }
      if (r.status === AttendanceStatus.PRESENT) dateMap[dStr].present++;
      else if (r.status === AttendanceStatus.HALF_DAY) dateMap[dStr].halfDay++;
      else if (r.status === AttendanceStatus.LEAVE) dateMap[dStr].onLeave++;
      dateMap[dStr].totalHours += r.totalHours || 0;
    }

    const timeline = Object.entries(dateMap).map(([date, data]) => {
      const attended = data.present + data.halfDay;
      const rate = totalEmployees > 0 ? Math.round((attended / totalEmployees) * 100) : 0;
      const avgHours = attended > 0 ? Math.round((data.totalHours / attended) * 10) / 10 : 0;
      return {
        date,
        present: data.present,
        halfDay: data.halfDay,
        onLeave: data.onLeave,
        absent: Math.max(0, totalEmployees - (attended + data.onLeave)),
        attendanceRate: rate,
        avgHours,
      };
    });

    return {
      totalEmployees,
      timeline,
    };
  }

  /**
   * Get leave distribution and approval rates
   */
  async getLeaveAnalytics() {
    const leaves = await this.db.leave.findMany({
      select: {
        type: true,
        status: true,
        totalDays: true,
        employee: { select: { department: true } },
      },
    });

    const typeBreakdown = { PAID: 0, SICK: 0, UNPAID: 0 };
    const statusBreakdown = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    const deptLeaveMap: Record<string, number> = {};

    let totalDaysRequested = 0;
    let totalDaysApproved = 0;

    for (const l of leaves) {
      typeBreakdown[l.type] += l.totalDays;
      statusBreakdown[l.status]++;
      totalDaysRequested += l.totalDays;

      if (l.status === LeaveStatus.APPROVED) {
        totalDaysApproved += l.totalDays;
      }

      const dept = l.employee?.department || 'General';
      deptLeaveMap[dept] = (deptLeaveMap[dept] || 0) + l.totalDays;
    }

    const totalDecided = statusBreakdown.APPROVED + statusBreakdown.REJECTED;
    const approvalRate = totalDecided > 0 ? Math.round((statusBreakdown.APPROVED / totalDecided) * 100) : 100;

    const departmentLeaveDistribution = Object.entries(deptLeaveMap).map(([name, days]) => ({
      name,
      days,
    }));

    return {
      totalApplications: leaves.length,
      totalDaysRequested,
      totalDaysApproved,
      approvalRate,
      typeBreakdown,
      statusBreakdown,
      departmentLeaveDistribution,
    };
  }

  /**
   * Get payroll monthly spending trends & department salary averages
   */
  async getPayrollAnalytics() {
    const payrolls = await this.db.payroll.findMany({
      include: {
        employee: { select: { department: true } },
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    const monthMap: Record<string, { totalNet: number; totalBasic: number; totalAllowances: number; count: number }> = {};
    const deptSalaryMap: Record<string, { totalSalary: number; count: number }> = {};

    for (const p of payrolls) {
      const mKey = `${p.year}-${String(p.month).padStart(2, '0')}`;
      if (!monthMap[mKey]) {
        monthMap[mKey] = { totalNet: 0, totalBasic: 0, totalAllowances: 0, count: 0 };
      }
      monthMap[mKey].totalNet += p.netSalary;
      monthMap[mKey].totalBasic += p.basicSalary;
      monthMap[mKey].totalAllowances += p.allowances;
      monthMap[mKey].count++;

      const dept = p.employee?.department || 'General';
      if (!deptSalaryMap[dept]) {
        deptSalaryMap[dept] = { totalSalary: 0, count: 0 };
      }
      deptSalaryMap[dept].totalSalary += p.netSalary;
      deptSalaryMap[dept].count++;
    }

    const monthlyTrends = Object.entries(monthMap).map(([month, data]) => ({
      month,
      totalSpend: Math.round(data.totalNet),
      basic: Math.round(data.totalBasic),
      allowances: Math.round(data.totalAllowances),
      staffCount: data.count,
      avgSalary: data.count > 0 ? Math.round(data.totalNet / data.count) : 0,
    }));

    const departmentAvgSalaries = Object.entries(deptSalaryMap).map(([department, data]) => ({
      department,
      avgSalary: data.count > 0 ? Math.round(data.totalSalary / data.count) : 0,
      totalSpend: Math.round(data.totalSalary),
    }));

    return {
      monthlyTrends,
      departmentAvgSalaries,
    };
  }

  /**
   * Query raw data for standard reports
   */
  async getReportData(type: string, filters: { department?: string; month?: number; year?: number; status?: string }) {
    switch (type) {
      case 'EMPLOYEE_ROSTER': {
        const where: any = {};
        if (filters.department) where.department = filters.department;
        if (filters.status) where.isActive = filters.status === 'ACTIVE';

        return this.db.employee.findMany({
          where,
          include: {
            user: { select: { email: true, role: true, emailVerified: true } },
          },
          orderBy: { employeeId: 'asc' },
        });
      }

      case 'ATTENDANCE_SUMMARY': {
        const where: any = {};
        if (filters.department) where.employee = { department: filters.department };
        if (filters.month && filters.year) {
          const start = new Date(filters.year, filters.month - 1, 1);
          const end = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
          where.date = { gte: start, lte: end };
        }

        return this.db.attendance.findMany({
          where,
          include: {
            employee: {
              select: { employeeId: true, firstName: true, lastName: true, department: true, designation: true },
            },
          },
          orderBy: { date: 'desc' },
        });
      }

      case 'LEAVE_LEDGER': {
        const where: any = {};
        if (filters.department) where.employee = { department: filters.department };
        if (filters.status) where.status = filters.status as LeaveStatus;

        return this.db.leave.findMany({
          where,
          include: {
            employee: {
              select: { employeeId: true, firstName: true, lastName: true, department: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      case 'PAYROLL_REGISTER': {
        const where: any = {};
        if (filters.department) where.employee = { department: filters.department };
        if (filters.month) where.month = filters.month;
        if (filters.year) where.year = filters.year;
        if (filters.status) where.paymentStatus = filters.status;

        return this.db.payroll.findMany({
          where,
          include: {
            employee: {
              select: { employeeId: true, firstName: true, lastName: true, department: true, designation: true },
            },
          },
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });
      }

      default:
        return [];
    }
  }
}

export const analyticsRepository = new AnalyticsRepository();
