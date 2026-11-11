import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pharos Weekly Digest — Autonomous Activity Agent',
  description: 'Autonomous periodic weekly summary and comparative reporting agent for Pharos Network accounts and protocols.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0B0F17] text-gray-100 min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
