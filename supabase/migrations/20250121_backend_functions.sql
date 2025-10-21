-- ============================================
-- BACKEND FUNCTIONS MIGRATION
-- ============================================
-- Advanced score calculation with weighted averages,
-- reputation multipliers, and automated notifications

-- ============================================
-- 1. CALCULATE WEIGHTED VOTE SCORE
-- ============================================

CREATE OR REPLACE FUNCTION calculate_weighted_vote_score(
  company_id_input UUID,
  vote_type_input TEXT
)
RETURNS DECIMAL(3,1) AS $$
DECLARE
  weighted_sum DECIMAL;
  weight_sum DECIMAL;
  vote_record RECORD;
  reputation_multiplier DECIMAL;
  expert_multiplier DECIMAL;
  recency_multiplier DECIMAL;
  vote_weight DECIMAL;
  days_old INTEGER;
BEGIN
  weighted_sum := 0;
  weight_sum := 0;

  -- Loop through all votes for this company and vote type
  FOR vote_record IN
    SELECT
      v.score,
      v.created_at,
      COALESCE(p.reputation, 0) as reputation,
      COALESCE(p.is_expert, FALSE) as is_expert
    FROM votes v
    LEFT JOIN profiles p ON v.user_id = p.id
    WHERE v.company_id = company_id_input
      AND v.vote_type = vote_type_input
  LOOP
    -- Calculate reputation multiplier
    IF vote_record.reputation >= 1000 THEN
      reputation_multiplier := 2.0;
    ELSIF vote_record.reputation >= 500 THEN
      reputation_multiplier := 1.8;
    ELSIF vote_record.reputation >= 100 THEN
      reputation_multiplier := 1.3;
    ELSE
      reputation_multiplier := 1.0;
    END IF;

    -- Calculate expert multiplier
    IF vote_record.is_expert THEN
      expert_multiplier := 2.0;
    ELSE
      expert_multiplier := 1.0;
    END IF;

    -- Calculate recency multiplier
    days_old := EXTRACT(DAY FROM NOW() - vote_record.created_at);
    IF days_old <= 30 THEN
      recency_multiplier := 1.0;
    ELSIF days_old <= 90 THEN
      recency_multiplier := 0.8;
    ELSIF days_old <= 180 THEN
      recency_multiplier := 0.6;
    ELSE
      recency_multiplier := 0.4;
    END IF;

    -- Calculate total weight for this vote
    vote_weight := reputation_multiplier * expert_multiplier * recency_multiplier;

    -- Add to weighted sums
    weighted_sum := weighted_sum + (vote_record.score * vote_weight);
    weight_sum := weight_sum + vote_weight;
  END LOOP;

  -- Return weighted average, or 5.0 if no votes
  IF weight_sum > 0 THEN
    RETURN ROUND((weighted_sum / weight_sum)::DECIMAL, 1);
  ELSE
    RETURN 5.0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. CALCULATE PROMISE SCORE
-- ============================================

CREATE OR REPLACE FUNCTION calculate_promise_score(
  company_id_input UUID
)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  kept_count INTEGER;
  total_count INTEGER;
BEGIN
  -- Count promises with status 'kept' or community_verdict 'kept'
  SELECT COUNT(*) INTO kept_count
  FROM promises
  WHERE company_id = company_id_input
    AND status NOT IN ('pending')
    AND (status = 'kept' OR community_verdict = 'kept');

  -- Count total non-pending promises
  SELECT COUNT(*) INTO total_count
  FROM promises
  WHERE company_id = company_id_input
    AND status NOT IN ('pending');

  -- Return ratio (kept/total), or 0.5 if no promises
  IF total_count > 0 THEN
    RETURN (kept_count::DECIMAL / total_count::DECIMAL);
  ELSE
    RETURN 0.5;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. RECALCULATE COMPANY SCORE
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_company_score(
  company_id_input UUID
)
RETURNS void AS $$
DECLARE
  ethics_score_calc DECIMAL(3,1);
  credibility_score_calc DECIMAL(3,1);
  delivery_score_calc DECIMAL(3,1);
  security_score_calc DECIMAL(3,1);
  innovation_score_calc DECIMAL(3,1);
  promise_ratio DECIMAL(3,2);
  adjusted_delivery DECIMAL(3,1);
  overall_score_calc DECIMAL(3,1);
  total_votes_count INTEGER;
  expert_votes_count INTEGER;
  confidence_level TEXT;
  old_overall_score DECIMAL(3,1);
  score_change DECIMAL(3,1);
  last_history_date TIMESTAMPTZ;
