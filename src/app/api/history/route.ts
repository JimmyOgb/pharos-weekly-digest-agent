import { NextResponse } from 'next/server';
import { listAllDigests, listRunRecords } from '@/services/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const digests = listAllDigests();
  const runs = listRunRecords();
  return NextResponse.json({
    success: true,
    totalDigests: digests.length,
    totalRuns: runs.length,
    digests,
    runs
  });
}
