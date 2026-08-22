import * as React from 'react';
import { Role } from '@prisma/client';
import { Sidebar } from '@/components/shared/sidebar';
import { Topbar } from '@/components/shared/topbar';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={Role.HR} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar role={Role.HR} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
