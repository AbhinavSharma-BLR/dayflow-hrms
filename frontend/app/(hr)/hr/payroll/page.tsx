'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  Users,
  AlertCircle,
  FileText,
  Loader2,
  X,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

interface PayrollRecord {
  id: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  currency: string;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID';
  paymentDate: string | null;
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

interface PayrollStats {
  totalEmployees: number;
  processedCount: number;
  totalBudget: number;
  totalDisbursed: number;
  totalPending: number;
  paidCount: number;
  pendingCount: number;
  unprocessedCount: number;
}

export default function HRPayrollPage() {
  const [records, setRecords] = React.useState<PayrollRecord[]>([]);
  const [stats, setStats] = React.useState<PayrollStats | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [employeesList, setEmployeesList] = React.useState<any[]>([]);

  // Modals State
  const [isBatchModalOpen, setIsBatchModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = React.useState(false);
  const [selectedPayroll, setSelectedPayroll] = React.useState<PayrollRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Batch Form State
  const [batchBasic, setBatchBasic] = React.useState(50000);
  const [batchAllowances, setBatchAllowances] = React.useState(10000);
  const [batchDeductions, setBatchDeductions] = React.useState(5000);
  const [batchBonus, setBatchBonus] = React.useState(0);

  // Single Form State
  const [targetEmpId, setTargetEmpId] = React.useState('');
  const [singleBasic, setSingleBasic] = React.useState(60000);
  const [singleAllowances, setSingleAllowances] = React.useState(12000);
  const [singleDeductions, setSingleDeductions] = React.useState(6000);
  const [singleBonus, setSingleBonus] = React.useState(0);
  const [singleNotes, setSingleNotes] = React.useState('');

  // Disbursal Form State
  const [disburseDate, setDisburseDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [disburseNote, setDisburseNote] = React.useState('');

  const monthNames = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      let url = `/api/payroll?month=${selectedMonth}&year=${selectedYear}&limit=100`;
      if (statusFilter !== 'ALL') {
        url += `&paymentStatus=${statusFilter}`;
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
      toast.error('Failed to load payroll ledger');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees?limit=200');
      const json = await res.json();
      if (json.success) {
        setEmployeesList(json.data || []);
        if (json.data?.length > 0 && !targetEmpId) {
          setTargetEmpId(json.data[0].id);
        }
      }
    } catch (err) {
      // Ignored
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, statusFilter]);

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle Batch Payroll Generation
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/payroll/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          defaultBasicSalary: batchBasic,
          defaultAllowances: batchAllowances,
          defaultDeductions: batchDeductions,
          defaultBonus: batchBonus,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || 'Failed to process batch payroll');
        return;
      }

