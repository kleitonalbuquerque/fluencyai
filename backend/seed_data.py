from sqlalchemy.orm import Session

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
from infrastructure.database.session import SessionLocal

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


VOCABULARY_BY_TRACK = {
    "work": [
        (
            "deadline",
            "the latest time or date when work should be finished",
            "The deadline for the report is Friday.",
            "A deadline draws a line in time.",
        ),
        (
            "agenda",
            "a list of topics for a meeting or discussion",
            "Could you send the meeting agenda before the call?",
            "An agenda guides what happens next.",
        ),
        (
            "update",
            "new information about progress or status",
            "I will give a quick project update after lunch.",
            "An update brings the status up to now.",
        ),
        (
            "feedback",
            "comments that help someone improve their work",
            "Thank you for your feedback on my presentation.",
            "Feedback feeds your next improvement.",
        ),
        (
            "proposal",
            "a formal suggestion or plan for someone to consider",
            "Our proposal includes a clearer timeline.",
            "A proposal proposes a next step.",
        ),
        (
            "client",
            "a person or company that receives a professional service",
            "The client asked for a short summary.",
            "A client is the customer you serve.",
        ),
        (
            "priority",
            "the most important thing to do first",
            "My priority today is the budget review.",
            "A priority comes before other tasks.",
        ),
        (
            "summary",
            "a short version of the most important information",
            "Please send a summary after the meeting.",
            "A summary sums up the main points.",
        ),
        (
            "meeting",
            "a planned conversation with other people at work",
            "The meeting starts at 10 in the conference room.",
            "A meeting is when people meet for a purpose.",
        ),
        (
            "report",
            "a document that explains information, progress, or results",
            "I finished the weekly report this morning.",
            "A report reports what happened.",
        ),
        (
            "schedule",
            "a plan that shows when activities will happen",
            "The schedule changed because the client is traveling.",
            "A schedule shows when things are scheduled.",
        ),
        (
            "task",
            "one piece of work that needs to be done",
            "This task should take about one hour.",
            "A task is one thing on your to-do list.",
        ),
        (
            "target",
            "a goal, number, or result you want to reach",
            "Our target is to finish the first version today.",
            "A target is what you aim at.",
        ),
        (
            "interview",
            "a formal conversation where someone asks questions",
            "I have a job interview next week.",
            "An interview is built around questions and answers.",
        ),
        (
            "follow-up",
            "a message or action after a previous conversation",
            "I will send a follow-up email tomorrow.",
            "A follow-up follows the first contact.",
        ),
    ],
    "study": [
        ("assignment", "a task given by a teacher", "The assignment is due on Monday.", "Assignments assign practice."),
        ("lesson", "a period of learning about a topic", "Today's lesson is about routines.", "A lesson helps you learn one point."),
        ("notes", "short written information to remember something", "I review my notes before class.", "Notes help you notice key ideas."),
        ("practice", "repeated activity to improve a skill", "Speaking practice helps me feel confident.", "Practice makes language more automatic."),
        ("question", "something you ask when you need information", "I have a question about the example.", "Questions open answers."),
        ("review", "study something again to remember it better", "I review new words every morning.", "Review means view it again."),
        ("topic", "the subject of a lesson or discussion", "The topic today is travel English.", "A topic is what you talk about."),
        ("example", "one case that shows how something works", "Can you give me another example?", "Examples make rules visible."),
        ("lecture", "a talk that teaches a subject", "The lecture starts at nine.", "A lecture is a learning talk."),
        ("exam", "a test of knowledge or skill", "The exam has ten questions.", "An exam examines what you know."),
        ("answer", "a response to a question", "Please write your answer in English.", "An answer answers a question."),
        ("chapter", "one section of a book or course", "We finished chapter three today.", "A chapter is one part of a larger book."),
        ("course", "a series of classes about a subject", "This course improves my listening.", "A course is a path through learning."),
        ("research", "careful study to find information", "My research is about language habits.", "Research means search again, deeply."),
        ("paragraph", "a group of sentences about one idea", "Write one paragraph about your goal.", "A paragraph packages one idea."),
    ],
    "travel": [
        ("reservation", "a booking made before you arrive", "I have a hotel reservation for tonight.", "Reserve means keep a place for you."),
        ("ticket", "proof that you paid for travel or entry", "My train ticket is on my phone.", "A ticket lets you take the trip."),
        ("luggage", "bags you take when traveling", "My luggage is too heavy.", "Luggage is what you lug around."),
        ("gate", "the place where passengers board a plane", "Our flight leaves from gate twelve.", "A gate is the entry point."),
        ("address", "the details of where a place is", "Can you write the address for me?", "An address helps you arrive."),
        ("passport", "an official document for international travel", "Please show your passport at the desk.", "A passport lets you pass between countries."),
        ("delay", "a situation when something happens later than planned", "There is a delay because of the weather.", "Delay means later than expected."),
        ("arrival", "the moment when you reach a place", "Our arrival time is 8 p.m.", "Arrival is when you arrive."),
        ("departure", "the moment when you leave", "The departure time changed to 6 a.m.", "Departure is when you depart."),
        ("boarding", "getting onto a plane, train, or bus", "Boarding starts in twenty minutes.", "Boarding means going on board."),
        ("hotel", "a place where travelers sleep", "The hotel is near the station.", "A hotel hosts travelers."),
        ("map", "a drawing or app that shows places", "I use a map to find the museum.", "A map helps you move."),
        ("taxi", "a car you pay to take you somewhere", "Let's take a taxi to the airport.", "A taxi takes you directly."),
        ("platform", "the area where you wait for a train", "The train leaves from platform five.", "A platform is where passengers stand."),
        ("itinerary", "a plan for a trip with times and places", "Our itinerary includes two museums.", "An itinerary is your trip plan."),
    ],
    "dining": [
        ("menu", "a list of food and drinks", "Could I see the menu, please?", "The menu shows what you may choose."),
        ("table", "a place where people sit to eat", "We need a table for four.", "A table is where the meal happens."),
        ("receipt", "paper or digital proof of payment", "Can I have the receipt, please?", "A receipt records what you paid."),
        ("starter", "a small dish before the main meal", "I will order soup as a starter.", "A starter starts the meal."),
        ("bill", "the total amount to pay", "Could we have the bill?", "The bill tells what you owe."),
        ("water", "a basic drink often ordered with meals", "Still water is fine for me.", "Water is the safest drink word."),
        ("dessert", "sweet food after the main meal", "The chocolate cake is my dessert.", "Dessert is the sweet ending."),
        ("recommendation", "a suggestion about what to choose", "Do you have a recommendation?", "A recommendation recommends an option."),
        ("reservation", "a booking for a table", "We have a reservation at seven.", "Reserve a table before you arrive."),
        ("waiter", "a person who serves food in a restaurant", "The waiter brought our drinks.", "A waiter waits on the table."),
        ("order", "a request for food or drink", "I would like to order the pasta.", "Order means choose and request."),
        ("appetizer", "a small dish before the main course", "Let's share an appetizer.", "An appetizer opens your appetite."),
        ("main course", "the largest or central dish of a meal", "The fish is my main course.", "Main course means main dish."),
        ("tip", "extra money for service", "We left a tip for the server.", "A tip thanks good service."),
        ("allergy", "a bad physical reaction to some food", "I have a peanut allergy.", "Allergy is important for safe ordering."),
    ],
    "sports": [
        ("match", "a sports game between players or teams", "The match starts at three.", "A match matches two sides."),
        ("score", "the number of points in a game", "The score is two to one.", "Score shows who is ahead."),
        ("coach", "a person who trains a player or team", "The coach gave clear instructions.", "A coach coaches performance."),
        ("training", "practice to improve sport ability", "Training is hard this week.", "Training trains the body."),
        ("team", "a group that plays together", "Our team played very well.", "A team works together."),
        ("goal", "a point scored or something you want to achieve", "She scored a goal in the first half.", "Goal means score or objective."),
        ("season", "the period when games are played", "The season ends in June.", "A season is a sports time period."),
        ("practice", "repeated training to improve", "We have practice after work.", "Practice builds performance."),
        ("player", "a person who plays a sport", "He is the best player on the team.", "A player plays."),
        ("strategy", "a plan to win or perform better", "The strategy worked in the second half.", "Strategy is the game plan."),
        ("tournament", "a competition with several games", "The tournament lasts all weekend.", "A tournament turns many matches into one event."),
        ("warm-up", "light exercise before harder activity", "Do a warm-up before the match.", "Warm-up warms the body."),
        ("defense", "actions to stop the other team scoring", "Our defense was strong today.", "Defense defends the goal."),
        ("victory", "a win in a game or competition", "The victory made the fans happy.", "Victory means winning."),
        ("performance", "how well someone plays or acts", "Her performance improved this season.", "Performance is how you perform."),
    ],
    "leisure": [
        ("movie", "a story shown on a screen", "We watched a movie on Saturday.", "Movie means moving pictures."),
        ("music", "sounds arranged for listening or singing", "I listen to music after work.", "Music changes the mood."),
        ("weekend", "Saturday and Sunday", "My weekend was quiet.", "Weekend is the end of the work week."),
        ("plan", "an idea for what you will do", "Do you have a plan for tonight?", "A plan points to the future."),
        ("relax", "rest and feel calm", "I like to relax at home.", "Relax means release tension."),
        ("concert", "a live music event", "The concert starts at eight.", "A concert is music in person."),
        ("series", "a TV story with many episodes", "This series has great dialogue.", "A series is a sequence."),
        ("invite", "ask someone to join an activity", "I want to invite my friends.", "Invite brings people in."),
        ("museum", "a place with art, history, or objects", "The museum is free today.", "A museum preserves interesting things."),
        ("picnic", "a meal outside", "We had a picnic in the park.", "A picnic is food plus outdoors."),
        ("game", "an activity played for fun", "Let's play a game after dinner.", "A game is structured fun."),
        ("book", "written pages you read", "I started a new book yesterday.", "A book is a portable story or idea."),
        ("hobby", "an activity you enjoy in your free time", "Cooking is my favorite hobby.", "A hobby is chosen, not required."),
        ("ticket", "proof that you can enter an event", "I bought a ticket for the show.", "A ticket gives access."),
        ("playlist", "a list of songs to play", "This playlist is perfect for relaxing.", "A playlist plays songs in order."),
    ],
    "fitness": [
        ("workout", "a period of physical exercise", "My workout takes forty minutes.", "Workout means work the body out."),
        ("routine", "a regular set of actions", "My morning routine includes stretching.", "Routine repeats."),
        ("strength", "physical power", "This exercise builds leg strength.", "Strength makes you stronger."),
        ("stretch", "extend muscles gently", "I stretch before running.", "Stretch makes muscles longer."),
        ("coach", "a person who guides training", "The coach corrected my posture.", "A coach helps you improve safely."),
        ("recovery", "rest after effort or injury", "Recovery is part of training.", "Recovery lets the body recover."),
        ("energy", "the ability to be active", "I have more energy after breakfast.", "Energy powers activity."),
        ("habit", "something you do regularly", "Drinking water is a healthy habit.", "Habit happens often."),
        ("cardio", "exercise for heart and lungs", "Cardio helps my endurance.", "Cardio connects to the heart."),
        ("set", "a group of repeated exercises", "Do three sets of ten push-ups.", "A set is one exercise block."),
        ("reps", "short for repetitions", "I did twelve reps with light weights.", "Reps repeat the movement."),
        ("posture", "the position of your body", "Good posture protects your back.", "Posture is how you position yourself."),
        ("balance", "control that keeps you steady", "Yoga improves balance.", "Balance keeps you from falling."),
        ("nutrition", "food choices that support health", "Nutrition affects my energy.", "Nutrition nourishes the body."),
        ("rest", "time without effort so the body recovers", "Rest is important after hard training.", "Rest resets the body."),
    ],
    "hobbies": [
        ("project", "a planned activity with a result", "My weekend project is a small shelf.", "A project has steps and an outcome."),
        ("collection", "a group of similar things kept together", "Her coin collection is impressive.", "A collection collects items."),
        ("painting", "art made with paint", "I finished a small painting yesterday.", "Painting means creating with paint."),
        ("camera", "a device for taking photos or videos", "I bought a camera for travel photos.", "A camera captures moments."),
        ("skill", "an ability learned through practice", "Drawing is a skill I want to improve.", "A skill grows with practice."),
        ("creative", "using imagination to make something new", "This is a creative idea for a gift.", "Creative means creating with imagination."),
        ("practice", "repeated activity to improve", "Guitar practice helps my timing.", "Practice turns effort into ability."),
        ("favorite", "the one you like most", "My favorite hobby is photography.", "Favorite means most liked."),
        ("sketch", "a quick simple drawing", "I made a sketch before painting.", "A sketch is a first visual idea."),
        ("craft", "an activity that makes things by hand", "This craft uses paper and glue.", "Craft connects hands and creativity."),
        ("guitar", "a musical instrument with strings", "I play guitar after dinner.", "Guitar practice builds rhythm."),
        ("garden", "an area where plants grow", "I work in the garden on Sundays.", "Garden is a place and an activity."),
        ("recipe", "instructions for cooking food", "This recipe needs fresh tomatoes.", "A recipe is a cooking roadmap."),
        ("photo", "a picture taken with a camera", "This photo reminds me of my trip.", "Photo captures one moment."),
        ("workshop", "a class or event for practical learning", "I joined a weekend photography workshop.", "A workshop is where you work on a skill."),
    ],
}


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
    _replace_vocabulary(db, lesson, track)
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


def _replace_vocabulary(db: Session, lesson: LessonModel, track: dict[str, object]) -> None:
    db.query(VocabularyWordModel).filter(VocabularyWordModel.lesson_id == lesson.id).delete()
    vocabulary = VOCABULARY_BY_TRACK[str(track["slug"])]
    db.add_all(
        [
            VocabularyWordModel(
                lesson_id=lesson.id,
                word=word,
                theme=str(track["theme"]),
                definition=definition,
                example_sentence=example_sentence,
                memory_tip=memory_tip,
                position=index,
            )
            for index, (word, definition, example_sentence, memory_tip) in enumerate(
                vocabulary,
                start=1,
            )
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
