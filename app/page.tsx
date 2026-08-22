'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import {
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  KeyRound,
  Loader2,
  Compass,
  ChevronDown,
  ArrowRight,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  Shield,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { ThreeTunnelBackground } from '@/components/shared/three-tunnel-bg';

export default function Home() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = React.useState<'signin' | 'signup'>('signin');

  // Check URL query / hash for initial tab selection
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'signup' || params.get('view') === 'signup' || window.location.hash === '#signup') {
        setActiveTab('signup');
      }
    }
  }, []);

  // Sign In State
  const [loginIdOrEmail, setLoginIdOrEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const [isLoginLoading, setIsLoginLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  // Sign Up State
  const [fullName, setFullName] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [signupRole, setSignupRole] = React.useState<'EMPLOYEE' | 'HR'>('HR');
  const [showSignupPassword, setShowSignupPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSignupLoading, setIsSignupLoading] = React.useState(false);
  const [signupError, setSignupError] = React.useState<string | null>(null);

  const [isBootstrapping, setIsBootstrapping] = React.useState(false);

  // Automatically redirect authenticated users away from landing page
  React.useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user) {
      const user = session.user as any;
      if (user.mustChangePassword) {
        window.location.href = '/change-password';
      } else if (user.role === 'HR') {
        window.location.href = '/hr/dashboard';
      } else {
        window.location.href = '/employee/dashboard';
      }
    }
  }, [session, sessionStatus]);

  // Password strength calculation
  const passwordCriteria = React.useMemo(() => {
    const hasMinLen = signupPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(signupPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(signupPassword);
    const score = (hasMinLen ? 1 : 0) + (hasUpper ? 1 : 0) + (hasSpecial ? 1 : 0);
    return { hasMinLen, hasUpper, hasSpecial, score };
  }, [signupPassword]);

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const identifier = loginIdOrEmail.trim();
    if (!identifier || !loginPassword) {
      setLoginError('Please enter your Login ID / Work Email and Password');
      return;
    }

    try {
      setIsLoginLoading(true);
      const res = await signIn('credentials', {
        email: identifier,
        password: loginPassword,
        redirect: false,
      });

      if (res?.error) {
        setLoginError('Invalid credentials. Please check your email/login ID and password.');
        return;
      }

      toast.success('Signed in successfully!');
      window.location.href = '/dashboard';
    } catch (err: any) {
      setLoginError(err.message || 'An unexpected error occurred during sign in');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    if (signupPassword.length < 8) {
      setSignupError('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsSignupLoading(true);

      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || (signupRole === 'HR' ? 'Admin' : 'Staff');

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail.trim(),
          password: signupPassword,
          firstName,
          lastName,
          role: signupRole,
          phone: phone.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setSignupError(json.error?.message || 'Registration failed. Please check your details.');
        return;
      }

      toast.success('Account created! Authenticating session...');

      const signInRes = await signIn('credentials', {
        email: signupEmail.trim(),
        password: signupPassword,
        redirect: false,
      });

      if (!signInRes?.error) {
        const targetDashboard = signupRole === 'HR' ? '/hr/dashboard' : '/employee/dashboard';
        window.location.href = targetDashboard;
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setSignupError(err.message || 'An unexpected error occurred during registration');
    } finally {
      setIsSignupLoading(false);
    }
  };

  const fillCredential = (email: string, pass: string) => {
    setLoginIdOrEmail(email);
    setLoginPassword(pass);
    setLoginError(null);
    toast.info(`Filled credentials for ${email}`);
  };

  const handleBootstrapHR = async () => {
    try {
      setIsBootstrapping(true);
      const res = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin.hr@dayflow.com',
          password: 'Admin123!',
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('HR Admin account initialized! Authenticating session...');
      } else {
        toast.info('HR Admin account ready. Authenticating...');
      }

      const signInRes = await signIn('credentials', {
        email: 'admin.hr@dayflow.com',
        password: 'Admin123!',
        redirect: false,
      });

      if (!signInRes?.error) {
        window.location.href = '/hr/dashboard';
      } else {
        fillCredential('admin.hr@dayflow.com', 'Admin123!');
      }
    } catch (err) {
      toast.error('Failed to run bootstrap setup');
    } finally {
      setIsBootstrapping(false);
    }
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0524]">
        <Loader2 className="h-9 w-9 animate-spin text-[#2bf0ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-[160vh] text-slate-100 flex flex-col items-center justify-start pt-10 md:pt-14 p-4 md:p-8 font-sans relative overflow-x-hidden select-none">
      {/* 3D Warp Tunnel Background Canvas */}
      <ThreeTunnelBackground />

      {/* Top Header Floating Utility Bar */}
      <div className="fixed top-5 right-5 sm:right-8 flex items-center gap-3 z-40">
        <a
          href="/tunnel.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2bf0ff]/40 bg-[#0a0524]/80 text-[#8fe6ff] text-xs font-semibold backdrop-blur-md hover:bg-[#0a0524] hover:border-[#2bf0ff] transition-all duration-300 shadow-lg shadow-[#2bf0ff]/10 hover:shadow-[#2bf0ff]/25 hover:scale-105"
        >
          <Compass className="h-3.5 w-3.5 text-[#2bf0ff] animate-spin" style={{ animationDuration: '12s' }} />
          <span>Fullscreen 3D Tunnel</span>
        </a>
        <div className="p-1 rounded-full border border-indigo-900/50 bg-[#0a0524]/80 backdrop-blur-md">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-6 md:space-y-8 py-4 z-10">
        
        {/* Top Hero Brand Header - High Contrast & Crystal Clear Visibility */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/50 bg-[#070318]/95 backdrop-blur-xl shadow-lg shadow-cyan-950/40">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
            <span className="font-extrabold text-xs tracking-wider text-cyan-300 uppercase">
              Dayflow HRMS • Enterprise Edition
            </span>
          </div>

          {/* Crisp Glassmorphic Hero Title Plate */}
          <div className="bg-[#070318]/90 border border-white/15 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-2xl space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Smart Workforce <span className="text-cyan-300 font-black">Management System</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-md mx-auto leading-relaxed">
              Automated payroll calculation, employee administration, and secure role-based portals.
            </p>
          </div>
        </div>

        {/* Animated Main Auth Card */}
        <div className="w-full max-w-[460px] animate-pulse-glow rounded-3xl p-[1.5px] bg-gradient-to-b from-[#2bf0ff]/40 via-[#7a3cff]/30 to-indigo-900/20 transition-all duration-300">
          <div className="bg-[#0e0828]/90 border border-white/10 rounded-[23px] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Ambient Background Corner Glows */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#2bf0ff]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#7a3cff]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Interactive Animated Sliding Tab Switcher */}
            <div className="relative flex p-1 bg-[#070318]/80 border border-indigo-900/60 rounded-xl">
              {/* Sliding Pill Indicator */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-gradient-to-r from-[#7a3cff] to-[#2bf0ff] transition-all duration-300 ease-out shadow-md shadow-[#7a3cff]/30 ${
                  activeTab === 'signin' ? 'left-1' : 'left-[calc(50%+2px)]'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setLoginError(null);
                }}
                className={`relative z-10 flex-1 py-2.5 text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'signin' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setSignupError(null);
                }}
                className={`relative z-10 flex-1 py-2.5 text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'signup' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="h-3.5 w-3.5" /> Create Account
              </button>
            </div>

            {/* TAB 1: SIGN IN VIEW */}
            {activeTab === 'signin' ? (
              <div className="space-y-5 animate-fadeIn">
                
                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Login ID / Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Login ID or Work Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#2bf0ff] transition-colors" />
                      <input
                        type="text"
                        required
                        value={loginIdOrEmail}
                        onChange={(e) => {
                          setLoginIdOrEmail(e.target.value);
                          setLoginError(null);
                        }}
                        placeholder="admin.hr@dayflow.com or EMP2026001"
                        className="w-full h-11 pl-10 pr-4 bg-[#070318]/80 border border-indigo-900/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2bf0ff] focus:ring-2 focus:ring-[#2bf0ff]/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Password
                      </label>
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info('Please contact your HR administrator to reset your employee credentials.');
                        }}
                        className="text-[11px] font-medium text-[#2bf0ff] hover:text-[#8fe6ff] hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#2bf0ff] transition-colors" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          setLoginError(null);
                        }}
                        placeholder="••••••••••••"
                        className="w-full h-11 pl-10 pr-11 bg-[#070318]/80 border border-indigo-900/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2bf0ff] focus:ring-2 focus:ring-[#2bf0ff]/20 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Animated Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoginLoading}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7a3cff] via-[#4f27c4] to-[#2bf0ff] bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-bold text-sm shadow-lg shadow-[#7a3cff]/25 hover:shadow-[#2bf0ff]/30 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isLoginLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In to Portal <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Demo Credentials Box */}
                <div className="bg-[#070318]/70 border border-indigo-900/40 rounded-xl p-3.5 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Zap className="h-3.5 w-3.5 text-[#2bf0ff]" /> Quick Demo Access
                    </span>
                    <span className="text-[10px] text-[#2bf0ff] font-mono">1-Click Fill</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fillCredential('admin.hr@dayflow.com', 'Admin123!')}
                      className="p-2.5 bg-[#180a3a]/70 hover:bg-[#251059] border border-indigo-900/50 hover:border-[#7a3cff]/60 rounded-lg text-left transition-all duration-200 group relative overflow-hidden"
                    >
                      <div className="font-semibold text-xs text-[#8fe6ff] group-hover:text-white flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#2bf0ff]" /> HR Admin
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">admin.hr@dayflow.com</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillCredential('alex.rivera@dayflow.com', 'Employee123!')}
                      className="p-2.5 bg-[#180a3a]/70 hover:bg-[#251059] border border-indigo-900/50 hover:border-[#2bf0ff]/60 rounded-lg text-left transition-all duration-200 group relative overflow-hidden"
                    >
                      <div className="font-semibold text-xs text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-400" /> Employee
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">alex.rivera@dayflow.com</div>
                    </button>
                  </div>
                </div>

                {/* 1-Click Bootstrap Setup */}
                <button
                  type="button"
                  onClick={handleBootstrapHR}
                  disabled={isBootstrapping}
                  className="w-full py-2.5 px-3 border border-[#2bf0ff]/30 bg-[#2bf0ff]/5 hover:bg-[#2bf0ff]/15 text-[#8fe6ff] hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {isBootstrapping ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Provisioning & Auto-logging in...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-[#2bf0ff]" /> First-time Setup (Initialize & Auto-login HR Admin)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* TAB 2: SIGN UP VIEW */
              <div className="space-y-4 animate-fadeIn">
                
                {signupError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                    {signupError}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#2bf0ff] transition-colors" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setSignupError(null);
                        }}
                        placeholder="Alex Rivera"
                        className="w-full h-10 pl-10 pr-4 bg-[#070318]/80 border border-indigo-900/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2bf0ff] focus:ring-2 focus:ring-[#2bf0ff]/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Work Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#2bf0ff] transition-colors" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => {
                          setSignupEmail(e.target.value);
                          setSignupError(null);
                        }}
                        placeholder="alex@company.com"
                        className="w-full h-10 pl-10 pr-4 bg-[#070318]/80 border border-indigo-900/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2bf0ff] focus:ring-2 focus:ring-[#2bf0ff]/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Role Selector Tabs */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Account Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole('HR')}
                        className={`h-9 rounded-lg border text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                          signupRole === 'HR'
                            ? 'border-[#7a3cff] bg-[#7a3cff]/20 text-[#8fe6ff] shadow-sm shadow-[#7a3cff]/30'
                            : 'border-indigo-900/40 bg-[#070318]/80 text-slate-400 hover:bg-[#180a3a]'
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-[#2bf0ff]" /> HR Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole('EMPLOYEE')}
                        className={`h-9 rounded-lg border text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                          signupRole === 'EMPLOYEE'
                            ? 'border-[#2bf0ff] bg-[#2bf0ff]/20 text-[#8fe6ff] shadow-sm shadow-[#2bf0ff]/30'
                            : 'border-indigo-900/40 bg-[#070318]/80 text-slate-400 hover:bg-[#180a3a]'
                        }`}
                      >
                        <User className="h-3.5 w-3.5 text-emerald-400" /> Employee
                      </button>
                    </div>
                  </div>

                  {/* Password Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Password
                      </label>
                      <div className="relative group">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          value={signupPassword}
                          onChange={(e) => {
                            setSignupPassword(e.target.value);
                            setSignupError(null);
                          }}
                          placeholder="••••••••••••"
                          className="w-full h-10 px-3.5 bg-[#070318]/80 border border-indigo-900/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2bf0ff] focus:ring-1 focus:ring-[#2bf0ff] transition pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showSignupPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Confirm
                      </label>
                      <div className="relative group">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setSignupError(null);
                          }}
                          placeholder="••••••••••••"
                          className="w-full h-10 px-3.5 bg-[#070318]/80 border border-indigo-900/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2bf0ff] focus:ring-1 focus:ring-[#2bf0ff] transition pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {signupPassword && (
                    <div className="p-2.5 rounded-lg bg-[#070318]/60 border border-indigo-900/40 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Password Strength:</span>
                        <span className={`font-semibold ${
                          passwordCriteria.score === 3 ? 'text-emerald-400' : passwordCriteria.score === 2 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {passwordCriteria.score === 3 ? 'Strong' : passwordCriteria.score === 2 ? 'Medium' : 'Weak'}
                        </span>
                      </div>
                      <div className="flex gap-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${
                          passwordCriteria.score >= 1 ? (passwordCriteria.score === 3 ? 'bg-emerald-400 w-1/3' : 'bg-amber-400 w-1/3') : 'w-0'
                        }`} />
                        <div className={`h-full transition-all duration-300 ${
                          passwordCriteria.score >= 2 ? (passwordCriteria.score === 3 ? 'bg-emerald-400 w-1/3' : 'bg-amber-400 w-1/3') : 'w-0'
                        }`} />
                        <div className={`h-full transition-all duration-300 ${
                          passwordCriteria.score === 3 ? 'bg-emerald-400 w-1/3' : 'w-0'
                        }`} />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSignupLoading}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7a3cff] via-[#4f27c4] to-[#2bf0ff] bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-bold text-sm shadow-lg shadow-[#7a3cff]/25 hover:shadow-[#2bf0ff]/30 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-[0.98] mt-2"
                  >
                    {isSignupLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Provisioning Account...
                      </>
                    ) : (
                      <>
                        Create Account & Enter Portal <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Enterprise Security Footer */}
            <div className="pt-2 border-t border-indigo-900/40 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Shield className="h-3.5 w-3.5 text-[#2bf0ff]" />
              <span>SOC2 & RBAC Protected Enterprise Infrastructure</span>
            </div>
          </div>
        </div>

        {/* Scroll down hint to demonstrate wormhole warp-flight */}
        <div className="pt-8 text-center text-xs text-slate-400/80 flex flex-col items-center gap-1.5 animate-bounce">
          <span>Scroll down to warp-fly through the 3D tunnel</span>
          <ChevronDown className="h-4 w-4 text-[#2bf0ff]" />
        </div>
      </div>
    </div>
  );
}
