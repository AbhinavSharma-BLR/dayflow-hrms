'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'HR' | 'EMPLOYEE';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.replace('/');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;

      if (user.mustChangePassword) {
        window.location.replace('/change-password');
        return;
      }

      if (requiredRole === 'HR' && user.role !== 'HR') {
        window.location.replace('/employee/dashboard');
        return;
      }

      if (requiredRole === 'EMPLOYEE' && user.role === 'HR') {
        window.location.replace('/hr/dashboard');
        return;
      }
    }
  }, [status, session, requiredRole, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#2bf0ff]" />
          <span className="text-xs text-slate-400 font-mono tracking-wider">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
