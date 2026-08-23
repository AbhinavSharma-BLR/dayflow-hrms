import { PrismaClient } from '@prisma/client';

const DEMO_DATABASE_URL =
  'postgresql://neondb_owner:npg_KpuaCXfL0cO5@ep-quiet-grass-a8z1bhyy.eastus2.azure.neon.tech/neondb?sslmode=require';

// Safe demo fallbacks for seamless 1-click evaluation without manual .env setup
let activeDatabaseUrl = process.env.DATABASE_URL;

// If Vercel has an old/paused Supabase URL, force override to the active Neon database
if (!activeDatabaseUrl || activeDatabaseUrl.includes('supabase.co')) {
  activeDatabaseUrl = DEMO_DATABASE_URL;
}

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
