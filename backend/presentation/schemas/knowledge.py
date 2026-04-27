from datetime import datetime
from pydantic import BaseModel


class KnowledgeSourceResponse(BaseModel):
    id: str
    name: str
    type: str
    last_updated: datetime


class KnowledgeSourceListResponse(BaseModel):
    sources: list[KnowledgeSourceResponse]
