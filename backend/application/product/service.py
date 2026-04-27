from dataclasses import asdict
from domain.entities.user import User
from domain.entities.learning import (
    LearningPhrase, VocabularyWord, GrammarPoint, 
    Quiz, QuizQuestion, UserProgress, Lesson,
    AiChatFeedback, MemorizationSession, RolePlayScenario, RolePlayScenarioList,
    RolePlayFeedback, GamificationSummary, GlobalRanking, RankingEntry, SocialShare
)
from application.repositories.learning_repository import LessonRepository, UserProgressRepository
from application.ai.knowledge_service import KnowledgeService


class ProductService:
    def __init__(
        self, 
        lesson_repository: LessonRepository,
        progress_repository: UserProgressRepository,
        knowledge_service: KnowledgeService
    ):
        self._lesson_repository = lesson_repository
        self._progress_repository = progress_repository
        self._knowledge_service = knowledge_service

    def get_daily_plan(self, user: User) -> Lesson:
        progress = self._progress_repository.get_by_user_id(user.id)
        if not progress:
            progress = UserProgress(
                user_id=user.id,
                current_day=1,
                lessons_completed=[],
                xp_total=0,
                streak_days=0
            )
            self._progress_repository.save(progress)
        
        lesson = self._lesson_repository.get_by_day(progress.current_day)
        if not lesson:
            # Fallback to day 1
            lesson = self._lesson_repository.get_by_day(1)
        
        if not lesson:
            raise ValueError("No lessons found in the database. Please run seeding.")
        
        return lesson

    def chat(self, message: str) -> AiChatFeedback:
        try:
            if not self._knowledge_service.api_key:
                raise ValueError("API Key missing")
            
            ai_response = self._knowledge_service.ask_question(message)
            return AiChatFeedback(
                reply=ai_response,
                correction="Isso soa bem! Só uma coisinha pequena... (correção via IA pendente)",
                suggested_vocabulary=["actually", "usually", "vocabulary"]
            )
        except Exception as e:
            # Fallback mock for development or errors
            topic = message.strip() if message.strip() else "your sentence"
            return AiChatFeedback(
                reply=f"AI Service currently offline. You asked about: {topic}. Error: {str(e)}",
                correction=f"Isso soa bem! Só uma coisinha pequena... tente dizer '{topic}' melhor.",
                suggested_vocabulary=["actually", "usually", "reservation"]
            )

    def get_memorization_session(self) -> MemorizationSession:
        return MemorizationSession(target_accuracy=100, words=self._core_vocabulary()[:20])

    def get_role_play_scenarios(self) -> RolePlayScenarioList:
        return RolePlayScenarioList(
            scenarios=[
                RolePlayScenario(
                    slug="entrevista", title="Entrevista", 
                    situation="Responder perguntas sobre experiência e objetivos.", 
                    first_prompt="Tell me about your last project."
                ),
                RolePlayScenario(
                    slug="cafe", title="Café", 
                    situation="Pedir uma bebida.", 
                    first_prompt="Hi, what would you like?"
                ),
                RolePlayScenario(
                    slug="viagem", title="Viagem", 
                    situation="Informações no aeroporto.", 
                    first_prompt="Where are you traveling today?"
                )
            ]
        )

    def respond_role_play(self, scenario: str, message: str) -> RolePlayFeedback:
        return RolePlayFeedback(
            scenario=scenario,
            correction="Isso soa bem! Só uma coisinha pequena...",
            suggested_vocabulary=["I would like"],
            next_prompt="Anything else?"
        )

    def get_gamification_summary(self, user: User) -> GamificationSummary:
        return GamificationSummary(
            xp=user.xp,
            level=user.level,
            streak=user.streak,
            words_learned=user.xp // 10,
            next_level_xp=max(user.level * 100, 100)
        )

    def get_global_ranking(self, user: User) -> GlobalRanking:
        return GlobalRanking(
            entries=[
                RankingEntry(rank=1, email=user.email, xp=user.xp, level=user.level, streak=user.streak)
            ]
        )

    def get_social_progress(self, user: User) -> SocialShare:
        return SocialShare(
            share_text=f"Estou praticando no FluencyAI! Nível {user.level}.",
            share_url="http://localhost:3000/app"
        )

    def _core_vocabulary(self) -> list[VocabularyWord]:
        return [
            VocabularyWord("reservation", "viagem", "reserva", "I have a reservation.", "Tip"),
            VocabularyWord("station", "viagem", "estação", "The station is nearby.", "Tip"),
            VocabularyWord("ticket", "viagem", "passagem", "I need a ticket.", "Tip"),
            VocabularyWord("gate", "viagem", "portão", "The gate is open.", "Tip"),
            VocabularyWord("luggage", "viagem", "bagagem", "My luggage is heavy.", "Tip"),
            VocabularyWord("interview", "trabalho", "entrevista", "I have an interview.", "Tip"),
            VocabularyWord("experience", "trabalho", "experiência", "I have experience.", "Tip"),
            VocabularyWord("strength", "trabalho", "ponto forte", "My strength.", "Tip"),
            VocabularyWord("salary", "trabalho", "salário", "Salary range.", "Tip"),
            VocabularyWord("schedule", "rotina", "agenda", "Full schedule.", "Tip"),
            VocabularyWord("menu", "café", "cardápio", "Menu please.", "Tip"),
            VocabularyWord("receipt", "café", "recibo", "Receipt please.", "Tip"),
            VocabularyWord("table", "café", "mesa", "Table for two.", "Tip"),
            VocabularyWord("water", "café", "água", "Water please.", "Tip"),
            VocabularyWord("nearby", "localização", "perto", "Nearby cafe.", "Tip"),
            VocabularyWord("address", "localização", "endereço", "Address please.", "Tip"),
            VocabularyWord("slowly", "conversa", "devagar", "Speak slowly.", "Tip"),
            VocabularyWord("repeat", "conversa", "repetir", "Repeat please.", "Tip"),
            VocabularyWord("meaning", "conversa", "significado", "Meaning?", "Tip"),
            VocabularyWord("tomorrow", "tempo", "amanhã", "See you tomorrow.", "Tip"),
        ]
