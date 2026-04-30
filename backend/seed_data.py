from sqlalchemy.orm import Session

from infrastructure.database.session import SessionLocal
from infrastructure.database.models.learning import (
    GrammarPointModel,
    GrammarPracticeItemModel,
    LearningPhraseModel,
    LearningTrackModel,
    LessonModel,
    QuizModel,
    QuizQuestionModel,
    VocabularyWordModel,
)


TRACKS = [
    {
        "slug": "work",
        "label": "Work",
        "description": "Professional English for meetings, projects, and interviews.",
        "position": 1,
        "theme": "work",
        "context": "meeting",
        "goal": "sound clear in professional conversations",
        "words": ["deadline", "agenda", "update", "feedback", "proposal", "client", "priority", "summary"],
    },
    {
        "slug": "study",
        "label": "Study",
        "description": "English for classes, self-study, and daily learning routines.",
        "position": 2,
        "theme": "study",
        "context": "class",
        "goal": "learn and review with confidence",
        "words": ["assignment", "lesson", "notes", "practice", "question", "review", "topic", "example"],
    },
    {
        "slug": "travel",
        "label": "Travel",
        "description": "Airport, hotel, directions, and trip planning conversations.",
        "position": 3,
        "theme": "travel",
        "context": "trip",
        "goal": "handle travel situations without panic",
        "words": ["reservation", "ticket", "luggage", "gate", "address", "passport", "delay", "arrival"],
    },
    {
        "slug": "dining",
        "label": "Dining",
        "description": "Restaurant, cafe, ordering, and social meal vocabulary.",
        "position": 4,
        "theme": "dining",
        "context": "restaurant",
        "goal": "order food and join dinner conversations",
        "words": ["menu", "table", "receipt", "starter", "bill", "water", "dessert", "recommendation"],
    },
    {
        "slug": "sports",
        "label": "Sports",
        "description": "Practice conversations around games, teams, and performance.",
        "position": 5,
        "theme": "sports",
        "context": "game",
        "goal": "talk about matches, teams, and training",
        "words": ["match", "score", "coach", "training", "team", "goal", "season", "practice"],
    },
    {
        "slug": "leisure",
        "label": "Leisure",
        "description": "Movies, music, weekend plans, and casual conversations.",
        "position": 6,
        "theme": "leisure",
        "context": "weekend plan",
        "goal": "enjoy casual conversations about free time",
        "words": ["movie", "music", "weekend", "plan", "relax", "concert", "series", "invite"],
    },
    {
        "slug": "fitness",
        "label": "Fitness",
        "description": "Gym, health routines, training, and active lifestyle English.",
        "position": 7,
        "theme": "fitness",
        "context": "gym",
        "goal": "describe workouts and healthy routines",
        "words": ["workout", "routine", "strength", "stretch", "coach", "recovery", "energy", "habit"],
    },
    {
        "slug": "hobbies",
        "label": "Hobbies",
        "description": "Personal interests, creative projects, and free-time topics.",
        "position": 8,
        "theme": "hobbies",
        "context": "hobby project",
        "goal": "talk naturally about personal interests",
        "words": ["project", "collection", "painting", "camera", "skill", "creative", "practice", "favorite"],
    },
]


PHRASE_PATTERNS = [
    ("I am practicing English for {context}.", "Estou praticando ingles para {context}."),
    ("Could you help me with this {theme} sentence?", "Voce poderia me ajudar com esta frase de {theme}?"),
    ("I need to explain my goal clearly.", "Preciso explicar meu objetivo com clareza."),
    ("Can you repeat that more slowly?", "Voce pode repetir isso mais devagar?"),
    ("I did not understand the last detail.", "Eu nao entendi o ultimo detalhe."),
    ("That example makes sense to me.", "Esse exemplo faz sentido para mim."),
    ("I want to sound more natural.", "Quero soar mais natural."),
    ("Let me try that sentence again.", "Deixe-me tentar essa frase de novo."),
    ("What does this word mean in this situation?", "O que esta palavra significa nesta situacao?"),
    ("I can use this phrase in a real conversation.", "Posso usar esta frase em uma conversa real."),
    ("My main goal is to {goal}.", "Meu principal objetivo e {goal}."),
    ("I usually review my notes before practice.", "Eu geralmente reviso minhas notas antes da pratica."),
    ("Could you give me one more example?", "Voce poderia me dar mais um exemplo?"),
    ("I have a question about grammar.", "Tenho uma pergunta sobre gramatica."),
    ("This is useful for my {context}.", "Isso e util para meu/minha {context}."),
    ("I will practice this today.", "Vou praticar isso hoje."),
    ("I am available for a short conversation.", "Estou disponivel para uma conversa curta."),
    ("Thank you for the correction.", "Obrigado pela correcao."),
    ("I feel more confident now.", "Sinto-me mais confiante agora."),
    ("See you in the next lesson.", "Ate a proxima licao."),
]


