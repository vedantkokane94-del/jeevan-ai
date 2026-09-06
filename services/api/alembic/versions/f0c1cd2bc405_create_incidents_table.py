"""create_incidents_table

Revision ID: f0c1cd2bc405
Revises: d0e2fa32a4c0
Create Date: 2026-08-25 10:56:02.493507

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f0c1cd2bc405'
down_revision: Union[str, None] = 'd0e2fa32a4c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


import geoalchemy2

def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE TYPE incident_severity AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');")
    op.execute("CREATE TYPE incident_status AS ENUM ('NEW', 'DISPATCHED', 'RESPONDING', 'RESOLVED');")
    op.create_table(
        'incidents',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('severity', sa.Enum('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', name='incident_severity'), nullable=False),
        sa.Column('status', sa.Enum('NEW', 'DISPATCHED', 'RESPONDING', 'RESOLVED', name='incident_status'), nullable=False),
        sa.Column('location', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=False),
        sa.Column('reported_by_id', sa.UUID(), nullable=True),
        sa.Column('assigned_to_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['assigned_to_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['reported_by_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    # create_index for location is handled automatically by GeoAlchemy2 in some contexts, but we can enforce it:
    # Actually GeoAlchemy2 creates the spatial index with op.create_table or we can omit explicit index creation here if spatial_index=True is set on column creation.

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('incidents')
    op.execute("DROP TYPE incident_status;")
    op.execute("DROP TYPE incident_severity;")
