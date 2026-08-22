'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Bell, Search, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { Role } from '@prisma/client';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopbarProps {
  role: Role;
  userName?: string;
  userEmail?: string;
}

export function Topbar({ role }: TopbarProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const displayName = session?.user?.name || (role === Role.HR ? 'HR Manager' : 'Employee');
  const displayEmail = session?.user?.email || '';
  const displayRole = (session?.user as any)?.role || role;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card/80 px-6 backdrop-blur transition-all">
      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search portal..."
          className="w-full bg-background pl-9 h-9 text-sm rounded-lg"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark/Light mode toggle */}
        <ThemeToggle />

        {/* User Pill & Dropdown */}
        <div className="relative border-l pl-3">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-accent transition-colors focus:outline-none"
            aria-label="User menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-sm">
              {initial}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold leading-none">{displayName}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{displayRole}</span>
            </div>
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen ? (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card p-2 shadow-lg animate-in fade-in-50 z-50">
              <div className="px-3 py-2 border-b mb-1">
                <p className="text-xs font-semibold text-foreground leading-tight">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
                <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                  {displayRole}
                </span>
              </div>

              {displayRole === Role.EMPLOYEE ? (
                <Link
                  href="/employee/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
                >
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" /> My Profile
                </Link>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors mt-1"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
