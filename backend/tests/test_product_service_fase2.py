from datetime import date
from unittest.mock import Mock
import pytest

from application.product.service import ProductService
from domain.entities.learning import (
    Lesson,
    LessonItemProgress,
    LessonSectionProgress,
    UserTrackProgress,
    UserProgress,
    Quiz,
    LearningPhrase,
)
from domain.entities.user import User

@pytest.fixture
def mock_lesson_repo():
    return Mock()

@pytest.fixture
def mock_progress_repo():
    return Mock()

@pytest.fixture
def mock_section_progress_repo():
    return Mock()

@pytest.fixture
def mock_item_progress_repo():
    return Mock()

@pytest.fixture
def mock_user_repo():
    return Mock()

@pytest.fixture
def mock_knowledge_service():
    return Mock()

@pytest.fixture
def product_service(
    mock_lesson_repo,
    mock_progress_repo,
    mock_section_progress_repo,
    mock_item_progress_repo,
    mock_user_repo,
    mock_knowledge_service,
):
    return ProductService(
        lesson_repository=mock_lesson_repo,
        progress_repository=mock_progress_repo,
        section_progress_repository=mock_section_progress_repo,
        item_progress_repository=mock_item_progress_repo,
        user_repository=mock_user_repo,
        knowledge_service=mock_knowledge_service,
        today_provider=lambda: date(2026, 4, 28),
    )

def test_get_daily_plan_for_new_user(product_service, mock_lesson_repo, mock_progress_repo):
    user = User(id="user-1", email="test@example.com", password_hash="hash")
    
    # Setup mocks
    mock_progress_repo.get_by_user_id.return_value = None
    
    expected_lesson = Lesson(
        id="lesson-1", day=1, title="Day 1", 
        essential_phrases=[], vocabulary_words=[], grammar_points=[], 
        speaking_exercise="Speak", quiz=Quiz("Q", [])
    )
    mock_lesson_repo.get_by_day.return_value = expected_lesson
    
    # Execute
    plan = product_service.get_daily_plan(user)
    
    # Assert
    assert plan.day == 1
    assert plan.title == "Day 1"
    mock_progress_repo.save.assert_called_once()
    saved_progress = mock_progress_repo.save.call_args[0][0]
    assert saved_progress.user_id == "user-1"
    assert saved_progress.current_day == 1

def test_get_daily_plan_for_returning_user(product_service, mock_lesson_repo, mock_progress_repo):
    user = User(id="user-1", email="test@example.com", password_hash="hash")
    
    # Setup mocks: user is on day 3
    mock_progress_repo.get_by_user_id.return_value = UserProgress(
        user_id="user-1", current_day=3, lessons_completed=[1, 2], 
        xp_total=100, streak_days=2
    )
    
    expected_lesson = Lesson(
        id="lesson-3", day=3, title="Day 3", 
        essential_phrases=[], vocabulary_words=[], grammar_points=[], 
        speaking_exercise="Speak Day 3", quiz=Quiz("Q3", [])
    )
    mock_lesson_repo.get_by_day.return_value = expected_lesson
    
    # Execute
    plan = product_service.get_daily_plan(user)
    
    # Assert
    assert plan.day == 3
    assert plan.title == "Day 3"
    mock_lesson_repo.get_by_day.assert_called_with(3, "study")

