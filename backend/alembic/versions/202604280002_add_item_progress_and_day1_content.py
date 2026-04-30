"""add_item_progress_and_day1_content

Revision ID: 202604280002
Revises: 202604280001
Create Date: 2026-04-28 00:10:00.000000
"""
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


revision = "202604280002"
down_revision = "202604280001"
branch_labels = None
depends_on = None


PHRASES = [
    ("How are you?", "Como voce esta?"),
    ("I am learning English.", "Estou aprendendo ingles."),
    ("Could you repeat that, please?", "Voce poderia repetir, por favor?"),
    ("I did not understand the last sentence.", "Eu nao entendi a ultima frase."),
    ("Can you speak more slowly?", "Voce pode falar mais devagar?"),
    ("What does this word mean?", "O que esta palavra significa?"),
    ("I would like to practice my pronunciation.", "Eu gostaria de praticar minha pronuncia."),
    ("I usually study after work.", "Eu geralmente estudo depois do trabalho."),
    ("My goal is to speak with confidence.", "Meu objetivo e falar com confianca."),
    ("I need help with vocabulary.", "Preciso de ajuda com vocabulario."),
    ("Let me try again.", "Deixe-me tentar de novo."),
    ("That makes sense.", "Isso faz sentido."),
    ("Could you give me an example?", "Voce poderia me dar um exemplo?"),
    ("I have a question about grammar.", "Tenho uma pergunta sobre gramatica."),
    ("I want to improve my listening skills.", "Quero melhorar minha escuta."),
    ("I can introduce myself in English.", "Consigo me apresentar em ingles."),
    ("I am available for a short meeting.", "Estou disponivel para uma reuniao rapida."),
    ("Thank you for your feedback.", "Obrigado pelo seu feedback."),
    ("I will review this lesson today.", "Vou revisar esta licao hoje."),
    ("See you tomorrow.", "Ate amanha."),
]

WORDS = [
    ("reservation", "daily conversation", "a booking made in advance", "I have a reservation for tonight.", "Reserve a table before the conversation."),
    ("schedule", "daily conversation", "a planned list of times and activities", "My schedule is full today.", "Schedule sounds like school planning."),
    ("goal", "learning", "something you want to achieve", "My goal is to speak clearly.", "A goal is where you want the ball to go."),
    ("confidence", "learning", "the feeling that you can do something well", "Practice builds confidence.", "Confidence grows when you repeat small wins."),
    ("feedback", "learning", "advice or comments about performance", "Thank you for your feedback.", "Feedback feeds your next attempt."),
    ("pronunciation", "speaking", "the way a word is spoken", "I want to improve my pronunciation.", "Pronunciation is how the word sounds."),
    ("sentence", "grammar", "a group of words that expresses an idea", "This sentence is useful.", "A sentence sends one complete idea."),
    ("meaning", "vocabulary", "what a word or phrase expresses", "What is the meaning of this word?", "Meaning is the message behind the word."),
    ("meeting", "work", "a planned conversation with people", "I have a meeting at three.", "People meet in a meeting."),
    ("available", "work", "free or able to do something", "I am available after lunch.", "Available means your time is open."),
    ("improve", "learning", "to make something better", "I practice to improve my English.", "Improve means move upward."),
    ("listening", "skills", "the skill of understanding spoken language", "Listening is difficult at first.", "Listen first, answer second."),
    ("repeat", "conversation", "to say something again", "Could you repeat that?", "Repeat means do it again."),
    ("slowly", "conversation", "at a low speed", "Please speak slowly.", "Slowly means not fast."),
    ("review", "learning", "to study something again", "I will review this lesson today.", "Review means view it again."),
]

GRAMMAR = [
    ("Simple Present for routines", "Use the simple present to talk about habits, routines, and general facts.", "I study English every day."),
    ("Polite requests with could", "Use 'Could you...' to ask for help in a polite way.", "Could you repeat that, please?"),
    ("Want, need, and would like + infinitive", "Use these verbs before 'to' plus another verb to express goals or needs.", "I would like to practice my pronunciation."),
    ("Adverbs of frequency", "Use usually, often, sometimes, and always to say how frequently something happens.", "I usually study after work."),
    ("Can for ability and requests", "Use 'can' to talk about ability or to make direct requests.", "Can you speak more slowly?"),
]

