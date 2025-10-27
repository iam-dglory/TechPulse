-- TechPulze MVP Database Schema
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'company_owner');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE reviewer_type AS ENUM ('employee', 'customer', 'investor', 'researcher');
CREATE TYPE verification_tier AS ENUM ('none', 'basic', 'verified', 'certified');

-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  description TEXT,
  overall_score NUMERIC(3,1) DEFAULT 5.0,
  privacy_score NUMERIC(3,1) DEFAULT 5.0,
  transparency_score NUMERIC(3,1) DEFAULT 5.0,
  labor_score NUMERIC(3,1) DEFAULT 5.0,
  environment_score NUMERIC(3,1) DEFAULT 5.0,
  community_score NUMERIC(3,1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  privacy_rating INTEGER CHECK (privacy_rating BETWEEN 1 AND 5),
  transparency_rating INTEGER CHECK (transparency_rating BETWEEN 1 AND 5),
  labor_rating INTEGER CHECK (labor_rating BETWEEN 1 AND 5),
  environment_rating INTEGER CHECK (environment_rating BETWEEN 1 AND 5),
  community_rating INTEGER CHECK (community_rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reviewer_type reviewer_type NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  status review_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- User Follows Table
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Review Votes Table
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for Companies
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update companies"
  ON companies FOR UPDATE
  USING (auth.role() = 'authenticated');

-- RLS Policies for Reviews
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for User Follows
CREATE POLICY "User follows are viewable by everyone"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own follows"
  ON user_follows FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for Review Votes
CREATE POLICY "Review votes are viewable by everyone"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own votes"
  ON review_votes FOR ALL
  USING (auth.uid() = user_id);

-- Function to update company scores when review is approved
CREATE OR REPLACE FUNCTION update_company_scores()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE companies SET
      overall_score = (
        SELECT AVG(overall_rating) * 2
        FROM reviews
        WHERE company_id = NEW.company_id AND status = 'approved'
      ),
      privacy_score = (
        SELECT COALESCE(AVG(privacy_rating) * 2, 5.0)
        FROM reviews
        WHERE company_id = NEW.company_id
          AND status = 'approved'
          AND privacy_rating IS NOT NULL
      ),
      transparency_score = (
        SELECT COALESCE(AVG(transparency_rating) * 2, 5.0)
        FROM reviews
        WHERE company_id = NEW.company_id
          AND status = 'approved'
          AND transparency_rating IS NOT NULL
      ),
      labor_score = (
        SELECT COALESCE(AVG(labor_rating) * 2, 5.0)
        FROM reviews
        WHERE company_id = NEW.company_id
          AND status = 'approved'
          AND labor_rating IS NOT NULL
      ),
      environment_score = (
        SELECT COALESCE(AVG(environment_rating) * 2, 5.0)
        FROM reviews
        WHERE company_id = NEW.company_id
          AND status = 'approved'
          AND environment_rating IS NOT NULL
      ),
      community_score = (
        SELECT COALESCE(AVG(community_rating) * 2, 5.0)
        FROM reviews
        WHERE company_id = NEW.company_id
          AND status = 'approved'
          AND community_rating IS NOT NULL
      ),
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE company_id = NEW.company_id AND status = 'approved'
      )
    WHERE id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scores
  AFTER INSERT OR UPDATE OF status ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_company_scores();

-- RPC Function: Increment follower count
CREATE OR REPLACE FUNCTION increment_follower_count(company_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE companies
  SET follower_count = follower_count + 1
  WHERE id = company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Decrement follower count
CREATE OR REPLACE FUNCTION decrement_follower_count(company_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE companies
  SET follower_count = GREATEST(follower_count - 1, 0)
  WHERE id = company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Award points to user
CREATE OR REPLACE FUNCTION award_points(p_user_id UUID, p_points INTEGER)
RETURNS void AS $$
DECLARE
  new_points INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE profiles
  SET points = points + p_points
  WHERE id = p_user_id
  RETURNING points INTO new_points;

  -- Calculate new level (sqrt formula)
  new_level := FLOOR(SQRT(new_points / 50.0));

  UPDATE profiles
  SET level = new_level
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_overall_score ON companies(overall_score DESC);
CREATE INDEX idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX idx_user_follows_company_id ON user_follows(company_id);
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);

-- Seed Data (Optional)
INSERT INTO companies (name, slug, industry, description, website, overall_score, privacy_score, transparency_score, labor_score, environment_score, community_score, review_count)
VALUES
  ('OpenAI', 'openai', 'Artificial Intelligence', 'AI research and deployment company behind ChatGPT and GPT-4', 'https://openai.com', 9.2, 9.5, 9.0, 8.8, 8.5, 9.3, 0),
  ('Google', 'google', 'Technology', 'Search engine, cloud services, and AI leader', 'https://google.com', 7.8, 7.0, 7.5, 8.2, 8.0, 7.9, 0),
  ('Meta', 'meta', 'Social Media', 'Social networking platforms including Facebook and Instagram', 'https://meta.com', 6.5, 5.5, 6.0, 7.0, 6.5, 7.0, 0),
  ('Microsoft', 'microsoft', 'Technology', 'Software, cloud computing, and AI solutions', 'https://microsoft.com', 8.5, 8.0, 8.5, 8.7, 8.3, 8.6, 0),
  ('Amazon', 'amazon', 'E-commerce', 'E-commerce and cloud computing giant', 'https://amazon.com', 7.2, 6.8, 7.0, 6.5, 7.5, 7.8, 0);
