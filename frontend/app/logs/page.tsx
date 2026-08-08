"use client";

import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SecurityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API}/api/waf/logs?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400 animate-pulse">Loading Security Events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Security Event Logs</h2>
          <p className="text-slate-400">Real-time monitoring of incoming traffic and WAF actions.</p>
        </div>
        <button onClick={fetchLogs} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm transition-colors border border-slate-700">
          Refresh Logs
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="p-4 font-semibold text-sm text-slate-300">Timestamp</th>
                <th className="p-4 font-semibold text-sm text-slate-300">Source IP</th>
                <th className="p-4 font-semibold text-sm text-slate-300">Payload / Request</th>
                <th className="p-4 font-semibold text-sm text-slate-300">Triggered Rule</th>
                <th className="p-4 font-semibold text-sm text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-sm text-slate-400 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-mono text-blue-400">{log.ip_address}</td>
                  <td className="p-4 text-sm">
                    <code className="bg-slate-950 text-slate-300 px-2 py-1 rounded text-xs break-all">
                      {log.payload}
                    </code>
                  </td>
                  <td className="p-4 text-sm">
                    {log.rule_triggered ? (
                      <span className="text-orange-400">{log.rule_triggered}</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    {log.action === 'BLOCKED' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <ShieldAlert size={12} className="mr-1" /> BLOCKED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 size={12} className="mr-1" /> ALLOWED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No security events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
