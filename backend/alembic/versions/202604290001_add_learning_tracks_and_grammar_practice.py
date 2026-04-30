"""add_learning_tracks_and_grammar_practice

Revision ID: 202604290001
Revises: 202604280002
Create Date: 2026-04-29 00:10:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "202604290001"
down_revision = "202604280002"
branch_labels = None
depends_on = None


TRACKS = [
    ("work", "Work", "Professional English for meetings, projects, and interviews.", 1),
    ("study", "Study", "English for classes, self-study, and daily learning routines.", 2),
    ("travel", "Travel", "Airport, hotel, directions, and trip planning conversations.", 3),
    ("dining", "Dining", "Restaurant, cafe, ordering, and social meal vocabulary.", 4),
    ("sports", "Sports", "Practice conversations around games, teams, and performance.", 5),
    ("leisure", "Leisure", "Movies, music, weekend plans, and casual conversations.", 6),
    ("fitness", "Fitness", "Gym, health routines, training, and active lifestyle English.", 7),
    ("hobbies", "Hobbies", "Personal interests, creative projects, and free-time topics.", 8),
]


def upgrade() -> None:
    op.create_table(
        "learning_tracks",
        sa.Column("slug", sa.String(length=40), nullable=False),
        sa.Column("label", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("slug"),
    )
    track_table = sa.table(
        "learning_tracks",
        sa.column("slug", sa.String),
        sa.column("label", sa.String),
        sa.column("description", sa.Text),
        sa.column("position", sa.Integer),
    )
    op.bulk_insert(
        track_table,
        [
            {"slug": slug, "label": label, "description": description, "position": position}
            for slug, label, description, position in TRACKS
        ],
    )

    op.add_column(
        "lessons",
        sa.Column(
            "track_slug",
            sa.String(length=40),
            nullable=True,
            server_default="study",
        ),
    )
    op.execute("UPDATE lessons SET track_slug = 'study' WHERE track_slug IS NULL")
    op.alter_column("lessons", "track_slug", nullable=False)
    op.create_foreign_key(
        "fk_lessons_track_slug_learning_tracks",
        "lessons",
        "learning_tracks",
        ["track_slug"],
        ["slug"],
    )
    op.drop_index(op.f("ix_lessons_day"), table_name="lessons")
    op.create_index(op.f("ix_lessons_day"), "lessons", ["day"], unique=False)
    op.create_index(op.f("ix_lessons_track_slug"), "lessons", ["track_slug"], unique=False)
    op.create_unique_constraint("uq_lessons_track_day", "lessons", ["track_slug", "day"])

    op.create_table(
        "grammar_practice_items",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("lesson_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("options", sa.JSON(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "user_active_tracks",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("track_slug", sa.String(length=40), nullable=False, server_default="study"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["track_slug"], ["learning_tracks.slug"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("user_id"),
    )

    op.create_table(
        "user_track_progress",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("track_slug", sa.String(length=40), nullable=False, server_default="study"),
        sa.Column("current_day", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("lessons_completed", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("last_activity", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["track_slug"], ["learning_tracks.slug"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "track_slug", name="uq_user_track_progress_user_track"),
    )
    op.create_index(op.f("ix_user_track_progress_user_id"), "user_track_progress", ["user_id"], unique=False)
    op.create_index(op.f("ix_user_track_progress_track_slug"), "user_track_progress", ["track_slug"], unique=False)

    op.execute(
        """
        INSERT INTO user_track_progress (id, user_id, track_slug, current_day, lessons_completed)
        SELECT substr(md5(user_id || '-study'), 1, 36), user_id, 'study', current_day, lessons_completed
        FROM user_progress
        ON CONFLICT DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO user_active_tracks (user_id, track_slug)
        SELECT user_id, 'study'
        FROM user_progress
        ON CONFLICT DO NOTHING
        """
    )

    op.add_column(
        "lesson_section_progress",
        sa.Column("track_slug", sa.String(length=40), nullable=True, server_default="study"),
    )
    op.execute("UPDATE lesson_section_progress SET track_slug = 'study' WHERE track_slug IS NULL")
    op.alter_column("lesson_section_progress", "track_slug", nullable=False)
    op.create_foreign_key(
        "fk_lesson_section_progress_track_slug_learning_tracks",
        "lesson_section_progress",
        "learning_tracks",
        ["track_slug"],
        ["slug"],
    )
    op.create_index(
        op.f("ix_lesson_section_progress_track_slug"),
        "lesson_section_progress",
        ["track_slug"],
        unique=False,
    )
    op.drop_constraint(
        "uq_lesson_section_progress_user_day_section",
        "lesson_section_progress",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_lesson_section_progress_user_track_day_section",
        "lesson_section_progress",
        ["user_id", "track_slug", "lesson_day", "section"],
    )

    op.add_column(
        "lesson_item_progress",
        sa.Column("track_slug", sa.String(length=40), nullable=True, server_default="study"),
    )
    op.add_column("lesson_item_progress", sa.Column("score", sa.Integer(), nullable=True))
    op.add_column("lesson_item_progress", sa.Column("feedback", sa.JSON(), nullable=True))
    op.execute("UPDATE lesson_item_progress SET track_slug = 'study' WHERE track_slug IS NULL")
    op.alter_column("lesson_item_progress", "track_slug", nullable=False)
    op.create_foreign_key(
        "fk_lesson_item_progress_track_slug_learning_tracks",
        "lesson_item_progress",
        "learning_tracks",
        ["track_slug"],
        ["slug"],
    )
    op.create_index(
        op.f("ix_lesson_item_progress_track_slug"),
        "lesson_item_progress",
        ["track_slug"],
        unique=False,
    )
    op.drop_constraint(
        "uq_lesson_item_progress_user_day_section_item",
        "lesson_item_progress",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_lesson_item_progress_user_track_day_section_item",
        "lesson_item_progress",
        ["user_id", "track_slug", "lesson_day", "section", "item_key"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_lesson_item_progress_track_slug_learning_tracks",
        "lesson_item_progress",
        type_="foreignkey",
    )
    op.drop_constraint(
        "uq_lesson_item_progress_user_track_day_section_item",
        "lesson_item_progress",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_lesson_item_progress_user_day_section_item",
        "lesson_item_progress",
        ["user_id", "lesson_day", "section", "item_key"],
    )
    op.drop_index(op.f("ix_lesson_item_progress_track_slug"), table_name="lesson_item_progress")
    op.drop_column("lesson_item_progress", "feedback")
    op.drop_column("lesson_item_progress", "score")
    op.drop_column("lesson_item_progress", "track_slug")

    op.drop_constraint(
        "fk_lesson_section_progress_track_slug_learning_tracks",
        "lesson_section_progress",
        type_="foreignkey",
    )
    op.drop_constraint(
        "uq_lesson_section_progress_user_track_day_section",
        "lesson_section_progress",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_lesson_section_progress_user_day_section",
        "lesson_section_progress",
        ["user_id", "lesson_day", "section"],
    )
    op.drop_index(op.f("ix_lesson_section_progress_track_slug"), table_name="lesson_section_progress")
    op.drop_column("lesson_section_progress", "track_slug")

    op.drop_index(op.f("ix_user_track_progress_track_slug"), table_name="user_track_progress")
    op.drop_index(op.f("ix_user_track_progress_user_id"), table_name="user_track_progress")
    op.drop_table("user_track_progress")
    op.drop_table("user_active_tracks")
    op.drop_table("grammar_practice_items")

    op.drop_constraint("uq_lessons_track_day", "lessons", type_="unique")
    op.drop_constraint("fk_lessons_track_slug_learning_tracks", "lessons", type_="foreignkey")
    op.drop_index(op.f("ix_lessons_track_slug"), table_name="lessons")
    op.drop_index(op.f("ix_lessons_day"), table_name="lessons")
    op.create_index(op.f("ix_lessons_day"), "lessons", ["day"], unique=True)
    op.drop_column("lessons", "track_slug")
    op.drop_table("learning_tracks")
