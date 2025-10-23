-- TexhPulze Company Verification & Credibility System
-- Run this in Supabase SQL Editor after the main migration

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS company_verification_docs CASCADE;
DROP TABLE IF EXISTS company_score_history CASCADE;
DROP TABLE IF EXISTS review_reports CASCADE;
DROP TABLE IF EXISTS review_helpful_votes CASCADE;
DROP TABLE IF EXISTS company_followers CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Companies Table (with comprehensive verification)
CREATE TABLE companies (
  id BIGSERIAL PRIMARY KEY,

  -- Basic Information
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  website VARCHAR(500),
  description TEXT,
  logo_url TEXT,

  -- Company Details
  industry VARCHAR(100),
  founded_year INTEGER,
  company_size VARCHAR(50) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  headquarters_address TEXT,
  headquarters_country VARCHAR(100),
  headquarters_city VARCHAR(100),

  -- Verification Status
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected', 'suspended')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),

  -- Verification Documents
  business_registration_doc TEXT, -- URL to uploaded document
  tax_id_doc TEXT,
  address_proof_doc TEXT,
  other_docs JSONB DEFAULT '[]'::jsonb,

  -- Company Credentials
  business_registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  registration_country VARCHAR(100),

  -- Credibility Scoring (0-100)
  credibility_score DECIMAL(5,2) DEFAULT 0.00 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  transparency_score DECIMAL(5,2) DEFAULT 0.00,
  ethics_score DECIMAL(5,2) DEFAULT 0.00,
  safety_score DECIMAL(5,2) DEFAULT 0.00,
  innovation_score DECIMAL(5,2) DEFAULT 0.00,

  -- Review Statistics
  total_reviews INTEGER DEFAULT 0,
  positive_reviews INTEGER DEFAULT 0,
  negative_reviews INTEGER DEFAULT 0,
  neutral_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),

  -- Social & Engagement
  followers_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,

  -- Admin/Moderation
  admin_notes TEXT,
  rejection_reason TEXT,
  featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Owner/Representative
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  representative_name VARCHAR(255),
  representative_email VARCHAR(255),
  representative_phone VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table (enhanced with verification)
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT NOT NULL,

  -- Review Category
  category VARCHAR(50) CHECK (category IN ('transparency', 'ethics', 'safety', 'innovation', 'general')),

  -- Moderation
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,

  -- Verification
  verified_purchase BOOLEAN DEFAULT FALSE,
  verification_proof TEXT, -- URL to proof document

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,

  -- Edit tracking
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint: One review per user per company
  UNIQUE(user_id, company_id)
);

