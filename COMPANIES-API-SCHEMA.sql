-- ============================================
-- COMPANIES API DATABASE SCHEMA
-- ============================================
-- This SQL creates tables for Companies API with scores, promises, and votes

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANY SCORES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.company_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID UNIQUE NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  overall_score DECIMAL(3,1) DEFAULT 5.0 CHECK (overall_score >= 0 AND overall_score <= 10),
  ethics_score DECIMAL(3,1) DEFAULT 5.0 CHECK (ethics_score >= 0 AND ethics_score <= 10),
  credibility_score DECIMAL(3,1) DEFAULT 5.0 CHECK (credibility_score >= 0 AND credibility_score <= 10),
  delivery_score DECIMAL(3,1) DEFAULT 5.0 CHECK (delivery_score >= 0 AND delivery_score <= 10),
  security_score DECIMAL(3,1) DEFAULT 5.0 CHECK (security_score >= 0 AND security_score <= 10),
  innovation_score DECIMAL(3,1) DEFAULT 5.0 CHECK (innovation_score >= 0 AND innovation_score <= 10),
  growth_rate DECIMAL(5,2), -- Percentage growth rate
  verification_tier TEXT DEFAULT 'unverified' CHECK (verification_tier IN ('unverified', 'basic', 'verified', 'premium')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for company_scores
CREATE INDEX IF NOT EXISTS idx_company_scores_company_id ON public.company_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_company_scores_overall ON public.company_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_company_scores_verification ON public.company_scores(verification_tier);
CREATE INDEX IF NOT EXISTS idx_company_scores_growth ON public.company_scores(growth_rate DESC NULLS LAST);

-- ============================================
-- PROMISES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.promises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  promise_text TEXT NOT NULL CHECK (LENGTH(promise_text) >= 20 AND LENGTH(promise_text) <= 500),
  category TEXT NOT NULL CHECK (category IN ('product', 'ethics', 'sustainability', 'privacy', 'security')),
  promised_date DATE NOT NULL,
  deadline_date DATE NOT NULL CHECK (deadline_date >= promised_date),
  source_url TEXT NOT NULL,
  impact_level INTEGER NOT NULL CHECK (impact_level >= 1 AND impact_level <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'kept', 'broken', 'delayed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for promises
CREATE INDEX IF NOT EXISTS idx_promises_company_id ON public.promises(company_id);
CREATE INDEX IF NOT EXISTS idx_promises_status ON public.promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_deadline ON public.promises(deadline_date);
CREATE INDEX IF NOT EXISTS idx_promises_category ON public.promises(category);
CREATE INDEX IF NOT EXISTS idx_promises_impact ON public.promises(impact_level DESC);

-- ============================================
-- VOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('ethics', 'credibility', 'delivery', 'security', 'innovation')),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  comment TEXT CHECK (comment IS NULL OR LENGTH(comment) <= 500),
  evidence_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure one vote per user per company per type
  UNIQUE(user_id, company_id, vote_type)
);

