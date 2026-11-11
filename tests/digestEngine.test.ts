import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Load compiled or tsx modules via subshell or native functions
import { computePeriodMetrics } from '../src/services/metricsEngine.ts';
import { comparePeriodMetrics } from '../src/services/comparator.ts';
import { rankNotableEvents } from '../src/services/eventRanker.ts';
import {
  saveDigest,
  getDigestById,
  listAllDigests,
  isDuplicateRun,
  saveRunRecord,
  listRunRecords
} from '../src/services/storage.ts';
import {
  filterTxsInPeriod,
  PHAROS_CHAIN_ID,
  PHAROS_NETWORK_NAME
} from '../src/services/pharosFetcher.ts';
import { generateWeeklyDigest } from '../src/services/digestEngine.ts';

test('1. Genuine Network Configuration', () => {
  assert.equal(PHAROS_CHAIN_ID, 688689);
  assert.equal(PHAROS_NETWORK_NAME, 'Pharos Atlantic Testnet');
});

test('2. Correct Period Boundaries Filtering', () => {
  const start = '2026-11-01T00:00:00.000Z';
  const end = '2026-11-08T00:00:00.000Z';

  const txs = [
    { hash: '0x1', block_timestamp: '2026-10-31T23:59:59.000Z' },
    { hash: '0x2', block_timestamp: '2026-11-01T00:00:00.000Z' },
    { hash: '0x3', block_timestamp: '2026-11-05T12:00:00.000Z' },
    { hash: '0x4', block_timestamp: '2026-11-08T00:00:00.000Z' }, // exclusive upper bound
    { hash: '0x5', block_timestamp: '2026-11-09T00:00:00.000Z' }
  ];

  const filtered = filterTxsInPeriod(txs, start, end);
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].hash, '0x2');
  assert.equal(filtered[1].hash, '0x3');
});

test('3. Current-versus-Previous Comparison & Delta Math', () => {
  const current = computePeriodMetrics(
    [
      {
        hash: '0x10',
        from_address: '0xabc',
        to_address: '0xtarget',
        value: '10000000000000000000', // 10 PROS
        block_number: 100,
        block_timestamp: '2026-11-05T00:00:00.000Z',
        receipt_status: 1
      }
    ],
    '0xtarget',
    '2026-11-01T00:00:00.000Z',
    '2026-11-08T00:00:00.000Z',
    7
  );

  const previous = computePeriodMetrics(
    [
      {
        hash: '0x09',
        from_address: '0xabc',
        to_address: '0xtarget',
        value: '5000000000000000000', // 5 PROS
        block_number: 90,
        block_timestamp: '2026-10-25T00:00:00.000Z',
        receipt_status: 1
      }
    ],
    '0xtarget',
    '2026-10-24T00:00:00.000Z',
    '2026-10-31T00:00:00.000Z',
    7
  );

  const comps = comparePeriodMetrics(current, previous);
  const inflowComp = comps.find(c => c.key === 'nativeInflow');
  assert.ok(inflowComp);
  assert.equal(inflowComp.currentValue, 10);
  assert.equal(inflowComp.previousValue, 5);
  assert.equal(inflowComp.absoluteChange, '+5.0000');
  assert.equal(inflowComp.percentChange, 100);
  assert.equal(inflowComp.trend, 'UP');
});

test('4. Event Ranking with Multi-Factor Significance', () => {
  const txs = [
    {
      hash: '0xsmall',
      from_address: '0xtarget',
      to_address: '0xpeer',
      value: '100000000000000000', // 0.1 PROS
      block_number: 500,
      block_timestamp: '2026-11-05T01:00:00.000Z',
      receipt_status: 1
    },
    {
      hash: '0xfailed',
      from_address: '0xtarget',
      to_address: '0xpeer',
      value: '0',
      block_number: 501,
      block_timestamp: '2026-11-05T02:00:00.000Z',
      receipt_status: 0 // Failed
    },
    {
      hash: '0xdeploy',
      from_address: '0xtarget',
      to_address: '',
      method: 'Contract Creation',
      receipt_contract_address: '0xnewcontract',
      value: '0',
      block_number: 502,
      block_timestamp: '2026-11-05T03:00:00.000Z',
      receipt_status: 1
    }
  ];

  const result = rankNotableEvents(txs, '0xtarget');
  assert.equal(result.notableEvents.length, 3);
  // Revert has score +150, Contract deploy has +120
  assert.equal(result.notableEvents[0].txHash, '0xfailed');
  assert.equal(result.notableEvents[0].eventType, 'Failed Transaction');
  assert.equal(result.notableEvents[1].txHash, '0xdeploy');
  assert.equal(result.notableEvents[1].eventType, 'Contract Deployment');
});

test('5. Fewer Than Three Qualifying Events Handling', () => {
  const txs = [
    {
      hash: '0xonlyone',
      from_address: '0xtarget',
      to_address: '0xpeer',
      value: '1000000000000000000', // 1 PROS
      block_number: 1000,
      block_timestamp: '2026-11-05T01:00:00.000Z',
      receipt_status: 1
    }
  ];

  const result = rankNotableEvents(txs, '0xtarget');
  assert.equal(result.notableEvents.length, 1);
  assert.ok(result.explanation.includes('Only 1 transaction(s) met the criteria'));
  assert.ok(result.explanation.includes('No synthetic filler events were created'));
});

