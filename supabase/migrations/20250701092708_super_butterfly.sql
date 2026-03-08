/*
  # Update database schema to match current structure

  1. New Tables
    - Update `games` table structure to match current schema
    - Update `game_scores` table (renamed from `scores`)
    - Add `game_modifications` table
    - Add `users` table if not exists

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Create indexes for performance

  3. Functions
    - Add trigger function for updating timestamps
*/

-- Create users table if it doesn't exist (Supabase auth handles this, but we need it for foreign keys)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create or update games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  game_type text NOT NULL CHECK (game_type = ANY (ARRAY['snake'::text, 'tetris'::text, 'space-shooter'::text])),
  color text DEFAULT '#6366f1'::text NOT NULL,
  is_modified boolean DEFAULT false,
  original_id uuid REFERENCES games(id),
  modification_count integer DEFAULT 0,
  game_code text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on games
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create game_scores table (renamed from scores)
CREATE TABLE IF NOT EXISTS game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  score integer DEFAULT 0 NOT NULL,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on game_scores
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Create game_modifications table
CREATE TABLE IF NOT EXISTS game_modifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  original_game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  description text NOT NULL,
  modification_data jsonb DEFAULT '{}'::jsonb,
  ai_prompt text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on game_modifications
ALTER TABLE game_modifications ENABLE ROW LEVEL SECURITY;

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for games table
DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_created_by ON games(created_by);
CREATE INDEX IF NOT EXISTS idx_games_game_type ON games(game_type);
CREATE INDEX IF NOT EXISTS idx_games_is_modified ON games(is_modified);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_modifications_game_id ON game_modifications(game_id);

-- RLS Policies for games table
CREATE POLICY "Games are viewable by everyone"
  ON games
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own games"
  ON games
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for game_scores table
CREATE POLICY "Game scores are viewable by everyone"
  ON game_scores
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert game scores"
  ON game_scores
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own scores"
  ON game_scores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for game_modifications table
CREATE POLICY "Game modifications are viewable by everyone"
  ON game_modifications
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create modifications"
  ON game_modifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own modifications"
  ON game_modifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);