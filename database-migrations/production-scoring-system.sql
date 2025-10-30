-- ================================================
-- PRODUCTION-GRADE AI SCORING SYSTEM - DATABASE SCHEMA
-- ================================================
-- Run this in Supabase SQL Editor

-- 1. Add columns to companies table for detailed tracking
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_scored_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS score_confidence TEXT CHECK (score_confidence IN ('high', 'medium', 'low'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS data_quality_score NUMERIC(3,1);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS methodology_version TEXT DEFAULT 'v2.0';

-- 2. Update existing score_requests table or create if not exists
DROP TABLE IF EXISTS score_requests CASCADE;

CREATE TABLE score_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES profiles(id),

  -- Status tracking
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  current_step TEXT,

  -- Results
  overall_score NUMERIC(3,1),
  privacy_score NUMERIC(3,1),
  transparency_score NUMERIC(3,1),
  labor_score NUMERIC(3,1),
  environment_score NUMERIC(3,1),
  community_score NUMERIC(3,1),

  -- Detailed analysis (JSONB for flexibility)
  score_breakdown JSONB, -- Full AI response with reasoning, evidence, confidence
  data_sources JSONB, -- What data was used (reviews, news, public info)
  calculation_metadata JSONB, -- Tokens used, model version, processing time

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Performance metrics
  processing_duration_ms INTEGER,
  tokens_used INTEGER,
  cost_usd NUMERIC(10,4)
);

CREATE INDEX idx_score_requests_company ON score_requests(company_id);
CREATE INDEX idx_score_requests_status ON score_requests(status);
CREATE INDEX idx_score_requests_created ON score_requests(created_at DESC);

-- 3. Create data_sources table (track what data is used for scoring)
CREATE TABLE IF NOT EXISTS company_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('review', 'news', 'regulatory', 'public_statement', 'social_media', 'research_paper')),
  source_url TEXT,
  content TEXT,
  relevance_score NUMERIC(3,2), -- 0-1 score of how relevant this source is
  sentiment_score NUMERIC(3,2), -- -1 to 1 sentiment
  credibility_score NUMERIC(3,2), -- 0-1 credibility rating
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  used_in_calculation BOOLEAN DEFAULT false,
  metadata JSONB
);

CREATE INDEX idx_data_sources_company ON company_data_sources(company_id);
CREATE INDEX idx_data_sources_type ON company_data_sources(source_type);

-- 4. Create score_evidence table (specific evidence for each dimension)
CREATE TABLE IF NOT EXISTS score_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_request_id UUID NOT NULL REFERENCES score_requests(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN ('privacy', 'transparency', 'labor', 'environment', 'community', 'overall')),
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('positive', 'negative', 'neutral')),
  evidence_text TEXT NOT NULL,
  source_reference TEXT,
  weight NUMERIC(3,2), -- How much this evidence impacts the score (0-1)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_request ON score_evidence(score_request_id);
CREATE INDEX idx_evidence_dimension ON score_evidence(dimension);

-- 5. Create calculation_logs table (audit trail)
CREATE TABLE IF NOT EXISTS calculation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_request_id UUID NOT NULL REFERENCES score_requests(id) ON DELETE CASCADE,
  log_level TEXT CHECK (log_level IN ('info', 'warning', 'error')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_request ON calculation_logs(score_request_id);
CREATE INDEX idx_logs_created ON calculation_logs(created_at DESC);

-- 6. Enable RLS on all tables
ALTER TABLE score_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view completed score requests" ON score_requests;
DROP POLICY IF EXISTS "Users can create score requests" ON score_requests;
DROP POLICY IF EXISTS "Anyone can view data sources" ON company_data_sources;
DROP POLICY IF EXISTS "Anyone can view evidence" ON score_evidence;
DROP POLICY IF EXISTS "Admins can view logs" ON calculation_logs;

-- RLS Policies
CREATE POLICY "Anyone can view completed score requests"
  ON score_requests FOR SELECT
  USING (status = 'completed' OR requested_by = auth.uid());

CREATE POLICY "Users can create score requests"
  ON score_requests FOR INSERT
  WITH CHECK (requested_by = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "System can update score requests"
  ON score_requests FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can view data sources"
  ON company_data_sources FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view evidence"
  ON score_evidence FOR SELECT
  USING (true);

CREATE POLICY "System can insert evidence"
  ON score_evidence FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can insert logs"
  ON calculation_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view logs"
  ON calculation_logs FOR SELECT
  USING (true);

-- 7. Create function to update company scores from score_requests
CREATE OR REPLACE FUNCTION update_company_from_score_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE companies
    SET
      overall_score = NEW.overall_score,
      privacy_score = NEW.privacy_score,
      transparency_score = NEW.transparency_score,
      labor_score = NEW.labor_score,
      environment_score = NEW.environment_score,
      community_score = NEW.community_score,
      last_scored_at = NEW.completed_at,
      score_confidence = COALESCE((NEW.score_breakdown->>'dataQuality')::JSONB->>'confidenceLevel', 'medium'),
      updated_at = NOW()
    WHERE id = NEW.company_id;

    -- Record in score history if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'score_history') THEN
      INSERT INTO score_history (
        company_id,
        overall_score,
        privacy_score,
        transparency_score,
        labor_score,
        environment_score,
        community_score,
        reason,
        recorded_at
      ) VALUES (
        NEW.company_id,
        NEW.overall_score,
        NEW.privacy_score,
        NEW.transparency_score,
        NEW.labor_score,
        NEW.environment_score,
        NEW.community_score,
        'AI recalculation v2.0',
        NEW.completed_at
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_company_scores ON score_requests;

CREATE TRIGGER trigger_update_company_scores
AFTER UPDATE ON score_requests
FOR EACH ROW
EXECUTE FUNCTION update_company_from_score_request();

-- ================================================
-- DONE: Database schema is production-ready
-- Run this script in Supabase SQL Editor
-- ================================================
