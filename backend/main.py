from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base, SessionLocal
from routes import sandbox, sast, waf
import json

# Import all models to ensure tables are created
import models.waf_rule
import models.log
import models.vulnerability

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AegisStrike Defensive Security Platform")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(sandbox.router, prefix="/api/sandbox", tags=["Sandbox"])
app.include_router(sast.router, prefix="/api/sast", tags=["SAST Simulation"])
app.include_router(waf.router, prefix="/api/waf", tags=["WAF"])

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    # Seed WAF Rules
    if db.query(models.waf_rule.WAFRule).count() == 0:
        rules = [
            models.waf_rule.WAFRule(name="SQLi Prevention", description="Blocks incoming payloads containing common SQL injection patterns like ' OR 1=1.", is_active=True),
            models.waf_rule.WAFRule(name="XSS Mitigation", description="Sanitizes and blocks cross-site scripting attempts containing <script> tags.", is_active=True),
            models.waf_rule.WAFRule(name="Rate Limiting", description="Blocks IPs that send too many requests in a short time frame.", is_active=False),
            models.waf_rule.WAFRule(name="Path Traversal Blocking", description="Prevents access to sensitive files using ../ patterns.", is_active=True)
        ]
        db.add_all(rules)
        db.commit()
    
    # Seed mock logs
    if db.query(models.log.SecurityLog).count() == 0:
        import random
        from datetime import datetime, timedelta
        actions = ["ALLOWED", "BLOCKED"]
        ips = ["192.168.1.5", "10.0.0.42", "172.16.254.1", "8.8.8.8", "203.0.113.5"]
        payloads = ["GET /index.html", "POST /login ' OR 1=1--", "GET /image.png", "GET /search?q=<script>alert(1)</script>", "GET /etc/passwd"]
        rules = ["SQLi Prevention", "XSS Mitigation", "Path Traversal Blocking", None]
        
        logs = []
        for i in range(20):
            action = random.choice(actions)
            payload = random.choice(payloads)
            rule = None
            if "OR 1=1" in payload:
                action = "BLOCKED"
                rule = "SQLi Prevention"
            elif "<script>" in payload:
                action = "BLOCKED"
                rule = "XSS Mitigation"
            elif "/etc/passwd" in payload:
                action = "BLOCKED"
                rule = "Path Traversal Blocking"
            else:
                action = "ALLOWED"

            logs.append(models.log.SecurityLog(
                ip_address=random.choice(ips),
                payload=payload,
                action=action,
                rule_triggered=rule,
                timestamp=datetime.utcnow() - timedelta(minutes=random.randint(1, 1440))
            ))
        db.add_all(logs)
        db.commit()
    db.close()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast the update from the worker
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {"status": "AegisStrike Backend Running Securely"}
