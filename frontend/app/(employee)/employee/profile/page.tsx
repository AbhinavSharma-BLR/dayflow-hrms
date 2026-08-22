'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileAvatarUpload } from '@/components/employee/profile-avatar-upload';
import { ProfileEditDialog } from '@/components/employee/profile-edit-dialog';
import { Edit3, User, Mail, Phone, MapPin, Briefcase, Calendar, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function EmployeeProfilePage() {
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const fetchProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/employees/me');
      const json = await res.json();
      if (res.ok && json.success) {
        setProfile(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </Card>
      </div>
    );
  }

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Employee Profile';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Profile"
        description="View and update your personal information and contact details."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Employee Profile' }]}
        actions={
          <Button onClick={() => setIsEditOpen(true)} className="gap-2" size="sm">
            <Edit3 className="h-4 w-4" /> Edit Contact Info
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Overview Card */}
        <Card className="md:col-span-1 p-6 text-center space-y-4">
          <ProfileAvatarUpload
            currentPicture={profile?.profilePicture}
            name={fullName}
            onPictureUpdated={(url) => setProfile({ ...profile, profilePicture: url })}
          />

          <div>
            <h2 className="text-xl font-bold">{fullName}</h2>
            <p className="text-sm text-muted-foreground">{profile?.designation || 'Staff Member'}</p>
            <div className="mt-2 flex justify-center gap-2">
              <Badge variant="outline">{profile?.employeeId || 'N/A'}</Badge>
              <Badge variant="secondary">{profile?.department || 'General'}</Badge>
            </div>
          </div>

          <div className="border-t pt-4 text-left text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Status: {profile?.isActive ? 'Active Employee' : 'Inactive'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Joined: {formatDate(profile?.dateOfJoining)}</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Detailed Sections */}
        <div className="md:col-span-2 space-y-6">
          {/* Job Details Card (Read-only / HR Controlled) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Employment Information
                <Badge variant="outline" className="ml-auto text-[10px] font-normal">
                  HR Controlled
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Employee ID</p>
                <p className="font-medium mt-0.5">{profile?.employeeId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Work Email</p>
                <p className="font-medium mt-0.5">{profile?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium mt-0.5">{profile?.department || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Designation</p>
                <p className="font-medium mt-0.5">{profile?.designation || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date of Joining</p>
                <p className="font-medium mt-0.5">{formatDate(profile?.dateOfJoining)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">System Role</p>
                <p className="font-medium mt-0.5">{profile?.user?.role || 'EMPLOYEE'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details Card (Editable by Employee) */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> Contact & Address Details
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)} className="h-8 text-xs">
                Edit
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="font-medium mt-0.5">{profile?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Street Address</p>
                <p className="font-medium mt-0.5">{profile?.address || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">City</p>
                <p className="font-medium mt-0.5">{profile?.city || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">State / Province</p>
                <p className="font-medium mt-0.5">{profile?.state || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Country</p>
                <p className="font-medium mt-0.5">{profile?.country || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Postal Code</p>
                <p className="font-medium mt-0.5">{profile?.postalCode || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProfileEditDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={{
          phone: profile?.phone,
          address: profile?.address,
          city: profile?.city,
          state: profile?.state,
          country: profile?.country,
          postalCode: profile?.postalCode,
        }}
        onSaved={(updated) => setProfile({ ...profile, ...updated })}
      />
    </div>
  );
}
