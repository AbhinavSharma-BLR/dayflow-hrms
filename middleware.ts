import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const user = session?.user as any;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isEmployeeRoute = pathname.startsWith('/employee');
  const isHRRoute = pathname.startsWith('/hr');
  const isGenericDashboardRoute = pathname === '/dashboard';
  const isRootRoute = pathname === '/';
  const isChangePasswordRoute = pathname.startsWith('/change-password');

  // 1. Temporary password change rule
  if (user && user.mustChangePassword) {
    if (!isChangePasswordRoute && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/change-password', req.url));
    }
  }

  // 2. Prevent users who don't need password change from accessing /change-password
  if (user && !user.mustChangePassword && isChangePasswordRoute) {
    if (user.role === 'HR') {
      return NextResponse.redirect(new URL('/hr/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/employee/dashboard', req.url));
  }

  // 3. Legacy auth pages (/login, /signup) -> redirect to main landing page (/) or dashboard
  if (isAuthPage) {
    if (user) {
      if (user.mustChangePassword) {
        return NextResponse.redirect(new URL('/change-password', req.url));
      }
      if (user.role === 'HR') {
        return NextResponse.redirect(new URL('/hr/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/employee/dashboard', req.url));
    }
    if (pathname.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/?tab=signup', req.url));
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 4. Generic /dashboard route handling
  if (isGenericDashboardRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (user.role === 'HR') {
      return NextResponse.redirect(new URL('/hr/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/employee/dashboard', req.url));
  }

  // 5. Root route handling: if authenticated, redirect to appropriate dashboard
  if (isRootRoute) {
    if (user) {
      if (user.mustChangePassword) {
        return NextResponse.redirect(new URL('/change-password', req.url));
      }
      if (user.role === 'HR') {
        return NextResponse.redirect(new URL('/hr/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/employee/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 6. Protect Employee routes
  if (isEmployeeRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (user.role === 'HR') {
      return NextResponse.redirect(new URL('/hr/dashboard', req.url));
    }
  }

  // 7. Protect HR routes (HR role strictly required)
  if (isHRRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (user.role !== 'HR') {
      return NextResponse.redirect(new URL('/employee/dashboard', req.url));
    }
  }

  // Forward user headers to downstream routes
  const requestHeaders = new Headers(req.headers);
  if (user) {
    requestHeaders.set('x-user-id', user.id || '');
    requestHeaders.set('x-user-email', user.email || '');
    requestHeaders.set('x-user-role', user.role || '');
    if (user.employeeId) {
      requestHeaders.set('x-user-employee-id', user.employeeId);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: ['/', '/dashboard', '/employee/:path*', '/hr/:path*', '/login', '/signup', '/change-password', '/api/employees/:path*'],
};
