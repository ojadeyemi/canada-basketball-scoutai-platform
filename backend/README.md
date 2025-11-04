# Canada Basketball ScoutAI - Backend

FastAPI backend with LangGraph multi-agent AI orchestration for Canadian basketball scouting.

---

## Features

- **LangGraph Agent**: 5-node workflow (router, SQL agent, chart generator, text generator, scouting planner)
- **4 League Databases**: SQLite databases for U SPORTS, CCAA, CEBL, HoopQueens
- **NDJSON Streaming**: Real-time AI responses via Server-Sent Events
- **PDF Generation**: Automated scouting reports with Playwright
- **Custom Data Engineering**: Scrapers, CEBL SDK, fuzzy search

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Create .env.docker file (see Environment Variables below)
cp .env.example .env.docker

# 2. Build and run
docker build -t scoutai-backend .
docker run -p 8000:8000 --env-file .env.docker scoutai-backend

# 3. Test
curl http://localhost:8000/health
```

### Option 2: Local Development

```bash
# 1. Install dependencies
.venv/pip install -r requirements.txt

# 2. Install Playwright browsers
.venv/python -m playwright install chromium

# 3. Create .env file (see Environment Variables below)
cp .env.example .env

# 4. Run server
.venv/python -m uvicorn app.main:app --reload --port 8000
```

Access API docs: http://localhost:8000/docs

---

## Environment Variables

### For Docker (.env.docker)

Create `.env.docker` with:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/canada_basketball

# Google Cloud Storage (for PDFs)
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
GCS_BUCKET_NAME=scouting-reports

# LLM Providers
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=sk-your-openai-key
LLM_PROVIDER=google

# App Config
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000
ENVIRONMENT=production
LOG_LEVEL=INFO
```

### For Local Development (.env)

Same variables as above, but use local paths:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

---

## Docker Setup

### Build Image

```bash
docker build -t scoutai-backend .
```

### Run Container

```bash
# Basic run
docker run -p 8000:8000 --env-file .env.docker scoutai-backend

# With volume for local SQLite databases
docker run -p 8000:8000 \
  --env-file .env.docker \
  -v $(pwd)/db:/app/db \
  scoutai-backend

# With logs
docker run -p 8000:8000 --env-file .env.docker scoutai-backend --log-level debug
```

### Health Check

```bash
curl http://localhost:8000/health
```

---

## API Endpoints

### Search

```bash
# Fuzzy player search
GET /api/search/player?query=rhooms&league=cebl

# Player details
GET /api/search/player/{league}/{player_id}
```

### AI Agent

```bash
# Natural language queries (NDJSON streaming)
POST /api/agent/chat
Content-Type: application/json

{
  "user_input": "Top 5 CEBL scorers in 2024",
  "session_id": "uuid-here"
}
```

### PDF Reports

```bash
# Generate scouting report
POST /api/pdf/generate
{
  "player_id": "123",
  "league": "cebl"
}

# Check status
GET /api/pdf/status/{job_id}
```

---

## Data Engineering

### Custom Libraries & Tools

**1. CEBL SDK (Custom Python Library)**
- Official CEBL API wrapper
- Player profiles, statistics, team data
- Located in `graph/tools/cebl_sdk/`

**2. U SPORTS Web Scraper**
- POST requests to usportshoops.ca
- AI parsing to extract structured bio data
- Handles player name variations

**3. Fuzzy Search (rapidfuzz)**
- Typo-tolerant player queries
- Nickname matching (e.g., "RJ" → "R.J. Barrett")
- Cross-league search

**4. Database Automation**
- Seasonal data updates via cron jobs
- CSV ingestion for CCAA
- SQLite schema management

### League Databases

Located in `db/` folder:

- `usports.db` - University basketball (2019-2024)
- `ccaa.db` - College basketball (OCAA + PacWest)
- `cebl.db` - Professional league (2019-2024)
- `hoopqueens.db` - Women's 3x3 league

---

## Architecture

### LangGraph Workflow (5 Nodes)

```
User Query
    ↓
┌──────────────┐
│   ROUTER     │ (Intent classification)
└──────┬───────┘
       │
   ┌───┴────┬──────────┬──────────┐
   ▼        ▼          ▼          ▼
┌─────┐ ┌──────┐ ┌────────┐ ┌──────────┐
│ SQL │ │Chart │ │  Text  │ │ Scouting │
│Agent│ │ Gen  │ │  Gen   │ │ Planner  │
└─────┘ └──────┘ └────────┘ └──────────┘
```

**Node Descriptions:**
1. **Router**: Classifies intent (stats, comparison, bio, scouting)
2. **SQL Agent**: Executes database queries across 4 SQLite databases
3. **Chart Generator**: Recommends visualization (bar, line, table)
4. **Text Generator**: Fetches bio data via CEBL SDK or web scraper
5. **Scouting Planner**: Triggers 8-node sub-graph for PDF reports

---

## Development

### Install New Package

```bash
.venv/pip install package-name
.venv/pip freeze > requirements.txt
```

### Run Tests

```bash
.venv/python -m pytest tests/
```

### Database Migrations

```bash
# Initialize PostgreSQL schema
psql $DATABASE_URL < db/init.sql
```

---

## Deployment

### Google Cloud Run

```bash
# Build and push
docker build -t gcr.io/project-id/scoutai-backend .
docker push gcr.io/project-id/scoutai-backend

# Deploy
gcloud run deploy scoutai-backend \
  --image gcr.io/project-id/scoutai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300 \
  --set-env-vars "DATABASE_URL=postgresql://...,GCS_BUCKET_NAME=reports"
```

---

## Troubleshooting

**Docker build fails**
- Ensure `service-account.json` exists in root directory
- Check Docker has enough memory (4GB+ recommended for Playwright)

**Playwright PDF errors**
- Run: `playwright install --with-deps chromium`
- Check `--disable-dev-shm-usage` flag in Chromium options

**Database connection timeout**
- Verify `DATABASE_URL` has `sslmode=require` for Railway
- Check PostgreSQL is accessible from container

**CORS errors**
- Add production domain to `allow_origins` in `app/main.py`

---

## Tech Stack

- **Python 3.12** (Bookworm base image)
- **FastAPI 0.115+** (async web framework)
- **LangGraph 1.0+** (AI orchestration)
- **SQLite** (league databases)
- **PostgreSQL** (session state)
- **Playwright 1.55+** (PDF rendering)
- **Google Cloud Storage** (PDF storage)
- **OpenAI / Gemini** (LLMs)

---

## License

MIT
