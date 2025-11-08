#!/usr/bin/env python3
"""
Tests for Google Cloud Storage helper functions.

Usage:
    python tests/test_gcs_helpers.py

No external dependencies required - uses standard library mocking.
"""

import os
import sys
from pathlib import Path
from unittest.mock import Mock, patch

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from graph.utils.gcs_helpers import (
    _get_gcs_client,
    delete_pdf_from_gcs,
    generate_signed_url,
    upload_pdf_to_gcs,
)


def print_section(title: str):
    """Print formatted section header."""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80)


def print_test(test_name: str):
    """Print test name."""
    print(f"\n▶ Testing: {test_name}")


def print_pass(message: str = "PASSED"):
    """Print success message."""
    print(f"  ✅ {message}")


def print_fail(message: str):
    """Print failure message."""
    print(f"  ❌ FAILED: {message}")


def assert_raises(exception_type, func, *args, **kwargs):
    """Assert that function raises specific exception."""
    try:
        func(*args, **kwargs)
        return False
    except exception_type:
        return True
    except Exception as e:
        print_fail(f"Wrong exception type: {type(e).__name__}")
        return False


# ===== Test: _get_gcs_client =====


def test_get_gcs_client_no_credentials_env():
    """Test that ValueError is raised when GOOGLE_APPLICATION_CREDENTIALS is not set."""
    print_test("_get_gcs_client() with no GOOGLE_APPLICATION_CREDENTIALS")

    with patch.dict(os.environ, {}, clear=True):
        if assert_raises(ValueError, _get_gcs_client):
            print_pass("ValueError raised as expected")
            return True
        else:
            print_fail("Expected ValueError not raised")
            return False


def test_get_gcs_client_file_not_found():
    """Test that FileNotFoundError is raised when service account file doesn't exist."""
    print_test("_get_gcs_client() with non-existent service account file")

    with patch.dict(os.environ, {"GOOGLE_APPLICATION_CREDENTIALS": "/fake/path.json"}):
        if assert_raises(FileNotFoundError, _get_gcs_client):
            print_pass("FileNotFoundError raised as expected")
            return True
        else:
            print_fail("Expected FileNotFoundError not raised")
            return False


def test_get_gcs_client_success():
    """Test successful GCS client creation."""
    print_test("_get_gcs_client() successful client creation")

    with (
        patch("graph.utils.gcs_helpers.storage.Client") as mock_storage_client,
        patch("graph.utils.gcs_helpers.service_account.Credentials.from_service_account_file") as mock_credentials,
        patch("graph.utils.gcs_helpers.Path") as mock_path,
    ):
        # Mock file exists
        mock_path_instance = Mock()
        mock_path_instance.exists.return_value = True
        mock_path.return_value = mock_path_instance

        # Mock credentials
        mock_creds = Mock()
        mock_credentials.return_value = mock_creds

        # Mock storage client
        mock_client = Mock()
        mock_storage_client.return_value = mock_client

        with patch.dict(os.environ, {"GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service.json"}):
            client = _get_gcs_client()

            if client == mock_client:
                print_pass("Client created successfully")
                mock_credentials.assert_called_once_with("/path/to/service.json")
                mock_storage_client.assert_called_once_with(credentials=mock_creds)
                return True
            else:
                print_fail("Client mismatch")
                return False


# ===== Test: upload_pdf_to_gcs =====


def test_upload_pdf_local_file_not_found():
    """Test that FileNotFoundError is raised when local PDF doesn't exist."""
    print_test("upload_pdf_to_gcs() with non-existent file")

    if assert_raises(FileNotFoundError, upload_pdf_to_gcs, "/fake/path/report.pdf"):
        print_pass("FileNotFoundError raised as expected")
        return True
    else:
        print_fail("Expected FileNotFoundError not raised")
        return False


