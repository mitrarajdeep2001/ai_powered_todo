from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.todo import CreateTodo, UpdateTodo, TodoResponse
from app.services.todo_service import TodoService
from app.api.deps import get_current_user

router = APIRouter(prefix="/todos", tags=["Todos"])


@router.post("/", response_model=TodoResponse)
async def create_todo(
    data: CreateTodo,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await TodoService.create(db, user.id, data)


@router.get("/", response_model=list[TodoResponse])
async def get_todos(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await TodoService.get_all(db, user.id)


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await TodoService.get_one(db, user.id, todo_id)


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    data: UpdateTodo,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await TodoService.update(db, user.id, todo_id, data)


@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await TodoService.delete(db, user.id, todo_id)