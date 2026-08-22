'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  React.useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/login');
    } else if (sessionStatus === 'authenticated' && session?.user) {
      const user = session.user as any;
      if (user.mustChangePassword) {
        router.replace('/change-password');
      } else if (user.role === 'HR') {
        router.replace('/hr/dashboard');
      } else {
        router.replace('/employee/dashboard');
      }
    }
  }, [session, sessionStatus, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d11]">
      <div className="flex flex-col items-center gap-3 text-purple-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );
}
