import { NextRequest } from 'next/server';
import { Role } from '@prisma/client';
import { AppError } from '../errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  employeeId?: string;
}

export async function extractAuthUser(req?: NextRequest): Promise<AuthenticatedUser | null> {
  // 1. Extract user info from headers set by middleware or test suite
  if (req) {
    const userId = req.headers.get('x-user-id');
    const email = req.headers.get('x-user-email');
    const role = req.headers.get('x-user-role') as Role | null;
    const employeeId = req.headers.get('x-user-employee-id') || undefined;

    if (userId && role) {
      return { id: userId, email: email || '', role, employeeId };
    }

    // 2. Direct decode from request cookies using next-auth/jwt
    try {
      const { getToken, decode } = await import('next-auth/jwt');
      const AUTH_SECRET =
        process.env.AUTH_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        'dayflow_hrms_development_secret_key_32bytes_minimum_length';

      let token: any = await getToken({ req, secret: AUTH_SECRET, secureCookie: true });
      if (!token) {
        token = await getToken({ req, secret: AUTH_SECRET, secureCookie: false });
      }

      if (!token) {
        const raw =
          req.cookies.get('__Secure-authjs.session-token')?.value ||
          req.cookies.get('authjs.session-token')?.value ||
          req.cookies.get('__Secure-next-auth.session-token')?.value ||
          req.cookies.get('next-auth.session-token')?.value;
        if (raw) {
          token =
            (await decode({ token: raw, secret: AUTH_SECRET, salt: '__Secure-authjs.session-token' })) ||
            (await decode({ token: raw, secret: AUTH_SECRET, salt: 'authjs.session-token' })) ||
            (await decode({ token: raw, secret: AUTH_SECRET, salt: '' }));
        }
      }

      if (token?.id && token.role) {
        return {
          id: token.id,
          email: token.email || '',
          role: token.role as Role,
          employeeId: token.employeeId,
        };
      }
    } catch {}
  }

  // 3. Fallback to server-side session from auth() if available
  try {
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    if (session?.user?.id && (session.user as any).role) {
      return {
        id: session.user.id,
        email: session.user.email || '',
        role: (session.user as any).role as Role,
        employeeId: (session.user as any).employeeId,
      };
    }
  } catch (err) {
    // session lookup fallback ignored
  }

  return null;
}

export async function requireAuth(req?: NextRequest, allowedRoles?: Role[]): Promise<AuthenticatedUser> {
  const user = await extractAuthUser(req);
  
  if (!user) {
    throw AppError.unauthorized('Authentication required');
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw AppError.forbidden('You do not have permission to perform this action');
  }

  return user;
}
