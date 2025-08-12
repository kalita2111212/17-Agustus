/*
  # Create Competition Registration System

  1. New Tables
    - `competitions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text) - child, adult_individual, adult_group
      - `description` (text, optional)
      - `max_participants` (integer, default 50)
      - `created_at` (timestamp)
    
    - `participants`
      - `id` (uuid, primary key)
      - `block` (text)
      - `house_number` (text)
      - `registration_date` (timestamp)
      - `created_at` (timestamp)
    
    - `participant_competitions`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, foreign key)
      - `competition_id` (uuid, foreign key)
      - `participant_name` (text)
      - `participant_age` (integer, optional)
      - `additional_participant_name` (text, optional)
      - `additional_participant_age` (integer, optional)
      - `group_members` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read and insert access
*/

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('child', 'adult_individual', 'adult_group')),
  description text,
  max_participants integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block text NOT NULL,
  house_number text NOT NULL,
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create participant_competitions junction table
CREATE TABLE IF NOT EXISTS participant_competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  participant_age integer,
  additional_participant_name text,
  additional_participant_age integer,
  group_members text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_competitions ENABLE ROW LEVEL SECURITY;

-- Create policies for competitions
CREATE POLICY "Anyone can read competitions"
  ON competitions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert competitions"
  ON competitions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for participants
CREATE POLICY "Anyone can read participants"
  ON participants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert participants"
  ON participants
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for participant_competitions
CREATE POLICY "Anyone can read participant competitions"
  ON participant_competitions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert participant competitions"
  ON participant_competitions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert initial competition data
INSERT INTO competitions (name, category, description) VALUES
  ('Lomba Bendera', 'child', 'Lomba menangkap bendera untuk anak-anak'),
  ('Lomba Kelereng', 'child', 'Lomba kelereng tradisional untuk anak-anak'),
  ('Lomba Makan Kerupuk', 'child', 'Lomba makan kerupuk tanpa tangan untuk anak-anak'),
  ('Lomba Hias Sepeda (Karnaval)', 'child', 'Lomba menghias sepeda untuk karnaval anak-anak'),
  ('Lomba Balap Karung', 'adult_individual', 'Lomba balap karung untuk dewasa perorangan'),
  ('Lomba Memecahkan Balon', 'adult_individual', 'Lomba memecahkan balon untuk dewasa perorangan'),
  ('Lomba Joget Balon', 'adult_group', 'Lomba joget balon untuk kelompok dewasa'),
  ('Lomba Memindahkan Tepung', 'adult_group', 'Lomba memindahkan tepung untuk kelompok dewasa')
ON CONFLICT DO NOTHING;