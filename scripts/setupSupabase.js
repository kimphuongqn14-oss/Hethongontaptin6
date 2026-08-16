import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pgdrzhfeqfrtdbgyrhtb.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZHJ6aGZlcWZydGRiZ3lyaHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0OTg0OSwiZXhwIjoyMTAyMDI1ODQ5fQ.g-YZyNbjdLU4tIKGI0CxGj1i0V5EYH24xeRcEVcnqOw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runSetup() {
  console.log('Testing Supabase Service Role connection...');

  // Try fetching tables
  const { data: mcqData, error: mcqErr } = await supabase.from('mcq_questions').select('id').limit(1);
  console.log('MCQ query result:', { mcqData, mcqErr });

  const { data: essayData, error: essayErr } = await supabase.from('essay_questions').select('id').limit(1);
  console.log('Essay query result:', { essayData, essayErr });

  const { data: studentData, error: studentErr } = await supabase.from('students').select('id').limit(1);
  console.log('Student query result:', { studentData, studentErr });

  const { data: historyData, error: historyErr } = await supabase.from('attempt_records').select('id').limit(1);
  console.log('History query result:', { historyData, historyErr });
}

runSetup().catch(console.error);
