import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const user = session.user as any;

  if (user.mustChangePassword) {
    redirect('/change-password');
  }

  if (user.role === 'HR') {
    redirect('/hr/dashboard');
  }

  redirect('/employee/dashboard');
}
