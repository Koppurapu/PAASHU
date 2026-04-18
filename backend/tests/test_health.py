from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_breeds_endpoint() -> None:
    response = client.get("/api/breeds")

    assert response.status_code == 200
    assert len(response.json()["items"]) >= 3
