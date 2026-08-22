'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
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
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Employee';

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={`Welcome back, ${fullName}`}
        description="Here is your personal attendance, time tracking, and leave summary for today."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/employee/leave">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Apply Leave
              </Button>
            </Link>
            <Link href="/employee/attendance">
              <Button size="sm" className="gap-2">
                Time Tracker <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Today's Punch Status */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Attendance
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {todayAttendance?.isCheckedOut ? (
                <span className="text-amber-500">Day Completed</span>
              ) : todayAttendance?.isCheckedIn ? (
                <span className="text-emerald-500">Working ({todayAttendance.totalHours} hrs)</span>
              ) : (
                <span className="text-muted-foreground">Not Clocked In</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayAttendance?.checkInTime
                ? `In at ${new Date(todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Click below to punch in'}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Paid Leave Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Paid Leave Available
            </CardTitle>
            <SunMedium className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{leaveBalances?.paid?.remaining ?? 18} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              {leaveBalances?.paid?.used ?? 0} of {leaveBalances?.paid?.total ?? 18} used this year
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Sick Leave Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sick Leave Available
            </CardTitle>
            <HeartPulse className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{leaveBalances?.sick?.remaining ?? 10} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              {leaveBalances?.sick?.used ?? 0} of {leaveBalances?.sick?.total ?? 10} used this year
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Employee Identity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Designation & Dept
            </CardTitle>
            <Briefcase className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{profile?.department || 'General'}</div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{profile?.employeeId}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Live Quick Punch & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Punch Clock Widget */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Quick Punch & Time Tracking
              </span>
              <Link href="/employee/attendance">
                <Button variant="ghost" size="sm" className="text-xs">
                  Full Attendance Ledger →
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Record your daily work shifts with one click and track logged hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Current Status</p>
                <div className="flex items-center gap-2">
                  {todayAttendance?.isCheckedOut ? (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10">
                      Day Completed ({todayAttendance.totalHours} hrs)
                    </Badge>
                  ) : todayAttendance?.isCheckedIn ? (
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 animate-pulse">
                      ● Active Working Shift
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-muted text-muted-foreground">
                      Not Clocked In Yet
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => handlePunch('check-in')}
                  disabled={todayAttendance?.isCheckedIn || isPunching}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <LogIn className="h-4 w-4" /> Punch In
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handlePunch('check-out')}
                  disabled={!todayAttendance?.isCheckedIn || todayAttendance?.isCheckedOut || isPunching}
                  className="font-semibold flex items-center gap-1.5"
                >
                  <LogOut className="h-4 w-4" /> Punch Out
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="rounded-lg border p-2.5">
                <p className="text-muted-foreground">Clock In</p>
                <p className="font-semibold text-foreground mt-0.5 font-mono">
                  {todayAttendance?.checkInTime
                    ? new Date(todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </p>
              </div>
              <div className="rounded-lg border p-2.5">
                <p className="text-muted-foreground">Clock Out</p>
                <p className="font-semibold text-foreground mt-0.5 font-mono">
                  {todayAttendance?.checkOutTime
                    ? new Date(todayAttendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </p>
              </div>
              <div className="rounded-lg border p-2.5">
                <p className="text-muted-foreground">Logged Hours</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {todayAttendance?.totalHours != null ? `${todayAttendance.totalHours} hrs` : '--'}
                </p>
              </div>
              <div className="rounded-lg border p-2.5">
                <p className="text-muted-foreground">Daily Target</p>
                <p className="font-semibold text-foreground mt-0.5">8.0 hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Leave Shortcut Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarOff className="h-5 w-5 text-primary" /> Leave & Time Off
            </CardTitle>
            <CardDescription>Manage and apply for personal time off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Paid Annual Leave</span>
                <span className="font-bold text-sky-500">{leaveBalances?.paid?.remaining ?? 18} days</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Sick Leave</span>
                <span className="font-bold text-emerald-500">{leaveBalances?.sick?.remaining ?? 10} days</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Unpaid Leaves</span>
                <span className="font-bold text-foreground">{leaveBalances?.unpaid?.used ?? 0} taken</span>
              </div>
            </div>

            <Link href="/employee/leave" className="block pt-2">
              <Button className="w-full font-semibold gap-2" size="sm">
                <Plus className="h-4 w-4" /> Apply for Time Off
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
