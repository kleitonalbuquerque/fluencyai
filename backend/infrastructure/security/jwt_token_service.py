from datetime import UTC, datetime, timedelta

import jwt

from application.security.token_service import TokenPair, TokenService
from infrastructure.config.settings import Settings


class JwtTokenService(TokenService):
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def create_pair(self, subject: str) -> TokenPair:
        return TokenPair(
            access_token=self._encode(
                subject=subject,
                token_type="access",
                expires_delta=timedelta(
                    minutes=self._settings.jwt_access_token_expire_minutes,
                ),
            ),
            refresh_token=self._encode(
                subject=subject,
                token_type="refresh",
                expires_delta=timedelta(days=self._settings.jwt_refresh_token_expire_days),
            ),
        )

    def get_subject(self, token: str, expected_type: str) -> str:
        try:
            payload = jwt.decode(
                token,
                self._settings.jwt_secret_key,
                algorithms=[self._settings.jwt_algorithm],
            )
        except jwt.PyJWTError as exc:
            raise ValueError("Invalid token") from exc

        if payload.get("type") != expected_type or not isinstance(payload.get("sub"), str):
            raise ValueError("Invalid token")
        return payload["sub"]

    def _encode(
        self,
        subject: str,
        token_type: str,
        expires_delta: timedelta,
    ) -> str:
        now = datetime.now(UTC)
        payload = {
            "sub": subject,
            "type": token_type,
            "iat": now,
            "exp": now + expires_delta,
        }
        return jwt.encode(
            payload,
            self._settings.jwt_secret_key,
            algorithm=self._settings.jwt_algorithm,
        )
