"""add_lesson_section_progress

Revision ID: 202604280001
Revises: 3154c76ad42e
Create Date: 2026-04-28 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "202604280001"
down_revision = "3154c76ad42e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "lesson_section_progress",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("lesson_day", sa.Integer(), nullable=False),
        sa.Column("section", sa.String(length=32), nullable=False),
        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "lesson_day",
            "section",
            name="uq_lesson_section_progress_user_day_section",
        ),
    )
    op.create_index(
        op.f("ix_lesson_section_progress_user_id"),
        "lesson_section_progress",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_lesson_section_progress_lesson_day"),
        "lesson_section_progress",
        ["lesson_day"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_lesson_section_progress_lesson_day"),
        table_name="lesson_section_progress",
    )
    op.drop_index(
        op.f("ix_lesson_section_progress_user_id"),
        table_name="lesson_section_progress",
    )
    op.drop_table("lesson_section_progress")