def test_get_weekly_plan_builds_roadmap_from_user_progress(
    product_service,
    mock_lesson_repo,
    mock_progress_repo,
    mock_section_progress_repo,
    mock_item_progress_repo,
):
    user = User(id="user-1", email="test@example.com", password_hash="hash")
    lesson = Lesson(
        id="lesson-1", day=1, title="Day 1",
        essential_phrases=[], vocabulary_words=[], grammar_points=[],
        speaking_exercise="Speak", quiz=Quiz("Q", [])
    )
    mock_progress_repo.get_by_user_id.return_value = UserProgress(
        user_id="user-1", current_day=1, lessons_completed=[],
        xp_total=0, streak_days=0
    )
    mock_lesson_repo.list_summaries.return_value = [lesson]
    mock_lesson_repo.get_by_day.return_value = lesson
    mock_section_progress_repo.list_for_user_and_days.return_value = []
    mock_section_progress_repo.list_for_user_and_day.return_value = []
    mock_item_progress_repo.list_for_user_and_day.return_value = []

    weekly_plan = product_service.get_weekly_plan(user)

    assert weekly_plan.week_start_day == 1
    assert weekly_plan.week_start_date == date(2026, 4, 27)
    assert weekly_plan.week_end_date == date(2026, 5, 3)
    assert len(weekly_plan.days) == 7
    assert [day.day for day in weekly_plan.days] == [1, 2, 3, 4, 5, 6, 7]
    assert weekly_plan.days[0].calendar_day == 27
    assert weekly_plan.days[1].calendar_day == 28
    assert weekly_plan.days[1].is_current is True
    assert weekly_plan.days[0].is_locked is False
    assert weekly_plan.days[1].is_locked is True
    assert weekly_plan.days[2].is_locked is True
    assert weekly_plan.focus.progress_percent == 0

def test_get_weekly_plan_does_not_emit_invalid_lesson_days(
    product_service,
    mock_lesson_repo,
    mock_progress_repo,
    mock_section_progress_repo,
    mock_item_progress_repo,
):
    user = User(id="user-1", email="test@example.com", password_hash="hash")
    lesson = Lesson(
        id="lesson-1", day=1, title="Day 1",
        essential_phrases=[], vocabulary_words=[], grammar_points=[],
        speaking_exercise="Speak", quiz=Quiz("Q", [])
    )
    mock_progress_repo.get_by_user_id.return_value = UserProgress(
        user_id="user-1", current_day=1, lessons_completed=[],
        xp_total=0, streak_days=0
    )
    mock_lesson_repo.list_summaries.return_value = [lesson]
    mock_lesson_repo.get_by_day.return_value = lesson
    mock_section_progress_repo.list_for_user_and_days.return_value = []
    mock_section_progress_repo.list_for_user_and_day.return_value = []
    mock_item_progress_repo.list_for_user_and_day.return_value = []

    weekly_plan = product_service.get_weekly_plan(user)

    assert weekly_plan.week_start_day == 1
    assert weekly_plan.week_end_day == 7
    assert [day.day for day in weekly_plan.days] == list(range(1, 8))
    assert all(day.day >= 1 for day in weekly_plan.days)

def test_lesson_history_lists_available_lessons(
    product_service,
    mock_lesson_repo,
    mock_progress_repo,
    mock_section_progress_repo,
):
    user = User(id="user-1", email="test@example.com", password_hash="hash")
    lessons = [
        Lesson(
            id="lesson-1", day=1, title="Day 1",
            essential_phrases=[], vocabulary_words=[], grammar_points=[],
            speaking_exercise="Speak", quiz=Quiz("Q", [])
        ),
        Lesson(
            id="lesson-2", day=2, title="Day 2",
            essential_phrases=[], vocabulary_words=[], grammar_points=[],
            speaking_exercise="Speak", quiz=Quiz("Q", [])
        ),
        Lesson(
            id="lesson-3", day=3, title="Day 3",
            essential_phrases=[], vocabulary_words=[], grammar_points=[],
            speaking_exercise="Speak", quiz=Quiz("Q", [])
        ),
    ]
    mock_progress_repo.get_by_user_id.return_value = UserProgress(
        user_id="user-1", current_day=2, lessons_completed=[1],
        xp_total=0, streak_days=0
    )
    mock_lesson_repo.list_summaries.return_value = lessons
    mock_section_progress_repo.list_for_user_and_days.return_value = [
        LessonSectionProgress("user-1", 1, "phrases"),
        LessonSectionProgress("user-1", 2, "phrases"),
    ]

    history = product_service.get_lesson_history(user)

    assert [entry.day for entry in history.entries] == [1, 2]
    assert history.entries[0].is_completed is True
    assert history.entries[0].progress_percent == 100
    assert history.entries[1].is_current is True
    assert history.entries[1].progress_percent == 17

