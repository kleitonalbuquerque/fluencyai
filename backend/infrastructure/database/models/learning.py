from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Integer, String, Text, func, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.database.base import Base


class LessonModel(Base):
    __tablename__ = "lessons"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    day: Mapped[int] = mapped_column(Integer, unique=True, index=True, nullable=False)
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

    phrases: Mapped[list["LearningPhraseModel"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
    words: Mapped[list["VocabularyWordModel"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
    grammar_points: Mapped[list["GrammarPointModel"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
    quiz: Mapped["QuizModel"] = relationship(back_populates="lesson", uselist=False, cascade="all, delete-orphan")


class LearningPhraseModel(Base):
    __tablename__ = "learning_phrases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    translation: Mapped[str] = mapped_column(Text, nullable=False)

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

    lesson: Mapped[LessonModel] = relationship(back_populates="words")


class GrammarPointModel(Base):
    __tablename__ = "grammar_points"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    example: Mapped[str] = mapped_column(Text, nullable=False)

    lesson: Mapped[LessonModel] = relationship(back_populates="grammar_points")


class QuizModel(Base):
    __tablename__ = "quizzes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)

    lesson: Mapped[LessonModel] = relationship(back_populates="quiz")
    questions: Mapped[list["QuizQuestionModel"]] = relationship(back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestionModel(Base):
    __tablename__ = "quiz_questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    quiz_id: Mapped[str] = mapped_column(ForeignKey("quizzes.id"), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)

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
