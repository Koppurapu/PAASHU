from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(tags=["predictions"])


PREDICTION_PRESETS = {
    "gir": [0.86, 0.09, 0.05],
    "sahiwal": [0.81, 0.11, 0.08],
    "tharparkar": [0.79, 0.14, 0.07],
}

PREDICTION_LABELS = ["Gir", "Sahiwal", "Tharparkar"]


@router.post("/predictions/predict")
async def predict_breed(image: UploadFile = File(...)) -> dict[str, object]:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    filename = (image.filename or "").lower()
    key = next((breed_id for breed_id in PREDICTION_PRESETS if breed_id in filename), "gir")
    scores = PREDICTION_PRESETS[key]

    top_predictions = [
        {"breed": label, "confidence": score}
        for label, score in zip(PREDICTION_LABELS, scores, strict=True)
    ]

    await image.close()

    return {
        "predicted_breed": top_predictions[0]["breed"],
        "confidence": top_predictions[0]["confidence"],
        "top_predictions": top_predictions,
        "source_file": Path(image.filename or "upload").name,
        "status": "mocked",
    }