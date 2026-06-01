import json
from unittest.mock import Mock, patch, MagicMock

import pytest

from application.ai.knowledge_service import KnowledgeService


def _make_groq_mock(content: str) -> Mock:
    mock_instance = Mock()
    mock_completion = Mock()
    mock_completion.choices = [Mock()]
    mock_completion.choices[0].message.content = content
    mock_instance.chat.completions.create.return_value = mock_completion
    return mock_instance


@pytest.fixture
def mock_groq():
    with patch("application.ai.knowledge_service.Groq") as MockGroq:
        mock_instance = _make_groq_mock("Based on the documents, the capital of France is Paris.")
        MockGroq.return_value = mock_instance
        yield mock_instance


@pytest.fixture(autouse=True)
def clear_knowledge_compression_cache():
    KnowledgeService.clear_compression_cache()
    yield
    KnowledgeService.clear_compression_cache()


def test_knowledge_service_reads_markdown_files(tmp_path):
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    (kb_dir / "test.md").write_text("# Knowledge\nThis is a test fact.")

    service = KnowledgeService(kb_dir=str(kb_dir), api_key="fake-key", caveman_enabled=False)
    context = service.get_consolidated_context()

    assert "This is a test fact." in context


def test_knowledge_service_calls_groq_with_context(mock_groq, tmp_path):
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    (kb_dir / "test.md").write_text("The capital of France is Paris.")

    service = KnowledgeService(kb_dir=str(kb_dir), api_key="fake-key", caveman_enabled=False)
    answer = service.ask_question("What is the capital of France?")

    assert "Paris" in answer
    args, kwargs = mock_groq.chat.completions.create.call_args
    messages = kwargs.get("messages") or args[0]
    prompt = messages[-1]["content"]
    assert "The capital of France is Paris." in prompt
    assert "What is the capital of France?" in prompt


def test_knowledge_service_uses_caveman_compressed_context_in_prompt(mock_groq, tmp_path):
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    (kb_dir / "test.md").write_text("The FluencyAI roadmap has six learning sections.")

    mock_groq.chat.completions.create.return_value.choices[0].message.content = "The roadmap has six sections."

    service = KnowledgeService(
        kb_dir=str(kb_dir),
        api_key="fake-key",
        caveman_compressor=lambda text: "FluencyAI roadmap six learning sections.",
    )
    answer = service.ask_question("How many learning sections does the roadmap have?")

    assert "six sections" in answer
    args, kwargs = mock_groq.chat.completions.create.call_args
    messages = kwargs.get("messages") or args[0]
    prompt = messages[-1]["content"]
    assert "FluencyAI roadmap six learning sections." in prompt
    assert "The FluencyAI roadmap has six learning sections." not in prompt


def test_knowledge_service_falls_back_to_original_context_when_caveman_is_missing(tmp_path):
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    (kb_dir / "test.md").write_text("The FluencyAI agent must stay grounded.")

    service = KnowledgeService(
        kb_dir=str(kb_dir),
        api_key="fake-key",
        caveman_enabled=True,
        caveman_bin="/missing/caveman",
    )

    context = service.get_consolidated_context(compress=True)

    assert "The FluencyAI agent must stay grounded." in context


def test_knowledge_service_reuses_cached_caveman_context_for_unchanged_sources(tmp_path):
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    (kb_dir / "test.md").write_text("The FluencyAI roadmap has six learning sections.")
    calls = []

    def compress(text):
        calls.append(text)
        return "FluencyAI roadmap six learning sections."

    first_service = KnowledgeService(
        kb_dir=str(kb_dir),
        api_key="fake-key",
        caveman_compressor=compress,
    )
    second_service = KnowledgeService(
        kb_dir=str(kb_dir),
        api_key="fake-key",
        caveman_compressor=compress,
    )

    first_context = first_service.get_consolidated_context(compress=True)
    second_context = second_service.get_consolidated_context(compress=True)

    assert "FluencyAI roadmap six learning sections." in first_context
    assert "FluencyAI roadmap six learning sections." in second_context
    assert len(calls) == 1


def test_knowledge_service_analyze_message_returns_structured_feedback(tmp_path):
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    (kb_dir / "test.md").write_text("Use 'went' as the past tense of 'go'.")

    structured = {
        "reply": "Great sentence! Just one small thing.",
        "correction": "Say 'I went to the cafe yesterday' — 'went' is the past tense of 'go'.",
        "suggested_vocabulary": ["went", "yesterday", "actually"],
    }

    with patch("application.ai.knowledge_service.Groq") as MockGroq:
        mock_instance = _make_groq_mock(json.dumps(structured))
        MockGroq.return_value = mock_instance

        service = KnowledgeService(kb_dir=str(kb_dir), api_key="fake-key", caveman_enabled=False)
        result = service.analyze_message("I go to cafe yesterday")

    assert result["reply"] == structured["reply"]
    assert result["correction"] == structured["correction"]
    assert result["suggested_vocabulary"] == structured["suggested_vocabulary"]


def test_knowledge_service_analyze_message_falls_back_when_json_invalid(tmp_path):
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    (kb_dir / "test.md").write_text("Some content.")

    with patch("application.ai.knowledge_service.Groq") as MockGroq:
        mock_instance = _make_groq_mock("not valid json at all")
        MockGroq.return_value = mock_instance

        service = KnowledgeService(kb_dir=str(kb_dir), api_key="fake-key", caveman_enabled=False)
        result = service.analyze_message("Hello")

    assert "reply" in result
    assert "correction" in result
    assert "suggested_vocabulary" in result
    assert isinstance(result["suggested_vocabulary"], list)
