from datetime import datetime
from uuid import uuid4

from datetime import date

from sqlalchemy import Boolean, Date, DateTime, Integer, String, Text, UniqueConstraint, func, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.database.base import Base


class LearningTrackModel(Base):
    __tablename__ = "learning_tracks"

    slug: Mapped[str] = mapped_column(String(40), primary_key=True)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class LessonModel(Base):
    __tablename__ = "lessons"
    __table_args__ = (
        UniqueConstraint("track_slug", "day", name="uq_lessons_track_day"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    track_slug: Mapped[str] = mapped_column(
        ForeignKey("learning_tracks.slug"),
        index=True,
        nullable=False,
        default="study",
        server_default="study",
    )
    day: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    speaking_exercise: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    phrases: Mapped[list["LearningPhraseModel"]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="LearningPhraseModel.position",
    )
    words: Mapped[list["VocabularyWordModel"]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="VocabularyWordModel.position",
    )
    grammar_points: Mapped[list["GrammarPointModel"]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="GrammarPointModel.position",
    )
    grammar_practice_items: Mapped[list["GrammarPracticeItemModel"]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="GrammarPracticeItemModel.position",
    )
    quiz: Mapped["QuizModel"] = relationship(back_populates="lesson", uselist=False, cascade="all, delete-orphan")


class LearningPhraseModel(Base):
    __tablename__ = "learning_phrases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    translation: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    lesson: Mapped[LessonModel] = relationship(back_populates="phrases")


class VocabularyWordModel(Base):
    __tablename__ = "vocabulary_words"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"), nullable=False)
    word: Mapped[str] = mapped_column(String(255), nullable=False)
    theme: Mapped[str] = mapped_column(String(255), nullable=False)
    definition: Mapped[str] = mapped_column(Text, nullable=False)
    example_sentence: Mapped[str] = mapped_column(Text, nullable=False)
    memory_tip: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    lesson: Mapped[LessonModel] = relationship(back_populates="words")


class GrammarPointModel(Base):
    __tablename__ = "grammar_points"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    example: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    lesson: Mapped[LessonModel] = relationship(back_populates="grammar_points")


class GrammarPracticeItemModel(Base):
    __tablename__ = "grammar_practice_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    lesson: Mapped[LessonModel] = relationship(back_populates="grammar_practice_items")


class QuizModel(Base):
    __tablename__ = "quizzes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)

    lesson: Mapped[LessonModel] = relationship(back_populates="quiz")
    questions: Mapped[list["QuizQuestionModel"]] = relationship(
        back_populates="quiz",
        cascade="all, delete-orphan",
        order_by="QuizQuestionModel.position",
    )


class QuizQuestionModel(Base):
    __tablename__ = "quiz_questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    quiz_id: Mapped[str] = mapped_column(ForeignKey("quizzes.id"), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    quiz: Mapped[QuizModel] = relationship(back_populates="questions")


class UserProgressModel(Base):
    __tablename__ = "user_progress"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    current_day: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    lessons_completed: Mapped[list[int]] = mapped_column(JSON, nullable=False, default=list)
    xp_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_activity: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    last_streak_date: Mapped[date | None] = mapped_column(Date, nullable=True)


class UserActiveTrackModel(Base):
    __tablename__ = "user_active_tracks"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    track_slug: Mapped[str] = mapped_column(
        ForeignKey("learning_tracks.slug"),
        nullable=False,
        default="study",
        server_default="study",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UserTrackProgressModel(Base):
    __tablename__ = "user_track_progress"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "track_slug",
            name="uq_user_track_progress_user_track",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    track_slug: Mapped[str] = mapped_column(
        ForeignKey("learning_tracks.slug"),
        index=True,
        nullable=False,
        default="study",
        server_default="study",
    )
    current_day: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    lessons_completed: Mapped[list[int]] = mapped_column(JSON, nullable=False, default=list)
    last_activity: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class LessonSectionProgressModel(Base):
    __tablename__ = "lesson_section_progress"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "track_slug",
            "lesson_day",
            "section",
            name="uq_lesson_section_progress_user_track_day_section",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    track_slug: Mapped[str] = mapped_column(
        ForeignKey("learning_tracks.slug"),
        index=True,
        nullable=False,
        default="study",
        server_default="study",
    )
    lesson_day: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    section: Mapped[str] = mapped_column(String(32), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


class LessonItemProgressModel(Base):
    __tablename__ = "lesson_item_progress"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "track_slug",
            "lesson_day",
            "section",
            "item_key",
            name="uq_lesson_item_progress_user_track_day_section_item",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    track_slug: Mapped[str] = mapped_column(
        ForeignKey("learning_tracks.slug"),
        index=True,
        nullable=False,
        default="study",
        server_default="study",
    )
    lesson_day: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    section: Mapped[str] = mapped_column(String(32), nullable=False)
    item_key: Mapped[str] = mapped_column(String(64), nullable=False)
    answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    xp_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
