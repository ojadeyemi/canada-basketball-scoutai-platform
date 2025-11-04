#!/bin/bash
# Cleanup test files from GCS bucket
# This removes all files in the test-uploads/ folder

set -e

echo "========================================"
echo "  GCS Test Files Cleanup"
echo "========================================"
echo ""

# Check if .env exists and source it
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

export $(cat .env | grep -v '^#' | xargs)

# Check bucket name
if [ -z "$GCS_BUCKET_NAME" ]; then
    echo "❌ GCS_BUCKET_NAME not set in .env"
    exit 1
fi

echo "📦 Bucket: $GCS_BUCKET_NAME"
echo "🗑️  Target folder: test-uploads/"
echo ""

# List test files
echo "Finding test files..."
test_files=$(gsutil ls "gs://$GCS_BUCKET_NAME/test-uploads/**" 2>/dev/null || echo "")

if [ -z "$test_files" ]; then
    echo "✅ No test files found - bucket is clean"
    exit 0
fi

echo "Found test files:"
echo "$test_files" | sed 's/^/  - /'
echo ""

# Count files
file_count=$(echo "$test_files" | wc -l | tr -d ' ')
echo "Total: $file_count file(s)"
echo ""

# Confirm deletion
read -p "Delete all test files? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Deleting test files..."
    gsutil -m rm "gs://$GCS_BUCKET_NAME/test-uploads/**"
    echo "✅ Test files deleted successfully"
else
    echo "❌ Cancelled - no files deleted"
    exit 1
fi

echo ""
echo "========================================"
echo "  Cleanup Complete"
echo "========================================"
