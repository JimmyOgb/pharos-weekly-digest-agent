import { generateWeeklyDigest, DEFAULT_MONITORED_WALLET } from '../src/services/digestEngine';

async function main() {
  const args = process.argv.slice(2);
  const walletArg = args.find(a => a.startsWith('--wallet='))?.split('=')[1] || process.env.WALLET_ADDRESS || DEFAULT_MONITORED_WALLET;
  const forceArg = args.includes('--force') || process.env.FORCE_RUN === 'true';
  const triggerArg = (args.find(a => a.startsWith('--trigger='))?.split('=')[1] || process.env.RUN_TRIGGER || 'SCHEDULED') as any;

  console.log(`=======================================================`);
  console.log(` PHAROS WEEKLY DIGEST AGENT — AUTONOMOUS RUNNER`);
  console.log(`=======================================================`);
  console.log(`Target Wallet:  ${walletArg}`);
  console.log(`Trigger:        ${triggerArg}`);
  console.log(`Force Run:      ${forceArg}`);
  console.log(`Network:        Pharos Atlantic Testnet (Chain ID 688689)`);
  console.log(`-------------------------------------------------------`);

  try {
    const result = await generateWeeklyDigest({
      walletAddress: walletArg,
      trigger: triggerArg,
      force: forceArg,
      lookbackDays: 7
    });

    console.log(`Execution Success: ${result.success}`);
    console.log(`Run Status:        ${result.runRecord.status}`);
    console.log(`Duration:          ${result.runRecord.durationMs}ms`);
    console.log(`Message:           ${result.runRecord.message}`);

    if (result.digest) {
      console.log(`\n--- DIGEST METRICS SUMMARY ---`);
      console.log(`Digest ID:         ${result.digest.id}`);
      console.log(`Reporting Period:  ${result.digest.reportingPeriod.start} to ${result.digest.reportingPeriod.end}`);
      console.log(`Current Txs:       ${result.digest.currentMetrics.txCount} (${result.digest.currentMetrics.successCount} succ / ${result.digest.currentMetrics.failedCount} fail)`);
      console.log(`Native Inflow:     +${result.digest.currentMetrics.nativeInflowPros} PROS`);
      console.log(`Native Outflow:    -${result.digest.currentMetrics.nativeOutflowPros} PROS`);
      console.log(`Net Shift:         ${result.digest.currentMetrics.netNativeChangePros} PROS`);
      console.log(`Gas Cost:          ${result.digest.currentMetrics.gasCostPros} PROS`);
      console.log(`Top Events:        ${result.digest.notableEvents.length} ranked`);
      result.digest.notableEvents.forEach((evt, idx) => {
        console.log(`  #${idx + 1} [${evt.eventType}] ${evt.txHash} (Block ${evt.blockNumber}) -> ${evt.reason}`);
      });
      console.log(`\nPermalink:         /digest/${result.digest.id}`);
    }

    if (!result.success) {
      console.error(`Run failed: ${result.error}`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error(`Fatal execution error: ${err.message}`);
    process.exit(1);
  }
}

main();
