"""Main FastAPI application entry point."""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from config.settings import settings
from graph.graph import build_graph

from .routes import agent, pages, pdf, search


async def refresh_agent_periodically(app: FastAPI):
    """Periodically refreshes the AI agent and credentials."""
    while True:
        await asyncio.sleep(60 * 60 * 4)  # Refresh every 4 hours
        try:
            app.state.scouting_graph = await build_graph(app.state.checkpointer)
            print("✅ AI scouting agent refreshed successfully.")
        except Exception as e:
            print(f"🚨 Failed to refresh AI agent: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages application lifespan, initializes and cleans up resources."""
    # Initialize Postgres checkpointer
    from .db.postgres import get_database_url

    database_url = get_database_url()

    async with AsyncPostgresSaver.from_conn_string(database_url) as checkpointer:
        await checkpointer.setup()  # Create checkpointer tables if they don't exist
        app.state.checkpointer = checkpointer
        app.state.scouting_graph = await build_graph(checkpointer)

        print("✅ AI scouting agent initialized successfully.")

        # Start background refresh task
        task = asyncio.create_task(refresh_agent_periodically(app))

        try:
            yield
        finally:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                print("🔄 AI agent refresh task cancelled.")


# Create FastAPI app with custom lifespan handler
app = FastAPI(
    title="Canada Basketball AI Scouting System",
    description="AI-powered scouting platform for Canadian basketball talent identification",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS - supports both local development and production
allowed_origins = (
    ["*"]
    if settings.environment == "development"
    else [
        settings.frontend_url,
        "https://canada-basketball.com",  # Add production domains here
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(agent.router)
app.include_router(search.router)
app.include_router(pdf.router)
app.include_router(pages.router)


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint."""
    return {"status": "UP", "service": "canada-basketball-api"}
