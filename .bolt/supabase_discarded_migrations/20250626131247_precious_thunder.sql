/*
  # Initial Schema for Tidewy Beach Cleanup Platform

  1. New Tables
    - `beaches` - Beach locations with coordinates
    - `ngos` - NGO organizations
    - `volunteers` - Volunteer users
    - `events` - Cleanup events
    - `event_registrations` - Volunteer event registrations
    - `waste_logs` - Waste collection data
    - `beach_cleanliness_index` - BCI scores for beaches
    - `badges` - Achievement badges
    - `volunteer_badges` - Earned badges by volunteers
    - `rewards` - Available rewards
    - `reward_redemptions` - Redeemed rewards

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create beaches table
CREATE TABLE IF NOT EXISTS beaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coordinates jsonb NOT NULL, -- [longitude, latitude]
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ngos table
CREATE TABLE IF NOT EXISTS ngos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  registration_number text,
  website text,
  description text,
  contact_person text,
  contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  age integer,
  area text,
  interests text[] DEFAULT '{}',
  aqua_coins integer DEFAULT 0,
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date timestamptz NOT NULL,
  end_time timestamptz,
  beach_id uuid REFERENCES beaches(id),
  ngo_id uuid REFERENCES ngos(id),
  max_volunteers integer DEFAULT 50,
  meeting_point text,
  equipment_provided boolean DEFAULT true,
  equipment_details text,
  waste_categories text[] DEFAULT '{}',
  is_recurring boolean DEFAULT false,
  recurring_type text,
  status text DEFAULT 'upcoming',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  volunteer_id uuid REFERENCES volunteers(id) ON DELETE CASCADE,
  status text DEFAULT 'registered',
  checked_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, volunteer_id)
);

-- Create waste_logs table
CREATE TABLE IF NOT EXISTS waste_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id),
  volunteer_id uuid REFERENCES volunteers(id),
  plastic_kg numeric(10,2) DEFAULT 0,
  glass_kg numeric(10,2) DEFAULT 0,
  metal_kg numeric(10,2) DEFAULT 0,
  organic_kg numeric(10,2) DEFAULT 0,
  other_kg numeric(10,2) DEFAULT 0,
  total_kg numeric(10,2) GENERATED ALWAYS AS (plastic_kg + glass_kg + metal_kg + organic_kg + other_kg) STORED,
  photo_url text,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create beach_cleanliness_index table
CREATE TABLE IF NOT EXISTS beach_cleanliness_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_id uuid REFERENCES beaches(id),
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  factors jsonb NOT NULL, -- Store calculation factors
  calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  criteria jsonb NOT NULL, -- Criteria for earning the badge
  aqua_coins_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create volunteer_badges table
CREATE TABLE IF NOT EXISTS volunteer_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES volunteers(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(volunteer_id, badge_id)
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  cost integer NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create reward_redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES volunteers(id) ON DELETE CASCADE,
  reward_id uuid REFERENCES rewards(id),
  redeemed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE beaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE beach_cleanliness_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to beaches and events
CREATE POLICY "Beaches are viewable by everyone"
  ON beaches FOR SELECT
  USING (true);

CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Beach cleanliness index is viewable by everyone"
  ON beach_cleanliness_index FOR SELECT
  USING (true);

CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

CREATE POLICY "Rewards are viewable by everyone"
  ON rewards FOR SELECT
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Users can view their own volunteer data"
  ON volunteers FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own volunteer data"
  ON volunteers FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own NGO data"
  ON ngos FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own NGO data"
  ON ngos FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Insert initial beach data
INSERT INTO beaches (name, coordinates, description) VALUES
  ('Juhu Beach', '[72.8258, 19.0883]', 'One of Mumbai''s most popular beaches'),
  ('Versova Beach', '[72.8142, 19.1351]', 'Famous for its massive cleanup transformation'),
  ('Dadar Chowpatty', '[72.8409, 19.0212]', 'Historic beach in central Mumbai'),
  ('Girgaon Chowpatty', '[72.8147, 18.9542]', 'Popular beach in South Mumbai'),
  ('Mahim Beach', '[72.8409, 19.0377]', 'Beach facing pollution challenges from nearby creeks');

-- Insert initial badges
INSERT INTO badges (name, description, image_url, criteria, aqua_coins_reward) VALUES
  ('Beach Guardian', 'Participated in 5 beach cleanup events', 'https://via.placeholder.com/80', '{"events_count": 5}', 50),
  ('Plastic Warrior', 'Collected over 20kg of plastic waste', 'https://via.placeholder.com/80', '{"plastic_kg": 20}', 75),
  ('Cleanup Champion', 'Participated in 10 beach cleanup events', 'https://via.placeholder.com/80', '{"events_count": 10}', 100),
  ('Waste Master', 'Collected over 50kg of waste in total', 'https://via.placeholder.com/80', '{"total_kg": 50}', 150),
  ('Beach Leader', 'Led a beach cleanup event', 'https://via.placeholder.com/80', '{"led_events": 1}', 200);

-- Insert initial rewards
INSERT INTO rewards (name, description, image_url, cost, available) VALUES
  ('Reusable Water Bottle', 'Eco-friendly stainless steel water bottle', 'https://via.placeholder.com/120', 200, true),
  ('Tidewy T-Shirt', 'Organic cotton t-shirt with Tidewy logo', 'https://via.placeholder.com/120', 300, true),
  ('Beach Cleanup Kit', 'Includes gloves, bags, and tools for personal beach cleanups', 'https://via.placeholder.com/120', 400, true),
  ('Sustainable Backpack', 'Made from recycled ocean plastic', 'https://via.placeholder.com/120', 500, false);

-- Create function to calculate beach cleanliness index
CREATE OR REPLACE FUNCTION calculate_beach_cleanliness_index(beach_uuid uuid)
RETURNS integer AS $$
DECLARE
  recent_events_count integer;
  avg_waste_per_event numeric;
  days_since_last_cleanup integer;
  volunteer_participation numeric;
  base_score integer := 50;
  final_score integer;
BEGIN
  -- Count recent events (last 30 days)
  SELECT COUNT(*) INTO recent_events_count
  FROM events
  WHERE beach_id = beach_uuid
    AND date >= NOW() - INTERVAL '30 days'
    AND status = 'completed';

  -- Calculate average waste collected per event
  SELECT COALESCE(AVG(total_kg), 0) INTO avg_waste_per_event
  FROM waste_logs wl
  JOIN events e ON wl.event_id = e.id
  WHERE e.beach_id = beach_uuid
    AND e.date >= NOW() - INTERVAL '30 days';

  -- Days since last cleanup
  SELECT COALESCE(EXTRACT(DAY FROM NOW() - MAX(date)), 30) INTO days_since_last_cleanup
  FROM events
  WHERE beach_id = beach_uuid
    AND status = 'completed';

  -- Calculate volunteer participation rate
  SELECT COALESCE(AVG(
    (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.status = 'checked_in')::numeric /
    NULLIF(e.max_volunteers, 0)
  ), 0) INTO volunteer_participation
  FROM events e
  WHERE e.beach_id = beach_uuid
    AND e.date >= NOW() - INTERVAL '30 days';

  -- Calculate final score
  final_score := base_score;
  
  -- Boost score for recent cleanup activity
  final_score := final_score + (recent_events_count * 5);
  
  -- Reduce score based on waste collected (more waste = dirtier beach)
  final_score := final_score - LEAST(avg_waste_per_event::integer, 30);
  
  -- Reduce score for days since last cleanup
  final_score := final_score - LEAST(days_since_last_cleanup::integer, 20);
  
  -- Boost score for good volunteer participation
  final_score := final_score + (volunteer_participation * 20)::integer;
  
  -- Ensure score is between 0 and 100
  final_score := GREATEST(0, LEAST(100, final_score));
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Create function to update all beach cleanliness indices
CREATE OR REPLACE FUNCTION update_all_beach_cleanliness_indices()
RETURNS void AS $$
DECLARE
  beach_record RECORD;
  calculated_score integer;
  factors jsonb;
BEGIN
  FOR beach_record IN SELECT id FROM beaches LOOP
    calculated_score := calculate_beach_cleanliness_index(beach_record.id);
    
    factors := jsonb_build_object(
      'calculated_at', NOW(),
      'method', 'automated_calculation',
      'factors_considered', jsonb_build_array(
        'recent_events_count',
        'avg_waste_per_event',
        'days_since_last_cleanup',
        'volunteer_participation'
      )
    );
    
    INSERT INTO beach_cleanliness_index (beach_id, score, factors)
    VALUES (beach_record.id, calculated_score, factors);
  END LOOP;
END;
$$ LANGUAGE plpgsql;