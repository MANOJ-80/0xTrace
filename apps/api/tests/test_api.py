from fastapi.testclient import TestClient

from app.main import app


def test_rejects_non_pdf() -> None:
    client = TestClient(app)
    response = client.post("/api/v1/experiences/parse", files={"file": ("note.txt", b"hello", "text/plain")})
    assert response.status_code == 415


def test_rejects_invalid_pdf_content() -> None:
    client = TestClient(app)
    response = client.post("/api/v1/experiences/parse", files={"file": ("empty.pdf", b"%PDF-1.7", "application/pdf")})
    assert response.status_code == 422
