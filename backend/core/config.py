from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AegisStrike Defensive Security Platform"
    DATABASE_URL: str = "sqlite:///./aegisstrike.db"
    CELERY_BROKER_URL: str = ""
    CELERY_RESULT_BACKEND: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
