from abc import ABC, abstractmethod
from domain.entities.learning import DEFAULT_TRACK_SLUG
from domain.entities.learning import (
    Lesson,
    LessonItemProgress,
    LessonSectionProgress,
    LessonSummary,
    LearningTrack,
    UserTrackProgress,
    UserProgress,
)


class LearningTrackRepository(ABC):
    @abstractmethod
    def list_all(self) -> list[LearningTrack]:
        pass

    @abstractmethod
    def get_by_slug(self, slug: str) -> LearningTrack | None:
        pass

    @abstractmethod
    def get_active_track_slug(self, user_id: str) -> str | None:
        pass

    @abstractmethod
    def set_active_track_slug(self, user_id: str, track_slug: str) -> None:
        pass


class LessonRepository(ABC):
    @abstractmethod
    def get_by_day(self, day: int, track_slug: str = DEFAULT_TRACK_SLUG) -> Lesson | None:
        pass

    @abstractmethod
    def list_all(self, track_slug: str = DEFAULT_TRACK_SLUG) -> list[Lesson]:
        pass

    @abstractmethod
    def list_summaries(self, track_slug: str = DEFAULT_TRACK_SLUG) -> list[LessonSummary]:
        pass


class UserProgressRepository(ABC):
    @abstractmethod
    def get_by_user_id(self, user_id: str) -> UserProgress | None:
        pass

    @abstractmethod
    def save(self, progress: UserProgress) -> None:
        pass


class UserTrackProgressRepository(ABC):
    @abstractmethod
    def get(self, user_id: str, track_slug: str) -> UserTrackProgress | None:
        pass

    @abstractmethod
    def save(self, progress: UserTrackProgress) -> None:
        pass


class LessonSectionProgressRepository(ABC):
    @abstractmethod
    def list_for_user_and_day(
        self,
        user_id: str,
        lesson_day: int,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> list[LessonSectionProgress]:
        pass

    @abstractmethod
    def list_for_user_and_days(
        self,
        user_id: str,
        lesson_days: list[int],
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> list[LessonSectionProgress]:
        pass

    @abstractmethod
    def mark_completed(
        self,
        user_id: str,
        lesson_day: int,
        section: str,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> LessonSectionProgress:
        pass


class LessonItemProgressRepository(ABC):
    @abstractmethod
    def list_for_user_and_day(
        self,
        user_id: str,
        lesson_day: int,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> list[LessonItemProgress]:
        pass

    @abstractmethod
    def get(
        self,
        user_id: str,
        lesson_day: int,
        section: str,
        item_key: str,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> LessonItemProgress | None:
        pass

    @abstractmethod
    def mark_completed(
        self,
        user_id: str,
        lesson_day: int,
        section: str,
        item_key: str,
        xp_awarded: int,
        track_slug: str = DEFAULT_TRACK_SLUG,
        answer: str | None = None,
        is_correct: bool | None = None,
        score: int | None = None,
        feedback: dict[str, object] | None = None,
    ) -> LessonItemProgress:
        pass

    @abstractmethod
    def delete(
        self,
        user_id: str,
        lesson_day: int,
        section: str,
        item_key: str,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> LessonItemProgress | None:
        pass
