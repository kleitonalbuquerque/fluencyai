from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class User:
    id: str
    email: str
    password_hash: str
    xp: int = 0
    level: int = 1
    streak: int = 0
    created_at: datetime | None = None
    updated_at: datetime | None = None
