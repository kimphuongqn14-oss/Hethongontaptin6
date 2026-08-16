export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  name: string;
  role: UserRole;
  classGroup: string;
  avatar: string;
  isLoggedIn: boolean;
  username?: string;
  password?: string;
}

export interface StudentUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  classGroup: string;
  avatar: string;
  registeredAt: string;
  lastLoginAt: string;
  status: 'Hoạt động' | 'Tạm khóa';
}

export type QuestionLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao' | string;

export interface MCQQuestion {
  id: number;
  lessonId: number;
  chapterId: number;
  level: QuestionLevel;
  question: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
  imageUrl?: string;
}

export interface EssayQuestion {
  id: number;
  lessonId: number;
  chapterId: number;
  title: string;
  question: string;
  hint: string;
  sampleAnswer: string;
  imageUrl?: string;
}

export interface AttemptRecord {
  id: string;
  date: string;
  mode: string;
  correctCount: number;
  totalQuestions: number;
  score: string;
  rank: string;
  studentName?: string;
  classGroup?: string;
  avatar?: string;
}

export interface MindmapNode {
  title: string;
  desc: string;
}

export interface Chapter {
  id: number;
  title: string;
  icon: string;
  summary: string;
  mindmapNodes: MindmapNode[];
}

export interface Lesson {
  id: number;
  chapterId: number;
  title: string;
  desc: string;
  keyPoints: string[];
  keywords: string[];
}

export interface ExamAttachment {
  id: string;
  name: string;
  title: string;
  fileType: 'pdf' | 'docx' | 'doc' | 'image' | 'txt' | 'other';
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  targetChapters: number[];
  description: string;
  dataUrl?: string;
  textContent?: string;
  durationMinutes?: number;
  totalPoints?: number;
}

export type TabId =
  | 'home'
  | 'lessons'
  | 'chapters'
  | 'quiz-setup'
  | 'quiz-player'
  | 'quiz-result'
  | 'essay'
  | 'mock-exam'
  | 'stats'
  | 'manage-questions'
  | 'ai-assistant'
  | 'guide';
