class DomainError(Exception):
    """Base error for expected domain/application failures."""


class EmailAlreadyRegistered(DomainError):
    pass


class InvalidCredentials(DomainError):
    pass


class LessonNotFound(DomainError):
    pass


class LessonLocked(DomainError):
    pass


class InvalidLearningSection(DomainError):
    pass


class InvalidLearningItem(DomainError):
    pass


class LessonSectionIncomplete(DomainError):
    pass
