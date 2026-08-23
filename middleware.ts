import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'dayflow_hrms_development_secret_key_32bytes_minimum_length';

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // Retrieve JWT session token safely (dual check for Vercel HTTPS __Secure- prefix vs localhost)
    let token: any = null;
    try {
      token = await getToken({
        req,
        secret: AUTH_SECRET,
        secureCookie: true,
      });
      if (!token) {
        token = await getToken({
          req,
          secret: AUTH_SECRET,
          secureCookie: false,
        });
      }
    } catch {
      token = null;
    }

    const user = token;

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
  } catch (error) {
    console.error('Middleware execution error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/employee/:path*',
    '/hr/:path*',
    '/login',
    '/signup',
    '/change-password',
    '/api/employees/:path*',
  ],
};
