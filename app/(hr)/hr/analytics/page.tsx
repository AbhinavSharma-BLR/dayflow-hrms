'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarCheck,
  CalendarOff,
  CreditCard,
  Building,
  CheckCircle2,
  PieChart,
  Activity,
  DollarSign,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HRAnalyticsPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      toast.error('Failed to load analytics metrics');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, []);

  const deptColors: Record<string, string> = {
    Engineering: 'bg-indigo-500 text-indigo-500',
    Product: 'bg-sky-500 text-sky-500',
    Design: 'bg-pink-500 text-pink-500',
    Marketing: 'bg-amber-500 text-amber-500',
    Sales: 'bg-emerald-500 text-emerald-500',
    HR: 'bg-purple-500 text-purple-500',
    Finance: 'bg-teal-500 text-teal-500',
    Operations: 'bg-orange-500 text-orange-500',
    General: 'bg-blue-500 text-blue-500',
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const workforce = data?.workforce;
  const attendance = data?.attendance;
  const leaves = data?.leaves;
  const payroll = data?.payroll;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Analytics & Workforce Insights"
        description="Comprehensive visualization of organizational headcount, attendance trends, leave utilization, and payroll expenditures."
        breadcrumbs={[
          { label: 'HR Dashboard', href: '/hr/dashboard' },
          { label: 'Analytics & Insights' },
        ]}
      />

      {/* Top Section: High-Level KPI Badges */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total Headcount */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-sm">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Total Active Staff</span>
            <CardTitle className="text-3xl font-extrabold text-primary flex items-center justify-between">
              <span>{workforce?.totalEmployees ?? 0}</span>
              <Users className="h-5 w-5 text-primary/60" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Across {workforce?.departmentDistribution?.length ?? 1} departments</p>
          </CardContent>
        </Card>

        {/* Avg Attendance Rate */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Attendance Rate</span>
            <CardTitle className="text-3xl font-bold text-emerald-500 flex items-center justify-between">
              <span>
                {attendance?.timeline?.length > 0
                  ? attendance.timeline[attendance.timeline.length - 1]?.attendanceRate ?? 100
                  : 100}%
              </span>
              <CalendarCheck className="h-5 w-5 text-emerald-500/60" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Recent workforce punctuality</p>
          </CardContent>
        </Card>

        {/* Leave Approval Rate */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Leave Approval Rate</span>
            <CardTitle className="text-3xl font-bold text-sky-500 flex items-center justify-between">
              <span>{leaves?.approvalRate ?? 100}%</span>
              <CalendarOff className="h-5 w-5 text-sky-500/60" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">{leaves?.totalDaysApproved ?? 0} of {leaves?.totalDaysRequested ?? 0} days approved</p>
          </CardContent>
        </Card>

        {/* Monthly Payroll Total */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Latest Monthly Spend</span>
            <CardTitle className="text-3xl font-bold text-foreground flex items-center justify-between">
              <span className="font-mono truncate">
                ₹{((payroll?.monthlyTrends?.[payroll.monthlyTrends.length - 1]?.totalSpend) ?? 0).toLocaleString()}
              </span>
              <CreditCard className="h-5 w-5 text-purple-500/60" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Monthly net compensation total</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Department Distribution & Leave Utilization */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Breakdown Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Workforce Distribution by Department
            </CardTitle>
            <CardDescription>Headcount allocation across business units</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {workforce?.departmentDistribution?.map((dept: any) => {
              const colorClass = deptColors[dept.name] || 'bg-primary text-primary';
              const bgBar = colorClass.split(' ')[0];
              return (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground">{dept.name}</span>
                    <span className="text-muted-foreground">
                      <strong>{dept.count}</strong> staff ({dept.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${bgBar} transition-all duration-500`}
                      style={{ width: `${Math.max(8, dept.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Leave Type Allocation & Status Breakdown */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CalendarOff className="h-5 w-5 text-amber-500" />
              Time-Off & Leave Breakdown
            </CardTitle>
            <CardDescription>Distribution of leave types and requests status</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Leave Types Comparison */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">Paid Leaves</p>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                  {leaves?.typeBreakdown?.PAID ?? 0}
                  <span className="text-xs font-normal text-muted-foreground ml-1">days</span>
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">Sick Leaves</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {leaves?.typeBreakdown?.SICK ?? 0}
                  <span className="text-xs font-normal text-muted-foreground ml-1">days</span>
                </p>
              </div>
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">Unpaid Leaves</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {leaves?.typeBreakdown?.UNPAID ?? 0}
                  <span className="text-xs font-normal text-muted-foreground ml-1">days</span>
                </p>
              </div>
            </div>

            {/* Approval Ratio Progress */}
            <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground">Leave Application Resolution</span>
                <span className="text-emerald-500 font-bold">{leaves?.approvalRate ?? 100}% Approved</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-emerald-500"
                  style={{
                    width: `${
                      leaves?.totalApplications
                        ? (leaves.statusBreakdown.APPROVED / leaves.totalApplications) * 100
                        : 100
                    }%`,
                  }}
                  title="Approved"
                />
                <div
                  className="bg-amber-500"
                  style={{
                    width: `${
                      leaves?.totalApplications
                        ? (leaves.statusBreakdown.PENDING / leaves.totalApplications) * 100
                        : 0
                    }%`,
                  }}
                  title="Pending"
                />
                <div
                  className="bg-rose-500"
                  style={{
                    width: `${
                      leaves?.totalApplications
                        ? (leaves.statusBreakdown.REJECTED / leaves.totalApplications) * 100
                        : 0
                    }%`,
                  }}
                  title="Rejected"
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                <span>{leaves?.statusBreakdown?.APPROVED ?? 0} Approved</span>
                <span>{leaves?.statusBreakdown?.PENDING ?? 0} Pending</span>
                <span>{leaves?.statusBreakdown?.REJECTED ?? 0} Rejected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Payroll Spending Trends & Department Salary Averages */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Average Salary Card */}
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Department Salary & Compensation Averages
            </CardTitle>
            <CardDescription>Average take-home pay per staff member by division</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {payroll?.departmentAvgSalaries?.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No payroll data recorded yet.
              </div>
            ) : (
              payroll?.departmentAvgSalaries?.map((dept: any) => (
                <div key={dept.department} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">{dept.department}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      ₹{dept.avgSalary.toLocaleString()} / mo
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.min(100, Math.max(15, (dept.avgSalary / 100000) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Monthly Payroll Expenditure Timeline */}
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Monthly Payroll Expenditure Ledger
            </CardTitle>
            <CardDescription>Historical monthly wage budgets and payouts</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {payroll?.monthlyTrends?.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No monthly payroll runs found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground uppercase">
                      <th className="pb-2">Pay Period</th>
                      <th className="pb-2">Staff Count</th>
                      <th className="pb-2">Basic Pool</th>
                      <th className="pb-2">Allowances</th>
                      <th className="pb-2 font-bold text-foreground">Total Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {payroll?.monthlyTrends?.map((item: any) => (
                      <tr key={item.month} className="hover:bg-muted/30">
                        <td className="py-3 font-semibold text-foreground">{item.month}</td>
                        <td className="py-3">{item.staffCount} staff</td>
                        <td className="py-3 font-mono text-muted-foreground">₹{item.basic.toLocaleString()}</td>
                        <td className="py-3 font-mono text-muted-foreground">₹{item.allowances.toLocaleString()}</td>
                        <td className="py-3 font-mono font-bold text-primary text-sm">
                          ₹{item.totalSpend.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
