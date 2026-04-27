import os
from datetime import datetime
from pathlib import Path
from typing import List

import google.generativeai as genai
from pypdf import PdfReader

from domain.entities.knowledge import KnowledgeSource, KnowledgeSourceType


class KnowledgeService:
    def __init__(self, kb_dir: str, api_key: str):
        self.kb_dir = Path(kb_dir)
        self.api_key = api_key
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

    def get_consolidated_context(self) -> str:
        sources = self.list_sources()
        context_parts = []
        for src in sources:
            context_parts.append(f"--- DOCUMENT: {src.name} ({src.type}) ---\n{src.content}")
        
        return "\n\n".join(context_parts)

    def ask_question(self, question: str) -> str:
        context = self.get_consolidated_context()
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
You are an assistant for FluencyAI. Your primary goal is to answer questions strictly based on the provided knowledge base.
If the answer is not in the context, say exactly: "I don't have that information in my current knowledge base."

KNOWLEDGE BASE:
{context}

USER QUESTION:
{question}

ANSWER:
"""
        response = model.generate_content(prompt)
        return response.text

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
