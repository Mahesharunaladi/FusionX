# FusionX

Semantic Intelligence System for satellite imagery retrieval using natural language.

## Project Structure

- `backend/` FastAPI service for ingestion, embedding, vector search, and VQA endpoint.
- `docs/technical-report.md` detailed architecture and deployment report.
- `docs/slide-deck.md` presentation-ready slide-by-slide content.
- `frontend/` existing Vite React workspace (ready for API integration).

## Backend Quickstart

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend
```

Open interactive docs at `http://localhost:8000/docs`.