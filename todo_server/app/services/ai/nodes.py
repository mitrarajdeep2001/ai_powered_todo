from langchain_groq import ChatGroq
from app.services.ai.state import AIState
from app.schemas.ai import ExtractedTodo, ExtractedFilters, ExtractedAction
from app.services.ai.mapper import normalize_status, normalize_priority

import json
import re
from dotenv import load_dotenv

load_dotenv()


llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0
)


# -------------------------------
# Intent Detection
# -------------------------------
async def detect_intent(state: AIState):
    prompt = f"""
    Classify the user intent into one of:
    CREATE, UPDATE, DELETE, GET

    Return ONLY one word.

    Input: {state['input']}
    """

    res = await llm.ainvoke(prompt)

    return {**state, "intent": res.content.strip().upper()}


# -------------------------------
# Helper: Safe JSON extraction
# -------------------------------
def extract_json(content: str):
    try:
        return json.loads(content)
    except:
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("Invalid JSON from LLM")


# -------------------------------
# Data Extraction (ALL INTENTS)
# -------------------------------
async def extract_data(state: AIState):

    intent = state["intent"]

    # ---------------------------
    # GET → Filters
    # ---------------------------
    if intent == "GET":

        prompt = f"""
        Extract filters from the user query:

        {state['input']}

        Return ONLY valid JSON:
        {{
            "status": "...",
            "priority": "...",
            "date_filter": "today | tomorrow | week"
        }}

        Rules:
        - "pending" → TODO
        - "ongoing" → IN_PROGRESS
        - "completed" → DONE
        - "urgent" → HIGH
        """

    # ---------------------------
    # UPDATE / DELETE → Action
    # ---------------------------
    elif intent in ["UPDATE", "DELETE"]:

        prompt = f"""
        Extract action details from the user query:

        {state['input']}

        Return ONLY valid JSON:
        {{
            "title": "...",
            "status": "...",
            "priority": "...",
            "reference": "last | first | specific"
        }}

        Rules:
        - "last task" → reference = "last"
        - "first task" → reference = "first"
        - If task name mentioned → put in title
        - "completed/done" → DONE
        - "urgent" → HIGH
        """

    # ---------------------------
    # CREATE → Todo
    # ---------------------------
    else:

        prompt = f"""
        Extract structured todo data from:
        {state['input']}

        Return ONLY valid JSON:
        {{
            "title": "...",
            "description": "...",
            "priority": "...",
            "status": "...",
            "due_date": "ISO format"
        }}

        Rules:
        - Default status = TODO
        - Default priority = MEDIUM
        """

    res = await llm.ainvoke(prompt)

    # ---------------------------
    # Clean LLM output
    # ---------------------------
    content = res.content.strip()
    content = content.replace("```json", "").replace("```", "").strip()

    try:
        parsed = extract_json(content)

        # -----------------------
        # GET FLOW
        # -----------------------
        if intent == "GET":

            validated = ExtractedFilters(**parsed)

            if validated.status:
                validated.status = normalize_status(parsed.get("status"))

            if validated.priority:
                validated.priority = normalize_priority(parsed.get("priority"))

        # -----------------------
        # UPDATE / DELETE FLOW
        # -----------------------
        elif intent in ["UPDATE", "DELETE"]:

            validated = ExtractedAction(**parsed)

            if validated.status:
                validated.status = normalize_status(parsed.get("status"))

            if validated.priority:
                validated.priority = normalize_priority(parsed.get("priority"))

        # -----------------------
        # CREATE FLOW
        # -----------------------
        else:

            try:
                validated = ExtractedTodo(**parsed)
            except:
                parsed["due_date"] = None
                validated = ExtractedTodo(**parsed)

            validated.status = normalize_status(parsed.get("status") or "TODO")
            validated.priority = normalize_priority(parsed.get("priority") or "MEDIUM")

    except Exception as e:
        raise ValueError(f"Invalid AI output: {e}")

    return {**state, "data": validated}