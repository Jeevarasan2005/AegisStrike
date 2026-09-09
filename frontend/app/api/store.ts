export interface WAFRule {
  id: number;
  name: str;
  description: string;
  is_active: boolean;
}

export interface SecurityLog {
  id: number;
  timestamp: string;
  ip_address: string;
  payload: string;
  action: "ALLOWED" | "BLOCKED";
  rule_triggered: string | null;
}

export interface ScanRecord {
  task_id: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  target_repo: string;
  vulnerabilities_found: number;
  report_data: any[];
  completed_at?: string;
}

// In-memory initial state for WAF Rules
let rules: WAFRule[] = [
  { id: 1, name: "SQLi Prevention", description: "Blocks incoming payloads containing common SQL injection patterns like ' OR 1=1.", is_active: true },
  { id: 2, name: "XSS Mitigation", description: "Sanitizes and blocks cross-site scripting attempts containing <script> tags.", is_active: true },
  { id: 3, name: "Rate Limiting", description: "Blocks IPs that send too many requests in a short time frame.", is_active: false },
  { id: 4, name: "Path Traversal Blocking", description: "Prevents access to sensitive files using ../ patterns.", is_active: true }
];

// Seed initial mock logs
let logs: SecurityLog[] = [
  { id: 1, timestamp: new Date(Date.now() - 5 * 60000).toISOString(), ip_address: "192.168.1.5", payload: "POST /login ' OR 1=1--", action: "BLOCKED", rule_triggered: "SQLi Prevention" },
  { id: 2, timestamp: new Date(Date.now() - 12 * 60000).toISOString(), ip_address: "10.0.0.42", payload: "GET /search?q=<script>alert(1)</script>", action: "BLOCKED", rule_triggered: "XSS Mitigation" },
  { id: 3, timestamp: new Date(Date.now() - 25 * 60000).toISOString(), ip_address: "172.16.254.1", payload: "GET /etc/passwd", action: "BLOCKED", rule_triggered: "Path Traversal Blocking" },
  { id: 4, timestamp: new Date(Date.now() - 40 * 60000).toISOString(), ip_address: "8.8.8.8", payload: "GET /index.html", action: "ALLOWED", rule_triggered: null },
  { id: 5, timestamp: new Date(Date.now() - 60 * 60000).toISOString(), ip_address: "203.0.113.5", payload: "GET /image.png", action: "ALLOWED", rule_triggered: null }
];

let scans: Record<string, ScanRecord> = {};

export const getRules = () => rules;
export const updateRule = (id: number, isActive: boolean) => {
  rules = rules.map(r => r.id === id ? { ...r, is_active: isActive } : r);
  return rules.find(r => r.id === id);
};

export const getLogs = (limit = 50) => logs.slice(0, limit);

export const getStats = () => {
  const allowed = logs.filter(l => l.action === "ALLOWED").length;
  const blocked = logs.filter(l => l.action === "BLOCKED").length;
  return { allowed, blocked };
};

export const createScan = (taskId: string, repo: string): ScanRecord => {
  const record: ScanRecord = {
    task_id: taskId,
    status: "COMPLETED",
    target_repo: repo,
    vulnerabilities_found: 3,
    report_data: [
      { type: "Hardcoded Secret", file: "config/jwt.py", line: 14, severity: "HIGH" },
      { type: "SQL Injection", file: "routes/users.py", line: 42, severity: "HIGH" },
      { type: "Missing Anti-CSRF Token", file: "views/profile.py", line: 88, severity: "MEDIUM" }
    ],
    completed_at: new Date().toISOString()
  };
  scans[taskId] = record;
  return record;
};

export const getScan = (taskId: string) => scans[taskId];
