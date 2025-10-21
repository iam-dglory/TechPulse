-- ============================================
-- PROMISES API DATABASE SCHEMA
-- ============================================
-- This SQL creates the promise_votes table for promise outcome voting

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROMISE VOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.promise_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promise_id UUID NOT NULL REFERENCES public.promises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('kept', 'broken', 'partial')),
  comment TEXT CHECK (comment IS NULL OR LENGTH(comment) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure one vote per user per promise
  UNIQUE(user_id, promise_id)
);

-- Create indexes for promise_votes
CREATE INDEX IF NOT EXISTS idx_promise_votes_promise_id ON public.promise_votes(promise_id);
CREATE INDEX IF NOT EXISTS idx_promise_votes_user_id ON public.promise_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_promise_votes_verdict ON public.promise_votes(verdict);
CREATE INDEX IF NOT EXISTS idx_promise_votes_created ON public.promise_votes(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE public.promise_votes ENABLE ROW LEVEL SECURITY;

-- Promise Votes Policies
CREATE POLICY "Promise votes are viewable by everyone"
  ON public.promise_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create promise votes"
  ON public.promise_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own promise votes"
  ON public.promise_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own promise votes"
  ON public.promise_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for promise_votes updated_at
CREATE TRIGGER update_promise_votes_updated_at
  BEFORE UPDATE ON public.promise_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count promise votes
SELECT COUNT(*) as promise_votes_count FROM public.promise_votes;

-- Sample query: Promises with vote counts
SELECT
  p.id,
  p.promise_text,
  p.status,
  COUNT(pv.id) as total_votes,
  COUNT(CASE WHEN pv.verdict = 'kept' THEN 1 END) as kept_votes,
  COUNT(CASE WHEN pv.verdict = 'broken' THEN 1 END) as broken_votes,
  COUNT(CASE WHEN pv.verdict = 'partial' THEN 1 END) as partial_votes
FROM public.promises p
LEFT JOIN public.promise_votes pv ON p.id = pv.promise_id
GROUP BY p.id, p.promise_text, p.status
ORDER BY total_votes DESC
LIMIT 10;

-- Sample query: User's votes on promises
SELECT
  pv.*,
  p.promise_text,
  p.category,
  p.status
FROM public.promise_votes pv
JOIN public.promises p ON pv.promise_id = p.id
WHERE pv.user_id = 'USER_UUID_HERE'
ORDER BY pv.created_at DESC;
