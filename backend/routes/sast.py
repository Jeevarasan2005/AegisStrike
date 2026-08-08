from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from core.database import get_db
from models.vulnerability import ScanResult
from pydantic import BaseModel
import uuid

router = APIRouter()

class SASTRequest(BaseModel):
    repository: str

@router.post("/scan")
async def trigger_sast_scan(request: SASTRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Triggers an asynchronous SAST scan simulation using BackgroundTasks instead of Celery.
    """
    from worker import run_sast_scan
    
    task_id = str(uuid.uuid4())
    
    # Store initial record
    scan_record = ScanResult(
        task_id=task_id,
        target_repo=request.repository,
        status="PENDING"
    )
    db.add(scan_record)
    db.commit()
    db.refresh(scan_record)
    
    background_tasks.add_task(run_sast_scan, task_id, request.repository)
    
    return {"message": "Scan initiated", "task_id": task_id, "scan_id": scan_record.id}

@router.get("/scan/{task_id}")
async def get_scan_status(task_id: str, db: Session = Depends(get_db)):
    scan = db.query(ScanResult).filter(ScanResult.task_id == task_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    import json
    report = json.loads(scan.report_data) if scan.report_data else None
    
    return {
        "task_id": scan.task_id,
        "status": scan.status,
        "target_repo": scan.target_repo,
        "vulnerabilities_found": scan.vulnerabilities_found,
        "report_data": report,
        "completed_at": scan.completed_at
    }

@router.get("/scans")
async def get_recent_scans(db: Session = Depends(get_db)):
    scans = db.query(ScanResult).order_by(ScanResult.created_at.desc()).limit(10).all()
    return scans
