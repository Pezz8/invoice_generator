CREATE TABLE IF NOT EXISTS unit_people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    occupant_type TEXT NOT NULL CHECK (
        occupant_type IN ('OWNER', 'TENANT', 'MANAGER')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (unit_id, person_id, occupant_type)
);