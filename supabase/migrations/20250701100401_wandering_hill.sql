/*
  # Create mod_logs table for chat interaction logging

  1. New Tables
    - `mod_logs`
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key to games)
      - `version_id` (uuid, foreign key to versions, nullable)
      - `user_prompt` (text, user's chat input)
      - `ai_response` (text, AI's response)
      - `result_type` (text, 'simple' or 'complex')
      - `timestamp` (timestamptz, when interaction occurred)
      - `created_at` (timestamptz, record creation time)

  2. Security
    - Enable RLS on `mod_logs` table
    - Add policy for public read access to mod logs
    - Add policy for authenticated users to insert mod logs

  3. Functions
    - Create `log_chat_interaction` function for logging chat interactions
    - Grant execute permissions to authenticated and anonymous users

  4. Performance
    - Add indexes on game_id and timestamp for efficient queries
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
  p_game_id uuid,
  p_user_prompt text,
  p_ai_response text,
  p_result_type text,
  p_version_id uuid DEFAULT NULL,
  p_timestamp timestamptz DEFAULT now()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO mod_logs (game_id, version_id, user_prompt, ai_response, result_type, timestamp)
  VALUES (p_game_id, p_version_id, p_user_prompt, p_ai_response, p_result_type, p_timestamp);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION log_chat_interaction TO authenticated;
GRANT EXECUTE ON FUNCTION log_chat_interaction TO anon;