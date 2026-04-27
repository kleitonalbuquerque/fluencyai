"""add_user_is_admin

Revision ID: 3154c76ad42e
Revises: 81724a9684c6
Create Date: 2026-04-27 19:50:36.004993
"""
from alembic import op
import sqlalchemy as sa


revision = '3154c76ad42e'
down_revision = '81724a9684c6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Adiciona a coluna permitindo nulo inicialmente
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=True))
    
    # 2. Preenche os valores nulos com False
    op.execute("UPDATE users SET is_admin = false")
    
    # 3. Altera a coluna para não permitir nulo
    op.alter_column('users', 'is_admin', nullable=False)


def downgrade() -> None:
    op.drop_column('users', 'is_admin')
