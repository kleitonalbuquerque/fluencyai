from dataclasses import asdict

from fastapi import APIRouter, Depends

from application.product.service import ProductService
from domain.entities.user import User
from presentation.dependencies import get_current_user, get_product_service
from presentation.schemas.product import (
    AiChatRequest,
    AiChatResponse,
    DailyImmersionPlanResponse,
    GamificationSummaryResponse,
    GlobalRankingResponse,
    MemorizationSessionResponse,
    RolePlayFeedbackResponse,
    RolePlayRequest,
    RolePlayScenarioListResponse,
    SocialShareResponse,
)

router = APIRouter(tags=["product"])


@router.get("/learning-plan/today", response_model=DailyImmersionPlanResponse)
def get_daily_immersion_plan(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> DailyImmersionPlanResponse:
    plan = product_service.get_daily_plan(current_user)
    return DailyImmersionPlanResponse(**asdict(plan))


@router.post("/ai/chat", response_model=AiChatResponse)
def chat_with_ai(
    payload: AiChatRequest,
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> AiChatResponse:
    _ = current_user
    feedback = product_service.chat(payload.message)
    return AiChatResponse(**asdict(feedback))


@router.get("/memorization/session", response_model=MemorizationSessionResponse)
def get_memorization_session(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> MemorizationSessionResponse:
    _ = current_user
    session = product_service.get_memorization_session()
    return MemorizationSessionResponse(**asdict(session))


@router.get("/role-play/scenarios", response_model=RolePlayScenarioListResponse)
def get_role_play_scenarios(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> RolePlayScenarioListResponse:
    _ = current_user
    scenarios = product_service.get_role_play_scenarios()
    return RolePlayScenarioListResponse(**asdict(scenarios))


@router.post("/role-play/respond", response_model=RolePlayFeedbackResponse)
def respond_to_role_play(
    payload: RolePlayRequest,
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> RolePlayFeedbackResponse:
    _ = current_user
    feedback = product_service.respond_role_play(payload.scenario, payload.message)
    return RolePlayFeedbackResponse(**asdict(feedback))


@router.get("/gamification/summary", response_model=GamificationSummaryResponse)
def get_gamification_summary(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> GamificationSummaryResponse:
    summary = product_service.get_gamification_summary(current_user)
    return GamificationSummaryResponse(**asdict(summary))


@router.get("/ranking/global", response_model=GlobalRankingResponse)
def get_global_ranking(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> GlobalRankingResponse:
    ranking = product_service.get_global_ranking(current_user)
    return GlobalRankingResponse(**asdict(ranking))


@router.get("/social/share/progress", response_model=SocialShareResponse)
def get_social_progress_share(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> SocialShareResponse:
    social_share = product_service.get_social_progress(current_user)
    return SocialShareResponse(**asdict(social_share))
