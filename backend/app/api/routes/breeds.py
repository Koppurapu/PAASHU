from fastapi import APIRouter

router = APIRouter(tags=["breeds"])


BREEDS = [
    {
        "id": "gir",
        "name": "Gir",
        "region": "Gujarat",
        "confidence_note": "Strong dairy breed with high heat tolerance.",
    },
    {
        "id": "sahiwal",
        "name": "Sahiwal",
        "region": "Punjab and Haryana",
        "confidence_note": "Known for resilience and steady milk yield.",
    },
    {
        "id": "tharparkar",
        "name": "Tharparkar",
        "region": "Rajasthan",
        "confidence_note": "Adapted to dry climates and dual-purpose farming.",
    },
]


@router.get("/breeds")
def list_breeds() -> dict[str, list[dict[str, str]]]:
    return {"items": BREEDS}