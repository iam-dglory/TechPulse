-- Migration: Advanced Scoring System for TechPulze
-- Adds community voting, expert reviews, promise tracking, and comprehensive scoring

-- ============================================================================
-- 1. CREATE NEW TABLES
-- ============================================================================

-- Votes table: Community voting on companies
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('ethics', 'credibility', 'delivery', 'security', 'innovation')),
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    weight DECIMAL(3,2) DEFAULT 1.0, -- User reputation-based weight
    comment TEXT,
    evidence_urls TEXT[] DEFAULT '{}',
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_id, vote_type)
);

-- Promises table: Track company promises and their fulfillment
CREATE TABLE IF NOT EXISTS promises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    promise_text TEXT NOT NULL,
    category TEXT CHECK (category IN ('product', 'ethics', 'sustainability', 'privacy', 'security', 'other')),
    promised_date DATE NOT NULL,
    deadline_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'kept', 'broken', 'delayed', 'cancelled')),
    community_verdict TEXT CHECK (community_verdict IN ('kept', 'broken', 'partial', 'unknown')),
    verdict_votes_count INTEGER DEFAULT 0,
    source_url TEXT,
    evidence_url TEXT,
    impact_score DECIMAL(2,1) DEFAULT 0.0 CHECK (impact_score >= 0 AND impact_score <= 5),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expert reviews table: Verified expert assessments
CREATE TABLE IF NOT EXISTS expert_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    ethics_score DECIMAL(3,1) CHECK (ethics_score >= 0 AND ethics_score <= 10),
    credibility_score DECIMAL(3,1) CHECK (credibility_score >= 0 AND credibility_score <= 10),
    delivery_score DECIMAL(3,1) CHECK (delivery_score >= 0 AND delivery_score <= 10),
    security_score DECIMAL(3,1) CHECK (security_score >= 0 AND security_score <= 10),
    innovation_score DECIMAL(3,1) CHECK (innovation_score >= 0 AND innovation_score <= 10),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES user_profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expertise_areas TEXT[] DEFAULT '{}',
    citations TEXT[] DEFAULT '{}',
    weight DECIMAL(3,2) DEFAULT 2.0, -- Expert reviews have higher weight
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company scores table: Calculated aggregate scores
CREATE TABLE IF NOT EXISTS company_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    overall_score DECIMAL(3,1) DEFAULT 0.0 CHECK (overall_score >= 0 AND overall_score <= 10),
    ethics_score DECIMAL(3,1) DEFAULT 0.0 CHECK (ethics_score >= 0 AND ethics_score <= 10),
    credibility_score DECIMAL(3,1) DEFAULT 0.0 CHECK (credibility_score >= 0 AND credibility_score <= 10),
    delivery_score DECIMAL(3,1) DEFAULT 0.0 CHECK (delivery_score >= 0 AND delivery_score <= 10),
    security_score DECIMAL(3,1) DEFAULT 0.0 CHECK (security_score >= 0 AND security_score <= 10),
    innovation_score DECIMAL(3,1) DEFAULT 0.0 CHECK (innovation_score >= 0 AND innovation_score <= 10),
    confidence_level TEXT DEFAULT 'low' CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
    total_votes INTEGER DEFAULT 0,
    expert_reviews_count INTEGER DEFAULT 0,
    promises_kept_ratio DECIMAL(4,3) DEFAULT 0.0, -- Ratio of kept promises
    calculation_metadata JSONB DEFAULT '{}',
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Score history table: Track score changes over time
CREATE TABLE IF NOT EXISTS score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    score_type TEXT NOT NULL CHECK (score_type IN ('overall', 'ethics', 'credibility', 'delivery', 'security', 'innovation')),
    score_value DECIMAL(3,1) NOT NULL,
    change_amount DECIMAL(3,1), -- Change from previous value
    confidence_level TEXT,
    total_votes INTEGER DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promise votes table: Community voting on promise fulfillment
CREATE TABLE IF NOT EXISTS promise_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promise_id UUID NOT NULL REFERENCES promises(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    verdict TEXT NOT NULL CHECK (verdict IN ('kept', 'broken', 'partial')),
    comment TEXT,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(promise_id, user_id)
);

-- ============================================================================
-- 2. UPDATE EXISTING COMPANIES TABLE
-- ============================================================================

