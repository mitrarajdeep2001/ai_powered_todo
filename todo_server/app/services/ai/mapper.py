def normalize_status(status: str) -> str:
    if not status:
        return "TODO"

    status = status.lower()

    if status in ["pending", "todo", "to do"]:
        return "TODO"
    if status in ["in progress", "doing"]:
        return "IN_PROGRESS"
    if status in ["done", "completed", "complete"]:
        return "DONE"

    return "TODO"


def normalize_priority(priority: str) -> str:
    if not priority:
        return "MEDIUM"

    priority = priority.lower()

    if priority in ["low"]:
        return "LOW"
    if priority in ["medium", "normal"]:
        return "MEDIUM"
    if priority in ["high", "urgent"]:
        return "HIGH"

    return "MEDIUM"