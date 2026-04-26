from datetime import datetime, timezone
from pathlib import Path
from typing import List
from uuid import uuid4

import requests

from app.models.schemas import IngestionRequest, SceneMetadata
from app.services.embedding import EmbeddingService
from app.services.preprocessing import PreprocessingService
from app.services.vector_store import VectorStore
from app.db.metadata_store import MetadataStore


class IngestionService:
    def __init__(
        self,
        data_dir: Path,
        preprocessing: PreprocessingService,
        embeddings: EmbeddingService,
        vector_store: VectorStore,
        metadata_store: MetadataStore,
    ):
        self.data_dir = data_dir
        self.preprocessing = preprocessing
        self.embeddings = embeddings
        self.vector_store = vector_store
        self.metadata_store = metadata_store
        self.raw_dir = self.data_dir / "raw"
        self.proc_dir = self.data_dir / "processed"
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.proc_dir.mkdir(parents=True, exist_ok=True)

    def ingest(self, request: IngestionRequest) -> List[str]:
        ids: List[str] = []
        for scene_url in request.scene_urls:
            scene_id = f"{request.source}-{uuid4().hex[:12]}"
            raw_path = self.raw_dir / f"{scene_id}.jpg"
            proc_path = self.proc_dir / f"{scene_id}.jpg"
            self._download(scene_url, raw_path)
            image = self.preprocessing.preprocess(raw_path, run_fmask=request.run_fmask)
            self.preprocessing.save(image, proc_path)
            embedding = self.embeddings.embed_image(image)

            metadata = SceneMetadata(
                id=scene_id,
                source=request.source,
                timestamp=datetime.now(timezone.utc).isoformat(),
                bbox=[0.0, 0.0, 0.0, 0.0],
                cloud_coverage=0.0,
                confidence=1.0,
                properties={"original_url": scene_url},
            )
            self.metadata_store.upsert(metadata)
            self.vector_store.add(scene_id, embedding)
            ids.append(scene_id)

        self.vector_store.persist()
        return ids

    def _download(self, url: str, output_path: Path) -> None:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        output_path.write_bytes(response.content)
