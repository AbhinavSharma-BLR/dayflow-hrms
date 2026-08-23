import * as React from 'react';
import { cn } from '@/lib/utils';

interface DayflowLogoProps {
  className?: string;
  size?: number;
  withGlow?: boolean;
}

export function DayflowLogo({ className, size = 36, withGlow = true }: DayflowLogoProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105',
        className
      )}
      style={{ width: size, height: size }}
    >
      {withGlow && (
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#7a3cff] to-[#2bf0ff] opacity-40 blur-md pointer-events-none"
        />
      )}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
      >
        <defs>
          <linearGradient id="dayflowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2bf0ff" />
            <stop offset="55%" stopColor="#7a3cff" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="dayflowInner" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2bf0ff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7a3cff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Rounded Modern D Outer Profile */}
        <path
          d="M24 16 H54 C74 16 86 30 86 50 C86 70 74 84 54 84 H24 C20 84 18 82 18 78 V22 C18 18 20 16 24 16 Z"
          stroke="url(#dayflowGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Modern Aerodynamic Inner Prism */}
        <path
          d="M38 32 H52 C63 32 70 40 70 50 C70 60 63 68 52 68 H38 V32 Z"
          fill="url(#dayflowInner)"
          stroke="url(#dayflowGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Forward-Flow Cyber Accent Node */}
        <circle cx="52" cy="50" r="4.5" fill="#2bf0ff" />
      </svg>
    </div>
  );
}
