from collections.abc import Callable
from datetime import date, datetime, timedelta

from application.repositories.user_repository import UserRepository
from domain.entities.user import User
from domain.entities.learning import (
    DEFAULT_TRACK_SLUG,
    IMMERSION_SECTION_KEYS,
    IMMERSION_SECTION_LABELS,
    AiChatFeedback,
    CompleteLessonItemResult,
    CompleteLessonSectionResult,
    DailyLessonProgress,
    GamificationSummary,
    GlobalRanking,
    GrammarPracticeItem,
    GrammarPoint,
    LessonHistory,
    LessonHistoryEntry,
    LearningItemStatus,
    LearningTrack,
    LearningPhrase,
    Lesson,
    LessonItemProgress,
    LessonSectionProgress,
    LessonSummary,
    LearningSectionStatus,
    Quiz,
    QuizQuestion,
    RankingEntry,
    RolePlayFeedback,
    RolePlayScenario,
    RolePlayScenarioList,
    MemorizationSession,
    SocialShare,
    UserTrackProgress,
    UserProgress,
    VocabularyWord,
    WeeklyImmersionPlan,
    WeeklyRoadmapDay,
)
from domain.exceptions import (
    InvalidLearningItem,
    InvalidLearningSection,
    LessonLocked,
    LessonNotFound,
    LessonSectionIncomplete,
)
from application.repositories.learning_repository import (
    LessonItemProgressRepository,
    LessonRepository,
    LessonSectionProgressRepository,
    LearningTrackRepository,
    UserTrackProgressRepository,
    UserProgressRepository,
)
from application.ai.knowledge_service import KnowledgeService


WEEKDAY_LABELS = ("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN")
LEVEL_XP = 100
SECTION_BONUS_XP = 10
DAY_COMPLETION_BONUS_XP = 25
DEFAULT_TRACK = LearningTrack(
    slug=DEFAULT_TRACK_SLUG,
    label="Study",
    description="English for classes, self-study, and daily learning routines.",
    position=2,
)
TRACK_CATALOG = [
    LearningTrack("work", "Work", "Professional English for meetings, projects, and interviews.", 1),
    DEFAULT_TRACK,
    LearningTrack("travel", "Travel", "Airport, hotel, directions, and trip planning conversations.", 3),
    LearningTrack("dining", "Dining", "Restaurant, cafe, ordering, and social meal vocabulary.", 4),
    LearningTrack("sports", "Sports", "Practice conversations around games, teams, and performance.", 5),
    LearningTrack("leisure", "Leisure", "Movies, music, weekend plans, and casual conversations.", 6),
    LearningTrack("fitness", "Fitness", "Gym, health routines, training, and active lifestyle English.", 7),
    LearningTrack("hobbies", "Hobbies", "Personal interests, creative projects, and free-time topics.", 8),
]
ITEM_XP = {
    "phrases": 2,
    "vocabulary": 3,
    "grammar": 5,
    "grammar_practice_correct": 5,
    "grammar_practice_incorrect": 2,
    "speaking": 10,
    "quiz_correct": 5,
    "quiz_incorrect": 2,
}


