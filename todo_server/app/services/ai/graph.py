from langgraph.graph import StateGraph
from app.services.ai.state import AIState
from app.services.ai.nodes import detect_intent, extract_data
from app.services.ai.tools import execute_action


def build_graph(db, user_id):

    async def execute(state: AIState):
        return await execute_action(state, db, user_id)

    graph = StateGraph(AIState)

    graph.add_node("intent", detect_intent)
    graph.add_node("extract", extract_data)
    graph.add_node("execute", execute)

    graph.set_entry_point("intent")

    graph.add_edge("intent", "extract")
    graph.add_edge("extract", "execute")

    return graph.compile()