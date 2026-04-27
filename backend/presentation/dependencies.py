from fastapi import Depends
from sqlalchemy.orm import Session

from application.auth.service import AuthService
from infrastructure.config.settings import Settings, get_settings
from infrastructure.database.session import get_db_session
from infrastructure.repositories.sqlalchemy_password_reset_token_repository import (
    SQLAlchemyPasswordResetTokenRepository,
)
from infrastructure.repositories.sqlalchemy_user_repository import SQLAlchemyUserRepository
from infrastructure.security.bcrypt_password_hasher import BcryptPasswordHasher
from infrastructure.security.jwt_token_service import JwtTokenService


def get_auth_service(
    db: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> AuthService:
    return AuthService(
        user_repository=SQLAlchemyUserRepository(db),
        password_hasher=BcryptPasswordHasher(),
        token_service=JwtTokenService(settings),
        password_reset_token_repository=SQLAlchemyPasswordResetTokenRepository(db),
        password_reset_token_expire_minutes=settings.password_reset_token_expire_minutes,
    )
