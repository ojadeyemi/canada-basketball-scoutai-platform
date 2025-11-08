"""PDF report generation endpoints."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from config.pdf_constants import PDF_STORAGE_DIR

router = APIRouter(prefix="/api/pdf", tags=["PDF Reports"])

# Define allowed base directory for PDF storage
ALLOWED_PDF_DIR = PDF_STORAGE_DIR.parent.resolve()  # ./pdfs/


@router.get("/{pdf_path:path}")
async def get_pdf(pdf_path: str):
    """
    Serve a PDF file from the allowed directory with path traversal protection.

    Args:
        pdf_path (str): The relative path to the PDF file (e.g., "pdfs/scouting-reports/report.pdf")

    Returns:
        FileResponse: The PDF file response.

    Security:
        - Validates path is within ALLOWED_PDF_DIR
        - Prevents path traversal attacks (../, absolute paths)
        - Only serves .pdf files
    """
    # Remove leading slash if present
    pdf_path = pdf_path.lstrip("/")

    # Construct absolute path from relative path
    requested_file = (ALLOWED_PDF_DIR / pdf_path).resolve()

    # Security: Check if resolved path is within allowed directory
    try:
        requested_file.relative_to(ALLOWED_PDF_DIR)
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied: Path outside allowed directory")

    # Check if file exists
    if not requested_file.exists():
        raise HTTPException(status_code=404, detail="PDF file not found")

    # Check if it's a file (not directory)
    if not requested_file.is_file():
        raise HTTPException(status_code=400, detail="Path is not a file")

    # Validate file extension
    if requested_file.suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="Requested file is not a PDF")

    try:
        return FileResponse(requested_file, media_type="application/pdf", filename=requested_file.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving PDF: {str(e)}")
