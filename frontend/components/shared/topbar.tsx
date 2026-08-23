'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Search, User as UserIcon, LogOut, ShieldCheck, Sparkles, Command } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Input } from '@/components/ui/input';

export type Role = 'HR' | 'EMPLOYEE';

interface TopbarProps {
  role: Role;
  userName?: string;
  userEmail?: string;
}

export function Topbar({ role }: TopbarProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const displayName = session?.user?.name || (role === 'HR' ? 'HR Administrator' : 'Staff Employee');
  const displayEmail = session?.user?.email || '';
  const displayRole = (session?.user as any)?.role || role;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-indigo-900/40 bg-[#0a0524]/80 px-6 backdrop-blur-2xl transition-all shadow-sm">
      {/* Search Input with Keyboard Shortcut */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search employees, payroll, attendance..."
          className="w-full h-9.5 pl-10 pr-12 rounded-xl border border-indigo-900/50 bg-[#070318]/90 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2bf0ff] focus:ring-1 focus:ring-[#2bf0ff]/30 transition-all duration-200"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-indigo-900/60 bg-[#0a0524] text-[10px] text-slate-400 font-mono">
          <Command className="h-3 w-3" /> K
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Fullscreen 3D Scene link */}
        <a
          href="/tunnel.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2bf0ff]/30 bg-[#070318]/80 text-[#8fe6ff] text-xs font-semibold hover:border-[#2bf0ff] hover:bg-[#070318] transition-all shadow-xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#2bf0ff]" /> 3D Tunnel
        </a>

        {/* Dark/Light mode toggle */}
        <div className="p-0.5 rounded-full border border-indigo-900/50 bg-[#070318]/70">
          <ThemeToggle />
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative border-l border-indigo-900/40 pl-3">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-indigo-900/40 transition-all focus:outline-none"
            aria-label="User menu"
          >
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-br from-[#7a3cff] to-[#2bf0ff] text-white font-bold text-xs shadow-md shadow-[#7a3cff]/20 ring-2 ring-[#2bf0ff]/20">
              {initial}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">{displayName}</span>
              <span className="text-[10px] text-[#2bf0ff] font-semibold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> {displayRole}
              </span>
            </div>
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen ? (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-indigo-900/60 bg-[#0e0828]/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in-50 z-50">
              <div className="px-3 py-2.5 border-b border-indigo-900/40 mb-1">
                <p className="text-xs font-bold text-white leading-tight">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{displayEmail}</p>
                <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] bg-[#2bf0ff]/10 text-[#8fe6ff] border border-[#2bf0ff]/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  <ShieldCheck className="h-3 w-3 text-[#2bf0ff]" /> {displayRole}
                </span>
              </div>

              {displayRole === 'EMPLOYEE' ? (
                <Link
                  href="/employee/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <UserIcon className="h-3.5 w-3.5 text-[#2bf0ff]" /> My Profile
                </Link>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mt-1"
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
