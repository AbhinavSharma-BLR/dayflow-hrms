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
  Users,
  BarChart3,
  FileSpreadsheet,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Role } from '@prisma/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DayflowLogo } from '@/components/shared/dayflow-logo';

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
        'relative flex flex-col border-r border-indigo-950/60 bg-[#0a0524]/95 text-slate-200 backdrop-blur-2xl transition-all duration-300 z-30 select-none shadow-xl',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#7a3cff]/10 to-transparent pointer-events-none" />

      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-indigo-900/40 px-4 relative z-10">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base tracking-wide group">
            <DayflowLogo size={34} withGlow={false} />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#8fe6ff]">
                Dayflow HRMS
              </span>
              <span className="text-[10px] font-mono text-[#2bf0ff] font-semibold tracking-wider">
                {role === Role.HR ? 'ADMIN PORTAL' : 'EMPLOYEE OS'}
              </span>
            </div>
          </Link>
        ) : (
          <div className="mx-auto flex items-center justify-center">
            <DayflowLogo size={32} withGlow={false} />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar collapse"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1.5 relative z-10">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.active &&
            (pathname === item.href || (item.href !== '#' && pathname?.startsWith(`${item.href}/`)));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 relative group',
                isActive
                  ? 'bg-gradient-to-r from-[#7a3cff]/25 to-[#2bf0ff]/20 text-[#2bf0ff] border-l-2 border-[#2bf0ff] shadow-md shadow-[#7a3cff]/15'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-0.5',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform duration-200',
                  isActive ? 'text-[#2bf0ff] scale-110' : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              {!collapsed ? (
                <span className="truncate">{item.title}</span>
              ) : null}
              {isActive && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#2bf0ff] animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="border-t border-indigo-900/40 p-3 relative z-10">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0 text-red-400" />
          {!collapsed ? <span>Sign Out</span> : null}
        </button>
      </div>
    </aside>
  );
}
