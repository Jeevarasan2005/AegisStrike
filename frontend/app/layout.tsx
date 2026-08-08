import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import { Shield, Activity, Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: "AegisStrike - Defensive Platform",
  description: "Educational Defensive Security Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100 flex">
        <aside className="w-64 bg-slate-950 p-4 border-r border-slate-800">
          <div className="flex items-center space-x-2 mb-8 text-blue-500">
            <Shield size={32} />
            <h1 className="text-xl font-bold text-white tracking-wide">AegisStrike</h1>
          </div>
          
          <nav className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded transition-colors">
              <Activity size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="/waf" className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded transition-colors">
              <Shield size={20} />
              <span>WAF Management</span>
            </Link>
            <Link href="/logs" className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded transition-colors">
              <Terminal size={20} />
              <span>Security Logs</span>
            </Link>
            <Link href="/sandbox" className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded transition-colors">
              <Activity size={20} />
              <span>Vulnerability Sandbox</span>
            </Link>
            <Link href="/playbooks" className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded transition-colors">
              <Shield size={20} />
              <span>IR Playbooks</span>
            </Link>
          </nav>
        </aside>
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
