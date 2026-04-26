# FusionX Backend

FastAPI backend for semantic retrieval on satellite imagery using SigLIP embeddings and FAISS HNSW indexing.

## Quick Start

1. Create virtual environment and install dependencies:
   - `python3 -m venv .venv`
   - `source .venv/bin/activate`
   - `pip install -r backend/requirements.txt`
2. Run API:
   - `uvicorn app.main:app --reload --app-dir backend`
3. Open docs:
   - `http://localhost:8000/docs`

## Endpoints

- `POST /ingest`: ingest scene URLs, preprocess, embed, and index.
- `POST /search`: natural language retrieval with cosine similarity.
- `POST /vqa`: VQA placeholder endpoint for change-oriented Q&A.

## Example Ingest Body

```json
{
  "source": "sentinel-2",
  "run_fmask": true,
  "scene_urls": [
    "https://example.com/tile1.jpg",
    "https://example.com/tile2.jpg"
  ]
}
```

## Production Notes

- Replace `_mock_fmask` in `app/services/preprocessing.py` with real Fmask integration.
- If you need managed index infrastructure, swap FAISS with Pinecone adapter.
- Deploy with GPU inference for higher ingest throughput.
