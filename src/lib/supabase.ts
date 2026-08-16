import { createClient } from '@supabase/supabase-js';
import { MCQQuestion, EssayQuestion, StudentUser, AttemptRecord } from '../types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://pgdrzhfeqfrtdbgyrhtb.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZHJ6aGZlcWZydGRiZ3lyaHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDk4NDksImV4cCI6MjEwMjAyNTg0OX0.90tcXV8cOHabFuBOYSvBswNwQC98mcFpXu3jdAAF6O0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Table Names
export const TABLES = {
  MCQ: 'mcq_questions',
  ESSAY: 'essay_questions',
  STUDENTS: 'students',
  HISTORY: 'attempt_records',
};

// Helper to test Supabase connection status
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { error } = await supabase.from(TABLES.MCQ).select('id').limit(1);
    if (error && error.code === 'PGRST301') {
      return { connected: false, message: 'Lỗi xác thực API Key' };
    }
    // If table doesn't exist yet (PGRST204 or PGRST116), connection itself works
    return { connected: true, message: 'Đã kết nối thành công với Supabase Database' };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Không thể kết nối Supabase' };
  }
}

// === MCQ QUESTIONS API ===
export async function fetchMCQQuestions(): Promise<MCQQuestion[] | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.MCQ)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase fetchMCQQuestions warning:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((item: any) => ({
      id: Number(item.id),
      lessonId: Number(item.lesson_id),
      chapterId: Number(item.chapter_id),
      level: item.level,
      question: item.question,
      imageUrl: item.image_url || undefined,
      options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options,
      correctAnswer: Number(item.correct_answer),
      explanation: item.explanation,
    }));
  } catch (err) {
    console.warn('Supabase fetchMCQQuestions error:', err);
    return null;
  }
}

export async function upsertMCQQuestion(q: MCQQuestion): Promise<boolean> {
  try {
    const payload = {
      id: q.id,
      lesson_id: q.lessonId,
      chapter_id: q.chapterId,
      level: q.level,
      question: q.question,
      image_url: q.imageUrl || null,
      options: JSON.stringify(q.options),
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
    };

    const { error } = await supabase.from(TABLES.MCQ).upsert(payload);
    if (error) {
      console.warn('Supabase upsertMCQQuestion error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsertMCQQuestion exception:', err);
    return false;
  }
}

export async function deleteMCQQuestion(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from(TABLES.MCQ).delete().eq('id', id);
    if (error) console.warn('Supabase deleteMCQQuestion error:', error.message);
    return !error;
  } catch (err) {
    return false;
  }
}

// === ESSAY QUESTIONS API ===
export async function fetchEssayQuestions(): Promise<EssayQuestion[] | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.ESSAY)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase fetchEssayQuestions warning:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((item: any) => ({
      id: Number(item.id),
      lessonId: Number(item.lesson_id),
      chapterId: Number(item.chapter_id),
      title: item.title,
      question: item.question,
      imageUrl: item.image_url || undefined,
      hint: item.hint,
      sampleAnswer: item.sample_answer,
    }));
  } catch (err) {
    console.warn('Supabase fetchEssayQuestions error:', err);
    return null;
  }
}

export async function upsertEssayQuestion(q: EssayQuestion): Promise<boolean> {
  try {
    const payload = {
      id: q.id,
      lesson_id: q.lessonId,
      chapter_id: q.chapterId,
      title: q.title,
      question: q.question,
      image_url: q.imageUrl || null,
      hint: q.hint,
      sample_answer: q.sampleAnswer,
    };

    const { error } = await supabase.from(TABLES.ESSAY).upsert(payload);
    if (error) {
      console.warn('Supabase upsertEssayQuestion error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsertEssayQuestion exception:', err);
    return false;
  }
}

export async function deleteEssayQuestion(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from(TABLES.ESSAY).delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

// === STUDENTS API ===
export async function fetchStudents(): Promise<StudentUser[] | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.STUDENTS)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetchStudents warning:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((item: any) => ({
      id: item.id,
      username: item.username,
      password: item.password,
      name: item.name,
      classGroup: item.class_group,
      avatar: item.avatar,
      registeredAt: item.registered_at,
      lastLoginAt: item.last_login_at,
      status: item.status,
    }));
  } catch (err) {
    console.warn('Supabase fetchStudents error:', err);
    return null;
  }
}

export async function upsertStudent(student: StudentUser): Promise<boolean> {
  try {
    const payload = {
      id: student.id,
      username: student.username,
      password: student.password,
      name: student.name,
      class_group: student.classGroup,
      avatar: student.avatar,
      registered_at: student.registeredAt,
      last_login_at: student.lastLoginAt,
      status: student.status,
    };

    const { error } = await supabase.from(TABLES.STUDENTS).upsert(payload);
    if (error) {
      console.warn('Supabase upsertStudent error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteStudent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(TABLES.STUDENTS).delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

// === ATTEMPT HISTORY RECORDS API ===
export async function fetchAttemptHistory(): Promise<AttemptRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.HISTORY)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchAttemptHistory warning:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((item: any) => ({
      id: item.id,
      date: item.date,
      mode: item.mode,
      correctCount: Number(item.correct_count),
      totalQuestions: Number(item.total_questions),
      score: item.score,
      rank: item.rank,
      studentName: item.student_name,
      classGroup: item.class_group,
      avatar: item.avatar,
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertAttemptHistory(record: AttemptRecord): Promise<boolean> {
  try {
    const payload = {
      id: record.id,
      date: record.date,
      mode: record.mode,
      correct_count: record.correctCount,
      total_questions: record.totalQuestions,
      score: record.score,
      rank: record.rank,
      student_name: record.studentName,
      class_group: record.classGroup,
      avatar: record.avatar,
    };

    const { error } = await supabase.from(TABLES.HISTORY).upsert(payload);
    if (error) {
      console.warn('Supabase upsertAttemptHistory error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function clearAllAttemptHistory(): Promise<boolean> {
  try {
    const { error } = await supabase.from(TABLES.HISTORY).delete().neq('id', '0');
    return !error;
  } catch (err) {
    return false;
  }
}