QUESTIONS = [
    ("Which sentence is a polite request?", ["Could you repeat that, please?", "Repeat now.", "You repeat."], "Could you repeat that, please?"),
    ("What does 'I usually study after work' describe?", ["A routine", "A future plan", "A completed trip"], "A routine"),
    ("Choose the best response to 'What does this word mean?'", ["It means booking.", "Yesterday.", "At seven."], "It means booking."),
    ("Which word means advice or comments about performance?", ["feedback", "schedule", "meeting"], "feedback"),
    ("Complete: I would like ___ my pronunciation.", ["to practice", "practice", "practiced"], "to practice"),
]


def upgrade() -> None:
    op.add_column("learning_phrases", sa.Column("position", sa.Integer(), nullable=True))
    op.add_column("vocabulary_words", sa.Column("position", sa.Integer(), nullable=True))
    op.add_column("grammar_points", sa.Column("position", sa.Integer(), nullable=True))
    op.add_column("quiz_questions", sa.Column("position", sa.Integer(), nullable=True))
    op.add_column("user_progress", sa.Column("last_streak_date", sa.Date(), nullable=True))

    op.create_table(
        "lesson_item_progress",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("lesson_day", sa.Integer(), nullable=False),
        sa.Column("section", sa.String(length=32), nullable=False),
        sa.Column("item_key", sa.String(length=64), nullable=False),
        sa.Column("answer", sa.Text(), nullable=True),
        sa.Column("is_correct", sa.Boolean(), nullable=True),
        sa.Column("xp_awarded", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "lesson_day",
            "section",
            "item_key",
            name="uq_lesson_item_progress_user_day_section_item",
        ),
    )
    op.create_index(op.f("ix_lesson_item_progress_user_id"), "lesson_item_progress", ["user_id"])
    op.create_index(op.f("ix_lesson_item_progress_lesson_day"), "lesson_item_progress", ["lesson_day"])

    _backfill_positions()
    _replace_day_one_content()

    op.alter_column("learning_phrases", "position", nullable=False)
    op.alter_column("vocabulary_words", "position", nullable=False)
    op.alter_column("grammar_points", "position", nullable=False)
    op.alter_column("quiz_questions", "position", nullable=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_lesson_item_progress_lesson_day"), table_name="lesson_item_progress")
    op.drop_index(op.f("ix_lesson_item_progress_user_id"), table_name="lesson_item_progress")
    op.drop_table("lesson_item_progress")
    op.drop_column("user_progress", "last_streak_date")
    op.drop_column("quiz_questions", "position")
    op.drop_column("grammar_points", "position")
    op.drop_column("vocabulary_words", "position")
    op.drop_column("learning_phrases", "position")


def _backfill_positions() -> None:
    op.execute(
        """
        WITH ordered AS (
            SELECT id, row_number() OVER (PARTITION BY lesson_id ORDER BY id) AS rn
            FROM learning_phrases
        )
        UPDATE learning_phrases AS target
        SET position = ordered.rn
        FROM ordered
        WHERE target.id = ordered.id
        """
    )
    op.execute(
        """
        WITH ordered AS (
            SELECT id, row_number() OVER (PARTITION BY lesson_id ORDER BY id) AS rn
            FROM vocabulary_words
        )
        UPDATE vocabulary_words AS target
        SET position = ordered.rn
        FROM ordered
        WHERE target.id = ordered.id
        """
    )
    op.execute(
        """
        WITH ordered AS (
            SELECT id, row_number() OVER (PARTITION BY lesson_id ORDER BY id) AS rn
            FROM grammar_points
        )
        UPDATE grammar_points AS target
        SET position = ordered.rn
        FROM ordered
        WHERE target.id = ordered.id
        """
    )
    op.execute(
        """
        WITH ordered AS (
            SELECT id, row_number() OVER (PARTITION BY quiz_id ORDER BY id) AS rn
            FROM quiz_questions
        )
        UPDATE quiz_questions AS target
        SET position = ordered.rn
        FROM ordered
        WHERE target.id = ordered.id
        """
    )


def _replace_day_one_content() -> None:
    bind = op.get_bind()
    lesson_id = bind.execute(sa.text("SELECT id FROM lessons WHERE day = 1")).scalar_one_or_none()
    if lesson_id is None:
        return

    bind.execute(
        sa.text(
            """
            UPDATE lessons
            SET title = :title,
                speaking_exercise = :speaking_exercise
            WHERE id = :lesson_id
            """
        ),
        {
            "lesson_id": lesson_id,
            "title": "Essential Daily Conversations",
            "speaking_exercise": "Introduce yourself, explain your English goal, and mention one situation where you want to speak more confidently.",
        },
    )

    quiz_id = bind.execute(
        sa.text("SELECT id FROM quizzes WHERE lesson_id = :lesson_id"),
        {"lesson_id": lesson_id},
    ).scalar_one_or_none()
    if quiz_id is None:
        quiz_id = str(uuid4())
        bind.execute(
            sa.text("INSERT INTO quizzes (id, lesson_id, title) VALUES (:id, :lesson_id, :title)"),
            {"id": quiz_id, "lesson_id": lesson_id, "title": "Day 1 Conversation Check"},
        )
    else:
        bind.execute(
            sa.text("UPDATE quizzes SET title = :title WHERE id = :id"),
            {"id": quiz_id, "title": "Day 1 Conversation Check"},
        )

    bind.execute(sa.text("DELETE FROM quiz_questions WHERE quiz_id = :quiz_id"), {"quiz_id": quiz_id})
    bind.execute(sa.text("DELETE FROM learning_phrases WHERE lesson_id = :lesson_id"), {"lesson_id": lesson_id})
    bind.execute(sa.text("DELETE FROM vocabulary_words WHERE lesson_id = :lesson_id"), {"lesson_id": lesson_id})
    bind.execute(sa.text("DELETE FROM grammar_points WHERE lesson_id = :lesson_id"), {"lesson_id": lesson_id})

    phrase_table = sa.table(
        "learning_phrases",
        sa.column("id", sa.String),
        sa.column("lesson_id", sa.String),
        sa.column("text", sa.Text),
        sa.column("translation", sa.Text),
        sa.column("position", sa.Integer),
    )
    op.bulk_insert(
        phrase_table,
        [
            {
                "id": str(uuid4()),
                "lesson_id": lesson_id,
                "text": text,
                "translation": translation,
                "position": index,
            }
            for index, (text, translation) in enumerate(PHRASES, start=1)
        ],
    )

    word_table = sa.table(
        "vocabulary_words",
        sa.column("id", sa.String),
        sa.column("lesson_id", sa.String),
        sa.column("word", sa.String),
        sa.column("theme", sa.String),
        sa.column("definition", sa.Text),
        sa.column("example_sentence", sa.Text),
        sa.column("memory_tip", sa.Text),
        sa.column("position", sa.Integer),
    )
    op.bulk_insert(
        word_table,
        [
            {
                "id": str(uuid4()),
                "lesson_id": lesson_id,
                "word": word,
                "theme": theme,
                "definition": definition,
                "example_sentence": example,
                "memory_tip": tip,
                "position": index,
            }
            for index, (word, theme, definition, example, tip) in enumerate(WORDS, start=1)
        ],
    )

    grammar_table = sa.table(
        "grammar_points",
        sa.column("id", sa.String),
        sa.column("lesson_id", sa.String),
        sa.column("title", sa.String),
        sa.column("explanation", sa.Text),
        sa.column("example", sa.Text),
        sa.column("position", sa.Integer),
    )
    op.bulk_insert(
        grammar_table,
        [
            {
                "id": str(uuid4()),
                "lesson_id": lesson_id,
                "title": title,
                "explanation": explanation,
                "example": example,
                "position": index,
            }
            for index, (title, explanation, example) in enumerate(GRAMMAR, start=1)
        ],
    )

    question_table = sa.table(
        "quiz_questions",
        sa.column("id", sa.String),
        sa.column("quiz_id", sa.String),
        sa.column("prompt", sa.Text),
        sa.column("options", sa.JSON),
        sa.column("answer", sa.Text),
        sa.column("position", sa.Integer),
    )
    op.bulk_insert(
        question_table,
        [
            {
                "id": str(uuid4()),
                "quiz_id": quiz_id,
                "prompt": prompt,
                "options": options,
                "answer": answer,
                "position": index,
            }
            for index, (prompt, options, answer) in enumerate(QUESTIONS, start=1)
        ],
    )
