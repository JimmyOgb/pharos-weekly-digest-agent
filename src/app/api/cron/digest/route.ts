import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyDigest, DEFAULT_MONITORED_WALLET } from '@/services/digestEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Can be called by Vercel cron or external uptime/cron ping
  try {
    const result = await generateWeeklyDigest({
      walletAddress: DEFAULT_MONITORED_WALLET,
      trigger: 'CRON',
      lookbackDays: 7
    });

    return NextResponse.json({
      success: result.success,
      trigger: 'CRON',
      isDuplicate: result.isDuplicate || false,
      runRecord: result.runRecord,
      digestId: result.digest?.id
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      trigger: 'CRON',
      error: err.message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
