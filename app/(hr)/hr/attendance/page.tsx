'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CalendarCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Coffee,
  CalendarOff,
  UserX,
  Search,
  SlidersHorizontal,
  Plus,
  Loader2,
  X,
  Clock,
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
  employee: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string | null;
    designation: string | null;
    profilePicture: string | null;
  };
}

interface AttendanceStats {
  totalEmployees: number;
  present: number;
  halfDay: number;
  onLeave: number;
  absent: number;
  attendanceRate: number;
}

export default function HRAttendancePage() {
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [stats, setStats] = React.useState<AttendanceStats | null>(null);
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [isLoading, setIsLoading] = React.useState(true);

  // Manual Override Modal State
  const [isOverrideModalOpen, setIsOverrideModalOpen] = React.useState(false);
  const [overrideEmpId, setOverrideEmpId] = React.useState('');
  const [overrideDate, setOverrideDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [overrideStatus, setOverrideStatus] = React.useState<'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'>('PRESENT');
  const [overrideCheckIn, setOverrideCheckIn] = React.useState('');
  const [overrideCheckOut, setOverrideCheckOut] = React.useState('');
  const [overrideNotes, setOverrideNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [employeesList, setEmployeesList] = React.useState<any[]>([]);

  // Fetch HR Attendance Records
  const fetchData = async () => {
    try {
      setIsLoading(true);
      let url = `/api/attendance?startDate=${selectedDate}&endDate=${selectedDate}&limit=100`;
      if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setRecords(json.data || []);
        if (json.meta?.stats) {
          setStats(json.meta.stats);
        }
      }
    } catch (err) {
      toast.error('Failed to load workforce attendance');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Employees List for Override Dropdown
  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees?limit=200');
      const json = await res.json();
      if (json.success) {
        setEmployeesList(json.data || []);
        if (json.data?.length > 0 && !overrideEmpId) {
          setOverrideEmpId(json.data[0].id);
        }
      }
    } catch (err) {
      // Ignored
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [selectedDate, statusFilter]);

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle Manual Override Submission
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideEmpId) {
      toast.error('Please select an employee');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: any = {
        employeeId: overrideEmpId,
        date: overrideDate,
        status: overrideStatus,
        notes: overrideNotes.trim() || undefined,
      };

      if (overrideCheckIn) payload.checkIn = `${overrideDate}T${overrideCheckIn}:00.000Z`;
      if (overrideCheckOut) payload.checkOut = `${overrideDate}T${overrideCheckOut}:00.000Z`;

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || 'Failed to record manual attendance');
        return;
      }

      toast.success('Attendance record updated successfully!');
      setIsOverrideModalOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = React.useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(
      (r) =>
        r.employee.firstName.toLowerCase().includes(q) ||
        r.employee.lastName.toLowerCase().includes(q) ||
        r.employee.employeeId.toLowerCase().includes(q) ||
        (r.employee.department && r.employee.department.toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        title="Workforce Attendance Oversight"
        description="Monitor organization-wide daily punch activity, check working hours, and manage attendance logs."
        breadcrumbs={[
          { label: 'HR Dashboard', href: '/hr/dashboard' },
          { label: 'Attendance Oversight' },
        ]}
        actions={
          <Button
            onClick={() => setIsOverrideModalOpen(true)}
            className="flex items-center gap-2 shadow-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Manual Attendance Log
          </Button>
        }
      />

      {/* Top Section: Daily Workforce Attendance Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {/* Attendance Rate */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Attendance Rate</span>
            <CardTitle className="text-3xl font-extrabold text-primary">
              {stats?.attendanceRate ?? 0}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">{stats?.present ?? 0} of {stats?.totalEmployees ?? 0} active</p>
          </CardContent>
        </Card>

        {/* Present Today */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Present</span>
            <CardTitle className="text-3xl font-bold text-emerald-500">
              {stats?.present ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">Full workday attendance</p>
          </CardContent>
        </Card>

        {/* Half Days */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Half Days</span>
            <CardTitle className="text-3xl font-bold text-amber-500">
              {stats?.halfDay ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">Under required hours</p>
          </CardContent>
        </Card>

        {/* On Leave */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">On Leave</span>
            <CardTitle className="text-3xl font-bold text-blue-500">
              {stats?.onLeave ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">Approved time off</p>
          </CardContent>
        </Card>

        {/* Absent */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Absent / Unlogged</span>
            <CardTitle className="text-3xl font-bold text-rose-500">
              {stats?.absent ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">No punch recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Filters & Organization Attendance Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div className="flex flex-1 items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Viewing Date:</span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 text-xs w-40"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">No attendance records found</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                No logs matching the selected filters for {selectedDate}. Use "Manual Attendance Log" to record logs.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    <th className="pb-3">Employee</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Clock In</th>
                    <th className="pb-3">Clock Out</th>
                    <th className="pb-3">Total Hours</th>
                    <th className="pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {r.employee.firstName[0]}
                            {r.employee.lastName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {r.employee.firstName} {r.employee.lastName}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {r.employee.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{r.employee.department || 'General'}</td>
                      <td className="py-3">{getStatusBadge(r.status)}</td>
                      <td className="py-3 font-mono text-muted-foreground">{formatTime(r.checkIn)}</td>
                      <td className="py-3 font-mono text-muted-foreground">{formatTime(r.checkOut)}</td>
                      <td className="py-3 font-semibold text-foreground">
                        {r.totalHours != null ? `${r.totalHours} hrs` : '--'}
                      </td>
                      <td className="py-3 text-muted-foreground max-w-xs truncate">{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Attendance Override Modal */}
      {isOverrideModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Manual Attendance Record / Override</h3>
                <p className="text-xs text-muted-foreground">Create or adjust attendance records on behalf of employees</p>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              {/* Employee Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Employee</label>
                <select
                  value={overrideEmpId}
                  onChange={(e) => setOverrideEmpId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId} - {emp.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Date</label>
                  <Input
                    type="date"
                    value={overrideDate}
                    onChange={(e) => setOverrideDate(e.target.value)}
                    required
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Status</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value as any)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="LEAVE">On Leave</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>
              </div>

              {/* Clock In & Clock Out Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Clock In Time (HH:MM)</label>
                  <Input
                    type="time"
                    value={overrideCheckIn}
                    onChange={(e) => setOverrideCheckIn(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Clock Out Time (HH:MM)</label>
                  <Input
                    type="time"
                    value={overrideCheckOut}
                    onChange={(e) => setOverrideCheckOut(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Admin Override Notes</label>
                <Input
                  placeholder="e.g., Manual punch override approved by HR"
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOverrideModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-semibold">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Record'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
