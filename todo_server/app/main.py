from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.todo import router as todo_router
from app.api.ai import router as ai_router

app = FastAPI(
    title="AI Powered Todo API",
    version="1.0.0"
)


# -------------------------------
# Middleware
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# Routes
# -------------------------------
app.include_router(auth_router, prefix="/api")
app.include_router(todo_router, prefix="/api")
app.include_router(ai_router, prefix="/api")


# -------------------------------
# Health Check
# -------------------------------
@app.get("/")
async def root():
    return {"message": "API is running 🚀"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}