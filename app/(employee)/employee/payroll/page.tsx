'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  X,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

interface PayrollItem {
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
  createdAt: string;
}

interface PayrollSummary {
  ytdGross: number;
  ytdDeductions: number;
  ytdNet: number;
  paidCount: number;
  totalPayslips: number;
  currentMonthlySalary: number;
}

export default function EmployeePayrollPage() {
  const [payrolls, setPayrolls] = React.useState<PayrollItem[]>([]);
  const [summary, setSummary] = React.useState<PayrollSummary | null>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = React.useState(true);

  // Payslip Modal State
  const [selectedSlip, setSelectedSlip] = React.useState<PayrollItem | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [payRes, profRes] = await Promise.all([
        fetch(`/api/payroll/me?year=${selectedYear}`),
        fetch('/api/employees/me'),
      ]);

      const payJson = await payRes.json();
      const profJson = await profRes.json();

      if (payJson.success) {
        setPayrolls(payJson.data.payrolls || []);
        setSummary(payJson.data.summary || null);
      }
      if (profJson.success) {
        setProfile(profJson.data);
      }
    } catch (err) {
      toast.error('Failed to load payslip data');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [selectedYear]);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Payroll & Payslips"
        description="View your monthly salary statements, year-to-date compensation summary, and download official payslips."
        breadcrumbs={[
          { label: 'Dashboard', href: '/employee/dashboard' },
          { label: 'Payroll & Payslips' },
        ]}
      />

      {/* Top Section: Compensation & YTD Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Latest Monthly Net */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-sm">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Latest Net Salary</span>
            <CardTitle className="text-3xl font-extrabold text-primary">
              ₹{(summary?.currentMonthlySalary ?? 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Monthly take-home compensation</p>
          </CardContent>
        </Card>

        {/* Card 2: YTD Gross Earned */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">YTD Gross Earnings</span>
            <CardTitle className="text-3xl font-bold text-foreground">
              ₹{(summary?.ytdGross ?? 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Basic + allowances in {selectedYear}</p>
          </CardContent>
        </Card>

        {/* Card 3: YTD Total Deductions */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">YTD Deductions</span>
            <CardTitle className="text-3xl font-bold text-rose-500">
              ₹{(summary?.ytdDeductions ?? 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Taxes & standard withholdings</p>
          </CardContent>
        </Card>

        {/* Card 4: Net Payouts Received */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">YTD Net Received</span>
            <CardTitle className="text-3xl font-bold text-emerald-500">
              ₹{(summary?.ytdNet ?? 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">{summary?.paidCount ?? 0} pay periods disbursed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section: Monthly Payslips History Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Payslip Archive
            </CardTitle>
            <CardDescription>Itemized monthly salary records with breakdown of earnings and deductions.</CardDescription>
          </div>
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Financial Year:</span>
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
          ) : payrolls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <CreditCard className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">No payslips generated for {selectedYear}</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Your monthly payslips will be visible here as soon as HR generates and publishes the monthly payroll run.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    <th className="pb-3">Pay Period</th>
                    <th className="pb-3">Basic Salary</th>
                    <th className="pb-3">Allowances</th>
                    <th className="pb-3">Bonus</th>
                    <th className="pb-3">Deductions</th>
                    <th className="pb-3">Net Take-Home</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 font-bold text-foreground">
                        {monthNames[p.month]} {p.year}
                      </td>
                      <td className="py-3.5 font-mono text-muted-foreground">₹{p.basicSalary.toLocaleString()}</td>
                      <td className="py-3.5 font-mono text-muted-foreground">₹{p.allowances.toLocaleString()}</td>
                      <td className="py-3.5 font-mono text-emerald-500">
                        {p.bonus > 0 ? `+₹${p.bonus.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3.5 font-mono text-rose-500">
                        {p.deductions > 0 ? `-₹${p.deductions.toLocaleString()}` : '₹0'}
                      </td>
                      <td className="py-3.5 font-bold text-foreground text-sm font-mono">
                        ₹{p.netSalary.toLocaleString()}
                      </td>
                      <td className="py-3.5">{getStatusBadge(p.paymentStatus)}</td>
                      <td className="py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSlip(p)}
                          className="h-8 text-xs font-semibold gap-1.5"
                        >
                          <FileText className="h-3.5 w-3.5" /> View Payslip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Digital Payslip Modal */}
      {selectedSlip ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border bg-card p-8 shadow-2xl space-y-6 my-8">
            {/* Header Controls */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Dayflow HRMS — Official Payslip</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Salary statement for {monthNames[selectedSlip.month]} {selectedSlip.year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs gap-1.5">
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Card Container */}
            <div className="space-y-6 text-xs">
              {/* Company & Employee Summary Table */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground">Employee Name</p>
                  <p className="font-bold text-sm text-foreground">
                    {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-muted-foreground font-mono">{profile?.employeeId}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[11px] text-muted-foreground">Department & Role</p>
                  <p className="font-semibold text-foreground">{profile?.department || 'Engineering'}</p>
                  <p className="text-muted-foreground">{profile?.designation || 'Staff Member'}</p>
                </div>
              </div>

              {/* Pay Details Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Pay Period</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {monthNames[selectedSlip.month]} {selectedSlip.year}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Payment Status</p>
                  <p className="font-semibold text-emerald-500 mt-0.5">{selectedSlip.paymentStatus}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Disbursement Date</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedSlip.paymentDate
                      ? new Date(selectedSlip.paymentDate).toLocaleDateString()
                      : 'Pending Cycle'}
                  </p>
                </div>
              </div>

              {/* Itemized Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings Column */}
                <div className="rounded-xl border p-4 space-y-3">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[11px] border-b pb-2">
                    Earnings Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Basic Pay</span>
                      <span className="font-mono font-semibold">₹{selectedSlip.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HRA & Special Allowance</span>
                      <span className="font-mono font-semibold">₹{selectedSlip.allowances.toLocaleString()}</span>
                    </div>
                    {selectedSlip.bonus > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Performance Bonus</span>
                        <span className="font-mono font-semibold text-emerald-500">
                          +₹{selectedSlip.bonus.toLocaleString()}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-foreground">
                    <span>Total Gross Pay</span>
                    <span className="font-mono">
                      ₹{(selectedSlip.basicSalary + selectedSlip.allowances + selectedSlip.bonus).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="rounded-xl border p-4 space-y-3">
                  <h4 className="font-bold text-rose-500 uppercase tracking-wider text-[11px] border-b pb-2">
                    Deductions & Withholdings
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provident Fund (PF)</span>
                      <span className="font-mono font-semibold">
                        ₹{Math.round(selectedSlip.deductions * 0.6).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Professional Tax & Ins</span>
                      <span className="font-mono font-semibold">
                        ₹{Math.round(selectedSlip.deductions * 0.4).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-rose-500">
                    <span>Total Deductions</span>
                    <span className="font-mono">-₹{selectedSlip.deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Take-Home Highlight Card */}
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-primary">Net Salary Payout (Take-Home)</p>
                  <p className="text-[11px] text-muted-foreground">
                    Credited to registered bank account on file
                  </p>
                </div>
                <div className="text-3xl font-extrabold font-mono text-foreground">
                  ₹{selectedSlip.netSalary.toLocaleString()}
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center text-[10px] text-muted-foreground pt-2 border-t">
                This is a computer-generated salary slip and does not require a physical signature. Generated by Dayflow HRMS.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
