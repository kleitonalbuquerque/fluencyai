from dataclasses import asdict
from datetime import date, datetime

from pydantic import BaseModel, Field

from domain.entities.learning import (
    CompleteLessonItemResult,
    CompleteLessonSectionResult,
    DailyLessonProgress,
    LessonHistory,
    LearningItemStatus,
    WeeklyImmersionPlan,
)


def _item_key(position: int, index: int) -> str:
    return str(position if position > 0 else index + 1)


def _item_payload(item: LearningItemStatus | None) -> dict:
    if item is None:
        return {
            "is_completed": False,
            "xp_awarded": 0,
            "completed_at": None,
            "is_correct": None,
        }
    return {
        "is_completed": item.is_completed,
        "xp_awarded": item.xp_awarded,
        "completed_at": item.completed_at,
        "is_correct": item.is_correct,
        "score": item.score,
        "feedback": item.feedback,
    }


class LearningTrackResponse(BaseModel):
    slug: str
    label: str
    description: str
    position: int = 0


class ActiveLearningTrackRequest(BaseModel):
    track_slug: str = Field(min_length=1, max_length=40)


class LearningPhraseResponse(BaseModel):
    text: str
    translation: str
    position: int = 0


class VocabularyWordResponse(BaseModel):
    word: str
    theme: str
    definition: str
    example_sentence: str
    memory_tip: str
    position: int = 0


class GrammarPointResponse(BaseModel):
    title: str
    explanation: str
    example: str
    position: int = 0


class GrammarPracticeItemResponse(BaseModel):
    title: str
    prompt: str
    options: list[str]
    answer: str
    explanation: str
    position: int = 0


class QuizQuestionResponse(BaseModel):
    prompt: str
    options: list[str]
    answer: str
    position: int = 0


class QuizResponse(BaseModel):
    title: str
    questions: list[QuizQuestionResponse]


class DailyImmersionPlanResponse(BaseModel):
    day: int
    track_slug: str
    track_label: str
    title: str
    essential_phrases: list[LearningPhraseResponse]
    vocabulary_words: list[VocabularyWordResponse]
    grammar_points: list[GrammarPointResponse]
    grammar_practice_items: list[GrammarPracticeItemResponse]
    speaking_exercise: str
    quiz: QuizResponse


class LearningSectionStatusResponse(BaseModel):
    section: str
    label: str
    is_completed: bool
    item_count: int
    completed_count: int
    completed_at: datetime | None = None


class LearningItemStatusResponse(BaseModel):
    section: str
    item_key: str
    is_completed: bool
    xp_awarded: int
    answer: str | None = None
    is_correct: bool | None = None
    score: int | None = None
    feedback: dict[str, object] | None = None
    completed_at: datetime | None = None


class LearningPhraseProgressResponse(LearningPhraseResponse):
    item_key: str
    is_completed: bool
    xp_awarded: int
    completed_at: datetime | None = None


class VocabularyWordProgressResponse(VocabularyWordResponse):
    item_key: str
    is_completed: bool
    xp_awarded: int
    completed_at: datetime | None = None


class GrammarPointProgressResponse(GrammarPointResponse):
    item_key: str
    is_completed: bool
    xp_awarded: int
    completed_at: datetime | None = None


class GrammarPracticeItemProgressResponse(GrammarPracticeItemResponse):
    item_key: str
    is_completed: bool
    selected_answer: str | None = None
    is_correct: bool | None = None
    xp_awarded: int
    completed_at: datetime | None = None


class SpeakingPracticeProgressResponse(BaseModel):
    prompt: str
    item_key: str = "practice"
    is_completed: bool
    answer: str | None = None
    score: int | None = None
    feedback: dict[str, object] | None = None
    xp_awarded: int
    completed_at: datetime | None = None


class QuizQuestionProgressResponse(QuizQuestionResponse):
    item_key: str
    is_completed: bool
    selected_answer: str | None = None
    is_correct: bool | None = None
    xp_awarded: int
    completed_at: datetime | None = None


class QuizProgressResponse(BaseModel):
    title: str
    questions: list[QuizQuestionProgressResponse]


