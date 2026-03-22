from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ChatModel(BaseModel):
    question: str = Field(..., max_length=200)
    normalizedQuestion: Optional[str] = Field(None, max_length=200)
    answer: str = Field(..., max_length=5000)
    fromCache: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "question": "What is React?",
                "normalizedQuestion": "what is react?",
                "answer": "React is a JavaScript library for building user interfaces.",
                "fromCache": False
            }
        }
