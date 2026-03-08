/*
  # Create initial schema for Arcade AI

  1. New Tables
    - `users` table for user authentication (handled by Supabase Auth)
    - `games` table for game metadata
      - `id` (uuid, primary key)
      - `slug` (text, unique identifier for games)
      - `name` (text, display name)
      - `cover_url` (text, optional cover image)
      - `created_at` (timestamp)
    - `versions` table for game code snapshots
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key to games)
      - `code_snapshot` (jsonb, stores game state/code)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
    - `scores` table for player scores
      - `id` (uuid, primary key)
      - `version_id` (uuid, foreign key to versions)
      - `user_id` (uuid, foreign key to auth.users)
      - `score` (integer)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to games and leaderboards
*/

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  cover_url text,
  created_at timestamptz DEFAULT now()
);

-- Create versions table
CREATE TABLE IF NOT EXISTS versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  code_snapshot jsonb NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES versions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL DEFAULT 0,
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Games policies (public read, authenticated write)
CREATE POLICY "Anyone can view games"
  ON games
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update games they created"
  ON games
  FOR UPDATE
  TO authenticated
  USING (true);

-- Versions policies
CREATE POLICY "Anyone can view versions"
  ON versions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create versions"
  ON versions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own versions"
  ON versions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Scores policies
CREATE POLICY "Anyone can view scores"
  ON scores
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create scores"
  ON scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial games
INSERT INTO games (slug, name, cover_url) VALUES
  ('snake', 'AI Snake', 'https://images.pexels.com/photos/194094/pexels-photo-194094.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('tetris', 'Neural Tetris', 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('space-shooter', 'Cosmic Defender', 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT (slug) DO NOTHING;