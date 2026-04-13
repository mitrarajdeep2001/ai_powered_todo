from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class TodoStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class TodoPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class CreateTodo(BaseModel):
    title: str
    description: Optional[str] = None
    status: TodoStatus = TodoStatus.TODO
    priority: TodoPriority = TodoPriority.MEDIUM
    due_date: Optional[datetime] = None


class UpdateTodo(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TodoStatus] = None
    priority: Optional[TodoPriority] = None
    due_date: Optional[datetime] = None


class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TodoStatus
    priority: TodoPriority
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True