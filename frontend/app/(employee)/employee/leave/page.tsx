'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CalendarOff,
  Plus,
  HeartPulse,
  SunMedium,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface LeaveBalance {
  paid: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  unpaid: { used: number };
}

interface LeaveApplication {
  id: string;
  type: 'PAID' | 'SICK' | 'UNPAID';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  hrComment: string | null;
  createdAt: string;
}

export default function EmployeeLeavePage() {
  const [balances, setBalances] = React.useState<LeaveBalance | null>(null);
  const [leaves, setLeaves] = React.useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [leaveType, setLeaveType] = React.useState<'PAID' | 'SICK' | 'UNPAID'>('PAID');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Fetch Leave Data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/leaves/me');
      const json = await res.json();
      if (json.success) {
        setBalances(json.data.balances);
        setLeaves(json.data.leaves);
      }
    } catch (err) {
      toast.error('Failed to load leave records');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Compute estimated working days live
  const calculatedDays = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [startDate, endDate]);

  // Submit Leave Request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startDate || !endDate) {
      setFormError('Please select both start and end dates');
      return;
    }

    if (calculatedDays <= 0) {
      setFormError('The selected range contains no working days (weekends only)');
      return;
    }

    if (reason.trim().length < 5) {
      setFormError('Please provide a descriptive reason (at least 5 characters)');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: leaveType,
          startDate,
          endDate,
          reason: reason.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setFormError(json.error?.message || 'Failed to submit leave application');
        return;
      }

      toast.success('Leave application submitted successfully!');
      setIsModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      await fetchData();
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse">Pending HR Review</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PAID':
        return <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400">Paid Leave</Badge>;
      case 'SICK':
        return <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">Sick Leave</Badge>;
      case 'UNPAID':
      default:
        return <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400">Unpaid Leave</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Leave Management & Balances"
        description="View your annual leave entitlements, check balances, and apply for time off."
        breadcrumbs={[
          { label: 'Dashboard', href: '/employee/dashboard' },
          { label: 'Leave' },
        ]}
        actions={
          <Button
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 shadow-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Apply for Leave
          </Button>
        }
      />

      {/* Top Section: Leave Balances Overview */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Paid Leave Card */}
        <Card className="border-sky-500/20 bg-gradient-to-br from-card to-sky-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Paid Annual Leave</CardTitle>
            <SunMedium className="h-5 w-5 text-sky-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{balances?.paid.remaining ?? 0}</span>
              <span className="text-xs text-muted-foreground">days remaining</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-sky-500 transition-all duration-500"
                style={{
                  width: `${balances?.paid.total ? ((balances.paid.total - balances.paid.remaining) / balances.paid.total) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{balances?.paid.used ?? 0} used</span>
              <span>{balances?.paid.total ?? 18} total days/yr</span>
            </div>
          </CardContent>
        </Card>

        {/* Sick Leave Card */}
        <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Sick Leave</CardTitle>
            <HeartPulse className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{balances?.sick.remaining ?? 0}</span>
              <span className="text-xs text-muted-foreground">days remaining</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${balances?.sick.total ? ((balances.sick.total - balances.sick.remaining) / balances.sick.total) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{balances?.sick.used ?? 0} used</span>
              <span>{balances?.sick.total ?? 10} total days/yr</span>
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Leave Card */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-card to-purple-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Unpaid Time Off</CardTitle>
            <CalendarOff className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{balances?.unpaid.used ?? 0}</span>
              <span className="text-xs text-muted-foreground">days taken</span>
            </div>
            <div className="text-xs text-muted-foreground pt-3">
              Approved unpaid leaves subject to HR review
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: My Leave Applications History */}
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarCheck2 className="h-5 w-5 text-primary" />
            My Leave Requests
          </CardTitle>
          <CardDescription>Track submitted leave applications and view HR review statuses.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <CalendarOff className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">No leave applications found</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                You haven't requested any time off yet. Whenever you need time away, submit an application here.
              </p>
              <Button onClick={() => setIsModalOpen(true)} size="sm">
                Apply for Leave
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    <th className="pb-3">Applied On</th>
                    <th className="pb-3">Leave Type</th>
                    <th className="pb-3">Date Range</th>
                    <th className="pb-3">Working Days</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">HR Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 font-medium text-muted-foreground">{formatDate(l.createdAt)}</td>
                      <td className="py-3.5">{getTypeBadge(l.type)}</td>
                      <td className="py-3.5 font-medium text-foreground">
                        {formatDate(l.startDate)} <span className="text-muted-foreground">→</span> {formatDate(l.endDate)}
                      </td>
                      <td className="py-3.5 font-bold text-foreground">{l.totalDays} day{l.totalDays > 1 ? 's' : ''}</td>
                      <td className="py-3.5 text-muted-foreground max-w-xs truncate">{l.reason}</td>
                      <td className="py-3.5">{getStatusBadge(l.status)}</td>
                      <td className="py-3.5 text-muted-foreground max-w-xs truncate">{l.hrComment || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply for Leave Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Apply for Time Off</h3>
                <p className="text-xs text-muted-foreground">Submit a leave request for HR approval</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Notification */}
            {formError ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            ) : null}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Leave Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Leave Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'PAID', label: 'Paid Leave', desc: `${balances?.paid.remaining ?? 0} days left` },
                    { id: 'SICK', label: 'Sick Leave', desc: `${balances?.sick.remaining ?? 0} days left` },
                    { id: 'UNPAID', label: 'Unpaid', desc: 'No allowance deduction' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLeaveType(t.id as any)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        leaveType === t.id
                          ? 'border-primary bg-primary/10 text-primary font-semibold shadow-sm'
                          : 'border-input hover:bg-accent text-muted-foreground'
                      }`}
                    >
                      <div className="text-xs font-bold text-foreground">{t.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    required
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              {/* Working Days Calculated Alert */}
              {calculatedDays > 0 ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Calculated Working Days:</span>
                  <span className="font-bold text-primary text-sm">
                    {calculatedDays} working day{calculatedDays > 1 ? 's' : ''}
                  </span>
                </div>
              ) : null}

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Reason for Leave</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief details regarding your leave request..."
                  required
                  rows={3}
                  className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-semibold">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
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
