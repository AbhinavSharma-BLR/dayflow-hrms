'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CalendarOff,
  CheckCircle2,
  XCircle,
  Clock,
  Inbox,
  Search,
  Filter,
  Loader2,
  X,
  AlertCircle,
  UserCheck,
  CalendarCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface LeaveItem {
  id: string;
  type: 'PAID' | 'SICK' | 'UNPAID';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  hrComment: string | null;
  createdAt: string;
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

interface LeaveStats {
  pendingCount: number;
  approvedThisMonth: number;
  activeToday: number;
}

export default function HRLeavesPage() {
  const [leaves, setLeaves] = React.useState<LeaveItem[]>([]);
  const [stats, setStats] = React.useState<LeaveStats | null>(null);
  const [activeTab, setActiveTab] = React.useState<'PENDING' | 'ALL'>('PENDING');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = React.useState<LeaveItem | null>(null);
  const [decisionType, setDecisionType] = React.useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [hrComment, setHrComment] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Fetch Leaves Data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      let url = '/api/leaves?limit=100';
      if (activeTab === 'PENDING') {
        url += '&status=PENDING';
      } else if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setLeaves(json.data || []);
        if (json.meta?.stats) {
          setStats(json.meta.stats);
        }
      }
    } catch (err) {
      toast.error('Failed to load leave records');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter]);

  // Open Decision Dialog
  const openDecisionModal = (leave: LeaveItem, decision: 'APPROVED' | 'REJECTED') => {
    setSelectedLeave(leave);
    setDecisionType(decision);
    setHrComment('');
  };

  // Submit Leave Decision
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      setIsProcessing(true);
      const res = await fetch(`/api/leaves/${selectedLeave.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decisionType,
          hrComment: hrComment.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || `Failed to ${decisionType.toLowerCase()} leave`);
        return;
      }

      toast.success(
        `Leave application for ${selectedLeave.employee.firstName} ${selectedLeave.employee.lastName} was ${decisionType.toLowerCase()}!`
      );
      setSelectedLeave(null);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredLeaves = React.useMemo(() => {
    if (!searchQuery.trim()) return leaves;
    const q = searchQuery.toLowerCase();
    return leaves.filter(
      (l) =>
        l.employee.firstName.toLowerCase().includes(q) ||
        l.employee.lastName.toLowerCase().includes(q) ||
        l.employee.employeeId.toLowerCase().includes(q) ||
        (l.employee.department && l.employee.department.toLowerCase().includes(q))
    );
  }, [leaves, searchQuery]);

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
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse">Pending Review</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PAID':
        return <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400">Paid</Badge>;
      case 'SICK':
        return <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">Sick</Badge>;
      case 'UNPAID':
      default:
        return <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400">Unpaid</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Leave Management & Approvals"
        description="Review incoming employee leave requests, approve time-off allocations, and monitor leave records."
        breadcrumbs={[
          { label: 'HR Dashboard', href: '/hr/dashboard' },
          { label: 'Leave Approvals' },
        ]}
      />

      {/* Top Section: Overview Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Pending Requests */}
        <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Pending Approvals</CardTitle>
            <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-500">
              {stats?.pendingCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Applications awaiting your review</p>
          </CardContent>
        </Card>

        {/* Approved This Month */}
        <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Approved This Month</CardTitle>
            <CalendarCheck className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-500">
              {stats?.approvedThisMonth ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leaves granted in the current calendar month</p>
          </CardContent>
        </Card>

        {/* Active on Leave Today */}
        <Card className="border-blue-500/20 bg-gradient-to-br from-card to-blue-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">On Leave Today</CardTitle>
            <UserCheck className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-500">
              {stats?.activeToday ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Staff members currently taking approved time off</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card with Navigation Tabs */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-1">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'PENDING'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pending Requests ({stats?.pendingCount ?? 0})
              </button>
              <button
                onClick={() => setActiveTab('ALL')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Applications
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employee or dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              {activeTab === 'ALL' ? (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">
                {activeTab === 'PENDING' ? 'No pending leave requests!' : 'No leave records found'}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {activeTab === 'PENDING'
                  ? 'All submitted applications have been processed. Great job staying up to date!'
                  : 'No records matched your search and filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    <th className="pb-3">Employee</th>
                    <th className="pb-3">Leave Type</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3">Working Days</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {filteredLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {l.employee.firstName[0]}
                            {l.employee.lastName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {l.employee.firstName} {l.employee.lastName}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {l.employee.employeeId} · {l.employee.department || 'General'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">{getTypeBadge(l.type)}</td>
                      <td className="py-3.5 font-medium text-foreground">
                        {formatDate(l.startDate)} <span className="text-muted-foreground">→</span> {formatDate(l.endDate)}
                      </td>
                      <td className="py-3.5 font-bold text-foreground">
                        {l.totalDays} day{l.totalDays > 1 ? 's' : ''}
                      </td>
                      <td className="py-3.5 text-muted-foreground max-w-xs truncate" title={l.reason}>
                        {l.reason}
                      </td>
                      <td className="py-3.5">{getStatusBadge(l.status)}</td>
                      <td className="py-3.5 text-right">
                        {l.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => openDecisionModal(l, 'APPROVED')}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDecisionModal(l, 'REJECTED')}
                              className="h-8 border-rose-500/40 text-rose-500 hover:bg-rose-500/10 font-semibold text-xs px-3"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            {l.hrComment ? `"${l.hrComment}"` : 'Decided'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review & Decision Dialog */}
      {selectedLeave ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {decisionType === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedLeave.employee.firstName} {selectedLeave.employee.lastName} ({selectedLeave.totalDays} days of {selectedLeave.type} leave)
                </p>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border bg-muted/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-semibold text-foreground">
                  {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason given:</span>
                <span className="text-foreground italic max-w-[240px] text-right truncate">
                  "{selectedLeave.reason}"
                </span>
              </div>
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  HR Review Comment {decisionType === 'REJECTED' ? '(Recommended)' : '(Optional)'}
                </label>
                <textarea
                  value={hrComment}
                  onChange={(e) => setHrComment(e.target.value)}
                  placeholder={
                    decisionType === 'APPROVED'
                      ? 'e.g., Approved, have a good time off!'
                      : 'e.g., Critical sprint deliverable during this period...'
                  }
                  rows={3}
                  className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedLeave(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className={`font-semibold ${
                    decisionType === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : decisionType === 'APPROVED' ? (
                    'Confirm Approval'
                  ) : (
                    'Confirm Rejection'
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