BEGIN
  -- Calculate all 5 dimension scores using weighted calculation
  ethics_score_calc := calculate_weighted_vote_score(company_id_input, 'ethics');
  credibility_score_calc := calculate_weighted_vote_score(company_id_input, 'credibility');
  delivery_score_calc := calculate_weighted_vote_score(company_id_input, 'delivery');
  security_score_calc := calculate_weighted_vote_score(company_id_input, 'security');
  innovation_score_calc := calculate_weighted_vote_score(company_id_input, 'innovation');

  -- Calculate promise ratio
  promise_ratio := calculate_promise_score(company_id_input);

  -- Adjust delivery score with promise ratio
  adjusted_delivery := ROUND((delivery_score_calc * 0.7) + (promise_ratio * 10 * 0.3), 1);

  -- Calculate overall score with weighted dimensions
  overall_score_calc := ROUND(
    (ethics_score_calc * 0.30) +
    (credibility_score_calc * 0.25) +
    (adjusted_delivery * 0.20) +
    (security_score_calc * 0.15) +
    (innovation_score_calc * 0.10),
    1
  );

  -- Count total votes and expert votes
  SELECT COUNT(DISTINCT v.id) INTO total_votes_count
  FROM votes v
  WHERE v.company_id = company_id_input;

  SELECT COUNT(DISTINCT v.id) INTO expert_votes_count
  FROM votes v
  LEFT JOIN profiles p ON v.user_id = p.id
  WHERE v.company_id = company_id_input
    AND COALESCE(p.is_expert, FALSE) = TRUE;

  -- Determine confidence level
  IF total_votes_count >= 50 AND expert_votes_count >= 3 THEN
    confidence_level := 'very_high';
  ELSIF total_votes_count >= 30 AND expert_votes_count >= 2 THEN
    confidence_level := 'high';
  ELSIF total_votes_count >= 15 OR expert_votes_count >= 1 THEN
    confidence_level := 'medium';
  ELSE
    confidence_level := 'low';
  END IF;

  -- Get old overall score for history tracking
  SELECT overall_score INTO old_overall_score
  FROM company_scores
  WHERE company_id = company_id_input;

  -- UPSERT into company_scores table
  INSERT INTO company_scores (
    company_id,
    overall_score,
    ethics_score,
    credibility_score,
    delivery_score,
    security_score,
    innovation_score,
    promise_score,
    total_votes,
    expert_votes,
    confidence_level,
    updated_at
  ) VALUES (
    company_id_input,
    overall_score_calc,
    ethics_score_calc,
    credibility_score_calc,
    adjusted_delivery,
    security_score_calc,
    innovation_score_calc,
    promise_ratio * 10,
    total_votes_count,
    expert_votes_count,
    confidence_level,
    NOW()
  )
  ON CONFLICT (company_id) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    ethics_score = EXCLUDED.ethics_score,
    credibility_score = EXCLUDED.credibility_score,
    delivery_score = EXCLUDED.delivery_score,
    security_score = EXCLUDED.security_score,
    innovation_score = EXCLUDED.innovation_score,
    promise_score = EXCLUDED.promise_score,
    total_votes = EXCLUDED.total_votes,
    expert_votes = EXCLUDED.expert_votes,
    confidence_level = EXCLUDED.confidence_level,
    updated_at = NOW();

  -- UPDATE companies table with scores
  UPDATE companies SET
    overall_score = overall_score_calc,
    ethics_score = ethics_score_calc,
    credibility_score = credibility_score_calc,
    delivery_score = adjusted_delivery,
    security_score = security_score_calc,
    innovation_score = innovation_score_calc,
    updated_at = NOW()
  WHERE id = company_id_input;

  -- INSERT into score_history if change >= 0.1 and last record > 1 day ago
  IF old_overall_score IS NOT NULL THEN
    score_change := ABS(overall_score_calc - old_overall_score);

    -- Get last history record date
    SELECT created_at INTO last_history_date
    FROM score_history
    WHERE company_id = company_id_input
    ORDER BY created_at DESC
    LIMIT 1;

    IF score_change >= 0.1 AND (last_history_date IS NULL OR last_history_date < NOW() - INTERVAL '1 day') THEN
      INSERT INTO score_history (
        company_id,
        overall_score,
        ethics_score,
        credibility_score,
        delivery_score,
        security_score,
        innovation_score,
        change_amount,
        created_at
      ) VALUES (
        company_id_input,
        overall_score_calc,
        ethics_score_calc,
        credibility_score_calc,
        adjusted_delivery,
        security_score_calc,
        innovation_score_calc,
        score_change,
        NOW()
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. TRIGGER: RECALCULATE SCORE ON VOTE
-- ============================================

CREATE OR REPLACE FUNCTION trigger_recalculate_score_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_company_score(OLD.company_id);
  ELSE
    PERFORM recalculate_company_score(NEW.company_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS recalculate_score_on_vote ON votes;

-- Create trigger
CREATE TRIGGER recalculate_score_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_score_on_vote();

-- ============================================
-- 5. NOTIFY SCORE CHANGE
-- ============================================

CREATE OR REPLACE FUNCTION notify_score_change()
RETURNS TRIGGER AS $$
DECLARE
  score_change DECIMAL(3,1);
  follower_record RECORD;
BEGIN
  -- Calculate score change
  score_change := ABS(NEW.overall_score - OLD.overall_score);

  -- Only notify if change >= 0.5 points
  IF score_change >= 0.5 THEN
    -- Insert notifications for all followers with notify_on_updates = true
    FOR follower_record IN
      SELECT uf.user_id
      FROM user_follows uf
      LEFT JOIN user_preferences up ON uf.user_id = up.user_id
      WHERE uf.company_id = NEW.company_id
        AND COALESCE(up.notify_on_updates, TRUE) = TRUE
    LOOP
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        link,
        data,
        read,
        created_at
      ) VALUES (
        follower_record.user_id,
        'company_update',
        'Company Score Updated',
        format('A company you follow has a significant score change: %s → %s (change: %s)',
          OLD.overall_score,
          NEW.overall_score,
          CASE
            WHEN NEW.overall_score > OLD.overall_score THEN '+' || score_change::TEXT
            ELSE '-' || score_change::TEXT
          END
        ),
        '/companies/' || (SELECT slug FROM companies WHERE id = NEW.company_id),
        jsonb_build_object(
          'company_id', NEW.company_id,
          'old_score', OLD.overall_score,
          'new_score', NEW.overall_score,
          'change_amount', score_change
        ),
        FALSE,
        NOW()
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS notify_on_score_change ON company_scores;

-- Create trigger
CREATE TRIGGER notify_on_score_change
  AFTER UPDATE ON company_scores
  FOR EACH ROW
  EXECUTE FUNCTION notify_score_change();

-- ============================================
-- SUPPORTING TABLES
-- ============================================

-- Add missing columns to existing tables if they don't exist
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_expert BOOLEAN DEFAULT FALSE;

ALTER TABLE promises
  ADD COLUMN IF NOT EXISTS community_verdict TEXT CHECK (community_verdict IN ('kept', 'broken', 'partial'));

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS overall_score DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS ethics_score DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS credibility_score DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS delivery_score DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS security_score DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS innovation_score DECIMAL(3,1);

ALTER TABLE company_scores
  ADD COLUMN IF NOT EXISTS promise_score DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS total_votes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expert_votes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high'));

-- Create score_history table if not exists
CREATE TABLE IF NOT EXISTS score_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  overall_score DECIMAL(3,1),
  ethics_score DECIMAL(3,1),
  credibility_score DECIMAL(3,1),
  delivery_score DECIMAL(3,1),
  security_score DECIMAL(3,1),
  innovation_score DECIMAL(3,1),
  change_amount DECIMAL(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_history_company_id ON score_history(company_id);
CREATE INDEX IF NOT EXISTS idx_score_history_created ON score_history(created_at DESC);

-- Create user_preferences table if not exists
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notify_on_updates BOOLEAN DEFAULT TRUE,
  notify_on_votes BOOLEAN DEFAULT TRUE,
  notify_on_promises BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Add data column to notifications if not exists
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS data JSONB;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION calculate_weighted_vote_score IS 'Calculates weighted average vote score with reputation, expert, and recency multipliers';
COMMENT ON FUNCTION calculate_promise_score IS 'Calculates promise keeping ratio (0-1 scale)';
COMMENT ON FUNCTION recalculate_company_score IS 'Recalculates all company scores, updates company_scores table, and tracks history';
COMMENT ON FUNCTION notify_score_change IS 'Sends notifications to followers when company score changes significantly';
COMMENT ON TABLE score_history IS 'Historical record of company score changes';
COMMENT ON TABLE user_preferences IS 'User notification and preference settings';
