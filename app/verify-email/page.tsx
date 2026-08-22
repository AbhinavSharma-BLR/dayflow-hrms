'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { data: session } = useSession();

  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided in URL');
      return;
    }

    const doVerify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const json = await res.json();

        if (res.ok && json.success) {
          setStatus('success');
          setMessage('Email verified successfully! Establishing session and redirecting to your portal...');

          // Redirect smoothly after short delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1200);
        } else {
          setStatus('error');
          setMessage(json.error?.message || 'Verification failed. The token may be invalid or expired.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage('Network error during email verification');
      }
    };

    doVerify();
  }, [token, router, session]);

  return (
    <Card className="w-full max-w-md text-center shadow-lg border">
      <CardHeader className="space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          {status === 'loading' ? (
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          ) : status === 'success' ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          ) : (
            <XCircle className="h-8 w-8 text-destructive" />
          )}
        </div>

        <CardTitle className="text-xl">
          {status === 'loading'
            ? 'Verifying Your Email...'
            : status === 'success'
            ? 'Email Verified!'
            : 'Verification Failed'}
        </CardTitle>

        <CardDescription className="text-sm">{message}</CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            <span>Redirecting to Dashboard...</span>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-3">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <React.Suspense
        fallback={
          <Card className="w-full max-w-md text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">Loading verification...</p>
          </Card>
        }
      >
        <VerifyEmailContent />
      </React.Suspense>
    </div>
  );
}
