# FusionX Semantic Intelligence System - Technical Report

## 1) Objective

FusionX replaces manual GIS indexing with semantic retrieval over satellite imagery. Instead of searching by coordinates alone, users can issue natural language queries such as "new road near river delta" and retrieve visually similar image patches.

## 2) System Architecture

### 2.1 Data Ingestion and Preprocessing
- Sources: Sentinel-2 / Landsat scenes (API-batched pulls).
- Pipeline steps:
  - Download raw scenes.
  - Cloud mask (Fmask hook point included).
  - Resize to `224x224`.
  - Contrast normalization.
  - Persist processed image patches + metadata.

### 2.2 Embedding Engine
- Model: `google/siglip-base-patch16-224` (SigLIP ViT-B/16 family).
- Modality alignment: image and text embeddings in a shared `768D` vector space.
- Runtime:
  - Image embeddings generated offline at ingestion.
  - Text embeddings generated online per search query.
  - L2-normalized vectors for cosine-similarity retrieval.

### 2.3 Vector Search
- Vector index: FAISS `IndexHNSWFlat` with inner-product metric.
- Search properties:
  - Approximate nearest neighbor retrieval.
  - Sub-second latency target for large index sizes.
  - Configurable `top_k` and minimum similarity threshold (`>0.85` default target for high-confidence hits).

### 2.4 Metadata Layer
- Storage: JSONL metadata store (replaceable with PostGIS + object storage in production).
- Core fields:
  - `id`
  - `source`
  - `timestamp`
  - `bbox` (minLon, minLat, maxLon, maxLat)
  - `cloud_coverage`
  - `confidence`
  - `properties` (sensor, path/row, bands, etc.)

### 2.5 VQA and Advanced Analysis
- VQA endpoint included as integration surface (`/vqa`).
- Recommended production stack:
  - VLM answerer (BLIP-2 / LLaVA variant, fine-tuned on remote sensing Q&A).
  - Change-detection module for "what changed here?" style queries.
  - Segmentation overlays via SAM/U-Net adapters.

## 3) Implemented Python Stack

- API and schemas: `fastapi`, `pydantic`
- Embeddings: `transformers`, `torch`
- Vector index: `faiss-cpu`
- Image processing: `Pillow`, `numpy`
- Ingestion: `requests`

## 4) Database Schema (Production Recommendation)

### 4.1 PostGIS Table: `scene_metadata`
- `scene_id` (PK, text)
- `source` (text)
- `acquired_at` (timestamptz, indexed)
- `geom` (geometry(Polygon, 4326), GiST indexed)
- `cloud_coverage` (float)
- `confidence` (float)
- `object_path` (text)
- `thumbnail_path` (text)
- `embedding_id` (text, vector index key)
- `properties` (jsonb)

### 4.2 Vector Index Key-Value
- `embedding_id` -> `768D float vector`
- `embedding_id` -> `{scene_id, tile_id, timestamp}`

## 5) API Surface

- `POST /ingest`: accepts scene URLs, preprocesses, embeds, and indexes.
- `POST /search`: text query -> nearest neighbors + metadata.
- `POST /vqa`: question + image_id -> answer + confidence.
- `GET /health`: service heartbeat.

## 6) Deployment Strategy for Petabyte-Scale Daily Updates

### 6.1 Compute Plane
- Batch ingestion workers on Kubernetes (spot+on-demand mix).
- GPU nodes for embedding throughput; CPU workers for preprocessing.
- Queue-centric orchestration (Kafka/SQS/PubSub) by scene partitions.

### 6.2 Storage Plane
- Raw and processed imagery on object storage (`S3/GCS/Azure Blob`).
- Metadata in PostGIS (hot), parquet lakehouse for historical analytics.
- Snapshot + sharded vector index for high cardinality.

### 6.3 Index Maintenance
- Daily append-only micro-batches.
- Periodic compaction/rebuild for recall quality.
- Blue/green index swap to avoid downtime.

### 6.4 Observability and SLOs
- Latency SLO: P95 `<1s` for top-k search.
- Quality SLO: precision@k by domain-specific benchmarks.
- Cost controls: adaptive ingestion rate + lifecycle tiers for cold imagery.

## 7) Security and Governance

- Signed URL ingestion policy.
- Encryption in transit (TLS) and at rest.
- Immutable audit log for query and model output provenance.

## 8) Next Milestones

1. Replace mock Fmask with production cloud-mask service.
2. Add Pinecone adapter and benchmarking harness (FAISS vs Pinecone).
3. Integrate temporal change embedding and segmentation overlays.
4. Build analyst UI for geospatial filter + time-series playback.
