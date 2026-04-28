import tempfile
import os
from fastapi.testclient import TestClient
from tests.test_account import auth_headers
from tests.test_auth import build_test_client
from infrastructure.config.settings import get_settings
from infrastructure.database.session import get_db_session
from infrastructure.database.models.user import UserModel


AUTHORIZED_KNOWLEDGE_EMAIL = "kleiton2102@gmail.com"


def signup_and_login(
    client: TestClient,
    email: str,
    *,
    is_admin: bool = False,
) -> str:
    password = "password"
    client.post("/signup", json={"email": email, "password": password})

    if is_admin:
        db_override = client.app.dependency_overrides[get_db_session]
        db_generator = db_override()
        db = next(db_generator)
        try:
            user_model = db.query(UserModel).filter(UserModel.email == email).first()
            user_model.is_admin = True
            db.commit()
        finally:
            db_generator.close()

    login_res = client.post("/login", json={"email": email, "password": password})
    return login_res.json()["access_token"]


def test_list_knowledge_sources_as_admin():
    # Setup temporary KB
    with tempfile.TemporaryDirectory() as tmp_dir:
        test_file = os.path.join(tmp_dir, "test_rules.md")
        with open(test_file, "w") as f:
            f.write("# Rules\nTest rule.")

        client = build_test_client()
        token = signup_and_login(
            client,
            AUTHORIZED_KNOWLEDGE_EMAIL,
            is_admin=True,
        )
        
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
    token = signup_and_login(client, "user@example.com")

    response = client.get("/knowledge/sources", headers=auth_headers(token))

    assert response.status_code == 403
    assert response.json()["detail"] == "Operation not permitted"


def test_list_knowledge_sources_forbidden_for_admin_with_different_email():
    client = build_test_client()
    token = signup_and_login(client, "admin@example.com", is_admin=True)

    response = client.get("/knowledge/sources", headers=auth_headers(token))

    assert response.status_code == 403
    assert response.json()["detail"] == "Operation not permitted"


def test_get_knowledge_source_returns_content():
    with tempfile.TemporaryDirectory() as tmp_dir:
        test_file = os.path.join(tmp_dir, "rules.md")
        with open(test_file, "w") as f:
            f.write("# Rules\nUse grounded answers.")

        client = build_test_client()
        token = signup_and_login(
            client,
            AUTHORIZED_KNOWLEDGE_EMAIL,
            is_admin=True,
        )

        settings = get_settings()
        original_kb_dir = settings.knowledge_base_dir
        settings.knowledge_base_dir = tmp_dir

        try:
            response = client.get(
                "/knowledge/sources/rules.md",
                headers=auth_headers(token),
            )

            assert response.status_code == 200
            payload = response.json()
            assert payload["id"] == "rules.md"
            assert payload["content"] == "# Rules\nUse grounded answers."
        finally:
            settings.knowledge_base_dir = original_kb_dir


def test_get_knowledge_source_returns_not_found_for_missing_file():
    with tempfile.TemporaryDirectory() as tmp_dir:
        client = build_test_client()
        token = signup_and_login(
            client,
            AUTHORIZED_KNOWLEDGE_EMAIL,
            is_admin=True,
        )

        settings = get_settings()
        original_kb_dir = settings.knowledge_base_dir
        settings.knowledge_base_dir = tmp_dir

        try:
            response = client.get(
                "/knowledge/sources/missing.md",
                headers=auth_headers(token),
            )

            assert response.status_code == 404
            assert response.json()["detail"] == "Knowledge source not found"
        finally:
            settings.knowledge_base_dir = original_kb_dir


def test_upload_knowledge_document_as_authorized_manager():
    with tempfile.TemporaryDirectory() as tmp_dir:
        client = build_test_client()
        token = signup_and_login(
            client,
            AUTHORIZED_KNOWLEDGE_EMAIL,
            is_admin=True,
        )

        settings = get_settings()
        original_kb_dir = settings.knowledge_base_dir
        settings.knowledge_base_dir = tmp_dir

        try:
            response = client.post(
                "/knowledge/upload",
                headers=auth_headers(token),
                files={"file": ("rules.md", b"# Rules\nTest rule.", "text/markdown")},
            )

            assert response.status_code == 201
            assert os.path.exists(os.path.join(tmp_dir, "rules.md"))
        finally:
            settings.knowledge_base_dir = original_kb_dir


def test_delete_knowledge_source_removes_file():
    with tempfile.TemporaryDirectory() as tmp_dir:
        test_file = os.path.join(tmp_dir, "rules.md")
        with open(test_file, "w") as f:
            f.write("# Rules\nDelete me.")

        client = build_test_client()
        token = signup_and_login(
            client,
            AUTHORIZED_KNOWLEDGE_EMAIL,
            is_admin=True,
        )

        settings = get_settings()
        original_kb_dir = settings.knowledge_base_dir
        settings.knowledge_base_dir = tmp_dir

        try:
            response = client.delete(
                "/knowledge/sources/rules.md",
                headers=auth_headers(token),
            )

            assert response.status_code == 204
            assert not os.path.exists(test_file)
        finally:
            settings.knowledge_base_dir = original_kb_dir


def test_delete_knowledge_source_forbidden_for_admin_with_different_email():
    client = build_test_client()
    token = signup_and_login(client, "admin@example.com", is_admin=True)

    response = client.delete(
        "/knowledge/sources/rules.md",
        headers=auth_headers(token),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Operation not permitted"


def test_upload_knowledge_document_forbidden_for_admin_with_different_email():
    client = build_test_client()
    token = signup_and_login(client, "admin@example.com", is_admin=True)

    response = client.post(
        "/knowledge/upload",
        headers=auth_headers(token),
        files={"file": ("rules.md", b"# Rules", "text/markdown")},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Operation not permitted"


def test_upload_knowledge_document_rejects_unsupported_files():
    client = build_test_client()
    token = signup_and_login(
        client,
        AUTHORIZED_KNOWLEDGE_EMAIL,
        is_admin=True,
    )

    response = client.post(
        "/knowledge/upload",
        headers=auth_headers(token),
        files={"file": ("notes.txt", b"Plain text", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only .md and .pdf files are supported"


def test_upload_knowledge_document_uses_safe_basename():
    with tempfile.TemporaryDirectory() as tmp_dir:
        kb_dir = os.path.join(tmp_dir, "kb")
        client = build_test_client()
        token = signup_and_login(
            client,
            AUTHORIZED_KNOWLEDGE_EMAIL,
            is_admin=True,
        )

        settings = get_settings()
        original_kb_dir = settings.knowledge_base_dir
        settings.knowledge_base_dir = kb_dir

        try:
            response = client.post(
                "/knowledge/upload",
                headers=auth_headers(token),
                files={"file": ("../escape.md", b"# Safe", "text/markdown")},
            )

            assert response.status_code == 201
            assert os.path.exists(os.path.join(kb_dir, "escape.md"))
            assert not os.path.exists(os.path.join(tmp_dir, "escape.md"))
        finally:
            settings.knowledge_base_dir = original_kb_dir
