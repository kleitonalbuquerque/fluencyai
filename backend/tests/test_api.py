from fastapi.testclient import TestClient

from presentation.api.main import create_app


def test_api_allows_local_frontend_origin():
    client = TestClient(create_app())

    for origin in ("http://localhost:3000", "http://127.0.0.1:3000"):
        response = client.options(
            "/login",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
            },
        )

        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == origin