      toast.success(json.data?.message || 'Batch payroll generated successfully!');
      setIsBatchModalOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Individual Payroll Creation / Update
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId) {
      toast.error('Please select an employee');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: targetEmpId,
          month: selectedMonth,
          year: selectedYear,
          basicSalary: singleBasic,
          allowances: singleAllowances,
          deductions: singleDeductions,
          bonus: singleBonus,
          notes: singleNotes.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || 'Failed to save employee payroll');
        return;
      }

      toast.success('Employee salary slip saved successfully!');
      setIsCreateModalOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Disbursal / Mark as Paid
  const handleDisburseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayroll) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/payroll/${selectedPayroll.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'PAID',
          paymentDate: disburseDate,
          notes: disburseNote.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || 'Failed to mark as paid');
        return;
      }

      toast.success(
        `Salary marked as Paid for ${selectedPayroll.employee.firstName} ${selectedPayroll.employee.lastName}!`
      );
      setSelectedPayroll(null);
      setIsDisburseModalOpen(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Paid</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30">Processing</Badge>;
      case 'PENDING':
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Payroll & Compensation Management"
        description="Process monthly workforce payroll, generate salary slips, manage compensation structures, and track disbursements."
        breadcrumbs={[
          { label: 'HR Dashboard', href: '/hr/dashboard' },
          { label: 'Payroll Management' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-2 font-semibold shadow-sm"
            >
              <Play className="h-4 w-4 text-primary" />
              Run Monthly Batch
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add / Adjust Salary
            </Button>
          </div>
        }
      />

      {/* Top Section: Monthly Budget & Overview Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total Monthly Spend */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-sm">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Total Monthly Payroll</span>
            <CardTitle className="text-3xl font-extrabold text-primary">
              ₹{(stats?.totalBudget ?? 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              {stats?.processedCount ?? 0} payslips generated for {monthNames[selectedMonth]} {selectedYear}
            </p>
          </CardContent>
        </Card>

        {/* Disbursed (Paid) */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Disbursed (Paid)</span>
            <CardTitle className="text-3xl font-bold text-emerald-500">
              ₹{(stats?.totalDisbursed ?? 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">{stats?.paidCount ?? 0} staff paid</p>
          </CardContent>
        </Card>

        {/* Pending Payout */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Pending Payouts</span>
            <CardTitle className="text-3xl font-bold text-amber-500">
              ₹{(stats?.totalPending ?? 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">{stats?.pendingCount ?? 0} awaiting disbursement</p>
          </CardContent>
        </Card>

        {/* Workforce Coverage */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Workforce Coverage</span>
            <CardTitle className="text-3xl font-bold text-foreground">
              {stats?.processedCount ?? 0} / {stats?.totalEmployees ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              {stats?.unprocessedCount ?? 0} ungenerated slips
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section: Filters & Workforce Payroll Ledger */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div className="flex flex-1 items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff or dept..."
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
              <option value="ALL">All Payment Statuses</option>
              <option value="PENDING">Pending Only</option>
              <option value="PAID">Paid Only</option>
              <option value="PROCESSING">Processing Only</option>
            </select>
          </div>

          {/* Month / Year Pickers */}
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
              {[2024, 2025, 2026, 2027].map((y) => (
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
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <CreditCard className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">
                No payroll records found for {monthNames[selectedMonth]} {selectedYear}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                You haven't generated payroll for this month yet. Use "Run Monthly Batch" to generate payslips for all active staff in 1 click.
              </p>
              <Button onClick={() => setIsBatchModalOpen(true)} size="sm" className="gap-2">
                <Play className="h-4 w-4" /> Run Batch Payroll
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    <th className="pb-3">Employee</th>
                    <th className="pb-3">Basic</th>
                    <th className="pb-3">Allowances</th>
                    <th className="pb-3">Bonus</th>
                    <th className="pb-3">Deductions</th>
                    <th className="pb-3">Net Payout</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Disbursed On</th>
                    <th className="pb-3 text-right">Actions</th>
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
                              {r.employee.employeeId} · {r.employee.department || 'General'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-muted-foreground">₹{r.basicSalary.toLocaleString()}</td>
                      <td className="py-3 font-mono text-muted-foreground">₹{r.allowances.toLocaleString()}</td>
                      <td className="py-3 font-mono text-emerald-500">
                        {r.bonus > 0 ? `+₹${r.bonus.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 font-mono text-rose-500">
                        {r.deductions > 0 ? `-₹${r.deductions.toLocaleString()}` : '₹0'}
                      </td>
                      <td className="py-3 font-bold text-foreground text-sm font-mono">
                        ₹{r.netSalary.toLocaleString()}
                      </td>
                      <td className="py-3">{getStatusBadge(r.paymentStatus)}</td>
                      <td className="py-3 text-muted-foreground font-mono text-[11px]">
                        {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 text-right">
                        {r.paymentStatus !== 'PAID' ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPayroll(r);
                              setIsDisburseModalOpen(true);
                            }}
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3"
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ Disbursed
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

      {/* 1. Batch Payroll Generation Modal */}
      {isBatchModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Run Monthly Batch Payroll</h3>
                <p className="text-xs text-muted-foreground">
                  Generate salary statements for all active employees for {monthNames[selectedMonth]} {selectedYear}
                </p>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Basic Salary (₹)</label>
                  <Input
                    type="number"
                    value={batchBasic}
                    onChange={(e) => setBatchBasic(Number(e.target.value))}
                    min={0}
                    required
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Allowances (₹)</label>
                  <Input
                    type="number"
                    value={batchAllowances}
                    onChange={(e) => setBatchAllowances(Number(e.target.value))}
                    min={0}
                    required
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Deductions (₹)</label>
                  <Input
                    type="number"
                    value={batchDeductions}
                    onChange={(e) => setBatchDeductions(Number(e.target.value))}
                    min={0}
                    required
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Performance Bonus (₹)</label>
                  <Input
                    type="number"
                    value={batchBonus}
                    onChange={(e) => setBatchBonus(Number(e.target.value))}
                    min={0}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Computed Net Take-Home per Employee:</span>
                <span className="font-extrabold text-primary text-base font-mono">
                  ₹{(batchBasic + batchAllowances + batchBonus - batchDeductions).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBatchModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-semibold gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Run Batch ({monthNames[selectedMonth]} {selectedYear})
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* 2. Add / Adjust Individual Salary Modal */}
      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Add / Adjust Employee Salary</h3>
                <p className="text-xs text-muted-foreground">
                  Custom salary adjustment for {monthNames[selectedMonth]} {selectedYear}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Select Employee</label>
                <select
                  value={targetEmpId}
                  onChange={(e) => setTargetEmpId(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Basic Pay (₹)</label>
                  <Input
                    type="number"
                    value={singleBasic}
                    onChange={(e) => setSingleBasic(Number(e.target.value))}
                    min={0}
                    required
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">HRA & Allowances (₹)</label>
                  <Input
                    type="number"
                    value={singleAllowances}
                    onChange={(e) => setSingleAllowances(Number(e.target.value))}
                    min={0}
                    required
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Deductions (₹)</label>
                  <Input
                    type="number"
                    value={singleDeductions}
                    onChange={(e) => setSingleDeductions(Number(e.target.value))}
                    min={0}
                    required
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Bonus (₹)</label>
                  <Input
                    type="number"
                    value={singleBonus}
                    onChange={(e) => setSingleBonus(Number(e.target.value))}
                    min={0}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Notes / Comments</label>
                <Input
                  placeholder="e.g., Performance incentive included"
                  value={singleNotes}
                  onChange={(e) => setSingleNotes(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Calculated Net Salary:</span>
                <span className="font-extrabold text-primary text-base font-mono">
                  ₹{(singleBasic + singleAllowances + singleBonus - singleDeductions).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-semibold">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Salary Slip'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* 3. Disburse / Mark as Paid Modal */}
      {isDisburseModalOpen && selectedPayroll ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Confirm Salary Disbursement</h3>
                <p className="text-xs text-muted-foreground">
                  Mark salary as Paid for {selectedPayroll.employee.firstName} {selectedPayroll.employee.lastName}
                </p>
              </div>
              <button
                onClick={() => setIsDisburseModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee:</span>
                <span className="font-bold text-foreground">
                  {selectedPayroll.employee.firstName} {selectedPayroll.employee.lastName} ({selectedPayroll.employee.employeeId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pay Period:</span>
                <span className="font-semibold text-foreground">
                  {monthNames[selectedPayroll.month]} {selectedPayroll.year}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Disbursal Amount:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{selectedPayroll.netSalary.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleDisburseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Payment Date</label>
                <Input
                  type="date"
                  value={disburseDate}
                  onChange={(e) => setDisburseDate(e.target.value)}
                  required
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Transaction Reference / Note</label>
                <Input
                  placeholder="e.g., Bank NEFT/RTGS Ref: TXN-98234"
                  value={disburseNote}
                  onChange={(e) => setDisburseNote(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDisburseModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Disbursing...
                    </>
                  ) : (
                    'Confirm & Mark Paid'
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
