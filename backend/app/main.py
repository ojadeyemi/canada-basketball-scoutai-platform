"""Main FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from config.settings import settings
from graph.graph import build_graph

from .routes import agent, auth, pages, pdf, search, sql


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages application lifespan, initializes and cleans up resources."""
    try:
        # Initialize Postgres checkpointer
        from .db.postgres import get_database_url

        database_url = get_database_url()
        print("🔄 Connecting to database...")

        async with AsyncPostgresSaver.from_conn_string(database_url) as checkpointer:
            print("🔄 Setting up checkpointer...")
            await checkpointer.setup()  # Create checkpointer tables if they don't exist
            app.state.checkpointer = checkpointer

            print("🔄 Building AI scouting graph...")
            app.state.scouting_graph = await build_graph(checkpointer)

            print("✅ AI scouting agent initialized successfully.")

            yield
    except Exception as e:
        print(f"🚨 Failed to initialize AI scouting agent: {e}")
        raise


# Create FastAPI app with custom lifespan handler
app = FastAPI(
    title="Canada Basketball AI Scouting System",
    description=(
        "AI-powered scouting platform for Canadian basketball talent identification. "
        "This API is currently in research preview and is being tested by Canada Basketball coaches and scouts."
    ),
    version="1.0.0",
    contact={
        "name": "OJ Adeyemi",
        "url": "https://ojadeyemi.github.io/",
        "email": "ojieadeyemi@gmail.com",
    },
    lifespan=lifespan,
)

# Enable CORS - supports both local development and production
if settings.environment == "development":
    allowed_origins = ["*"]
    allowed_origin_regex = None
else:
    allowed_origins = ["https://scout.northscore.ca"]
    if settings.frontend_url:
        allowed_origins.append(settings.frontend_url)
    allowed_origin_regex = r"https://canada-ai-scout-platform-web-\d+-[a-z0-9-]+\.run\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(agent.router)
app.include_router(search.router)
app.include_router(pdf.router)
app.include_router(pages.router)
app.include_router(sql.router)


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint."""
    return {"status": "UP", "service": "canada-basketball-api"}
