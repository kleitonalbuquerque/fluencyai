from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class KnowledgeSourceType(str, Enum):
    MARKDOWN = "markdown"
    PDF = "pdf"
    DATABASE = "database"


@dataclass(frozen=True, slots=True)
class KnowledgeSource:
    id: str
    name: str
    type: KnowledgeSourceType
    content: str
    last_updated: datetime