def test_complete_lesson_section_marks_progress(
    product_service,
    mock_lesson_repo,
    mock_progress_repo,
    mock_section_progress_repo,
    mock_item_progress_repo,
    mock_user_repo,
):
    user = User(id="user-1", email="test@example.com", password_hash="hash")
    lesson = Lesson(
        id="lesson-1", day=1, title="Day 1",
        essential_phrases=[], vocabulary_words=[], grammar_points=[],
        speaking_exercise="Speak", quiz=Quiz("Q", [])
    )
    mock_progress_repo.get_by_user_id.return_value = UserProgress(
        user_id="user-1", current_day=1, lessons_completed=[],
        xp_total=0, streak_days=0
    )
    mock_lesson_repo.get_by_day.side_effect = lambda day, track_slug="study": lesson if day == 1 else None
    mock_item_progress_repo.list_for_user_and_day.return_value = []
    mock_section_progress_repo.list_for_user_and_day.side_effect = [
        [],
        [LessonSectionProgress("user-1", 1, "phrases")],
        [LessonSectionProgress("user-1", 1, "phrases")],
    ]

    result = product_service.complete_lesson_section(user, 1, "phrases")

    assert result.progress_percent == 17
    assert result.lesson_completed is False
    assert result.xp_awarded == 10
    mock_section_progress_repo.mark_completed.assert_called_once_with(
        user_id="user-1",
        lesson_day=1,
        section="phrases",
        track_slug="study",
    )
    mock_user_repo.update_learning_stats.assert_called_once()

def test_complete_lesson_section_returns_track_current_day_after_completion(
    mock_lesson_repo,
    mock_progress_repo,
    mock_section_progress_repo,
    mock_item_progress_repo,
    mock_user_repo,
    mock_knowledge_service,
):
    track_progress_repo = Mock()
    service = ProductService(
        lesson_repository=mock_lesson_repo,
        progress_repository=mock_progress_repo,
        section_progress_repository=mock_section_progress_repo,
        item_progress_repository=mock_item_progress_repo,
        user_repository=mock_user_repo,
        knowledge_service=mock_knowledge_service,
        track_progress_repository=track_progress_repo,
        today_provider=lambda: date(2026, 4, 28),
    )
    user = User(id="user-1", email="test@example.com", password_hash="hash")
    day_one = Lesson(
        id="lesson-1", day=1, title="Day 1",
        essential_phrases=[], vocabulary_words=[], grammar_points=[],
        speaking_exercise="Speak", quiz=Quiz("Q", [])
    )
    day_two = Lesson(
        id="lesson-2", day=2, title="Day 2",
        essential_phrases=[], vocabulary_words=[], grammar_points=[],
        speaking_exercise="Speak", quiz=Quiz("Q", [])
    )
    mock_progress_repo.get_by_user_id.return_value = UserProgress(
        user_id="user-1", current_day=1, lessons_completed=[],
        xp_total=0, streak_days=0
    )
    track_progress_repo.get.return_value = UserTrackProgress(
        user_id="user-1",
        track_slug="study",
        current_day=1,
        lessons_completed=[],
    )
    mock_lesson_repo.get_by_day.side_effect = (
        lambda day, track_slug="study": day_one if day == 1 else day_two if day == 2 else None
    )
    completed_sections = [
        LessonSectionProgress("user-1", 1, "phrases"),
        LessonSectionProgress("user-1", 1, "vocabulary"),
        LessonSectionProgress("user-1", 1, "grammar"),
        LessonSectionProgress("user-1", 1, "grammar_practice"),
        LessonSectionProgress("user-1", 1, "speaking"),
        LessonSectionProgress("user-1", 1, "quiz"),
    ]
    mock_section_progress_repo.list_for_user_and_day.side_effect = [
        completed_sections[:-1],
        completed_sections,
        completed_sections,
    ]
    mock_item_progress_repo.list_for_user_and_day.return_value = []

    result = service.complete_lesson_section(user, 1, "quiz")

    assert result.lesson_completed is True
    assert result.current_day == 2
    track_progress_repo.save.assert_called_once()
    saved_progress = track_progress_repo.save.call_args[0][0]
    assert saved_progress.current_day == 2
    assert saved_progress.lessons_completed == [1]

