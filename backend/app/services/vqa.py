from app.models.schemas import VQAResponse


class VQAService:
    def answer(self, image_id: str, question: str) -> VQAResponse:
        # Placeholder for domain-tuned VLM (e.g. BLIP-2/LLaVA + sat finetune).
        heuristic_answer = (
            "Potential change detected near vegetation boundary. "
            "Run multi-date differencing for a high-confidence response."
        )
        return VQAResponse(
            image_id=image_id,
            question=question,
            answer=heuristic_answer,
            confidence=0.61,
        )
