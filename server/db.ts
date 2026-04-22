import { PrismaClient } from '@prisma/client';

// Keep the instance global to avoid exhausting DB connections 
// in hot-reload or concurrent situations.
const prisma = new PrismaClient();

export default prisma;
