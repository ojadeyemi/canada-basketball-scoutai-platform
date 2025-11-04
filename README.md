# Canada Basketball ScoutAI Platform

AI-powered scouting system for Canadian basketball talent identification across 4 leagues (U SPORTS, CCAA, CEBL, HoopQueens). Built with natural language queries, automated PDF reports, and cross-league player tracking.

---

## Features

- **Natural Language Queries**: Ask questions like "Top 5 CEBL scorers in 2024" and get instant results
- **Automated Scouting Reports**: AI-generated PDF reports with strengths, weaknesses, and national team fit
- **Player Search**: Fuzzy search across 25,000+ players with interactive charts
- **Multi-League Coverage**: U SPORTS, CCAA, CEBL, HoopQueens (men's and women's programs)
- **Real-Time Streaming**: Watch AI analyze data in real-time via NDJSON streaming

---

## Quick Start

### Prerequisites

- **Docker** (recommended) OR Python 3.11+ and Node.js 18+
- **Google Cloud Storage** (optional, for PDF storage)

### Option 1: Docker Compose (Recommended)

Run everything locally with PostgreSQL, backend, and frontend:

```bash
# Clone repository
git clone https://github.com/your-org/canada-basketball-scoutai-platform.git
cd canada-basketball-scoutai-platform

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Start all services (PostgreSQL + Backend + Frontend)
docker-compose -f docker-compose.local.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.local.yml up -d --build

# Stop all services
docker-compose -f docker-compose.local.yml down
```

Access:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

### Option 2: Frontend Dev Mode (Backend + Postgres via Docker)

Run backend and database in Docker, frontend with hot reload:

```bash
# Start backend + PostgreSQL
docker-compose -f docker-compose.local.yml up postgres backend -d

# Run frontend locally with hot reload
cd frontend
pnpm install
pnpm dev
# Frontend: http://localhost:3000
```

### Option 3: Full Local Development

```bash
# Backend
cd backend
.venv/pip install -r requirements.txt
.venv/python -m uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
pnpm install
pnpm dev
```

Access:
- **Frontend**: http://localhost:3000 (dev)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Architecture

```
┌─────────────────────────┐
│   React Frontend        │
│   (Vite + TypeScript)   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   FastAPI Backend       │
│   (LangGraph Agent)     │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
┌─────────┐   ┌──────────┐
│ SQLite  │   │PostgreSQL│
│4 Leagues│   │ (State)  │
└─────────┘   └──────────┘
```

For detailed architecture, see [backend/README.md](./backend/README.md)

---

## Tech Stack

**Backend**
- Python 3.12 + FastAPI 0.115+
- LangGraph 1.0 (multi-agent AI orchestration)
- SQLite (4 league databases)
- PostgreSQL (session persistence)
- Playwright (PDF rendering)
- Google Cloud Storage

**Frontend**
- React 18 + TypeScript 5.9
- Vite 5.4 (build tool)
- TanStack Query 5.90 (data fetching)
- Recharts 2.15 (charts)
- Tailwind CSS 3.4 + shadcn/ui

**AI/LLM**
- Google Gemini 2.0 Flash (primary)
- OpenAI GPT-4o (secondary)

---

## Project Structure

```
canada-basketball-scoutai-platform/
├── backend/               # FastAPI + LangGraph agent
│   ├── app/              # API routes + services
│   ├── graph/            # LangGraph nodes + tools
│   ├── db/               # SQLite databases (4 leagues)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
└── README.md
```

---

## Data Sources

### Leagues
- **U SPORTS**: Canadian university basketball (60+ schools)
- **CCAA**: Canadian college basketball (OCAA + PacWest)
- **CEBL**: Canadian Elite Basketball League (professional)
- **HoopQueens**: Women's professional 3x3 league

### Data Engineering
- **Custom scrapers** for U SPORTS biographical data
- **CEBL SDK** (custom Python library) for official API access
- **AI parsing** to extract structured data from HTML
- **Fuzzy search** with rapidfuzz for typo-tolerant queries

---

## Environment Variables

See [backend/README.md](./backend/README.md) for complete environment setup.

**Key Variables:**
```bash
DATABASE_URL=postgresql://...
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GCS_BUCKET_NAME=scouting-reports
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

---

## Documentation

- [Backend README](./backend/README.md) - API setup, data engineering, Docker
- [Frontend README](./frontend/README.md) - React app setup, build process

---

## License

MIT License

---

## Contact

For questions or collaboration:
- **Email**: ojieadeyemi@gmail.com
- **GitHub**: https://github.com/ojadeyemi/canada-basketball-scoutai-platform
