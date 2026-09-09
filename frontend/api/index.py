from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AegisStrike Defensive Security Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rules_db = [
    {"id": 1, "name": "SQLi Prevention", "description": "Blocks incoming payloads containing common SQL injection patterns like ' OR 1=1.", "is_active": True},
    {"id": 2, "name": "XSS Mitigation", "description": "Sanitizes and blocks cross-site scripting attempts containing <script> tags.", "is_active": True},
    {"id": 3, "name": "Rate Limiting", "description": "Blocks IPs that send too many requests in a short time frame.", "is_active": False},
    {"id": 4, "name": "Path Traversal Blocking", "description": "Prevents access to sensitive files using ../ patterns.", "is_active": True}
]

logs_db = [
    {"id": 1, "timestamp": "2026-09-09T20:00:00Z", "ip_address": "192.168.1.5", "payload": "POST /login ' OR 1=1--", "action": "BLOCKED", "rule_triggered": "SQLi Prevention"},
    {"id": 2, "timestamp": "2026-09-09T19:50:00Z", "ip_address": "10.0.0.42", "payload": "GET /search?q=<script>alert(1)</script>", "action": "BLOCKED", "rule_triggered": "XSS Mitigation"},
    {"id": 3, "timestamp": "2026-09-09T19:30:00Z", "ip_address": "172.16.254.1", "payload": "GET /etc/passwd", "action": "BLOCKED", "rule_triggered": "Path Traversal Blocking"},
    {"id": 4, "timestamp": "2026-09-09T19:00:00Z", "ip_address": "8.8.8.8", "payload": "GET /index.html", "action": "ALLOWED", "rule_triggered": None}
]

@app.get("/api/waf/stats")
def waf_stats():
    allowed = len([l for l in logs_db if l["action"] == "ALLOWED"])
    blocked = len([l for l in logs_db if l["action"] == "BLOCKED"])
    return {"allowed": allowed, "blocked": blocked}

@app.get("/api/waf/rules")
def waf_rules():
    return rules_db

@app.put("/api/waf/rules/{rule_id}")
def update_rule(rule_id: int, payload: dict):
    for r in rules_db:
        if r["id"] == rule_id:
            r["is_active"] = payload.get("is_active", r["is_active"])
            return r
    return {"detail": "Rule not found"}

@app.get("/api/waf/logs")
def waf_logs(limit: int = 50):
    return logs_db[:limit]

@app.post("/api/sast/scan")
def sast_scan(payload: dict):
    return {"message": "Scan initiated", "task_id": "test-task-123", "scan_id": 1}

@app.get("/api/sast/scan/{task_id}")
def sast_scan_status(task_id: str):
    return {
        "task_id": task_id,
        "status": "COMPLETED",
        "target_repo": "github.com/user/repo",
        "vulnerabilities_found": 2,
        "report_data": [
            {"type": "SQL Injection", "file": "db.py", "line": 21, "severity": "HIGH"},
            {"type": "XSS", "file": "views.py", "line": 45, "severity": "MEDIUM"}
        ]
    }

@app.post("/api/sandbox/execute")
def sandbox_execute(payload: dict):
    v_type = payload.get("vulnerability_type")
    is_sec = payload.get("is_secure")
    p = payload.get("payload", "")
    if is_sec:
        return {"status": "secure", "message": "Execution sanitized and safe."}
    return {"status": "vulnerable", "message": f"Execution triggered vulnerability for {v_type} with payload {p}"}

@app.get("/")
def root():
    return {"status": "AegisStrike Backend Running Securely"}
