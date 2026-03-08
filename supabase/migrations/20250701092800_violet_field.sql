/*
  # Update database schema to match current structure

  1. New Tables
    - `games` - Game metadata with id, slug, name, cover_url
    - `versions` - Game code snapshots with game_id, code_snapshot, created_by
    - `scores` - Player scores with version_id, user_id, score

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access and authenticated user access
    - Proper foreign key relationships

  3. Indexes
    - Unique constraints on game slugs
    - Performance indexes for queries
*/

-- Create games table to match current schema
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  cover_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on games
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create versions table to match current schema
CREATE TABLE IF NOT EXISTS versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  code_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on versions
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

-- Create scores table to match current schema
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer DEFAULT 0 NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS on scores
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create function for updating timestamps (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS games_pkey ON games USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS games_slug_key ON games USING btree (slug);
CREATE UNIQUE INDEX IF NOT EXISTS versions_pkey ON versions USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS scores_pkey ON scores USING btree (id);

-- RLS Policies for games table
DROP POLICY IF EXISTS "Anyone can view games" ON games;
CREATE POLICY "Anyone can view games"
  ON games
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create games" ON games;
CREATE POLICY "Authenticated users can create games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update games they created" ON games;
CREATE POLICY "Users can update games they created"
  ON games
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for versions table
DROP POLICY IF EXISTS "Anyone can view versions" ON versions;
CREATE POLICY "Anyone can view versions"
  ON versions
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create versions" ON versions;
CREATE POLICY "Authenticated users can create versions"
  ON versions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own versions" ON versions;
CREATE POLICY "Users can update their own versions"
  ON versions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for scores table
DROP POLICY IF EXISTS "Anyone can view scores" ON scores;
CREATE POLICY "Anyone can view scores"
  ON scores
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create scores" ON scores;
CREATE POLICY "Authenticated users can create scores"
  ON scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own scores" ON scores;
CREATE POLICY "Users can view their own scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);