-- Create indexes for votes
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_company_id ON public.votes(company_id);
CREATE INDEX IF NOT EXISTS idx_votes_type ON public.votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_votes_score ON public.votes(score DESC);
CREATE INDEX IF NOT EXISTS idx_votes_created ON public.votes(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE public.company_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Company Scores Policies
CREATE POLICY "Company scores are viewable by everyone"
  ON public.company_scores FOR SELECT
  USING (true);

CREATE POLICY "Admins can update company scores"
  ON public.company_scores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Promises Policies
CREATE POLICY "Promises are viewable by everyone"
  ON public.promises FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create promises"
  ON public.promises FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update promises"
  ON public.promises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Votes Policies
CREATE POLICY "Votes are viewable by everyone"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create votes"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON public.votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON public.votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for company_scores
CREATE TRIGGER update_company_scores_updated_at
  BEFORE UPDATE ON public.company_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for promises
CREATE TRIGGER update_promises_updated_at
  BEFORE UPDATE ON public.promises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for votes
CREATE TRIGGER update_votes_updated_at
  BEFORE UPDATE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Calculate Company Scores
-- ============================================

CREATE OR REPLACE FUNCTION calculate_company_scores(p_company_id UUID)
RETURNS void AS $$
DECLARE
  v_ethics_avg DECIMAL(3,1);
  v_credibility_avg DECIMAL(3,1);
  v_delivery_avg DECIMAL(3,1);
  v_security_avg DECIMAL(3,1);
  v_innovation_avg DECIMAL(3,1);
  v_overall_avg DECIMAL(3,1);
BEGIN
  -- Calculate average scores from votes
  SELECT
    COALESCE(AVG(CASE WHEN vote_type = 'ethics' THEN score END), 5.0),
    COALESCE(AVG(CASE WHEN vote_type = 'credibility' THEN score END), 5.0),
    COALESCE(AVG(CASE WHEN vote_type = 'delivery' THEN score END), 5.0),
    COALESCE(AVG(CASE WHEN vote_type = 'security' THEN score END), 5.0),
    COALESCE(AVG(CASE WHEN vote_type = 'innovation' THEN score END), 5.0)
  INTO
    v_ethics_avg,
    v_credibility_avg,
    v_delivery_avg,
    v_security_avg,
    v_innovation_avg
  FROM public.votes
  WHERE company_id = p_company_id;

  -- Calculate overall average
  v_overall_avg := (v_ethics_avg + v_credibility_avg + v_delivery_avg + v_security_avg + v_innovation_avg) / 5.0;

  -- Update company_scores
  UPDATE public.company_scores
  SET
    ethics_score = v_ethics_avg,
    credibility_score = v_credibility_avg,
    delivery_score = v_delivery_avg,
    security_score = v_security_avg,
    innovation_score = v_innovation_avg,
    overall_score = v_overall_avg,
    updated_at = NOW()
  WHERE company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-update scores on vote changes
-- ============================================

CREATE OR REPLACE FUNCTION trigger_recalculate_scores()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_company_scores(OLD.company_id);
  ELSE
    PERFORM calculate_company_scores(NEW.company_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_scores_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_scores();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Create scores for existing companies
INSERT INTO public.company_scores (company_id, overall_score, ethics_score, credibility_score, delivery_score, security_score, innovation_score, verification_tier)
SELECT
  id,
  7.5,
  8.0,
  7.0,
  7.5,
  8.0,
  7.5,
  'verified'
FROM public.companies
WHERE slug = 'techcorp-inc'
ON CONFLICT (company_id) DO UPDATE
SET
  overall_score = EXCLUDED.overall_score,
  ethics_score = EXCLUDED.ethics_score,
  credibility_score = EXCLUDED.credibility_score,
  delivery_score = EXCLUDED.delivery_score,
  security_score = EXCLUDED.security_score,
  innovation_score = EXCLUDED.innovation_score,
  verification_tier = EXCLUDED.verification_tier;

INSERT INTO public.company_scores (company_id, overall_score, ethics_score, credibility_score, delivery_score, security_score, innovation_score, verification_tier, growth_rate)
SELECT
  id,
  8.5,
  9.0,
  8.0,
  8.5,
  8.0,
  9.0,
  'premium',
  15.5
FROM public.companies
WHERE slug = 'greenenergy-solutions'
ON CONFLICT (company_id) DO UPDATE
SET
  overall_score = EXCLUDED.overall_score,
  ethics_score = EXCLUDED.ethics_score,
  credibility_score = EXCLUDED.credibility_score,
  delivery_score = EXCLUDED.delivery_score,
  security_score = EXCLUDED.security_score,
  innovation_score = EXCLUDED.innovation_score,
  verification_tier = EXCLUDED.verification_tier,
  growth_rate = EXCLUDED.growth_rate;

INSERT INTO public.company_scores (company_id, overall_score, ethics_score, credibility_score, delivery_score, security_score, innovation_score, verification_tier)
SELECT
  id,
  6.0,
  5.0,
  6.5,
  7.0,
  5.5,
  6.0,
  'basic'
FROM public.companies
WHERE slug = 'healthtech-innovations'
ON CONFLICT (company_id) DO UPDATE
SET
  overall_score = EXCLUDED.overall_score,
  ethics_score = EXCLUDED.ethics_score,
  credibility_score = EXCLUDED.credibility_score,
  delivery_score = EXCLUDED.delivery_score,
  security_score = EXCLUDED.security_score,
  innovation_score = EXCLUDED.innovation_score,
  verification_tier = EXCLUDED.verification_tier;

-- Sample promises
INSERT INTO public.promises (company_id, promise_text, category, promised_date, deadline_date, source_url, impact_level, status)
SELECT
  id,
  'We will achieve carbon neutrality across all operations by end of 2025',
  'sustainability',
  '2024-01-01',
  '2025-12-31',
  'https://greenenergy.example.com/sustainability-commitment',
  5,
  'in-progress'
FROM public.companies
WHERE slug = 'greenenergy-solutions'
ON CONFLICT DO NOTHING;

INSERT INTO public.promises (company_id, promise_text, category, promised_date, deadline_date, source_url, impact_level, status)
SELECT
  id,
  'Launch AI ethics review board for all new AI products',
  'ethics',
  '2025-01-01',
  '2025-06-30',
  'https://techcorp.example.com/ai-ethics-commitment',
  4,
  'pending'
FROM public.companies
WHERE slug = 'techcorp-inc'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count scores
SELECT COUNT(*) as scores_count FROM public.company_scores;

-- Count promises
SELECT COUNT(*) as promises_count FROM public.promises;

-- Count votes
SELECT COUNT(*) as votes_count FROM public.votes;

-- Sample query: Companies with scores
SELECT
  c.name,
  c.industry,
  cs.overall_score,
  cs.verification_tier,
  cs.growth_rate
FROM public.companies c
LEFT JOIN public.company_scores cs ON c.id = cs.company_id
ORDER BY cs.overall_score DESC NULLS LAST
LIMIT 10;

-- Sample query: Company with promises
SELECT
  c.name,
  p.promise_text,
  p.category,
  p.status,
  p.deadline_date
FROM public.companies c
JOIN public.promises p ON c.id = p.company_id
ORDER BY p.created_at DESC
LIMIT 10;
