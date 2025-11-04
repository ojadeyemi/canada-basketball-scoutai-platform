"""LLM configuration with flexible model and temperature parameters."""

# from langchain_cohere import ChatCohere  # Future: Cohere support
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from config.settings import settings


def get_llm(
    model: str | None = None, temperature: float = 0.0, **kwargs
) -> BaseChatModel:
    """
    Get LLM instance with flexible multi-provider configuration.

    Auto-detects provider from model name or uses LLM_PROVIDER env var as fallback.
    Supports OpenAI, Google Gemini (Gemini 2.5 variants), and Cohere (future).

    Args:
    model: Model name (e.g., "gpt-4o-mini", "gemini-2.5-flash", "command-r").
               If None, uses LLM_PROVIDER env var to determine provider and default model.
        temperature: LLM temperature (0.0 = deterministic, 1.0 = creative)
        **kwargs: Additional parameters (e.g., max_tokens, top_p)

    Returns:
        Configured LLM instance (ChatOpenAI, ChatGoogleGenerativeAI, or ChatCohere)

    Examples:
    # Auto-detect OpenAI
    llm = get_llm(model="gpt-4o", temperature=0.7)

    # Auto-detect Google (Gemini 2.5)
    llm = get_llm(model="gemini-2.5-flash", temperature=0.3)

        # Use default provider from env var
        llm = get_llm(temperature=0.0)
    """
    # Auto-detect provider from model name
    if model:
        provider = _detect_provider_from_model(model)
    else:
        # Fallback to settings.llm_provider
        provider = settings.llm_provider.lower()

    # Provider-specific initialization
    if provider == "google":
        model_name = model or "gemini-2.5-flash"
        return ChatGoogleGenerativeAI(
            model=model_name, temperature=temperature, **kwargs
        )
    elif provider == "openai":
        model_name = model or "gpt-4o-mini"
        return ChatOpenAI(model=model_name, temperature=temperature, **kwargs)
    # elif provider == "cohere":
    #     default_model = os.getenv("DEFAULT_MODEL", "command-r")
    #     model_name = model or default_model
    #     return ChatCohere(model=model_name, temperature=temperature, **kwargs)
    else:
        raise ValueError(
            f"Unsupported LLM provider: {provider}. Use 'openai', 'google', or 'cohere'."
        )


def _detect_provider_from_model(model: str) -> str:
    """
    Auto-detect provider from model name.

    Args:
        model: Model name (e.g., "gpt-4o-mini", "gemini-2.5-flash", "command-r")

    Returns:
        Provider name ("openai", "google", or "cohere")

    Raises:
        ValueError: If model name doesn't match known patterns
    """
    model_lower = model.lower()

    # OpenAI models
    if model_lower.startswith(("gpt-", "o1-", "o3-")):
        return "openai"

    # Google Gemini models
    if model_lower.startswith("gemini"):
        return "google"

    # Cohere models (future support)
    # if model_lower.startswith(("command", "coral", "aya")):
    #     return "cohere"

    # Fallback to settings.llm_provider if model name is ambiguous
    return settings.llm_provider.lower()


# ===== TASK-SPECIFIC LLM PRESETS =====
# These are convenience functions for common tasks with recommended settings


def get_router_llm() -> BaseChatModel:
    """Get LLM for router node (fast, deterministic)."""
    return get_llm(model="gemini-2.5-flash", temperature=0.0)


def get_sql_llm() -> BaseChatModel:
    """Get LLM for SQL generation (powerful, deterministic)."""
    return get_llm(model="gemini-2.5-flash", temperature=0.0)


def get_scouting_llm(temperature: float = 0.3) -> BaseChatModel:
    """
    Get LLM for scouting report generation (powerful, slightly creative).

    Args:
        temperature: Default 0.3 for consistent but nuanced analysis
    """
    return get_llm(model="gemini-2.5-flash", temperature=temperature)


def get_html_parser_llm() -> BaseChatModel:
    """Get LLM for HTML parsing (fast, deterministic)."""
    return get_llm(model="gemini-2.5-flash", temperature=0.0)