-- Review Helpful Votes
CREATE TABLE review_helpful_votes (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Review Reports
CREATE TABLE review_reports (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason VARCHAR(100) NOT NULL CHECK (reason IN ('spam', 'offensive', 'fake', 'irrelevant', 'other')),
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Followers
CREATE TABLE company_followers (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Company Score History (for trending)
CREATE TABLE company_score_history (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  credibility_score DECIMAL(5,2),
  transparency_score DECIMAL(5,2),
  ethics_score DECIMAL(5,2),
  safety_score DECIMAL(5,2),
  innovation_score DECIMAL(5,2),
  total_reviews INTEGER,
  average_rating DECIMAL(3,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Verification Documents Metadata
CREATE TABLE company_verification_docs (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('business_registration', 'tax_id', 'address_proof', 'other')),
  document_url TEXT NOT NULL,
  document_name VARCHAR(255),
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  verified_by UUID REFERENCES auth.users(id),
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- User Badges/Achievements
CREATE TABLE user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('top_reviewer', 'verified_user', 'helpful_contributor', 'early_adopter', 'moderator')),
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_companies_verification_status ON companies(verification_status);
CREATE INDEX IF NOT EXISTS idx_companies_credibility_score ON companies(credibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_user_id ON company_followers(user_id);

CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);

CREATE INDEX IF NOT EXISTS idx_company_score_history_company_id ON company_score_history(company_id);
CREATE INDEX IF NOT EXISTS idx_company_score_history_recorded_at ON company_score_history(recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_verification_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Companies
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Company owners can update their companies"
  ON companies FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- RLS Policies for Reviews
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Company Followers
CREATE POLICY "Followers are viewable by everyone"
  ON company_followers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow companies"
  ON company_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow companies"
  ON company_followers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Review Helpful Votes
CREATE POLICY "Helpful votes are viewable by everyone"
  ON review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote helpful"
  ON review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful votes"
  ON review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Review Reports
CREATE POLICY "Users can view their own reports"
  ON review_reports FOR SELECT
  USING (auth.uid() = reported_by);

CREATE POLICY "Authenticated users can report reviews"
  ON review_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- RLS Policies for Company Score History
CREATE POLICY "Score history is viewable by everyone"
  ON company_score_history FOR SELECT
  USING (true);

-- RLS Policies for Verification Documents
CREATE POLICY "Company owners can view their verification docs"
  ON company_verification_docs FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_user_id = auth.uid()));

CREATE POLICY "Company owners can upload verification docs"
  ON company_verification_docs FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_user_id = auth.uid()));

-- RLS Policies for User Badges
CREATE POLICY "Badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

-- Functions and Triggers

-- Function to update company updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at();

-- Function to calculate company credibility score
CREATE OR REPLACE FUNCTION calculate_company_credibility_score(company_id_param BIGINT)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
  review_count INTEGER;
  verified_docs_count INTEGER;
  base_score DECIMAL;
  final_score DECIMAL;
BEGIN
  -- Get review statistics
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE company_id = company_id_param AND status = 'approved';

  -- Count verified documents
  SELECT COUNT(*)
  INTO verified_docs_count
  FROM company_verification_docs
  WHERE company_id = company_id_param AND verification_status = 'approved';

  -- Calculate base score
  base_score := 0;

  -- Rating contribution (0-40 points)
  base_score := base_score + (avg_rating * 8);

  -- Review count contribution (0-20 points)
  base_score := base_score + LEAST(review_count * 2, 20);

  -- Verified documents contribution (0-30 points)
  base_score := base_score + (verified_docs_count * 10);

  -- Verification status bonus (0-10 points)
  IF (SELECT verification_status FROM companies WHERE id = company_id_param) = 'verified' THEN
    base_score := base_score + 10;
  END IF;

  -- Cap at 100
  final_score := LEAST(base_score, 100);

  RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update company scores after review
CREATE OR REPLACE FUNCTION update_company_scores_after_review()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update review counts
    UPDATE companies
    SET
      total_reviews = (SELECT COUNT(*) FROM reviews WHERE company_id = NEW.company_id AND status = 'approved'),
      positive_reviews = (SELECT COUNT(*) FROM reviews WHERE company_id = NEW.company_id AND status = 'approved' AND rating >= 4),
      negative_reviews = (SELECT COUNT(*) FROM reviews WHERE company_id = NEW.company_id AND status = 'approved' AND rating <= 2),
      neutral_reviews = (SELECT COUNT(*) FROM reviews WHERE company_id = NEW.company_id AND status = 'approved' AND rating = 3),
      average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE company_id = NEW.company_id AND status = 'approved'),
      credibility_score = calculate_company_credibility_score(NEW.company_id)
    WHERE id = NEW.company_id;

    -- Record score history
    INSERT INTO company_score_history (
      company_id,
      credibility_score,
      total_reviews,
      average_rating
    )
    SELECT
      id,
      credibility_score,
      total_reviews,
      average_rating
    FROM companies
    WHERE id = NEW.company_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Update after deletion
    UPDATE companies
    SET
      total_reviews = (SELECT COUNT(*) FROM reviews WHERE company_id = OLD.company_id AND status = 'approved'),
      positive_reviews = (SELECT COUNT(*) FROM reviews WHERE company_id = OLD.company_id AND status = 'approved' AND rating >= 4),
      negative_reviews = (SELECT COUNT(*) FROM reviews WHERE company_id = OLD.company_id AND status = 'approved' AND rating <= 2),
      neutral_reviews = (SELECT COUNT(*) FROM reviews WHERE company_id = OLD.company_id AND status = 'approved' AND rating = 3),
      average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE company_id = OLD.company_id AND status = 'approved'),
      credibility_score = calculate_company_credibility_score(OLD.company_id)
    WHERE id = OLD.company_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_scores_after_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_company_scores_after_review();

-- Insert Sample Verified Companies
INSERT INTO companies (
  name, slug, email, website, description, industry, founded_year, company_size,
  headquarters_country, headquarters_city, verification_status, verified_at,
  credibility_score, transparency_score, ethics_score, safety_score, innovation_score
) VALUES
(
  'OpenAI',
  'openai',
  'contact@openai.com',
  'https://openai.com',
  'Leading AI research and deployment company focused on ensuring artificial general intelligence benefits humanity',
  'AI Research',
  2015,
  '501-1000',
  'United States',
  'San Francisco',
  'verified',
  NOW(),
  85.00,
  80.00,
  85.00,
  90.00,
  95.00
),
(
  'Google DeepMind',
  'google-deepmind',
  'contact@deepmind.com',
  'https://deepmind.google',
  'AI research laboratory and subsidiary of Alphabet Inc. solving intelligence to advance science and benefit humanity',
  'AI Research',
  2010,
  '1000+',
  'United Kingdom',
  'London',
  'verified',
  NOW(),
  82.00,
  85.00,
  80.00,
  88.00,
  90.00
),
(
  'Meta AI',
  'meta-ai',
  'ai@meta.com',
  'https://ai.meta.com',
  'Artificial intelligence research division of Meta Platforms focused on fundamental AI research',
  'AI Research',
  2013,
  '1000+',
  'United States',
  'Menlo Park',
  'verified',
  NOW(),
  75.00,
  70.00,
  72.00,
  75.00,
  85.00
)
ON CONFLICT (slug) DO NOTHING;

-- Grant necessary permissions (if needed)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
