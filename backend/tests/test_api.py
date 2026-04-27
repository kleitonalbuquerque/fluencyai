from fastapi.testclient import TestClient

from presentation.api.main import create_app


def test_api_allows_local_frontend_origin():
    client = TestClient(create_app())

    response = client.options(
        "/login",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
