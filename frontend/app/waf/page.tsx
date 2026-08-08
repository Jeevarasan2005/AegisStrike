"use client";

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Power, PowerOff } from 'lucide-react';

export default function WAFManagement() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API}/api/waf/rules`);
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Failed to fetch WAF rules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const toggleRule = async (id: number, currentStatus: boolean) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API}/api/waf/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 animate-pulse">Loading WAF Rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Web Application Firewall</h2>
        <p className="text-slate-400">Manage active security rules and defensive postures.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <div key={rule.id} className={`p-6 rounded-lg border shadow-sm transition-colors ${
            rule.is_active ? 'bg-slate-800 border-blue-500/50' : 'bg-slate-900 border-slate-800 opacity-75'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${rule.is_active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                  {rule.is_active ? <Shield size={24} /> : <ShieldAlert size={24} />}
                </div>
                <h3 className="text-xl font-semibold">{rule.name}</h3>
              </div>
              <button 
                onClick={() => toggleRule(rule.id, rule.is_active)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  rule.is_active 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                }`}
              >
                {rule.is_active ? <><PowerOff size={16} /> <span>Disable</span></> : <><Power size={16} /> <span>Enable</span></>}
              </button>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {rule.description}
            </p>
            
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                rule.is_active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'
              }`}>
                {rule.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
