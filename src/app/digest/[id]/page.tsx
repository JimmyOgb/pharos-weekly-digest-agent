import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DigestCard } from '@/components/DigestCard';
import { getDigestById, listAllDigests } from '@/services/storage';

export const dynamic = 'force-dynamic';

export default async function DigestDetailPage({
  params
}: {
  params: { id: string };
}) {
  const digest = getDigestById(params.id);

  if (!digest) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0B0F17]">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Digest Not Found</h1>
          <p className="text-gray-400 text-sm">
            No published digest exists with ID <code className="text-emerald-400 font-mono">{params.id}</code>.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors"
            >
              ← Back to Latest Digest
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F17]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
          <span className="text-xs text-gray-500 font-mono">
            Permalink: /digest/{digest.id}
          </span>
        </div>

        <DigestCard digest={digest} isDetailed={true} />
      </main>
      <Footer />
    </div>
  );
}
