-- ============================================================
-- SCRIPT KHOI TAO CO SO DU LIEU SUPABASE CHO WEBSITE TIN HOC 6
-- Project URL: https://pgdrzhfeqfrtdbgyrhtb.supabase.co
-- ============================================================

-- 1. BANG CAU HOI TRAC NGHIEM (mcq_questions)
CREATE TABLE IF NOT EXISTS public.mcq_questions (
  id BIGINT PRIMARY KEY,
  lesson_id INT NOT NULL,
  chapter_id INT NOT NULL,
  level VARCHAR(50) DEFAULT 'Thông hiểu',
  question TEXT NOT NULL,
  image_url TEXT,
  options JSONB NOT NULL,
  correct_answer INT NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BANG CAU HOI TU LUAN (essay_questions)
CREATE TABLE IF NOT EXISTS public.essay_questions (
  id BIGINT PRIMARY KEY,
  lesson_id INT NOT NULL,
  chapter_id INT NOT NULL,
  title TEXT,
  question TEXT NOT NULL,
  image_url TEXT,
  hint TEXT,
  sample_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BANG HOC SINH / NGUOI DUNG (students)
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT '123456',
  name TEXT NOT NULL,
  class_group TEXT DEFAULT 'Lớp 6A',
  avatar TEXT DEFAULT '🎓',
  registered_at TEXT,
  last_login_at TEXT,
  status TEXT DEFAULT 'Hoạt động',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BANG LICH SU LAM BAI (attempt_records)
CREATE TABLE IF NOT EXISTS public.attempt_records (
  id TEXT PRIMARY KEY,
  date TEXT,
  mode TEXT,
  correct_count INT DEFAULT 0,
  total_questions INT DEFAULT 10,
  score TEXT DEFAULT '0.0',
  rank TEXT DEFAULT 'Đạt',
  student_name TEXT,
  class_group TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHINH SACH BAO MAT RLS (ROW LEVEL SECURITY)
ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_records ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc / ghi dữ liệu công khai (Anonymously Accessible)
DROP POLICY IF EXISTS "Public access mcq" ON public.mcq_questions;
CREATE POLICY "Public access mcq" ON public.mcq_questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access essay" ON public.essay_questions;
CREATE POLICY "Public access essay" ON public.essay_questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access students" ON public.students;
CREATE POLICY "Public access students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access history" ON public.attempt_records;
CREATE POLICY "Public access history" ON public.attempt_records FOR ALL USING (true) WITH CHECK (true);
