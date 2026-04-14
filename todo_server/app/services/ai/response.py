def format_todo(todo):
    return {
        "id": todo.id,
        "title": todo.title,
        "status": todo.status,
        "priority": todo.priority,
        "due_date": todo.due_date
    }


def success_response(action: str, data):
    return {
        "action": action,
        "success": True,
        "data": data
    }


def error_response(message: str):
    return {
        "success": False,
        "error": message
    }