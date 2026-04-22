import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.DATABASE_URL) {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // Mock client or just a placeholder - the routes check for DATABASE_URL before using prisma
  prisma = new PrismaClient();
}

export default prisma;
