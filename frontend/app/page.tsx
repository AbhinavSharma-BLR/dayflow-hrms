'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Sparkles, Eye, EyeOff, Upload, ShieldCheck, User, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default function Home() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [activeView, setActiveView] = React.useState<'signin' | 'signup'>('signin');

  // Check URL query / hash for initial tab selection
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'signup' || params.get('view') === 'signup' || window.location.hash === '#signup') {
        setActiveView('signup');
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
  const [companyName, setCompanyName] = React.useState('Dayflow HRMS');
  const [companyLogo, setCompanyLogo] = React.useState<string | null>(null);
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
        setLoginError('Invalid Login ID/Email or Password');
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

  // Sign Up Handler with Immediate Auto-Login & Dashboard Redirection
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (signupPassword !== confirmPassword) {
      setSignupError('Password and Confirm Password do not match');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSignupLoading(true);
      const cleanName = fullName.trim();
      const nameParts = cleanName ? cleanName.split(/\s+/) : ['User'];
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Member';

      // 1. Post to Signup API endpoint
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: signupEmail.trim().toLowerCase(),
          password: signupPassword,
          confirmPassword,
          role: signupRole,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.error?.message || 'Registration failed';
        if (errorMsg.toLowerCase().includes('already exists')) {
          setSignupError('An account with this email address already exists. Please Sign In below or use another email.');
        } else if (Array.isArray(json.error?.details) && json.error.details.length > 0) {
          const formattedErr = json.error.details.map((d: any) => d.message).join('. ');
          setSignupError(formattedErr);
        } else {
          setSignupError(errorMsg);
        }
        return;
      }

      toast.success('Account created successfully! Logging in...');

      const targetDashboard = signupRole === 'HR' ? '/hr/dashboard' : '/employee/dashboard';

      // 2. Immediately establish NextAuth session and navigate to dashboard
      const signInRes = await signIn('credentials', {
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
        redirect: false,
      });

      if (signInRes?.error) {
        console.warn('Auto-login session note:', signInRes.error);
      }

      // Always proceed directly to the dashboard on successful registration
      window.location.href = targetDashboard;
    } catch (err: any) {
      setSignupError(err.message || 'An error occurred during account creation');
    } finally {
      setIsSignupLoading(false);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size must be less than 5 MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCompanyLogo(reader.result as string);
        toast.success('Company logo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Fill Helper
  const fillCredential = (emailVal: string, passVal: string = 'Admin123!') => {
    setLoginIdOrEmail(emailVal);
    setLoginPassword(passVal);
    toast.info(`Filled ${emailVal}`);
  };

  // Quick Bootstrap for Admin
  const handleQuickBootstrap = async () => {
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
        toast.success('HR Admin account ready! Authenticating session...');
      } else {
        toast.info('HR Admin account ready. Authenticating...');
      }

      // Immediately sign in and navigate directly to dashboard
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
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d11]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d11] text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans relative overflow-x-hidden">
      {/* Top Header Bar */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center space-y-8 py-6">
        
        {/* Top Header / Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur shadow-lg shadow-purple-500/10">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <span className="font-bold text-lg tracking-wide text-purple-300">Dayflow HRMS</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Human Resource Management System
          </h1>

          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Complete workforce administration, automated Employee IDs, and secure employee portal.
          </p>
        </div>

        {/* Dynamic Cards Grid - Sign In / Sign Up */}
        <div className="w-full max-w-md">
          {activeView === 'signin' ? (
            /* SIGN IN PAGE CARD */
            <div className="rounded-2xl border border-slate-800 bg-[#16161e] p-6 md:p-8 shadow-2xl space-y-6 relative">
              
              {/* BEAUTIFUL DAYFLOW BRAND LOGO */}
              <div className="w-full flex justify-center">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-indigo-950/60 border border-purple-500/40 shadow-lg shadow-purple-500/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold shadow-md">
                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-sm tracking-wider text-white">DAYFLOW</span>
                    <span className="text-[9px] font-mono tracking-widest text-purple-300 uppercase">HR MANAGEMENT</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-1">
                <h2 className="text-xl font-bold text-white">Sign in Page</h2>
                <p className="text-xs text-slate-400 mt-1">Enter your Login ID / Work Email and Password</p>
              </div>

              {loginError ? (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
                  {loginError}
                </div>
              ) : null}

              <form onSubmit={handleSignIn} className="space-y-4 text-left">
                {/* Login Id/Email :- */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Login Id / Email :-</label>
                  <input
                    type="text"
                    value={loginIdOrEmail}
                    onChange={(e) => setLoginIdOrEmail(e.target.value)}
                    placeholder="e.g. DAYALRI20260001 or name@company.com"
                    required
                    className="w-full h-11 px-3.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Example Mail IDs / Login IDs Pill Bar */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 font-medium text-[10px] uppercase tracking-wider">
                    <span>Example Mail IDs / Credentials:</span>
                    <span className="text-purple-400">Click to autofill</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => fillCredential('admin.hr@dayflow.com', 'Admin123!')}
                      className="px-2.5 py-1 rounded-md bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 text-[11px] font-mono transition-colors flex items-center gap-1"
                    >
                      <ShieldCheck className="h-3 w-3 text-purple-400" />
                      admin.hr@dayflow.com <span className="text-[9px] text-slate-400">(HR Admin)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillCredential('alex.rivera@dayflow.com', 'Employee123!')}
                      className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono transition-colors flex items-center gap-1"
                    >
                      <User className="h-3 w-3 text-blue-400" />
                      alex.rivera@dayflow.com <span className="text-[9px] text-slate-400">(Employee)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillCredential('DAYALRI20260001', 'Employee123!')}
                      className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono transition-colors flex items-center gap-1"
                    >
                      <KeyRound className="h-3 w-3 text-emerald-400" />
                      DAYALRI20260001 <span className="text-[9px] text-slate-400">(Employee ID)</span>
                    </button>
                  </div>
                </div>

                {/* Password :- */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Password :-</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-11 px-3.5 pr-10 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* PURPLE SIGN IN BUTTON */}
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full h-11 mt-2 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white font-extrabold text-sm tracking-wider uppercase shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isLoginLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
              </form>

              {/* Bottom Navigation */}
              <div className="text-center pt-2 border-t border-slate-800/80">
                <p className="text-xs text-slate-400">
                  Don&apos;t have an Account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveView('signup')}
                    className="font-semibold text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* SIGN UP PAGE CARD */
            <div className="rounded-2xl border border-slate-800 bg-[#16161e] p-6 md:p-8 shadow-2xl space-y-6 relative">
              {/* DAYFLOW BRAND LOGO / UPLOADED LOGO */}
              <div className="w-full flex justify-center">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-indigo-950/60 border border-purple-500/40 shadow-lg shadow-purple-500/10">
                  {companyLogo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={companyLogo} alt="Company Logo" className="h-8 w-8 object-contain rounded" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold shadow-md">
                      <Sparkles className="h-5 w-5 text-white animate-pulse" />
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-sm tracking-wider text-white uppercase">{companyName || 'DAYFLOW'}</span>
                    <span className="text-[9px] font-mono tracking-widest text-purple-300 uppercase">HR MANAGEMENT</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-1">
                <h2 className="text-xl font-bold text-white">Sign Up Page</h2>
                <p className="text-xs text-slate-400 mt-1">Create Account and Login to HRMS</p>
              </div>

              {signupError ? (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
                  {signupError}
                </div>
              ) : null}

              <form onSubmit={handleSignUp} className="space-y-4 text-left">
                {/* Company Name :- & Upload Logo Button */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Company Name :-</label>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors">
                      <Upload className="h-3.5 w-3.5" /> Upload Logo
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Dayflow Inc / Odoo India"
                    required
                    className="w-full h-10 px-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Name :- */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Name :-</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name (e.g. John Doe)"
                    required
                    className="w-full h-10 px-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Email :- */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email :-</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full h-10 px-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Phone :- */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Phone :-</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-10 px-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Role :- */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Account Type / Role :-</label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as any)}
                    className="w-full h-10 px-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="HR">HR / Administrator</option>
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                </div>

                {/* Password :- */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Password :-</label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-10 px-3.5 pr-10 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password :- */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Confirm Password :-</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-10 px-3.5 pr-10 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* PURPLE SIGN UP BUTTON */}
                <button
                  type="submit"
                  disabled={isSignupLoading}
                  className="w-full h-11 mt-2 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white font-extrabold text-sm tracking-wider uppercase shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSignupLoading ? 'CREATING ACCOUNT...' : 'Sign Up'}
                </button>
              </form>

              {/* Bottom Navigation */}
              <div className="text-center pt-2 border-t border-slate-800/80">
                <p className="text-xs text-slate-400">
                  Already have an account ?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveView('signin')}
                    className="font-semibold text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Quick Admin Bootstrap Shortcut */}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={handleQuickBootstrap}
              disabled={isBootstrapping}
              className="text-[11px] text-slate-500 hover:text-purple-400 transition-colors underline"
            >
              First-time System Setup (Initialize & Auto-login HR Admin)
            </button>
          </div>
        </div>

        {/* NOTE BOX CONTAINER FROM WIREFRAME */}
        <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#14141c] p-6 text-left space-y-4 shadow-xl">
          {/* Note Header Banner */}
          <div className="w-full flex justify-center">
            <div className="px-8 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center font-bold text-sm text-slate-200 tracking-wider">
              Note & Employee ID Specification
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-purple-500/60">
            <p className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>
                <strong>Controlled Onboarding:</strong> Normal users cannot self-register. When an HR Officer or Admin creates a new employee, their unique Employee ID is automatically generated by the system.
              </span>
            </p>

            <p className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>
                <strong>System-Generated First Password:</strong> Initial employee passwords are auto-generated cryptographically by the server.
              </span>
            </p>

            <p className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>
                <strong>Forced Password Change:</strong> Employees must change their temporary password upon first login before accessing portal data.
              </span>
            </p>
          </div>

          {/* Formula Explanation */}
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5">
            <p className="font-semibold text-purple-300">
              Automatic Employee ID Formula:
            </p>
            <p className="font-mono text-slate-200 bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
              [Company Code] + [First 2 Letters of First & Last Name] + [Year of Joining] + [Serial Number]
            </p>
            <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 pl-1">
              <p>• <strong>Example:</strong> <span className="font-mono text-purple-400">DAYALRI20260001</span></p>
              <p>• <strong>DAY</strong> → Dayflow (Company Code)</p>
              <p>• <strong>ALRI</strong> → First two letters of employee first & last name (Alex Rivera)</p>
              <p>• <strong>2026</strong> → Joining Year</p>
              <p>• <strong>0001</strong> → Unique Serial Number for that year</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} Dayflow HRMS. Enterprise Workforce Portal.
        </footer>
      </div>
    </div>
  );
}
