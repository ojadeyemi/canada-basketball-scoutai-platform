"""Google Cloud Storage helpers for PDF upload and signed URL generation."""

import os
from datetime import timedelta
from pathlib import Path

from google.cloud import storage
from google.oauth2 import service_account


def _get_gcs_client() -> storage.Client:
    """
    Get authenticated GCS client using service account.

    Returns:
        storage.Client instance

    Raises:
        FileNotFoundError: If service account JSON not found
        ValueError: If GOOGLE_APPLICATION_CREDENTIALS not set
    """
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    if not credentials_path:
        raise ValueError(
            "GOOGLE_APPLICATION_CREDENTIALS environment variable not set. "
            "Set it to the path of your service-account.json file."
        )

    if not Path(credentials_path).exists():
        raise FileNotFoundError(
            f"Service account file not found at: {credentials_path}"
        )

    # TODO: Verify service account has Storage Object Admin role
    credentials = service_account.Credentials.from_service_account_file(
        credentials_path
    )
    return storage.Client(credentials=credentials)


def upload_pdf_to_gcs(
    local_pdf_path: Path | str, destination_blob_name: str | None = None
) -> str:
    """
    Upload PDF to Google Cloud Storage.

    Args:
        local_pdf_path: Path to local PDF file
        destination_blob_name: Name for the file in GCS (e.g., "scouting-reports/aaron-best-2024.pdf")
                                If None, uses the local filename

    Returns:
        GCS path (gs://bucket-name/path/to/file.pdf)

    Raises:
        FileNotFoundError: If local PDF doesn't exist
        Exception: If upload fails

    Example:
        gcs_path = upload_pdf_to_gcs(
            "/tmp/scouting_report.pdf",
            "scouting-reports/aaron-best-2024.pdf"
        )
        # Returns: "gs://canada-basketball-scouting-reports/scouting-reports/aaron-best-2024.pdf"
    """
    local_path = Path(local_pdf_path)

    if not local_path.exists():
        raise FileNotFoundError(f"Local PDF not found: {local_path}")

    # TODO: Verify bucket name is correct (check .env or Railway config)
    bucket_name = os.getenv("GCS_BUCKET_NAME", "canada-basketball-scouting-reports")

    # Use local filename if destination not specified
    if destination_blob_name is None:
        destination_blob_name = f"scouting-reports/{local_path.name}"

    try:
        client = _get_gcs_client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)

        # Upload with PDF content type
        blob.upload_from_filename(local_path, content_type="application/pdf")

        gcs_path = f"gs://{bucket_name}/{destination_blob_name}"
        return gcs_path

    except Exception as e:
        raise Exception(f"Failed to upload PDF to GCS: {str(e)}") from e


def generate_signed_url(gcs_path: str, expiration_hours: int = 168) -> str:
    """
    Generate signed URL for temporary public access to GCS file.

    Args:
        gcs_path: GCS path (gs://bucket-name/path/to/file.pdf)
        expiration_hours: URL expiration time in hours (default 168 = 1 week)

    Returns:
        Signed URL (valid for specified duration)

    Raises:
        ValueError: If gcs_path format is invalid

    Example:
        signed_url = generate_signed_url(
            "gs://canada-basketball-scouting-reports/scouting-reports/aaron-best-2024.pdf",
            expiration_hours=168
        )
        # Returns: "https://storage.googleapis.com/canada-basketball-scouting-reports/..."
    """
    if not gcs_path.startswith("gs://"):
        raise ValueError(
            f"Invalid GCS path format: {gcs_path}. Expected format: gs://bucket-name/path"
        )

    # Parse bucket and blob name from gs:// path
    path_parts = gcs_path.replace("gs://", "").split("/", 1)
    if len(path_parts) != 2:
        raise ValueError(f"Invalid GCS path: {gcs_path}")

    bucket_name, blob_name = path_parts

    try:
        client = _get_gcs_client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        # Generate signed URL with specified expiration
        # TODO: Verify service account has signBlob permission (roles/iam.serviceAccountTokenCreator)
        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(hours=expiration_hours),
            method="GET",
        )

        return signed_url

    except Exception as e:
        raise Exception(f"Failed to generate signed URL: {str(e)}") from e


def delete_pdf_from_gcs(gcs_path: str) -> bool:
    """
    Delete PDF from GCS (optional cleanup function).

    Args:
        gcs_path: GCS path (gs://bucket-name/path/to/file.pdf)

    Returns:
        True if deleted successfully, False otherwise

    Example:
        success = delete_pdf_from_gcs("gs://canadabasketballai/scouting-reports/old-report.pdf")
    """
    if not gcs_path.startswith("gs://"):
        return False

    path_parts = gcs_path.replace("gs://", "").split("/", 1)
    if len(path_parts) != 2:
        return False

    bucket_name, blob_name = path_parts

    try:
        client = _get_gcs_client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        blob.delete()
        return True
    except Exception:
        return False
