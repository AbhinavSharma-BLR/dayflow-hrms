'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'HR' | 'EMPLOYEE';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { data: session, status } = useSession();

  React.useEffect(() => {
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
  }, [status, session, requiredRole]);

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
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 max-w-sm w-full p-6 rounded-2xl bg-[#0e0828]/90 border border-indigo-900/60 backdrop-blur-2xl text-center shadow-2xl">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30">
            <ShieldAlert className="h-6 w-6 text-red-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Authentication Required</h3>
            <p className="text-xs text-slate-400">Please sign in to access your Dayflow portal.</p>
          </div>
          <Button
            onClick={() => {
              window.location.href = '/';
            }}
            className="w-full h-9 rounded-xl bg-gradient-to-r from-[#2bf0ff] to-[#7a3cff] text-[#070318] font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
