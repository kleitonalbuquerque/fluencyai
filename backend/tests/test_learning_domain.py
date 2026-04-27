from domain.entities.learning import (
    LearningPhrase,
    VocabularyWord,
    GrammarPoint,
    QuizQuestion,
    Quiz,
    Lesson
)

def test_create_learning_phrase():
    phrase = LearningPhrase(text="Hello", translation="Olá")
    assert phrase.text == "Hello"
    assert phrase.translation == "Olá"

def test_create_vocabulary_word():
    word = VocabularyWord(
        word="Apple",
        theme="Food",
        definition="A round fruit",
        example_sentence="I eat an apple.",
        memory_tip="Apple starts with A"
    )
    assert word.word == "Apple"
    assert word.theme == "Food"

def test_create_grammar_point():
    gp = GrammarPoint(title="Verb to be", explanation="Basic verb", example="I am")
    assert gp.title == "Verb to be"

def test_create_quiz_question():
    qq = QuizQuestion(prompt="Q?", options=["A", "B"], answer="A")
    assert qq.prompt == "Q?"
    assert qq.answer == "A"

def test_create_quiz():
    qq = QuizQuestion(prompt="Q?", options=["A", "B"], answer="A")
    quiz = Quiz(title="Daily Quiz", questions=[qq])
    assert quiz.title == "Daily Quiz"
    assert len(quiz.questions) == 1

def test_create_lesson():
    phrase = LearningPhrase(text="H", translation="O")
    word = VocabularyWord("W", "T", "D", "E", "M")
    gp = GrammarPoint("T", "E", "EX")
    quiz = Quiz("Q", [])
    lesson = Lesson(
        id="lesson-1",
        day=1,
        title="Day 1",
        essential_phrases=[phrase],
        vocabulary_words=[word],
        grammar_points=[gp],
        speaking_exercise="Speak",
        quiz=quiz
    )
    assert lesson.day == 1
    assert lesson.title == "Day 1"
