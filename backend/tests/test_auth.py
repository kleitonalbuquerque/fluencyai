from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from infrastructure.database.base import Base
from infrastructure.database.session import get_db_session
from presentation.api.main import create_app


def build_test_client() -> TestClient:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )
    Base.metadata.create_all(bind=engine)

    # Seed initial data for learning
    db = TestingSessionLocal()
    from infrastructure.database.models.learning import (
        GrammarPracticeItemModel,
        LearningTrackModel,
        LessonModel, LearningPhraseModel, VocabularyWordModel,
        GrammarPointModel, QuizModel, QuizQuestionModel
    )
    db.add(LearningTrackModel(
        slug="study",
        label="Study",
        description="Study track",
        position=1,
    ))
    lesson = LessonModel(
        track_slug="study",
        day=1,
        title="Essential Daily Conversations",
        speaking_exercise="Introduce yourself."
    )
    db.add(lesson)
    db.flush()
    for i in range(1, 21):
        db.add(LearningPhraseModel(lesson_id=lesson.id, text=f"Phrase {i}", translation=f"T {i}", position=i))
    for i in range(1, 16):
        db.add(VocabularyWordModel(
            lesson_id=lesson.id, word=f"word{i}", theme="T", 
            definition="D", example_sentence="E", memory_tip="M", position=i
        ))
    for i in range(1, 6):
        db.add(GrammarPointModel(lesson_id=lesson.id, title=f"G {i}", explanation="E", example="EX", position=i))
    for i in range(1, 6):
        db.add(GrammarPracticeItemModel(
            lesson_id=lesson.id,
            title=f"Practice {i}",
            prompt=f"Prompt {i}",
            options=["A", "B"],
            answer="A",
            explanation="Explanation",
            position=i,
        ))
    quiz = QuizModel(lesson_id=lesson.id, title="Q")
    db.add(quiz)
    db.flush()
    for i in range(1, 6):
        db.add(QuizQuestionModel(quiz_id=quiz.id, prompt=f"Q {i}", options=["A", "B"], answer="A", position=i))
    db.commit()
    db.close()

    app = create_app()

    def override_get_db_session():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db_session] = override_get_db_session
    return TestClient(app)


def test_signup_creates_user_and_returns_tokens():
    client = build_test_client()

    response = client.post(
        "/signup",
        json={"email": "ana@example.com", "password": "strong-password"},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["user"]["email"] == "ana@example.com"
    assert payload["user"]["xp"] == 0
    assert payload["user"]["level"] == 1
    assert payload["user"]["streak"] == 0
    assert payload["access_token"]
    assert payload["refresh_token"]
    assert payload["token_type"] == "bearer"


def test_signup_rejects_duplicate_email():
    client = build_test_client()
    user_payload = {"email": "ana@example.com", "password": "strong-password"}

    first_response = client.post("/signup", json=user_payload)
    second_response = client.post("/signup", json=user_payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Email already registered"


def test_login_returns_tokens_for_valid_credentials():
    client = build_test_client()
    user_payload = {"email": "ana@example.com", "password": "strong-password"}
    client.post("/signup", json=user_payload)

    response = client.post("/login", json=user_payload)

    assert response.status_code == 200
    payload = response.json()
    assert payload["user"]["email"] == "ana@example.com"
    assert payload["access_token"]
    assert payload["refresh_token"]
    assert payload["token_type"] == "bearer"


def test_refresh_returns_new_token_pair():
    client = build_test_client()
    user_payload = {"email": "ana@example.com", "password": "strong-password"}
    signup_response = client.post("/signup", json=user_payload)
    refresh_token = signup_response.json()["refresh_token"]

    response = client.post("/refresh", json={"refresh_token": refresh_token})

    assert response.status_code == 200
    payload = response.json()
    assert payload["user"]["email"] == "ana@example.com"
    assert payload["access_token"]
    assert payload["refresh_token"]


def test_login_rejects_invalid_password():
    client = build_test_client()
    client.post(
        "/signup",
        json={"email": "ana@example.com", "password": "strong-password"},
    )

    response = client.post(
        "/login",
        json={"email": "ana@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_password_reset_request_returns_feedback_for_existing_email():
    client = build_test_client()
    client.post(
        "/signup",
        json={"email": "ana@example.com", "password": "strong-password"},
    )

    response = client.post(
        "/password-reset/request",
        json={"email": "ana@example.com"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "If this email exists, password reset instructions will be sent.",
    }


def test_password_reset_request_does_not_reveal_unknown_email():
    client = build_test_client()

    response = client.post(
        "/password-reset/request",
        json={"email": "missing@example.com"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "If this email exists, password reset instructions will be sent.",
    }
