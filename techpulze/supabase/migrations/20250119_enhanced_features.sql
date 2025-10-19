-- Migration: Enhanced Features for TechPulze 2.0
-- Adds: Badge system, growth tracking, notifications, bookmarks, follows

-- 1. Add new columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS headquarters TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verification_tier TEXT DEFAULT 'none' CHECK (verification_tier IN ('none', 'certified', 'trusted', 'exemplary', 'pioneer'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS growth_rate DECIMAL(5,2); -- Percentage growth
ALTER TABLE companies ADD COLUMN IF NOT EXISTS impact_score DECIMAL(3,1) DEFAULT 0.0 CHECK (impact_score >= 0 AND impact_score <= 10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS innovation_score DECIMAL(3,1) DEFAULT 0.0 CHECK (innovation_score >= 0 AND innovation_score <= 10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- 2. Create company_badges table
CREATE TABLE IF NOT EXISTS company_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('certified', 'trusted', 'exemplary', 'pioneer')),
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    criteria_met JSONB DEFAULT '{}', -- Stores which criteria were met
    auto_awarded BOOLEAN DEFAULT TRUE,
    reviewed_by UUID REFERENCES user_profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, badge_type)
);

-- 3. Create company_metrics_history table for growth tracking
CREATE TABLE IF NOT EXISTS company_metrics_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    ethics_score DECIMAL(3,1),
    impact_score DECIMAL(3,1),
    innovation_score DECIMAL(3,1),
    review_count INTEGER,
    average_rating DECIMAL(2,1),
    follower_count INTEGER,
    news_mentions INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2), -- Calculated engagement metric
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, metric_date)
);

-- 4. Create company_follows table
CREATE TABLE IF NOT EXISTS company_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    notify_on_news BOOLEAN DEFAULT TRUE,
    notify_on_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- 5. Create user_bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('company', 'news', 'discussion')),
    item_id UUID NOT NULL,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- 6. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('follow', 'news', 'review', 'badge', 'discussion', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}', -- Additional context data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create user_activity table for analytics
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('view_company', 'view_news', 'post_review', 'post_discussion', 'follow', 'bookmark', 'search')),
    item_type TEXT,
    item_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Add columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS expertise_areas TEXT[] DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_expert BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 9. Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_company_badges_company_id ON company_badges(company_id);
CREATE INDEX IF NOT EXISTS idx_company_badges_badge_type ON company_badges(badge_type);

CREATE INDEX IF NOT EXISTS idx_company_metrics_company_id ON company_metrics_history(company_id);
CREATE INDEX IF NOT EXISTS idx_company_metrics_date ON company_metrics_history(metric_date);

CREATE INDEX IF NOT EXISTS idx_company_follows_user_id ON company_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_company_follows_company_id ON company_follows(company_id);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_item_type ON user_bookmarks(item_type);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

CREATE INDEX IF NOT EXISTS idx_companies_verification_tier ON companies(verification_tier);
CREATE INDEX IF NOT EXISTS idx_companies_follower_count ON companies(follower_count);

-- 10. Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Enable RLS on new tables
ALTER TABLE company_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for new tables

-- Company badges: public read
CREATE POLICY "Allow public read access to company_badges" ON company_badges
    FOR SELECT USING (true);

-- Company metrics: public read
CREATE POLICY "Allow public read access to company_metrics_history" ON company_metrics_history
    FOR SELECT USING (true);

-- Company follows: users can read their own, insert/delete their own
CREATE POLICY "Allow users to read their own follows" ON company_follows
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own follows" ON company_follows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own follows" ON company_follows
    FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: users can read/insert/delete their own
CREATE POLICY "Allow users to read their own bookmarks" ON user_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own bookmarks" ON user_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own bookmarks" ON user_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own bookmarks" ON user_bookmarks
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications: users can read/update their own
CREATE POLICY "Allow users to read their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- User activity: users can insert their own, system can read all
CREATE POLICY "Allow users to insert their own activity" ON user_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to read their own activity" ON user_activity
    FOR SELECT USING (auth.uid() = user_id);