def test_complete_lesson_item_awards_xp_once(
    product_service,
    mock_lesson_repo,
    mock_progress_repo,
    mock_section_progress_repo,
    mock_item_progress_repo,
    mock_user_repo,
):
    user = User(id="user-1", email="test@example.com", password_hash="hash")
    lesson = Lesson(
        id="lesson-1", day=1, title="Day 1",
        essential_phrases=[LearningPhrase(text="How are you?", translation="Como voce esta?", position=1)],
        vocabulary_words=[], grammar_points=[],
        speaking_exercise="Speak", quiz=Quiz("Q", [])
    )
    mock_progress_repo.get_by_user_id.return_value = UserProgress(
        user_id="user-1", current_day=1, lessons_completed=[],
        xp_total=0, streak_days=0
    )
    mock_lesson_repo.get_by_day.return_value = lesson
    mock_item_progress_repo.get.return_value = None
    mock_item_progress_repo.list_for_user_and_day.return_value = []
    mock_section_progress_repo.list_for_user_and_day.return_value = []

    result = product_service.complete_lesson_item(user, 1, "phrases", "1")

    assert result.xp_awarded == 2
    assert result.xp_total == 2
    assert result.streak == 1
    mock_item_progress_repo.mark_completed.assert_called_once()
    mock_user_repo.update_learning_stats.assert_called_once_with(
        user_id="user-1",
        xp=2,
        level=1,
        streak=1,
    )

def test_uncomplete_lesson_item_removes_progress_and_xp(
    product_service,
    mock_lesson_repo,
    mock_progress_repo,
    mock_section_progress_repo,
    mock_item_progress_repo,
    mock_user_repo,
):
    user = User(id="user-1", email="test@example.com", password_hash="hash")
    lesson = Lesson(
        id="lesson-1", day=1, title="Day 1",
        essential_phrases=[LearningPhrase(text="How are you?", translation="Como voce esta?", position=1)],
        vocabulary_words=[], grammar_points=[],
        speaking_exercise="Speak", quiz=Quiz("Q", [])
    )
    mock_progress_repo.get_by_user_id.return_value = UserProgress(
        user_id="user-1", current_day=1, lessons_completed=[],
        xp_total=2, streak_days=1
    )
    mock_lesson_repo.get_by_day.return_value = lesson
    mock_section_progress_repo.list_for_user_and_day.return_value = []
    mock_item_progress_repo.delete.return_value = LessonItemProgress(
        user_id="user-1",
        lesson_day=1,
        section="phrases",
        item_key="1",
        xp_awarded=2,
    )
    mock_item_progress_repo.list_for_user_and_day.return_value = []

    result = product_service.uncomplete_lesson_item(user, 1, "phrases", "1")

    assert result.xp_awarded == -2
    assert result.xp_total == 0
    assert result.plan.lesson.essential_phrases[0].text == "How are you?"
    mock_item_progress_repo.delete.assert_called_once_with(
        user_id="user-1",
        lesson_day=1,
        section="phrases",
        item_key="1",
        track_slug="study",
    )
    mock_user_repo.update_learning_stats.assert_called_once_with(
        user_id="user-1",
        xp=0,
        level=1,
        streak=1,
    )

def test_chat_calls_knowledge_service(product_service, mock_knowledge_service):
    mock_knowledge_service.api_key = "valid-key"
    mock_knowledge_service.ask_question.return_value = "AI Response"
    
    response = product_service.chat("How to say hello?")
    
    assert response.reply == "AI Response"
    mock_knowledge_service.ask_question.assert_called_once_with("How to say hello?")