GRAMMAR_POINTS = [
    (
        "Verb to be in the present",
        "Use am, is, and are to describe people, places, states, and situations now.",
        "I am ready for the meeting.",
    ),
    (
        "Simple present for routines",
        "Use the simple present to describe habits, schedules, and repeated actions.",
        "I practice English every day.",
    ),
    (
        "Past simple for completed actions",
        "Use the past simple for actions that already finished.",
        "I reviewed the lesson yesterday.",
    ),
    (
        "Future with will and going to",
        "Use will for quick decisions and going to for planned intentions.",
        "I am going to practice after work.",
    ),
    (
        "Articles and prepositions",
        "Use a or an for one general thing, the for something specific, and at for exact times or places.",
        "I have a question at the end of the lesson.",
    ),
]


GRAMMAR_PRACTICE = [
    (
        "Verb to be: present",
        "Choose the correct sentence.",
        ["I am ready.", "I are ready.", "I be ready."],
        "I am ready.",
        "Use 'am' with I in the present.",
    ),
    (
        "Verb to be: past",
        "Choose the correct past sentence.",
        ["They were busy.", "They was busy.", "They are busy yesterday."],
        "They were busy.",
        "Use 'were' with they in the past.",
    ),
    (
        "Future plan",
        "Choose the best future sentence.",
        ["I am going to practice tonight.", "I going practice tonight.", "I practiced tonight tomorrow."],
        "I am going to practice tonight.",
        "Use 'am going to' for an intention or plan.",
    ),
    (
        "Articles: a, an, the",
        "Complete: I have ___ example for ___ lesson.",
        ["an / the", "a / an", "the / an"],
        "an / the",
        "Use 'an' before a vowel sound and 'the' for a specific lesson.",
    ),
    (
        "Preposition: at",
        "Choose the sentence with the best preposition.",
        ["The call starts at 9.", "The call starts in 9.", "The call starts on 9."],
        "The call starts at 9.",
        "Use 'at' for exact times.",
    ),
]


QUIZ_PATTERNS = [
    (
        "Which sentence uses the verb to be correctly?",
        ["I am ready.", "I are ready.", "I be ready."],
        "I am ready.",
    ),
    (
        "Which sentence describes a routine?",
        ["I practice every day.", "I practiced yesterday.", "I will practice tomorrow."],
        "I practice every day.",
    ),
    (
        "Which sentence is a polite request?",
        ["Could you repeat that, please?", "Repeat now.", "You repeat."],
        "Could you repeat that, please?",
    ),
    (
        "Complete: I have ___ question.",
        ["a", "an", "the only"],
        "a",
    ),
    (
        "Which sentence uses 'at' correctly?",
        ["We meet at 3.", "We meet on 3.", "We meet in 3."],
        "We meet at 3.",
    ),
]


def seed() -> None:
    db: Session = SessionLocal()
    try:
        for track in TRACKS:
            _ensure_track(db, track)
            for day in range(1, 8):
                _ensure_lesson(db, track, day)

        db.commit()
        print("Seed completed successfully!")
    except Exception as exc:
        db.rollback()
        print(f"Error seeding data: {exc}")
    finally:
        db.close()


def _ensure_track(db: Session, track: dict[str, object]) -> None:
    model = db.get(LearningTrackModel, track["slug"])
    if model is None:
        db.add(
            LearningTrackModel(
                slug=str(track["slug"]),
                label=str(track["label"]),
                description=str(track["description"]),
                position=int(track["position"]),
            )
        )
        return

    model.label = str(track["label"])
    model.description = str(track["description"])
    model.position = int(track["position"])


