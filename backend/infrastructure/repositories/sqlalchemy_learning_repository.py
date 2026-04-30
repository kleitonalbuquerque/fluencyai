from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from application.repositories.learning_repository import (
    LessonItemProgressRepository,
    LessonRepository,
    LessonSectionProgressRepository,
    LearningTrackRepository,
    UserTrackProgressRepository,
    UserProgressRepository,
)
from domain.entities.learning import (
    DEFAULT_TRACK_SLUG,
    GrammarPracticeItem,
    Lesson,
    LessonItemProgress,
    LessonSummary,
    LearningTrack,
    LearningPhrase,
    LessonSectionProgress,
    VocabularyWord,
    GrammarPoint,
    Quiz,
    QuizQuestion,
    UserTrackProgress,
    UserProgress,
)
from infrastructure.database.models.learning import (
    GrammarPracticeItemModel,
    LearningTrackModel,
    LessonModel,
    LearningPhraseModel,
    VocabularyWordModel,
    GrammarPointModel,
    QuizModel,
    QuizQuestionModel,
    UserProgressModel,
    UserActiveTrackModel,
    UserTrackProgressModel,
    LessonSectionProgressModel,
    LessonItemProgressModel,
)


class SqlAlchemyLearningTrackRepository(LearningTrackRepository):
    def __init__(self, session: Session):
        self._session = session

    def list_all(self) -> list[LearningTrack]:
        stmt = select(LearningTrackModel).order_by(
            LearningTrackModel.position,
            LearningTrackModel.label,
        )
        models = self._session.execute(stmt).scalars().all()
        return [self._to_entity(model) for model in models]

    def get_by_slug(self, slug: str) -> LearningTrack | None:
        model = self._session.get(LearningTrackModel, slug)
        if model is None:
            return None
        return self._to_entity(model)

    def get_active_track_slug(self, user_id: str) -> str | None:
        model = self._session.get(UserActiveTrackModel, user_id)
        if model is None:
            return None
        return model.track_slug

    def set_active_track_slug(self, user_id: str, track_slug: str) -> None:
        model = self._session.get(UserActiveTrackModel, user_id)
        if model is None:
            model = UserActiveTrackModel(user_id=user_id, track_slug=track_slug)
            self._session.add(model)
        else:
            model.track_slug = track_slug
        self._session.commit()

    @staticmethod
    def _to_entity(model: LearningTrackModel) -> LearningTrack:
        return LearningTrack(
            slug=model.slug,
            label=model.label,
            description=model.description,
            position=model.position,
        )


