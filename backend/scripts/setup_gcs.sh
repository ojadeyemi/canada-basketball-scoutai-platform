#!/bin/bash
# Setup Google Cloud Storage for PDF scouting reports
# Run this once to create the bucket and set permissions

set -e  # Exit on error

echo "========================================"
echo "  GCS Setup for Canada Basketball API  "
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "Please create .env with:"
    echo "  GCS_BUCKET_NAME=canada-basketball-scouting-reports"
    echo "  GOOGLE_APPLICATION_CREDENTIALS=./service-account.json"
    exit 1
fi

# Source .env
export $(cat .env | grep -v '^#' | xargs)

# Check if bucket name is set
if [ -z "$GCS_BUCKET_NAME" ]; then
    echo "❌ GCS_BUCKET_NAME not set in .env"
    exit 1
fi

echo "📦 Bucket name: $GCS_BUCKET_NAME"
echo ""

# Check if service account exists
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "❌ GOOGLE_APPLICATION_CREDENTIALS not set in .env"
    exit 1
fi

if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "❌ Service account file not found: $GOOGLE_APPLICATION_CREDENTIALS"
    echo ""
    echo "Please download service account JSON from GCP Console:"
    echo "  1. Go to IAM & Admin → Service Accounts"
    echo "  2. Create service account (or use existing)"
    echo "  3. Grant roles:"
    echo "     - Storage Object Admin"
    echo "     - Service Account Token Creator"
    echo "  4. Create key → JSON → Download"
    echo "  5. Save as: $GOOGLE_APPLICATION_CREDENTIALS"
    exit 1
fi

echo "✅ Service account found: $GOOGLE_APPLICATION_CREDENTIALS"
echo ""

# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="$GOOGLE_APPLICATION_CREDENTIALS"

# Check if gsutil is installed
if ! command -v gsutil &> /dev/null; then
    echo "❌ gsutil not found"
    echo "Please install Google Cloud SDK:"
    echo "  https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gsutil found"
echo ""

# Check if bucket exists
echo "🔍 Checking if bucket exists..."
if gsutil ls "gs://$GCS_BUCKET_NAME" &> /dev/null; then
    echo "✅ Bucket already exists: gs://$GCS_BUCKET_NAME"
else
    echo "📦 Creating bucket: gs://$GCS_BUCKET_NAME"

    # Create bucket (adjust region as needed)
    gsutil mb -l us-central1 "gs://$GCS_BUCKET_NAME"

    echo "✅ Bucket created successfully"
fi

echo ""

# Set lifecycle policy to auto-delete old PDFs (optional)
echo "🔄 Setting lifecycle policy (auto-delete PDFs after 30 days)..."

cat > /tmp/lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 30,
          "matchesPrefix": ["scouting-reports/", "test-uploads/"]
        }
      }
    ]
  }
}
EOF

gsutil lifecycle set /tmp/lifecycle.json "gs://$GCS_BUCKET_NAME"
rm /tmp/lifecycle.json

echo "✅ Lifecycle policy set (30 day retention)"
echo ""

# Check permissions
echo "🔐 Verifying permissions..."

# Try to upload test file
echo "test" > /tmp/gcs-test.txt
if gsutil cp /tmp/gcs-test.txt "gs://$GCS_BUCKET_NAME/test-uploads/setup-test.txt" &> /dev/null; then
    echo "✅ Upload permission verified"

    # Try to generate signed URL
    if gsutil signurl -d 1h "$GOOGLE_APPLICATION_CREDENTIALS" "gs://$GCS_BUCKET_NAME/test-uploads/setup-test.txt" &> /dev/null; then
        echo "✅ Signed URL permission verified"
    else
        echo "⚠️  Signed URL generation failed"
        echo "   Service account needs: Service Account Token Creator role"
    fi

    # Clean up test file
    gsutil rm "gs://$GCS_BUCKET_NAME/test-uploads/setup-test.txt" &> /dev/null
    echo "✅ Delete permission verified"
else
    echo "❌ Upload failed - check service account permissions"
    exit 1
fi

rm /tmp/gcs-test.txt

echo ""
echo "========================================"
echo "  ✅ GCS Setup Complete!"
echo "========================================"
echo ""
echo "Your bucket is ready:"
echo "  📦 gs://$GCS_BUCKET_NAME"
echo ""
echo "Test it:"
echo "  python tests/test_gcs_integration.py"
echo ""