test('6. Empty Activity Periods Handling', () => {
  const emptyTxs = [];
  const metrics = computePeriodMetrics(
    emptyTxs,
    '0xtarget',
    '2026-11-01T00:00:00.000Z',
    '2026-11-08T00:00:00.000Z',
    7
  );

  assert.equal(metrics.txCount, 0);
  assert.equal(metrics.successCount, 0);
  assert.equal(metrics.failedCount, 0);
  assert.equal(metrics.nativeInflowPros, 0);
  assert.equal(metrics.nativeOutflowPros, 0);
  assert.equal(metrics.netNativeChangePros, 0);

  const result = rankNotableEvents(emptyTxs, '0xtarget');
  assert.equal(result.notableEvents.length, 0);
  assert.ok(result.explanation.includes('No notable transactions'));
});

test('7. Partial or Unavailable Source Data Distinction', () => {
  const metrics = computePeriodMetrics(
    [],
    '0xtarget',
    '2026-11-01T00:00:00.000Z',
    '2026-11-08T00:00:00.000Z',
    7,
    'PARTIAL',
    ['Indexing limits reached at page 3']
  );

  assert.equal(metrics.dataCoverage, 'PARTIAL');
  assert.equal(metrics.coverageDisclosures[0], 'Indexing limits reached at page 3');
});

test('8. Duplicate Scheduled Runs Prevention', () => {
  const periodStart = '2026-11-01T00:00:00.000Z';
  const periodEnd = '2026-11-08T00:00:00.000Z';
  const wallet = '0x1111111111111111111111111111111111111111';

  // First check
  const check1 = isDuplicateRun(wallet, periodStart, periodEnd);
  assert.equal(check1.isDuplicate, false);

  // Save dummy digest
  saveDigest({
    id: 'digest_test_dup_123',
    walletAddress: wallet,
    network: 'Pharos Atlantic Testnet',
    chainId: 688689,
    generatedAt: new Date().toISOString(),
    status: 'CURRENT',
    reportingPeriod: { start: periodStart, end: periodEnd, durationDays: 7 },
    previousPeriod: { start: '2026-10-25T00:00:00.000Z', end: periodStart, durationDays: 7 },
    currentMetrics: {} as any,
    previousMetrics: {} as any,
    comparisons: [],
    notableEvents: [],
    notableEventsExplanation: 'test',
    sourceDisclosures: {} as any,
    provenance: {} as any
  });

  // Second check
  const check2 = isDuplicateRun(wallet, periodStart, periodEnd);
  assert.equal(check2.isDuplicate, true);
  assert.equal(check2.existingDigestId, 'digest_test_dup_123');
});

test('9. Safe Retry & Run Logging', () => {
  const runRecord = {
    runId: 'run_test_retry_999',
    timestamp: new Date().toISOString(),
    trigger: 'SCHEDULED' as const,
    status: 'SUCCESS' as const,
    walletAddress: '0x299ce4113abf88f4997737184aa8a7a3d58ac15c',
    periodStart: '2026-11-04T00:00:00.000Z',
    periodEnd: '2026-11-11T00:00:00.000Z',
    durationMs: 420,
    message: 'Test run executed'
  };

  saveRunRecord(runRecord);
  const runs = listRunRecords();
  assert.ok(runs.some(r => r.runId === 'run_test_retry_999'));
});

test('10. Persistence & Retrieval of Generated Digests', () => {
  const testId = 'digest_persist_test_' + Date.now();
  saveDigest({
    id: testId,
    walletAddress: '0x9999999999999999999999999999999999999999',
    network: 'Pharos Atlantic Testnet',
    chainId: 688689,
    generatedAt: new Date().toISOString(),
    status: 'CURRENT',
    reportingPeriod: { start: '2026-11-01T00:00:00.000Z', end: '2026-11-08T00:00:00.000Z', durationDays: 7 },
    previousPeriod: { start: '2026-10-25T00:00:00.000Z', end: '2026-11-01T00:00:00.000Z', durationDays: 7 },
    currentMetrics: {} as any,
    previousMetrics: {} as any,
    comparisons: [],
    notableEvents: [],
    notableEventsExplanation: 'test',
    sourceDisclosures: {} as any,
    provenance: {} as any
  });

  const retrieved = getDigestById(testId);
  assert.ok(retrieved);
  assert.equal(retrieved.id, testId);
});

test('11. Zero Denominator Comparison Math', () => {
  const current = computePeriodMetrics([], '0xtarget', '2026-11-01', '2026-11-08', 7);
  const previous = computePeriodMetrics([], '0xtarget', '2026-10-24', '2026-10-31', 7);

  const comps = comparePeriodMetrics(current, previous);
  const txComp = comps.find(c => c.key === 'txCount');
  assert.ok(txComp);
  assert.equal(txComp.percentChange, 0);
  assert.equal(txComp.trend, 'NEUTRAL');
});

test('12. Live End-to-End Digest Engine Invocations with Real Pharos Atlantic Data', async () => {
  const result = await generateWeeklyDigest({
    walletAddress: '0x299ce4113abf88f4997737184aa8a7a3d58ac15c',
    trigger: 'MANUAL',
    force: true,
    lookbackDays: 7
  });

  assert.equal(result.success, true);
  assert.ok(result.digest);
  assert.equal(result.digest.network, 'Pharos Atlantic Testnet');
  assert.equal(result.digest.chainId, 688689);
  assert.ok(result.digest.currentMetrics.txCount > 0);
  assert.ok(result.digest.notableEvents.length <= 3);
  assert.equal(result.runRecord.status, 'SUCCESS');
});
