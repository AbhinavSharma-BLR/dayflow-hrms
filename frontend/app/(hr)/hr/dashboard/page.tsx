'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/shared/page-header';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  CalendarOff,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Plus,
  CreditCard,
  BarChart3,
  FileSpreadsheet,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

export default function HRDashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const hrName = user?.name || 'HR Administrator';
  const [attStats, setAttStats] = React.useState<any>(null);
  const [leaveStats, setLeaveStats] = React.useState<any>(null);
  const [payrollStats, setPayrollStats] = React.useState<any>(null);
  const [employeeCount, setEmployeeCount] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setIsLoading(true);
        const todayStr = new Date().toISOString().split('T')[0];
        const [attRes, leaveRes, empRes, payRes] = await Promise.all([
          fetch(`/api/attendance?startDate=${todayStr}&endDate=${todayStr}&limit=1`),
          fetch('/api/leaves?limit=1'),
          fetch('/api/employees?limit=1'),
          fetch('/api/payroll?limit=1'),
        ]);

        const attJson = await attRes.json();
        const leaveJson = await leaveRes.json();
        const empJson = await empRes.json();
        const payJson = await payRes.json();

        if (attJson.meta?.stats) setAttStats(attJson.meta.stats);
        if (leaveJson.meta?.stats) setLeaveStats(leaveJson.meta.stats);
        if (empJson.meta?.total != null) setEmployeeCount(empJson.meta.total);
        if (payJson.meta?.stats) setPayrollStats(payJson.meta.stats);
      } catch (err) {
        console.error('Failed to load HR dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  const totalWorkforce = employeeCount || attStats?.totalEmployees || 7;
  const presentToday = attStats?.present ?? 0;
  const attendanceRate = attStats?.attendanceRate ?? (totalWorkforce > 0 ? Math.round((presentToday / totalWorkforce) * 100) : 0);
  const pendingLeaves = leaveStats?.pendingCount ?? 0;
  const onLeaveToday = leaveStats?.onLeaveToday ?? 0;
  const halfDays = attStats?.halfDays ?? 0;
  const absentCount = Math.max(0, totalWorkforce - presentToday - halfDays);

  return (
    <div className="space-y-6 pb-12 font-sans select-none">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-[#7a3cff]/40 via-[#2bf0ff]/30 to-indigo-900/20 shadow-xl">
        <div className="rounded-[23px] bg-[#0c0724]/90 border border-white/10 p-6 md:p-8 backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2bf0ff]/30 bg-[#070318]/90 text-[#8fe6ff] text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-[#2bf0ff]" />
              <span>HR Management Central</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2bf0ff] to-[#8fe6ff]">{hrName}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Live workforce operations, daily biometric attendance tracking, and pending staff approvals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/hr/leaves">
              <LiquidMetalButton label={`Review Leaves (${pendingLeaves})`} />
            </Link>
            <Link href="/hr/attendance">
              <LiquidMetalButton label="Attendance Oversight" />
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Core Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Total Workforce */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-5 backdrop-blur-xl shadow-lg hover:border-[#7a3cff]/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7a3cff]/10 rounded-full blur-2xl group-hover:bg-[#7a3cff]/20 transition-all" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
            <div className="p-2 rounded-xl bg-[#7a3cff]/15 text-[#8fe6ff] border border-[#7a3cff]/30">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalWorkforce}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#2bf0ff]" />
            <span>Active registered personnel</span>
          </div>
        </div>

        {/* 2. Present Today */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-5 backdrop-blur-xl shadow-lg hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Present Today</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{presentToday}</span>
            <span className="text-xs font-bold text-slate-400 font-mono">({attendanceRate}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Clocked in today</span>
          </div>
        </div>

        {/* 3. Pending Leave Reviews */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-5 backdrop-blur-xl shadow-lg hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Leaves</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">{pendingLeaves}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>Awaiting decision</span>
          </div>
        </div>

        {/* 4. On Leave Today */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-5 backdrop-blur-xl shadow-lg hover:border-[#2bf0ff]/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#2bf0ff]/10 rounded-full blur-2xl group-hover:bg-[#2bf0ff]/20 transition-all" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">On Leave Today</span>
            <div className="p-2 rounded-xl bg-[#2bf0ff]/15 text-[#8fe6ff] border border-[#2bf0ff]/30">
              <CalendarOff className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#8fe6ff]">{onLeaveToday}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <CalendarCheck className="h-3.5 w-3.5 text-[#8fe6ff]" />
            <span>Approved time-off</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Live Attendance Oversight & Leave Review Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Workforce Attendance Real-Time Tracking */}
        <div className="lg:col-span-2 rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-900/40 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-[#2bf0ff]" />
                Workforce Attendance Real-Time Tracking
              </h2>
              <p className="text-xs text-slate-400">
                Daily clock activity, working hours calculations, and manual attendance overrides.
              </p>
            </div>
            <Link
              href="/hr/attendance"
              className="text-xs font-bold text-[#2bf0ff] hover:text-[#8fe6ff] hover:underline flex items-center gap-1 shrink-0"
            >
              Inspect All Logs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Attendance Stat Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-indigo-900/60 bg-[#070318]/90 p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Attendance Rate</span>
              <div className="text-2xl font-black text-[#2bf0ff]">{attendanceRate}%</div>
            </div>
            <div className="rounded-xl border border-indigo-900/60 bg-[#070318]/90 p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Present Today</span>
              <div className="text-2xl font-black text-emerald-400">{presentToday}</div>
            </div>
            <div className="rounded-xl border border-indigo-900/60 bg-[#070318]/90 p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Half-Days</span>
              <div className="text-2xl font-black text-amber-400">{halfDays}</div>
            </div>
            <div className="rounded-xl border border-indigo-900/60 bg-[#070318]/90 p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Absent / Unlogged</span>
              <div className="text-2xl font-black text-red-400">{absentCount}</div>
            </div>
          </div>

          {/* Attendance Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>Today's Workforce Participation</span>
              <span className="text-[#2bf0ff] font-bold">{attendanceRate}% Active</span>
            </div>
            <div className="h-2.5 w-full bg-[#070318] rounded-full overflow-hidden border border-indigo-900/60 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7a3cff] to-[#2bf0ff] transition-all duration-500 shadow-sm shadow-[#2bf0ff]/50"
                style={{ width: `${Math.min(100, Math.max(5, attendanceRate))}%` }}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-indigo-900/40">
            <span className="text-xs text-slate-400">
              Need to record a missing punch or manual clock-in for an employee?
            </span>
            <Link href="/hr/attendance">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-indigo-900/60 bg-white/5 hover:bg-white/10 text-slate-100 font-semibold gap-1.5 h-9"
              >
                <Plus className="h-3.5 w-3.5 text-[#2bf0ff]" /> Manual Attendance Log
              </Button>
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Leave Approvals Card */}
        <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1 border-b border-indigo-900/40 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarOff className="h-5 w-5 text-amber-400" />
                Leave Approvals
              </h2>
              <p className="text-xs text-slate-400">
                Review and decide employee leave applications
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070318]/90 border border-indigo-900/50">
                <span className="text-xs font-semibold text-slate-300">Pending Approvals</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {pendingLeaves}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070318]/90 border border-indigo-900/50">
                <span className="text-xs font-semibold text-slate-300">Approved This Month</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {leaveStats?.approvedCount ?? 1}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070318]/90 border border-indigo-900/50">
                <span className="text-xs font-semibold text-slate-300">On Leave Today</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#2bf0ff]/20 text-[#8fe6ff] border border-[#2bf0ff]/30">
                  {onLeaveToday}
                </span>
              </div>
            </div>
          </div>

          <Link href="/hr/leaves" className="w-full flex justify-center pt-2">
            <LiquidMetalButton label={`Open Leave Inbox (${pendingLeaves})`} />
          </Link>
        </div>
      </div>

      {/* Quick Action Operations Hub */}
      <div className="rounded-2xl border border-indigo-900/50 bg-[#0e0828]/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#2bf0ff]" /> Quick Management Shortcuts
          </h2>
          <span className="text-xs text-slate-400">1-Click Workspace Actions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/hr/employees?action=new"
            className="p-4 rounded-xl border border-indigo-900/60 bg-[#070318]/90 hover:border-[#7a3cff]/60 hover:bg-[#180a3a]/60 transition-all duration-200 group"
          >
            <Users className="h-5 w-5 text-[#2bf0ff] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white group-hover:text-[#8fe6ff]">Add New Employee</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Onboard staff & auto-generate ID</div>
          </Link>

          <Link
            href="/hr/payroll"
            className="p-4 rounded-xl border border-indigo-900/60 bg-[#070318]/90 hover:border-[#7a3cff]/60 hover:bg-[#180a3a]/60 transition-all duration-200 group"
          >
            <CreditCard className="h-5 w-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white group-hover:text-purple-300">Run Monthly Payroll</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Batch calculate & issue payslips</div>
          </Link>

          <Link
            href="/hr/analytics"
            className="p-4 rounded-xl border border-indigo-900/60 bg-[#070318]/90 hover:border-[#7a3cff]/60 hover:bg-[#180a3a]/60 transition-all duration-200 group"
          >
            <BarChart3 className="h-5 w-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white group-hover:text-emerald-300">Analytics & Insights</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Headcount & attendance metrics</div>
          </Link>

          <Link
            href="/hr/reports"
            className="p-4 rounded-xl border border-indigo-900/60 bg-[#070318]/90 hover:border-[#7a3cff]/60 hover:bg-[#180a3a]/60 transition-all duration-200 group"
          >
            <FileSpreadsheet className="h-5 w-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white group-hover:text-amber-300">Reports & CSV Export</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Master roster & ledger audit</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
