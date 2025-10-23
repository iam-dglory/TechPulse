-- =====================================================
-- TECHPULZE COMPLETE DATABASE SCHEMA
-- Tech Company Ethics Rating Platform
-- PostgreSQL + Supabase
-- =====================================================

-- Drop existing tables if they exist (for clean installation)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS discussion_votes CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS score_history CASCADE;
DROP TABLE IF EXISTS discussion_replies CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS news_articles CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_type_enum CASCADE;
DROP TYPE IF EXISTS verification_tier_enum CASCADE;
DROP TYPE IF EXISTS reviewer_type_enum CASCADE;
DROP TYPE IF EXISTS review_status_enum CASCADE;
DROP TYPE IF EXISTS ethics_impact_enum CASCADE;
DROP TYPE IF EXISTS bias_level_enum CASCADE;
DROP TYPE IF EXISTS discussion_category_enum CASCADE;
DROP TYPE IF EXISTS discussion_status_enum CASCADE;
DROP TYPE IF EXISTS vote_type_enum CASCADE;

-- =====================================================
-- 1. CREATE ENUM TYPES
-- =====================================================

CREATE TYPE user_type_enum AS ENUM ('consumer', 'investor', 'employee', 'researcher');
CREATE TYPE verification_tier_enum AS ENUM ('certified', 'trusted', 'exemplary', 'pioneer');
CREATE TYPE reviewer_type_enum AS ENUM ('employee', 'customer', 'investor', 'researcher');
CREATE TYPE review_status_enum AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE ethics_impact_enum AS ENUM ('very_positive', 'positive', 'neutral', 'negative', 'very_negative');
CREATE TYPE bias_level_enum AS ENUM ('low', 'medium', 'high');
CREATE TYPE discussion_category_enum AS ENUM ('general', 'privacy', 'ai_ml', 'sustainability', 'labor', 'governance', 'investment', 'spotlight');
CREATE TYPE discussion_status_enum AS ENUM ('active', 'closed', 'archived');
CREATE TYPE vote_type_enum AS ENUM ('upvote', 'downvote');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- 2.1 PROFILES (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_type user_type_enum DEFAULT 'consumer',
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  bio TEXT,
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 COMPANIES
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  industry TEXT,
  founded_year INTEGER CHECK (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  employee_count INTEGER CHECK (employee_count >= 0),
  headquarters TEXT,
  website TEXT,
  funding_stage TEXT,
  funding_amount NUMERIC(15,2) CHECK (funding_amount >= 0),
  verification_tier verification_tier_enum,
  overall_score NUMERIC(3,1) DEFAULT 0.0 CHECK (overall_score >= 0 AND overall_score <= 5.0),
  privacy_score NUMERIC(3,1) DEFAULT 0.0 CHECK (privacy_score >= 0 AND privacy_score <= 5.0),
  transparency_score NUMERIC(3,1) DEFAULT 0.0 CHECK (transparency_score >= 0 AND transparency_score <= 5.0),
  labor_score NUMERIC(3,1) DEFAULT 0.0 CHECK (labor_score >= 0 AND labor_score <= 5.0),
  environment_score NUMERIC(3,1) DEFAULT 0.0 CHECK (environment_score >= 0 AND environment_score <= 5.0),
  community_score NUMERIC(3,1) DEFAULT 0.0 CHECK (community_score >= 0 AND community_score <= 5.0),
  growth_rate NUMERIC(5,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  follower_count INTEGER DEFAULT 0 CHECK (follower_count >= 0),
  trending_score NUMERIC(5,2) DEFAULT 0.0 CHECK (trending_score >= 0),
  claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  products JSONB DEFAULT '[]'::jsonb,
  target_users TEXT[],
  official_statement TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tsv TSVECTOR
);

-- 2.3 REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  privacy_rating INTEGER CHECK (privacy_rating >= 1 AND privacy_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  labor_rating INTEGER CHECK (labor_rating >= 1 AND labor_rating <= 5),
  environment_rating INTEGER CHECK (environment_rating >= 1 AND environment_rating <= 5),
  community_rating INTEGER CHECK (community_rating >= 1 AND community_rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reviewer_type reviewer_type_enum NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_proof_url TEXT,
  helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
  report_count INTEGER DEFAULT 0 CHECK (report_count >= 0),
  status review_status_enum DEFAULT 'pending',
  company_response TEXT,
  company_response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- 2.4 NEWS ARTICLES
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  source_url TEXT,
  source_name TEXT,
  author TEXT,
  company_ids UUID[],
  ethics_impact ethics_impact_enum DEFAULT 'neutral',
  ethics_impact_score NUMERIC(3,1) DEFAULT 0.0 CHECK (ethics_impact_score >= -5.0 AND ethics_impact_score <= 5.0),
  hype_score NUMERIC(3,1) DEFAULT 0.0 CHECK (hype_score >= 0 AND hype_score <= 10.0),
  credibility_score NUMERIC(3,1) DEFAULT 5.0 CHECK (credibility_score >= 0 AND credibility_score <= 10.0),
  bias_level bias_level_enum DEFAULT 'medium',
  fact_checked BOOLEAN DEFAULT FALSE,
  discussion_count INTEGER DEFAULT 0 CHECK (discussion_count >= 0),
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tsv TSVECTOR
);

-- 2.5 DISCUSSIONS
CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category discussion_category_enum DEFAULT 'general',
  company_ids UUID[],
  upvote_count INTEGER DEFAULT 0 CHECK (upvote_count >= 0),
  reply_count INTEGER DEFAULT 0 CHECK (reply_count >= 0),
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_expert_verified BOOLEAN DEFAULT FALSE,
  status discussion_status_enum DEFAULT 'active',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 DISCUSSION REPLIES
CREATE TABLE discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvote_count INTEGER DEFAULT 0 CHECK (upvote_count >= 0),
  is_expert_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 SCORE HISTORY
CREATE TABLE score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  overall_score NUMERIC(3,1),
  privacy_score NUMERIC(3,1),
  transparency_score NUMERIC(3,1),
  labor_score NUMERIC(3,1),
  environment_score NUMERIC(3,1),
  community_score NUMERIC(3,1),
  reason TEXT,
  triggered_by TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.8 USER FOLLOWS
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- 2.9 REVIEW VOTES
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- 2.10 DISCUSSION VOTES
CREATE TABLE discussion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type vote_type_enum NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((discussion_id IS NOT NULL AND reply_id IS NULL) OR (discussion_id IS NULL AND reply_id IS NOT NULL))
);

-- 2.11 ACHIEVEMENTS
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.12 ANALYTICS EVENTS
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.13 NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_level ON profiles(level DESC);
CREATE INDEX idx_profiles_points ON profiles(points DESC);

-- Companies indexes
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_overall_score ON companies(overall_score DESC);
CREATE INDEX idx_companies_trending_score ON companies(trending_score DESC);
CREATE INDEX idx_companies_review_count ON companies(review_count DESC);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX idx_companies_verification_tier ON companies(verification_tier);
CREATE INDEX idx_companies_is_verified ON companies(is_verified);
CREATE INDEX idx_companies_tsv ON companies USING GIN(tsv);

-- Reviews indexes
CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_overall_rating ON reviews(overall_rating);
CREATE INDEX idx_reviews_helpful_count ON reviews(helpful_count DESC);

-- News articles indexes
CREATE INDEX idx_news_articles_slug ON news_articles(slug);
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_ethics_impact ON news_articles(ethics_impact);
CREATE INDEX idx_news_articles_company_ids ON news_articles USING GIN(company_ids);
CREATE INDEX idx_news_articles_tsv ON news_articles USING GIN(tsv);

-- Discussions indexes
CREATE INDEX idx_discussions_slug ON discussions(slug);
CREATE INDEX idx_discussions_user_id ON discussions(user_id);
CREATE INDEX idx_discussions_category ON discussions(category);
CREATE INDEX idx_discussions_status ON discussions(status);
CREATE INDEX idx_discussions_created_at ON discussions(created_at DESC);
CREATE INDEX idx_discussions_upvote_count ON discussions(upvote_count DESC);
CREATE INDEX idx_discussions_company_ids ON discussions USING GIN(company_ids);
CREATE INDEX idx_discussions_tags ON discussions USING GIN(tags);

-- Discussion replies indexes
CREATE INDEX idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX idx_discussion_replies_user_id ON discussion_replies(user_id);
CREATE INDEX idx_discussion_replies_parent_reply_id ON discussion_replies(parent_reply_id);
CREATE INDEX idx_discussion_replies_created_at ON discussion_replies(created_at DESC);

-- Score history indexes
CREATE INDEX idx_score_history_company_id ON score_history(company_id);
CREATE INDEX idx_score_history_recorded_at ON score_history(recorded_at DESC);

-- User follows indexes
CREATE INDEX idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX idx_user_follows_company_id ON user_follows(company_id);

-- Review votes indexes
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON review_votes(user_id);

-- Discussion votes indexes
CREATE INDEX idx_discussion_votes_discussion_id ON discussion_votes(discussion_id);
CREATE INDEX idx_discussion_votes_reply_id ON discussion_votes(reply_id);
CREATE INDEX idx_discussion_votes_user_id ON discussion_votes(user_id);

-- Achievements indexes
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_badge_type ON achievements(badge_type);

-- Analytics events indexes
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_company_id ON analytics_events(company_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- 4.1 Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Function to update company scores from reviews
CREATE OR REPLACE FUNCTION update_company_scores()
RETURNS TRIGGER AS $$
DECLARE
  company_record RECORD;
BEGIN
  -- Calculate new scores from approved reviews
  SELECT
    COALESCE(AVG(overall_rating), 0)::NUMERIC(3,1) AS avg_overall,
    COALESCE(AVG(privacy_rating), 0)::NUMERIC(3,1) AS avg_privacy,
    COALESCE(AVG(transparency_rating), 0)::NUMERIC(3,1) AS avg_transparency,
    COALESCE(AVG(labor_rating), 0)::NUMERIC(3,1) AS avg_labor,
    COALESCE(AVG(environment_rating), 0)::NUMERIC(3,1) AS avg_environment,
    COALESCE(AVG(community_rating), 0)::NUMERIC(3,1) AS avg_community,
    COUNT(*) AS total_reviews
  INTO company_record
  FROM reviews
  WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
    AND status = 'approved';

  -- Update company scores
  UPDATE companies
  SET
    overall_score = company_record.avg_overall,
    privacy_score = company_record.avg_privacy,
    transparency_score = company_record.avg_transparency,
    labor_score = company_record.avg_labor,
    environment_score = company_record.avg_environment,
    community_score = company_record.avg_community,
    review_count = company_record.total_reviews,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);

  -- Record score history
  INSERT INTO score_history (
    company_id,
    overall_score,
    privacy_score,
    transparency_score,
    labor_score,
    environment_score,
    community_score,
    reason,
    triggered_by
  ) VALUES (
    COALESCE(NEW.company_id, OLD.company_id),
    company_record.avg_overall,
    company_record.avg_privacy,
    company_record.avg_transparency,
    company_record.avg_labor,
    company_record.avg_environment,
    company_record.avg_community,
    'Review ' || TG_OP,
    'reviews_trigger'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4.3 Function to calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(
  view_count_param INTEGER,
  review_count_param INTEGER,
  follower_count_param INTEGER,
  growth_rate_param NUMERIC,
  created_at_param TIMESTAMP WITH TIME ZONE
)
RETURNS NUMERIC AS $$
DECLARE
  recency_score NUMERIC;
  engagement_score NUMERIC;
  trending_score NUMERIC;
  days_since_creation NUMERIC;
BEGIN
  -- Calculate days since creation
  days_since_creation := EXTRACT(EPOCH FROM (NOW() - created_at_param)) / 86400;

  -- Recency score (decays over time)
  recency_score := 100 / (1 + days_since_creation / 30);

  -- Engagement score (views, reviews, followers, growth)
  engagement_score := (
    (view_count_param * 0.1) +
    (review_count_param * 2) +
    (follower_count_param * 0.5) +
    (COALESCE(growth_rate_param, 0) * 10)
  );

  -- Combined trending score
  trending_score := (recency_score * 0.3) + (engagement_score * 0.7);

  RETURN LEAST(trending_score, 100);
END;
$$ LANGUAGE plpgsql;

-- 4.4 Function to update trending scores
CREATE OR REPLACE FUNCTION update_trending_scores()
RETURNS void AS $$
BEGIN
  UPDATE companies
  SET trending_score = calculate_trending_score(
    view_count,
    review_count,
    follower_count,
    growth_rate,
    created_at
  );
END;
$$ LANGUAGE plpgsql;

-- 4.5 Function to update follower count
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE companies
    SET follower_count = follower_count + 1
    WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE companies
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE id = OLD.company_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4.6 Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_helpful THEN
    UPDATE reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' AND OLD.is_helpful THEN
    UPDATE reviews
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.review_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_helpful AND NOT OLD.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    ELSIF NOT NEW.is_helpful AND OLD.is_helpful THEN
      UPDATE reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = NEW.review_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4.7 Function to update discussion vote counts
CREATE OR REPLACE FUNCTION update_discussion_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.discussion_id IS NOT NULL AND NEW.vote_type = 'upvote' THEN
      UPDATE discussions SET upvote_count = upvote_count + 1 WHERE id = NEW.discussion_id;
    ELSIF NEW.reply_id IS NOT NULL AND NEW.vote_type = 'upvote' THEN
      UPDATE discussion_replies SET upvote_count = upvote_count + 1 WHERE id = NEW.reply_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.discussion_id IS NOT NULL AND OLD.vote_type = 'upvote' THEN
      UPDATE discussions SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.discussion_id;
    ELSIF OLD.reply_id IS NOT NULL AND OLD.vote_type = 'upvote' THEN
      UPDATE discussion_replies SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.reply_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4.8 Function to update discussion reply count
CREATE OR REPLACE FUNCTION update_discussion_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE discussions
    SET reply_count = reply_count + 1
    WHERE id = NEW.discussion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE discussions
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.discussion_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4.9 Function to update full-text search vectors for companies
CREATE OR REPLACE FUNCTION update_companies_tsv()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tsv :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.10 Function to update full-text search vectors for news
CREATE OR REPLACE FUNCTION update_news_tsv()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tsv :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.11 Function to award user points for activities
CREATE OR REPLACE FUNCTION award_user_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER := 0;
BEGIN
  -- Determine points based on action
  IF TG_TABLE_NAME = 'reviews' AND TG_OP = 'INSERT' THEN
    points_to_award := 10;
  ELSIF TG_TABLE_NAME = 'discussions' AND TG_OP = 'INSERT' THEN
    points_to_award := 5;
  ELSIF TG_TABLE_NAME = 'discussion_replies' AND TG_OP = 'INSERT' THEN
    points_to_award := 3;
  END IF;

  -- Award points to user
  UPDATE profiles
  SET points = points + points_to_award
  WHERE id = NEW.user_id;

  -- Level up logic (every 100 points = 1 level)
  UPDATE profiles
  SET level = (points / 100) + 1
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Triggers for updated_at timestamps
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_discussion_replies_updated_at
  BEFORE UPDATE ON discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updating company scores when reviews change
CREATE TRIGGER trigger_update_company_scores_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_company_scores();

-- Trigger for updating follower count
CREATE TRIGGER trigger_update_follower_count
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_follower_count();

-- Trigger for updating review helpful count
CREATE TRIGGER trigger_update_review_helpful_count
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Trigger for updating discussion vote counts
CREATE TRIGGER trigger_update_discussion_vote_count
  AFTER INSERT OR DELETE ON discussion_votes
  FOR EACH ROW EXECUTE FUNCTION update_discussion_vote_count();

-- Trigger for updating discussion reply count
CREATE TRIGGER trigger_update_discussion_reply_count
  AFTER INSERT OR DELETE ON discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_discussion_reply_count();

-- Trigger for full-text search on companies
CREATE TRIGGER trigger_update_companies_tsv
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_companies_tsv();

-- Trigger for full-text search on news articles
CREATE TRIGGER trigger_update_news_tsv
  BEFORE INSERT OR UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION update_news_tsv();

-- Triggers for awarding user points
CREATE TRIGGER trigger_award_points_for_review
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION award_user_points();

CREATE TRIGGER trigger_award_points_for_discussion
  AFTER INSERT ON discussions
  FOR EACH ROW EXECUTE FUNCTION award_user_points();

CREATE TRIGGER trigger_award_points_for_reply
  AFTER INSERT ON discussion_replies
  FOR EACH ROW EXECUTE FUNCTION award_user_points();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- COMPANIES POLICIES
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Company claimers can update their companies"
  ON companies FOR UPDATE
  USING (auth.uid() = claimed_by);

-- REVIEWS POLICIES
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- NEWS ARTICLES POLICIES
CREATE POLICY "News articles are viewable by everyone"
  ON news_articles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert news articles"
  ON news_articles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL); -- Add admin check here

-- DISCUSSIONS POLICIES
CREATE POLICY "Discussions are viewable by everyone"
  ON discussions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussions"
  ON discussions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions"
  ON discussions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
  ON discussions FOR DELETE
  USING (auth.uid() = user_id);

-- DISCUSSION REPLIES POLICIES
CREATE POLICY "Discussion replies are viewable by everyone"
  ON discussion_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON discussion_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies"
  ON discussion_replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
  ON discussion_replies FOR DELETE
  USING (auth.uid() = user_id);

-- SCORE HISTORY POLICIES
CREATE POLICY "Score history is viewable by everyone"
  ON score_history FOR SELECT
  USING (true);

-- USER FOLLOWS POLICIES
CREATE POLICY "Follows are viewable by everyone"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow companies"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow companies"
  ON user_follows FOR DELETE
  USING (auth.uid() = user_id);

-- REVIEW VOTES POLICIES
CREATE POLICY "Review votes are viewable by everyone"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote on reviews"
  ON review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their review votes"
  ON review_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their review votes"
  ON review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- DISCUSSION VOTES POLICIES
CREATE POLICY "Discussion votes are viewable by everyone"
  ON discussion_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote on discussions"
  ON discussion_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their discussion votes"
  ON discussion_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ACHIEVEMENTS POLICIES
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- ANALYTICS EVENTS POLICIES
CREATE POLICY "Users can view their own analytics"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. MATERIALIZED VIEWS FOR LEADERBOARDS
-- =====================================================

-- Top Companies Leaderboard
CREATE MATERIALIZED VIEW top_companies_leaderboard AS
SELECT
  c.id,
  c.name,
  c.slug,
  c.logo_url,
  c.industry,
  c.overall_score,
  c.review_count,
  c.follower_count,
  c.trending_score,
  c.verification_tier
FROM companies c
WHERE c.review_count >= 5
ORDER BY c.overall_score DESC, c.review_count DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_top_companies_leaderboard_id ON top_companies_leaderboard(id);

-- Top Users Leaderboard
CREATE MATERIALIZED VIEW top_users_leaderboard AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.level,
  p.points,
  p.user_type,
  COUNT(DISTINCT r.id) AS review_count,
  COUNT(DISTINCT d.id) AS discussion_count
FROM profiles p
LEFT JOIN reviews r ON p.id = r.user_id AND r.status = 'approved'
LEFT JOIN discussions d ON p.id = d.user_id
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.level, p.points, p.user_type
ORDER BY p.points DESC, p.level DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_top_users_leaderboard_id ON top_users_leaderboard(id);

-- Trending Discussions
CREATE MATERIALIZED VIEW trending_discussions AS
SELECT
  d.id,
  d.title,
  d.slug,
  d.category,
  d.upvote_count,
  d.reply_count,
  d.view_count,
  d.created_at,
  p.username AS author_username,
  p.avatar_url AS author_avatar
FROM discussions d
JOIN profiles p ON d.user_id = p.id
WHERE d.status = 'active'
  AND d.created_at > NOW() - INTERVAL '30 days'
ORDER BY (d.upvote_count * 2 + d.reply_count + d.view_count * 0.1) DESC
LIMIT 50;

CREATE UNIQUE INDEX idx_trending_discussions_id ON trending_discussions(id);

-- =====================================================
-- 8. FUNCTIONS TO REFRESH MATERIALIZED VIEWS
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY top_companies_leaderboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY top_users_leaderboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY trending_discussions;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. INSERT SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Sample companies (uncomment to add)
/*
INSERT INTO companies (name, slug, description, industry, founded_year, employee_count, headquarters, website, is_verified, verification_tier)
VALUES
  ('OpenAI', 'openai', 'AI research and deployment company', 'Artificial Intelligence', 2015, 500, 'San Francisco, CA', 'https://openai.com', true, 'pioneer'),
  ('Meta', 'meta', 'Social technology company', 'Social Media', 2004, 86000, 'Menlo Park, CA', 'https://meta.com', true, 'trusted'),
  ('Google', 'google', 'Technology company specializing in Internet services', 'Technology', 1998, 190000, 'Mountain View, CA', 'https://google.com', true, 'exemplary'),
  ('Apple', 'apple', 'Technology company that designs and manufactures consumer electronics', 'Consumer Electronics', 1976, 164000, 'Cupertino, CA', 'https://apple.com', true, 'exemplary'),
  ('Microsoft', 'microsoft', 'Technology corporation producing computer software and consumer electronics', 'Technology', 1975, 221000, 'Redmond, WA', 'https://microsoft.com', true, 'exemplary');
*/

-- =====================================================
-- 10. HELPFUL UTILITY FUNCTIONS
-- =====================================================

-- Function to get company with full details
CREATE OR REPLACE FUNCTION get_company_details(company_slug_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  logo_url TEXT,
  description TEXT,
  industry TEXT,
  overall_score NUMERIC,
  review_count INTEGER,
  follower_count INTEGER,
  is_following BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.logo_url,
    c.description,
    c.industry,
    c.overall_score,
    c.review_count,
    c.follower_count,
    EXISTS(
      SELECT 1 FROM user_follows uf
      WHERE uf.company_id = c.id AND uf.user_id = auth.uid()
    ) AS is_following
  FROM companies c
  WHERE c.slug = company_slug_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================
--
-- To use this schema:
-- 1. Copy all the SQL above
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run" to execute
-- 4. Optionally refresh materialized views with: SELECT refresh_leaderboards();
-- 5. Optionally update trending scores with: SELECT update_trending_scores();
--
-- Recommended scheduled jobs (via pg_cron or external):
-- - Run refresh_leaderboards() every hour
-- - Run update_trending_scores() every 6 hours
-- =====================================================
