from fastapi.testclient import TestClient

from tests.test_auth import build_test_client


def signup_and_get_token(client: TestClient) -> str:
    response = client.post(
        "/signup",
        json={"email": "ana@example.com", "password": "strong-password"},
    )
    return response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_get_current_user_profile():
    client = build_test_client()
    token = signup_and_get_token(client)

    response = client.get("/me", headers=auth_headers(token))

    assert response.status_code == 200
    assert response.json()["email"] == "ana@example.com"
    assert response.json()["avatar_url"] is None


def test_change_password_updates_login_credentials():
    client = build_test_client()
    token = signup_and_get_token(client)

    response = client.patch(
        "/me/password",
        headers=auth_headers(token),
        json={
            "current_password": "strong-password",
            "new_password": "new-strong-password",
        },
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Password updated successfully"}

    old_login_response = client.post(
        "/login",
        json={"email": "ana@example.com", "password": "strong-password"},
    )
    new_login_response = client.post(
        "/login",
        json={"email": "ana@example.com", "password": "new-strong-password"},
    )

    assert old_login_response.status_code == 401
    assert new_login_response.status_code == 200


def test_change_password_rejects_invalid_current_password():
    client = build_test_client()
    token = signup_and_get_token(client)

    response = client.patch(
        "/me/password",
        headers=auth_headers(token),
        json={
            "current_password": "wrong-password",
            "new_password": "new-strong-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_update_avatar_persists_user_avatar_url():
    client = build_test_client()
    token = signup_and_get_token(client)
    avatar_data_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB"

    response = client.put(
        "/me/avatar",
        headers=auth_headers(token),
        json={"avatar_url": avatar_data_url},
    )

    assert response.status_code == 200
    assert response.json()["avatar_url"] == avatar_data_url

    profile_response = client.get("/me", headers=auth_headers(token))

    assert profile_response.json()["avatar_url"] == avatar_data_url


def test_profile_requires_authentication():
    client = build_test_client()

    response = client.get("/me")

    assert response.status_code == 401