def test_upload_pdf_success_with_default_blob_name():
    """Test successful PDF upload with default blob name."""
    print_test("upload_pdf_to_gcs() with default blob name")

    # Create temporary PDF file
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(b"fake pdf content")
        pdf_file = tmp.name

    try:
        with patch("graph.utils.gcs_helpers._get_gcs_client") as mock_get_client:
            # Mock GCS client
            mock_client = Mock()
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_client.bucket.return_value = mock_bucket
            mock_bucket.blob.return_value = mock_blob
            mock_get_client.return_value = mock_client

            with patch.dict(os.environ, {"GCS_BUCKET_NAME": "test-bucket"}):
                gcs_path = upload_pdf_to_gcs(pdf_file)

                expected = f"gs://test-bucket/scouting-reports/{Path(pdf_file).name}"
                if gcs_path == expected:
                    print_pass(f"GCS path correct: {gcs_path}")
                    mock_blob.upload_from_filename.assert_called_once()
                    return True
                else:
                    print_fail(f"Expected {expected}, got {gcs_path}")
                    return False
    finally:
        Path(pdf_file).unlink()


def test_upload_pdf_success_with_custom_blob_name():
    """Test successful PDF upload with custom blob name."""
    print_test("upload_pdf_to_gcs() with custom blob name")

    # Create temporary PDF file
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(b"fake pdf content")
        pdf_file = tmp.name

    try:
        with patch("graph.utils.gcs_helpers._get_gcs_client") as mock_get_client:
            # Mock GCS client
            mock_client = Mock()
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_client.bucket.return_value = mock_bucket
            mock_bucket.blob.return_value = mock_blob
            mock_get_client.return_value = mock_client

            custom_blob = "reports/custom-name.pdf"
            gcs_path = upload_pdf_to_gcs(pdf_file, destination_blob_name=custom_blob)

            expected = "gs://canada-basketball-scouting-reports/reports/custom-name.pdf"
            if gcs_path == expected:
                print_pass(f"Custom blob name used: {gcs_path}")
                mock_bucket.blob.assert_called_once_with(custom_blob)
                return True
            else:
                print_fail(f"Expected {expected}, got {gcs_path}")
                return False
    finally:
        Path(pdf_file).unlink()


def test_upload_pdf_gcs_error():
    """Test that Exception is raised when GCS upload fails."""
    print_test("upload_pdf_to_gcs() with GCS error")

    # Create temporary PDF file
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(b"fake pdf")
        pdf_file = tmp.name

    try:
        with patch("graph.utils.gcs_helpers._get_gcs_client") as mock_get_client:
            # Mock GCS client to raise error
            mock_client = Mock()
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.upload_from_filename.side_effect = Exception("GCS upload failed")
            mock_client.bucket.return_value = mock_bucket
            mock_bucket.blob.return_value = mock_blob
            mock_get_client.return_value = mock_client

            if assert_raises(Exception, upload_pdf_to_gcs, pdf_file):
                print_pass("Exception raised on GCS upload failure")
                return True
            else:
                print_fail("Expected Exception not raised")
                return False
    finally:
        Path(pdf_file).unlink()


# ===== Test: generate_signed_url =====


def test_generate_signed_url_invalid_format():
    """Test that ValueError is raised for invalid GCS path format."""
    print_test("generate_signed_url() with invalid format")

    if assert_raises(ValueError, generate_signed_url, "http://example.com/file.pdf"):
        print_pass("ValueError raised for invalid format")
        return True
    else:
        print_fail("Expected ValueError not raised")
        return False


def test_generate_signed_url_missing_blob_name():
    """Test that ValueError is raised when blob name is missing."""
    print_test("generate_signed_url() with missing blob name")

    if assert_raises(ValueError, generate_signed_url, "gs://bucket-name"):
        print_pass("ValueError raised for missing blob name")
        return True
    else:
        print_fail("Expected ValueError not raised")
        return False


