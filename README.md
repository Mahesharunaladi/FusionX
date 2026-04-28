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
Here is the comprehensive code for your `README.md` file, incorporating the technical details and architecture we discussed from the sources.

```markdown
# Semantic Intelligence for Satellite Imagery Retrieval

## Overview
This project provides a next-generation **semantic search and analysis system** designed to solve the challenge of extracting actionable geospatial data from massive satellite repositories. Unlike traditional GIS systems that rely on manual labeling, this platform utilizes **Vision-Language Models (VLMs)** to enable **natural language visual searches**.

## Problem Statement
Traditional geospatial analysis suffers from a **"semantic gap"** where finding specific features across trillions of pixels requires slow, manual browsing or rigid metadata keywords. This system bridges that gap by understanding the visual content of imagery through a **shared vector space**.

## Key Features
*   **Natural Language Discovery:** Search for abstract or specific visual patterns like "snow-covered mountains" or "coastal reef" using intuitive text queries.
*   **Sub-Second Latency:** Perform retrieval across **billions of images** in less than 100ms using **HNSW indexing**.
*   **Actionable Analysis:** Integration of **Visual Question Answering (VQA)** (e.g., "What changed here?") and **semantic segmentation** overlays.
*   **Zero-Shot Discovery:** Capability to identify rare events, such as wildfires, without needing pre-existing manual labels [8, conversation history].

## Technical Architecture
The system utilizes a **dual-encoder architecture** to map raw imagery and text into a unified 768D embedding space.

### Workflow
1.  **Image Ingestion & Preprocessing:** Data from **Sentinel-2 or Landsat** is ingested, resized to 224x224, normalized, and **cloud-masked using Fmask**.
2.  **Embedding Generation:** A vision encoder (**SigLIP or CLIP**) processes image patches into semantic embeddings.
3.  **Vector Indexing:** Embeddings are stored in a **vector database (Pinecone/FAISS)** using **HNSW indexing** for fast similarity retrieval.
4.  **Query Processing:** Natural language queries are transformed into embeddings to find the top matches based on **cosine similarity (>0.85)**.
5.  **Post-Processing:** Results are re-ranked by **geospatial filters (lat/long)** and displayed with heatmaps and metadata.

## Tech Stack
*   **Core AI Models:** SigLIP, CLIP, U-Net, SAM (Segment Anything Model).
*   **Vector Database:** FAISS, Pinecone.
*   **Preprocessing Tools:** Fmask.
*   **Data Sources:** Sentinel-2, Landsat (via APIs).
*   **Fine-tuning Datasets:** EuroSAT, xView.

## Real-World Impact
*   **Disaster Management:** Reduced damage assessment time from **weeks to hours** (e.g., "damaged buildings Florida 2025").
*   **Environmental Monitoring:** Tracking **illegal logging** in the Amazon or **melting glaciers** in the Himalayas via time-series similarity matching.
*   **Urban Planning:** Identifying **illegal construction** or **heat islands** without requiring specialized GIS expertise.

## Competitive Edge
Unlike standard map platforms that function as static visual layers, this system provides **semantic understanding** of the planet [8, conversation history]. It enables non-experts to extract **data-driven insights** and real-time containment plans for large-scale crises.
```
