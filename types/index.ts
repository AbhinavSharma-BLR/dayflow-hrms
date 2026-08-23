export type Role = 'HR' | 'EMPLOYEE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
export type LeaveType = 'CASUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type NotificationType = 'LEAVE_REQUEST' | 'LEAVE_STATUS' | 'PAYROLL_GENERATED' | 'ATTENDANCE_ALERT' | 'SYSTEM';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export interface UserSession {
  userId: string;
  email: string;
  role: Role;
  employeeId?: string;
  name?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string; // lucide icon name
  badge?: string | number;
  roles: Role[];
  disabled?: boolean;
}
