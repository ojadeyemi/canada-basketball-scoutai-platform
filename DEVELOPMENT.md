# 🛠️ Development & Setup Guide

This guide provides instructions for setting up, configuring, and understanding the technical architecture of the ScoutAI platform.

---

## Quick Start

### Prerequisites

- Docker (recommended) **OR** Python 3.13+ and Node.js 18+
- Cohere API key (default) – [Get your free key](https://cohere.com)
- Google Gemini API key (recommended for stats/scouting) – [Get your free key](https://ai.google.dev/)

### Option 1: Docker Compose (Fastest)

```bash
# Clone and configure
git clone https://github.com/ojadeyemi/canada-basketball-scoutai-platform.git
cd canada-basketball-scoutai-platform
cp .env.example .env.local  # Add your API keys

# Start all services
docker-compose -f docker-compose.local.yml up --build
```

**Access:**

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option 2: Local Development

```bash
# Backend (with poetry)
cd backend
poetry install
poetry run python -m playwright install chromium
poetry run uvicorn app.main:app --reload

# Frontend
cd frontend
pnpm install && pnpm dev
```

**Access:**

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)

---

## How It Works

```
User Query → LangGraph AI Agent → Multi-League SQLite DBs → Real-Time Response
```

1. **Ask in plain English** – "Top CEBL scorers with 20+ PER in 2024"
2. **AI Router classifies intent** – Stats query, comparison, scouting report?
3. **SQL Agent queries 4 leagues** – U SPORTS, CCAA, CEBL, HoopQueens (25K+ players)
4. **AI generates insights** – Charts, text summaries, PDF reports
5. **Stream results in real-time** – Watch the AI think via NDJSON streaming

**Tech:** LangGraph (multi-agent orchestration), FastAPI, React, PostgreSQL (session state), SQLite (league data)

---

## Tech Stack

| Layer                | Tech                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| **AI Orchestration** | LangGraph 1.0 (multi-agent workflows)                                                   |
| **Backend**          | FastAPI 0.120, Python 3.13, Playwright (PDF rendering)                                  |
| **Frontend**         | React 18, TypeScript 5.9, Vite 5.4, TailwindCSS 3.4                                     |
| **Data**             | SQLite (4 league DBs), PostgreSQL (sessions), rapidfuzz (fuzzy search)                  |
| **LLM Provider**     | Cohere (default: command-a-03-2025), Google Gemini (recommended: 2.5-flash/pro), OpenAI |
| **Deployment**       | Docker, Google Cloud Run, Vercel                                                        |

---

## Data Coverage

**4 Canadian Leagues (25,000+ Players)**

- **U SPORTS** – 60+ university programs (2019-2024 seasons)
- **CCAA** – College basketball (OCAA + PacWest conferences)
- **CEBL** – Canadian Elite Basketball League (professional, 2019-2024)
- **HoopQueens** – Women's professional summer league

**Custom Data Engineering:**

- Built a custom [CEBL SDK](https://github.com/ojadeyemi/cebl-sdk) (Python library) for official API access
- Built a [usports](https://github.com/ojadeyemi/usports) (Python library) for U SPORTS data   
- Built [Hoopqueens official data infrastructure](https://github.com/ojadeyemi/hoopqueens) to automate data collection by  extracting raw box score data and stores it in a database 

---

## Configuration

See [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md) for environment setup and LLM provider configuration.
