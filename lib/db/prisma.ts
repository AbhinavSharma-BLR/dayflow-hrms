import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL && typeof window === 'undefined') {
  console.warn(
    '\n⚠️  [Dayflow HRMS Warning] DATABASE_URL is not defined in your environment variables!\n' +
    '👉 Please create a .env or .env.local file in the project root with your PostgreSQL connection string.\n' +
    '👉 Refer to .env.example for the required configuration.\n'
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
