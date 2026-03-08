/*
  # Add chat interaction logging

  1. New Tables
    - `mod_logs` - Stores AI chat interactions and modifications
  
  2. Functions
    - `log_chat_interaction` - RPC function to log chat interactions
  
  3. Security
    - Enable RLS on mod_logs table
    - Add policies for authenticated users
*/

-- Create mod_logs table for chat interaction logging
CREATE TABLE IF NOT EXISTS mod_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  version_id uuid REFERENCES versions(id) ON DELETE SET NULL,
  user_prompt text NOT NULL,
  ai_response text NOT NULL,
  result_type text NOT NULL CHECK (result_type IN ('simple', 'complex')),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on mod_logs
ALTER TABLE mod_logs ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS mod_logs_game_id_idx ON mod_logs(game_id);
CREATE INDEX IF NOT EXISTS mod_logs_timestamp_idx ON mod_logs(timestamp);

-- RLS Policies for mod_logs table
CREATE POLICY "Anyone can view mod logs"
  ON mod_logs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can insert mod logs"
  ON mod_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create RPC function for logging chat interactions
CREATE OR REPLACE FUNCTION log_chat_interaction(
  game_id uuid,
  version_id uuid DEFAULT NULL,
  user_prompt text,
  ai_response text,
  result_type text,
  timestamp timestamptz DEFAULT now()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO mod_logs (game_id, version_id, user_prompt, ai_response, result_type, timestamp)
  VALUES (game_id, version_id, user_prompt, ai_response, result_type, timestamp);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION log_chat_interaction TO authenticated;
GRANT EXECUTE ON FUNCTION log_chat_interaction TO anon;