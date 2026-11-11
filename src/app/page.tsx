'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DigestCard } from '@/components/DigestCard';
import { DigestReport } from '@/types';

export default function HomePage() {
  const [digest, setDigest] = useState<DigestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [walletInput, setWalletInput] = useState('0x299ce4113abf88f4997737184aa8a7a3d58ac15c');
  const [forceRun, setForceRun] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = async (wallet?: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = wallet ? `?wallet=${wallet}` : '';
      const res = await fetch(`/api/digest/generate${q}`);
      const data = await res.json();
      if (data.latest) {
        setDigest(data.latest);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/digest/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletInput.trim(),
          force: forceRun,
          lookbackDays: 7
        })
      });

      const data = await res.json();
      if (data.success && data.digest) {
        setDigest(data.digest);
        if (data.isDuplicate) {
          setMessage(`Notice: Returned existing digest #${data.digest.id}. (Identical period already generated; duplicate run skipped).`);
        } else {
          setMessage(`Success! Generated weekly digest #${data.digest.id} with ${data.digest.currentMetrics.txCount} transactions.`);
        }
      } else {
        setError(data.error || 'Failed to generate digest');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F17]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#111827] to-[#0D131F] border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Autonomous On-Chain Reporting Agent
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Pharos Weekly Digest
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Produces verified, periodic summaries of Pharos Atlantic accounts and smart contracts.
              Covers key numbers, period-over-period delta comparisons, and top 3 ranked notable events delivered on an autonomous weekly schedule.
            </p>
          </div>

          {/* Interactive Generator & Schedule Controls */}
          <div className="mt-8 pt-6 border-t border-gray-800/80 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* Run Generator Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleGenerate} className="space-y-3">
                <label className="block text-xs font-medium text-gray-300">
                  Target Wallet or Contract Address:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={generating}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {generating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>Querying RPC & MCP...</span>
                      </>
                    ) : (
                      <span>Run Digest Now</span>
                    )}
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={forceRun}
                      onChange={(e) => setForceRun(e.target.checked)}
                      className="rounded bg-gray-900 border-gray-700 text-emerald-500 focus:ring-0"
                    />
                    <span>Force regenerate (bypass duplicate period check)</span>
                  </label>
                  <span className="text-gray-600">•</span>
                  <span>Reporting Span: 7 Days</span>
                </div>
              </form>

              {message && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs">
                  {message}
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
                  Error: {error}
                </div>
              )}
            </div>

            {/* Schedule & Automation Status Card */}
            <div className="bg-gray-950/60 border border-gray-800/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-200">Scheduled Trigger</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ACTIVE
                </span>
              </div>
              <p className="text-gray-400">
                <strong className="text-gray-300">Cadence:</strong> Weekly (Mondays 00:00 UTC)
              </p>
              <p className="text-gray-400">
                <strong className="text-gray-300">Cron:</strong> <code className="text-emerald-400 font-mono">0 0 * * 1</code>
              </p>
              <p className="text-gray-400">
                <strong className="text-gray-300">Automation:</strong> GitHub Actions & Vercel Cron
              </p>
              <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between">
                <Link href="/archive" className="text-emerald-400 hover:underline">
                  View Run Logs & Archive →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Published Digest */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Latest Published Weekly Digest</span>
            </h2>
            <Link
              href="/archive"
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Browse Historical Archive →
            </Link>
          </div>

          {loading ? (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-12 text-center text-gray-400 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm">Fetching on-chain digest data from Pharos Atlantic Testnet...</p>
            </div>
          ) : digest ? (
            <DigestCard digest={digest} isDetailed={true} />
          ) : (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-12 text-center text-gray-400 space-y-3">
              <p className="text-base text-gray-300">No published digests found yet.</p>
              <p className="text-xs">Click "Run Digest Now" above to generate the first verified report.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
