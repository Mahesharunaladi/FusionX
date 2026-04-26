from typing import List

import numpy as np
import torch
from PIL import Image
from transformers import AutoModel, AutoProcessor


class EmbeddingService:
    def __init__(self, model_name: str, device: str = "cpu"):
        self.device = torch.device(device)
        self.processor = AutoProcessor.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(self.device)
        self.model.eval()

    @torch.inference_mode()
    def embed_image(self, image: Image.Image) -> List[float]:
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        features = self.model.get_image_features(**inputs)
        vec = self._normalize_vector(features)
        return vec.detach().cpu().numpy().astype(np.float32).tolist()

    @torch.inference_mode()
    def embed_text(self, text: str) -> List[float]:
        inputs = self.processor(text=[text], return_tensors="pt", padding=True).to(self.device)
        features = self.model.get_text_features(**inputs)
        vec = self._normalize_vector(features)
        return vec.detach().cpu().numpy().astype(np.float32).tolist()

    def _normalize_vector(self, features):
        # Transformers may return tensors or model output containers depending
        # on model family/version, so we coerce to the first embedding tensor.
        if hasattr(features, "image_embeds"):
            tensor = features.image_embeds
        elif hasattr(features, "text_embeds"):
            tensor = features.text_embeds
        elif hasattr(features, "pooler_output"):
            tensor = features.pooler_output
        elif hasattr(features, "last_hidden_state"):
            tensor = features.last_hidden_state[:, 0, :]
        else:
            tensor = features
        return torch.nn.functional.normalize(tensor, p=2, dim=-1)[0]
