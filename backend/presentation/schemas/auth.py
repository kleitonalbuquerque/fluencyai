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


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    xp: int
    level: int
    streak: int

    @classmethod
    def from_entity(cls, user: User) -> "UserResponse":
        return cls(
            id=user.id,
            email=user.email,
            xp=user.xp,
            level=user.level,
            streak=user.streak,
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
