-- ============================================
-- USER DASHBOARD DATABASE SCHEMA
-- ============================================
-- This SQL creates tables for user dashboard functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- UPDATE PROFILES TABLE
-- ============================================

-- Add username and reputation columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_reputation ON public.profiles(reputation DESC);

-- ============================================
-- USER FOLLOWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure user can only follow a company once
  UNIQUE(user_id, company_id)
);

-- Create indexes for user_follows
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON public.user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_company_id ON public.user_follows(company_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created ON public.user_follows(created_at DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vote', 'promise', 'company_update', 'system')),
  title TEXT NOT NULL CHECK (LENGTH(title) >= 5 AND LENGTH(title) <= 200),
  message TEXT NOT NULL CHECK (LENGTH(message) >= 10 AND LENGTH(message) <= 500),
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = FALSE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User Follows Policies
CREATE POLICY "Users can view own follows"
  ON public.user_follows FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view company follower count"
  ON public.user_follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create follows"
  ON public.user_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own follows"
  ON public.user_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate reputation from user activity
CREATE OR REPLACE FUNCTION calculate_user_reputation(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_reputation INTEGER := 0;
  v_vote_count INTEGER;
  v_comment_count INTEGER;
  v_promise_vote_count INTEGER;
BEGIN
  -- Count votes (1 point each)
  SELECT COUNT(*) INTO v_vote_count
  FROM public.votes
  WHERE user_id = p_user_id;

  v_reputation := v_reputation + v_vote_count;

  -- Count votes with comments (2 additional points each)
  SELECT COUNT(*) INTO v_comment_count
  FROM public.votes
  WHERE user_id = p_user_id AND comment IS NOT NULL;

  v_reputation := v_reputation + (v_comment_count * 2);

  -- Count promise votes (3 points each)
  SELECT COUNT(*) INTO v_promise_vote_count
  FROM public.promise_votes
  WHERE user_id = p_user_id;

  v_reputation := v_reputation + (v_promise_vote_count * 3);

  RETURN v_reputation;
END;
$$ LANGUAGE plpgsql;

-- Function to update user reputation
CREATE OR REPLACE FUNCTION update_user_reputation(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET reputation = calculate_user_reputation(p_user_id)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update reputation on vote
CREATE OR REPLACE FUNCTION trigger_update_reputation_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_user_reputation(OLD.user_id);
  ELSE
    PERFORM update_user_reputation(NEW.user_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reputation_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_reputation_on_vote();

-- Trigger to update reputation on promise vote
CREATE OR REPLACE FUNCTION trigger_update_reputation_on_promise_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_user_reputation(OLD.user_id);
  ELSE
    PERFORM update_user_reputation(NEW.user_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reputation_on_promise_vote
  AFTER INSERT OR UPDATE OR DELETE ON public.promise_votes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_reputation_on_promise_vote();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Sample notifications (replace USER_UUID with actual user ID)
-- INSERT INTO public.notifications (user_id, type, title, message, link)
-- VALUES
--   ('USER_UUID', 'vote', 'Your vote was recorded', 'Your vote on TechCorp Inc has been successfully recorded.', '/companies/techcorp-inc'),
--   ('USER_UUID', 'promise', 'Promise deadline approaching', 'Carbon neutrality promise deadline is in 30 days.', '/promises/PROMISE_ID'),
--   ('USER_UUID', 'company_update', 'Company you follow updated', 'TechCorp Inc has updated their sustainability promise.', '/companies/techcorp-inc'),
--   ('USER_UUID', 'system', 'Welcome to TexhPulze', 'Thank you for joining TexhPulze! Start by following companies and voting.', '/dashboard');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count user follows
SELECT COUNT(*) as follows_count FROM public.user_follows;

-- Count notifications
SELECT COUNT(*) as notifications_count FROM public.notifications;

-- Sample query: User dashboard statistics
SELECT
  p.id,
  p.username,
  p.full_name,
  p.reputation,
  COUNT(DISTINCT uf.company_id) as followed_companies,
  COUNT(DISTINCT v.id) as total_votes,
  COUNT(DISTINCT CASE WHEN v.comment IS NOT NULL THEN v.id END) as votes_with_comments
FROM public.profiles p
LEFT JOIN public.user_follows uf ON p.id = uf.user_id
LEFT JOIN public.votes v ON p.id = v.user_id
GROUP BY p.id, p.username, p.full_name, p.reputation
ORDER BY p.reputation DESC
LIMIT 10;

-- Sample query: Unread notifications for user
SELECT *
FROM public.notifications
WHERE user_id = 'USER_UUID_HERE'
  AND read = FALSE
ORDER BY created_at DESC
LIMIT 10;

-- Sample query: Companies followed by user
SELECT
  c.id,
  c.name,
  c.slug,
  c.industry,
  c.logo_url,
  cs.overall_score,
  cs.verification_tier,
  uf.created_at as followed_at
FROM public.user_follows uf
JOIN public.companies c ON uf.company_id = c.id
LEFT JOIN public.company_scores cs ON c.id = cs.company_id
WHERE uf.user_id = 'USER_UUID_HERE'
ORDER BY uf.created_at DESC
LIMIT 12;
