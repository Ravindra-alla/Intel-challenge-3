import os
import sys
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import groq
from dotenv import load_dotenv

# Add root directory to sys.path to import from database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import get_database
from database.models import ChatModel

load_dotenv()

app = FastAPI(title="AI Tutor API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found")

client = groq.Groq(api_key=GROQ_API_KEY)

class QuestionRequest(BaseModel):
    question: str

def normalize_question(question: str) -> str:
    return " ".join(question.lower().strip().split())

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "AI Tutor API is running"}

@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    question = request.question
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    normalized_q = normalize_question(question)
    # Check cache
    try:
        db = await get_database()
        chats_collection = db.get_collection("chats")
        cached_chat = await chats_collection.find_one({"normalizedQuestion": normalized_q})
        if cached_chat:
            return {
                "answer": cached_chat["answer"],
                "cached": True
            }
    except Exception as e:
        print(f"Database error (skipping cache): {e}")
        chats_collection = None

    # Call Groq API
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": """You are an advanced AI tutor. 
                    1. Identify the language used by the student and respond in the SAME language.
                    2. Provide detailed, high-quality educational content.
                    3. If the student asks for a short answer, keep it concise. Otherwise, feel free to explain in depth.
                    4. Use formatting (bold, lists, etc.) to make content easy to read."""
                },
                {
                    "role": "user",
                    "content": f"Question: {question}\n\nPlease provide a very thorough, detailed, and comprehensive explanation. Use examples and clear structure."
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=2048,
            top_p=0.9,
            stream=False
        )
        answer = chat_completion.choices[0].message.content or "No response received"
        print(f"AI Response: {answer[:100]}...") # Log first 100 chars
    except Exception as e:
        print(f"Groq API error: {e}")
        answer = "Sorry, I couldn't answer that right now. Please try again later."

    # Save to DB
    if chats_collection is not None:
        try:
            new_chat = ChatModel(
                question=question[:500],
                normalizedQuestion=normalized_q[:500],
                answer=answer[:5000],
                fromCache=False
            )
            await chats_collection.insert_one(new_chat.model_dump())
        except Exception as e:
            print(f"Database error (skipping save): {e}")

    return {
        "answer": answer,
        "cached": False
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
