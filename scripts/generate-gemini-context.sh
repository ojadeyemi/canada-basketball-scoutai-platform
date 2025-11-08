#!/bin/bash

# This script generates the GEMINI.md file for the project.

cat << EOF > GEMINI.md
# Canada Basketball ScoutAI Platform

## Project Overview

This project is an AI-powered scouting platform for Canadian basketball. It allows users to ask natural language questions about players and receive instant insights, including stats, charts, and AI-generated scouting reports. The platform covers over 25,000 players from U SPORTS, CCAA, CEBL, and HoopQueens.

The application is composed of a React frontend and a Python backend using FastAPI. The AI capabilities are powered by Cohere and Google Gemini, with LangGraph used for multi-agent orchestration. The backend uses SQLite for league data and PostgreSQL for session state.

## Building and Running

The recommended way to build and run the project is using Docker Compose.

### Prerequisites

*   Docker
*   Cohere API key
*   Google Gemini API key

### Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ojadeyemi/canada-basketball-scoutai-platform.git
    cd canada-basketball-scoutai-platform
    ```

2.  **Configure environment variables:**
    ```bash
    cp .env.example .env
    ```
    Add your Cohere and Google Gemini API keys to the `.env` file.

3.  **Start the application:**
    ```bash
    docker-compose -f docker-compose.local.yml up --build
    ```

### Access

*   **Frontend:** [http://localhost](http://localhost)
*   **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)

## Development Conventions

*   **Backend:** The backend is a FastAPI application. The main entry point is `backend/app/main.py`. It uses Poetry for dependency management.
*   **Frontend:** The frontend is a React application built with Vite. The main entry point is `frontend/src/App.tsx`. It uses pnpm for package management.
*   **Testing:** The project includes backend tests using pytest. Run tests with `cd backend && poetry run pytest`.
*   **Linting:** The project uses ruff for Python linting. Run the linter with `cd backend && poetry run ruff check .`. The frontend uses ESLint, which can be run with `cd frontend && pnpm lint`.
EOF