from unittest.mock import Mock
import pytest

from application.product.service import ProductService
from domain.entities.learning import Lesson, UserProgress, Quiz
from domain.entities.user import User

@pytest.fixture
def mock_lesson_repo():
    return Mock()

@pytest.fixture
def mock_progress_repo():
    return Mock()

@pytest.fixture
def mock_knowledge_service():
    return Mock()

@pytest.fixture
def product_service(mock_lesson_repo, mock_progress_repo, mock_knowledge_service):
    return ProductService(
        lesson_repository=mock_lesson_repo,
        progress_repository=mock_progress_repo,
        knowledge_service=mock_knowledge_service
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
    mock_lesson_repo.get_by_day.assert_called_with(3)

def test_chat_calls_knowledge_service(product_service, mock_knowledge_service):
    mock_knowledge_service.api_key = "valid-key"
    mock_knowledge_service.ask_question.return_value = "AI Response"
    
    response = product_service.chat("How to say hello?")
    
    assert response.reply == "AI Response"
    mock_knowledge_service.ask_question.assert_called_once_with("How to say hello?")
