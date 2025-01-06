import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

// Use a single instance of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (dev) {
  global.prisma = prisma;
}