def test_generate_signed_url_success_default_expiration():
    """Test successful signed URL generation with default expiration."""
    print_test("generate_signed_url() with default expiration (1 week)")

    with patch("graph.utils.gcs_helpers._get_gcs_client") as mock_get_client:
        # Mock GCS client
        mock_client = Mock()
        mock_bucket = Mock()
        mock_blob = Mock()
        mock_blob.generate_signed_url.return_value = "https://storage.googleapis.com/signed-url"
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob
        mock_get_client.return_value = mock_client

        gcs_path = "gs://test-bucket/reports/file.pdf"
        signed_url = generate_signed_url(gcs_path)

        if signed_url == "https://storage.googleapis.com/signed-url":
            print_pass(f"Signed URL generated: {signed_url[:50]}...")
            mock_client.bucket.assert_called_once_with("test-bucket")
            mock_bucket.blob.assert_called_once_with("reports/file.pdf")

            # Check expiration is 168 hours (1 week)
            call_args = mock_blob.generate_signed_url.call_args
            expiration_seconds = call_args.kwargs["expiration"].total_seconds()
            expected_seconds = 168 * 3600
            if expiration_seconds == expected_seconds:
                print_pass("Expiration set correctly: 168 hours")
                return True
            else:
                print_fail(f"Expected {expected_seconds}s, got {expiration_seconds}s")
                return False
        else:
            print_fail("Signed URL mismatch")
            return False


def test_generate_signed_url_custom_expiration():
    """Test signed URL generation with custom expiration."""
    print_test("generate_signed_url() with custom expiration (48 hours)")

    with patch("graph.utils.gcs_helpers._get_gcs_client") as mock_get_client:
        # Mock GCS client
        mock_client = Mock()
        mock_bucket = Mock()
        mock_blob = Mock()
        mock_blob.generate_signed_url.return_value = "https://storage.googleapis.com/signed-url"
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob
        mock_get_client.return_value = mock_client

        gcs_path = "gs://test-bucket/reports/file.pdf"
        signed_url = generate_signed_url(gcs_path, expiration_hours=48)

        if signed_url == "https://storage.googleapis.com/signed-url":
            # Check expiration is 48 hours
            call_args = mock_blob.generate_signed_url.call_args
            expiration_seconds = call_args.kwargs["expiration"].total_seconds()
            expected_seconds = 48 * 3600
            if expiration_seconds == expected_seconds:
                print_pass("Custom expiration set: 48 hours")
                return True
            else:
                print_fail(f"Expected {expected_seconds}s, got {expiration_seconds}s")
                return False
        else:
            print_fail("Signed URL mismatch")
            return False


def test_generate_signed_url_gcs_error():
    """Test that Exception is raised when signed URL generation fails."""
    print_test("generate_signed_url() with GCS error")

    with patch("graph.utils.gcs_helpers._get_gcs_client") as mock_get_client:
        # Mock GCS client to raise error
        mock_client = Mock()
        mock_bucket = Mock()
        mock_blob = Mock()
        mock_blob.generate_signed_url.side_effect = Exception("SignBlob permission denied")
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob
        mock_get_client.return_value = mock_client

        if assert_raises(Exception, generate_signed_url, "gs://test-bucket/reports/file.pdf"):
            print_pass("Exception raised on signed URL failure")
            return True
        else:
            print_fail("Expected Exception not raised")
            return False


# ===== Test: delete_pdf_from_gcs =====


def test_delete_pdf_invalid_format():
    """Test that False is returned for invalid GCS path format."""
    print_test("delete_pdf_from_gcs() with invalid format")

    result = delete_pdf_from_gcs("http://example.com/file.pdf")
    if result is False:
        print_pass("Returns False for invalid format")
        return True
    else:
        print_fail("Expected False, got True")
        return False


def test_delete_pdf_missing_blob_name():
    """Test that False is returned when blob name is missing."""
    print_test("delete_pdf_from_gcs() with missing blob name")

    result = delete_pdf_from_gcs("gs://bucket-name")
    if result is False:
        print_pass("Returns False for missing blob name")
        return True
    else:
        print_fail("Expected False, got True")
        return False


