"""Application settings using Pydantic."""

import os
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Environment
    environment: str = Field(default="development", alias="ENVIRONMENT")
    node_env: str = Field(default="development", alias="NODE_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # API Configuration
    api_base_url: str = Field(default="http://localhost:8000", alias="API_BASE_URL")
    frontend_url: str = Field(default="http://localhost:5173", alias="FRONTEND_URL")

    # Database
    database_url: Optional[str] = Field(default=None, alias="DATABASE_URL")
    rds_user: Optional[str] = Field(default=None, alias="RDS_USER")
    rds_password: Optional[str] = Field(default=None, alias="RDS_PASSWORD")
    rds_host: Optional[str] = Field(default=None, alias="RDS_HOST")
    rds_port: str = Field(default="5432", alias="RDS_PORT")
    rds_db: Optional[str] = Field(default=None, alias="RDS_DB")

    # LLM API Keys
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    cohere_api_key: Optional[str] = Field(default=None, alias="COHERE_API_KEY")
    gemini_api_key: Optional[str] = Field(default=None, alias="GEMINI_API_KEY")
    llm_provider: str = Field(default="google", alias="LLM_PROVIDER")

    # Google Cloud Storage
    google_application_credentials: Optional[str] = Field(
        default=None, alias="GOOGLE_APPLICATION_CREDENTIALS"
    )
    gcs_bucket_name: str = Field(
        default="canada-basketball-scouting-reports", alias="GCS_BUCKET_NAME"
    )

    def get_postgres_conn_string(self) -> str:
        """Construct and return PostgreSQL connection string."""
        if self.node_env == "local":
            return "postgresql://localhost:5432/canada_basketball"

        if self.database_url:
            return self.database_url

        if not all([self.rds_user, self.rds_password, self.rds_host, self.rds_db]):
            raise ValueError("Database credentials not configured")

        return f"postgresql://{self.rds_user}:{self.rds_password}@{self.rds_host}:{self.rds_port}/{self.rds_db}"


settings = Settings()
