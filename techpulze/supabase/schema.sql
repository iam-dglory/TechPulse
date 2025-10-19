-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    industry TEXT NOT NULL,
    funding_stage TEXT NOT NULL,
    investors TEXT[] DEFAULT '{}',
    products JSONB DEFAULT '[]',
    target_users TEXT NOT NULL,
    ethical_policy JSONB DEFAULT '{}',
    ethics_score DECIMAL(3,1) DEFAULT 0.0 CHECK (ethics_score >= 0 AND ethics_score <= 10),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_updates table
CREATE TABLE news_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    sector TEXT NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    ethical_impact_tags TEXT[] DEFAULT '{}',
    ethics_score DECIMAL(3,1) DEFAULT 0.0 CHECK (ethics_score >= 0 AND ethics_score <= 10),
    hype_score DECIMAL(3,1) DEFAULT 0.0 CHECK (hype_score >= 0 AND hype_score <= 10),
    source_url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discussions table
CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_update_id UUID NOT NULL REFERENCES news_updates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_recommendations table
CREATE TABLE user_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    news_update_id UUID NOT NULL REFERENCES news_updates(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    relevance_score DECIMAL(3,1) DEFAULT 0.0 CHECK (relevance_score >= 0 AND relevance_score <= 10),
    shown BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_ethics_score ON companies(ethics_score);
CREATE INDEX idx_companies_verified ON companies(verified);

CREATE INDEX idx_news_updates_sector ON news_updates(sector);
CREATE INDEX idx_news_updates_company_id ON news_updates(company_id);
CREATE INDEX idx_news_updates_ethics_score ON news_updates(ethics_score);
CREATE INDEX idx_news_updates_hype_score ON news_updates(hype_score);
CREATE INDEX idx_news_updates_published_at ON news_updates(published_at);

CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_moderation_status ON reviews(moderation_status);

CREATE INDEX idx_discussions_news_update_id ON discussions(news_update_id);
CREATE INDEX idx_discussions_user_id ON discussions(user_id);

CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_news_update_id ON user_recommendations(news_update_id);
CREATE INDEX idx_user_recommendations_shown ON user_recommendations(shown);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for companies table
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to companies" ON companies
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to news_updates" ON news_updates
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to user_profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to reviews" ON reviews
    FOR SELECT USING (moderation_status = 'approved');

CREATE POLICY "Allow public read access to discussions" ON discussions
    FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to insert reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow authenticated users to insert discussions" ON discussions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow users to update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id);

-- Insert sample data
INSERT INTO companies (name, industry, funding_stage, target_users, ethical_policy, ethics_score, verified) VALUES
('OpenAI', 'AI', 'Series C', 'Developers and businesses', '{"privacy": "Strong data protection policies", "ai_transparency": "Open about AI limitations", "carbon_footprint": "Committed to carbon neutrality", "data_handling": "Minimal data collection"}', 8.5, true),
('Tesla', 'EV', 'Public', 'Consumers and businesses', '{"privacy": "Standard privacy practices", "ai_transparency": "Limited transparency on FSD", "carbon_footprint": "Promotes sustainable transport", "data_handling": "Collects vehicle data"}', 7.2, true),
('Palantir', 'AI', 'Public', 'Government and enterprise', '{"privacy": "Controversial data practices", "ai_transparency": "Limited transparency", "carbon_footprint": "Standard practices", "data_handling": "Extensive data collection"}', 4.1, true);

INSERT INTO user_profiles (email, role, interests) VALUES
('john@example.com', 'developer', '{"AI", "IoT"}'),
('jane@example.com', 'customer_service', '{"HealthTech", "EV"}'),
('bob@example.com', 'marketer', '{"AI", "EV", "IoT"}');

INSERT INTO news_updates (headline, summary, sector, company_id, ethical_impact_tags, ethics_score, hype_score, source_url, published_at) VALUES
('OpenAI releases GPT-5 with enhanced safety features', 'OpenAI announces GPT-5 with improved safety measures and transparency features, addressing previous concerns about AI alignment.', 'AI', (SELECT id FROM companies WHERE name = 'OpenAI'), '{"Privacy", "AI Risk"}', 8.0, 9.5, 'https://example.com/openai-gpt5', NOW() - INTERVAL '1 day'),
('Tesla reports record EV deliveries', 'Tesla achieves record quarterly deliveries while maintaining focus on sustainable manufacturing practices.', 'EV', (SELECT id FROM companies WHERE name = 'Tesla'), '{"Environment"}', 7.5, 8.0, 'https://example.com/tesla-deliveries', NOW() - INTERVAL '2 days');


















