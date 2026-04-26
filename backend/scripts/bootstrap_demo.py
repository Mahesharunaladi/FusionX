import argparse
import json
from pathlib import Path

from app.config import settings
from app.models.schemas import IngestionRequest
from app.services.embedding import EmbeddingService
from app.services.ingestion import IngestionService
from app.services.preprocessing import PreprocessingService
from app.services.vector_store import VectorStore
from app.db.metadata_store import MetadataStore


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True, help="JSON file with 'scene_urls' array.")
    args = parser.parse_args()

    payload = json.loads(args.manifest.read_text(encoding="utf-8"))
    request = IngestionRequest(scene_urls=payload.get("scene_urls", []), source=payload.get("source", "sentinel-2"))

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
    ids = ingestion.ingest(request)
    print(f"Ingested {len(ids)} scenes")


if __name__ == "__main__":
    main()
