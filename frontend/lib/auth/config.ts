import type { NextAuthConfig } from 'next-auth';
import { Role } from '@prisma/client';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    role: Role;
    employeeId?: string;
    name?: string;
    mustChangePassword?: boolean;
  };
  expires: string;
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'dayflow_hrms_development_secret_key_32bytes_minimum_length',
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.employeeId = user.employeeId;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.employeeId = token.employeeId as string | undefined;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
  providers: [],
};

export const AUTH_OPTIONS = authConfig;
