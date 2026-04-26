import hashlib
import io
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, List

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from app.config import settings
from app.db.metadata_store import MetadataStore
from app.models.schemas import IngestionRequest, SearchRequest, SearchResult, VQARequest
from app.services.embedding import EmbeddingService
from app.services.ingestion import IngestionService
from app.services.preprocessing import PreprocessingService
from app.services.vector_store import VectorStore
from app.services.vqa import VQAService


services: Dict[str, object] = {}


@asynccontextmanager
async def lifespan(_: FastAPI):
    preprocessing = PreprocessingService(tile_size=settings.tile_size)
    embeddings = EmbeddingService(model_name=settings.model_name, device=settings.device)
    vector_store = VectorStore(
        dim=settings.embedding_dim,
        index_path=settings.faiss_index_path,
        ids_path=settings.faiss_ids_path,
    )
    metadata_store = MetadataStore(metadata_path=settings.metadata_path)
    ingestion = IngestionService(
        data_dir=settings.data_dir,
        preprocessing=preprocessing,
        embeddings=embeddings,
        vector_store=vector_store,
        metadata_store=metadata_store,
    )
    vqa = VQAService()
    services.update(
        preprocessing=preprocessing,
        embeddings=embeddings,
        vector_store=vector_store,
        metadata_store=metadata_store,
        ingestion=ingestion,
        vqa=vqa,
    )
    yield


app = FastAPI(title=settings.project_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/ingest")
def ingest(req: IngestionRequest) -> Dict[str, List[str]]:
    ingestion = services["ingestion"]
    ids = ingestion.ingest(req)
    return {"ingested_ids": ids}


@app.post("/search", response_model=List[SearchResult])
def search(req: SearchRequest) -> List[SearchResult]:
    embeddings: EmbeddingService = services["embeddings"]  # type: ignore[assignment]
    vector_store: VectorStore = services["vector_store"]  # type: ignore[assignment]
    metadata_store: MetadataStore = services["metadata_store"]  # type: ignore[assignment]

    qvec = embeddings.embed_text(req.query)
    matches = vector_store.search(qvec, top_k=req.top_k)

    allowed_ids = {m.id for m in metadata_store.filter_by_time(req.time_from, req.time_to)}
    results: List[SearchResult] = []
    for scene_id, score in matches:
        if score < req.min_similarity:
            continue
        if allowed_ids and scene_id not in allowed_ids:
            continue
        meta = metadata_store.get(scene_id)
        if not meta:
            continue
        results.append(
            SearchResult(
                id=scene_id,
                similarity=score,
                bbox=meta.bbox,
                timestamp=meta.timestamp,
                confidence=meta.confidence,
                thumbnail_path=str(Path(settings.data_dir) / "processed" / f"{scene_id}.jpg"),
            )
        )
    return results


@app.post("/vqa")
def vqa(req: VQARequest):
    metadata_store: MetadataStore = services["metadata_store"]  # type: ignore[assignment]
    if metadata_store.get(req.image_id) is None:
        raise HTTPException(status_code=404, detail="Image ID not found")
    vqa_service: VQAService = services["vqa"]  # type: ignore[assignment]
    return vqa_service.answer(image_id=req.image_id, question=req.question)


@app.post("/encode-image")
async def encode_image(file: UploadFile = File(...)) -> Dict[str, object]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    preprocessing: PreprocessingService = services["preprocessing"]  # type: ignore[assignment]
    embeddings: EmbeddingService = services["embeddings"]  # type: ignore[assignment]

    raw = await file.read()
    try:
        image = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image data") from exc

    normalized = preprocessing._normalize_contrast(image)  # Reuse same ingest normalization step.
    vector = embeddings.embed_image(normalized)
    digest = hashlib.sha256(bytes(memoryview(bytearray(str(vector[:64]), "utf-8")))).hexdigest()
    unique_code = f"VX-{digest[:16].upper()}-{int(abs(sum(vector)) * 1_000_000) % 1_000_000:06d}"

    return {
        "filename": file.filename,
        "embedding_dim": len(vector),
        "unique_math_code": unique_code,
        "vector_preview": vector[:12],
    }
