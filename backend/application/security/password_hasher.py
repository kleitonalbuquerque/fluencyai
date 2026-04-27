from typing import Protocol


class PasswordHasher(Protocol):
    def hash(self, plain_password: str) -> str:
        raise NotImplementedError

    def verify(self, plain_password: str, password_hash: str) -> bool:
        raise NotImplementedError
