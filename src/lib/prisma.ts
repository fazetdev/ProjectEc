// We're using Neon serverless driver instead of Prisma
// This file is kept for compatibility but exports a Neon SQL instance

import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);
