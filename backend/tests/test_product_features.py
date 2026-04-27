from fastapi.testclient import TestClient

from tests.test_account import auth_headers, signup_and_get_token
from tests.test_auth import build_test_client


def build_authenticated_client() -> tuple[TestClient, dict[str, str]]:
    client = build_test_client()
    token = signup_and_get_token(client)
    return client, auth_headers(token)


def test_daily_immersion_plan_contains_required_learning_blocks():
    client, headers = build_authenticated_client()

    response = client.get("/learning-plan/today", headers=headers)

    assert response.status_code == 200
    payload = response.json()
    assert payload["day"] == 1
    assert len(payload["essential_phrases"]) == 20
    assert len(payload["vocabulary_words"]) == 15
    assert len(payload["grammar_points"]) == 5
    assert payload["speaking_exercise"]
    assert len(payload["quiz"]["questions"]) >= 5


def test_ai_conversation_corrects_and_suggests_vocabulary():
    client, headers = build_authenticated_client()

    response = client.post(
        "/ai/chat",
        headers=headers,
        json={"message": "I go cafe yesterday"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert "Isso soa bem! Só uma coisinha pequena..." in payload["correction"]
    assert payload["reply"]
    assert payload["suggested_vocabulary"]


def test_memorization_session_returns_twenty_words_with_learning_context():
    client, headers = build_authenticated_client()

    response = client.get("/memorization/session", headers=headers)

    assert response.status_code == 200
    words = response.json()["words"]
    assert len(words) == 20
    assert all(word["definition"] for word in words)
    assert all(word["example_sentence"] for word in words)
    assert all(word["memory_tip"] for word in words)


def test_role_play_supports_real_scenarios_and_real_time_feedback():
    client, headers = build_authenticated_client()

    scenarios_response = client.get("/role-play/scenarios", headers=headers)
    assert scenarios_response.status_code == 200
    scenario_slugs = {scenario["slug"] for scenario in scenarios_response.json()["scenarios"]}
    assert {"entrevista", "cafe", "viagem"}.issubset(scenario_slugs)

    feedback_response = client.post(
        "/role-play/respond",
        headers=headers,
        json={"scenario": "cafe", "message": "I want coffee please"},
    )
    assert feedback_response.status_code == 200
    payload = feedback_response.json()
    assert "Isso soa bem! Só uma coisinha pequena..." in payload["correction"]
    assert payload["next_prompt"]


def test_gamification_summary_and_global_ranking_use_current_user():
    client, headers = build_authenticated_client()

    summary_response = client.get("/gamification/summary", headers=headers)
    ranking_response = client.get("/ranking/global", headers=headers)

    assert summary_response.status_code == 200
    assert summary_response.json()["xp"] == 0
    assert summary_response.json()["level"] == 1
    assert summary_response.json()["streak"] == 0
    assert "words_learned" in summary_response.json()

    assert ranking_response.status_code == 200
    entries = ranking_response.json()["entries"]
    assert any(entry["email"] == "ana@example.com" for entry in entries)
    assert all("rank" in entry for entry in entries)


def test_social_progress_share_message_can_be_generated():
    client, headers = build_authenticated_client()

    response = client.get("/social/share/progress", headers=headers)

    assert response.status_code == 200
    payload = response.json()
    assert "FluencyAI" in payload["share_text"]
    assert payload["share_url"].endswith("/app")


def test_product_endpoints_require_authentication():
    client = build_test_client()

    response = client.get("/learning-plan/today")

    assert response.status_code == 401
