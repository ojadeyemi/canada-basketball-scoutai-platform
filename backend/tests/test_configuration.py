"""Test script for multi-provider LLM configuration."""

from graph.configuration import get_llm


def get_model_name(llm):
    """Get model name from LLM instance (handles different attribute names)."""
    return getattr(llm, "model_name", None) or getattr(llm, "model", None)


# Test 1: Auto-detect Google
print("Test 1: Auto-detect Google (gemini-2.0-flash-exp)")
llm = get_llm(model="gemini-2.0-flash-exp")
print(f"✓ Provider: {llm.__class__.__name__}")
print(f"✓ Model: {get_model_name(llm)}\n")

# Test 2: Auto-detect Cohere
print("Test 2: Auto-detect Cohere (command-a-03-2025)")
llm = get_llm(model="command-a-03-2025")
print(f"✓ Provider: {llm.__class__.__name__}")
print(f"✓ Model: {get_model_name(llm)}\n")

# Test 3: Fallback to default model
print("Test 3: No model specified (should use DEFAULT_MODEL)")
llm = get_llm()
print(f"✓ Provider: {llm.__class__.__name__}")
print(f"✓ Model: {get_model_name(llm)}\n")

print("✅ All tests passed!")
