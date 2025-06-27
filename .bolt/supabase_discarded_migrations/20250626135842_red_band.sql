/*
  # AquaCoin and Achievements System

  1. Enhanced Tables
    - Update volunteers table with aqua_coins tracking
    - Enhanced badges table with proper criteria
    - Enhanced rewards table with categories
    - Add achievement tracking tables

  2. Functions
    - Award AquaCoins for activities
    - Check and award badges automatically
    - Track achievement progress
    - Redeem rewards

  3. Triggers
    - Auto-award coins for waste logging
    - Auto-check badge criteria
    - Update volunteer stats
*/

-- Update volunteers table to track more stats
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS total_events_joined integer DEFAULT 0;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS total_waste_collected numeric(10,2) DEFAULT 0;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS total_plastic_collected numeric(10,2) DEFAULT 0;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS badges_earned integer DEFAULT 0;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS last_activity_at timestamptz DEFAULT now();

-- Create aquacoin_transactions table for tracking coin history
CREATE TABLE IF NOT EXISTS aquacoin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES volunteers(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- Can be positive (earned) or negative (spent)
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty')),
  source_type text NOT NULL CHECK (source_type IN ('event_participation', 'waste_logging', 'badge_earned', 'reward_redemption', 'manual', 'bonus')),
  source_id uuid, -- Reference to event, waste_log, badge, etc.
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create achievement_progress table for tracking badge progress
CREATE TABLE IF NOT EXISTS achievement_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES volunteers(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  current_progress jsonb DEFAULT '{}',
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(volunteer_id, badge_id)
);

-- Enable RLS
ALTER TABLE aquacoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions"
  ON aquacoin_transactions FOR SELECT
  USING (auth.uid()::text = volunteer_id::text);

CREATE POLICY "Users can view their own achievement progress"
  ON achievement_progress FOR SELECT
  USING (auth.uid()::text = volunteer_id::text);

-- Function to award AquaCoins
CREATE OR REPLACE FUNCTION award_aquacoins(
  p_volunteer_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_source_type text,
  p_source_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
BEGIN
  -- Insert transaction record
  INSERT INTO aquacoin_transactions (
    volunteer_id,
    amount,
    transaction_type,
    source_type,
    source_id,
    description
  ) VALUES (
    p_volunteer_id,
    p_amount,
    p_transaction_type,
    p_source_type,
    p_source_id,
    p_description
  ) RETURNING id INTO transaction_id;

  -- Update volunteer's aqua_coins balance
  UPDATE volunteers 
  SET 
    aqua_coins = aqua_coins + p_amount,
    last_activity_at = now()
  WHERE id = p_volunteer_id;

  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_volunteer_id uuid)
RETURNS void AS $$
DECLARE
  volunteer_stats RECORD;
  badge_record RECORD;
  progress_record RECORD;
  criteria_met boolean;
  progress_pct integer;
BEGIN
  -- Get volunteer stats
  SELECT 
    v.*,
    COUNT(DISTINCT er.event_id) as events_participated,
    COALESCE(SUM(wl.total_kg), 0) as total_waste,
    COALESCE(SUM(wl.plastic_kg), 0) as total_plastic,
    COUNT(DISTINCT vb.badge_id) as current_badges
  INTO volunteer_stats
  FROM volunteers v
  LEFT JOIN event_registrations er ON v.id = er.volunteer_id AND er.status = 'checked_in'
  LEFT JOIN waste_logs wl ON v.id = wl.volunteer_id
  LEFT JOIN volunteer_badges vb ON v.id = vb.volunteer_id
  WHERE v.id = p_volunteer_id
  GROUP BY v.id;

  -- Update volunteer stats
  UPDATE volunteers SET
    total_events_joined = volunteer_stats.events_participated,
    total_waste_collected = volunteer_stats.total_waste,
    total_plastic_collected = volunteer_stats.total_plastic,
    badges_earned = volunteer_stats.current_badges
  WHERE id = p_volunteer_id;

  -- Check each badge
  FOR badge_record IN SELECT * FROM badges LOOP
    -- Check if already earned
    IF EXISTS (SELECT 1 FROM volunteer_badges WHERE volunteer_id = p_volunteer_id AND badge_id = badge_record.id) THEN
      CONTINUE;
    END IF;

    criteria_met := false;
    progress_pct := 0;

    -- Check criteria based on badge requirements
    IF badge_record.criteria->>'events_count' IS NOT NULL THEN
      IF volunteer_stats.events_participated >= (badge_record.criteria->>'events_count')::integer THEN
        criteria_met := true;
      END IF;
      progress_pct := LEAST(100, (volunteer_stats.events_participated * 100 / (badge_record.criteria->>'events_count')::integer));
    END IF;

    IF badge_record.criteria->>'plastic_kg' IS NOT NULL THEN
      IF volunteer_stats.total_plastic >= (badge_record.criteria->>'plastic_kg')::numeric THEN
        criteria_met := true;
      END IF;
      progress_pct := LEAST(100, (volunteer_stats.total_plastic * 100 / (badge_record.criteria->>'plastic_kg')::numeric)::integer);
    END IF;

    IF badge_record.criteria->>'total_kg' IS NOT NULL THEN
      IF volunteer_stats.total_waste >= (badge_record.criteria->>'total_kg')::numeric THEN
        criteria_met := true;
      END IF;
      progress_pct := LEAST(100, (volunteer_stats.total_waste * 100 / (badge_record.criteria->>'total_kg')::numeric)::integer);
    END IF;

    -- Update or insert achievement progress
    INSERT INTO achievement_progress (
      volunteer_id,
      badge_id,
      current_progress,
      progress_percentage,
      is_completed,
      completed_at
    ) VALUES (
      p_volunteer_id,
      badge_record.id,
      jsonb_build_object(
        'events_participated', volunteer_stats.events_participated,
        'total_waste', volunteer_stats.total_waste,
        'total_plastic', volunteer_stats.total_plastic
      ),
      progress_pct,
      criteria_met,
      CASE WHEN criteria_met THEN now() ELSE NULL END
    )
    ON CONFLICT (volunteer_id, badge_id) 
    DO UPDATE SET
      current_progress = EXCLUDED.current_progress,
      progress_percentage = EXCLUDED.progress_percentage,
      is_completed = EXCLUDED.is_completed,
      completed_at = EXCLUDED.completed_at,
      updated_at = now();

    -- Award badge if criteria met
    IF criteria_met THEN
      -- Insert badge award
      INSERT INTO volunteer_badges (volunteer_id, badge_id)
      VALUES (p_volunteer_id, badge_record.id)
      ON CONFLICT (volunteer_id, badge_id) DO NOTHING;

      -- Award AquaCoins for earning badge
      PERFORM award_aquacoins(
        p_volunteer_id,
        badge_record.aqua_coins_reward,
        'earned',
        'badge_earned',
        badge_record.id,
        'Earned badge: ' || badge_record.name
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to redeem reward
CREATE OR REPLACE FUNCTION redeem_reward(
  p_volunteer_id uuid,
  p_reward_id uuid
)
RETURNS jsonb AS $$
DECLARE
  volunteer_coins integer;
  reward_cost integer;
  reward_name text;
  redemption_id uuid;
BEGIN
  -- Get volunteer's current coins
  SELECT aqua_coins INTO volunteer_coins
  FROM volunteers
  WHERE id = p_volunteer_id;

  -- Get reward details
  SELECT cost, name INTO reward_cost, reward_name
  FROM rewards
  WHERE id = p_reward_id AND available = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found or not available');
  END IF;

  -- Check if volunteer has enough coins
  IF volunteer_coins < reward_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient AquaCoins');
  END IF;

  -- Create redemption record
  INSERT INTO reward_redemptions (volunteer_id, reward_id)
  VALUES (p_volunteer_id, p_reward_id)
  RETURNING id INTO redemption_id;

  -- Deduct coins
  PERFORM award_aquacoins(
    p_volunteer_id,
    -reward_cost,
    'spent',
    'reward_redemption',
    redemption_id,
    'Redeemed: ' || reward_name
  );

  RETURN jsonb_build_object(
    'success', true,
    'redemption_id', redemption_id,
    'coins_spent', reward_cost,
    'remaining_coins', volunteer_coins - reward_cost
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger function for waste log AquaCoin rewards
CREATE OR REPLACE FUNCTION award_coins_for_waste_log()
RETURNS trigger AS $$
DECLARE
  coins_to_award integer;
BEGIN
  -- Calculate coins based on waste collected (1 coin per kg, minimum 5 coins)
  coins_to_award := GREATEST(5, NEW.total_kg::integer);

  -- Award coins
  PERFORM award_aquacoins(
    NEW.volunteer_id,
    coins_to_award,
    'earned',
    'waste_logging',
    NEW.id,
    'Waste logged: ' || NEW.total_kg || 'kg'
  );

  -- Check for badge awards
  PERFORM check_and_award_badges(NEW.volunteer_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for event participation rewards
CREATE OR REPLACE FUNCTION award_coins_for_event_participation()
RETURNS trigger AS $$
BEGIN
  -- Award coins when volunteer checks in to an event
  IF NEW.status = 'checked_in' AND (OLD.status IS NULL OR OLD.status != 'checked_in') THEN
    PERFORM award_aquacoins(
      NEW.volunteer_id,
      20, -- 20 coins for event participation
      'earned',
      'event_participation',
      NEW.event_id,
      'Event participation'
    );

    -- Check for badge awards
    PERFORM check_and_award_badges(NEW.volunteer_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_award_coins_waste_log ON waste_logs;
CREATE TRIGGER trigger_award_coins_waste_log
  AFTER INSERT ON waste_logs
  FOR EACH ROW
  EXECUTE FUNCTION award_coins_for_waste_log();

DROP TRIGGER IF EXISTS trigger_award_coins_event_participation ON event_registrations;
CREATE TRIGGER trigger_award_coins_event_participation
  AFTER UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION award_coins_for_event_participation();

-- Insert some sample volunteers for testing
INSERT INTO volunteers (name, email, phone, age, area, interests) VALUES
  ('Priya Patel', 'priya@example.com', '+91 98765 12345', 28, 'Andheri', ARRAY['beach-cleanup', 'marine-conservation']),
  ('Amit Kumar', 'amit@example.com', '+91 87654 32109', 32, 'Bandra', ARRAY['waste-management', 'environmental-education']),
  ('Neha Singh', 'neha@example.com', '+91 76543 21098', 25, 'Juhu', ARRAY['beach-cleanup', 'waste-management'])
ON CONFLICT (email) DO NOTHING;

-- Insert sample NGO
INSERT INTO ngos (name, email, phone, registration_number, description, contact_person, contact_phone) VALUES
  ('Beach Please', 'contact@beachplease.org', '+91 98765 00000', 'NGO001', 'Dedicated to cleaning Mumbai beaches', 'Rahul Sharma', '+91 98765 43210')
ON CONFLICT (email) DO NOTHING;

-- Create some sample events
DO $$
DECLARE
  beach_id uuid;
  ngo_id uuid;
  volunteer_id uuid;
  event_id uuid;
BEGIN
  -- Get IDs
  SELECT id INTO beach_id FROM beaches WHERE name = 'Juhu Beach' LIMIT 1;
  SELECT id INTO ngo_id FROM ngos WHERE email = 'contact@beachplease.org' LIMIT 1;
  SELECT id INTO volunteer_id FROM volunteers WHERE email = 'priya@example.com' LIMIT 1;

  IF beach_id IS NOT NULL AND ngo_id IS NOT NULL THEN
    -- Create a sample event
    INSERT INTO events (
      title,
      description,
      date,
      beach_id,
      ngo_id,
      max_volunteers,
      meeting_point,
      status
    ) VALUES (
      'Juhu Beach Weekend Cleanup',
      'Join us for our monthly cleanup at Juhu Beach. We will focus on the northern section.',
      now() + interval '7 days',
      beach_id,
      ngo_id,
      50,
      'Near Juhu Beach entrance, opposite Hotel Sea Princess',
      'upcoming'
    ) RETURNING id INTO event_id;

    -- Register volunteer for event
    IF volunteer_id IS NOT NULL AND event_id IS NOT NULL THEN
      INSERT INTO event_registrations (event_id, volunteer_id, status)
      VALUES (event_id, volunteer_id, 'registered');
    END IF;
  END IF;
END $$;

-- Initialize achievement progress for existing volunteers
DO $$
DECLARE
  vol_record RECORD;
BEGIN
  FOR vol_record IN SELECT id FROM volunteers LOOP
    PERFORM check_and_award_badges(vol_record.id);
  END LOOP;
END $$;