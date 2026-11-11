import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-[#0E1420]/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              Φ
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">Pharos Weekly Digest</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Agent Arena
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-300 hover:text-emerald-400 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/archive"
            className="text-sm font-medium text-gray-300 hover:text-emerald-400 transition-colors"
          >
            Archive & Runs
          </Link>
          <a
            href="https://atlantic.pharosscan.xyz"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center space-x-1 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <span>Explorer</span>
            <span className="text-xs">↗</span>
          </a>
          <div className="flex items-center space-x-2 text-xs bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Atlantic (688689)</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
