class DomainError(Exception):
    """Base error for expected domain/application failures."""


class EmailAlreadyRegistered(DomainError):
    pass


class InvalidCredentials(DomainError):
    pass
