from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class LearningPhrase:
    text: str
    translation: str


@dataclass(frozen=True, slots=True)
class VocabularyWord:
    word: str
    theme: str
    definition: str
    example_sentence: str
    memory_tip: str


@dataclass(frozen=True, slots=True)
class GrammarPoint:
    title: str
    explanation: str
    example: str


@dataclass(frozen=True, slots=True)
class QuizQuestion:
    prompt: str
    options: list[str]
    answer: str


@dataclass(frozen=True, slots=True)
class Quiz:
    title: str
    questions: list[QuizQuestion]


@dataclass(frozen=True, slots=True)
class Lesson:
    id: str
    day: int
    title: str
    essential_phrases: list[LearningPhrase]
    vocabulary_words: list[VocabularyWord]
    grammar_points: list[GrammarPoint]
    speaking_exercise: str
    quiz: Quiz
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class UserProgress:
    user_id: str
    current_day: int
    lessons_completed: list[int]
    xp_total: int
    streak_days: int
    last_activity: datetime | None = None


@dataclass(frozen=True, slots=True)
class AiChatFeedback:
    reply: str
    correction: str
    suggested_vocabulary: list[str]


@dataclass(frozen=True, slots=True)
class MemorizationSession:
    target_accuracy: int
    words: list[VocabularyWord]


@dataclass(frozen=True, slots=True)
class RolePlayScenario:
    slug: str
    title: str
    situation: str
    first_prompt: str


@dataclass(frozen=True, slots=True)
class RolePlayScenarioList:
    scenarios: list[RolePlayScenario]


@dataclass(frozen=True, slots=True)
class RolePlayFeedback:
    scenario: str
    correction: str
    suggested_vocabulary: list[str]
    next_prompt: str


@dataclass(frozen=True, slots=True)
class GamificationSummary:
    xp: int
    level: int
    streak: int
    words_learned: int
    next_level_xp: int


@dataclass(frozen=True, slots=True)
class RankingEntry:
    rank: int
    email: str
    xp: int
    level: int
    streak: int


@dataclass(frozen=True, slots=True)
class GlobalRanking:
    entries: list[RankingEntry]


@dataclass(frozen=True, slots=True)
class SocialShare:
    share_text: str
    share_url: str
