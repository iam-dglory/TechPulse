-- Create score_requests table for tracking AI scoring requests
CREATE TABLE IF NOT EXISTS score_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  scores JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_score_requests_company ON score_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_score_requests_status ON score_requests(status);
CREATE INDEX IF NOT EXISTS idx_score_requests_requested_by ON score_requests(requested_by);

-- Add last_scored_at to companies table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies'
    AND column_name = 'last_scored_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN last_scored_at TIMESTAMPTZ;
  END IF;
END $$;

-- Enable RLS on score_requests table
ALTER TABLE score_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own score requests
CREATE POLICY "Users can view their own score requests"
  ON score_requests
  FOR SELECT
  USING (auth.uid() = requested_by);

-- Policy: Users can view all completed score requests
CREATE POLICY "Users can view completed score requests"
  ON score_requests
  FOR SELECT
  USING (status = 'completed');

-- Policy: Authenticated users can create score requests
CREATE POLICY "Authenticated users can create score requests"
  ON score_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

-- Policy: Service role can update score requests
CREATE POLICY "Service role can update score requests"
  ON score_requests
  FOR UPDATE
  USING (true);

COMMENT ON TABLE score_requests IS 'Tracks AI ethics scoring requests with rate limiting';
COMMENT ON COLUMN score_requests.status IS 'processing, completed, or failed';
COMMENT ON COLUMN score_requests.scores IS 'JSON object containing all calculated scores';
