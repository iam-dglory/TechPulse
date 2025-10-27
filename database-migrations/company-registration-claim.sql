-- TechPulze Company Registration & Claim System
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Create company_registrations table
-- ============================================

CREATE TABLE IF NOT EXISTS company_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  website TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  founded_year INTEGER,
  employee_count INTEGER,
  headquarters TEXT,
  contact_email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_position TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_token UUID,
  verified_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_status ON company_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON company_registrations(contact_email);
CREATE INDEX IF NOT EXISTS idx_registrations_token ON company_registrations(verification_token);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON company_registrations(created_at DESC);

-- ============================================
-- 2. Create company_claims table
-- ============================================

CREATE TABLE IF NOT EXISTS company_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_position TEXT NOT NULL,
  proof_of_employment TEXT NOT NULL,
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_token UUID,
  verified_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  claimed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_company ON company_claims(company_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON company_claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_email ON company_claims(contact_email);
CREATE INDEX IF NOT EXISTS idx_claims_token ON company_claims(verification_token);
CREATE INDEX IF NOT EXISTS idx_claims_created ON company_claims(created_at DESC);

-- ============================================
-- 3. Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE company_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view registrations" ON company_registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON company_registrations;
DROP POLICY IF EXISTS "Users can view their own registration" ON company_registrations;

DROP POLICY IF EXISTS "Admins can view claims" ON company_claims;
DROP POLICY IF EXISTS "Admins can update claims" ON company_claims;
DROP POLICY IF EXISTS "Users can view their own claims" ON company_claims;

-- ============================================
-- 4. RLS Policies for company_registrations
-- ============================================

-- Admins can see all registrations
CREATE POLICY "Admins can view registrations"
  ON company_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Admins can update registrations
CREATE POLICY "Admins can update registrations"
  ON company_registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Users can view their own registration
CREATE POLICY "Users can view their own registration"
  ON company_registrations FOR SELECT
  USING (contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ============================================
-- 5. RLS Policies for company_claims
-- ============================================

-- Admins can see all claims
CREATE POLICY "Admins can view claims"
  ON company_claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Admins can update claims
CREATE POLICY "Admins can update claims"
  ON company_claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Users can view their own claims
CREATE POLICY "Users can view their own claims"
  ON company_claims FOR SELECT
  USING (contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ============================================
-- 6. Trigger to update updated_at timestamp
-- ============================================

-- Create or replace function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_company_registrations_updated_at ON company_registrations;
DROP TRIGGER IF EXISTS update_company_claims_updated_at ON company_claims;

-- Create triggers
CREATE TRIGGER update_company_registrations_updated_at
    BEFORE UPDATE ON company_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_claims_updated_at
    BEFORE UPDATE ON company_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Add company_owner column to companies table
-- ============================================

-- Add owner column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'companies'
        AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE companies
        ADD COLUMN owner_id UUID REFERENCES profiles(id);

        CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables were created
SELECT 'company_registrations' as table_name, COUNT(*) as row_count FROM company_registrations
UNION ALL
SELECT 'company_claims' as table_name, COUNT(*) as row_count FROM company_claims;

-- Show table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('company_registrations', 'company_claims')
ORDER BY table_name, ordinal_position;

-- ============================================
-- DONE!
-- ============================================
-- Tables created successfully!
-- You can now use the company registration and claim system.
