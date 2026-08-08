from sqlalchemy import Column, Integer, String, Boolean
from core.database import Base

class WAFRule(Base):
    __tablename__ = "waf_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    is_active = Column(Boolean, default=False)
