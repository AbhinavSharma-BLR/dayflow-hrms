import type { NextAuthConfig } from 'next-auth';

export type Role = 'HR' | 'EMPLOYEE';

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
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.employeeId = user.employeeId;
        token.mustChangePassword = user.mustChangePassword;
      }
      if (trigger === 'update' && session) {
        if (session.user) {
          if (session.user.mustChangePassword !== undefined) {
            token.mustChangePassword = session.user.mustChangePassword;
          }
          if (session.user.role) {
            token.role = session.user.role;
          }
          if (session.user.employeeId) {
            token.employeeId = session.user.employeeId;
          }
          if (session.user.name) {
            token.name = session.user.name;
          }
        } else if (session.mustChangePassword !== undefined) {
          token.mustChangePassword = session.mustChangePassword;
        }
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
