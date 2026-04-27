from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./fluencyai.db"
    jwt_secret_key: str = "change-me-in-development"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7
    password_reset_token_expire_minutes: int = 30
    cors_allowed_origins: str = "http://localhost:3000"
    gemini_api_key: str = ""
    knowledge_base_dir: str = "knowledge_base"

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_allowed_origins.split(",")
            if origin.strip()
        ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
