from dataclasses import dataclass

from application.repositories.user_repository import UserRepository
from application.security.password_hasher import PasswordHasher
from application.security.token_service import TokenPair, TokenService
from domain.entities.user import User
from domain.exceptions import EmailAlreadyRegistered, InvalidCredentials


@dataclass(frozen=True, slots=True)
class AuthResult:
    user: User
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        password_hasher: PasswordHasher,
        token_service: TokenService,
    ) -> None:
        self._user_repository = user_repository
        self._password_hasher = password_hasher
        self._token_service = token_service

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

    def _build_auth_result(self, user: User) -> AuthResult:
        token_pair: TokenPair = self._token_service.create_pair(subject=user.id)
        return AuthResult(
            user=user,
            access_token=token_pair.access_token,
            refresh_token=token_pair.refresh_token,
        )
