# AI Tutor Project

A clean, organized project structure with a React frontend and a FastAPI backend.

## Project Structure

- `frontend/`: React components, pages, and UI logic (HTML, CSS, JS/TS).
- `backend/`: Python FastAPI application handling AI logic and API endpoints.
- `database/`: Database connection configuration and data models.
- `.env`: Environment variables (API keys, Database URI).

## Features

- **Personalized AI Tutoring**: Concise answers tailored for students.
- **Context Pruning**: Intelligent token saving for faster responses.
- **Modern UI**: Clean, responsive design with premium animations and hover effects.
- **Dark Mode Support**: Optimized for all lighting conditions.

## Getting Started

### Backend
1. Go to `backend/`
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `python main.py`

### Frontend
1. Go to `frontend/`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Environment Variables
Ensure your `.env` file in the root contains:
```env
MONGO_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_api_key
```
