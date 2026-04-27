from unittest.mock import Mock, patch
import pytest
from application.ai.knowledge_service import KnowledgeService

@pytest.fixture
def mock_gemini():
    with patch('google.generativeai.GenerativeModel') as mock:
        yield mock

def test_knowledge_service_reads_markdown_files(tmp_path):
    # Setup temporary knowledge base
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    (kb_dir / "test.md").write_text("# Knowledge\nThis is a test fact.")
    
    service = KnowledgeService(kb_dir=str(kb_dir), api_key="fake-key")
    context = service.get_consolidated_context()
    
    assert "This is a test fact." in context

def test_knowledge_service_calls_gemini_with_context(mock_gemini, tmp_path):
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    (kb_dir / "test.md").write_text("The capital of France is Paris.")
    
    # Setup mock behavior
    mock_model_instance = Mock()
    mock_gemini.return_value = mock_model_instance
    mock_response = Mock()
    mock_response.text = "Based on the documents, the capital of France is Paris."
    mock_model_instance.generate_content.return_value = mock_response
    
    service = KnowledgeService(kb_dir=str(kb_dir), api_key="fake-key")
    answer = service.ask_question("What is the capital of France?")
    
    assert "Paris" in answer
    # Verify context was passed
    args, kwargs = mock_model_instance.generate_content.call_args
    prompt = args[0]
    assert "The capital of France is Paris." in prompt
    assert "What is the capital of France?" in prompt