class DailyImmersionPlanWithProgressResponse(DailyImmersionPlanResponse):
    essential_phrases: list[LearningPhraseProgressResponse]
    vocabulary_words: list[VocabularyWordProgressResponse]
    grammar_points: list[GrammarPointProgressResponse]
    grammar_practice_items: list[GrammarPracticeItemProgressResponse]
    speaking_practice: SpeakingPracticeProgressResponse
    quiz: QuizProgressResponse
    progress_percent: int
    sections: list[LearningSectionStatusResponse]
    items: list[LearningItemStatusResponse]

    @classmethod
    def from_entity(
        cls,
        plan: DailyLessonProgress,
    ) -> "DailyImmersionPlanWithProgressResponse":
        item_lookup = {
            (item.section, item.item_key): item
            for item in plan.items
        }
        return cls(
            day=plan.lesson.day,
            track_slug=plan.track.slug,
            track_label=plan.track.label,
            title=plan.lesson.title,
            essential_phrases=[
                LearningPhraseProgressResponse(
                    text=phrase.text,
                    translation=phrase.translation,
                    position=phrase.position,
                    item_key=_item_key(phrase.position, index),
                    **_item_payload(item_lookup.get(("phrases", _item_key(phrase.position, index)))),
                )
                for index, phrase in enumerate(plan.lesson.essential_phrases)
            ],
            vocabulary_words=[
                VocabularyWordProgressResponse(
                    word=word.word,
                    theme=word.theme,
                    definition=word.definition,
                    example_sentence=word.example_sentence,
                    memory_tip=word.memory_tip,
                    position=word.position,
                    item_key=_item_key(word.position, index),
                    **_item_payload(item_lookup.get(("vocabulary", _item_key(word.position, index)))),
                )
                for index, word in enumerate(plan.lesson.vocabulary_words)
            ],
            grammar_points=[
                GrammarPointProgressResponse(
                    title=point.title,
                    explanation=point.explanation,
                    example=point.example,
                    position=point.position,
                    item_key=_item_key(point.position, index),
                    **_item_payload(item_lookup.get(("grammar", _item_key(point.position, index)))),
                )
                for index, point in enumerate(plan.lesson.grammar_points)
            ],
            grammar_practice_items=[
                GrammarPracticeItemProgressResponse(
                    title=item.title,
                    prompt=item.prompt,
                    options=item.options,
                    answer=item.answer,
                    explanation=item.explanation,
                    position=item.position,
                    item_key=_item_key(item.position, index),
                    selected_answer=item_lookup.get(("grammar_practice", _item_key(item.position, index))).answer
                    if item_lookup.get(("grammar_practice", _item_key(item.position, index)))
                    else None,
                    **_item_payload(item_lookup.get(("grammar_practice", _item_key(item.position, index)))),
                )
                for index, item in enumerate(plan.lesson.grammar_practice_items)
            ],
            speaking_exercise=plan.lesson.speaking_exercise,
            speaking_practice=SpeakingPracticeProgressResponse(
                prompt=plan.lesson.speaking_exercise,
                item_key="practice",
                answer=item_lookup.get(("speaking", "practice")).answer
                if item_lookup.get(("speaking", "practice"))
                else None,
                **_item_payload(item_lookup.get(("speaking", "practice"))),
            ),
            quiz=QuizProgressResponse(
                title=plan.lesson.quiz.title,
                questions=[
                    QuizQuestionProgressResponse(
                        prompt=question.prompt,
                        options=question.options,
                        answer=question.answer,
                        position=question.position,
                        item_key=_item_key(question.position, index),
                        selected_answer=item_lookup.get(("quiz", _item_key(question.position, index))).answer
                        if item_lookup.get(("quiz", _item_key(question.position, index)))
                        else None,
                        **_item_payload(item_lookup.get(("quiz", _item_key(question.position, index)))),
                    )
                    for index, question in enumerate(plan.lesson.quiz.questions)
                ],
            ),
            progress_percent=plan.progress_percent,
            sections=[asdict(section) for section in plan.sections],
            items=[asdict(item) for item in plan.items],
        )


class LessonHistoryEntryResponse(BaseModel):
    day: int
    title: str
    track_slug: str
    track_label: str
    is_current: bool
    is_completed: bool
    progress_percent: int
    completed_at: datetime | None = None


