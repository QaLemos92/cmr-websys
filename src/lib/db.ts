// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // allow global across hot reloads in dev
  var __prisma: PrismaClient | undefined; // eslint-disable-line no-var
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;
