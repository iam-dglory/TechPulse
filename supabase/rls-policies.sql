-- TechPulze Supabase RLS Policies
-- This file contains all Row Level Security policies for the TechPulze application

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- COMPANIES POLICIES
-- Public read, owner update
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Company owners can update their companies"
  ON companies FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- REVIEWS POLICIES
-- Public read for approved, auth insert
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- COMPANY CLAIMS POLICIES
-- Auth insert, admin update
CREATE POLICY "Users can view their own claims"
  ON company_claims FOR SELECT
  USING (auth.uid() = user_id OR 
        auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE POLICY "Authenticated users can submit claims"
  ON company_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update claims"
  ON company_claims FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- SCORE HISTORY POLICIES
-- Read-only public
CREATE POLICY "Score history is viewable by everyone"
  ON score_history FOR SELECT
  USING (true);

-- PROFILES POLICIES
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- NEWS ARTICLES POLICIES
CREATE POLICY "News articles are viewable by everyone"
  ON news_articles FOR SELECT
  USING (true);

-- ANALYTICS EVENTS POLICIES
CREATE POLICY "Analytics events are insertable by authenticated users"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Analytics events are viewable by admins"
  ON analytics_events FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));