from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import hashlib
import secrets

from application.repositories.password_reset_token_repository import (
    PasswordResetTokenRepository,
)
from application.repositories.user_repository import UserRepository
from application.security.password_hasher import PasswordHasher
from application.security.token_service import TokenPair, TokenService
from domain.entities.user import User
from domain.exceptions import EmailAlreadyRegistered, InvalidCredentials


PASSWORD_RESET_REQUEST_MESSAGE = (
    "If this email exists, password reset instructions will be sent."
)


@dataclass(frozen=True, slots=True)
class AuthResult:
    user: User
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@dataclass(frozen=True, slots=True)
class PasswordResetRequestResult:
    message: str = PASSWORD_RESET_REQUEST_MESSAGE


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        password_hasher: PasswordHasher,
        token_service: TokenService,
        password_reset_token_repository: PasswordResetTokenRepository,
        password_reset_token_expire_minutes: int,
    ) -> None:
        self._user_repository = user_repository
        self._password_hasher = password_hasher
        self._token_service = token_service
        self._password_reset_token_repository = password_reset_token_repository
        self._password_reset_token_expire_minutes = password_reset_token_expire_minutes

    def signup(self, email: str, password: str) -> AuthResult:
        normalized_email = email.strip().lower()
        if self._user_repository.get_by_email(normalized_email) is not None:
            raise EmailAlreadyRegistered()

        password_hash = self._password_hasher.hash(password)
        user = self._user_repository.create(
            email=normalized_email,
            password_hash=password_hash,
        )
        return self._build_auth_result(user)

    def login(self, email: str, password: str) -> AuthResult:
        normalized_email = email.strip().lower()
        user = self._user_repository.get_by_email(normalized_email)
        if user is None:
            raise InvalidCredentials()

        if not self._password_hasher.verify(password, user.password_hash):
            raise InvalidCredentials()

        return self._build_auth_result(user)

    def request_password_reset(self, email: str) -> PasswordResetRequestResult:
        normalized_email = email.strip().lower()
        user = self._user_repository.get_by_email(normalized_email)

        if user is not None:
            reset_token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(reset_token.encode("utf-8")).hexdigest()
            expires_at = datetime.now(UTC) + timedelta(
                minutes=self._password_reset_token_expire_minutes,
            )
            self._password_reset_token_repository.create(
                user_id=user.id,
                token_hash=token_hash,
                expires_at=expires_at,
            )

        return PasswordResetRequestResult()

    def _build_auth_result(self, user: User) -> AuthResult:
        token_pair: TokenPair = self._token_service.create_pair(subject=user.id)
        return AuthResult(
            user=user,
            access_token=token_pair.access_token,
            refresh_token=token_pair.refresh_token,
        )
