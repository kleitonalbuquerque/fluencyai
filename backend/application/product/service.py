from dataclasses import dataclass

from domain.entities.user import User


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
class DailyImmersionPlan:
    day: int
    title: str
    essential_phrases: list[LearningPhrase]
    vocabulary_words: list[VocabularyWord]
    grammar_points: list[GrammarPoint]
    speaking_exercise: str
    quiz: Quiz


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


class ProductService:
    def get_daily_plan(self, user: User) -> DailyImmersionPlan:
        return DailyImmersionPlan(
            day=1,
            title="Imersão essencial para conversas do dia a dia",
            essential_phrases=[
                LearningPhrase("How are you doing?", "Como você está?"),
                LearningPhrase("I am learning English.", "Estou aprendendo inglês."),
                LearningPhrase("Could you repeat that?", "Você poderia repetir?"),
                LearningPhrase("I do not understand yet.", "Ainda não entendi."),
                LearningPhrase("What does this mean?", "O que isso significa?"),
                LearningPhrase("Can you speak more slowly?", "Pode falar mais devagar?"),
                LearningPhrase("I would like a coffee.", "Eu gostaria de um café."),
                LearningPhrase("How much does it cost?", "Quanto custa?"),
                LearningPhrase("Where is the station?", "Onde fica a estação?"),
                LearningPhrase("I have a reservation.", "Tenho uma reserva."),
                LearningPhrase("I need some help.", "Preciso de ajuda."),
                LearningPhrase("That sounds good.", "Isso parece bom."),
                LearningPhrase("I agree with you.", "Eu concordo com você."),
                LearningPhrase("Let me try again.", "Deixe-me tentar de novo."),
                LearningPhrase("I am looking for this address.", "Estou procurando este endereço."),
                LearningPhrase("Could I have the menu?", "Eu poderia ver o cardápio?"),
                LearningPhrase("What time does it start?", "Que horas começa?"),
                LearningPhrase("I am here for an interview.", "Estou aqui para uma entrevista."),
                LearningPhrase("Nice to meet you.", "Prazer em conhecer você."),
                LearningPhrase("See you tomorrow.", "Vejo você amanhã."),
            ],
            vocabulary_words=self._core_vocabulary()[:15],
            grammar_points=[
                GrammarPoint(
                    "Simple present",
                    "Use para hábitos, rotinas e fatos gerais.",
                    "I practice English every day.",
                ),
                GrammarPoint(
                    "Simple past",
                    "Use para ações terminadas no passado.",
                    "I visited a cafe yesterday.",
                ),
                GrammarPoint(
                    "Polite requests",
                    "Use could/would para pedir algo com mais naturalidade.",
                    "Could you help me?",
                ),
                GrammarPoint(
                    "Articles",
                    "Use a/an para algo indefinido e the para algo específico.",
                    "I need a ticket. The ticket is for today.",
                ),
                GrammarPoint(
                    "Prepositions of place",
                    "Use in, on, at, near e next to para localização.",
                    "The hotel is near the station.",
                ),
            ],
            speaking_exercise=(
                "Grave ou leia em voz alta uma apresentação de 45 segundos usando "
                "cinco frases essenciais e três palavras novas."
            ),
            quiz=Quiz(
                title="Quiz final do dia 1",
                questions=[
                    QuizQuestion(
                        "Como pedir para alguém repetir?",
                        ["Could you repeat that?", "I agree with you.", "See you tomorrow."],
                        "Could you repeat that?",
                    ),
                    QuizQuestion(
                        "Qual frase usa simple past?",
                        ["I visited a cafe yesterday.", "I practice daily.", "I need help."],
                        "I visited a cafe yesterday.",
                    ),
                    QuizQuestion(
                        "Qual opção é mais educada?",
                        ["Give me the menu.", "Could I have the menu?", "Menu now."],
                        "Could I have the menu?",
                    ),
                    QuizQuestion(
                        "Como dizer que ainda não entendeu?",
                        ["I do not understand yet.", "That sounds good.", "Nice to meet you."],
                        "I do not understand yet.",
                    ),
                    QuizQuestion(
                        "Qual palavra combina com viagem?",
                        ["reservation", "keyboard", "ceiling"],
                        "reservation",
                    ),
                ],
            ),
        )

    def chat(self, message: str) -> AiChatFeedback:
        trimmed_message = message.strip()
        topic = trimmed_message if trimmed_message else "your sentence"
        return AiChatFeedback(
            reply=(
                "Great, let's keep it natural. Tell me one more detail and I will "
                "answer like a native speaker."
            ),
            correction=(
                "Isso soa bem! Só uma coisinha pequena... tente dizer "
                f"'{topic}' com uma estrutura mais específica e no tempo verbal correto."
            ),
            suggested_vocabulary=["actually", "usually", "reservation", "nearby"],
        )

    def get_memorization_session(self) -> MemorizationSession:
        return MemorizationSession(target_accuracy=100, words=self._core_vocabulary()[:20])

    def get_role_play_scenarios(self) -> RolePlayScenarioList:
        return RolePlayScenarioList(
            scenarios=[
                RolePlayScenario(
                    slug="entrevista",
                    title="Entrevista",
                    situation="Responder perguntas sobre experiência e objetivos.",
                    first_prompt="Tell me about your last project.",
                ),
                RolePlayScenario(
                    slug="cafe",
                    title="Café",
                    situation="Pedir uma bebida, ajustar o pedido e pagar.",
                    first_prompt="Hi, what would you like to order?",
                ),
                RolePlayScenario(
                    slug="viagem",
                    title="Viagem",
                    situation="Pedir informações no aeroporto e no hotel.",
                    first_prompt="Good morning. Where are you traveling today?",
                ),
            ],
        )

    def respond_role_play(self, scenario: str, message: str) -> RolePlayFeedback:
        next_prompts = {
            "entrevista": "What result are you most proud of?",
            "cafe": "Would you like anything else with your coffee?",
            "viagem": "Do you need directions to the gate or hotel?",
        }
        return RolePlayFeedback(
            scenario=scenario,
            correction=(
                "Isso soa bem! Só uma coisinha pequena... use 'I would like' "
                "para soar mais natural e educado nessa situação."
            ),
            suggested_vocabulary=["I would like", "Could I have", "available", "receipt"],
            next_prompt=next_prompts.get(scenario, "What would you like to say next?"),
        )

    def get_gamification_summary(self, user: User) -> GamificationSummary:
        return GamificationSummary(
            xp=user.xp,
            level=user.level,
            streak=user.streak,
            words_learned=user.xp // 10,
            next_level_xp=max(user.level * 100, 100),
        )

    def get_global_ranking(self, user: User) -> GlobalRanking:
        seed_entries = [
            RankingEntry(0, "maya@fluencyai.app", 840, 8, 31),
            RankingEntry(0, "joao@fluencyai.app", 620, 6, 18),
            RankingEntry(0, "sofia@fluencyai.app", 410, 4, 12),
            RankingEntry(0, user.email, user.xp, user.level, user.streak),
        ]
        ranked_entries = sorted(
            seed_entries,
            key=lambda entry: (entry.xp, entry.streak),
            reverse=True,
        )
        return GlobalRanking(
            entries=[
                RankingEntry(
                    rank=index,
                    email=entry.email,
                    xp=entry.xp,
                    level=entry.level,
                    streak=entry.streak,
                )
                for index, entry in enumerate(ranked_entries, start=1)
            ],
        )

    def get_social_progress(self, user: User) -> SocialShare:
        return SocialShare(
            share_text=(
                f"Estou praticando no FluencyAI: nível {user.level}, "
                f"{user.xp} XP e streak de {user.streak} dias."
            ),
            share_url="http://localhost:3000/app",
        )

    def _core_vocabulary(self) -> list[VocabularyWord]:
        return [
            VocabularyWord("reservation", "viagem", "reserva", "I have a reservation.", "Reserve um lugar na memória."),
            VocabularyWord("station", "viagem", "estação", "The station is nearby.", "Station lembra estação."),
            VocabularyWord("ticket", "viagem", "passagem", "I need a ticket.", "Ticket é o bilhete de entrada."),
            VocabularyWord("gate", "viagem", "portão", "The gate is open.", "Gate parece gateway: entrada."),
            VocabularyWord("luggage", "viagem", "bagagem", "My luggage is heavy.", "Lug lembra carregar algo longo."),
            VocabularyWord("interview", "trabalho", "entrevista", "I have an interview today.", "Interview é ver por dentro."),
            VocabularyWord("experience", "trabalho", "experiência", "I have experience with teams.", "Experience parece experiência."),
            VocabularyWord("strength", "trabalho", "ponto forte", "My strength is communication.", "Strength tem força no som."),
            VocabularyWord("salary", "trabalho", "salário", "What is the salary range?", "Salary parece salário."),
            VocabularyWord("schedule", "rotina", "agenda", "My schedule is full.", "Schedule é a escala do dia."),
            VocabularyWord("menu", "café", "cardápio", "Could I have the menu?", "Menu é menu mesmo."),
            VocabularyWord("receipt", "café", "recibo", "Can I get the receipt?", "Receipt recebe o registro."),
            VocabularyWord("table", "café", "mesa", "We need a table for two.", "Table lembra tabela sobre a mesa."),
            VocabularyWord("water", "café", "água", "I would like water.", "Water é água."),
            VocabularyWord("nearby", "localização", "perto", "There is a cafe nearby.", "Near é perto; by é ao lado."),
            VocabularyWord("address", "localização", "endereço", "I am looking for this address.", "Address aponta a direção."),
            VocabularyWord("slowly", "conversa", "devagar", "Can you speak slowly?", "Slow é lento."),
            VocabularyWord("repeat", "conversa", "repetir", "Could you repeat that?", "Repeat parece repetir."),
            VocabularyWord("meaning", "conversa", "significado", "What is the meaning?", "Meaning vem de mean."),
            VocabularyWord("tomorrow", "tempo", "amanhã", "See you tomorrow.", "Tomorrow é o próximo dia."),
        ]
