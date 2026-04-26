from pathlib import Path
from typing import Tuple

import numpy as np
from PIL import Image, ImageOps


class PreprocessingService:
    def __init__(self, tile_size: int = 224):
        self.tile_size = tile_size

    def preprocess(self, image_path: Path, run_fmask: bool = True) -> Image.Image:
        image = Image.open(image_path).convert("RGB")
        if run_fmask:
            image = self._mock_fmask(image)
        image = ImageOps.fit(image, (self.tile_size, self.tile_size), method=Image.Resampling.BICUBIC)
        return self._normalize_contrast(image)

    def save(self, image: Image.Image, output_path: Path) -> None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(output_path)

    def _normalize_contrast(self, image: Image.Image) -> Image.Image:
        arr = np.asarray(image).astype(np.float32)
        arr = (arr - arr.min()) / max(1e-6, arr.max() - arr.min())
        arr = np.clip(arr * 255.0, 0, 255).astype(np.uint8)
        return Image.fromarray(arr)

    def _mock_fmask(self, image: Image.Image) -> Image.Image:
        # Placeholder for Fmask integration. This keeps interface stable for
        # replacing with GDAL/Fmask pipeline in production.
        return image
