#!/usr/bin/env python3
"""
Integration tests for Google Cloud Storage with real bucket.

Prerequisites:
    1. Set GOOGLE_APPLICATION_CREDENTIALS in .env
    2. Set GCS_BUCKET_NAME in .env
    3. Service account must have:
       - Storage Object Admin (roles/storage.objectAdmin)
       - Service Account Token Creator (roles/iam.serviceAccountTokenCreator)

Usage:
    python tests/test_gcs_integration.py

Note: These tests require actual GCS access and will upload/delete real files.
"""

import os
import sys
import tempfile
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from graph.utils.gcs_helpers import (
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


def print_info(message: str):
    """Print info message."""
    print(f"  ℹ️  {message}")


def check_gcs_setup():
    """Check if GCS is properly configured."""
    print_test("Checking GCS configuration")

    # Check GOOGLE_APPLICATION_CREDENTIALS
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not creds_path:
        print_fail("GOOGLE_APPLICATION_CREDENTIALS not set in environment")
        print_info("Add to .env: GOOGLE_APPLICATION_CREDENTIALS=./service-account.json")
        return False

    if not Path(creds_path).exists():
        print_fail(f"Service account file not found: {creds_path}")
        return False

    print_pass(f"Service account found: {creds_path}")

    # Check GCS_BUCKET_NAME
    bucket_name = os.getenv("GCS_BUCKET_NAME", "canada-basketball-scouting-reports")
    print_pass(f"Bucket name: {bucket_name}")

    return True


def test_upload_pdf_to_real_bucket():
    """Test uploading a PDF to real GCS bucket."""
    print_test("Upload PDF to real GCS bucket")

    # Create temporary test PDF
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(b"%PDF-1.4\n%Test PDF content\n%%EOF")
        test_pdf = tmp.name

    try:
        print_info(f"Created test PDF: {test_pdf}")

        # Upload with test prefix
        destination = "test-uploads/test-integration.pdf"
        print_info(f"Uploading to: {destination}")

        gcs_path = upload_pdf_to_gcs(test_pdf, destination_blob_name=destination)

        bucket_name = os.getenv("GCS_BUCKET_NAME", "canada-basketball-scouting-reports")
        expected = f"gs://{bucket_name}/{destination}"

        if gcs_path == expected:
            print_pass(f"Upload successful: {gcs_path}")
            return True, gcs_path
        else:
            print_fail(f"Expected {expected}, got {gcs_path}")
            return False, None

    except Exception as e:
        print_fail(f"Upload error: {e}")
        return False, None

    finally:
        # Clean up local file
        Path(test_pdf).unlink(missing_ok=True)


def test_generate_signed_url_real(gcs_path: str):
    """Test generating signed URL for real GCS file."""
    print_test("Generate signed URL for uploaded file")

    try:
        print_info(f"Generating signed URL for: {gcs_path}")

        # Generate URL with 1 hour expiration
        signed_url = generate_signed_url(gcs_path, expiration_hours=1)

        # Verify URL format
        if not signed_url.startswith("https://storage.googleapis.com/"):
            print_fail(f"Invalid URL format: {signed_url[:100]}")
            return False

        print_pass(f"Signed URL generated (expires in 1 hour)")
        print_info(f"URL: {signed_url[:80]}...")

        # Try to fetch the URL to verify it works
        try:
            import urllib.request

            print_info("Verifying URL is accessible...")
            req = urllib.request.Request(signed_url, method="HEAD")
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    print_pass("URL is accessible and returns 200 OK")
                    return True
                else:
                    print_fail(f"URL returned status {response.status}")
                    return False

        except Exception as fetch_error:
            print_fail(f"Failed to fetch URL: {fetch_error}")
            return False

    except Exception as e:
        print_fail(f"Signed URL generation error: {e}")
        return False


def test_delete_pdf_from_real_bucket(gcs_path: str):
    """Test deleting PDF from real GCS bucket."""
    print_test("Delete PDF from real GCS bucket")

    try:
        print_info(f"Deleting: {gcs_path}")

        result = delete_pdf_from_gcs(gcs_path)

        if result:
            print_pass("PDF deleted successfully")
            return True
        else:
            print_fail("Delete operation returned False")
            return False

    except Exception as e:
        print_fail(f"Delete error: {e}")
        return False


def test_upload_with_default_blob_name():
    """Test upload with auto-generated blob name."""
    print_test("Upload with default blob name (auto-generated)")

    # Create temporary test PDF
    with tempfile.NamedTemporaryFile(
        suffix=".pdf", delete=False, prefix="test-report-"
    ) as tmp:
        tmp.write(b"%PDF-1.4\n%Test content\n%%EOF")
        test_pdf = tmp.name

    try:
        filename = Path(test_pdf).name
        print_info(f"Test file: {filename}")

        # Upload without specifying destination (uses default)
        gcs_path = upload_pdf_to_gcs(test_pdf)

        # Should be uploaded to scouting-reports/{filename}
        bucket_name = os.getenv("GCS_BUCKET_NAME", "canada-basketball-scouting-reports")
        expected_path = f"gs://{bucket_name}/scouting-reports/{filename}"

        if gcs_path == expected_path:
            print_pass(f"Auto-generated path correct: {gcs_path}")

            # Clean up
            delete_pdf_from_gcs(gcs_path)
            print_info("Cleaned up test file")
            return True
        else:
            print_fail(f"Expected {expected_path}, got {gcs_path}")
            # Try to clean up anyway
            delete_pdf_from_gcs(gcs_path)
            return False

    except Exception as e:
        print_fail(f"Error: {e}")
        return False

    finally:
        Path(test_pdf).unlink(missing_ok=True)


def test_signed_url_expiration_times():
    """Test different signed URL expiration times."""
    print_test("Test various signed URL expiration times")

    # Create temporary test PDF
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(b"%PDF-1.4\n%Expiration test\n%%EOF")
        test_pdf = tmp.name

    try:
        # Upload
        destination = "test-uploads/test-expiration.pdf"
        gcs_path = upload_pdf_to_gcs(test_pdf, destination_blob_name=destination)
        print_info(f"Uploaded: {gcs_path}")

        # Test different expiration times
        expirations = [
            (1, "1 hour"),
            (24, "24 hours (1 day)"),
            (168, "168 hours (1 week)"),
        ]

        all_passed = True

        for hours, description in expirations:
            try:
                print_info(f"Testing expiration: {description}")
                signed_url = generate_signed_url(gcs_path, expiration_hours=hours)

                if signed_url and signed_url.startswith(
                    "https://storage.googleapis.com/"
                ):
                    print_pass(f"✓ {description}")
                else:
                    print_fail(f"✗ {description}")
                    all_passed = False

            except Exception as e:
                print_fail(f"✗ {description}: {e}")
                all_passed = False

        # Clean up
        delete_pdf_from_gcs(gcs_path)
        print_info("Cleaned up test file")

        return all_passed

    except Exception as e:
        print_fail(f"Error: {e}")
        return False

    finally:
        Path(test_pdf).unlink(missing_ok=True)


def test_large_pdf_upload():
    """Test uploading a larger PDF file (simulates real scouting report)."""
    print_test("Upload larger PDF file (~100KB)")

    # Create a larger test PDF
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        # Write PDF header
        tmp.write(b"%PDF-1.4\n")

        # Add some dummy content to make it ~100KB
        dummy_content = b"Test content " * 1000
        for _ in range(10):
            tmp.write(dummy_content)

        tmp.write(b"\n%%EOF")
        test_pdf = tmp.name

    try:
        file_size = Path(test_pdf).stat().st_size
        print_info(f"Test PDF size: {file_size:,} bytes ({file_size / 1024:.1f} KB)")

        destination = "test-uploads/test-large-file.pdf"
        print_info(f"Uploading to: {destination}")

        gcs_path = upload_pdf_to_gcs(test_pdf, destination_blob_name=destination)

        print_pass(f"Large file uploaded: {gcs_path}")

        # Verify with signed URL
        signed_url = generate_signed_url(gcs_path, expiration_hours=1)
        print_info(f"Generated signed URL: {signed_url[:80]}...")

        # Clean up
        delete_pdf_from_gcs(gcs_path)
        print_info("Cleaned up test file")

        return True

    except Exception as e:
        print_fail(f"Error: {e}")
        return False

    finally:
        Path(test_pdf).unlink(missing_ok=True)


def test_error_handling():
    """Test error handling for invalid operations."""
    print_test("Test error handling")

    all_passed = True

    # Test 1: Try to delete non-existent file
    print_info("Test 1: Delete non-existent file")
    fake_path = "gs://canada-basketball-scouting-reports/fake/nonexistent.pdf"
    result = delete_pdf_from_gcs(fake_path)
    if result is False:
        print_pass("✓ Returns False for non-existent file")
    else:
        print_fail("✗ Should return False for non-existent file")
        all_passed = False

    # Test 2: Try to generate signed URL for non-existent file
    print_info("Test 2: Generate signed URL for non-existent file")
    try:
        # This might succeed (signed URLs don't verify file exists)
        # or fail depending on permissions
        signed_url = generate_signed_url(fake_path, expiration_hours=1)
        print_pass("✓ Generated signed URL (even for non-existent file)")
    except Exception:
        print_pass("✓ Raised exception for non-existent file")

    # Test 3: Try to upload non-existent local file
    print_info("Test 3: Upload non-existent local file")
    try:
        upload_pdf_to_gcs("/fake/path/nonexistent.pdf")
        print_fail("✗ Should raise FileNotFoundError")
        all_passed = False
    except FileNotFoundError:
        print_pass("✓ FileNotFoundError raised as expected")
    except Exception as e:
        print_fail(f"✗ Wrong exception: {type(e).__name__}")
        all_passed = False

    return all_passed


def run_all_integration_tests():
    """Run all integration tests with real GCS bucket."""
    print_section("GCS Integration Tests (Real Bucket)")
    print("WARNING: These tests use actual GCS resources")
    print("Files will be uploaded to test-uploads/ folder and then deleted\n")

    # Check setup first
    if not check_gcs_setup():
        print_section("Setup Failed")
        print("❌ GCS is not properly configured")
        print("\nPlease ensure:")
        print("  1. GOOGLE_APPLICATION_CREDENTIALS is set")
        print("  2. Service account JSON file exists")
        print("  3. Service account has required permissions")
        return False

    print_pass("GCS configuration verified")

    # Run tests
    tests = [
        ("Upload PDF", test_upload_with_default_blob_name),
        ("Signed URL Expiration Times", test_signed_url_expiration_times),
        ("Large PDF Upload", test_large_pdf_upload),
        ("Error Handling", test_error_handling),
    ]

    passed = 0
    failed = 0
    gcs_path = None

    # Special test: Upload → Generate URL → Delete (full workflow)
    print_section("Full Workflow Test: Upload → Sign → Delete")
    success, gcs_path = test_upload_pdf_to_real_bucket()
    if success and gcs_path:
        passed += 1
        if test_generate_signed_url_real(gcs_path):
            passed += 1
        else:
            failed += 1

        if test_delete_pdf_from_real_bucket(gcs_path):
            passed += 1
        else:
            failed += 1
    else:
        failed += 3

    # Run other tests
    for name, test_func in tests:
        print_section(f"Test: {name}")
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
    print_section("Integration Test Results")
    total = passed + failed
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"\nSuccess Rate: {(passed / total * 100):.1f}%")

    if failed == 0:
        print("\n🎉 All integration tests passed!")
        print("✅ GCS upload/download/delete working correctly")
        print("✅ Signed URLs are accessible")
        print("✅ Error handling works as expected")
    else:
        print("\n⚠️  Some tests failed - check output above")

    return failed == 0


if __name__ == "__main__":
    print("Starting GCS Integration Tests...")
    print("This will use your real GCS bucket!\n")

    success = run_all_integration_tests()
    sys.exit(0 if success else 1)
