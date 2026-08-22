'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

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

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={`HR Dashboard — Welcome ${hrName}`}
        description="Organization workforce overview, real-time attendance tracking, and leave management."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'HR Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/hr/leaves">
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarOff className="h-4 w-4" /> Review Leaves ({leaveStats?.pendingCount ?? 0})
              </Button>
            </Link>
            <Link href="/hr/attendance">
              <Button size="sm" className="gap-2">
                <CalendarCheck className="h-4 w-4" /> Attendance Oversight <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Section: Organization Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Workforce */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Workforce
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{employeeCount || attStats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active staff members</p>
          </CardContent>
        </Card>

        {/* Present Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Present Today
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">
              {attStats?.present ?? 0}
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                ({attStats?.attendanceRate ?? 0}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Clocked in today</p>
          </CardContent>
        </Card>

        {/* Pending Leave Requests */}
        <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Leave Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {leaveStats?.pendingCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting HR decision</p>
          </CardContent>
        </Card>

        {/* On Leave Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On Leave Today
            </CardTitle>
            <CalendarOff className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {leaveStats?.activeToday ?? attStats?.onLeave ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Approved time-off</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Management Shortcuts & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Oversight Quick Action Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Workforce Attendance Real-Time Tracking
              </span>
              <Link href="/hr/attendance">
                <Button variant="ghost" size="sm" className="text-xs">
                  Inspect All Logs →
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Real-time daily clock activity, working hours calculations, and manual attendance overrides.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg border p-3 bg-card">
                <p className="text-muted-foreground">Attendance Rate</p>
                <p className="text-xl font-bold text-primary mt-1">{attStats?.attendanceRate ?? 0}%</p>
              </div>
              <div className="rounded-lg border p-3 bg-card">
                <p className="text-muted-foreground">Present Today</p>
                <p className="text-xl font-bold text-emerald-500 mt-1">{attStats?.present ?? 0}</p>
              </div>
              <div className="rounded-lg border p-3 bg-card">
                <p className="text-muted-foreground">Half-Days</p>
                <p className="text-xl font-bold text-amber-500 mt-1">{attStats?.halfDay ?? 0}</p>
              </div>
              <div className="rounded-lg border p-3 bg-card">
                <p className="text-muted-foreground">Absent / Unlogged</p>
                <p className="text-xl font-bold text-rose-500 mt-1">{attStats?.absent ?? 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Need to record a missing punch or manual clock-in for an employee?
              </span>
              <Link href="/hr/attendance">
                <Button size="sm" variant="outline" className="text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Manual Attendance Log
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Leave Approvals Queue Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarOff className="h-5 w-5 text-amber-500" />
                Leave Approvals
              </span>
              {leaveStats?.pendingCount > 0 ? (
                <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10">
                  {leaveStats.pendingCount} New
                </Badge>
              ) : null}
            </CardTitle>
            <CardDescription>Review and decide employee leave applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Pending Approvals</span>
                <span className="font-bold text-amber-500">{leaveStats?.pendingCount ?? 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Approved This Month</span>
                <span className="font-bold text-emerald-500">{leaveStats?.approvedThisMonth ?? 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">On Leave Today</span>
                <span className="font-bold text-blue-500">{leaveStats?.activeToday ?? 0}</span>
              </div>
            </div>

            <Link href="/hr/leaves" className="block pt-2">
              <Button className="w-full font-semibold gap-2" size="sm">
                Open Leave Inbox ({leaveStats?.pendingCount ?? 0})
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
