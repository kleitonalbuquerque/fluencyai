from sqlalchemy import select
from sqlalchemy.orm import Session

from application.repositories.user_repository import UserRepository
from domain.entities.user import User
from infrastructure.database.models.user import UserModel


class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, user_id: str) -> User | None:
        model = self._session.get(UserModel, user_id)
        if model is None:
            return None
        return self._to_entity(model)

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

    def update_password_hash(self, user_id: str, password_hash: str) -> User:
        model = self._get_required_model(user_id)
        model.password_hash = password_hash
        self._session.commit()
        self._session.refresh(model)
        return self._to_entity(model)

    def update_avatar_url(self, user_id: str, avatar_url: str) -> User:
        model = self._get_required_model(user_id)
        model.avatar_url = avatar_url
        self._session.commit()
        self._session.refresh(model)
        return self._to_entity(model)

    def set_admin(self, user_id: str, is_admin: bool) -> User:
        model = self._get_required_model(user_id)
        model.is_admin = is_admin
        self._session.commit()
        self._session.refresh(model)
        return self._to_entity(model)

    def update_learning_stats(
        self,
        user_id: str,
        xp: int,
        level: int,
        streak: int,
    ) -> User:
        model = self._get_required_model(user_id)
        model.xp = xp
        model.level = level
        model.streak = streak
        self._session.commit()
        self._session.refresh(model)
        return self._to_entity(model)

    def _get_required_model(self, user_id: str) -> UserModel:
        model = self._session.get(UserModel, user_id)
        if model is None:
            raise ValueError("User not found")
        return model

    @staticmethod
    def _to_entity(model: UserModel) -> User:
        return User(
            id=model.id,
            email=model.email,
            password_hash=model.password_hash,
            xp=model.xp,
            level=model.level,
            streak=model.streak,
            is_admin=model.is_admin,
            avatar_url=model.avatar_url,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
