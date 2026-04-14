from app.services.todo_service import TodoService
from app.services.ai.mapper import normalize_status, normalize_priority

from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from app.models.todo import Todo


async def execute_action(state, db, user_id):

    intent = state["intent"]
    data = state["data"]

    # ---------------------------
    # CREATE
    # ---------------------------
    if intent == "CREATE":
        todo = await TodoService.create(db, user_id, data)
        return {**state, "output": f"Created todo {todo.id}"}

    # ---------------------------
    # GET (INTELLIGENT FILTERING)
    # ---------------------------
    if intent == "GET":

        query = select(Todo).where(Todo.user_id == user_id)

        # ✅ Normalize + Apply Status
        if getattr(data, "status", None):
            status = normalize_status(data.status)
            query = query.where(Todo.status == status)

        # ✅ Normalize + Apply Priority
        if getattr(data, "priority", None):
            priority = normalize_priority(data.priority)
            query = query.where(Todo.priority == priority)

        # 📅 Date Filters
        now = datetime.now(timezone.utc)

        if getattr(data, "date_filter", None) == "today":
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=1)

            query = query.where(
                Todo.due_date >= start,
                Todo.due_date < end
            )

        elif getattr(data, "date_filter", None) == "tomorrow":
            start = (now + timedelta(days=1)).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            end = start + timedelta(days=1)

            query = query.where(
                Todo.due_date >= start,
                Todo.due_date < end
            )

        elif getattr(data, "date_filter", None) == "week":
            start = now
            end = now + timedelta(days=7)

            query = query.where(
                Todo.due_date >= start,
                Todo.due_date < end
            )

        # 🔍 Execute query
        result = await db.execute(query)
        todos = result.scalars().all()

        # ✅ Structured response (important)
        return {
            **state,
            "output": {
                "count": len(todos),
                "todos": [
                    {
                        "id": t.id,
                        "title": t.title,
                        "status": t.status,
                        "priority": t.priority,
                        "due_date": t.due_date
                    }
                    for t in todos
                ]
            }
        }

    # ---------------------------
    # DELETE (placeholder)
    # ---------------------------
    if intent == "DELETE":
        return {**state, "output": "Delete not fully implemented"}

    # ---------------------------
    # UPDATE (placeholder)
    # ---------------------------
    if intent == "UPDATE":
        return {**state, "output": "Update not fully implemented"}

    return {**state, "output": "Unknown action"}