-- 13. Create function to auto-calculate badge tiers
CREATE OR REPLACE FUNCTION calculate_badge_tier(
    p_company_id UUID
) RETURNS TEXT AS $$
DECLARE
    v_ethics_score DECIMAL(3,1);
    v_review_count INTEGER;
    v_average_rating DECIMAL(2,1);
    v_verified BOOLEAN;
    v_age_months INTEGER;
BEGIN
    SELECT
        ethics_score,
        review_count,
        average_rating,
        verified,
        EXTRACT(MONTH FROM AGE(NOW(), created_at))
    INTO
        v_ethics_score,
        v_review_count,
        v_average_rating,
        v_verified,
        v_age_months
    FROM companies
    WHERE id = p_company_id;

    -- Pioneer: Ethics 9+, 100+ reviews, 4.5+ rating, 24+ months
    IF v_ethics_score >= 9.0 AND v_review_count >= 100 AND v_average_rating >= 4.5 AND v_age_months >= 24 THEN
        RETURN 'pioneer';

    -- Exemplary: Ethics 8+, 50+ reviews, 4+ rating, 12+ months
    ELSIF v_ethics_score >= 8.0 AND v_review_count >= 50 AND v_average_rating >= 4.0 AND v_age_months >= 12 THEN
        RETURN 'exemplary';

    -- Trusted: Ethics 7+, 20+ reviews, 3.5+ rating, 6+ months
    ELSIF v_ethics_score >= 7.0 AND v_review_count >= 20 AND v_average_rating >= 3.5 AND v_age_months >= 6 THEN
        RETURN 'trusted';

    -- Certified: Verified account with basic criteria
    ELSIF v_verified AND v_ethics_score >= 5.0 AND v_review_count >= 5 THEN
        RETURN 'certified';

    ELSE
        RETURN 'none';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 14. Create function to update company metrics history (run daily)
CREATE OR REPLACE FUNCTION record_company_metrics() RETURNS void AS $$
BEGIN
    INSERT INTO company_metrics_history (
        company_id,
        metric_date,
        ethics_score,
        impact_score,
        innovation_score,
        review_count,
        average_rating,
        follower_count,
        news_mentions
    )
    SELECT
        c.id,
        CURRENT_DATE,
        c.ethics_score,
        c.impact_score,
        c.innovation_score,
        c.review_count,
        c.average_rating,
        c.follower_count,
        (SELECT COUNT(*) FROM news_updates WHERE company_id = c.id AND created_at >= CURRENT_DATE - INTERVAL '1 day')
    FROM companies c
    ON CONFLICT (company_id, metric_date)
    DO UPDATE SET
        ethics_score = EXCLUDED.ethics_score,
        impact_score = EXCLUDED.impact_score,
        innovation_score = EXCLUDED.innovation_score,
        review_count = EXCLUDED.review_count,
        average_rating = EXCLUDED.average_rating,
        follower_count = EXCLUDED.follower_count,
        news_mentions = EXCLUDED.news_mentions;
END;
$$ LANGUAGE plpgsql;

-- 15. Create function to send notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL,
    p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_link, p_data)
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- 16. Create trigger to update follower count when follows change
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE companies
        SET follower_count = follower_count + 1
        WHERE id = NEW.company_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE companies
        SET follower_count = follower_count - 1
        WHERE id = OLD.company_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_follower_count_insert
    AFTER INSERT ON company_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_count();

CREATE TRIGGER update_company_follower_count_delete
    AFTER DELETE ON company_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_count();

-- 17. Create trigger to update review statistics
CREATE OR REPLACE FUNCTION update_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE companies c
        SET
            review_count = (SELECT COUNT(*) FROM reviews WHERE company_id = c.id AND moderation_status = 'approved'),
            average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE company_id = c.id AND moderation_status = 'approved')
        WHERE c.id = NEW.company_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE companies c
        SET
            review_count = (SELECT COUNT(*) FROM reviews WHERE company_id = c.id AND moderation_status = 'approved'),
            average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE company_id = c.id AND moderation_status = 'approved')
        WHERE c.id = OLD.company_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_review_stats();

-- 18. Update existing companies with default values
UPDATE companies
SET
    verification_tier = 'none',
    growth_rate = 0.0,
    impact_score = ethics_score, -- Initialize impact_score from ethics_score
    innovation_score = 7.0,
    review_count = 0,
    average_rating = 0.0,
    follower_count = 0
WHERE verification_tier IS NULL;
