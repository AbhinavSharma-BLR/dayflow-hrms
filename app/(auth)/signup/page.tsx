'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  React.useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user) {
      const user = session.user as any;
      if (user.mustChangePassword) {
        router.replace('/change-password');
      } else if (user.role === 'HR') {
        router.replace('/hr/dashboard');
      } else {
        router.replace('/employee/dashboard');
      }
    } else if (sessionStatus === 'unauthenticated') {
      router.replace('/?tab=signup');
    }
  }, [session, sessionStatus, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d11]">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  );
}
