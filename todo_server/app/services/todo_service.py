from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.models.todo import Todo


class TodoService:

    @staticmethod
    async def create(db: AsyncSession, user_id: int, data):
        todo = Todo(**data.dict(), user_id=user_id)

        db.add(todo)
        await db.commit()
        await db.refresh(todo)

        return todo

    @staticmethod
    async def get_all(db: AsyncSession, user_id: int):
        result = await db.execute(
            select(Todo).where(Todo.user_id == user_id)
        )
        return result.scalars().all()

    @staticmethod
    async def get_one(db: AsyncSession, user_id: int, todo_id: int):
        result = await db.execute(
            select(Todo).where(
                Todo.id == todo_id,
                Todo.user_id == user_id
            )
        )
        todo = result.scalar_one_or_none()

        if not todo:
            raise HTTPException(404, "Todo not found")

        return todo

    @staticmethod
    async def update(db: AsyncSession, user_id: int, todo_id: int, data):
        todo = await TodoService.get_one(db, user_id, todo_id)

        for key, value in data.dict(exclude_unset=True).items():
            setattr(todo, key, value)

        await db.commit()
        await db.refresh(todo)

        return todo

    @staticmethod
    async def delete(db: AsyncSession, user_id: int, todo_id: int):
        todo = await TodoService.get_one(db, user_id, todo_id)

        await db.delete(todo)
        await db.commit()

        return {"message": "Deleted"}