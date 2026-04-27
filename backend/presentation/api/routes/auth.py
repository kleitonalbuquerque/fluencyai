from fastapi import APIRouter, Depends, HTTPException, status

from application.auth.service import AuthService
from domain.exceptions import EmailAlreadyRegistered, InvalidCredentials
from presentation.dependencies import get_auth_service
from presentation.schemas.auth import AuthResponse, LoginRequest, SignupRequest

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
