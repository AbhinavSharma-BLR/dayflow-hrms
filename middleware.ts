import { getToken, decode } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'dayflow_hrms_development_secret_key_32bytes_minimum_length';

async function resolveUserToken(req: NextRequest) {
  // 1. Check standard getToken with secureCookie = true & false
  try {
    const token = await getToken({ req, secret: AUTH_SECRET, secureCookie: true });
    if (token) return token;
  } catch {}

  try {
    const token = await getToken({ req, secret: AUTH_SECRET, secureCookie: false });
    if (token) return token;
  } catch {}

  // 2. Direct cookie search and decoding across all known Auth.js / NextAuth cookie variations
  const cookiesToCheck = [
    { name: '__Secure-authjs.session-token', salt: '__Secure-authjs.session-token' },
    { name: 'authjs.session-token', salt: 'authjs.session-token' },
    { name: '__Secure-next-auth.session-token', salt: '__Secure-next-auth.session-token' },
    { name: 'next-auth.session-token', salt: 'next-auth.session-token' },
  ];

  for (const c of cookiesToCheck) {
    const rawVal = req.cookies.get(c.name)?.value;
    if (rawVal) {
      try {
        const decoded = await decode({ token: rawVal, secret: AUTH_SECRET, salt: c.salt });
        if (decoded) return decoded;
      } catch {}
      try {
        const decoded = await decode({ token: rawVal, secret: AUTH_SECRET, salt: '' });
        if (decoded) return decoded;
      } catch {}
    }
  }

  return null;
}

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    const user: any = await resolveUserToken(req);

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
        const hasCookie =
          req.cookies.get('__Secure-authjs.session-token') ||
          req.cookies.get('authjs.session-token') ||
          req.cookies.get('__Secure-next-auth.session-token') ||
          req.cookies.get('next-auth.session-token');
        if (!hasCookie) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
      if (user && user.role === 'HR') {
        return NextResponse.redirect(new URL('/hr/dashboard', req.url));
      }
    }

    // 7. Protect HR routes (HR role strictly required)
    if (isHRRoute) {
      if (!user) {
        const hasCookie =
          req.cookies.get('__Secure-authjs.session-token') ||
          req.cookies.get('authjs.session-token') ||
          req.cookies.get('__Secure-next-auth.session-token') ||
          req.cookies.get('next-auth.session-token');
        if (!hasCookie) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
      if (user && user.role !== 'HR') {
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
