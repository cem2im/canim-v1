-- Run this in Supabase Dashboard → SQL Editor
-- Project: xolpnfcgvmolpbplwcir

CREATE TABLE IF NOT EXISTS feedback (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now(),
  rating        integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       text,
  page          text,
  app_version   text        DEFAULT 'v3.0',
  user_age      integer,
  user_sex      text,
  disease_count integer
);

-- Allow anyone to insert (anon key)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_insert" ON feedback
  FOR INSERT WITH CHECK (true);

-- Only service role can read (keeps data private)
CREATE POLICY "allow_service_read" ON feedback
  FOR SELECT USING (auth.role() = 'service_role');
