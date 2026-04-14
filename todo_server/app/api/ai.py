from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.services.ai.graph import build_graph

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat")
async def ai_chat(
    prompt: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    graph = build_graph(db, user.id)

    result = await graph.ainvoke({
        "input": prompt
    })

    return result["output"]