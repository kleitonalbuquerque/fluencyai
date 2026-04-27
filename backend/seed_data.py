from sqlalchemy.orm import Session
from infrastructure.database.session import SessionLocal
from infrastructure.database.models.learning import (
    LessonModel, LearningPhraseModel, VocabularyWordModel, 
    GrammarPointModel, QuizModel, QuizQuestionModel
)

def seed():
    db: Session = SessionLocal()
    try:
        # Check if lesson 1 exists
        if db.query(LessonModel).filter(LessonModel.day == 1).first():
            print("Lesson 1 already exists. Skipping seed.")
            return

        lesson = LessonModel(
            day=1,
            title="Essential Daily Conversations",
            speaking_exercise="Introduce yourself and your goals for 45 seconds."
        )
        db.add(lesson)
        db.flush()

        phrases = [
            LearningPhraseModel(lesson_id=lesson.id, text="How are you?", translation="Como você está?"),
            LearningPhraseModel(lesson_id=lesson.id, text="I am learning English.", translation="Estou aprendendo inglês."),
        ]
        # Add more phrases to reach 20 if needed for tests
        for i in range(3, 21):
            phrases.append(LearningPhraseModel(lesson_id=lesson.id, text=f"Phrase {i}", translation=f"Tradução {i}"))
        
        db.add_all(phrases)

        words = [
            VocabularyWordModel(
                lesson_id=lesson.id, word="reservation", theme="travel", 
                definition="booking", example_sentence="I have a reservation.", memory_tip="Tip"
            ),
        ]
        for i in range(2, 21):
            words.append(VocabularyWordModel(
                lesson_id=lesson.id, word=f"word{i}", theme="general", 
                definition="def", example_sentence="ex", memory_tip="tip"
            ))
        db.add_all(words)

        gps = [
            GrammarPointModel(lesson_id=lesson.id, title="Present Simple", explanation="Habits", example="I work."),
        ]
        for i in range(2, 6):
            gps.append(GrammarPointModel(lesson_id=lesson.id, title=f"Grammar {i}", explanation="Expl", example="Ex"))
        db.add_all(gps)

        quiz = QuizModel(lesson_id=lesson.id, title="Day 1 Quiz")
        db.add(quiz)
        db.flush()

        questions = [
            QuizQuestionModel(
                quiz_id=quiz.id, prompt="How to say hello?", 
                options=["Hello", "Bye"], answer="Hello"
            ) for _ in range(5)
        ]
        db.add_all(questions)

        db.commit()
        print("Seed completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
