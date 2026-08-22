'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  User,
  Briefcase,
  CalendarCheck,
  CalendarOff,
  Clock,
  ArrowRight,
  ShieldCheck,
  LogIn,
  LogOut,
  SunMedium,
  HeartPulse,
  Plus,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function EmployeeDashboardPage() {
  const [profile, setProfile] = React.useState<any>(null);
  const [todayAttendance, setTodayAttendance] = React.useState<any>(null);
  const [leaveBalances, setLeaveBalances] = React.useState<any>(null);
  const [payrollSummary, setPayrollSummary] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPunching, setIsPunching] = React.useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [profRes, attRes, leaveRes, payRes] = await Promise.all([
        fetch('/api/employees/me'),
        fetch('/api/attendance/today'),
        fetch('/api/leaves/me'),
        fetch('/api/payroll/me'),
      ]);

      const profJson = await profRes.json();
      const attJson = await attRes.json();
      const leaveJson = await leaveRes.json();
      const payJson = await payRes.json();

      if (profRes.ok && profJson.success) setProfile(profJson.data);
      if (attRes.ok && attJson.success) setTodayAttendance(attJson.data);
      if (leaveRes.ok && leaveJson.success) setLeaveBalances(leaveJson.data.balances);
      if (payRes.ok && payJson.success) setPayrollSummary(payJson.data.summary);
    } catch (err) {
      console.error('Error loading employee dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePunch = async (action: 'check-in' | 'check-out') => {
    try {
      setIsPunching(true);
      const res = await fetch(`/api/attendance/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || `Failed to ${action}`);
        return;
      }

      toast.success(action === 'check-in' ? 'Successfully clocked in!' : 'Successfully clocked out!');
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsPunching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-indigo-900/30" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-2xl bg-indigo-900/20" />
          <Skeleton className="h-32 rounded-2xl bg-indigo-900/20" />
          <Skeleton className="h-32 rounded-2xl bg-indigo-900/20" />
          <Skeleton className="h-32 rounded-2xl bg-indigo-900/20" />
        </div>
      </div>
    );
  }

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Employee';

  return (
    <div className="space-y-6 pb-12 font-sans select-none">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-[#7a3cff]/40 via-[#2bf0ff]/30 to-indigo-900/20 shadow-xl">
        <div className="rounded-[23px] bg-[#0c0724]/90 border border-white/10 p-6 md:p-8 backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2bf0ff]/30 bg-[#070318]/90 text-[#8fe6ff] text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-[#2bf0ff]" />
              <span>Employee Portal Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2bf0ff] to-[#8fe6ff]">{fullName}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Personal shift punches, time tracking, leave balances, and salary payslips.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/employee/leave">
              <LiquidMetalButton label="Apply Leave" />
            </Link>
            <Link href="/employee/attendance">
              <LiquidMetalButton label="Time Tracker" />
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Today's Punch Status */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-5 backdrop-blur-xl shadow-lg hover:border-[#2bf0ff]/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#2bf0ff]/10 rounded-full blur-2xl group-hover:bg-[#2bf0ff]/20 transition-all" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Attendance</span>
            <div className="p-2 rounded-xl bg-[#2bf0ff]/15 text-[#8fe6ff] border border-[#2bf0ff]/30">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black">
            {todayAttendance?.isCheckedOut ? (
              <span className="text-amber-400">Day Completed</span>
            ) : todayAttendance?.isCheckedIn ? (
              <span className="text-emerald-400">Working ({todayAttendance.totalHours} hrs)</span>
            ) : (
              <span className="text-slate-400">Not Clocked In</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {todayAttendance?.checkInTime
              ? `In at ${new Date(todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Use quick widget below to punch in'}
          </p>
        </div>

        {/* Card 2: Paid Leave Balance */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-5 backdrop-blur-xl shadow-lg hover:border-[#7a3cff]/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7a3cff]/10 rounded-full blur-2xl group-hover:bg-[#7a3cff]/20 transition-all" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Leave Available</span>
            <div className="p-2 rounded-xl bg-[#7a3cff]/15 text-[#8fe6ff] border border-[#7a3cff]/30">
              <SunMedium className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{leaveBalances?.paid?.remaining ?? 18} <span className="text-sm font-normal text-slate-400">days</span></div>
          <p className="text-xs text-slate-400 mt-1">
            {leaveBalances?.paid?.used ?? 0} of {leaveBalances?.paid?.total ?? 18} days used this year
          </p>
        </div>

        {/* Card 3: Sick Leave Balance */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-5 backdrop-blur-xl shadow-lg hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sick Leave Balance</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">{leaveBalances?.sick?.remaining ?? 10} <span className="text-sm font-normal text-slate-400">days</span></div>
          <p className="text-xs text-slate-400 mt-1">
            {leaveBalances?.sick?.used ?? 0} of {leaveBalances?.sick?.total ?? 10} days used this year
          </p>
        </div>

        {/* Card 4: Employee Identity */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-5 backdrop-blur-xl shadow-lg hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Department</span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white truncate">{profile?.department || 'Engineering'}</div>
          <p className="text-xs text-[#2bf0ff] font-mono mt-1 font-semibold">{profile?.employeeId || 'EMP2026001'}</p>
        </div>
      </div>

      {/* Main Grid: Quick Punch Clock Widget & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Punch Clock Widget (2 cols) */}
        <div className="md:col-span-2 rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-900/40 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-[#2bf0ff]" />
                Live Attendance & Time Punch
              </h2>
              <p className="text-xs text-slate-400">
                Log your daily work hours with one-click shift tracking.
              </p>
            </div>
            <Link href="/employee/attendance">
              <Button variant="ghost" size="sm" className="text-xs text-[#2bf0ff] hover:text-white hover:bg-white/5">
                Full Ledger →
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-indigo-900/60 bg-[#070318]/90 p-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold uppercase">Current Status</p>
              <div>
                {todayAttendance?.isCheckedOut ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Day Completed ({todayAttendance.totalHours} hrs)
                  </span>
                ) : todayAttendance?.isCheckedIn ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Active Working Shift
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    Not Clocked In Yet
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => handlePunch('check-in')}
                disabled={todayAttendance?.isCheckedIn || isPunching}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <LogIn className="h-4 w-4" /> Clock In
              </Button>
              <Button
                size="sm"
                onClick={() => handlePunch('check-out')}
                disabled={!todayAttendance?.isCheckedIn || todayAttendance?.isCheckedOut || isPunching}
                className="h-10 px-4 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20"
              >
                <LogOut className="h-4 w-4" /> Clock Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="rounded-xl border border-indigo-900/50 bg-[#070318]/70 p-3">
              <p className="text-slate-400 text-[11px]">Clock In</p>
              <p className="font-bold text-white mt-1 font-mono text-sm">
                {todayAttendance?.checkInTime
                  ? new Date(todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-900/50 bg-[#070318]/70 p-3">
              <p className="text-slate-400 text-[11px]">Clock Out</p>
              <p className="font-bold text-white mt-1 font-mono text-sm">
                {todayAttendance?.checkOutTime
                  ? new Date(todayAttendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-900/50 bg-[#070318]/70 p-3">
              <p className="text-slate-400 text-[11px]">Logged Hours</p>
              <p className="font-bold text-[#2bf0ff] mt-1 text-sm">
                {todayAttendance?.totalHours != null ? `${todayAttendance.totalHours} hrs` : '--'}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-900/50 bg-[#070318]/70 p-3">
              <p className="text-slate-400 text-[11px]">Daily Target</p>
              <p className="font-bold text-white mt-1 text-sm">8.0 hrs</p>
            </div>
          </div>
        </div>

        {/* Quick Leave & Payslip Shortcuts (1 col) */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-indigo-900/40 pb-4 space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                Latest Payroll
              </h2>
              <p className="text-xs text-slate-400">
                Monthly compensation & digital payslips
              </p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-900/60 bg-[#070318]/90 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Base</span>
                <span className="font-bold text-white font-mono">
                  ${payrollSummary?.baseSalary ? Number(payrollSummary.baseSalary).toLocaleString() : '85,000'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Payment Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Disbursed
                </span>
              </div>
            </div>
          </div>

          <Link href="/employee/payroll" className="w-full flex justify-center pt-2">
            <LiquidMetalButton label="View Digital Payslip" />
          </Link>
        </div>
      </div>
    </div>
  );
}
