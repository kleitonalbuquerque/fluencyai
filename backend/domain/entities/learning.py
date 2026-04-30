from dataclasses import dataclass, field
from datetime import date, datetime

DEFAULT_TRACK_SLUG = "study"

IMMERSION_SECTION_KEYS = (
    "phrases",
    "vocabulary",
    "grammar",
    "grammar_practice",
    "speaking",
    "quiz",
)

IMMERSION_SECTION_LABELS = {
    "phrases": "Essential Phrases",
    "vocabulary": "Thematic Vocabulary",
    "grammar": "Grammar Points",
    "grammar_practice": "Verb & Structure Practice",
    "speaking": "Speaking Exercise",
    "quiz": "Final Quiz",
}


@dataclass(frozen=True, slots=True)
class LearningTrack:
    slug: str
    label: str
    description: str
    position: int = 0


@dataclass(frozen=True, slots=True)
class LearningPhrase:
    text: str
    translation: str
    position: int = 0


@dataclass(frozen=True, slots=True)
class VocabularyWord:
    word: str
    theme: str
    definition: str
    example_sentence: str
    memory_tip: str
    position: int = 0


@dataclass(frozen=True, slots=True)
class GrammarPoint:
    title: str
    explanation: str
    example: str
    position: int = 0


@dataclass(frozen=True, slots=True)
class GrammarPracticeItem:
    title: str
    prompt: str
    options: list[str]
    answer: str
    explanation: str
    position: int = 0


@dataclass(frozen=True, slots=True)
class QuizQuestion:
    prompt: str
    options: list[str]
    answer: str
    position: int = 0


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
    grammar_practice_items: list[GrammarPracticeItem] = field(default_factory=list)
    speaking_exercise: str = ""
    quiz: Quiz = field(default_factory=lambda: Quiz("", []))
    track_slug: str = DEFAULT_TRACK_SLUG
    track_label: str = "Study"
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class LessonSummary:
    id: str
    day: int
    title: str
    track_slug: str = DEFAULT_TRACK_SLUG
    track_label: str = "Study"


@dataclass(frozen=True, slots=True)
class UserProgress:
    user_id: str
    current_day: int
    lessons_completed: list[int]
    xp_total: int
    streak_days: int
    last_activity: datetime | None = None
    last_streak_date: date | None = None


@dataclass(frozen=True, slots=True)
class UserTrackProgress:
    user_id: str
    track_slug: str
    current_day: int
    lessons_completed: list[int]
    last_activity: datetime | None = None


@dataclass(frozen=True, slots=True)
class LessonSectionProgress:
    user_id: str
    lesson_day: int
    section: str
    track_slug: str = DEFAULT_TRACK_SLUG
    completed_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class LessonItemProgress:
    user_id: str
    lesson_day: int
    section: str
    item_key: str
    xp_awarded: int
    track_slug: str = DEFAULT_TRACK_SLUG
    answer: str | None = None
    is_correct: bool | None = None
    score: int | None = None
    feedback: dict[str, object] | None = None
    completed_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class LearningItemStatus:
    section: str
    item_key: str
    is_completed: bool
    xp_awarded: int = 0
    answer: str | None = None
    is_correct: bool | None = None
    score: int | None = None
    feedback: dict[str, object] | None = None
    completed_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class LearningSectionStatus:
    section: str
    label: str
    is_completed: bool
    item_count: int
    completed_count: int = 0
    completed_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class DailyLessonProgress:
    lesson: Lesson
    track: LearningTrack
    progress_percent: int
    sections: list[LearningSectionStatus]
    items: list[LearningItemStatus]


@dataclass(frozen=True, slots=True)
class LessonHistoryEntry:
    day: int
    title: str
    track_slug: str
    track_label: str
    is_current: bool
    is_completed: bool
    progress_percent: int
    completed_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class LessonHistory:
    track: LearningTrack
    entries: list[LessonHistoryEntry]


@dataclass(frozen=True, slots=True)
class WeeklyRoadmapDay:
    day: int
    weekday_label: str
    calendar_date: date
    calendar_day: int
    title: str
    is_current: bool
    is_locked: bool
    is_completed: bool
    has_lesson: bool
    progress_percent: int


@dataclass(frozen=True, slots=True)
class WeeklyImmersionPlan:
    track: LearningTrack
    week_offset: int
    week_start_day: int
    week_end_day: int
    week_start_date: date
    week_end_date: date
    current_day: int
    days: list[WeeklyRoadmapDay]
    focus: DailyLessonProgress


@dataclass(frozen=True, slots=True)
class CompleteLessonSectionResult:
    day: int
    track_slug: str
    section: str
    current_day: int
    lesson_completed: bool
    progress_percent: int
    sections: list[LearningSectionStatus]
    items: list[LearningItemStatus]
    xp_awarded: int
    xp_total: int
    level: int
    streak: int


@dataclass(frozen=True, slots=True)
class CompleteLessonItemResult:
    day: int
    track_slug: str
    section: str
    item_key: str
    xp_awarded: int
    xp_total: int
    level: int
    streak: int
    plan: DailyLessonProgress


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
