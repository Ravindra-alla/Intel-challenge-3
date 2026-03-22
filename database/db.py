import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI not found in environment variables")

client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=2000)
db = client.get_database("ai-tutor")

async def get_database():
    return db
