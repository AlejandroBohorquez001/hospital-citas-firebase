import { NextResponse } from 'next/server';
import { getCurrentProvider } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    provider: getCurrentProvider(),
    timestamp: new Date().toISOString(),
  });
}
