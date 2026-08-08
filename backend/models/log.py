from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from core.database import Base

class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String)
    payload = Column(String)
    action = Column(String) # ALLOWED or BLOCKED
    rule_triggered = Column(String, nullable=True)