class LessonHistoryResponse(BaseModel):
    track: LearningTrackResponse
    entries: list[LessonHistoryEntryResponse]

    @classmethod
    def from_entity(cls, history: LessonHistory) -> "LessonHistoryResponse":
        return cls(
            track=LearningTrackResponse(**asdict(history.track)),
            entries=[asdict(entry) for entry in history.entries],
        )


class WeeklyRoadmapDayResponse(BaseModel):
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


class WeeklyImmersionPlanResponse(BaseModel):
    track: LearningTrackResponse
    week_offset: int
    week_start_day: int
    week_end_day: int
    week_start_date: date
    week_end_date: date
    current_day: int
    days: list[WeeklyRoadmapDayResponse]
    focus: DailyImmersionPlanWithProgressResponse

    @classmethod
    def from_entity(cls, plan: WeeklyImmersionPlan) -> "WeeklyImmersionPlanResponse":
        return cls(
            track=LearningTrackResponse(**asdict(plan.track)),
            week_offset=plan.week_offset,
            week_start_day=plan.week_start_day,
            week_end_day=plan.week_end_day,
            week_start_date=plan.week_start_date,
            week_end_date=plan.week_end_date,
            current_day=plan.current_day,
            days=[asdict(day) for day in plan.days],
            focus=DailyImmersionPlanWithProgressResponse.from_entity(plan.focus),
        )


class CompleteLessonSectionResponse(BaseModel):
    day: int
    track_slug: str
    section: str
    current_day: int
    lesson_completed: bool
    progress_percent: int
    sections: list[LearningSectionStatusResponse]
    items: list[LearningItemStatusResponse]
    xp_awarded: int
    xp_total: int
    level: int
    streak: int

    @classmethod
    def from_entity(
        cls,
        result: CompleteLessonSectionResult,
    ) -> "CompleteLessonSectionResponse":
        return cls(
            day=result.day,
            track_slug=result.track_slug,
            section=result.section,
            current_day=result.current_day,
            lesson_completed=result.lesson_completed,
            progress_percent=result.progress_percent,
            sections=[asdict(section) for section in result.sections],
            items=[asdict(item) for item in result.items],
            xp_awarded=result.xp_awarded,
            xp_total=result.xp_total,
            level=result.level,
            streak=result.streak,
        )


class CompleteLessonItemRequest(BaseModel):
    answer: str | None = Field(default=None, max_length=2000)


class CompleteLessonItemResponse(BaseModel):
    day: int
    track_slug: str
    section: str
    item_key: str
    xp_awarded: int
    xp_total: int
    level: int
    streak: int
    plan: DailyImmersionPlanWithProgressResponse

    @classmethod
    def from_entity(
        cls,
        result: CompleteLessonItemResult,
    ) -> "CompleteLessonItemResponse":
        return cls(
            day=result.day,
            track_slug=result.track_slug,
            section=result.section,
            item_key=result.item_key,
            xp_awarded=result.xp_awarded,
            xp_total=result.xp_total,
            level=result.level,
            streak=result.streak,
            plan=DailyImmersionPlanWithProgressResponse.from_entity(result.plan),
        )


class AiChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


class AiChatResponse(BaseModel):
    reply: str
    correction: str
    suggested_vocabulary: list[str]


class MemorizationSessionResponse(BaseModel):
    target_accuracy: int
    words: list[VocabularyWordResponse]


class RolePlayScenarioResponse(BaseModel):
    slug: str
    title: str
    situation: str
    first_prompt: str


class RolePlayScenarioListResponse(BaseModel):
    scenarios: list[RolePlayScenarioResponse]


class RolePlayRequest(BaseModel):
    scenario: str = Field(min_length=1, max_length=80)
    message: str = Field(min_length=1, max_length=1000)


class RolePlayFeedbackResponse(BaseModel):
    scenario: str
    correction: str
    suggested_vocabulary: list[str]
    next_prompt: str


class GamificationSummaryResponse(BaseModel):
    xp: int
    level: int
    streak: int
    words_learned: int
    next_level_xp: int


class RankingEntryResponse(BaseModel):
    rank: int
    email: str
    xp: int
    level: int
    streak: int


class GlobalRankingResponse(BaseModel):
    entries: list[RankingEntryResponse]


class SocialShareResponse(BaseModel):
    share_text: str
    share_url: str
