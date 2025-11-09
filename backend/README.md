# Canada Basketball ScoutAI - Backend

FastAPI + LangGraph multi-agent system for Canadian basketball scouting.

---

## Features

- **LangGraph Agent** – 5-node AI workflow (router, SQL agent, chart gen, text gen, scouting planner)
- **4 League Databases** – SQLite DBs for U SPORTS, CCAA, CEBL, HoopQueens (25K+ players)
- **NDJSON Streaming** – Real-time AI responses via Server-Sent Events
- **PDF Reports** – Automated scouting reports with Playwright
- **Custom Data Tools** – CEBL SDK, web scrapers, fuzzy search

---

## Quick Start

### Poetry (Recommended)

```bash
poetry install
poetry run playwright install chromium
poetry run uvicorn app.main:app --reload
```

**API Docs:** [http://localhost:8080/docs](http://localhost:8080/docs)

### Docker

```bash
cp .env.example .env  # Add API keys
docker build -t scoutai-backend .
docker run -p 8080:8080 --env-file .env scoutai-backend
```

**Health Check:** `curl http://localhost:8080/health`

---

## Environment Variables

Create `.env`:

```bash
# PostgreSQL (for session state)
DATABASE_URL=postgresql://user:pass@host:5432/canada_basketball

# LLM Providers (pick one or both)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=sk-your-openai-key
LLM_PROVIDER=google  # or "openai"

# Optional: PDF Storage
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GCS_BUCKET_NAME=scouting-reports

# App Config
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

For Docker, use `/app/service-account.json` for `GOOGLE_APPLICATION_CREDENTIALS`.

---

## API Endpoints

| Endpoint                           | Method | Description                |
| ---------------------------------- | ------ | -------------------------- |
| `/health`                          | GET    | Health check               |
| `/api/search/player`               | GET    | Fuzzy player search        |
| `/api/search/player/{league}/{id}` | GET    | Player details             |
| `/api/agent/chat`                  | POST   | AI chat (NDJSON streaming) |
| `/api/pdf/generate`                | POST   | Generate scouting report   |
| `/api/pdf/status/{job_id}`         | GET    | PDF job status             |

**Interactive Docs:** [http://localhost:8080/docs](http://localhost:8080/docs)

---

## Custom Data Engineering

**1. CEBL SDK** – Custom Python library for official CEBL API access (`graph/tools/cebl_sdk/`)

**2. U SPORTS Scraper** – AI-powered HTML parsing for biographical data (usportshoops.ca)

**3. Fuzzy Search** – rapidfuzz for typo-tolerant queries (e.g., "Xavier Mun" → "Xavier Moon")

**4. SQLite Databases** – 4 league DBs in `db/` folder:

- `usports.db` – University (2019-2024)
- `ccaa.db` – College (OCAA + PacWest)
- `cebl.db` – Professional (2019-2024)
- `hoopqueens.db` – Women's summer league

---

## LangGraph Architecture

**5-Node AI Workflow:**

```
User Query → Router → [SQL Agent | Chart Gen | Text Gen | Scouting Planner]
```

1. **Router** – Classifies intent (stats, comparison, bio, scouting)
2. **SQL Agent** – Queries 4 SQLite databases (25K+ players)
3. **Chart Generator** – Recommends visualizations (bar, line, table)
4. **Text Generator** – Fetches bio data via CEBL SDK or web scraper
5. **Scouting Planner** – Triggers 8-node sub-graph for PDF reports

**State Management:** PostgreSQL (LangGraph checkpointer for session persistence)

---

## Development

```bash
# Install package (poetry preferred)
poetry add package-name

# OR with pip
pip install package-name && pip freeze > requirements.txt

# Run tests
poetry run pytest tests/

# Database migrations
psql $DATABASE_URL < db/init.sql
```

---

## Deployment

### Google Cloud Run

```bash
docker build -t gcr.io/project-id/backend .
docker push gcr.io/project-id/backend
gcloud run deploy backend --image gcr.io/project-id/backend --memory 1Gi --timeout 300
```

---

## Tech Stack

| Tech                     | Version | Purpose                   |
| ------------------------ | ------- | ------------------------- |
| **Python**               | 3.13+   | Runtime                   |
| **FastAPI**              | 0.120+  | Web framework             |
| **LangGraph**            | 1.0+    | Multi-agent orchestration |
| **SQLite**               | -       | 4 league databases        |
| **PostgreSQL**           | -       | Session state             |
| **Playwright**           | 1.55+   | PDF rendering             |
| **Google Cloud Storage** | -       | PDF storage               |
| **Gemini / OpenAI**      | -       | LLMs                      |

---

## Troubleshooting

| Issue                 | Solution                                                 |
| --------------------- | -------------------------------------------------------- |
| Docker build fails    | Ensure `service-account.json` exists, 4GB+ Docker memory |
| Playwright errors     | `poetry run playwright install --with-deps chromium`     |
| DB connection timeout | Check `DATABASE_URL` has `sslmode=require`               |
| CORS errors           | Add domain to `allow_origins` in `app/main.py`           |

---

## License

MIT
