from pydantic import BaseModel, Field


class LearningPhraseResponse(BaseModel):
    text: str
    translation: str


class VocabularyWordResponse(BaseModel):
    word: str
    theme: str
    definition: str
    example_sentence: str
    memory_tip: str


class GrammarPointResponse(BaseModel):
    title: str
    explanation: str
    example: str


class QuizQuestionResponse(BaseModel):
    prompt: str
    options: list[str]
    answer: str


class QuizResponse(BaseModel):
    title: str
    questions: list[QuizQuestionResponse]


class DailyImmersionPlanResponse(BaseModel):
    day: int
    title: str
    essential_phrases: list[LearningPhraseResponse]
    vocabulary_words: list[VocabularyWordResponse]
    grammar_points: list[GrammarPointResponse]
    speaking_exercise: str
    quiz: QuizResponse


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