class SqlAlchemyLessonRepository(LessonRepository):
    def __init__(self, session: Session):
        self._session = session

    def get_by_day(self, day: int, track_slug: str = DEFAULT_TRACK_SLUG) -> Lesson | None:
        stmt = (
            select(LessonModel, LearningTrackModel.label)
            .join(
                LearningTrackModel,
                LearningTrackModel.slug == LessonModel.track_slug,
                isouter=True,
            )
            .where(LessonModel.day == day)
            .where(LessonModel.track_slug == track_slug)
            .options(
                selectinload(LessonModel.phrases),
                selectinload(LessonModel.words),
                selectinload(LessonModel.grammar_points),
                selectinload(LessonModel.grammar_practice_items),
                selectinload(LessonModel.quiz).selectinload(QuizModel.questions),
            )
        )
        row = self._session.execute(stmt).one_or_none()
        if row is None:
            return None
        model, track_label = row
        return self._to_entity(model, track_label=track_label)

    def list_all(self, track_slug: str = DEFAULT_TRACK_SLUG) -> list[Lesson]:
        stmt = (
            select(LessonModel, LearningTrackModel.label)
            .join(
                LearningTrackModel,
                LearningTrackModel.slug == LessonModel.track_slug,
                isouter=True,
            )
            .where(LessonModel.track_slug == track_slug)
            .options(
                selectinload(LessonModel.phrases),
                selectinload(LessonModel.words),
                selectinload(LessonModel.grammar_points),
                selectinload(LessonModel.grammar_practice_items),
                selectinload(LessonModel.quiz).selectinload(QuizModel.questions),
            )
            .order_by(LessonModel.day)
        )
        rows = self._session.execute(stmt).all()
        return [self._to_entity(model, track_label=track_label) for model, track_label in rows]

    def list_summaries(self, track_slug: str = DEFAULT_TRACK_SLUG) -> list[LessonSummary]:
        stmt = (
            select(
                LessonModel.id,
                LessonModel.day,
                LessonModel.title,
                LessonModel.track_slug,
                LearningTrackModel.label,
            )
            .join(LearningTrackModel, LearningTrackModel.slug == LessonModel.track_slug)
            .where(LessonModel.track_slug == track_slug)
            .order_by(LessonModel.day)
        )
        rows = self._session.execute(stmt).all()
        return [
            LessonSummary(
                id=row.id,
                day=row.day,
                title=row.title,
                track_slug=row.track_slug,
                track_label=row.label,
            )
            for row in rows
        ]

    def _to_entity(self, model: LessonModel, track_label: str | None = None) -> Lesson:
        return Lesson(
            id=model.id,
            day=model.day,
            track_slug=model.track_slug,
            track_label=track_label or "Study",
            title=model.title,
            essential_phrases=[
                LearningPhrase(text=p.text, translation=p.translation, position=p.position)
                for p in model.phrases
            ],
            vocabulary_words=[
                VocabularyWord(
                    word=w.word,
                    theme=w.theme,
                    definition=w.definition,
                    example_sentence=w.example_sentence,
                    memory_tip=w.memory_tip,
                    position=w.position,
                )
                for w in model.words
            ],
            grammar_points=[
                GrammarPoint(
                    title=gp.title,
                    explanation=gp.explanation,
                    example=gp.example,
                    position=gp.position,
                )
                for gp in model.grammar_points
            ],
            grammar_practice_items=[
                GrammarPracticeItem(
                    title=item.title,
                    prompt=item.prompt,
                    options=item.options,
                    answer=item.answer,
                    explanation=item.explanation,
                    position=item.position,
                )
                for item in model.grammar_practice_items
            ],
            speaking_exercise=model.speaking_exercise,
            quiz=Quiz(
                title=model.quiz.title,
                questions=[
                    QuizQuestion(
                        prompt=q.prompt,
                        options=q.options,
                        answer=q.answer,
                        position=q.position,
                    )
                    for q in model.quiz.questions
                ],
            ),
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class SqlAlchemyUserProgressRepository(UserProgressRepository):
    def __init__(self, session: Session):
        self._session = session

    def get_by_user_id(self, user_id: str) -> UserProgress | None:
        stmt = select(UserProgressModel).where(UserProgressModel.user_id == user_id)
        model = self._session.execute(stmt).scalar_one_or_none()
        if not model:
            return None
        return self._to_entity(model)

    def save(self, progress: UserProgress) -> None:
        model = self._session.get(UserProgressModel, progress.user_id)
        if model:
            model.current_day = progress.current_day
            model.lessons_completed = progress.lessons_completed
            model.xp_total = progress.xp_total
            model.streak_days = progress.streak_days
            model.last_streak_date = progress.last_streak_date
        else:
            model = UserProgressModel(
                user_id=progress.user_id,
                current_day=progress.current_day,
                lessons_completed=progress.lessons_completed,
                xp_total=progress.xp_total,
                streak_days=progress.streak_days,
                last_streak_date=progress.last_streak_date,
            )
            self._session.add(model)
        self._session.commit()

    def _to_entity(self, model: UserProgressModel) -> UserProgress:
        return UserProgress(
            user_id=model.user_id,
            current_day=model.current_day,
            lessons_completed=model.lessons_completed,
            xp_total=model.xp_total,
            streak_days=model.streak_days,
            last_activity=model.last_activity,
            last_streak_date=model.last_streak_date,
        )


class SqlAlchemyUserTrackProgressRepository(UserTrackProgressRepository):
    def __init__(self, session: Session):
        self._session = session

    def get(self, user_id: str, track_slug: str) -> UserTrackProgress | None:
        stmt = (
            select(UserTrackProgressModel)
            .where(UserTrackProgressModel.user_id == user_id)
            .where(UserTrackProgressModel.track_slug == track_slug)
        )
        model = self._session.execute(stmt).scalar_one_or_none()
        if model is None:
            return None
        return self._to_entity(model)

    def save(self, progress: UserTrackProgress) -> None:
        stmt = (
            select(UserTrackProgressModel)
            .where(UserTrackProgressModel.user_id == progress.user_id)
            .where(UserTrackProgressModel.track_slug == progress.track_slug)
        )
        model = self._session.execute(stmt).scalar_one_or_none()
        if model is None:
            model = UserTrackProgressModel(
                user_id=progress.user_id,
                track_slug=progress.track_slug,
                current_day=progress.current_day,
                lessons_completed=progress.lessons_completed,
            )
            self._session.add(model)
        else:
            model.current_day = progress.current_day
            model.lessons_completed = progress.lessons_completed
        self._session.commit()

    @staticmethod
    def _to_entity(model: UserTrackProgressModel) -> UserTrackProgress:
        return UserTrackProgress(
            user_id=model.user_id,
            track_slug=model.track_slug,
            current_day=model.current_day,
            lessons_completed=model.lessons_completed,
            last_activity=model.last_activity,
        )


class SqlAlchemyLessonSectionProgressRepository(LessonSectionProgressRepository):
    def __init__(self, session: Session):
        self._session = session

    def list_for_user_and_day(
        self,
        user_id: str,
        lesson_day: int,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> list[LessonSectionProgress]:
        stmt = (
            select(LessonSectionProgressModel)
            .where(LessonSectionProgressModel.user_id == user_id)
            .where(LessonSectionProgressModel.track_slug == track_slug)
            .where(LessonSectionProgressModel.lesson_day == lesson_day)
            .order_by(LessonSectionProgressModel.section)
        )
        models = self._session.execute(stmt).scalars().all()
        return [self._to_entity(model) for model in models]

    def list_for_user_and_days(
        self,
        user_id: str,
        lesson_days: list[int],
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> list[LessonSectionProgress]:
        if not lesson_days:
            return []

        stmt = (
            select(LessonSectionProgressModel)
            .where(LessonSectionProgressModel.user_id == user_id)
            .where(LessonSectionProgressModel.track_slug == track_slug)
            .where(LessonSectionProgressModel.lesson_day.in_(lesson_days))
            .order_by(
                LessonSectionProgressModel.lesson_day,
                LessonSectionProgressModel.section,
            )
        )
        models = self._session.execute(stmt).scalars().all()
        return [self._to_entity(model) for model in models]

    def mark_completed(
        self,
        user_id: str,
        lesson_day: int,
        section: str,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> LessonSectionProgress:
        stmt = (
            select(LessonSectionProgressModel)
            .where(LessonSectionProgressModel.user_id == user_id)
            .where(LessonSectionProgressModel.track_slug == track_slug)
            .where(LessonSectionProgressModel.lesson_day == lesson_day)
            .where(LessonSectionProgressModel.section == section)
        )
        model = self._session.execute(stmt).scalar_one_or_none()
        if model is None:
            model = LessonSectionProgressModel(
                user_id=user_id,
                track_slug=track_slug,
                lesson_day=lesson_day,
                section=section,
            )
            self._session.add(model)
            self._session.commit()
            self._session.refresh(model)
        return self._to_entity(model)

    @staticmethod
    def _to_entity(model: LessonSectionProgressModel) -> LessonSectionProgress:
        return LessonSectionProgress(
            user_id=model.user_id,
            lesson_day=model.lesson_day,
            section=model.section,
            track_slug=model.track_slug,
            completed_at=model.completed_at,
        )


class SqlAlchemyLessonItemProgressRepository(LessonItemProgressRepository):
    def __init__(self, session: Session):
        self._session = session

    def list_for_user_and_day(
        self,
        user_id: str,
        lesson_day: int,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> list[LessonItemProgress]:
        stmt = (
            select(LessonItemProgressModel)
            .where(LessonItemProgressModel.user_id == user_id)
            .where(LessonItemProgressModel.track_slug == track_slug)
            .where(LessonItemProgressModel.lesson_day == lesson_day)
            .order_by(
                LessonItemProgressModel.section,
                LessonItemProgressModel.item_key,
            )
        )
        models = self._session.execute(stmt).scalars().all()
        return [self._to_entity(model) for model in models]

    def get(
        self,
        user_id: str,
        lesson_day: int,
        section: str,
        item_key: str,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> LessonItemProgress | None:
        stmt = (
            select(LessonItemProgressModel)
            .where(LessonItemProgressModel.user_id == user_id)
            .where(LessonItemProgressModel.track_slug == track_slug)
            .where(LessonItemProgressModel.lesson_day == lesson_day)
            .where(LessonItemProgressModel.section == section)
            .where(LessonItemProgressModel.item_key == item_key)
        )
        model = self._session.execute(stmt).scalar_one_or_none()
        if model is None:
            return None
        return self._to_entity(model)

    def mark_completed(
        self,
        user_id: str,
        lesson_day: int,
        section: str,
        item_key: str,
        xp_awarded: int,
        track_slug: str = DEFAULT_TRACK_SLUG,
        answer: str | None = None,
        is_correct: bool | None = None,
        score: int | None = None,
        feedback: dict[str, object] | None = None,
    ) -> LessonItemProgress:
        existing = self.get(user_id, lesson_day, section, item_key, track_slug)
        if existing is not None:
            return existing

        model = LessonItemProgressModel(
            user_id=user_id,
            track_slug=track_slug,
            lesson_day=lesson_day,
            section=section,
            item_key=item_key,
            answer=answer,
            is_correct=is_correct,
            score=score,
            feedback=feedback,
            xp_awarded=xp_awarded,
        )
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_entity(model)

    def delete(
        self,
        user_id: str,
        lesson_day: int,
        section: str,
        item_key: str,
        track_slug: str = DEFAULT_TRACK_SLUG,
    ) -> LessonItemProgress | None:
        stmt = (
            select(LessonItemProgressModel)
            .where(LessonItemProgressModel.user_id == user_id)
            .where(LessonItemProgressModel.track_slug == track_slug)
            .where(LessonItemProgressModel.lesson_day == lesson_day)
            .where(LessonItemProgressModel.section == section)
            .where(LessonItemProgressModel.item_key == item_key)
        )
        model = self._session.execute(stmt).scalar_one_or_none()
        if model is None:
            return None

        entity = self._to_entity(model)
        self._session.delete(model)
        self._session.commit()
        return entity

    @staticmethod
    def _to_entity(model: LessonItemProgressModel) -> LessonItemProgress:
        return LessonItemProgress(
            user_id=model.user_id,
            lesson_day=model.lesson_day,
            section=model.section,
            item_key=model.item_key,
            track_slug=model.track_slug,
            answer=model.answer,
            is_correct=model.is_correct,
            score=model.score,
            feedback=model.feedback,
            xp_awarded=model.xp_awarded,
            completed_at=model.completed_at,
        )