def _ensure_lesson(db: Session, track: dict[str, object], day: int) -> None:
    lesson = (
        db.query(LessonModel)
        .filter(LessonModel.track_slug == track["slug"], LessonModel.day == day)
        .one_or_none()
    )
    title = f"{track['label']} English - Day {day}"
    speaking = (
        f"Introduce yourself, explain your {track['theme']} goal, and mention one "
        f"{track['context']} situation where you want to speak more confidently."
    )

    if lesson is None:
        lesson = LessonModel(
            track_slug=str(track["slug"]),
            day=day,
            title=title,
            speaking_exercise=speaking,
        )
        db.add(lesson)
        db.flush()
    else:
        lesson.title = title
        lesson.speaking_exercise = speaking

    _replace_phrases(db, lesson, track, day)
    _replace_vocabulary(db, lesson, track, day)
    _replace_grammar(db, lesson, day)
    _replace_grammar_practice(db, lesson)
    _replace_quiz(db, lesson, day)


def _replace_phrases(db: Session, lesson: LessonModel, track: dict[str, object], day: int) -> None:
    db.query(LearningPhraseModel).filter(LearningPhraseModel.lesson_id == lesson.id).delete()
    context = str(track["context"])
    theme = str(track["theme"])
    goal = str(track["goal"])
    db.add_all(
        [
            LearningPhraseModel(
                lesson_id=lesson.id,
                text=text.format(context=context, theme=theme, goal=goal),
                translation=translation.format(context=context, theme=theme, goal=goal),
                position=index,
            )
            for index, (text, translation) in enumerate(PHRASE_PATTERNS, start=1)
        ]
    )


def _replace_vocabulary(db: Session, lesson: LessonModel, track: dict[str, object], day: int) -> None:
    db.query(VocabularyWordModel).filter(VocabularyWordModel.lesson_id == lesson.id).delete()
    words = list(track["words"])
    repeated_words = (words * 2)[:15]
    db.add_all(
        [
            VocabularyWordModel(
                lesson_id=lesson.id,
                word=str(word),
                theme=str(track["theme"]),
                definition=f"A useful word for {track['context']} conversations.",
                example_sentence=f"I can use {word} when I talk about {track['context']}.",
                memory_tip=f"Connect '{word}' to your {track['theme']} goal for day {day}.",
                position=index,
            )
            for index, word in enumerate(repeated_words, start=1)
        ]
    )


def _replace_grammar(db: Session, lesson: LessonModel, day: int) -> None:
    db.query(GrammarPointModel).filter(GrammarPointModel.lesson_id == lesson.id).delete()
    db.add_all(
        [
            GrammarPointModel(
                lesson_id=lesson.id,
                title=title,
                explanation=explanation,
                example=example,
                position=index,
            )
            for index, (title, explanation, example) in enumerate(GRAMMAR_POINTS, start=1)
        ]
    )


def _replace_grammar_practice(db: Session, lesson: LessonModel) -> None:
    db.query(GrammarPracticeItemModel).filter(
        GrammarPracticeItemModel.lesson_id == lesson.id,
    ).delete()
    db.add_all(
        [
            GrammarPracticeItemModel(
                lesson_id=lesson.id,
                title=title,
                prompt=prompt,
                options=options,
                answer=answer,
                explanation=explanation,
                position=index,
            )
            for index, (title, prompt, options, answer, explanation) in enumerate(
                GRAMMAR_PRACTICE,
                start=1,
            )
        ]
    )


def _replace_quiz(db: Session, lesson: LessonModel, day: int) -> None:
    quiz = db.query(QuizModel).filter(QuizModel.lesson_id == lesson.id).one_or_none()
    if quiz is None:
        quiz = QuizModel(lesson_id=lesson.id, title=f"Day {day} Conversation Check")
        db.add(quiz)
        db.flush()
    else:
        quiz.title = f"Day {day} Conversation Check"

    db.query(QuizQuestionModel).filter(QuizQuestionModel.quiz_id == quiz.id).delete()
    db.add_all(
        [
            QuizQuestionModel(
                quiz_id=quiz.id,
                prompt=prompt,
                options=options,
                answer=answer,
                position=index,
            )
            for index, (prompt, options, answer) in enumerate(QUIZ_PATTERNS, start=1)
        ]
    )


if __name__ == "__main__":
    seed()