class ProductService:
    def __init__(
        self, 
        lesson_repository: LessonRepository,
        progress_repository: UserProgressRepository,
        section_progress_repository: LessonSectionProgressRepository,
        item_progress_repository: LessonItemProgressRepository,
        user_repository: UserRepository,
        knowledge_service: KnowledgeService,
        track_repository: LearningTrackRepository | None = None,
        track_progress_repository: UserTrackProgressRepository | None = None,
        today_provider: Callable[[], date] | None = None,
    ):
        self._lesson_repository = lesson_repository
        self._progress_repository = progress_repository
        self._section_progress_repository = section_progress_repository
        self._item_progress_repository = item_progress_repository
        self._user_repository = user_repository
        self._knowledge_service = knowledge_service
        self._track_repository = track_repository
        self._track_progress_repository = track_progress_repository
        self._today_provider = today_provider or date.today

    def list_learning_tracks(self) -> list[LearningTrack]:
        if self._track_repository is None:
            return TRACK_CATALOG

        tracks = self._track_repository.list_all()
        return tracks if tracks else TRACK_CATALOG

    def get_active_learning_track(self, user: User) -> LearningTrack:
        active_slug = DEFAULT_TRACK_SLUG
        if self._track_repository is not None:
            active_slug = self._track_repository.get_active_track_slug(user.id) or DEFAULT_TRACK_SLUG

        return self._track_by_slug(active_slug) or DEFAULT_TRACK

    def set_active_learning_track(self, user: User, track_slug: str) -> LearningTrack:
        normalized_slug = track_slug.strip().lower()
        track = self._track_by_slug(normalized_slug)
        if track is None:
            raise LessonNotFound()

        if self._track_repository is not None:
            self._track_repository.set_active_track_slug(user.id, track.slug)
        self._ensure_progress(user)
        self._ensure_track_progress(user, track)
        return track

    def get_daily_plan(self, user: User) -> Lesson:
        track = self.get_active_learning_track(user)
        track_progress = self._ensure_track_progress(user, track)
        
        lesson = self._lesson_repository.get_by_day(track_progress.current_day, track.slug)
        if not lesson:
            # Fallback to day 1
            lesson = self._lesson_repository.get_by_day(1, track.slug)
        
        if not lesson:
            raise ValueError("No lessons found in the database. Please run seeding.")
        
        return lesson

    def get_weekly_plan(self, user: User, week_offset: int = 0) -> WeeklyImmersionPlan:
        track = self.get_active_learning_track(user)
        progress = self._ensure_track_progress(user, track)
        current_day = max(progress.current_day, 1)
        today = self._today()
        calendar_week_start = (
            today - timedelta(days=today.weekday()) + timedelta(days=week_offset * 7)
        )
        calendar_days = [
            calendar_week_start + timedelta(days=index)
            for index in range(7)
        ]
        base_week_start = ((current_day - 1) // 7) * 7 + 1
        week_start_day = max(1, base_week_start + (week_offset * 7))
        week_end_day = week_start_day + 6
        week_days = [
            week_start_day + index
            for index in range(7)
        ]
        week_lessons = {
            lesson.day: lesson
            for lesson in self._lesson_repository.list_summaries(track.slug)
            if lesson.day in week_days
        }
        section_progress = self._section_progress_repository.list_for_user_and_days(
            user.id,
            week_days,
            track_slug=track.slug,
        )
        completed_by_day = self._group_completed_sections(section_progress)

        roadmap_days = [
            self._build_roadmap_day(
                day=day,
                calendar_date=calendar_day,
                lesson=week_lessons.get(day),
                progress=progress,
                completed_sections=completed_by_day.get(day, set()),
                today=today,
            )
            for day, calendar_day in zip(week_days, calendar_days, strict=True)
        ]
        focus = self.get_lesson_plan_for_day(user, current_day)

        return WeeklyImmersionPlan(
            track=track,
            week_offset=week_offset,
            week_start_day=week_start_day,
            week_end_day=week_end_day,
            week_start_date=calendar_days[0],
            week_end_date=calendar_days[-1],
            current_day=current_day,
            days=roadmap_days,
            focus=focus,
        )

    def get_lesson_plan_for_day(self, user: User, day: int) -> DailyLessonProgress:
        track = self.get_active_learning_track(user)
        progress = self._ensure_track_progress(user, track)
        if day > progress.current_day:
            raise LessonLocked()

        lesson = self._lesson_repository.get_by_day(day, track.slug)
        if not lesson:
            raise LessonNotFound()

        section_progress = self._section_progress_repository.list_for_user_and_day(
            user.id,
            day,
            track_slug=track.slug,
        )
        item_progress = self._item_progress_repository.list_for_user_and_day(
            user.id,
            day,
            track_slug=track.slug,
        )
        completed_sections = {item.section: item for item in section_progress}
        completed_items = {
            (item.section, item.item_key): item
            for item in item_progress
        }
        force_completed = day in progress.lessons_completed or day < progress.current_day
        items = self._build_item_statuses(
            lesson=lesson,
            completed_items=completed_items,
            force_completed=force_completed,
            force_completed_sections=set(completed_sections),
        )
        sections = self._build_section_statuses(
            lesson=lesson,
            completed_sections=completed_sections,
            item_statuses=items,
            force_completed=force_completed,
        )

        return DailyLessonProgress(
            lesson=lesson,
            track=track,
            progress_percent=self._calculate_progress_percent(sections),
            sections=sections,
            items=items,
        )

    def get_lesson_history(self, user: User) -> LessonHistory:
        track = self.get_active_learning_track(user)
        progress = self._ensure_track_progress(user, track)
        lessons = [
            lesson
            for lesson in self._lesson_repository.list_summaries(track.slug)
            if lesson.day <= progress.current_day or lesson.day in progress.lessons_completed
        ]
        lessons.sort(key=lambda lesson: lesson.day)
        days = [lesson.day for lesson in lessons]
        section_progress = self._section_progress_repository.list_for_user_and_days(
            user.id,
            days,
            track_slug=track.slug,
        )
        completed_by_day = self._group_completed_sections(section_progress)
        completed_at_by_day = self._group_latest_completion(section_progress)

        entries = [
            LessonHistoryEntry(
                day=lesson.day,
                title=lesson.title,
                track_slug=track.slug,
                track_label=track.label,
                is_current=lesson.day == progress.current_day,
                is_completed=lesson.day in progress.lessons_completed
                or lesson.day < progress.current_day,
                progress_percent=(
                    100
                    if lesson.day in progress.lessons_completed or lesson.day < progress.current_day
                    else self._section_progress_percent(completed_by_day.get(lesson.day, set()))
                ),
                completed_at=completed_at_by_day.get(lesson.day),
            )
            for lesson in lessons
        ]

        return LessonHistory(track=track, entries=entries)

    def complete_lesson_item(
        self,
        user: User,
        day: int,
        section: str,
        item_key: str,
        answer: str | None = None,
    ) -> CompleteLessonItemResult:
        if section not in IMMERSION_SECTION_KEYS:
            raise InvalidLearningSection()

        track = self.get_active_learning_track(user)
        progress = self._ensure_progress(user)
        track_progress = self._ensure_track_progress(user, track)
        if day > track_progress.current_day:
            raise LessonLocked()

        lesson = self._lesson_repository.get_by_day(day, track.slug)
        if not lesson:
            raise LessonNotFound()

        normalized_item_key = item_key.strip()
        valid_keys = self._required_item_keys(lesson, section)
        if normalized_item_key not in valid_keys:
            raise InvalidLearningItem()

        if day < track_progress.current_day or day in track_progress.lessons_completed:
            plan = self.get_lesson_plan_for_day(user, day)
            return CompleteLessonItemResult(
                day=day,
                track_slug=track.slug,
                section=section,
                item_key=normalized_item_key,
                xp_awarded=0,
                xp_total=progress.xp_total,
                level=self._level_for_xp(progress.xp_total),
                streak=progress.streak_days,
                plan=plan,
            )

        answer_to_store = answer.strip() if isinstance(answer, str) else None
        is_correct: bool | None = None
        score: int | None = None
        speaking_feedback: dict[str, object] | None = None
        if section == "quiz":
            question = self._quiz_question_by_key(lesson, normalized_item_key)
            if question is None or answer_to_store not in question.options:
                raise InvalidLearningItem()
            is_correct = answer_to_store == question.answer
            xp_awarded = ITEM_XP["quiz_correct"] if is_correct else ITEM_XP["quiz_incorrect"]
        elif section == "grammar_practice":
            practice_item = self._grammar_practice_item_by_key(lesson, normalized_item_key)
            if practice_item is None or answer_to_store not in practice_item.options:
                raise InvalidLearningItem()
            is_correct = answer_to_store == practice_item.answer
            xp_awarded = (
                ITEM_XP["grammar_practice_correct"]
                if is_correct
                else ITEM_XP["grammar_practice_incorrect"]
            )
        elif section == "speaking":
            if not answer_to_store:
                raise InvalidLearningItem()
            xp_awarded = ITEM_XP[section]
            speaking_feedback = self._build_speaking_feedback(answer_to_store, lesson.speaking_exercise)
            score = int(speaking_feedback["score"])
        else:
            xp_awarded = ITEM_XP[section]

        existing = self._item_progress_repository.get(
            user_id=user.id,
            lesson_day=day,
            section=section,
            item_key=normalized_item_key,
            track_slug=track.slug,
        )
        if existing is not None:
            plan = self.get_lesson_plan_for_day(user, day)
            progress = self._ensure_progress(user)
            return CompleteLessonItemResult(
                day=day,
                track_slug=track.slug,
                section=section,
                item_key=normalized_item_key,
                xp_awarded=0,
                xp_total=progress.xp_total,
                level=self._level_for_xp(progress.xp_total),
                streak=progress.streak_days,
                plan=plan,
            )

        self._item_progress_repository.mark_completed(
            user_id=user.id,
            lesson_day=day,
            section=section,
            item_key=normalized_item_key,
            xp_awarded=xp_awarded,
            track_slug=track.slug,
            answer=answer_to_store,
            is_correct=is_correct,
            score=score,
            feedback=speaking_feedback,
        )
        progress = self._apply_gamification(progress, user.id, xp_awarded)
        plan = self.get_lesson_plan_for_day(user, day)

        return CompleteLessonItemResult(
            day=day,
            track_slug=track.slug,
            section=section,
            item_key=normalized_item_key,
            xp_awarded=xp_awarded,
            xp_total=progress.xp_total,
            level=self._level_for_xp(progress.xp_total),
            streak=progress.streak_days,
            plan=plan,
        )

    def uncomplete_lesson_item(
        self,
        user: User,
        day: int,
        section: str,
        item_key: str,
    ) -> CompleteLessonItemResult:
        if section not in IMMERSION_SECTION_KEYS:
            raise InvalidLearningSection()

        track = self.get_active_learning_track(user)
        progress = self._ensure_progress(user)
        track_progress = self._ensure_track_progress(user, track)
        if day > track_progress.current_day:
            raise LessonLocked()

        lesson = self._lesson_repository.get_by_day(day, track.slug)
        if not lesson:
            raise LessonNotFound()

        normalized_item_key = item_key.strip()
        valid_keys = self._required_item_keys(lesson, section)
        if normalized_item_key not in valid_keys:
            raise InvalidLearningItem()

        if day < track_progress.current_day or day in track_progress.lessons_completed:
            plan = self.get_lesson_plan_for_day(user, day)
            return CompleteLessonItemResult(
                day=day,
                track_slug=track.slug,
                section=section,
                item_key=normalized_item_key,
                xp_awarded=0,
                xp_total=progress.xp_total,
                level=self._level_for_xp(progress.xp_total),
                streak=progress.streak_days,
                plan=plan,
            )

        section_progress = self._section_progress_repository.list_for_user_and_day(
            user.id,
            day,
            track_slug=track.slug,
        )
        if any(item.section == section for item in section_progress):
            raise InvalidLearningItem()

        removed = self._item_progress_repository.delete(
            user_id=user.id,
            lesson_day=day,
            section=section,
            item_key=normalized_item_key,
            track_slug=track.slug,
        )
        if removed is None:
            plan = self.get_lesson_plan_for_day(user, day)
            return CompleteLessonItemResult(
                day=day,
                track_slug=track.slug,
                section=section,
                item_key=normalized_item_key,
                xp_awarded=0,
                xp_total=progress.xp_total,
                level=self._level_for_xp(progress.xp_total),
                streak=progress.streak_days,
                plan=plan,
            )

        xp_total = max(0, progress.xp_total - removed.xp_awarded)
        progress = UserProgress(
            user_id=progress.user_id,
            current_day=progress.current_day,
            lessons_completed=progress.lessons_completed,
            xp_total=xp_total,
            streak_days=progress.streak_days,
            last_activity=progress.last_activity,
            last_streak_date=progress.last_streak_date,
        )
        self._progress_repository.save(progress)
        self._user_repository.update_learning_stats(
            user_id=user.id,
            xp=xp_total,
            level=self._level_for_xp(xp_total),
            streak=progress.streak_days,
        )
        plan = self.get_lesson_plan_for_day(user, day)

        return CompleteLessonItemResult(
            day=day,
            track_slug=track.slug,
            section=section,
            item_key=normalized_item_key,
            xp_awarded=-removed.xp_awarded,
            xp_total=progress.xp_total,
            level=self._level_for_xp(progress.xp_total),
            streak=progress.streak_days,
            plan=plan,
        )

    def complete_lesson_section(
        self,
        user: User,
        day: int,
        section: str,
    ) -> CompleteLessonSectionResult:
        if section not in IMMERSION_SECTION_KEYS:
            raise InvalidLearningSection()

        track = self.get_active_learning_track(user)
        progress = self._ensure_progress(user)
        track_progress = self._ensure_track_progress(user, track)
        if day > track_progress.current_day:
            raise LessonLocked()

        lesson = self._lesson_repository.get_by_day(day, track.slug)
        if not lesson:
            raise LessonNotFound()

        if day < track_progress.current_day or day in track_progress.lessons_completed:
            plan = self.get_lesson_plan_for_day(user, day)
            return CompleteLessonSectionResult(
                day=day,
                track_slug=track.slug,
                section=section,
                current_day=track_progress.current_day,
                lesson_completed=True,
                progress_percent=plan.progress_percent,
                sections=plan.sections,
                items=plan.items,
                xp_awarded=0,
                xp_total=progress.xp_total,
                level=self._level_for_xp(progress.xp_total),
                streak=progress.streak_days,
            )

        section_progress = self._section_progress_repository.list_for_user_and_day(
            user.id,
            day,
            track_slug=track.slug,
        )
        completed_section_names = {item.section for item in section_progress}
        item_progress = self._item_progress_repository.list_for_user_and_day(
            user.id,
            day,
            track_slug=track.slug,
        )
        completed_item_keys = {
            item.item_key
            for item in item_progress
            if item.section == section
        }
        required_item_keys = set(self._required_item_keys(lesson, section))
        if section not in completed_section_names and not required_item_keys.issubset(completed_item_keys):
            raise LessonSectionIncomplete()

        xp_awarded = 0
        if section not in completed_section_names:
            self._section_progress_repository.mark_completed(
                user_id=user.id,
                lesson_day=day,
                section=section,
                track_slug=track.slug,
            )
            xp_awarded += SECTION_BONUS_XP

        section_progress = self._section_progress_repository.list_for_user_and_day(
            user.id,
            day,
            track_slug=track.slug,
        )
        completed_sections = {item.section: item for item in section_progress}
        item_progress = self._item_progress_repository.list_for_user_and_day(
            user.id,
            day,
            track_slug=track.slug,
        )
        completed_items = {
            (item.section, item.item_key): item
            for item in item_progress
        }
        items = self._build_item_statuses(
            lesson=lesson,
            completed_items=completed_items,
            force_completed_sections=set(completed_sections),
        )
        sections = self._build_section_statuses(
            lesson=lesson,
            completed_sections=completed_sections,
            item_statuses=items,
        )
        progress_percent = self._calculate_progress_percent(sections)
        lesson_completed = progress_percent == 100
        current_day = track_progress.current_day

        if lesson_completed and day not in track_progress.lessons_completed:
            completed_lessons = sorted({*track_progress.lessons_completed, day})
            current_day = self._next_current_day(track_progress.current_day, day, track.slug)
            track_progress = UserTrackProgress(
                user_id=track_progress.user_id,
                track_slug=track.slug,
                current_day=current_day,
                lessons_completed=completed_lessons,
            )
            self._save_track_progress(track_progress)
            if self._track_progress_repository is None:
                progress = UserProgress(
                    user_id=progress.user_id,
                    current_day=current_day,
                    lessons_completed=completed_lessons,
                    xp_total=progress.xp_total,
                    streak_days=progress.streak_days,
                    last_activity=progress.last_activity,
                    last_streak_date=progress.last_streak_date,
                )
            xp_awarded += DAY_COMPLETION_BONUS_XP

        if xp_awarded > 0:
            progress = self._apply_gamification(progress, user.id, xp_awarded)

        plan = self.get_lesson_plan_for_day(user, day)
        return CompleteLessonSectionResult(
            day=day,
            track_slug=track.slug,
            section=section,
            current_day=current_day,
            lesson_completed=lesson_completed,
            progress_percent=progress_percent,
            sections=plan.sections,
            items=plan.items,
            xp_awarded=xp_awarded,
            xp_total=progress.xp_total,
            level=self._level_for_xp(progress.xp_total),
            streak=progress.streak_days,
        )

    def _ensure_progress(self, user: User) -> UserProgress:
        progress = self._progress_repository.get_by_user_id(user.id)
        if progress:
            return progress

        progress = UserProgress(
            user_id=user.id,
            current_day=1,
            lessons_completed=[],
            xp_total=0,
            streak_days=0,
        )
        self._progress_repository.save(progress)
        return progress

    def _ensure_track_progress(
        self,
        user: User,
        track: LearningTrack,
    ) -> UserTrackProgress:
        self._ensure_progress(user)

        if self._track_progress_repository is None:
            progress = self._progress_repository.get_by_user_id(user.id)
            return UserTrackProgress(
                user_id=user.id,
                track_slug=track.slug,
                current_day=progress.current_day if progress else 1,
                lessons_completed=progress.lessons_completed if progress else [],
                last_activity=progress.last_activity if progress else None,
            )

        progress = self._track_progress_repository.get(user.id, track.slug)
        if progress is not None:
            return progress

        legacy_progress = self._progress_repository.get_by_user_id(user.id)
        progress = UserTrackProgress(
            user_id=user.id,
            track_slug=track.slug,
            current_day=legacy_progress.current_day
            if legacy_progress and track.slug == DEFAULT_TRACK_SLUG
            else 1,
            lessons_completed=legacy_progress.lessons_completed
            if legacy_progress and track.slug == DEFAULT_TRACK_SLUG
            else [],
        )
        self._track_progress_repository.save(progress)
        return progress

    def _save_track_progress(self, progress: UserTrackProgress) -> None:
        if self._track_progress_repository is not None:
            self._track_progress_repository.save(progress)
            return

        global_progress = self._progress_repository.get_by_user_id(progress.user_id)
        if global_progress is None:
            return
        self._progress_repository.save(
            UserProgress(
                user_id=global_progress.user_id,
                current_day=progress.current_day,
                lessons_completed=progress.lessons_completed,
                xp_total=global_progress.xp_total,
                streak_days=global_progress.streak_days,
                last_activity=global_progress.last_activity,
                last_streak_date=global_progress.last_streak_date,
            )
        )

    def _track_by_slug(self, slug: str) -> LearningTrack | None:
        if self._track_repository is not None:
            track = self._track_repository.get_by_slug(slug)
            if track is not None:
                return track

        for track in TRACK_CATALOG:
            if track.slug == slug:
                return track
        return None

    def _apply_gamification(
        self,
        progress: UserProgress,
        user_id: str,
        xp_delta: int,
    ) -> UserProgress:
        if xp_delta <= 0:
            return progress

        today = self._today()
        streak_days = progress.streak_days
        if progress.last_streak_date == today:
            streak_days = progress.streak_days
        elif progress.last_streak_date == today - timedelta(days=1):
            streak_days = progress.streak_days + 1
        else:
            streak_days = 1

        xp_total = progress.xp_total + xp_delta
        updated = UserProgress(
            user_id=progress.user_id,
            current_day=progress.current_day,
            lessons_completed=progress.lessons_completed,
            xp_total=xp_total,
            streak_days=streak_days,
            last_activity=progress.last_activity,
            last_streak_date=today,
        )
        self._progress_repository.save(updated)
        self._user_repository.update_learning_stats(
            user_id=user_id,
            xp=xp_total,
            level=self._level_for_xp(xp_total),
            streak=streak_days,
        )
        return updated

    def _build_roadmap_day(
        self,
        day: int,
        calendar_date: date,
        lesson: Lesson | LessonSummary | None,
        progress: UserProgress | UserTrackProgress,
        completed_sections: set[str],
        today: date,
    ) -> WeeklyRoadmapDay:
        is_completed = lesson is not None and (
            day in progress.lessons_completed or day < progress.current_day
        )
        progress_percent = 100 if is_completed else self._section_progress_percent(completed_sections)
        return WeeklyRoadmapDay(
            day=day,
            weekday_label=WEEKDAY_LABELS[calendar_date.weekday()],
            calendar_date=calendar_date,
            calendar_day=calendar_date.day,
            title=lesson.title if lesson else "No lesson",
            is_current=calendar_date == today,
            is_locked=day > progress.current_day or lesson is None,
            is_completed=is_completed,
            has_lesson=lesson is not None,
            progress_percent=progress_percent,
        )

    def _today(self) -> date:
        return self._today_provider()

    def _build_section_statuses(
        self,
        lesson: Lesson,
        completed_sections: dict[str, LessonSectionProgress],
        item_statuses: list[LearningItemStatus],
        force_completed: bool = False,
    ) -> list[LearningSectionStatus]:
        item_counts = {
            "phrases": len(lesson.essential_phrases),
            "vocabulary": len(lesson.vocabulary_words),
            "grammar": len(lesson.grammar_points),
            "grammar_practice": len(lesson.grammar_practice_items),
            "speaking": 1 if lesson.speaking_exercise else 0,
            "quiz": len(lesson.quiz.questions),
        }

        statuses: list[LearningSectionStatus] = []
        for section in IMMERSION_SECTION_KEYS:
            progress = completed_sections.get(section)
            completed_count = sum(
                1
                for item in item_statuses
                if item.section == section and item.is_completed
            )
            statuses.append(
                LearningSectionStatus(
                    section=section,
                    label=IMMERSION_SECTION_LABELS[section],
                    is_completed=force_completed or progress is not None,
                    item_count=item_counts[section],
                    completed_count=item_counts[section] if force_completed or progress is not None else completed_count,
                    completed_at=getattr(progress, "completed_at", None),
                )
            )
        return statuses

    def _build_item_statuses(
        self,
        lesson: Lesson,
        completed_items: dict[tuple[str, str], LessonItemProgress],
        force_completed: bool = False,
        force_completed_sections: set[str] | None = None,
    ) -> list[LearningItemStatus]:
        force_completed_sections = force_completed_sections or set()
        statuses: list[LearningItemStatus] = []
        for section in IMMERSION_SECTION_KEYS:
            for item_key in self._required_item_keys(lesson, section):
                progress = completed_items.get((section, item_key))
                statuses.append(
                    LearningItemStatus(
                        section=section,
                        item_key=item_key,
                        is_completed=force_completed or section in force_completed_sections or progress is not None,
                        xp_awarded=getattr(progress, "xp_awarded", 0),
                        answer=getattr(progress, "answer", None),
                        is_correct=getattr(progress, "is_correct", None),
                        score=getattr(progress, "score", None),
                        feedback=getattr(progress, "feedback", None),
                        completed_at=getattr(progress, "completed_at", None),
                    )
                )
        return statuses

    @staticmethod
    def _calculate_progress_percent(sections: list[LearningSectionStatus]) -> int:
        completed_count = sum(1 for section in sections if section.is_completed)
        return round((completed_count / len(IMMERSION_SECTION_KEYS)) * 100)

    @staticmethod
    def _section_progress_percent(completed_sections: set[str]) -> int:
        completed_count = len(set(IMMERSION_SECTION_KEYS).intersection(completed_sections))
        return round((completed_count / len(IMMERSION_SECTION_KEYS)) * 100)

    @staticmethod
    def _group_completed_sections(
        section_progress: list[LessonSectionProgress],
    ) -> dict[int, set[str]]:
        completed_by_day: dict[int, set[str]] = {}
        for item in section_progress:
            completed_by_day.setdefault(item.lesson_day, set()).add(item.section)
        return completed_by_day

    @staticmethod
    def _group_latest_completion(
        section_progress: list[LessonSectionProgress],
    ) -> dict[int, datetime]:
        completed_at_by_day: dict[int, datetime] = {}
        for item in section_progress:
            if item.completed_at is None:
                continue
            current = completed_at_by_day.get(item.lesson_day)
            if current is None or item.completed_at > current:
                completed_at_by_day[item.lesson_day] = item.completed_at
        return completed_at_by_day

    def _next_current_day(
        self,
        current_day: int,
        completed_day: int,
        track_slug: str,
    ) -> int:
        if completed_day != current_day:
            return current_day

        next_day = current_day + 1
        if self._lesson_repository.get_by_day(next_day, track_slug):
            return next_day
        return current_day

    def _required_item_keys(self, lesson: Lesson, section: str) -> list[str]:
        if section == "phrases":
            return [
                self._item_key(item.position, index)
                for index, item in enumerate(lesson.essential_phrases)
            ]
        if section == "vocabulary":
            return [
                self._item_key(item.position, index)
                for index, item in enumerate(lesson.vocabulary_words)
            ]
        if section == "grammar":
            return [
                self._item_key(item.position, index)
                for index, item in enumerate(lesson.grammar_points)
            ]
        if section == "grammar_practice":
            return [
                self._item_key(item.position, index)
                for index, item in enumerate(lesson.grammar_practice_items)
            ]
        if section == "speaking":
            return ["practice"]
        if section == "quiz":
            return [
                self._item_key(item.position, index)
                for index, item in enumerate(lesson.quiz.questions)
            ]
        raise InvalidLearningSection()

    def _quiz_question_by_key(self, lesson: Lesson, item_key: str) -> QuizQuestion | None:
        for index, question in enumerate(lesson.quiz.questions):
            if self._item_key(question.position, index) == item_key:
                return question
        return None

    def _grammar_practice_item_by_key(
        self,
        lesson: Lesson,
        item_key: str,
    ) -> GrammarPracticeItem | None:
        for index, item in enumerate(lesson.grammar_practice_items):
            if self._item_key(item.position, index) == item_key:
                return item
        return None

    @staticmethod
    def _item_key(position: int, index: int) -> str:
        return str(position if position > 0 else index + 1)

    @staticmethod
    def _level_for_xp(xp: int) -> int:
        return max(1, (xp // LEVEL_XP) + 1)

    @staticmethod
    def _build_speaking_feedback(answer: str, prompt: str) -> dict[str, object]:
        words = [word.strip(".,!?;:").lower() for word in answer.split() if word.strip()]
        unique_words = set(words)
        has_goal = any(word in unique_words for word in {"goal", "want", "need", "improve", "practice"})
        has_confidence = any(word in unique_words for word in {"confident", "confidence", "speak", "english"})
        has_detail = len(words) >= 18
        score = 55 + (15 if has_goal else 0) + (15 if has_confidence else 0) + (15 if has_detail else 0)
        score = min(score, 95)

        strengths = []
        if has_goal:
            strengths.append("You mentioned a clear learning goal.")
        if has_confidence:
            strengths.append("You connected the answer to speaking confidence.")
        if has_detail:
            strengths.append("Your answer has enough detail for a short speaking practice.")
        if not strengths:
            strengths.append("You started with a complete practice response.")

        corrections = []
        lowered = answer.lower()
        if "i have" in lowered and "years" in lowered:
            corrections.append("For age, say 'I am 42 years old' instead of 'I have 42 years old'.")
        if "i will practice english everyday" in lowered:
            corrections.append("Use 'every day' as two words when it means each day.")
        if not corrections:
            corrections.append("Keep sentences short and include one concrete situation where you need English.")

        improved_answer = answer.strip()
        improved_answer = improved_answer.replace("i have", "I am")
        improved_answer = improved_answer.replace("I have", "I am")
        if "everyday" in improved_answer:
            improved_answer = improved_answer.replace("everyday", "every day")
        if len(improved_answer.split()) < 12:
            improved_answer = (
                f"{improved_answer.rstrip('.')} I want to improve my English so I can "
                "speak more confidently in real conversations."
            )

        return {
            "score": score,
            "prompt": prompt,
            "strengths": strengths,
            "corrections": corrections,
            "improved_answer": improved_answer,
            "next_step": "Read the improved answer aloud twice, then record a shorter version from memory.",
        }

    def chat(self, message: str) -> AiChatFeedback:
        try:
            if not self._knowledge_service.api_key:
                raise ValueError("API Key missing")
            
            ai_response = self._knowledge_service.ask_question(message)
            return AiChatFeedback(
                reply=ai_response,
                correction="Isso soa bem! Só uma coisinha pequena... (correção via IA pendente)",
                suggested_vocabulary=["actually", "usually", "vocabulary"]
            )
        except Exception as e:
            # Fallback mock for development or errors
            topic = message.strip() if message.strip() else "your sentence"
            return AiChatFeedback(
                reply=f"AI Service currently offline. You asked about: {topic}. Error: {str(e)}",
                correction=f"Isso soa bem! Só uma coisinha pequena... tente dizer '{topic}' melhor.",
                suggested_vocabulary=["actually", "usually", "reservation"]
            )

    def get_memorization_session(self) -> MemorizationSession:
        return MemorizationSession(target_accuracy=100, words=self._core_vocabulary()[:20])

    def get_role_play_scenarios(self) -> RolePlayScenarioList:
        return RolePlayScenarioList(
            scenarios=[
                RolePlayScenario(
                    slug="entrevista", title="Entrevista", 
                    situation="Responder perguntas sobre experiência e objetivos.", 
                    first_prompt="Tell me about your last project."
                ),
                RolePlayScenario(
                    slug="cafe", title="Café", 
                    situation="Pedir uma bebida.", 
                    first_prompt="Hi, what would you like?"
                ),
                RolePlayScenario(
                    slug="viagem", title="Viagem", 
                    situation="Informações no aeroporto.", 
                    first_prompt="Where are you traveling today?"
                )
            ]
        )

    def respond_role_play(self, scenario: str, message: str) -> RolePlayFeedback:
        return RolePlayFeedback(
            scenario=scenario,
            correction="Isso soa bem! Só uma coisinha pequena...",
            suggested_vocabulary=["I would like"],
            next_prompt="Anything else?"
        )

    def get_gamification_summary(self, user: User) -> GamificationSummary:
        return GamificationSummary(
            xp=user.xp,
            level=user.level,
            streak=user.streak,
            words_learned=user.xp // 10,
            next_level_xp=max(user.level * 100, 100)
        )

    def get_global_ranking(self, user: User) -> GlobalRanking:
        return GlobalRanking(
            entries=[
                RankingEntry(rank=1, email=user.email, xp=user.xp, level=user.level, streak=user.streak)
            ]
        )

    def get_social_progress(self, user: User) -> SocialShare:
        return SocialShare(
            share_text=f"Estou praticando no FluencyAI! Nível {user.level}.",
            share_url="http://localhost:3000/app"
        )

    def _core_vocabulary(self) -> list[VocabularyWord]:
        return [
            VocabularyWord("reservation", "viagem", "reserva", "I have a reservation.", "Tip"),
            VocabularyWord("station", "viagem", "estação", "The station is nearby.", "Tip"),
            VocabularyWord("ticket", "viagem", "passagem", "I need a ticket.", "Tip"),
            VocabularyWord("gate", "viagem", "portão", "The gate is open.", "Tip"),
            VocabularyWord("luggage", "viagem", "bagagem", "My luggage is heavy.", "Tip"),
            VocabularyWord("interview", "trabalho", "entrevista", "I have an interview.", "Tip"),
            VocabularyWord("experience", "trabalho", "experiência", "I have experience.", "Tip"),
            VocabularyWord("strength", "trabalho", "ponto forte", "My strength.", "Tip"),
            VocabularyWord("salary", "trabalho", "salário", "Salary range.", "Tip"),
            VocabularyWord("schedule", "rotina", "agenda", "Full schedule.", "Tip"),
            VocabularyWord("menu", "café", "cardápio", "Menu please.", "Tip"),
            VocabularyWord("receipt", "café", "recibo", "Receipt please.", "Tip"),
            VocabularyWord("table", "café", "mesa", "Table for two.", "Tip"),
            VocabularyWord("water", "café", "água", "Water please.", "Tip"),
            VocabularyWord("nearby", "localização", "perto", "Nearby cafe.", "Tip"),
            VocabularyWord("address", "localização", "endereço", "Address please.", "Tip"),
            VocabularyWord("slowly", "conversa", "devagar", "Speak slowly.", "Tip"),
            VocabularyWord("repeat", "conversa", "repetir", "Repeat please.", "Tip"),
            VocabularyWord("meaning", "conversa", "significado", "Meaning?", "Tip"),
            VocabularyWord("tomorrow", "tempo", "amanhã", "See you tomorrow.", "Tip"),
        ]
