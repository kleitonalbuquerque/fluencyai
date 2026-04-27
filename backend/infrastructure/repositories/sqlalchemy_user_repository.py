from sqlalchemy import select
from sqlalchemy.orm import Session

from application.repositories.user_repository import UserRepository
from domain.entities.user import User
from infrastructure.database.models.user import UserModel


class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_email(self, email: str) -> User | None:
        statement = select(UserModel).where(UserModel.email == email)
        model = self._session.scalars(statement).first()
        if model is None:
            return None
        return self._to_entity(model)

    def create(self, email: str, password_hash: str) -> User:
        model = UserModel(email=email, password_hash=password_hash)
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_entity(model)

    @staticmethod
    def _to_entity(model: UserModel) -> User:
        return User(
            id=model.id,
            email=model.email,
            password_hash=model.password_hash,
            xp=model.xp,
            level=model.level,
            streak=model.streak,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
