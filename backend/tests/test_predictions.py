from io import BytesIO

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_predict_breed_returns_mocked_results() -> None:
    response = client.post(
        "/api/predictions/predict",
        files={"image": ("gir-sample.jpg", BytesIO(b"fake-image-bytes"), "image/jpeg")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["predicted_breed"] == "Gir"
    assert payload["status"] == "mocked"
    assert len(payload["top_predictions"]) == 3
