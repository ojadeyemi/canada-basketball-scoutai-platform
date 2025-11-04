# Quick Start - Running Tests

## PDF Generation Test

```bash
# Run the test (API server must be running)
.venv/bin/python tests/test_pdf_generation.py
```

**Expected Output:**
```
🏀 Canada Basketball - PDF Generation Test (Real Data)

📡 Fetching player data from API...

1️⃣  Fetching Sean Miller-Moore (CEBL)...
   ✅ Fetched: Sean Miller-Moore - Calgary Surge

2️⃣  Fetching Aaron Rhooms (U SPORTS)...
   ✅ Fetched: A. Rhooms - Toronto Metropolitan

3️⃣  Generating CEBL scouting report PDF...
   ✅ PDF generated: pdf/Sean_Miller-Moore_CEBL_Scouting_Report.pdf

4️⃣  Generating U SPORTS scouting report PDF...
   ✅ PDF generated: pdf/A_Rhooms_USPORTS_Scouting_Report.pdf

🎉 PDF generation test complete!
```

**Check PDFs:**
```bash
ls -lh pdf/*.pdf
```

---

## API Endpoint Test

```bash
# Run the test (API server must be running)
.venv/bin/python tests/test_api.py
```

---

## Troubleshooting

### "Connection refused" error
**Problem:** API server is not running.

**Solution:**
```bash
# Start the server in a separate terminal
.venv/bin/uvicorn app.main:app --reload
```

---

### Import errors
**Problem:** Virtual environment not activated or dependencies missing.

**Solution:**
```bash
# Install dependencies
.venv/bin/pip install -r requirements.txt
```

---

### "No such file or directory: .venv/bin/python"
**Problem:** Virtual environment doesn't exist.

**Solution:**
```bash
# Create virtual environment
python3 -m venv .venv

# Install dependencies
.venv/bin/pip install -r requirements.txt
```

---

## Generated PDF Locations

PDFs are saved to:
```
pdf/
├── Sean_Miller-Moore_CEBL_Scouting_Report.pdf
└── A_Rhooms_USPORTS_Scouting_Report.pdf
```

**Note:** The `pdf/` folder is at the root of the project, not inside `tests/`.
