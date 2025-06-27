/*
  # Image-based BCI Calculation System

  1. New Tables
    - `bci_image_analysis` - Store uploaded images and analysis results
    - `bci_calculation_logs` - Track BCI calculation history with image data
  
  2. Functions
    - Updated BCI calculation to include image analysis data
    - Image processing workflow functions
  
  3. Security
    - RLS policies for image uploads and analysis
    - Secure image storage configuration
*/

-- Create bci_image_analysis table for storing uploaded images and analysis results
CREATE TABLE IF NOT EXISTS bci_image_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_id uuid REFERENCES beaches(id),
  volunteer_id uuid REFERENCES volunteers(id),
  event_id uuid REFERENCES events(id),
  image_url text NOT NULL,
  analysis_status text DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  analysis_results jsonb DEFAULT '{}',
  waste_density_score integer CHECK (waste_density_score >= 0 AND waste_density_score <= 100),
  debris_types text[] DEFAULT '{}',
  confidence_score numeric(5,2) DEFAULT 0.0,
  processing_model text DEFAULT 'open_source_waste_detection',
  created_at timestamptz DEFAULT now(),
  analyzed_at timestamptz
);

-- Create bci_calculation_logs table to track calculation history
CREATE TABLE IF NOT EXISTS bci_calculation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_id uuid REFERENCES beaches(id),
  calculation_method text DEFAULT 'image_analysis',
  input_data jsonb NOT NULL,
  calculated_score integer NOT NULL CHECK (calculated_score >= 0 AND calculated_score <= 100),
  factors jsonb NOT NULL,
  image_analysis_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bci_image_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE bci_calculation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Image analysis is viewable by everyone"
  ON bci_image_analysis FOR SELECT
  USING (true);

CREATE POLICY "Users can upload images for analysis"
  ON bci_image_analysis FOR INSERT
  WITH CHECK (true);

CREATE POLICY "BCI calculation logs are viewable by everyone"
  ON bci_calculation_logs FOR SELECT
  USING (true);

-- Create function to process image and calculate BCI
CREATE OR REPLACE FUNCTION process_image_for_bci(
  p_beach_id uuid,
  p_volunteer_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_image_url text
)
RETURNS uuid AS $$
DECLARE
  analysis_id uuid;
  mock_waste_density integer;
  mock_debris_types text[];
  mock_confidence numeric;
BEGIN
  -- Insert image analysis record
  INSERT INTO bci_image_analysis (
    beach_id,
    volunteer_id,
    event_id,
    image_url,
    analysis_status
  ) VALUES (
    p_beach_id,
    p_volunteer_id,
    p_event_id,
    p_image_url,
    'processing'
  ) RETURNING id INTO analysis_id;

  -- Simulate image analysis (in real implementation, this would call an ML model)
  -- Generate mock results for demonstration
  mock_waste_density := (RANDOM() * 100)::integer;
  mock_debris_types := ARRAY['plastic', 'glass', 'metal', 'organic'];
  mock_confidence := (RANDOM() * 40 + 60)::numeric(5,2); -- 60-100% confidence

  -- Update with analysis results
  UPDATE bci_image_analysis SET
    analysis_status = 'completed',
    analysis_results = jsonb_build_object(
      'waste_density', mock_waste_density,
      'debris_distribution', jsonb_build_object(
        'plastic', (RANDOM() * 50)::integer,
        'glass', (RANDOM() * 30)::integer,
        'metal', (RANDOM() * 20)::integer,
        'organic', (RANDOM() * 40)::integer
      ),
      'image_quality', 'good',
      'processing_time_ms', (RANDOM() * 2000 + 500)::integer
    ),
    waste_density_score = mock_waste_density,
    debris_types = mock_debris_types,
    confidence_score = mock_confidence,
    analyzed_at = NOW()
  WHERE id = analysis_id;

  -- Trigger BCI recalculation for the beach
  PERFORM calculate_bci_with_image_data(p_beach_id);

  RETURN analysis_id;
END;
$$ LANGUAGE plpgsql;

