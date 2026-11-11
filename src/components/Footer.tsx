export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-800 bg-[#0A0D14] py-8 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 font-medium">Pharos Weekly Digest Agent</p>
          <p className="text-xs text-gray-600 mt-1">
            Season of AI Arena — Built on ai.pharos.xyz & official Pharos MCP
          </p>
        </div>
        <div className="flex items-center space-x-6 text-xs">
          <a
            href="https://ai.pharos.xyz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            Pharos AI
          </a>
          <a
            href="https://docs.pharos.xyz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            Docs
          </a>
          <a
            href="https://mcp.pharos.xyz/mcp"
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            Official MCP
          </a>
          <a
            href="https://atlantic.pharosscan.xyz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            PharosScan
          </a>
        </div>
      </div>
    </footer>
  );
}
