'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarOff,
  CreditCard,
  Bell,
  Users,
  BarChart3,
  FileSpreadsheet,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { Role } from '@prisma/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  role: Role;
}

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: string;
}

// Active Phase 2, 3 & 4 navigation items
const employeeNavItems: SidebarNavItem[] = [
  { title: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard, active: true },
  { title: 'My Profile', href: '/employee/profile', icon: User, active: true },
  { title: 'Attendance', href: '/employee/attendance', icon: CalendarCheck, active: true },
  { title: 'Leave', href: '/employee/leave', icon: CalendarOff, active: true },
  { title: 'Payroll & Payslips', href: '/employee/payroll', icon: CreditCard, active: true },
];

const hrNavItems: SidebarNavItem[] = [
  { title: 'HR Dashboard', href: '/hr/dashboard', icon: LayoutDashboard, active: true },
  { title: 'Employee Directory', href: '/hr/employees', icon: Users, active: true },
  { title: 'Attendance Oversight', href: '/hr/attendance', icon: CalendarCheck, active: true },
  { title: 'Leave Approvals', href: '/hr/leaves', icon: CalendarOff, active: true },
  { title: 'Payroll Management', href: '/hr/payroll', icon: CreditCard, active: true },
  { title: 'Analytics & Insights', href: '/hr/analytics', icon: BarChart3, active: true },
  { title: 'Reports & Export', href: '/hr/reports', icon: FileSpreadsheet, active: true },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const items = role === Role.HR ? hrNavItems : employeeNavItems;

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card text-card-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Dayflow</span>
            <span className="text-[10px] rounded border px-1.5 py-0.5 text-muted-foreground font-mono font-normal">
              {role}
            </span>
          </Link>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex h-7 w-7"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar collapse"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active && (pathname === item.href || (item.href !== '#' && pathname?.startsWith(`${item.href}/`)));

          if (!item.active) {
            return (
              <div
                key={item.title}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground/60 cursor-not-allowed select-none',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? `${item.title} (${item.badge})` : undefined}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-50" />
                {!collapsed ? (
                  <div className="flex flex-1 items-center justify-between">
                    <span>{item.title}</span>
                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                      {item.badge}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.title}</span> : null}
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="border-t p-2">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed ? <span>Sign Out</span> : null}
        </button>
      </div>
    </aside>
  );
}
