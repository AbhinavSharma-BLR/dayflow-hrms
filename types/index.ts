import { Role, AttendanceStatus, LeaveType, LeaveStatus, NotificationType } from '@prisma/client';

export type { Role, AttendanceStatus, LeaveType, LeaveStatus, NotificationType };

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
