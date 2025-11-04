# Canada Basketball API - Test Scripts

This folder contains manual test scripts for validating different components of the Canada Basketball API.

## Available Tests

### test_api.py
Tests all API endpoints with real data.

**Usage:**
```bash
# Make sure the FastAPI server is running first
.venv/bin/uvicorn app.main:app --reload

# In another terminal, run the test
.venv/bin/python tests/test_api.py
```

**Tests:**
- Player search (fuzzy matching)
- Player details by league and ID
- Stats endpoints
- Agent chat endpoint

---

### test_pdf_generation.py
Tests PDF generation for scouting reports using real player data.

**Usage:**
```bash
# Make sure the FastAPI server is running first
.venv/bin/uvicorn app.main:app --reload

# In another terminal, run the test
.venv/bin/python tests/test_pdf_generation.py
```

**Tests:**
- Fetches real player data from API
- Generates CEBL scouting report PDF
- Generates U SPORTS scouting report PDF
- Validates PDF output in `graph/tools/pdf_generator/pdf/`

**Sample Players:**
- CEBL: Sean Miller-Moore (ID: 102)
- U SPORTS: Aaron Rhooms (ID: A.Rhooms_Ryerson_TorontoMetropolitan_usports)

---

## Prerequisites

1. **API Server Running:**
   ```bash
   .venv/bin/uvicorn app.main:app --reload
   ```

2. **Dependencies Installed:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables Set:**
   - Database connections configured
   - API keys set (OpenAI, Cohere)
   - PostgreSQL connection for LangGraph

---

## Notes

- These are **manual test scripts**, not automated unit tests
- Use these to validate functionality during development
- Check the `graph/tools/pdf_generator/pdf/` folder for generated PDFs
- Errors will be printed to console with detailed stack traces
