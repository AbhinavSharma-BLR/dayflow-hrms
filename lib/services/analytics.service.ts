import { analyticsRepository } from '../repositories/analytics.repository';
import { AnalyticsQueryInput, ReportExportQueryInput } from '../validations/analytics.schema';

export class AnalyticsService {
  /**
   * Aggregate organization metrics for HR Analytics Dashboard
   */
  async getHRAnalyticsOverview(query: AnalyticsQueryInput) {
    const [workforce, attendance, leaves, payroll] = await Promise.all([
      analyticsRepository.getWorkforceDistribution(),
      analyticsRepository.getAttendanceTrends(30),
      analyticsRepository.getLeaveAnalytics(),
      analyticsRepository.getPayrollAnalytics(),
    ]);

    return {
      workforce,
      attendance,
      leaves,
      payroll,
    };
  }

  /**
   * Generate standard enterprise reports in JSON or CSV
   */
  async generateReport(query: ReportExportQueryInput) {
    const rawData: any[] = await analyticsRepository.getReportData(query.type, {
      department: query.department,
      month: query.month,
      year: query.year,
      status: query.status,
    });

    let columns: { key: string; label: string }[] = [];
    let rows: Record<string, any>[] = [];

    switch (query.type) {
      case 'EMPLOYEE_ROSTER':
        columns = [
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'fullName', label: 'Full Name' },
          { key: 'email', label: 'Work Email' },
          { key: 'department', label: 'Department' },
          { key: 'designation', label: 'Designation' },
          { key: 'phone', label: 'Phone' },
          { key: 'dateOfJoining', label: 'Date of Joining' },
          { key: 'status', label: 'Status' },
        ];
        rows = rawData.map((emp) => ({
          employeeId: emp.employeeId,
          fullName: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          department: emp.department || 'General',
          designation: emp.designation || 'Staff Member',
          phone: emp.phone || '—',
          dateOfJoining: emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '—',
          status: emp.isActive ? 'ACTIVE' : 'INACTIVE',
        }));
        break;

      case 'ATTENDANCE_SUMMARY':
        columns = [
          { key: 'date', label: 'Date' },
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Employee Name' },
          { key: 'department', label: 'Department' },
          { key: 'status', label: 'Status' },
          { key: 'checkIn', label: 'Clock In' },
          { key: 'checkOut', label: 'Clock Out' },
          { key: 'totalHours', label: 'Total Hours' },
          { key: 'notes', label: 'Notes' },
        ];
        rows = rawData.map((att) => ({
          date: new Date(att.date).toLocaleDateString(),
          employeeId: att.employee?.employeeId || '—',
          name: att.employee ? `${att.employee.firstName} ${att.employee.lastName}` : '—',
          department: att.employee?.department || 'General',
          status: att.status,
          checkIn: att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : '—',
          checkOut: att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '—',
          totalHours: att.totalHours != null ? `${att.totalHours} hrs` : '—',
          notes: att.notes || '—',
        }));
        break;

      case 'LEAVE_LEDGER':
        columns = [
          { key: 'appliedOn', label: 'Applied Date' },
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Employee Name' },
          { key: 'department', label: 'Department' },
          { key: 'type', label: 'Leave Type' },
          { key: 'startDate', label: 'Start Date' },
          { key: 'endDate', label: 'End Date' },
          { key: 'totalDays', label: 'Days' },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status' },
          { key: 'hrComment', label: 'HR Comment' },
        ];
        rows = rawData.map((l) => ({
          appliedOn: new Date(l.createdAt).toLocaleDateString(),
          employeeId: l.employee?.employeeId || '—',
          name: l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : '—',
          department: l.employee?.department || 'General',
          type: l.type,
          startDate: new Date(l.startDate).toLocaleDateString(),
          endDate: new Date(l.endDate).toLocaleDateString(),
          totalDays: l.totalDays,
          reason: l.reason,
          status: l.status,
          hrComment: l.hrComment || '—',
        }));
        break;

      case 'PAYROLL_REGISTER':
        columns = [
          { key: 'period', label: 'Pay Period' },
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Employee Name' },
          { key: 'department', label: 'Department' },
          { key: 'basicSalary', label: 'Basic (₹)' },
          { key: 'allowances', label: 'Allowances (₹)' },
          { key: 'bonus', label: 'Bonus (₹)' },
          { key: 'deductions', label: 'Deductions (₹)' },
          { key: 'netSalary', label: 'Net Take-Home (₹)' },
          { key: 'paymentStatus', label: 'Payment Status' },
          { key: 'paymentDate', label: 'Payment Date' },
        ];
        rows = rawData.map((p) => ({
          period: `${p.month}/${p.year}`,
          employeeId: p.employee?.employeeId || '—',
          name: p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : '—',
          department: p.employee?.department || 'General',
          basicSalary: p.basicSalary,
          allowances: p.allowances,
          bonus: p.bonus,
          deductions: p.deductions,
          netSalary: p.netSalary,
          paymentStatus: p.paymentStatus,
          paymentDate: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—',
        }));
        break;
    }

    // Generate CSV String
    let csvString = '';
    if (query.format === 'CSV') {
      const headerLine = columns.map((c) => `"${c.label}"`).join(',');
      const dataLines = rows.map((row) =>
        columns
          .map((c) => {
            const val = row[c.key] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      );
      csvString = [headerLine, ...dataLines].join('\r\n');
    }

    return {
      reportType: query.type,
      totalRows: rows.length,
      columns,
      rows,
      csvString,
    };
  }
}

export const analyticsService = new AnalyticsService();
