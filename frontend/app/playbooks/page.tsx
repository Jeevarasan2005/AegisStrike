import { BookOpen, FileText } from 'lucide-react';

export default function Playbooks() {
  const playbooks = [
    {
      id: 1,
      title: "SQL Injection Response Playbook",
      description: "Standard operating procedure for when the WAF detects recurring SQLi attempts from a single source.",
      steps: [
        "Verify if the attack successfully bypassed the WAF.",
        "Check database logs for anomalous queries matching the timestamp.",
        "Block the offending IP address in the WAF or edge router.",
        "Review the vulnerable code endpoint and ensure parameterized queries are used."
      ]
    },
    {
      id: 2,
      title: "Cross-Site Scripting (XSS) Mitigation",
      description: "Steps to take when reflected or stored XSS payloads are identified in traffic logs.",
      steps: [
        "Identify the injection vector (e.g., query parameter, form input).",
        "Ensure the WAF 'XSS Mitigation' rule is active.",
        "Audit the frontend code to ensure outputs are properly HTML-escaped.",
        "Implement a Content Security Policy (CSP) header to restrict script sources."
      ]
    },
    {
      id: 3,
      title: "Path Traversal Investigation",
      description: "How to handle alerts for directory traversal attempts (../etc/passwd).",
      steps: [
        "Determine if the web server process has read access to the requested files.",
        "Verify if the WAF blocked the request or if it reached the application.",
        "Update code to restrict file access to a specific sandboxed directory.",
        "Sanitize inputs by resolving absolute paths and validating against the base directory."
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Incident Response Playbooks</h2>
        <p className="text-slate-400">Standard Operating Procedures (SOPs) for handling common security events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbooks.map((playbook) => (
          <div key={playbook.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm hover:border-blue-500/50 transition-colors">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500/20 p-2 rounded text-blue-400">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-semibold leading-tight">{playbook.title}</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">{playbook.description}</p>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Response Steps</h4>
              <ul className="space-y-2">
                {playbook.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-slate-300">
                    <FileText size={16} className="text-slate-500 mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
