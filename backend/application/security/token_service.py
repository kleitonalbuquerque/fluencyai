from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True, slots=True)
class TokenPair:
    access_token: str
    refresh_token: str


class TokenService(Protocol):
    def create_pair(self, subject: str) -> TokenPair:
        raise NotImplementedError
