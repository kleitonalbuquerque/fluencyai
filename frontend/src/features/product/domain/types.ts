export type LearningPhrase = {
  text: string;
  translation: string;
};

export type VocabularyWord = {
  word: string;
  theme: string;
  definition: string;
  example_sentence: string;
  memory_tip: string;
};

export type GrammarPoint = {
  title: string;
  explanation: string;
  example: string;
};

export type QuizQuestion = {
  prompt: string;
  options: string[];
  answer: string;
};

export type Quiz = {
  title: string;
  questions: QuizQuestion[];
};

export type DailyImmersionPlan = {
  day: number;
  title: string;
  essential_phrases: LearningPhrase[];
  vocabulary_words: VocabularyWord[];
  grammar_points: GrammarPoint[];
  speaking_exercise: string;
  quiz: Quiz;
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

export type KnowledgeSourceList = {
  sources: KnowledgeSource[];
};
