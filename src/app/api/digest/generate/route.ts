import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyDigest } from '@/services/digestEngine';
import { listAllDigests, getLatestDigest } from '@/services/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet') || undefined;
  const latest = getLatestDigest(wallet);
  return NextResponse.json({
    success: true,
    latest,
    allCount: listAllDigests().length
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const walletAddress = body.walletAddress || undefined;
    const force = Boolean(body.force);
    const lookbackDays = body.lookbackDays ? Number(body.lookbackDays) : 7;

    const result = await generateWeeklyDigest({
      walletAddress,
      trigger: 'MANUAL',
      force,
      lookbackDays
    });

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
