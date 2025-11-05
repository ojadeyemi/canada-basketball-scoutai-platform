"""LLM configuration."""

from langchain_cohere import ChatCohere
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from config.settings import settings


def get_llm(
    model: str | None = None, temperature: float = 0.0, **kwargs
) -> BaseChatModel:
    """Get LLM instance with flexible multi-provider configuration."""
    # Use provided model or fallback to default
    model_name = model or settings.default_model
    provider = _detect_provider_from_model(model_name)

    # Provider-specific initialization
    if provider == "google":
        return ChatGoogleGenerativeAI(
            model=model_name, temperature=temperature, **kwargs
        )
    elif provider == "openai":
        return ChatOpenAI(model=model_name, temperature=temperature, **kwargs)
    elif provider == "cohere":
        return ChatCohere(model=model_name, temperature=temperature, **kwargs)
    else:
        raise ValueError(
            f"Unsupported LLM provider: {provider}. Use 'openai', 'google', or 'cohere'."
        )


def _detect_provider_from_model(model: str) -> str:
    """Auto-detect provider from model name."""
    model_lower = model.lower()

    if model_lower.startswith(("gpt-", "o1-", "o3-")):
        return "openai"
    if model_lower.startswith("gemini"):
        return "google"
    if model_lower.startswith(("command", "c4ai", "aya")):
        return "cohere"

    raise ValueError(f"Cannot detect provider from model: {model}")


def get_router_llm() -> BaseChatModel:
    """Get LLM for router node."""
    return get_llm(model=settings.routing_model, temperature=0.0)


def get_sql_llm() -> BaseChatModel:
    """Get LLM for SQL generation."""
    return get_llm(model=settings.sql_model, temperature=0.0)


def get_scouting_llm(temperature: float = 0.3) -> BaseChatModel:
    """Get LLM for scouting report generation."""
    return get_llm(model=settings.scouting_model, temperature=temperature)


def get_html_parser_llm() -> BaseChatModel:
    """Get LLM for HTML parsing."""
    return get_llm(model=settings.html_parser_model, temperature=0.0)
