from pydantic import BaseModel, EmailStr, Field

from application.auth.service import AuthResult, PasswordResetRequestResult
from domain.entities.user import User


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class AvatarUpdateRequest(BaseModel):
    avatar_url: str = Field(min_length=1, max_length=1_500_000)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    xp: int
    level: int
    streak: int
    avatar_url: str | None

    @classmethod
    def from_entity(cls, user: User) -> "UserResponse":
        return cls(
            id=user.id,
            email=user.email,
            xp=user.xp,
            level=user.level,
            streak=user.streak,
            avatar_url=user.avatar_url,
        )


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str

    @classmethod
    def from_auth_result(cls, result: AuthResult) -> "AuthResponse":
        return cls(
            user=UserResponse.from_entity(result.user),
            access_token=result.access_token,
            refresh_token=result.refresh_token,
            token_type=result.token_type,
        )


class PasswordResetRequestResponse(BaseModel):
    message: str

    @classmethod
    def from_result(
        cls,
        result: PasswordResetRequestResult,
    ) -> "PasswordResetRequestResponse":
        return cls(message=result.message)


class MessageResponse(BaseModel):
    message: str
