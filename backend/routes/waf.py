from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from core.database import get_db
from models.waf_rule import WAFRule
from models.log import SecurityLog

router = APIRouter()

class WAFRuleResponse(BaseModel):
    id: int
    name: str
    description: str
    is_active: bool

    class Config:
        from_attributes = True

class WAFRuleUpdate(BaseModel):
    is_active: bool

class SecurityLogResponse(BaseModel):
    id: int
    timestamp: str
    ip_address: str
    payload: str
    action: str
    rule_triggered: str | None

    class Config:
        from_attributes = True

@router.get("/rules", response_model=List[WAFRuleResponse])
def get_waf_rules(db: Session = Depends(get_db)):
    rules = db.query(WAFRule).all()
    return rules

@router.put("/rules/{rule_id}", response_model=WAFRuleResponse)
def update_waf_rule(rule_id: int, update_data: WAFRuleUpdate, db: Session = Depends(get_db)):
    rule = db.query(WAFRule).filter(WAFRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule.is_active = update_data.is_active
    db.commit()
    db.refresh(rule)
    return rule

@router.get("/logs", response_model=List[SecurityLogResponse])
def get_security_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(SecurityLog).order_by(SecurityLog.timestamp.desc()).limit(limit).all()
    # Convert datetime to string for pydantic
    formatted_logs = []
    for log in logs:
        formatted_logs.append({
            "id": log.id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else "",
            "ip_address": log.ip_address,
            "payload": log.payload,
            "action": log.action,
            "rule_triggered": log.rule_triggered
        })
    return formatted_logs

@router.get("/stats")
def get_waf_stats(db: Session = Depends(get_db)):
    allowed = db.query(SecurityLog).filter(SecurityLog.action == "ALLOWED").count()
    blocked = db.query(SecurityLog).filter(SecurityLog.action == "BLOCKED").count()
    return {"allowed": allowed, "blocked": blocked}
