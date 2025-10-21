-- ============================================
-- NEWS API DATABASE SCHEMA
-- ============================================
-- This SQL creates the necessary tables for the News API

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT NOT NULL CHECK (industry IN (
    'technology',
    'finance',
    'healthcare',
    'retail',
    'manufacturing',
    'energy',
    'transportation',
    'telecommunications',
    'education',
    'entertainment',
    'hospitality',
    'real-estate',
    'agriculture',
    'consulting',
    'other'
  )),
  website TEXT,
  description TEXT NOT NULL,
  founded_year INTEGER NOT NULL CHECK (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  headquarters TEXT NOT NULL,
  employee_count INTEGER CHECK (employee_count > 0),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_founded_year ON public.companies(founded_year);

-- ============================================
-- NEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (LENGTH(title) >= 10 AND LENGTH(title) <= 200),
  content TEXT NOT NULL CHECK (LENGTH(content) >= 100 AND LENGTH(content) <= 10000),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  ethics_impact INTEGER CHECK (ethics_impact >= 1 AND ethics_impact <= 10),
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for news
CREATE INDEX IF NOT EXISTS idx_news_company_id ON public.news(company_id);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_ethics_impact ON public.news(ethics_impact DESC);
CREATE INDEX IF NOT EXISTS idx_news_title_search ON public.news USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_news_content_search ON public.news USING gin(to_tsvector('english', content));

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on both tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies are viewable by everyone"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update companies"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete companies"
  ON public.companies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- News policies
CREATE POLICY "News articles are viewable by everyone"
  ON public.news FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert news"
  ON public.news FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update news"
  ON public.news FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete news"
  ON public.news FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for companies
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for news
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample companies
INSERT INTO public.companies (name, slug, industry, website, description, founded_year, headquarters, employee_count, logo_url)
VALUES
  (
    'TechCorp Inc.',
    'techcorp-inc',
    'technology',
    'https://techcorp.example.com',
    'Leading technology company specializing in artificial intelligence and cloud computing solutions for enterprise clients worldwide.',
    2010,
    'San Francisco, CA',
    500,
    null
  ),
  (
    'GreenEnergy Solutions',
    'greenenergy-solutions',
    'energy',
    'https://greenenergy.example.com',
    'Renewable energy company focused on solar and wind power generation with sustainable practices and environmental commitment.',
    2015,
    'Austin, TX',
    250,
    null
  ),
  (
    'HealthTech Innovations',
    'healthtech-innovations',
    'healthcare',
    'https://healthtech.example.com',
    'Healthcare technology provider developing innovative medical devices and digital health solutions for improved patient care.',
    2018,
    'Boston, MA',
    150,
    null
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert sample news articles
INSERT INTO public.news (title, content, company_id, ethics_impact, source_url, published_at)
VALUES
  (
    'TechCorp Launches Revolutionary AI Platform for Healthcare',
    'TechCorp Inc. has announced the launch of their groundbreaking AI platform designed specifically for healthcare providers. The platform uses advanced machine learning algorithms to assist doctors in diagnostic procedures, potentially reducing diagnosis time by up to 40%. The company has emphasized their commitment to patient privacy and data security, implementing end-to-end encryption and compliance with all healthcare regulations. Early adopters have reported positive results, with several major hospitals already signing partnership agreements. The platform is expected to be available nationwide by the end of the year.',
    (SELECT id FROM public.companies WHERE slug = 'techcorp-inc' LIMIT 1),
    8,
    'https://example.com/techcorp-ai-launch',
    '2025-01-15'
  ),
  (
    'GreenEnergy Solutions Achieves 100% Carbon Neutral Operations',
    'In a major milestone for corporate sustainability, GreenEnergy Solutions has announced they have achieved 100% carbon neutral operations across all their facilities. This achievement comes two years ahead of their original 2027 target. The company has invested heavily in renewable energy infrastructure, including solar panels on all office buildings and wind turbines at manufacturing sites. They have also implemented a comprehensive recycling program and switched their entire vehicle fleet to electric. CEO Jane Smith stated that this is just the beginning of their sustainability journey.',
    (SELECT id FROM public.companies WHERE slug = 'greenenergy-solutions' LIMIT 1),
    9,
    'https://example.com/greenenergy-carbon-neutral',
    '2025-01-10'
  ),
  (
    'HealthTech Innovations Faces Privacy Concerns Over Data Collection',
    'HealthTech Innovations is under scrutiny following reports that their popular fitness tracking app has been collecting more user data than disclosed in their privacy policy. Privacy advocates have raised concerns about the extent of data collection, including location tracking and biometric information. The company has issued a statement claiming all data collection is within legal boundaries and is necessary for providing personalized health insights. However, they have committed to conducting a comprehensive privacy audit and updating their policies to be more transparent. Several user advocacy groups are calling for stricter regulations.',
    (SELECT id FROM public.companies WHERE slug = 'healthtech-innovations' LIMIT 1),
    3,
    'https://example.com/healthtech-privacy-concerns',
    '2025-01-05'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count companies
SELECT COUNT(*) as company_count FROM public.companies;

-- Count news articles
SELECT COUNT(*) as news_count FROM public.news;

-- Sample query: News with company data
SELECT
  n.id,
  n.title,
  n.ethics_impact,
  n.published_at,
  c.name as company_name,
  c.industry
FROM public.news n
LEFT JOIN public.companies c ON n.company_id = c.id
ORDER BY n.published_at DESC
LIMIT 10;
