"""Pytest configuration / shared fixtures."""
import os
import sys
from pathlib import Path

# Ensure backend/ is importable
BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))

os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("LLM_PROVIDER", "ollama")
