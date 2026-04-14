from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ExtractedTodo(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "MEDIUM"
    status: str = "PENDING"
    due_date: Optional[datetime] = None

class ExtractedFilters(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    date_filter: Optional[str] = None  # today, tomorrow, week

class ExtractedAction(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    reference: Optional[str] = None  # last, first, specific