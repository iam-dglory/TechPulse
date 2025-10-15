-- Initialize TexhPulze Database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database if it doesn't exist (handled by POSTGRES_DB)
-- CREATE DATABASE texhpulze_dev;

-- Set timezone
SET timezone = 'UTC';

-- Create a read-only user for monitoring (optional)
-- CREATE USER texhpulze_readonly WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE texhpulze_dev TO texhpulze_readonly;
-- GRANT USAGE ON SCHEMA public TO texhpulze_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO texhpulze_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO texhpulze_readonly;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'TexhPulze database initialized successfully!';
END $$;
