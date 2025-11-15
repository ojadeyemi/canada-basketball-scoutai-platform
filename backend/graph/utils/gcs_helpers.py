"""Google Cloud Storage helpers for PDF upload and signed URL generation."""

from pathlib import Path

from google.cloud import storage
from google.oauth2 import service_account

from config.settings import settings

GCS_FOLDER_NAME = "scouting-reports"


def _get_gcs_client() -> storage.Client:
    """
    Get authenticated GCS client using service account or default credentials.

    Tries multiple authentication methods in order:
    1. Service account JSON file (if GOOGLE_APPLICATION_CREDENTIALS is set)
    2. Default credentials (Cloud Run workload identity, ADC, gcloud auth, etc.)

    Returns:
        storage.Client instance

    Raises:
        Exception: If no valid authentication method is available
    """
    credentials_path = settings.google_application_credentials

    # Try service account JSON file if path is provided
    if credentials_path and Path(credentials_path).exists():
        credentials = service_account.Credentials.from_service_account_file(credentials_path)
        return storage.Client(credentials=credentials)

    # Fall back to default credentials (Cloud Run, ADC, etc.)
    return storage.Client()


def upload_pdf_to_gcs(local_pdf_path: Path | str, destination_blob_name: str | None = None) -> str:
    """
    Upload PDF to Google Cloud Storage.

    Args:
        local_pdf_path: Path to local PDF file
        destination_blob_name: Name for the file in GCS (e.g., "scouting-reports/aaron-best-2024.pdf")
                                If None, uses the local filename

    Returns:
        Public URL of the uploaded file.

    Raises:
        FileNotFoundError: If local PDF doesn't exist
        Exception: If upload fails

    Example:
        public_url = upload_pdf_to_gcs(
            "/tmp/scouting_report.pdf",
            "scouting-reports/aaron-best-2024.pdf"
        )
        # Returns: "https://storage.googleapis.com/bucket-name/scouting-reports/aaron-best-2024.pdf"
    """
    local_path = Path(local_pdf_path)

    if not local_path.exists():
        raise FileNotFoundError(f"Local PDF not found: {local_path}")

    bucket_name = settings.gcs_bucket_name

    # Use local filename if destination not specified
    if destination_blob_name is None:
        destination_blob_name = f"{GCS_FOLDER_NAME}/{local_path.name}"

    try:
        client = _get_gcs_client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)

        # Upload with PDF content type
        blob.upload_from_filename(local_path, content_type="application/pdf")

        return blob.public_url

    except Exception as e:
        raise Exception(f"Failed to upload PDF to GCS: {str(e)}") from e
