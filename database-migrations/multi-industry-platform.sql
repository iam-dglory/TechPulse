-- ================================================
-- MULTI-STAKEHOLDER PLATFORM - DATABASE SCHEMA
-- Serves Companies, Consumers, and Investors
-- ================================================

-- 1. Create comprehensive industry taxonomy
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES industries(id),
  icon TEXT,
  description TEXT,
  company_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert major industries
INSERT INTO industries (name, slug, icon, description) VALUES
  ('Technology', 'technology', 'Laptop', 'Software, hardware, and IT services'),
  ('Finance', 'finance', 'DollarSign', 'Banking, fintech, and financial services'),
  ('Healthcare', 'healthcare', 'Heart', 'Medical, pharma, and health services'),
  ('E-commerce', 'ecommerce', 'ShoppingCart', 'Online retail and marketplaces'),
  ('Manufacturing', 'manufacturing', 'Factory', 'Production and industrial'),
  ('Energy', 'energy', 'Zap', 'Oil, gas, renewable energy'),
  ('Transportation', 'transportation', 'Truck', 'Logistics and mobility'),
  ('Telecommunications', 'telecommunications', 'Radio', 'Telecom and networking'),
  ('Real Estate', 'real-estate', 'Home', 'Property and construction'),
  ('Food & Beverage', 'food-beverage', 'Coffee', 'Food production and restaurants'),
  ('Retail', 'retail', 'Store', 'Physical retail stores'),
  ('Media & Entertainment', 'media-entertainment', 'Tv', 'Publishing, streaming, gaming'),
  ('Education', 'education', 'GraduationCap', 'Educational services'),
  ('Hospitality', 'hospitality', 'Hotel', 'Hotels and tourism'),
  ('Agriculture', 'agriculture', 'Sprout', 'Farming and agribusiness'),
  ('Automotive', 'automotive', 'Car', 'Auto manufacturing and services'),
  ('Aerospace', 'aerospace', 'Plane', 'Aviation and space'),
  ('Pharmaceuticals', 'pharmaceuticals', 'Pill', 'Drug development'),
  ('Consulting', 'consulting', 'Briefcase', 'Business consulting'),
  ('Insurance', 'insurance', 'Shield', 'Insurance services')
ON CONFLICT (name) DO NOTHING;

-- 2. Add company metadata for better categorization
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES industries(id);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS market_cap NUMERIC(15,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS revenue NUMERIC(15,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS headquarters TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stock_ticker TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Create rankings table
CREATE TABLE IF NOT EXISTS company_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES industries(id),

  overall_rank INTEGER,
  industry_rank INTEGER,

  ethics_percentile INTEGER,
  size_percentile INTEGER,
  growth_percentile INTEGER,

  total_companies INTEGER,
  companies_in_industry INTEGER,

  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, calculated_at)
);

CREATE INDEX idx_rankings_company ON company_rankings(company_id);
CREATE INDEX idx_rankings_industry ON company_rankings(industry_id);
CREATE INDEX idx_rankings_overall ON company_rankings(overall_rank);

-- 4. Create improvement recommendations table
CREATE TABLE IF NOT EXISTS improvement_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  dimension TEXT NOT NULL CHECK (dimension IN ('privacy', 'transparency', 'labor', 'environment', 'community', 'overall')),
  current_score NUMERIC(3,1),
  target_score NUMERIC(3,1),
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_items JSONB,
  estimated_impact NUMERIC(3,1),
  estimated_timeframe TEXT,
  estimated_cost TEXT,

  resources JSONB,
  case_studies JSONB,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_recommendations_company ON improvement_recommendations(company_id);
CREATE INDEX idx_recommendations_priority ON improvement_recommendations(priority);

-- 5. Create consumer preferences table
CREATE TABLE IF NOT EXISTS consumer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  preferred_industries UUID[],
  min_ethics_score NUMERIC(3,1) DEFAULT 6.0,
  company_sizes TEXT[],

  priority_privacy BOOLEAN DEFAULT true,
  priority_transparency BOOLEAN DEFAULT true,
  priority_labor BOOLEAN DEFAULT true,
  priority_environment BOOLEAN DEFAULT true,
  priority_community BOOLEAN DEFAULT true,

  is_investor BOOLEAN DEFAULT false,
  min_market_cap NUMERIC(15,2),
  max_market_cap NUMERIC(15,2),
  preferred_stock_exchanges TEXT[],

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 6. Create comparison history table
CREATE TABLE IF NOT EXISTS comparison_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  company_ids UUID[] NOT NULL,
  comparison_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comparison_user ON comparison_history(user_id);

-- 7. Update companies trigger to update industry count
CREATE OR REPLACE FUNCTION update_industry_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.industry_id IS NOT NULL THEN
    UPDATE industries
    SET company_count = company_count + 1
    WHERE id = NEW.industry_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.industry_id IS DISTINCT FROM NEW.industry_id THEN
    IF OLD.industry_id IS NOT NULL THEN
      UPDATE industries
      SET company_count = company_count - 1
      WHERE id = OLD.industry_id;
    END IF;

    IF NEW.industry_id IS NOT NULL THEN
      UPDATE industries
      SET company_count = company_count + 1
      WHERE id = NEW.industry_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.industry_id IS NOT NULL THEN
    UPDATE industries
    SET company_count = company_count - 1
    WHERE id = OLD.industry_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_industry_count ON companies;

CREATE TRIGGER trigger_industry_count
AFTER INSERT OR UPDATE OR DELETE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_industry_count();

-- 8. Enable RLS
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Industries are public" ON industries;
DROP POLICY IF EXISTS "Rankings are public" ON company_rankings;
DROP POLICY IF EXISTS "Recommendations visible to company owners" ON improvement_recommendations;
DROP POLICY IF EXISTS "Users manage own preferences" ON consumer_preferences;
DROP POLICY IF EXISTS "Users view own comparisons" ON comparison_history;

-- RLS Policies
CREATE POLICY "Industries are public" ON industries FOR SELECT USING (true);

CREATE POLICY "Rankings are public" ON company_rankings FOR SELECT USING (true);

CREATE POLICY "System can manage rankings" ON company_rankings FOR ALL USING (true);

CREATE POLICY "Recommendations visible to company owners" ON improvement_recommendations
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE claimed_by = auth.uid()
    ) OR auth.uid() IS NOT NULL
  );

CREATE POLICY "System can manage recommendations" ON improvement_recommendations FOR ALL USING (true);

CREATE POLICY "Users manage own preferences" ON consumer_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own comparisons" ON comparison_history
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users create comparisons" ON comparison_history
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- ================================================
-- DONE: Multi-stakeholder platform schema ready
-- ================================================
