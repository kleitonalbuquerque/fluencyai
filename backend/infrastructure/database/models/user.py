from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.database.base import Base


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
