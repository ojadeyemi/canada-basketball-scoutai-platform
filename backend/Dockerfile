FROM python:3.12-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=./

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright with Chromium browser and system dependencies
RUN pip install playwright==1.55.0 && \
    playwright install --with-deps chromium

# Copy service account credentials
COPY service-account.json .

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p app/static db pdf pdfs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=180s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
