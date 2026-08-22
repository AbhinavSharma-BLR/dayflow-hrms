'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, Users, CheckCircle2, Copy, Sparkles, Mail, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function HREmployeesPage() {
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newEmployeeNotice, setNewEmployeeNotice] = React.useState<any | null>(null);

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Engineer',
  });

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/employees');
      const json = await res.json();
      if (res.ok && json.success) {
        setEmployees(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching employees list', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewEmployeeNotice(null);

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || 'Failed to create employee');
        return;
      }

      toast.success(`Employee ${json.data.employeeId} created successfully!`);
      setNewEmployeeNotice(json.data);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'Engineering',
        designation: 'Software Engineer',
      });
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during employee creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory & Management"
        description="Add new employees, generate automatic Employee IDs, and manage workforce profiles."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'HR Dashboard', href: '/hr/dashboard' }, { label: 'Employees' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Add New Employee
          </Button>
        }
      />

      {/* Creation Notice Banner */}
      {newEmployeeNotice ? (
        <Card className="border-emerald-500/40 bg-emerald-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Employee Created Successfully
            </CardTitle>
            <CardDescription className="text-xs">
              System generated unique Employee ID and temporary credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Auto Generated Employee ID</p>
              <p className="font-mono font-bold text-sm text-foreground">{newEmployeeNotice.employeeId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Work Email</p>
              <p className="font-semibold text-foreground">{newEmployeeNotice.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Initial Temporary Password</p>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{newEmployeeNotice.tempPassword}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Employee List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Workforce Directory ({employees.length})</span>
          </CardTitle>
          <CardDescription>All onboarded organization members</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No employee records found. Click &quot;Add New Employee&quot; to onboard staff.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/50 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-accent/50 transition-colors">
                      <td className="p-3 font-mono font-semibold text-primary">{emp.employeeId}</td>
                      <td className="p-3 font-medium">{emp.firstName} {emp.lastName}</td>
                      <td className="p-3 text-muted-foreground">{emp.email}</td>
                      <td className="p-3">{emp.department || 'N/A'}</td>
                      <td className="p-3">{emp.designation || 'N/A'}</td>
                      <td className="p-3">
                        {emp.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* HR Add Employee Modal Dialog */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <Card className="w-full max-w-lg shadow-2xl border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" /> Onboard New Employee
              </CardTitle>
              <CardDescription className="text-xs">
                Fill in employee details. The system automatically generates a unique Employee ID and temporary credentials.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">First Name</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Jane"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Last Name</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Work Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane.doe@company.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Department</label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Engineering"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Designation</label>
                    <Input
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Phone (Optional)</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    Create Employee Record
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
