'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Coffee,
  CalendarDays,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
  totalHours: number | null;
  notes: string | null;
}

interface AttendanceSummary {
  presentDays: number;
  halfDays: number;
  leaveDays: number;
  totalHoursWorked: number;
  avgDailyHours: number;
  recordsCount: number;
}

export default function EmployeeAttendancePage() {
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());
  const [todayStatus, setTodayStatus] = React.useState<any>(null);
  const [history, setHistory] = React.useState<{ summary: AttendanceSummary; records: AttendanceRecord[] } | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [notes, setNotes] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Live Clock Tick
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Today's Attendance & Monthly History
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [todayRes, historyRes] = await Promise.all([
        fetch('/api/attendance/today'),
        fetch(`/api/attendance/me?month=${selectedMonth}&year=${selectedYear}`),
      ]);

      const todayJson = await todayRes.json();
      const historyJson = await historyRes.json();

      if (todayJson.success) setTodayStatus(todayJson.data);
      if (historyJson.success) setHistory(historyJson.data);
    } catch (err) {
      toast.error('Failed to load attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  // Handle Punch In
  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() || undefined }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || 'Check-in failed');
        return;
      }

      toast.success('Successfully clocked in for today!');
      setNotes('');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Punch Out
  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() || undefined }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || 'Check-out failed');
        return;
      }

      toast.success('Successfully clocked out for today!');
      setNotes('');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper formatting
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Present</Badge>;
      case 'HALF_DAY':
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">Half Day</Badge>;
      case 'LEAVE':
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">On Leave</Badge>;
      case 'ABSENT':
      default:
        return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">Absent</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Attendance & Time Tracker"
        description="Clock in and out, track daily working hours, and review monthly attendance logs."
        breadcrumbs={[
          { label: 'Dashboard', href: '/employee/dashboard' },
          { label: 'Attendance' },
        ]}
      />

      {/* Top Section: Punch Clock & Summary Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Punch Clock Widget */}
        <Card className="lg:col-span-1 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary animate-pulse" />
                Live Punch Clock
              </CardTitle>
              {todayStatus?.isCheckedOut ? (
                <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10">
                  Day Completed
                </Badge>
              ) : todayStatus?.isCheckedIn ? (
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 animate-pulse">
                  ● Working
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted text-muted-foreground">
                  Not Checked In
                </Badge>
              )}
            </div>
            <CardDescription>
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Live Big Clock */}
            <div className="rounded-2xl border bg-background/50 p-6 text-center shadow-inner">
              <div className="font-mono text-4xl font-extrabold tracking-wider text-foreground">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {todayStatus?.isCheckedIn && !todayStatus.isCheckedOut ? (
                  <span className="text-emerald-500 font-medium">
                    Clocked in at {formatTime(todayStatus.checkInTime)} ({todayStatus.totalHours} hrs elapsed)
                  </span>
                ) : todayStatus?.isCheckedOut ? (
                  <span className="text-muted-foreground">
                    Total Logged Today: <strong className="text-foreground">{todayStatus.totalHours} hrs</strong>
                  </span>
                ) : (
                  'Ready to start your workday'
                )}
              </div>
            </div>

            {/* Optional Notes */}
            {!todayStatus?.isCheckedOut ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Work Log Note (Optional)</label>
                <Input
                  placeholder="e.g., Working from office / remote"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                />
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCheckIn}
                disabled={todayStatus?.isCheckedIn || isSubmitting}
                className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Punch In
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={!todayStatus?.isCheckedIn || todayStatus?.isCheckedOut || isSubmitting}
                variant="destructive"
                className="h-11 font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Punch Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {/* Days Present */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Days Present</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {history?.summary.presentDays ?? 0}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">days</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Full workday attendances this month</p>
            </CardContent>
          </Card>

          {/* Half Days & Absent */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Half Days</span>
                <Coffee className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {history?.summary.halfDays ?? 0}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">days</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Logs under standard working hours</p>
            </CardContent>
          </Card>

          {/* Total Hours Worked */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Total Work Hours</span>
                <Clock3 className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {history?.summary.totalHoursWorked ?? 0}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">hrs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Cumulative logged time for {selectedMonth}/{selectedYear}</p>
            </CardContent>
          </Card>

          {/* Daily Average Hours */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Daily Avg Hours</span>
                <TrendingUp className="h-4 w-4 text-sky-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {history?.summary.avgDailyHours ?? 0}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">hrs / day</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Average productivity per attended day</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Monthly Attendance Logs Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Monthly Attendance Ledger
            </CardTitle>
            <CardDescription>Detailed audit of daily punch-in, punch-out, and calculated hours.</CardDescription>
          </div>
          {/* Month/Year Picker */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[
                { m: 1, n: 'January' },
                { m: 2, n: 'February' },
                { m: 3, n: 'March' },
                { m: 4, n: 'April' },
                { m: 5, n: 'May' },
                { m: 6, n: 'June' },
                { m: 7, n: 'July' },
                { m: 8, n: 'August' },
                { m: 9, n: 'September' },
                { m: 10, n: 'October' },
                { m: 11, n: 'November' },
                { m: 12, n: 'December' },
              ].map((item) => (
                <option key={item.m} value={item.m}>
                  {item.n}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !history?.records || history.records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">No attendance records logged</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                You have not recorded attendance for the selected period yet. Use the Punch Clock above to start tracking.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Clock In</th>
                    <th className="pb-3">Clock Out</th>
                    <th className="pb-3">Total Hours</th>
                    <th className="pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {history.records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 font-medium text-foreground">{formatDate(rec.date)}</td>
                      <td className="py-3.5">{getStatusBadge(rec.status)}</td>
                      <td className="py-3.5 font-mono text-muted-foreground">{formatTime(rec.checkIn)}</td>
                      <td className="py-3.5 font-mono text-muted-foreground">{formatTime(rec.checkOut)}</td>
                      <td className="py-3.5 font-semibold text-foreground">
                        {rec.totalHours != null ? `${rec.totalHours} hrs` : '--'}
                      </td>
                      <td className="py-3.5 text-muted-foreground max-w-xs truncate">{rec.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
