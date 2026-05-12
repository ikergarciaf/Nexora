import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  if (url.includes('pgbouncer=true')) return url;
  if (url.includes(':6543')) {
    const separator = url.includes('?') ? '&' : '?';
    process.env.DATABASE_URL = `${url}${separator}pgbouncer=true`;
  }
  return process.env.DATABASE_URL;
}

getDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [{ level: 'query', emit: 'event' }, { level: 'error', emit: 'stdout' }, { level: 'warn', emit: 'stdout' }]
    : [{ level: 'error', emit: 'stdout' }],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
