import json
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Callable, ClassVar, List

from groq import Groq
from pypdf import PdfReader

from domain.entities.knowledge import KnowledgeSource, KnowledgeSourceType

_GROQ_MODEL = "llama-3.3-70b-versatile"

_FALLBACK_CHAT_RESPONSE = {
    "reply": "I don't have that information in my current knowledge base.",
    "correction": "",
    "suggested_vocabulary": [],
}


class KnowledgeService:
    _compression_cache: ClassVar[dict[tuple[str, str, float, int], str]] = {}

    def __init__(
        self,
        kb_dir: str,
        api_key: str,
        caveman_enabled: bool = True,
        caveman_bin: str = "/usr/local/bin/caveman",
        caveman_timeout_seconds: int = 10,
        caveman_compressor: Callable[[str], str] | None = None,
    ):
        self.kb_dir = Path(kb_dir)
        self.api_key = api_key
        self.caveman_enabled = caveman_enabled
        self.caveman_bin = caveman_bin
        self.caveman_timeout_seconds = caveman_timeout_seconds
        self._caveman_compressor = caveman_compressor
        self._client = Groq(api_key=api_key) if api_key else None

    def list_sources(self) -> List[KnowledgeSource]:
        sources = []
        if not self.kb_dir.exists():
            return sources
        for file_path in self.kb_dir.iterdir():
            if file_path.suffix.lower() == ".md":
                sources.append(self._load_markdown(file_path))
            elif file_path.suffix.lower() == ".pdf":
                sources.append(self._load_pdf(file_path))
        return sources

    def get_consolidated_context(self, compress: bool = False) -> str:
        sources = self.list_sources()
        context_parts = []
        for src in sources:
            content = self._compressed_source_content(src) if compress else src.content
            context_parts.append(f"--- DOCUMENT: {src.name} ({src.type}) ---\n{content}")
        return "\n\n".join(context_parts)

    @classmethod
    def clear_compression_cache(cls) -> None:
        cls._compression_cache.clear()

    def ask_question(self, question: str) -> str:
        context = self.get_consolidated_context(compress=self.caveman_enabled)
        prompt = (
            "You are an assistant for FluencyAI. Answer strictly based on the provided knowledge base.\n"
            "If the answer is not in the context, say exactly: "
            "\"I don't have that information in my current knowledge base.\"\n"
            "The knowledge base may be in caveman-compressed format. "
            "Missing grammar/connectives are intentional; preserve and use only the factual content.\n\n"
            f"KNOWLEDGE BASE:\n{context}\n\n"
            f"USER QUESTION:\n{question}\n\n"
            "ANSWER:"
        )
        return self._chat(prompt)

    def analyze_message(self, message: str) -> dict:
        context = self.get_consolidated_context(compress=self.caveman_enabled)
        prompt = (
            "You are Sofia, an English teacher at FluencyAI. "
            "Your student is a Brazilian Portuguese native speaker, likely at A1–B1 level.\n\n"
            "STRICT RULES — apply to every single response:\n"
            "1. ALWAYS reply in English only. Never use Portuguese, Mandarin, Russian, Spanish, or any other language.\n"
            "2. If the student writes in Portuguese, gently encourage them to try in English, then reply in English.\n"
            "3. Every reply must have a clear teaching purpose: explain a grammar rule, introduce vocabulary, or reinforce correct usage.\n"
            "4. When correcting, briefly explain WHY it is wrong (e.g. verb tense, subject-verb agreement, missing article).\n"
            "5. Be warm, encouraging, and patient — like a good teacher, not a grader.\n"
            "6. If the knowledge base has relevant content (lesson topic, vocabulary list, grammar point), use it to enrich your reply.\n"
            "7. Keep replies concise and conversational — this is a chat session, not a lecture.\n\n"
            f"KNOWLEDGE BASE:\n{context}\n\n"
            f"STUDENT MESSAGE:\n{message}\n\n"
            "Respond ONLY with a valid JSON object — no markdown, no code fences — in this exact format:\n"
            '{"reply": "<your English teaching reply>", '
            '"correction": "<grammar or vocabulary correction with brief explanation, or empty string if the message is correct>", '
            '"suggested_vocabulary": ["word1", "word2", "word3"]}'
        )
        raw = self._chat(prompt)
        return self._parse_structured_response(raw)

    def _chat(self, prompt: str) -> str:
        if self._client is None:
            raise RuntimeError("Groq client not initialized — check GROQ_API_KEY.")
        completion = self._client.chat.completions.create(
            model=_GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return completion.choices[0].message.content

    @staticmethod
    def _parse_structured_response(raw: str) -> dict:
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
        try:
            parsed = json.loads(text)
            return {
                "reply": str(parsed.get("reply", "")),
                "correction": str(parsed.get("correction", "")),
                "suggested_vocabulary": list(parsed.get("suggested_vocabulary", [])),
            }
        except (json.JSONDecodeError, ValueError):
            return {
                "reply": raw,
                "correction": "",
                "suggested_vocabulary": [],
            }

    def _compress_text(self, text: str) -> str:
        if not text.strip():
            return text

        if self._caveman_compressor is not None:
            compressed = self._caveman_compressor(text).strip()
            return compressed or text

        caveman_path = Path(self.caveman_bin)
        if not caveman_path.is_file():
            return text

        input_path = None
        output_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                delete=False,
            ) as input_file:
                input_path = input_file.name
                input_file.write(text)

            with tempfile.NamedTemporaryFile(delete=False) as output_file:
                output_path = output_file.name

            subprocess.run(
                [str(caveman_path), "compress", "-f", input_path, "-o", output_path],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=self.caveman_timeout_seconds,
            )

            compressed = Path(output_path).read_text(encoding="utf-8").strip()
            return compressed or text
        except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
            return text
        finally:
            for path in (input_path, output_path):
                if path:
                    try:
                        Path(path).unlink(missing_ok=True)
                    except OSError:
                        pass

    def _compressed_source_content(self, source: KnowledgeSource) -> str:
        cache_key = (
            str(self.kb_dir.resolve()),
            source.id,
            source.last_updated.timestamp(),
            len(source.content),
        )
        cached_content = self._compression_cache.get(cache_key)
        if cached_content is not None:
            return cached_content
        compressed_content = self._compress_text(source.content)
        self._compression_cache[cache_key] = compressed_content
        return compressed_content

    def _load_markdown(self, path: Path) -> KnowledgeSource:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        return KnowledgeSource(
            id=path.name,
            name=path.name,
            type=KnowledgeSourceType.MARKDOWN,
            content=content,
            last_updated=datetime.fromtimestamp(path.stat().st_mtime),
        )

    def _load_pdf(self, path: Path) -> KnowledgeSource:
        try:
            reader = PdfReader(path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return KnowledgeSource(
                id=path.name,
                name=path.name,
                type=KnowledgeSourceType.PDF,
                content=text,
                last_updated=datetime.fromtimestamp(path.stat().st_mtime),
            )
        except Exception as e:
            return KnowledgeSource(
                id=path.name,
                name=path.name,
                type=KnowledgeSourceType.PDF,
                content=f"ERROR READING PDF: {str(e)}",
                last_updated=datetime.fromtimestamp(path.stat().st_mtime),
            )
