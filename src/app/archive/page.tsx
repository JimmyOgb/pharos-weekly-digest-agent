import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { listAllDigests, listRunRecords } from '@/services/storage';

export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  const digests = listAllDigests();
  const runs = listRunRecords();

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F17]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <div className="border-b border-gray-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Digest Archive & Scheduler Logs
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Complete historical record of published weekly digests and autonomous agent execution runs.
            </p>
          </div>
          <Link
            href="/"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm font-medium text-emerald-400 hover:bg-gray-800 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* 1. Historical Digests Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Published Digests Archive</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-normal">
              {digests.length} total
            </span>
          </h2>

          {digests.length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center text-sm text-gray-400">
              No historical digests stored yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {digests.map((d) => (
                <Link
                  key={d.id}
                  href={`/digest/${d.id}`}
                  className="bg-[#111827] border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all group flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        {d.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {d.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 font-mono truncate">
                      Wallet: {d.walletAddress}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Period: {formatDate(d.reportingPeriod.start)} → {formatDate(d.reportingPeriod.end)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                    <div>
                      <span className="text-white font-semibold">{d.currentMetrics.txCount} txs</span> •{' '}
                      <span className="text-emerald-400 font-medium">+{d.currentMetrics.nativeInflowPros} PROS</span>
                    </div>
                    <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">
                      View Report →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 2. Scheduler Run History & Audit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Scheduler Execution & Audit Log</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-normal">
                {runs.length} recorded runs
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#111827]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900 uppercase text-gray-400 border-b border-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-3">Run ID</th>
                  <th scope="col" className="px-4 py-3">Timestamp</th>
                  <th scope="col" className="px-4 py-3">Trigger Type</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Execution Duration</th>
                  <th scope="col" className="px-4 py-3">Result Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No scheduler runs recorded yet.
                    </td>
                  </tr>
                ) : (
                  runs.map((r) => {
                    let statusColor = 'text-gray-400 bg-gray-800';
                    if (r.status === 'SUCCESS') statusColor = 'text-emerald-400 bg-emerald-950 border border-emerald-800';
                    if (r.status === 'SKIPPED_DUPLICATE') statusColor = 'text-blue-400 bg-blue-950 border border-blue-800';
                    if (r.status === 'FAILED') statusColor = 'text-rose-400 bg-rose-950 border border-rose-800';

                    return (
                      <tr key={r.runId} className="hover:bg-gray-800/40">
                        <td className="px-4 py-3 font-mono font-medium text-white">{r.runId}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(r.timestamp)}</td>
                        <td className="px-4 py-3 font-semibold text-gray-300">{r.trigger}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-400">{r.durationMs}ms</td>
                        <td className="px-4 py-3 text-gray-300 max-w-sm truncate">{r.message}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