-- Add new scoring columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS credibility_score DECIMAL(3,1) DEFAULT 0.0 CHECK (credibility_score >= 0 AND credibility_score <= 10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS delivery_score DECIMAL(3,1) DEFAULT 0.0 CHECK (delivery_score >= 0 AND delivery_score <= 10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS security_score DECIMAL(3,1) DEFAULT 0.0 CHECK (security_score >= 0 AND security_score <= 10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS overall_score DECIMAL(3,1) DEFAULT 0.0 CHECK (overall_score >= 0 AND overall_score <= 10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS total_community_votes INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS score_confidence TEXT DEFAULT 'low' CHECK (score_confidence IN ('low', 'medium', 'high', 'very_high'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS promises_kept_count INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS promises_broken_count INTEGER DEFAULT 0;

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_votes_company_id ON votes(company_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_vote_type ON votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON votes(voted_at);

CREATE INDEX IF NOT EXISTS idx_promises_company_id ON promises(company_id);
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_deadline ON promises(deadline_date);

CREATE INDEX IF NOT EXISTS idx_expert_reviews_company_id ON expert_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_user_id ON expert_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_verified ON expert_reviews(verified);

CREATE INDEX IF NOT EXISTS idx_company_scores_company_id ON company_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_company_scores_overall ON company_scores(overall_score);

CREATE INDEX IF NOT EXISTS idx_score_history_company_id ON score_history(company_id);
CREATE INDEX IF NOT EXISTS idx_score_history_type_date ON score_history(score_type, recorded_at);

CREATE INDEX IF NOT EXISTS idx_promise_votes_promise_id ON promise_votes(promise_id);
CREATE INDEX IF NOT EXISTS idx_promise_votes_user_id ON promise_votes(user_id);

-- ============================================================================
-- 4. CREATE FUNCTIONS
-- ============================================================================

-- Function: Calculate user voting weight based on reputation
CREATE OR REPLACE FUNCTION get_user_vote_weight(p_user_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    v_reputation INTEGER;
    v_is_expert BOOLEAN;
    v_weight DECIMAL(3,2);
BEGIN
    SELECT reputation_score, is_expert
    INTO v_reputation, v_is_expert
    FROM user_profiles
    WHERE id = p_user_id;

    -- Base weight calculation
    IF v_is_expert THEN
        v_weight := 2.0;
    ELSIF v_reputation >= 1000 THEN
        v_weight := 1.5;
    ELSIF v_reputation >= 500 THEN
        v_weight := 1.3;
    ELSIF v_reputation >= 100 THEN
        v_weight := 1.1;
    ELSE
        v_weight := 1.0;
    END IF;

    RETURN v_weight;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate weighted score for a specific vote type
CREATE OR REPLACE FUNCTION calculate_weighted_vote_score(
    p_company_id UUID,
    p_vote_type TEXT
) RETURNS DECIMAL(3,1) AS $$
DECLARE
    v_weighted_sum DECIMAL(10,2);
    v_total_weight DECIMAL(10,2);
    v_final_score DECIMAL(3,1);
BEGIN
    -- Calculate weighted average from community votes
    SELECT
        COALESCE(SUM(score * weight), 0),
        COALESCE(SUM(weight), 0)
    INTO v_weighted_sum, v_total_weight
    FROM votes
    WHERE company_id = p_company_id
        AND vote_type = p_vote_type;

    -- Add expert reviews (higher weight)
    SELECT
        COALESCE(SUM(
            CASE p_vote_type
                WHEN 'ethics' THEN ethics_score * weight
                WHEN 'credibility' THEN credibility_score * weight
                WHEN 'delivery' THEN delivery_score * weight
                WHEN 'security' THEN security_score * weight
                WHEN 'innovation' THEN innovation_score * weight
            END
        ), 0) + v_weighted_sum,
        COALESCE(SUM(weight), 0) + v_total_weight
    INTO v_weighted_sum, v_total_weight
    FROM expert_reviews
    WHERE company_id = p_company_id
        AND verified = TRUE;

    -- Calculate final weighted average
    IF v_total_weight > 0 THEN
        v_final_score := ROUND((v_weighted_sum / v_total_weight)::numeric, 1);
    ELSE
        v_final_score := 0.0;
    END IF;

    RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate promise fulfillment score
CREATE OR REPLACE FUNCTION calculate_promise_score(p_company_id UUID)
RETURNS DECIMAL(4,3) AS $$
DECLARE
    v_kept_count INTEGER;
    v_total_count INTEGER;
    v_ratio DECIMAL(4,3);
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE status = 'kept' OR community_verdict = 'kept'),
        COUNT(*)
    INTO v_kept_count, v_total_count
    FROM promises
    WHERE company_id = p_company_id
        AND status != 'pending';

    IF v_total_count > 0 THEN
        v_ratio := ROUND((v_kept_count::numeric / v_total_count::numeric), 3);
    ELSE
        v_ratio := 0.0;
    END IF;

    RETURN v_ratio;
END;
$$ LANGUAGE plpgsql;

-- Function: Determine confidence level based on vote count
CREATE OR REPLACE FUNCTION determine_confidence_level(
    p_total_votes INTEGER,
    p_expert_count INTEGER
) RETURNS TEXT AS $$
BEGIN
    IF p_expert_count >= 3 AND p_total_votes >= 50 THEN
        RETURN 'very_high';
    ELSIF p_expert_count >= 2 AND p_total_votes >= 30 THEN
        RETURN 'high';
    ELSIF p_expert_count >= 1 OR p_total_votes >= 15 THEN
        RETURN 'medium';
    ELSE
        RETURN 'low';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Recalculate all scores for a company
CREATE OR REPLACE FUNCTION recalculate_company_score(p_company_id UUID)
RETURNS VOID AS $$
DECLARE
    v_ethics_score DECIMAL(3,1);
    v_credibility_score DECIMAL(3,1);
    v_delivery_score DECIMAL(3,1);
    v_security_score DECIMAL(3,1);
    v_innovation_score DECIMAL(3,1);
    v_overall_score DECIMAL(3,1);
    v_total_votes INTEGER;
    v_expert_count INTEGER;
    v_confidence TEXT;
    v_promise_ratio DECIMAL(4,3);
    v_old_overall DECIMAL(3,1);
BEGIN
    -- Calculate individual scores
    v_ethics_score := calculate_weighted_vote_score(p_company_id, 'ethics');
    v_credibility_score := calculate_weighted_vote_score(p_company_id, 'credibility');
    v_delivery_score := calculate_weighted_vote_score(p_company_id, 'delivery');
    v_security_score := calculate_weighted_vote_score(p_company_id, 'security');
    v_innovation_score := calculate_weighted_vote_score(p_company_id, 'innovation');

    -- Get promise fulfillment ratio
    v_promise_ratio := calculate_promise_score(p_company_id);

    -- Adjust delivery score based on promises
    IF v_promise_ratio > 0 THEN
        v_delivery_score := ROUND(
            (v_delivery_score * 0.6 + (v_promise_ratio * 10) * 0.4)::numeric,
            1
        );
    END IF;

    -- Calculate overall score (weighted average)
    -- Ethics: 30%, Credibility: 25%, Delivery: 20%, Security: 15%, Innovation: 10%
    v_overall_score := ROUND(
        (v_ethics_score * 0.30 +
         v_credibility_score * 0.25 +
         v_delivery_score * 0.20 +
         v_security_score * 0.15 +
         v_innovation_score * 0.10)::numeric,
        1
    );

    -- Count votes and expert reviews
    SELECT COUNT(*) INTO v_total_votes FROM votes WHERE company_id = p_company_id;
    SELECT COUNT(*) INTO v_expert_count FROM expert_reviews WHERE company_id = p_company_id AND verified = TRUE;

    -- Determine confidence level
    v_confidence := determine_confidence_level(v_total_votes, v_expert_count);

    -- Get old overall score for history tracking
    SELECT overall_score INTO v_old_overall FROM company_scores WHERE company_id = p_company_id;

    -- Update or insert company_scores
    INSERT INTO company_scores (
        company_id, overall_score, ethics_score, credibility_score,
        delivery_score, security_score, innovation_score,
        confidence_level, total_votes, expert_reviews_count,
        promises_kept_ratio, last_calculated
    ) VALUES (
        p_company_id, v_overall_score, v_ethics_score, v_credibility_score,
        v_delivery_score, v_security_score, v_innovation_score,
        v_confidence, v_total_votes, v_expert_count,
        v_promise_ratio, NOW()
    )
    ON CONFLICT (company_id)
    DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        ethics_score = EXCLUDED.ethics_score,
        credibility_score = EXCLUDED.credibility_score,
        delivery_score = EXCLUDED.delivery_score,
        security_score = EXCLUDED.security_score,
        innovation_score = EXCLUDED.innovation_score,
        confidence_level = EXCLUDED.confidence_level,
        total_votes = EXCLUDED.total_votes,
        expert_reviews_count = EXCLUDED.expert_reviews_count,
        promises_kept_ratio = EXCLUDED.promises_kept_ratio,
        last_calculated = NOW();

    -- Update companies table
    UPDATE companies SET
        ethics_score = v_ethics_score,
        credibility_score = v_credibility_score,
        delivery_score = v_delivery_score,
        security_score = v_security_score,
        innovation_score = v_innovation_score,
        overall_score = v_overall_score,
        total_community_votes = v_total_votes,
        score_confidence = v_confidence,
        impact_score = v_overall_score -- Sync impact_score with overall
    WHERE id = p_company_id;

    -- Record in score history if overall score changed significantly
    IF v_old_overall IS NULL OR ABS(v_old_overall - v_overall_score) >= 0.1 THEN
        INSERT INTO score_history (
            company_id, score_type, score_value, change_amount,
            confidence_level, total_votes, recorded_at
        ) VALUES (
            p_company_id, 'overall', v_overall_score,
            COALESCE(v_overall_score - v_old_overall, 0),
            v_confidence, v_total_votes, NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Update score history (called daily or after major changes)
CREATE OR REPLACE FUNCTION update_score_history()
RETURNS VOID AS $$
BEGIN
    -- Insert current scores into history for all companies
    INSERT INTO score_history (company_id, score_type, score_value, confidence_level, total_votes, recorded_at)
    SELECT
        cs.company_id,
        'overall',
        cs.overall_score,
        cs.confidence_level,
        cs.total_votes,
        NOW()
    FROM company_scores cs
    WHERE cs.last_calculated >= NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function: Update promise counts on companies table
CREATE OR REPLACE FUNCTION update_promise_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE companies SET
        promises_kept_count = (
            SELECT COUNT(*) FROM promises
            WHERE company_id = NEW.company_id AND (status = 'kept' OR community_verdict = 'kept')
        ),
        promises_broken_count = (
            SELECT COUNT(*) FROM promises
            WHERE company_id = NEW.company_id AND (status = 'broken' OR community_verdict = 'broken')
        )
    WHERE id = NEW.company_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- Trigger: Auto-calculate user vote weight on insert
CREATE OR REPLACE FUNCTION set_vote_weight()
RETURNS TRIGGER AS $$
BEGIN
    NEW.weight := get_user_vote_weight(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_vote_insert
    BEFORE INSERT ON votes
    FOR EACH ROW
    EXECUTE FUNCTION set_vote_weight();

-- Trigger: Recalculate scores after vote insert/update/delete
CREATE OR REPLACE FUNCTION trigger_score_recalculation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_company_score(OLD.company_id);
        RETURN OLD;
    ELSE
        PERFORM recalculate_company_score(NEW.company_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_score_recalculation();

CREATE TRIGGER after_expert_review_change
    AFTER INSERT OR UPDATE OR DELETE ON expert_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_score_recalculation();

-- Trigger: Update promise counts
CREATE TRIGGER after_promise_change
    AFTER INSERT OR UPDATE ON promises
    FOR EACH ROW
    EXECUTE FUNCTION update_promise_counts();

-- Trigger: Update company_metrics_history when scores change
CREATE OR REPLACE FUNCTION sync_metrics_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Update today's metrics or insert if doesn't exist
    INSERT INTO company_metrics_history (
        company_id, metric_date, ethics_score, impact_score,
        innovation_score, engagement_score
    ) VALUES (
        NEW.company_id, CURRENT_DATE, NEW.ethics_score,
        NEW.overall_score, NEW.innovation_score,
        (NEW.total_votes::decimal / GREATEST(NEW.total_votes, 1))
    )
    ON CONFLICT (company_id, metric_date)
    DO UPDATE SET
        ethics_score = EXCLUDED.ethics_score,
        impact_score = EXCLUDED.impact_score,
        innovation_score = EXCLUDED.innovation_score,
        engagement_score = EXCLUDED.engagement_score;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_company_score_update
    AFTER INSERT OR UPDATE ON company_scores
    FOR EACH ROW
    EXECUTE FUNCTION sync_metrics_history();

-- Trigger: Notify followers when score changes significantly
CREATE OR REPLACE FUNCTION notify_followers_on_score_change()
RETURNS TRIGGER AS $$
DECLARE
    v_company_name TEXT;
    v_score_change DECIMAL(3,1);
    v_follower_record RECORD;
BEGIN
    -- Only notify if score changed by more than 0.5 points
    IF OLD.overall_score IS NOT NULL THEN
        v_score_change := NEW.overall_score - OLD.overall_score;

        IF ABS(v_score_change) >= 0.5 THEN
            -- Get company name
            SELECT name INTO v_company_name FROM companies WHERE id = NEW.company_id;

            -- Create notifications for followers
            FOR v_follower_record IN
                SELECT user_id FROM company_follows
                WHERE company_id = NEW.company_id AND notify_on_updates = TRUE
            LOOP
                INSERT INTO notifications (user_id, type, title, message, link, data)
                VALUES (
                    v_follower_record.user_id,
                    'badge',
                    'Score Update: ' || v_company_name,
                    CASE
                        WHEN v_score_change > 0 THEN
                            'Overall score increased by ' || ABS(v_score_change) || ' points to ' || NEW.overall_score
                        ELSE
                            'Overall score decreased by ' || ABS(v_score_change) || ' points to ' || NEW.overall_score
                    END,
                    '/companies/' || NEW.company_id,
                    jsonb_build_object(
                        'company_id', NEW.company_id,
                        'old_score', OLD.overall_score,
                        'new_score', NEW.overall_score,
                        'change', v_score_change
                    )
                );
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_significant_score_change
    AFTER UPDATE ON company_scores
    FOR EACH ROW
    WHEN (OLD.overall_score IS DISTINCT FROM NEW.overall_score)
    EXECUTE FUNCTION notify_followers_on_score_change();

-- Trigger: Update updated_at timestamp
CREATE TRIGGER update_votes_timestamp
    BEFORE UPDATE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promises_timestamp
    BEFORE UPDATE ON promises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_reviews_timestamp
    BEFORE UPDATE ON expert_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE promise_votes ENABLE ROW LEVEL SECURITY;

-- Votes policies
CREATE POLICY "Allow public read access to votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert their own votes" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own votes" ON votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id);

-- Promises policies
CREATE POLICY "Allow public read access to promises" ON promises
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create promises" ON promises
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Expert reviews policies
CREATE POLICY "Allow public read access to verified expert reviews" ON expert_reviews
    FOR SELECT USING (verified = true);

CREATE POLICY "Allow experts to insert reviews" ON expert_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_expert = true)
    );

-- Company scores policies
CREATE POLICY "Allow public read access to company_scores" ON company_scores
    FOR SELECT USING (true);

-- Score history policies
CREATE POLICY "Allow public read access to score_history" ON score_history
    FOR SELECT USING (true);

-- Promise votes policies
CREATE POLICY "Allow public read access to promise_votes" ON promise_votes
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to vote on promises" ON promise_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. INITIAL DATA POPULATION
-- ============================================================================

-- Initialize company_scores for existing companies
INSERT INTO company_scores (company_id, overall_score, ethics_score, credibility_score, delivery_score, security_score, innovation_score)
SELECT
    id,
    COALESCE(ethics_score, 0.0),
    COALESCE(ethics_score, 0.0),
    0.0,
    0.0,
    0.0,
    COALESCE(innovation_score, 0.0)
FROM companies
WHERE id NOT IN (SELECT company_id FROM company_scores);

-- Update companies table with initial scores
UPDATE companies c
SET
    credibility_score = 0.0,
    delivery_score = 0.0,
    security_score = 0.0,
    overall_score = ethics_score,
    total_community_votes = 0,
    score_confidence = 'low',
    promises_kept_count = 0,
    promises_broken_count = 0
WHERE credibility_score IS NULL;
