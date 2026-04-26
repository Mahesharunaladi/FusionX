# FusionX Project Slide Deck (Presentation Draft)

## Slide 1 - Title
FusionX: Semantic Intelligence for Satellite Imagery

## Slide 2 - Problem
- Traditional GIS search is location-first, meaning poor content retrieval.
- Semantic gap forces manual labels and expert-only workflows.

## Slide 3 - Solution
- Vision-language embeddings align satellite pixels and text in one vector space.
- Natural language retrieval across billions of patches in sub-second time.

## Slide 4 - Pipeline
- Ingest Sentinel/Landsat scenes.
- Cloud mask + normalize + tile to 224x224.
- Generate SigLIP embeddings offline.
- Store vectors in HNSW index.

## Slide 5 - Search Architecture
- Text query -> text embedding.
- ANN retrieval via FAISS/Pinecone.
- Results enriched with bbox, timestamp, and confidence.

## Slide 6 - VQA + Segmentation
- VQA answers "What changed here?" style questions.
- Segmentation overlays (SAM/U-Net) support explainable results.

## Slide 7 - Competitive Edge
- Zero-shot discovery for unseen phenomena.
- Non-GIS users can operate via natural language.
- Faster incident response in disaster and environmental monitoring.

## Slide 8 - Tech Stack
- FastAPI, Transformers, Torch, FAISS, PostGIS, Object Storage.
- Optional: Pinecone for managed vector infrastructure.

## Slide 9 - Scale Strategy
- Daily petabyte updates via queue-driven distributed workers.
- GPU embedding farm + blue/green vector index updates.

## Slide 10 - KPI Targets
- P95 query latency < 1 second.
- Similarity confidence threshold > 0.85 for high-confidence workflows.

## Slide 11 - Roadmap
- Production Fmask integration.
- Domain-tuned satellite VQA model.
- Analyst dashboard with time-series change tracking.

## Slide 12 - Close
From maps to machine-understandable geospatial intelligence.
