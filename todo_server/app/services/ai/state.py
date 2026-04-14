from typing import TypedDict, Optional, Dict


class AIState(TypedDict):
    input: str
    intent: Optional[str]
    data: Optional[Dict]
    output: Optional[str]