import time
import json
import asyncio
import random
from datetime import datetime
from core.database import SessionLocal
from models.vulnerability import ScanResult
import websockets

async def notify_frontend(task_id: str, status: str):
    uri = "ws://localhost:8000/ws/updates"
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(json.dumps({"task_id": task_id, "status": status}))
    except Exception as e:
        print(f"Failed to send websocket update: {e}")

def run_sast_scan(task_id: str, repository: str):
    
    db = SessionLocal()
    scan = db.query(ScanResult).filter(ScanResult.task_id == task_id).first()
    if scan:
        scan.status = "IN_PROGRESS"
        db.commit()
    db.close()
    
    # Notify IN_PROGRESS
    asyncio.run(notify_frontend(task_id, "IN_PROGRESS"))
    
    # Simulate scanning time
    time.sleep(random.randint(5, 10))
    
    # Generate mock report
    vulnerabilities = [
        {"type": "Hardcoded Secret", "file": "config.py", "severity": "HIGH", "line": 12},
        {"type": "Missing CORS Headers", "file": "main.py", "severity": "MEDIUM", "line": 45},
        {"type": "Outdated Dependency", "file": "requirements.txt", "severity": "LOW", "line": 3}
    ]
    
    db = SessionLocal()
    scan = db.query(ScanResult).filter(ScanResult.task_id == task_id).first()
    if scan:
        scan.status = "COMPLETED"
        scan.vulnerabilities_found = len(vulnerabilities)
        scan.report_data = json.dumps(vulnerabilities)
        from sqlalchemy.sql import func
        scan.completed_at = func.now()
        db.commit()
    db.close()
    
    # Notify COMPLETED
    asyncio.run(notify_frontend(task_id, "COMPLETED"))
    
    return "Scan complete"
