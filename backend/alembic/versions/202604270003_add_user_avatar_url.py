"""add user avatar url

Revision ID: 202604270003
Revises: 202604270002
Create Date: 2026-04-27 14:20:00
"""
from alembic import op
import sqlalchemy as sa


revision = "202604270003"
down_revision = "202604270002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "avatar_url")
