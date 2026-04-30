import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Callable, List

import google.generativeai as genai
from pypdf import PdfReader

from domain.entities.knowledge import KnowledgeSource, KnowledgeSourceType


class KnowledgeService:
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
        if api_key and api_key != "fake-key":
            genai.configure(api_key=api_key)

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
            content = self._compress_text(src.content) if compress else src.content
            context_parts.append(f"--- DOCUMENT: {src.name} ({src.type}) ---\n{content}")
        
        return "\n\n".join(context_parts)

    def ask_question(self, question: str) -> str:
        context = self.get_consolidated_context(compress=self.caveman_enabled)
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
You are an assistant for FluencyAI. Your primary goal is to answer questions strictly based on the provided knowledge base.
If the answer is not in the context, say exactly: "I don't have that information in my current knowledge base."
The knowledge base may be in caveman-compressed format. Missing grammar/connectives are intentional; preserve and use only the factual content present there.

KNOWLEDGE BASE:
{context}

USER QUESTION:
{question}

ANSWER:
"""
        response = model.generate_content(prompt)
        return response.text

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
                [
                    str(caveman_path),
                    "compress",
                    "-f",
                    input_path,
                    "-o",
                    output_path,
                ],
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

    def _load_markdown(self, path: Path) -> KnowledgeSource:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        return KnowledgeSource(
            id=path.name,
            name=path.name,
            type=KnowledgeSourceType.MARKDOWN,
            content=content,
            last_updated=datetime.fromtimestamp(path.stat().st_mtime)
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
                last_updated=datetime.fromtimestamp(path.stat().st_mtime)
            )
        except Exception as e:
            return KnowledgeSource(
                id=path.name,
                name=path.name,
                type=KnowledgeSourceType.PDF,
                content=f"ERROR READING PDF: {str(e)}",
                last_updated=datetime.fromtimestamp(path.stat().st_mtime)
            )
