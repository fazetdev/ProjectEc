import { NextResponse } from 'next/server';

export async function GET() {
  // Return environment info (safe - no passwords)
  return NextResponse.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    hasMongoDbUri: !!process.env.MONGODB_URI,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
  });
}
