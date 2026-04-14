from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str

    JWT_SECRET: str = "supersecret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    GROQ_API_KEY: str
    OPENAI_API_KEY: str
    GOOGLE_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()