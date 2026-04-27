from fastapi import APIRouter, Depends, HTTPException, status

from application.auth.service import AuthService
from domain.exceptions import EmailAlreadyRegistered, InvalidCredentials
from presentation.dependencies import get_auth_service
from presentation.dependencies import get_current_user
from presentation.schemas.auth import (
    AuthResponse,
    AvatarUpdateRequest,
    ChangePasswordRequest,
    LoginRequest,
    MessageResponse,
    PasswordResetRequest,
    PasswordResetRequestResponse,
    SignupRequest,
    UserResponse,
)
from domain.entities.user import User

router = APIRouter(tags=["auth"])


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    payload: SignupRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    try:
        result = auth_service.signup(email=payload.email, password=payload.password)
    except EmailAlreadyRegistered as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from exc
    return AuthResponse.from_auth_result(result)


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    try:
        result = auth_service.login(email=payload.email, password=payload.password)
    except InvalidCredentials as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        ) from exc
    return AuthResponse.from_auth_result(result)


@router.post("/password-reset/request", response_model=PasswordResetRequestResponse)
def request_password_reset(
    payload: PasswordResetRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> PasswordResetRequestResponse:
    result = auth_service.request_password_reset(email=payload.email)
    return PasswordResetRequestResponse.from_result(result)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.from_entity(current_user)


@router.patch("/me/password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    try:
        auth_service.change_password(
            user_id=current_user.id,
            current_password=payload.current_password,
            new_password=payload.new_password,
        )
    except InvalidCredentials as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        ) from exc
    return MessageResponse(message="Password updated successfully")


@router.put("/me/avatar", response_model=UserResponse)
def update_avatar(
    payload: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    if not payload.avatar_url.startswith("data:image/"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Avatar must be an image data URL",
        )

    user = auth_service.update_avatar(
        user_id=current_user.id,
        avatar_url=payload.avatar_url,
    )
    return UserResponse.from_entity(user)
