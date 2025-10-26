-- PHASE 2 — DATABASE SCHEMA (SUPABASE SQL)
-- Safe baseline migration using IF NOT EXISTS to avoid conflicts

-- Core Tables
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  email text,
  is_admin boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  logo_url text,
  cover_url text,
  industry text,
  claimed_by uuid REFERENCES profiles(id),
  verified boolean DEFAULT false,
  overall_score numeric(5,2) DEFAULT 0,
  privacy numeric(5,2),
  transparency numeric(5,2),
  labor numeric(5,2),
  environment numeric(5,2),
  community numeric(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  user_id uuid REFERENCES profiles(id),
  contact_email text,
  message text,
  proof_url text,
  status text CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  user_id uuid REFERENCES profiles(id),
  rating int CHECK (rating BETWEEN 1 AND 5),
  title text,
  content text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  payload jsonb,
  overall_score numeric(5,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  type text,
  message text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  user_id uuid REFERENCES profiles(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  user_id uuid REFERENCES profiles(id),
  event_type text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security and Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public can view companies" ON companies FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Owners can update companies" ON companies FOR UPDATE USING (auth.uid() = claimed_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated can insert" ON reviews FOR INSERT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE company_claims ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can insert claims" ON company_claims FOR INSERT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can update claims" ON company_claims FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "All can view discussions" ON discussions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated can insert" ON discussions FOR INSERT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_company ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_score_history_company ON score_history(company_id);
CREATE INDEX IF NOT EXISTS idx_company_claims_company ON company_claims(company_id);
CREATE INDEX IF NOT EXISTS idx_discussions_company ON discussions(company_id);

-- End of Phase 2

-- Align schema with Edge Function expectations
ALTER TABLE IF EXISTS score_history
  ADD COLUMN IF NOT EXISTS privacy_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS transparency_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS labor_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS environment_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS community_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS summary text;

ALTER TABLE IF EXISTS companies
  ADD COLUMN IF NOT EXISTS privacy_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS transparency_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS labor_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS environment_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS community_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS last_scored_at timestamptz;