import * as React from 'react';
import { Role } from '@prisma/client';
import { Sidebar } from '@/components/shared/sidebar';
import { Topbar } from '@/components/shared/topbar';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AuthGuard } from '@/components/shared/auth-guard';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#080417] text-slate-100 relative selection:bg-[#2bf0ff]/30 selection:text-white">
      {/* Subtle ambient radial glow */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[300px] bg-[#7a3cff]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-[#2bf0ff]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Sidebar role={Role.EMPLOYEE} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar role={Role.EMPLOYEE} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <ErrorBoundary>
            <AuthGuard requiredRole="EMPLOYEE">
              {children}
            </AuthGuard>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
