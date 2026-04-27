from datetime import datetime
from typing import Protocol

from domain.entities.password_reset_token import PasswordResetToken


class PasswordResetTokenRepository(Protocol):
    def create(
        self,
        user_id: str,
        token_hash: str,
        expires_at: datetime,
    ) -> PasswordResetToken:
        raise NotImplementedError
