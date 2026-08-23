import { PrismaClient } from '@prisma/client';

const DEMO_DATABASE_URL =
  'postgresql://neondb_owner:npg_KpuaCU0xW4nj@ep-jolly-violet-ayvv6x6l.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Safe demo fallbacks for seamless 1-click evaluation without manual .env setup
// Unconditionally force the working Neon DB to bypass ANY broken Vercel environment variables
const activeDatabaseUrl = DEMO_DATABASE_URL;

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = 'dayflow_hrms_development_secret_key_32bytes_minimum_length';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'dayflow_hrms_development_secret_key_32bytes_minimum_length';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: activeDatabaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
