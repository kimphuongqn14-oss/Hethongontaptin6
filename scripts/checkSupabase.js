import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pgdrzhfeqfrtdbgyrhtb.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZHJ6aGZlcWZydGRiZ3lyaHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDk4NDksImV4cCI6MjEwMjAyNTg0OX0.90tcXV8cOHabFuBOYSvBswNwQC98mcFpXu3jdAAF6O0';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZHJ6aGZlcWZydGRiZ3lyaHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0OTg0OSwiZXhwIjoyMTAyMDI1ODQ5fQ.g-YZyNbjdLU4tIKGI0CxGj1i0V5EYH24xeRcEVcnqOw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function inspectDatabase() {
  console.log('=== KIỂM TRA KẾT NỐI VÀ DỮ LIỆU TẠI SUPABASE ===\n');

  // 1. Table mcq_questions
  const { data: mcq, error: mcqErr } = await supabase.from('mcq_questions').select('*');
  console.log('--- 1. BẢNG TRẮC NGHIỆM (mcq_questions) ---');
  if (mcqErr) {
    console.log('Lỗi / Chưa tạo bảng:', mcqErr.message);
  } else {
    console.log(`Số lượng bản ghi: ${mcq.length}`);
    console.log(JSON.stringify(mcq, null, 2));
  }

  // 2. Table essay_questions
  const { data: essay, error: essayErr } = await supabase.from('essay_questions').select('*');
  console.log('\n--- 2. BẢNG TỰ LUẬN (essay_questions) ---');
  if (essayErr) {
    console.log('Lỗi / Chưa tạo bảng:', essayErr.message);
  } else {
    console.log(`Số lượng bản ghi: ${essay.length}`);
    console.log(JSON.stringify(essay, null, 2));
  }

  // 3. Table students
  const { data: students, error: studentErr } = await supabase.from('students').select('*');
  console.log('\n--- 3. BẢNG HỌC SINH (students) ---');
  if (studentErr) {
    console.log('Lỗi / Chưa tạo bảng:', studentErr.message);
  } else {
    console.log(`Số lượng bản ghi: ${students.length}`);
    console.log(JSON.stringify(students, null, 2));
  }

  // 4. Table attempt_records
  const { data: history, error: historyErr } = await supabase.from('attempt_records').select('*');
  console.log('\n--- 4. BẢNG LỊCH SỬ LÀM BÀI (attempt_records) ---');
  if (historyErr) {
    console.log('Lỗi / Chưa tạo bảng:', historyErr.message);
  } else {
    console.log(`Số lượng bản ghi: ${history.length}`);
    console.log(JSON.stringify(history, null, 2));
  }
}

inspectDatabase().catch(console.error);