-- Create enhanced BCI calculation function that includes image analysis
CREATE OR REPLACE FUNCTION calculate_bci_with_image_data(beach_uuid uuid)
RETURNS integer AS $$
DECLARE
  recent_events_count integer;
  avg_waste_per_event numeric;
  days_since_last_cleanup integer;
  volunteer_participation numeric;
  image_analysis_score numeric;
  recent_image_count integer;
  base_score integer := 50;
  final_score integer;
  calculation_factors jsonb;
  recent_image_ids uuid[];
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

  -- Get recent image analysis data (last 7 days)
  SELECT 
    COUNT(*),
    COALESCE(AVG(waste_density_score), 50),
    ARRAY_AGG(id)
  INTO 
    recent_image_count,
    image_analysis_score,
    recent_image_ids
  FROM bci_image_analysis
  WHERE beach_id = beach_uuid
    AND analysis_status = 'completed'
    AND created_at >= NOW() - INTERVAL '7 days';

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
  
  -- Apply image analysis score (if available)
  IF recent_image_count > 0 THEN
    -- Image analysis score is inverted (high waste density = low cleanliness)
    final_score := final_score + ((100 - image_analysis_score) * 0.3)::integer;
  END IF;
  
  -- Ensure score is between 0 and 100
  final_score := GREATEST(0, LEAST(100, final_score));
  
  -- Build calculation factors
  calculation_factors := jsonb_build_object(
    'recent_events_count', recent_events_count,
    'avg_waste_per_event', avg_waste_per_event,
    'days_since_last_cleanup', days_since_last_cleanup,
    'volunteer_participation', volunteer_participation,
    'image_analysis_score', image_analysis_score,
    'recent_image_count', recent_image_count,
    'calculation_method', 'enhanced_with_images',
    'calculated_at', NOW()
  );
  
  -- Insert into beach_cleanliness_index
  INSERT INTO beach_cleanliness_index (beach_id, score, factors)
  VALUES (beach_uuid, final_score, calculation_factors);
  
  -- Log the calculation
  INSERT INTO bci_calculation_logs (
    beach_id,
    calculation_method,
    input_data,
    calculated_score,
    factors,
    image_analysis_ids
  ) VALUES (
    beach_uuid,
    'image_analysis_enhanced',
    jsonb_build_object(
      'events_count', recent_events_count,
      'waste_data', avg_waste_per_event,
      'image_count', recent_image_count
    ),
    final_score,
    calculation_factors,
    COALESCE(recent_image_ids, ARRAY[]::uuid[])
  );
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Create function to simulate image upload and analysis
CREATE OR REPLACE FUNCTION simulate_image_analysis_upload(
  p_beach_name text,
  p_volunteer_email text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  beach_record RECORD;
  volunteer_record RECORD;
  analysis_id uuid;
  mock_image_url text;
  result jsonb;
BEGIN
  -- Get beach by name
  SELECT * INTO beach_record FROM beaches WHERE name = p_beach_name LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Beach not found');
  END IF;
  
  -- Get volunteer if email provided
  IF p_volunteer_email IS NOT NULL THEN
    SELECT * INTO volunteer_record FROM volunteers WHERE email = p_volunteer_email LIMIT 1;
  END IF;
  
  -- Generate mock image URL
  mock_image_url := 'https://example.com/beach-images/' || gen_random_uuid() || '.jpg';
  
  -- Process the image
  analysis_id := process_image_for_bci(
    beach_record.id,
    volunteer_record.id,
    NULL,
    mock_image_url
  );
  
  -- Return result
  SELECT jsonb_build_object(
    'analysis_id', analysis_id,
    'beach_name', beach_record.name,
    'image_url', mock_image_url,
    'status', 'completed'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample image analysis data
DO $$
DECLARE
  beach_record RECORD;
BEGIN
  FOR beach_record IN SELECT * FROM beaches LOOP
    -- Simulate 2-3 recent image analyses per beach
    FOR i IN 1..3 LOOP
      PERFORM simulate_image_analysis_upload(beach_record.name);
    END LOOP;
  END LOOP;
END $$;

-- Update all beach cleanliness indices with new calculation method
SELECT update_all_beach_cleanliness_indices();