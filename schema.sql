CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE early_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (name != ''),
    persona TEXT NOT NULL CHECK (persona != ''),
    email TEXT UNIQUE NOT NULL CHECK (email != ''),
    transparency_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_early_access_email 
ON early_access(email);

CREATE INDEX idx_early_access_created_at 
ON early_access(created_at DESC);
