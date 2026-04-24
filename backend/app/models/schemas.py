from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class IngestionRequest(BaseModel):
    scene_urls: List[str] = Field(default_factory=list)
    source: str = "sentinel-2"
    run_fmask: bool = True


class SceneMetadata(BaseModel):
    id: str
    source: str
    timestamp: str
    bbox: List[float]
    cloud_coverage: Optional[float] = None
    confidence: float = 1.0
    properties: Dict[str, Any] = Field(default_factory=dict)


class IndexDocument(BaseModel):
    metadata: SceneMetadata
    image_path: str
    embedding: List[float]


class SearchRequest(BaseModel):
    query: str
    top_k: int = 10
    min_similarity: float = 0.85
    time_from: Optional[str] = None
    time_to: Optional[str] = None


class SearchResult(BaseModel):
    id: str
    similarity: float
    bbox: List[float]
    timestamp: str
    confidence: float
    thumbnail_path: str


class VQARequest(BaseModel):
    question: str
    image_id: str


class VQAResponse(BaseModel):
    image_id: str
    question: str
    answer: str
    confidence: float
