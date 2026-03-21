CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_number TEXT NOT NULL UNIQUE,
    unit_type TEXT NOT NULL CHECK (
        unit_type IN ('PUBLIC_HOUSING', 'COMMERCIAL', 'RESIDENTIAL')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);