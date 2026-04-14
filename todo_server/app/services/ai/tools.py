from app.services.todo_service import TodoService
from app.services.ai.mapper import normalize_status, normalize_priority
from app.services.ai.resolver import resolve_task
from app.services.ai.response import success_response, error_response, format_todo

from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from app.models.todo import Todo
from app.schemas.todo import UpdateTodo


async def execute_action(state, db, user_id):

    intent = state["intent"]
    data = state["data"]

    # ---------------------------
    # CREATE
    # ---------------------------
    if intent == "CREATE":
        todo = await TodoService.create(db, user_id, data)
        return {
            **state,
            "output": success_response("CREATE", format_todo(todo))
        }

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
            "output": success_response(
                "GET",
                [format_todo(t) for t in todos]
            )
        }

    # ---------------------------
    # DELETE
    # ---------------------------
    if intent == "DELETE":

        # 🔥 BULK DELETE (filter-based)
        if getattr(data, "status", None) or getattr(data, "priority", None):

            query = select(Todo).where(Todo.user_id == user_id)

            if data.status:
                status = normalize_status(data.status)
                query = query.where(Todo.status == status)

            if data.priority:
                priority = normalize_priority(data.priority)
                query = query.where(Todo.priority == priority)

            result = await db.execute(query)
            tasks = result.scalars().all()

            if not tasks:
                return {**state, "output": "No matching tasks found"}

            for task in tasks:
                await TodoService.delete(db, user_id, task.id)

            return {
                **state,
                "output": success_response(
                    "DELETE",
                    [format_todo(t) for t in tasks]
                )
            }

        # 🔴 SINGLE DELETE (existing logic)
        task = await resolve_task(db, user_id, data)

        if not task:
            return {**state, "output": "Task not found"}

        await TodoService.delete(db, user_id, task.id)

        return {
            **state,
            "output": success_response("DELETE", format_todo(task))
        }

    # ---------------------------
    # UPDATE
    # ---------------------------
    if intent == "UPDATE":
        task = await resolve_task(db, user_id, data)
        if not task:
            return {**state, "output": "Task not found"}
        update_data = {}
        if data.status:
            update_data["status"] = normalize_status(data.status)
        if data.priority:
            update_data["priority"] = normalize_priority(data.priority)
        # ✅ Convert dict → Pydantic
        update_schema = UpdateTodo(**update_data)
        updated = await TodoService.update(
            db,
            user_id,
            task.id,
            update_schema
        )

        return {
            **state,
            "output": success_response("UPDATE", format_todo(updated))
        }