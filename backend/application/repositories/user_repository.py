from typing import Protocol

from domain.entities.user import User


class UserRepository(Protocol):
    def get_by_id(self, user_id: str) -> User | None:
        raise NotImplementedError

    def get_by_email(self, email: str) -> User | None:
        raise NotImplementedError

    def create(self, email: str, password_hash: str) -> User:
        raise NotImplementedError

    def update_password_hash(self, user_id: str, password_hash: str) -> User:
        raise NotImplementedError

    def update_avatar_url(self, user_id: str, avatar_url: str) -> User:
        raise NotImplementedError

    def set_admin(self, user_id: str, is_admin: bool) -> User:
        raise NotImplementedError

    def update_learning_stats(
        self,
        user_id: str,
        xp: int,
        level: int,
        streak: int,
    ) -> User:
        raise NotImplementedError
