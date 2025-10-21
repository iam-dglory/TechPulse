-- ============================================
-- AI ANALYSES DATABASE SCHEMA
-- ============================================
-- Schema for storing AI-powered company analyses and insights

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AI ANALYSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('transparency', 'ethics', 'risk', 'promise', 'news', 'comprehensive')),
  analysis_data JSONB NOT NULL,
  score DECIMAL(4,2),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ai_analyses
CREATE INDEX IF NOT EXISTS idx_ai_analyses_company_id ON public.ai_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON public.ai_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_company_type ON public.ai_analyses(company_id, analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_expires ON public.ai_analyses(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created ON public.ai_analyses(created_at DESC);

-- Composite index for fetching latest valid analysis
CREATE INDEX IF NOT EXISTS idx_ai_analyses_lookup ON public.ai_analyses(company_id, analysis_type, expires_at DESC, created_at DESC);

-- ============================================
-- AI INSIGHTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('strength', 'concern', 'red_flag', 'opportunity', 'risk', 'positive')),
  title TEXT NOT NULL CHECK (LENGTH(title) >= 5 AND LENGTH(title) <= 200),
  description TEXT NOT NULL CHECK (LENGTH(description) >= 10 AND LENGTH(description) <= 1000),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ai_insights
CREATE INDEX IF NOT EXISTS idx_ai_insights_company_id ON public.ai_insights(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_severity ON public.ai_insights(severity);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created ON public.ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_company_type ON public.ai_insights(company_id, insight_type);

-- ============================================
-- AI CALL LOGS TABLE (for monitoring)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_type TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  success BOOLEAN NOT NULL,
  cost DECIMAL(10,6),
  duration_ms INTEGER,
  error TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ai_call_logs
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_type ON public.ai_call_logs(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_company ON public.ai_call_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_created ON public.ai_call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_success ON public.ai_call_logs(success);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_call_logs ENABLE ROW LEVEL SECURITY;

-- AI Analyses Policies
CREATE POLICY "AI analyses are viewable by everyone"
  ON public.ai_analyses FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can create AI analyses"
  ON public.ai_analyses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update AI analyses"
  ON public.ai_analyses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- AI Insights Policies
CREATE POLICY "AI insights are viewable by everyone"
  ON public.ai_insights FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can create AI insights"
  ON public.ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update AI insights"
  ON public.ai_insights FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete AI insights"
  ON public.ai_insights FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- AI Call Logs Policies (admin only)
CREATE POLICY "Only admins can view AI call logs"
  ON public.ai_call_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert AI call logs"
  ON public.ai_call_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for ai_analyses updated_at
CREATE TRIGGER update_ai_analyses_updated_at
  BEFORE UPDATE ON public.ai_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ai_insights updated_at
CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON public.ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Get Latest AI Analysis
CREATE OR REPLACE FUNCTION get_latest_ai_analysis(
  company_id_input UUID,
  analysis_type_input TEXT
)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  analysis_type TEXT,
  analysis_data JSONB,
  score DECIMAL,
  confidence DECIMAL,
  analyzed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.company_id,
    a.analysis_type,
    a.analysis_data,
    a.score,
    a.confidence,
    a.analyzed_at,
    a.expires_at,
    a.created_at
  FROM public.ai_analyses a
  WHERE a.company_id = company_id_input
    AND a.analysis_type = analysis_type_input
    AND a.expires_at > NOW()
  ORDER BY a.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Generate AI Insights Summary
CREATE OR REPLACE FUNCTION generate_ai_insights_summary(
  company_id_input UUID
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'strengths', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', title,
          'description', description,
          'severity', severity
        )
      )
      FROM public.ai_insights
      WHERE company_id = company_id_input
        AND insight_type = 'strength'
      ORDER BY created_at DESC
      LIMIT 5
    ),
    'concerns', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', title,
          'description', description,
          'severity', severity
        )
      )
      FROM public.ai_insights
      WHERE company_id = company_id_input
        AND insight_type = 'concern'
      ORDER BY created_at DESC
      LIMIT 5
    ),
    'red_flags', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', title,
          'description', description,
          'severity', severity
        )
      )
      FROM public.ai_insights
      WHERE company_id = company_id_input
        AND insight_type = 'red_flag'
      ORDER BY created_at DESC
      LIMIT 5
    ),
    'opportunities', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', title,
          'description', description,
          'severity', severity
        )
      )
      FROM public.ai_insights
      WHERE company_id = company_id_input
        AND insight_type = 'opportunity'
      ORDER BY created_at DESC
      LIMIT 5
    ),
    'risks', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', title,
          'description', description,
          'severity', severity
        )
      )
      FROM public.ai_insights
      WHERE company_id = company_id_input
        AND insight_type = 'risk'
      ORDER BY created_at DESC
      LIMIT 5
    ),
    'total_insights', (
      SELECT COUNT(*)::INTEGER
      FROM public.ai_insights
      WHERE company_id = company_id_input
    ),
    'high_severity_count', (
      SELECT COUNT(*)::INTEGER
      FROM public.ai_insights
      WHERE company_id = company_id_input
        AND severity IN ('high', 'critical')
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Cleanup Expired Analyses
CREATE OR REPLACE FUNCTION cleanup_expired_ai_analyses()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ai_analyses
  WHERE expires_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get AI Analysis Stats (for admin)
CREATE OR REPLACE FUNCTION get_ai_analysis_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_analyses', (SELECT COUNT(*) FROM public.ai_analyses),
    'analyses_by_type', (
      SELECT jsonb_object_agg(analysis_type, count)
      FROM (
        SELECT analysis_type, COUNT(*)::INTEGER as count
        FROM public.ai_analyses
        GROUP BY analysis_type
      ) subq
    ),
    'total_insights', (SELECT COUNT(*) FROM public.ai_insights),
    'insights_by_type', (
      SELECT jsonb_object_agg(insight_type, count)
      FROM (
        SELECT insight_type, COUNT(*)::INTEGER as count
        FROM public.ai_insights
        GROUP BY insight_type
      ) subq
    ),
    'total_api_calls', (SELECT COUNT(*) FROM public.ai_call_logs),
    'success_rate', (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE success = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        2
      )
      FROM public.ai_call_logs
    ),
    'total_cost', (
      SELECT COALESCE(SUM(cost), 0)
      FROM public.ai_call_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
    ),
    'avg_duration_ms', (
      SELECT COALESCE(AVG(duration_ms)::INTEGER, 0)
      FROM public.ai_call_logs
      WHERE success = true
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.ai_analyses IS 'Stores AI-powered company analyses (transparency, ethics, risk, etc.)';
COMMENT ON TABLE public.ai_insights IS 'Stores individual AI-generated insights about companies';
COMMENT ON TABLE public.ai_call_logs IS 'Logs all AI API calls for monitoring and cost tracking';

COMMENT ON FUNCTION get_latest_ai_analysis IS 'Retrieves the most recent non-expired AI analysis for a company and type';
COMMENT ON FUNCTION generate_ai_insights_summary IS 'Generates a summary of all AI insights for a company, grouped by type';
COMMENT ON FUNCTION cleanup_expired_ai_analyses IS 'Removes expired AI analyses older than 7 days';
COMMENT ON FUNCTION get_ai_analysis_stats IS 'Returns statistics about AI analyses for admin dashboard';

-- ============================================
-- INITIAL DATA CLEANUP
-- ============================================

-- Clean up any existing expired analyses
SELECT cleanup_expired_ai_analyses();
