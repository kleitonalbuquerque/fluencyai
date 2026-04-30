export type LearningPhrase = {
  text: string;
  translation: string;
  position: number;
};

export type VocabularyWord = {
  word: string;
  theme: string;
  definition: string;
  example_sentence: string;
  memory_tip: string;
  position: number;
};

export type GrammarPoint = {
  title: string;
  explanation: string;
  example: string;
  position: number;
};

export type GrammarPracticeItem = {
  title: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  position: number;
};

export type QuizQuestion = {
  prompt: string;
  options: string[];
  answer: string;
  position: number;
};

export type Quiz = {
  title: string;
  questions: QuizQuestion[];
};

export type DailyImmersionPlan = {
  day: number;
  track_slug: string;
  track_label: string;
  title: string;
  essential_phrases: LearningPhrase[];
  vocabulary_words: VocabularyWord[];
  grammar_points: GrammarPoint[];
  grammar_practice_items: GrammarPracticeItem[];
  speaking_exercise: string;
  quiz: Quiz;
};

export type ImmersionSectionKey =
  | "phrases"
  | "vocabulary"
  | "grammar"
  | "grammar_practice"
  | "speaking"
  | "quiz";

export type LearningTrack = {
  slug: string;
  label: string;
  description: string;
  position: number;
};

export type LearningSectionStatus = {
  section: ImmersionSectionKey;
  label: string;
  is_completed: boolean;
  item_count: number;
  completed_count: number;
  completed_at: string | null;
};

export type LearningItemStatus = {
  section: ImmersionSectionKey;
  item_key: string;
  is_completed: boolean;
  xp_awarded: number;
  answer: string | null;
  is_correct: boolean | null;
  score: number | null;
  feedback: SpeakingFeedback | null;
  completed_at: string | null;
};

export type LearningPhraseWithProgress = LearningPhrase & {
  item_key: string;
  is_completed: boolean;
  xp_awarded: number;
  completed_at: string | null;
};

export type VocabularyWordWithProgress = VocabularyWord & {
  item_key: string;
  is_completed: boolean;
  xp_awarded: number;
  completed_at: string | null;
};

export type GrammarPointWithProgress = GrammarPoint & {
  item_key: string;
  is_completed: boolean;
  xp_awarded: number;
  completed_at: string | null;
};

export type GrammarPracticeItemWithProgress = GrammarPracticeItem & {
  item_key: string;
  is_completed: boolean;
  selected_answer: string | null;
  is_correct: boolean | null;
  xp_awarded: number;
  completed_at: string | null;
};

export type SpeakingFeedback = {
  score: number;
  prompt: string;
  strengths: string[];
  corrections: string[];
  improved_answer: string;
  next_step: string;
};

export type SpeakingPracticeProgress = {
  prompt: string;
  item_key: "practice";
  is_completed: boolean;
  answer: string | null;
  score: number | null;
  feedback: SpeakingFeedback | null;
  xp_awarded: number;
  completed_at: string | null;
};

export type QuizQuestionWithProgress = QuizQuestion & {
  item_key: string;
  is_completed: boolean;
  selected_answer: string | null;
  is_correct: boolean | null;
  xp_awarded: number;
  completed_at: string | null;
};

export type DailyImmersionPlanWithProgress = {
  day: number;
  track_slug: string;
  track_label: string;
  title: string;
  essential_phrases: LearningPhraseWithProgress[];
  vocabulary_words: VocabularyWordWithProgress[];
  grammar_points: GrammarPointWithProgress[];
  grammar_practice_items: GrammarPracticeItemWithProgress[];
  speaking_exercise: string;
  speaking_practice: SpeakingPracticeProgress;
  quiz: {
    title: string;
    questions: QuizQuestionWithProgress[];
  };
  progress_percent: number;
  sections: LearningSectionStatus[];
  items: LearningItemStatus[];
};

export type WeeklyRoadmapDay = {
  day: number;
  weekday_label: string;
  calendar_date: string;
  calendar_day: number;
  title: string;
  is_current: boolean;
  is_locked: boolean;
  is_completed: boolean;
  has_lesson: boolean;
  progress_percent: number;
};

export type WeeklyImmersionPlan = {
  track: LearningTrack;
  week_offset: number;
  week_start_day: number;
  week_end_day: number;
  week_start_date: string;
  week_end_date: string;
  current_day: number;
  days: WeeklyRoadmapDay[];
  focus: DailyImmersionPlanWithProgress;
};

export type LessonHistoryEntry = {
  day: number;
  title: string;
  track_slug: string;
  track_label: string;
  is_current: boolean;
  is_completed: boolean;
  progress_percent: number;
  completed_at: string | null;
};

export type LessonHistory = {
  track: LearningTrack;
  entries: LessonHistoryEntry[];
};

export type CompleteLessonSectionResult = {
  day: number;
  track_slug: string;
  section: ImmersionSectionKey;
  current_day: number;
  lesson_completed: boolean;
  progress_percent: number;
  sections: LearningSectionStatus[];
  items: LearningItemStatus[];
  xp_awarded: number;
  xp_total: number;
  level: number;
  streak: number;
};

export type CompleteLessonItemResult = {
  day: number;
  track_slug: string;
  section: ImmersionSectionKey;
  item_key: string;
  xp_awarded: number;
  xp_total: number;
  level: number;
  streak: number;
  plan: DailyImmersionPlanWithProgress;
};

export type AiChatFeedback = {
  reply: string;
  correction: string;
  suggested_vocabulary: string[];
};

export type MemorizationSession = {
  target_accuracy: number;
  words: VocabularyWord[];
};

export type RolePlayScenario = {
  slug: string;
  title: string;
  situation: string;
  first_prompt: string;
};

export type RolePlayScenarioList = {
  scenarios: RolePlayScenario[];
};

export type RolePlayFeedback = {
  scenario: string;
  correction: string;
  suggested_vocabulary: string[];
  next_prompt: string;
};

export type GamificationSummary = {
  xp: number;
  level: number;
  streak: number;
  words_learned: number;
  next_level_xp: number;
};

export type RankingEntry = {
  rank: number;
  email: string;
  xp: number;
  level: number;
  streak: number;
};

export type GlobalRanking = {
  entries: RankingEntry[];
};

export type SocialShare = {
  share_text: string;
  share_url: string;
};

export type KnowledgeSource = {
  id: string;
  name: string;
  type: string;
  last_updated: string;
};

export type KnowledgeSourceDetail = KnowledgeSource & {
  content: string;
};

export type KnowledgeSourceList = {
  sources: KnowledgeSource[];
};
