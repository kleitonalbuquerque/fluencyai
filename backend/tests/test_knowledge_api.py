import tempfile
import os
import jwt
from fastapi.testclient import TestClient
from tests.test_account import auth_headers
from tests.test_auth import build_test_client
from infrastructure.config.settings import get_settings


def signup_as_admin(client: TestClient) -> str:
    # 1. Signup normally
    response = client.post(
        "/signup",
        json={"email": "admin@example.com", "password": "strong-password"},
    )
    user_id = response.json()["user"]["id"]
    
    # 2. Access DB directly through override to flip is_admin
    # build_test_client setup uses a mock session that we can't easily reach here
    # but we can assume that if we are in test mode, we might need a way to elevate
    # For now, let's use a trick: in build_test_client, the first user could be admin?
    # Or better: let's use the dependency override to return an admin user.
    return response.json()["access_token"]


def test_list_knowledge_sources_as_admin():
    # Setup temporary KB
    with tempfile.TemporaryDirectory() as tmp_dir:
        test_file = os.path.join(tmp_dir, "test_rules.md")
        with open(test_file, "w") as f:
            f.write("# Rules\nTest rule.")

        client = build_test_client()
        
        # Elevate user to admin in the test database
        # We need to reach the session used by the test client
        from infrastructure.database.session import get_db_session
        db = next(client.app.dependency_overrides[get_db_session]())
        
        # Create user
        client.post("/signup", json={"email": "admin@example.com", "password": "password"})
        from infrastructure.database.models.user import UserModel
        admin_model = db.query(UserModel).filter(UserModel.email == "admin@example.com").first()
        admin_model.is_admin = True
        db.commit()

        # Login to get fresh token with admin state
        login_res = client.post("/login", json={"email": "admin@example.com", "password": "password"})
        token = login_res.json()["access_token"]
        
        # Override settings for this test
        settings = get_settings()
        original_kb_dir = settings.knowledge_base_dir
        settings.knowledge_base_dir = tmp_dir
        
        try:
            headers = auth_headers(token)
            response = client.get("/knowledge/sources", headers=headers)

            assert response.status_code == 200
            payload = response.json()
            assert any(s["name"] == "test_rules.md" for s in payload["sources"])
        finally:
            settings.knowledge_base_dir = original_kb_dir


def test_list_knowledge_sources_forbidden_for_regular_user():
    client = build_test_client()
    client.post("/signup", json={"email": "user@example.com", "password": "password"})
    login_res = client.post("/login", json={"email": "user@example.com", "password": "password"})
    token = login_res.json()["access_token"]

    response = client.get("/knowledge/sources", headers=auth_headers(token))

    assert response.status_code == 403
    assert response.json()["detail"] == "Operation not permitted"
