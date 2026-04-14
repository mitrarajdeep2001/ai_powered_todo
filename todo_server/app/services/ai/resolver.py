from sqlalchemy import select, desc
from app.models.todo import Todo


async def resolve_task(db, user_id, data):

    # 🔹 Case 1: last task
    if data.reference == "last":
        result = await db.execute(
            select(Todo)
            .where(Todo.user_id == user_id)
            .order_by(desc(Todo.created_at))
            .limit(1)
        )
        return result.scalar_one_or_none()

    # 🔹 Case 2: by title
    if data.title:
        result = await db.execute(
            select(Todo)
            .where(
                Todo.user_id == user_id,
                Todo.title.ilike(f"%{data.title}%")
            )
            .limit(1)
        )
        return result.scalar_one_or_none()

    return None