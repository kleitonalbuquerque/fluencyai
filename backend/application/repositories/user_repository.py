from typing import Protocol

from domain.entities.user import User


class UserRepository(Protocol):
    def get_by_email(self, email: str) -> User | None:
        raise NotImplementedError

    def create(self, email: str, password_hash: str) -> User:
        raise NotImplementedError
