from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, Query, status

from application.product.service import ProductService
from domain.exceptions import (
    InvalidLearningItem,
    InvalidLearningSection,
    LessonLocked,
    LessonNotFound,
    LessonSectionIncomplete,
)
from domain.entities.user import User
from presentation.dependencies import get_current_user, get_product_service
from presentation.schemas.product import (
    AiChatRequest,
    AiChatResponse,
    ActiveLearningTrackRequest,
    CompleteLessonItemRequest,
    CompleteLessonItemResponse,
    CompleteLessonSectionResponse,
    DailyImmersionPlanResponse,
    DailyImmersionPlanWithProgressResponse,
    GamificationSummaryResponse,
    GlobalRankingResponse,
    LessonHistoryResponse,
    LearningTrackResponse,
    MemorizationSessionResponse,
    RolePlayFeedbackResponse,
    RolePlayRequest,
    RolePlayScenarioListResponse,
    SocialShareResponse,
    WeeklyImmersionPlanResponse,
)

router = APIRouter(tags=["product"])


@router.get("/learning-tracks", response_model=list[LearningTrackResponse])
def list_learning_tracks(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> list[LearningTrackResponse]:
    _ = current_user
    return [
        LearningTrackResponse(**asdict(track))
        for track in product_service.list_learning_tracks()
    ]


@router.get("/learning-tracks/active", response_model=LearningTrackResponse)
def get_active_learning_track(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> LearningTrackResponse:
    track = product_service.get_active_learning_track(current_user)
    return LearningTrackResponse(**asdict(track))


@router.put("/learning-tracks/active", response_model=LearningTrackResponse)
def set_active_learning_track(
    payload: ActiveLearningTrackRequest,
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> LearningTrackResponse:
    try:
        track = product_service.set_active_learning_track(current_user, payload.track_slug)
    except LessonNotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning track not found",
        ) from exc
    return LearningTrackResponse(**asdict(track))


@router.get("/learning-plan/today", response_model=DailyImmersionPlanResponse)
def get_daily_immersion_plan(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> DailyImmersionPlanResponse:
    plan = product_service.get_daily_plan(current_user)
    return DailyImmersionPlanResponse(**asdict(plan))


@router.get("/learning-plan/weekly", response_model=WeeklyImmersionPlanResponse)
def get_weekly_immersion_plan(
    week_offset: int = Query(default=0, ge=-52, le=52),
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> WeeklyImmersionPlanResponse:
    try:
        plan = product_service.get_weekly_plan(current_user, week_offset=week_offset)
    except LessonNotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        ) from exc
    return WeeklyImmersionPlanResponse.from_entity(plan)


@router.get("/learning-plan/history", response_model=LessonHistoryResponse)
def get_immersion_plan_history(
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> LessonHistoryResponse:
    history = product_service.get_lesson_history(current_user)
    return LessonHistoryResponse.from_entity(history)


@router.get(
    "/learning-plan/history/day/{day}",
    response_model=DailyImmersionPlanWithProgressResponse,
)
def get_immersion_plan_history_day(
    day: int,
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> DailyImmersionPlanWithProgressResponse:
    try:
        plan = product_service.get_lesson_plan_for_day(current_user, day)
    except LessonLocked as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Lesson day is locked",
        ) from exc
    except LessonNotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        ) from exc
    return DailyImmersionPlanWithProgressResponse.from_entity(plan)


@router.get(
    "/learning-plan/day/{day}",
    response_model=DailyImmersionPlanWithProgressResponse,
)
def get_immersion_plan_day(
    day: int,
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> DailyImmersionPlanWithProgressResponse:
    try:
        plan = product_service.get_lesson_plan_for_day(current_user, day)
    except LessonLocked as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Lesson day is locked",
        ) from exc
    except LessonNotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        ) from exc
    return DailyImmersionPlanWithProgressResponse.from_entity(plan)


@router.post(
    "/learning-plan/day/{day}/items/{section}/{item_key}/complete",
    response_model=CompleteLessonItemResponse,
)
def complete_immersion_plan_item(
    day: int,
    section: str,
    item_key: str,
    payload: CompleteLessonItemRequest | None = None,
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> CompleteLessonItemResponse:
    try:
        result = product_service.complete_lesson_item(
            user=current_user,
            day=day,
            section=section,
            item_key=item_key,
            answer=payload.answer if payload else None,
        )
    except (InvalidLearningSection, InvalidLearningItem) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid learning item",
        ) from exc
    except LessonLocked as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Lesson day is locked",
        ) from exc
    except LessonNotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        ) from exc
    return CompleteLessonItemResponse.from_entity(result)


@router.delete(
    "/learning-plan/day/{day}/items/{section}/{item_key}/complete",
    response_model=CompleteLessonItemResponse,
)
def uncomplete_immersion_plan_item(
    day: int,
    section: str,
    item_key: str,
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> CompleteLessonItemResponse:
    try:
        result = product_service.uncomplete_lesson_item(
            user=current_user,
            day=day,
            section=section,
            item_key=item_key,
        )
    except (InvalidLearningSection, InvalidLearningItem) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid learning item",
        ) from exc
    except LessonLocked as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Lesson day is locked",
        ) from exc
    except LessonNotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        ) from exc
    return CompleteLessonItemResponse.from_entity(result)


@router.post(
    "/learning-plan/day/{day}/sections/{section}/complete",
    response_model=CompleteLessonSectionResponse,
)
def complete_immersion_plan_section(
    day: int,
    section: str,
    current_user: User = Depends(get_current_user),
    product_service: ProductService = Depends(get_product_service),
) -> CompleteLessonSectionResponse:
    try:
        result = product_service.complete_lesson_section(
            user=current_user,
            day=day,
            section=section,
        )
    except InvalidLearningSection as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid learning section",
        ) from exc
    except LessonSectionIncomplete as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Complete all section items before finishing this section",
        ) from exc
    except LessonLocked as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Lesson day is locked",
        ) from exc
    except LessonNotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        ) from exc
    return CompleteLessonSectionResponse.from_entity(result)


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
