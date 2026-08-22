import * as React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      {/* Top Bar for Auth */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex items-center gap-2 font-bold text-2xl text-primary tracking-tight">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <span>Dayflow</span>
      </div>

      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm transition-all sm:p-8">
        {children}
      </div>

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Dayflow HRMS. All rights reserved.
      </footer>
    </div>
  );
}
