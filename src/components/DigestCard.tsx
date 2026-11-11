import React from 'react';
import Link from 'next/link';
import { DigestReport } from '../types';

export function DigestCard({ digest, isDetailed = false }: { digest: DigestReport; isDetailed?: boolean }) {
  const {
    id,
    walletAddress,
    network,
    chainId,
    generatedAt,
    status,
    reportingPeriod,
    previousPeriod,
    currentMetrics,
    comparisons,
    notableEvents,
    notableEventsExplanation,
    sourceDisclosures,
    provenance
  } = digest;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return iso;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'CURRENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">CURRENT & VERIFIED</span>;
      case 'EMPTY':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-400 border border-blue-800">EMPTY ACTIVITY PERIOD</span>;
      case 'PARTIAL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">PARTIAL COVERAGE</span>;
      case 'FAILED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-800">FAILED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300">UNKNOWN</span>;
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
      {/* 1. Header Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Weekly Activity Digest
            </h2>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Target Account:{' '}
            <a
              href={`https://atlantic.pharosscan.xyz/address/${walletAddress}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-emerald-400 hover:underline"
            >
              {walletAddress}
            </a>
          </p>
        </div>

        <div className="text-left md:text-right space-y-1 text-xs text-gray-400">
          <p>
            <span className="text-gray-500">Network:</span>{' '}
            <span className="text-gray-200 font-medium">{network} (ID: {chainId})</span>
          </p>
          <p>
            <span className="text-gray-500">Generated:</span>{' '}
            <span className="text-gray-200">{formatDate(generatedAt)}</span>
          </p>
          <p>
            <span className="text-gray-500">Digest ID:</span>{' '}
            <Link href={`/digest/${id}`} className="font-mono text-emerald-400/90 hover:underline">
              {id}
            </Link>
          </p>
        </div>
      </div>

      {/* Reporting Period Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800/80 text-sm">
        <div>
          <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">
            Current Reporting Window ({reportingPeriod.durationDays} Days)
          </span>
          <p className="text-gray-200 font-medium mt-0.5">
            {formatDate(reportingPeriod.start)} <span className="text-gray-500">→</span> {formatDate(reportingPeriod.end)}
          </p>
        </div>
        <div>
          <span className="text-xs uppercase font-semibold text-gray-400 tracking-wider">
            Prior Comparison Window ({previousPeriod.durationDays} Days)
          </span>
          <p className="text-gray-300 font-medium mt-0.5">
            {formatDate(previousPeriod.start)} <span className="text-gray-500">→</span> {formatDate(previousPeriod.end)}
          </p>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>Current Period Activity Overview</span>
          <span className="text-xs font-normal px-2 py-0.5 rounded bg-gray-800 text-gray-400">
            {currentMetrics.txCount} total transactions
          </span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-900/90 p-4 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400">Transactions</span>
            <div className="text-2xl font-bold text-white mt-1">
              {currentMetrics.txCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="text-emerald-400">{currentMetrics.successCount} succ</span> /{' '}
              <span className="text-rose-400">{currentMetrics.failedCount} fail</span>
            </div>
          </div>

          <div className="bg-gray-900/90 p-4 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400">Native Inflow</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              +{currentMetrics.nativeInflowPros.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500 mt-1">PROS received</div>
          </div>

          <div className="bg-gray-900/90 p-4 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400">Native Outflow</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              -{currentMetrics.nativeOutflowPros.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500 mt-1">PROS transferred</div>
          </div>

          <div className="bg-gray-900/90 p-4 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400">Net Balance Shift</span>
            <div className={`text-2xl font-bold mt-1 ${currentMetrics.netNativeChangePros >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentMetrics.netNativeChangePros >= 0 ? '+' : ''}{currentMetrics.netNativeChangePros.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500 mt-1">PROS net delta</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-900/50 p-3.5 rounded-xl border border-gray-800 text-sm">
            <span className="text-xs text-gray-400">Gas Cost (PROS)</span>
            <div className="font-semibold text-gray-200 mt-0.5">
              {currentMetrics.gasCostPros.toFixed(6)} PROS
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {currentMetrics.totalGasUsed} units of gas used
            </div>
          </div>

          <div className="bg-gray-900/50 p-3.5 rounded-xl border border-gray-800 text-sm">
            <span className="text-xs text-gray-400">Contract Calls</span>
            <div className="font-semibold text-gray-200 mt-0.5">
              {currentMetrics.contractInteractions} invocations
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Across {currentMetrics.uniqueContractsInteracted.length} unique contract addresses
            </div>
          </div>

          <div className="bg-gray-900/50 p-3.5 rounded-xl border border-gray-800 text-sm">
            <span className="text-xs text-gray-400">Contract Deployments</span>
            <div className="font-semibold text-gray-200 mt-0.5">
              {currentMetrics.contractCreations} created
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {currentMetrics.contractCreations > 0 ? 'Novel smart contract code published' : 'No new deployments this period'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Previous-Period Comparison Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Period-Over-Period Comparative Analysis</span>
          </h3>
          <span className="text-xs text-gray-400">Current 7-Day vs Previous 7-Day</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-400 border-b border-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3">Metric</th>
                <th scope="col" className="px-4 py-3">Current Period</th>
                <th scope="col" className="px-4 py-3">Previous Period</th>
                <th scope="col" className="px-4 py-3">Absolute Delta</th>
                <th scope="col" className="px-4 py-3">Percentage Delta</th>
                <th scope="col" className="px-4 py-3">Agent Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80 bg-gray-900/40">
              {comparisons.map((c) => {
                let badgeColor = 'text-gray-400 bg-gray-800';
                if (c.trend === 'UP') badgeColor = 'text-emerald-400 bg-emerald-950/80 border border-emerald-800/60';
                if (c.trend === 'DOWN') badgeColor = 'text-amber-400 bg-amber-950/80 border border-amber-800/60';

                return (
                  <tr key={c.key} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-white">{c.label}</td>
                    <td className="px-4 py-3.5 font-mono text-gray-200">
                      {c.currentValue} {c.unit}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-gray-400">
                      {c.previousValue} {c.unit}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-gray-200">
                      {c.absoluteChange} {c.unit}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${badgeColor}`}>
                        {c.percentChange !== null ? `${Number(c.percentChange) > 0 ? '+' : ''}${c.percentChange}%` : 'NEW'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 max-w-xs">{c.interpretation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Top 3 Notable Events */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Top Notable Events ({notableEvents.length})</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-gray-800 text-emerald-400">
              Max 3 Ranked
            </span>
          </h3>
          <p className="text-xs text-gray-400 italic">
            {notableEventsExplanation}
          </p>
        </div>

        {notableEvents.length === 0 ? (
          <div className="p-6 rounded-xl bg-gray-900/60 border border-gray-800 text-center text-sm text-gray-400">
            No notable on-chain events detected during this reporting period.
          </div>
        ) : (
          <div className="space-y-3">
            {notableEvents.map((evt, idx) => (
              <div
                key={evt.txHash}
                className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-white text-sm">{evt.eventType}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                      Block #{evt.blockNumber}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(evt.timestamp)}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-950/60 p-3 rounded-lg border border-gray-800/60">
                  <div>
                    <span className="text-gray-500 block">Value / Transferred</span>
                    <span className="text-gray-200 font-medium font-mono">{evt.amount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Execution Fee (Gas)</span>
                    <span className="text-gray-200 font-medium font-mono">{evt.feePros} PROS</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Explorer Verification</span>
                    <a
                      href={evt.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>{evt.txHash.slice(0, 10)}...{evt.txHash.slice(-8)}</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>

                <div className="mt-2.5 text-xs text-gray-300 flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-gray-200">Selection Reason:</strong> {evt.reason}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Trust, Data Provenance & Disclosures */}
      <div className="border-t border-gray-800 pt-6 text-xs text-gray-400 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-gray-300">Data Integrity & Verification Provenance:</span>
          <span className="text-emerald-400 font-mono">
            {provenance.rawTxCountCurrent} current / {provenance.rawTxCountPrevious} prior verified receipts
          </span>
        </div>
        <p>
          <strong className="text-gray-300">RPC Verification:</strong> Verified against {sourceDisclosures.rpcUrl} at block #{provenance.latestBlockAtRun}.
        </p>
        <p>
          <strong className="text-gray-300">MCP Integration:</strong> Handshake active with official Pharos MCP ({sourceDisclosures.mcpEndpoint}).
        </p>
        <p className="text-gray-500 italic">
          {sourceDisclosures.historicalIndexingNote}
        </p>
      </div>
    </div>
  );
}
