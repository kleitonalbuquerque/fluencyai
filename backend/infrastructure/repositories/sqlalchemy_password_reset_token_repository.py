from datetime import datetime

from sqlalchemy.orm import Session

from application.repositories.password_reset_token_repository import (
    PasswordResetTokenRepository,
)
from domain.entities.password_reset_token import PasswordResetToken
from infrastructure.database.models.password_reset_token import PasswordResetTokenModel


class SQLAlchemyPasswordResetTokenRepository(PasswordResetTokenRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(
        self,
        user_id: str,
        token_hash: str,
        expires_at: datetime,
    ) -> PasswordResetToken:
        model = PasswordResetTokenModel(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_entity(model)

    @staticmethod
    def _to_entity(model: PasswordResetTokenModel) -> PasswordResetToken:
        return PasswordResetToken(
            id=model.id,
            user_id=model.user_id,
            token_hash=model.token_hash,
            expires_at=model.expires_at,
            used_at=model.used_at,
            created_at=model.created_at,
        )
