"use client";

import { useState } from 'react';
import { Play } from 'lucide-react';

export default function Sandbox() {
  const [vulnType, setVulnType] = useState("sqli");
  const [payload, setPayload] = useState("' OR '1'='1");
  const [result, setResult] = useState<any>(null);
  const [isSecure, setIsSecure] = useState(false);

  const executeCode = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${API}/api/sandbox/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vulnerability_type: vulnType,
        payload,
        is_secure: isSecure
      })
    });
    const data = await res.json();
    setResult(data);
  };

  const getCodeSnippet = (type: string, secure: boolean) => {
    if (type === "sqli") {
      return secure 
        ? `// Secure Implementation (Parameterized)\nquery = "SELECT * FROM users WHERE username = %s"\ncursor.execute(query, (username,))`
        : `# Vulnerable Implementation\nquery = f"SELECT * FROM users WHERE username = '{username}'"\ncursor.execute(query)`;
    }
    if (type === "xss") {
      return secure
        ? `// Secure Implementation (Sanitized)\nimport html\nsafe_payload = html.escape(payload)\nreturn f"<div>Hello {safe_payload}</div>"`
        : `# Vulnerable Implementation\nreturn f"<div>Hello {payload}</div>"`;
    }
    if (type === "path_traversal") {
      return secure
        ? `// Secure Implementation (Path Validation)\nimport os\nbase_dir = "/var/www/html/images/"\nreal_path = os.path.realpath(os.path.join(base_dir, requested_file))\nif not real_path.startswith(os.path.realpath(base_dir)):\n    raise Error("Blocked")`
        : `# Vulnerable Implementation\nimport os\nbase_dir = "/var/www/html/images/"\nfile_path = os.path.join(base_dir, requested_file)\nreturn open(file_path).read()`;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Vulnerability Sandbox</h2>
        <p className="text-slate-400">Compare vulnerable code with secure implementations interactively.</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <select 
            value={vulnType}
            onChange={(e) => setVulnType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="sqli">SQL Injection (SQLi)</option>
            <option value="xss">Cross-Site Scripting (XSS)</option>
            <option value="path_traversal">Path Traversal</option>
          </select>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Mode:</span>
            <button 
              onClick={() => setIsSecure(false)}
              className={`px-3 py-1 rounded text-sm ${!isSecure ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Vulnerable
            </button>
            <button 
              onClick={() => setIsSecure(true)}
              className={`px-3 py-1 rounded text-sm ${isSecure ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Secure
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Code Snippet</h3>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800 text-sm font-mono text-slate-300">
              <code>{getCodeSnippet(vulnType, isSecure)}</code>
            </pre>
            
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium block">Attack Payload / Input</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
                <button 
                  onClick={executeCode}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center transition-colors"
                >
                  <Play size={16} className="mr-2"/> Execute
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Execution Result</h3>
            <div className={`p-4 rounded-lg border min-h-[200px] ${
              result ? (result.status === 'vulnerable' ? 'bg-red-950/30 border-red-900/50' : result.status === 'secure' ? 'bg-green-950/30 border-green-900/50' : 'bg-slate-900 border-slate-800') : 'bg-slate-900 border-slate-800'
            }`}>
              {result ? (
                <div className="space-y-4 font-mono text-sm">
                  <p className={`font-bold ${result.status === 'vulnerable' ? 'text-red-400' : 'text-green-400'}`}>
                    [STATUS] {result.message}
                  </p>
                  
                  {result.simulated_query && (
                    <div>
                      <span className="text-slate-500">Executed Query: </span>
                      <span className="text-slate-300">{result.simulated_query}</span>
                    </div>
                  )}
                  {result.rendered_html && (
                    <div>
                      <span className="text-slate-500">Rendered Output: </span>
                      <span className="text-slate-300">{result.rendered_html}</span>
                    </div>
                  )}
                  {result.simulated_path && (
                    <div>
                      <span className="text-slate-500">Accessed Path: </span>
                      <span className="text-slate-300">{result.simulated_path}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-sm flex items-center justify-center h-full">
                  Click execute to see the outcome.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
