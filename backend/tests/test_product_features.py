from datetime import date, timedelta

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
    assert len(payload["grammar_practice_items"]) == 5
    assert payload["speaking_exercise"]
    assert len(payload["quiz"]["questions"]) >= 5


def test_weekly_immersion_plan_returns_roadmap_and_focus_progress():
    client, headers = build_authenticated_client()
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    response = client.get("/learning-plan/weekly", headers=headers)

    assert response.status_code == 200
    payload = response.json()
    assert payload["week_start_day"] == 1
    assert payload["week_end_day"] == 7
    assert payload["week_start_date"] == week_start.isoformat()
    assert payload["week_end_date"] == (week_start + timedelta(days=6)).isoformat()
    assert payload["current_day"] == 1
    assert len(payload["days"]) == 7
    current_index = today.weekday()
    assert payload["days"][0]["calendar_day"] == week_start.day
    assert payload["days"][current_index]["calendar_day"] == today.day
    assert payload["days"][current_index]["is_current"] is True
    assert payload["days"][current_index]["is_locked"] is False
    if current_index < 6:
        assert payload["days"][current_index + 1]["is_locked"] is True
    assert payload["focus"]["day"] == 1
    assert payload["focus"]["progress_percent"] == 0
    assert {section["section"] for section in payload["focus"]["sections"]} == {
        "phrases",
        "vocabulary",
        "grammar",
        "grammar_practice",
        "speaking",
        "quiz",
    }


def test_complete_immersion_plan_section_updates_progress():
    client, headers = build_authenticated_client()

    first_item_response = client.post(
        "/learning-plan/day/1/items/phrases/1/complete",
        headers=headers,
        json={},
    )
    assert first_item_response.status_code == 200
    assert first_item_response.json()["xp_awarded"] == 2

    for item_key in range(2, 21):
        response = client.post(
            f"/learning-plan/day/1/items/phrases/{item_key}/complete",
            headers=headers,
            json={},
        )
        assert response.status_code == 200

    response = client.post(
        "/learning-plan/day/1/sections/phrases/complete",
        headers=headers,
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["section"] == "phrases"
    assert payload["progress_percent"] == 17
    assert payload["lesson_completed"] is False
    phrases = next(
        section for section in payload["sections"] if section["section"] == "phrases"
    )
    assert phrases["is_completed"] is True
    assert phrases["completed_count"] == 20
    assert payload["xp_awarded"] == 10


def test_cannot_complete_section_before_items_are_done():
    client, headers = build_authenticated_client()

    response = client.post(
        "/learning-plan/day/1/sections/vocabulary/complete",
        headers=headers,
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Complete all section items before finishing this section"


def test_cannot_complete_locked_future_lesson_section():
    client, headers = build_authenticated_client()

    response = client.post(
        "/learning-plan/day/2/sections/phrases/complete",
        headers=headers,
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Lesson day is locked"


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