def test_delete_pdf_success():
    """Test successful PDF deletion."""
    print_test("delete_pdf_from_gcs() successful deletion")

    with patch("graph.utils.gcs_helpers._get_gcs_client") as mock_get_client:
        # Mock GCS client
        mock_client = Mock()
        mock_bucket = Mock()
        mock_blob = Mock()
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob
        mock_get_client.return_value = mock_client

        gcs_path = "gs://test-bucket/reports/file.pdf"
        result = delete_pdf_from_gcs(gcs_path)

        if result is True:
            print_pass("PDF deleted successfully")
            mock_client.bucket.assert_called_once_with("test-bucket")
            mock_bucket.blob.assert_called_once_with("reports/file.pdf")
            mock_blob.delete.assert_called_once()
            return True
        else:
            print_fail("Expected True, got False")
            return False


def test_delete_pdf_gcs_error():
    """Test that False is returned when GCS deletion fails."""
    print_test("delete_pdf_from_gcs() with GCS error")

    with patch("graph.utils.gcs_helpers._get_gcs_client") as mock_get_client:
        # Mock GCS client to raise error
        mock_client = Mock()
        mock_bucket = Mock()
        mock_blob = Mock()
        mock_blob.delete.side_effect = Exception("Permission denied")
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob
        mock_get_client.return_value = mock_client

        gcs_path = "gs://test-bucket/reports/file.pdf"
        result = delete_pdf_from_gcs(gcs_path)

        if result is False:
            print_pass("Returns False on GCS error")
            return True
        else:
            print_fail("Expected False, got True")
            return False


# ===== Run All Tests =====


def run_all_tests():
    """Run all tests and report results."""
    print_section("GCS Helper Functions Test Suite")
    print("Testing Google Cloud Storage utility functions with mocked GCS client")
    print("No actual GCS connection required - all tests use mocks\n")

    tests = [
        # _get_gcs_client tests
        ("Get GCS Client - No Credentials", test_get_gcs_client_no_credentials_env),
        ("Get GCS Client - File Not Found", test_get_gcs_client_file_not_found),
        ("Get GCS Client - Success", test_get_gcs_client_success),
        # upload_pdf_to_gcs tests
        ("Upload PDF - File Not Found", test_upload_pdf_local_file_not_found),
        (
            "Upload PDF - Default Blob Name",
            test_upload_pdf_success_with_default_blob_name,
        ),
        (
            "Upload PDF - Custom Blob Name",
            test_upload_pdf_success_with_custom_blob_name,
        ),
        ("Upload PDF - GCS Error", test_upload_pdf_gcs_error),
        # generate_signed_url tests
        ("Signed URL - Invalid Format", test_generate_signed_url_invalid_format),
        ("Signed URL - Missing Blob", test_generate_signed_url_missing_blob_name),
        (
            "Signed URL - Default Expiration",
            test_generate_signed_url_success_default_expiration,
        ),
        ("Signed URL - Custom Expiration", test_generate_signed_url_custom_expiration),
        ("Signed URL - GCS Error", test_generate_signed_url_gcs_error),
        # delete_pdf_from_gcs tests
        ("Delete PDF - Invalid Format", test_delete_pdf_invalid_format),
        ("Delete PDF - Missing Blob", test_delete_pdf_missing_blob_name),
        ("Delete PDF - Success", test_delete_pdf_success),
        ("Delete PDF - GCS Error", test_delete_pdf_gcs_error),
    ]

    passed = 0
    failed = 0

    for _, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print_fail(f"Unexpected error: {e}")
            import traceback

            traceback.print_exc()
            failed += 1

    # Summary
    print_section("Test Results")
    total = passed + failed
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"\nSuccess Rate: {(passed / total * 100):.1f}%\n")

    return failed == 0


if __name__ == "__main__":
    print("Starting GCS Helper Tests...")
    success = run_all_tests()
    sys.exit(0 if success else 1)
