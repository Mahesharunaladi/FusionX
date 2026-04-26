import json
from pathlib import Path
from typing import List, Sequence, Tuple

import faiss
import numpy as np


class VectorStore:
    def __init__(self, dim: int, index_path: Path, ids_path: Path):
        self.dim = dim
        self.index_path = index_path
        self.ids_path = ids_path
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self.ids: List[str] = self._load_ids()
        self.index = self._load_or_create()

    def _load_or_create(self) -> faiss.Index:
        if self.index_path.exists():
            return faiss.read_index(str(self.index_path))
        base = faiss.IndexHNSWFlat(self.dim, 32, faiss.METRIC_INNER_PRODUCT)
        base.hnsw.efConstruction = 200
        return base

    def _load_ids(self) -> List[str]:
        if not self.ids_path.exists():
            return []
        return json.loads(self.ids_path.read_text(encoding="utf-8"))

    def add(self, item_id: str, vector: Sequence[float]) -> None:
        vec = np.asarray([vector], dtype=np.float32)
        faiss.normalize_L2(vec)
        self.index.add(vec)
        self.ids.append(item_id)

    def search(self, vector: Sequence[float], top_k: int) -> List[Tuple[str, float]]:
        if self.index.ntotal == 0:
            return []
        query = np.asarray([vector], dtype=np.float32)
        faiss.normalize_L2(query)
        sims, idx = self.index.search(query, top_k)
        results: List[Tuple[str, float]] = []
        for score, row_idx in zip(sims[0], idx[0]):
            if row_idx < 0 or row_idx >= len(self.ids):
                continue
            results.append((self.ids[row_idx], float(score)))
        return results

    def persist(self) -> None:
        faiss.write_index(self.index, str(self.index_path))
        self.ids_path.write_text(json.dumps(self.ids), encoding="utf-8")
