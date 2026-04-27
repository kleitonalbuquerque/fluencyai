from abc import ABC, abstractmethod
from domain.entities.learning import Lesson, UserProgress


class LessonRepository(ABC):
    @abstractmethod
    def get_by_day(self, day: int) -> Lesson | None:
        pass

    @abstractmethod
    def list_all(self) -> list[Lesson]:
        pass


class UserProgressRepository(ABC):
    @abstractmethod
    def get_by_user_id(self, user_id: str) -> UserProgress | None:
        pass

    @abstractmethod
    def save(self, progress: UserProgress) -> None:
        pass
