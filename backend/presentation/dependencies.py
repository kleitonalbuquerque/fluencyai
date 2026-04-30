import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from application.auth.service import AuthService
from application.product.service import ProductService
from application.ai.knowledge_service import KnowledgeService
from domain.entities.user import User
from infrastructure.config.settings import Settings, get_settings
from infrastructure.database.session import get_db_session
from infrastructure.repositories.sqlalchemy_password_reset_token_repository import (
    SQLAlchemyPasswordResetTokenRepository,
)
from infrastructure.repositories.sqlalchemy_user_repository import SQLAlchemyUserRepository
from infrastructure.repositories.sqlalchemy_learning_repository import (
    SqlAlchemyLearningTrackRepository,
    SqlAlchemyLessonItemProgressRepository,
    SqlAlchemyLessonRepository,
    SqlAlchemyLessonSectionProgressRepository,
    SqlAlchemyUserTrackProgressRepository,
    SqlAlchemyUserProgressRepository,
)
from infrastructure.security.bcrypt_password_hasher import BcryptPasswordHasher
from infrastructure.security.jwt_token_service import JwtTokenService

bearer_scheme = HTTPBearer(auto_error=False)
KNOWLEDGE_MANAGER_EMAIL = "kleiton2102@gmail.com"


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


def get_knowledge_service(
    settings: Settings = Depends(get_settings),
) -> KnowledgeService:
    return KnowledgeService(
        kb_dir=settings.knowledge_base_dir,
        api_key=settings.gemini_api_key,
        caveman_enabled=settings.caveman_enabled,
        caveman_bin=settings.caveman_bin,
        caveman_timeout_seconds=settings.caveman_timeout_seconds,
    )


def get_product_service(
    db: Session = Depends(get_db_session),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
) -> ProductService:
    return ProductService(
        lesson_repository=SqlAlchemyLessonRepository(db),
        progress_repository=SqlAlchemyUserProgressRepository(db),
        section_progress_repository=SqlAlchemyLessonSectionProgressRepository(db),
        item_progress_repository=SqlAlchemyLessonItemProgressRepository(db),
        user_repository=SQLAlchemyUserRepository(db),
        knowledge_service=knowledge_service,
        track_repository=SqlAlchemyLearningTrackRepository(db),
        track_progress_repository=SqlAlchemyUserTrackProgressRepository(db),
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    auth_service: AuthService = Depends(get_auth_service),
    settings: Settings = Depends(get_settings),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        ) from exc

    if payload.get("type") != "access" or not isinstance(payload.get("sub"), str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        return auth_service.get_profile(payload["sub"])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        ) from exc


def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted",
        )
    return current_user


def get_knowledge_manager_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if (
        not current_user.is_admin
        or current_user.email.strip().lower() != KNOWLEDGE_MANAGER_EMAIL
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted",
        )
    return current_user
