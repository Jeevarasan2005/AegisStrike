"use client";

import { useState, useEffect, useRef } from 'react';
import { Activity, ShieldAlert, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: '00:00', blocked: 400, allowed: 2400 },
  { name: '04:00', blocked: 300, allowed: 1398 },
  { name: '08:00', blocked: 200, allowed: 9800 },
  { name: '12:00', blocked: 2780, allowed: 3908 },
  { name: '16:00', blocked: 1890, allowed: 4800 },
  { name: '20:00', blocked: 2390, allowed: 3800 },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Dashboard() {
  const [targetRepo, setTargetRepo] = useState("");
  const [sastStatus, setSastStatus] = useState<string>("IDLE");
  const [taskId, setTaskId] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [stats, setStats] = useState({ allowed: 0, blocked: 0 });
  const [backendOnline, setBackendOnline] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch WAF stats every 5 seconds ──────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/waf/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setBackendOnline(true);
        }
      } catch {
        setBackendOnline(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Poll scan status when a task is running ───────────────────────────
  useEffect(() => {
    if (!taskId || sastStatus === "COMPLETED" || sastStatus === "FAILED" || sastStatus === "IDLE") {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/sast/scan/${taskId}`);
        if (res.ok) {
          const data = await res.json();
          setSastStatus(data.status);
          if (data.status === "COMPLETED") {
            setScanResult(data);
            if (pollRef.current) clearInterval(pollRef.current);
          }
        }
      } catch {
        // Backend might be momentarily unavailable, keep polling
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [taskId, sastStatus]);

  // ── Trigger SAST scan ─────────────────────────────────────────────────
  const triggerScan = async () => {
    if (!targetRepo) return;
    setSastStatus("STARTING...");
    setScanResult(null);
    setScanError(null);

    try {
      const res = await fetch(`${API}/api/sast/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repository: targetRepo })
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setTaskId(data.task_id);
      setSastStatus("PENDING");
    } catch (err: any) {
      setSastStatus("FAILED");
      setScanError("Could not connect to the backend. Make sure the Python server is running on port 8000.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Defensive Posture Dashboard</h2>
          <p className="text-slate-400">Monitor simulated attacks, WAF metrics, and run SAST pipeline simulations.</p>
        </div>
        <div className={`text-xs px-3 py-1 rounded-full font-medium border ${
          backendOnline
            ? 'bg-green-500/10 text-green-400 border-green-500/30'
            : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`}>
          {backendOnline ? '● Backend Online' : '● Backend Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-500/20 p-3 rounded-full text-blue-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">System Status</p>
            <p className="text-2xl font-bold">{backendOnline ? 'Secure' : 'Offline'}</p>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="bg-green-500/20 p-3 rounded-full text-green-500">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">WAF Requests Allowed</p>
            <p className="text-2xl font-bold">{stats.allowed}</p>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="bg-red-500/20 p-3 rounded-full text-red-500">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Attacks Blocked</p>
            <p className="text-2xl font-bold">{stats.blocked}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm h-80">
        <h3 className="text-lg font-semibold mb-4">Traffic Analysis</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
            <Line type="monotone" dataKey="allowed" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Simulate SAST Pipeline</h3>
        <div className="flex space-x-4 mb-4">
          <input 
            type="text" 
            placeholder="e.g., github.com/user/repo" 
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
            value={targetRepo}
            onChange={e => setTargetRepo(e.target.value)}
          />
          <button 
            onClick={triggerScan}
            disabled={!targetRepo || sastStatus === "IN_PROGRESS" || sastStatus === "PENDING" || sastStatus === "STARTING..."}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded font-medium transition-colors"
          >
            Start Scan
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-slate-900 rounded border border-slate-800">
          <p className="font-mono text-sm">
            Status: <span className={
              sastStatus === 'COMPLETED' ? 'text-green-500' :
              sastStatus === 'FAILED' ? 'text-red-400' :
              'text-blue-400'
            }>{sastStatus}</span>
          </p>

          {scanError && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
              ⚠ {scanError}
            </div>
          )}
          
          {scanResult && scanResult.report_data && (
            <div className="mt-4">
              <h4 className="font-semibold text-red-400 mb-2">Vulnerabilities Found: {scanResult.vulnerabilities_found}</h4>
              <ul className="space-y-2">
                {scanResult.report_data.map((vuln: any, idx: number) => (
                  <li key={idx} className="bg-slate-800 p-3 rounded flex justify-between items-center text-sm">
                    <span className="font-medium">{vuln.type}</span>
                    <span className="text-slate-400">{vuln.file}:{vuln.line}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      vuln.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                      vuln.severity === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {vuln.severity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
