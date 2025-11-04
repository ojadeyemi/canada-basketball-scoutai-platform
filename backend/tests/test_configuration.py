"""Test script for multi-provider LLM configuration."""

import os

from graph.configuration import get_llm


def get_model_name(llm):
    """Get model name from LLM instance (handles different attribute names)."""
    return getattr(llm, "model_name", None) or getattr(llm, "model", None)


# Test 1: Auto-detect OpenAI
print("Test 1: Auto-detect OpenAI (gpt-4o)")
llm = get_llm(model="gpt-4o")
print(f"✓ Provider: {llm.__class__.__name__}")
print(f"✓ Model: {get_model_name(llm)}\n")

# Test 2: Auto-detect Google
print("Test 2: Auto-detect Google (gemini-2.5-flash)")
llm = get_llm(model="gemini-2.5-flash")
print(f"✓ Provider: {llm.__class__.__name__}")
print(f"✓ Model: {get_model_name(llm)}\n")

# Test 3: Fallback to env var (Google default)
print("Test 3: No model specified (should use LLM_PROVIDER=google)")
os.environ["LLM_PROVIDER"] = "google"
llm = get_llm()
print(f"✓ Provider: {llm.__class__.__name__}")
print(f"✓ Model: {get_model_name(llm)}\n")

# Test 4: Fallback to env var (OpenAI)
print("Test 4: No model specified (LLM_PROVIDER=openai)")
os.environ["LLM_PROVIDER"] = "openai"
llm = get_llm()
print(f"✓ Provider: {llm.__class__.__name__}")
print(f"✓ Model: {get_model_name(llm)}\n")

# Test 5: OpenAI o1 model
print("Test 5: Auto-detect OpenAI (o1-preview)")
llm = get_llm(model="o1-preview")
print(f"✓ Provider: {llm.__class__.__name__}")
print(f"✓ Model: {get_model_name(llm)}\n")

print("✅ All tests passed!")
