import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pgdrzhfeqfrtdbgyrhtb.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZHJ6aGZlcWZydGRiZ3lyaHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0OTg0OSwiZXhwIjoyMTAyMDI1ODQ5fQ.g-YZyNbjdLU4tIKGI0CxGj1i0V5EYH24xeRcEVcnqOw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SQL_SCHEMA = `
-- 1. MCQ Questions Table
CREATE TABLE IF NOT EXISTS public.mcq_questions (
  id BIGINT PRIMARY KEY,
  lesson_id INT,
  chapter_id INT,
  level VARCHAR(50),
  question TEXT NOT NULL,
  image_url TEXT,
  options JSONB NOT NULL,
  correct_answer INT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Essay Questions Table
CREATE TABLE IF NOT EXISTS public.essay_questions (
  id BIGINT PRIMARY KEY,
  lesson_id INT,
  chapter_id INT,
  title TEXT,
  question TEXT NOT NULL,
  image_url TEXT,
  hint TEXT,
  sample_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  class_group TEXT,
  avatar TEXT,
  registered_at TEXT,
  last_login_at TEXT,
  status TEXT DEFAULT 'Hoạt động',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attempt History Table
CREATE TABLE IF NOT EXISTS public.attempt_records (
  id TEXT PRIMARY KEY,
  date TEXT,
  mode TEXT,
  correct_count INT,
  total_questions INT,
  score TEXT,
  rank TEXT,
  student_name TEXT,
  class_group TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Row Level Security policies for anon/public access
ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_records ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access
DROP POLICY IF EXISTS "Public access mcq" ON public.mcq_questions;
CREATE POLICY "Public access mcq" ON public.mcq_questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access essay" ON public.essay_questions;
CREATE POLICY "Public access essay" ON public.essay_questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access students" ON public.students;
CREATE POLICY "Public access students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access history" ON public.attempt_records;
CREATE POLICY "Public access history" ON public.attempt_records FOR ALL USING (true) WITH CHECK (true);
`;

async function testRpc() {
  console.log('Testing SQL schema execution...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ sql: SQL_SCHEMA })
  });

  const text = await res.text();
  console.log('RPC Status:', res.status, text);
}

testRpc().catch(console.error);
