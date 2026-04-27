from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from application.repositories.learning_repository import LessonRepository, UserProgressRepository
from domain.entities.learning import (
    Lesson, LearningPhrase, VocabularyWord, GrammarPoint, Quiz, QuizQuestion, UserProgress
)
from infrastructure.database.models.learning import (
    LessonModel, LearningPhraseModel, VocabularyWordModel, GrammarPointModel, 
    QuizModel, QuizQuestionModel, UserProgressModel
)


class SqlAlchemyLessonRepository(LessonRepository):
    def __init__(self, session: Session):
        self._session = session

    def get_by_day(self, day: int) -> Lesson | None:
        stmt = (
            select(LessonModel)
            .where(LessonModel.day == day)
            .options(
                joinedload(LessonModel.phrases),
                joinedload(LessonModel.words),
                joinedload(LessonModel.grammar_points),
                joinedload(LessonModel.quiz).joinedload(QuizModel.questions),
            )
        )
        model = self._session.execute(stmt).unique().scalar_one_or_none()
        if not model:
            return None
        return self._to_entity(model)

    def list_all(self) -> list[Lesson]:
        stmt = (
            select(LessonModel)
            .options(
                joinedload(LessonModel.phrases),
                joinedload(LessonModel.words),
                joinedload(LessonModel.grammar_points),
                joinedload(LessonModel.quiz).joinedload(QuizModel.questions),
            )
            .order_by(LessonModel.day)
        )
        models = self._session.execute(stmt).unique().scalars().all()
        return [self._to_entity(m) for m in models]

    def _to_entity(self, model: LessonModel) -> Lesson:
        return Lesson(
            id=model.id,
            day=model.day,
            title=model.title,
            essential_phrases=[
                LearningPhrase(text=p.text, translation=p.translation)
                for p in model.phrases
            ],
            vocabulary_words=[
                VocabularyWord(
                    word=w.word,
                    theme=w.theme,
                    definition=w.definition,
                    example_sentence=w.example_sentence,
                    memory_tip=w.memory_tip,
                )
                for w in model.words
            ],
            grammar_points=[
                GrammarPoint(
                    title=gp.title,
                    explanation=gp.explanation,
                    example=gp.example,
                )
                for gp in model.grammar_points
            ],
            speaking_exercise=model.speaking_exercise,
            quiz=Quiz(
                title=model.quiz.title,
                questions=[
                    QuizQuestion(
                        prompt=q.prompt,
                        options=q.options,
                        answer=q.answer,
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
        else:
            model = UserProgressModel(
                user_id=progress.user_id,
                current_day=progress.current_day,
                lessons_completed=progress.lessons_completed,
                xp_total=progress.xp_total,
                streak_days=progress.streak_days,
            )
            self._session.add(model)
        self._session.flush()

    def _to_entity(self, model: UserProgressModel) -> UserProgress:
        return UserProgress(
            user_id=model.user_id,
            current_day=model.current_day,
            lessons_completed=model.lessons_completed,
            xp_total=model.xp_total,
            streak_days=model.streak_days,
            last_activity=model.last_activity,
        )
