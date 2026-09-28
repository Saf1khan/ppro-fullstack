from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # API Configuration
    PROJECT_NAME: str = "PadosiPro Full-Stack API"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Database
    POSTGRES_USER: str = "padosipro"
    POSTGRES_PASSWORD: str = "padosipro_dev_password"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "padosipro_db"
    DATABASE_URL: str = (
        "postgresql+asyncpg://padosipro:padosipro_dev_password@localhost:5432/padosipro_db"
    )

    # Security
    SECRET_KEY: str = "dev_secret_key_change_in_production_min_32_chars_12345"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # SMTP / Mailpit
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "no-reply@padosipro.local"
    EMAILS_FROM_NAME: str = "PadosiPro"


settings = Settings()
