'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileCode,
  Users,
  CalendarCheck,
  CalendarOff,
  CreditCard,
  Search,
  Filter,
  Loader2,
  Table,
} from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'EMPLOYEE_ROSTER' | 'ATTENDANCE_SUMMARY' | 'LEAVE_LEDGER' | 'PAYROLL_REGISTER';

export default function HRReportsPage() {
  const [reportType, setReportType] = React.useState<ReportType>('EMPLOYEE_ROSTER');
  const [department, setDepartment] = React.useState('ALL');
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [reportData, setReportData] = React.useState<any>(null);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      let url = `/api/reports?type=${reportType}&format=JSON`;
      if (department !== 'ALL') url += `&department=${department}`;
      if (reportType === 'ATTENDANCE_SUMMARY' || reportType === 'PAYROLL_REGISTER') {
        url += `&month=${selectedMonth}&year=${selectedYear}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setReportData(json.data);
      }
    } catch (err) {
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReport();
  }, [reportType, department, selectedMonth, selectedYear]);

  // Handle CSV Download
  const handleDownloadCSV = () => {
    let url = `/api/reports?type=${reportType}&format=CSV`;
    if (department !== 'ALL') url += `&department=${department}`;
    if (reportType === 'ATTENDANCE_SUMMARY' || reportType === 'PAYROLL_REGISTER') {
      url += `&month=${selectedMonth}&year=${selectedYear}`;
    }

    window.open(url, '_blank');
    toast.success('Downloading CSV report...');
  };

  // Handle JSON Export
  const handleExportJSON = () => {
    if (!reportData?.rows) return;
    const blob = new Blob([JSON.stringify(reportData.rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType.toLowerCase()}_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON export downloaded!');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredRows = React.useMemo(() => {
    if (!reportData?.rows) return [];
    if (!searchQuery.trim()) return reportData.rows;
    const q = searchQuery.toLowerCase();
    return reportData.rows.filter((row: any) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [reportData, searchQuery]);

  const reportDescriptions: Record<ReportType, { title: string; desc: string; icon: any }> = {
    EMPLOYEE_ROSTER: {
      title: 'Employee Master Roster',
      desc: 'Complete workforce personnel record with contact details, department, and active status.',
      icon: Users,
    },
    ATTENDANCE_SUMMARY: {
      title: 'Monthly Attendance & Time Audit',
      desc: 'Itemized punch activity, clocked hours, and attendance statuses for the selected month.',
      icon: CalendarCheck,
    },
    LEAVE_LEDGER: {
      title: 'Leave Requests & Utilization Ledger',
      desc: 'Historical record of employee time-off applications, approved days, and HR comments.',
      icon: CalendarOff,
    },
    PAYROLL_REGISTER: {
      title: 'Payroll & Compensation Register',
      desc: 'Monthly wage disbursement ledger with breakdown of basic, allowances, deductions, and take-home pay.',
      icon: CreditCard,
    },
  };

  const currentMeta = reportDescriptions[reportType];
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Enterprise Reports & Data Center"
        description="Generate, inspect, and export comprehensive enterprise HR reports in CSV, JSON, or printable format."
        breadcrumbs={[
          { label: 'HR Dashboard', href: '/hr/dashboard' },
          { label: 'Reports & Export' },
        ]}
      />

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            { type: 'EMPLOYEE_ROSTER', label: 'Employee Roster', icon: Users },
            { type: 'ATTENDANCE_SUMMARY', label: 'Attendance Audit', icon: CalendarCheck },
            { type: 'LEAVE_LEDGER', label: 'Leave Ledger', icon: CalendarOff },
            { type: 'PAYROLL_REGISTER', label: 'Payroll Register', icon: CreditCard },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isSelected = reportType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setReportType(tab.type)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                  : 'border-input hover:bg-muted/40 text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <div className="text-xs font-bold text-foreground">{tab.label}</div>
                <div className="text-[10px] text-muted-foreground">Standard Report</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Filter & Action Card */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title */}
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CurrentIcon className="h-5 w-5 text-primary" />
                {currentMeta.title}
              </CardTitle>
              <CardDescription>{currentMeta.desc}</CardDescription>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                className="h-8 text-xs font-semibold gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5 text-emerald-500" /> Download CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                className="h-8 text-xs font-semibold gap-1.5 shadow-sm"
              >
                <FileCode className="h-3.5 w-3.5 text-sky-500" /> Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 text-xs font-semibold gap-1.5 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5 text-purple-500" /> Print
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t mt-4">
            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search across all records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Dept:</span>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* Month/Year Filters if applicable */}
            {reportType === 'ATTENDANCE_SUMMARY' || reportType === 'PAYROLL_REGISTER' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Period:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {[
                      { m: 1, n: 'Jan' },
                      { m: 2, n: 'Feb' },
                      { m: 3, n: 'Mar' },
                      { m: 4, n: 'Apr' },
                      { m: 5, n: 'May' },
                      { m: 6, n: 'Jun' },
                      { m: 7, n: 'Jul' },
                      { m: 8, n: 'Aug' },
                      { m: 9, n: 'Sep' },
                      { m: 10, n: 'Oct' },
                      { m: 11, n: 'Nov' },
                      { m: 12, n: 'Dec' },
                    ].map((item) => (
                      <option key={item.m} value={item.m}>
                        {item.n}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}

            {/* Total Row Count Badge */}
            <div className="ml-auto text-xs text-muted-foreground font-medium">
              Showing <strong>{filteredRows.length}</strong> record{filteredRows.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Table className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">No records matched filter criteria</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Try clearing your search query or selecting "All Departments".
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b font-semibold uppercase text-muted-foreground tracking-wider bg-muted/20">
                    {reportData?.columns?.map((col: any) => (
                      <th key={col.key} className="p-3">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredRows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      {reportData?.columns?.map((col: any) => (
                        <td key={col.key} className="p-3 font-medium text-foreground">
                          {String(row[col.key] ?? '—')}
                        </td>
                      ))}
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
