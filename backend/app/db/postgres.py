"""PostgreSQL connection and utilities."""

from config.settings import settings


def get_database_url() -> str:
    """Get PostgreSQL connection string from environment."""
    database_url = settings.get_postgres_conn_string()

    # AsyncPostgresSaver requires postgresql:// not postgresql+psycopg://
    if database_url.startswith("postgresql+psycopg://"):
        database_url = database_url.replace("postgresql+psycopg://", "postgresql://")

    return database_url


# SQL for creating PDF jobs table
CREATE_PDF_JOBS_TABLE = """
CREATE TABLE IF NOT EXISTS pdf_jobs (
    id UUID PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    player_name VARCHAR(255) NOT NULL,
    league VARCHAR(50),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    gcs_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pdf_jobs_session ON pdf_jobs(session_id);
CREATE INDEX IF NOT EXISTS idx_pdf_jobs_status ON pdf_jobs(status);
"""
