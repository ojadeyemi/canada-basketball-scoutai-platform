"""PDF generation constants."""

from pathlib import Path

# Local PDF storage directory (fallback when GCS unavailable)
PDF_STORAGE_DIR = Path("./pdfs/scouting-reports")

# Ensure directory exists
PDF_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
