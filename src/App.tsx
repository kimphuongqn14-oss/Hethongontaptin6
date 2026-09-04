import React, { useState, useEffect } from 'react';
import {
  TabId,
  UserProfile,
  MCQQuestion,
  EssayQuestion,
  AttemptRecord,
  StudentUser,
  ExamAttachment,
} from './types';
import { DEFAULT_QUESTION_BANK_MCQ, DEFAULT_QUESTION_BANK_ESSAY } from './data/questionBank';
import { DEFAULT_EXAM_ATTACHMENTS } from './data/defaultExamAttachments';
import { isAudioEnabled, toggleAudioState } from './utils/audio';
import {
  checkSupabaseConnection,
  fetchMCQQuestions,
  upsertMCQQuestion,
  deleteMCQQuestion,
  fetchEssayQuestions,
  upsertEssayQuestion,
  deleteEssayQuestion,
  fetchStudents,
  upsertStudent,
  deleteStudent,
  fetchAttemptHistory,
  upsertAttemptHistory,
  clearAllAttemptHistory,
} from './lib/supabase';

import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { TabHome } from './components/TabHome';
import { TabLessons } from './components/TabLessons';
import { TabChapters } from './components/TabChapters';
import { TabQuiz } from './components/TabQuiz';
import { TabEssay } from './components/TabEssay';
import { TabMockExam } from './components/TabMockExam';
import { TabStats } from './components/TabStats';
import { TabManageQuestions } from './components/TabManageQuestions';
import { TabAIAssistant } from './components/TabAIAssistant';
import { TabGuide } from './components/TabGuide';
import { LoginModal } from './components/LoginModal';
import { QuestionModal } from './components/QuestionModal';
import { LockedSystemOverlay } from './components/LockedSystemOverlay';
import { Footer } from './components/Footer';

const SAMPLE_STUDENTS: StudentUser[] = [
  {
    id: 'st-1',
    username: 'nguyenvanan',
    password: '123',
    name: 'Nguyễn Văn An',
    classGroup: 'Lớp 6A1',
    avatar: '🎓',
    registeredAt: '25/07/2026, 09:00:00',
    lastLoginAt: '31/07/2026, 08:30:15',
    status: 'Hoạt động',
  },
  {
    id: 'st-2',
    username: 'tranthibich',
    password: '123',
    name: 'Trần Thị Bích',
    classGroup: 'Lớp 6A1',
    avatar: '⭐',
    registeredAt: '26/07/2026, 10:15:00',
    lastLoginAt: '31/07/2026, 08:45:20',
    status: 'Hoạt động',
  },
  {
    id: 'st-3',
    username: 'lehoangcuong',
    password: '123',
    name: 'Lê Hoàng Cường',
    classGroup: 'Lớp 6A2',
    avatar: '🚀',
    registeredAt: '27/07/2026, 14:20:00',
    lastLoginAt: '31/07/2026, 09:12:00',
    status: 'Hoạt động',
  },
  {
    id: 'st-4',
    username: 'phamminhduc',
    password: '123',
    name: 'Phạm Minh Đức',
    classGroup: 'Lớp 6A3',
    avatar: '🤖',
    registeredAt: '28/07/2026, 08:00:00',
    lastLoginAt: '31/07/2026, 09:30:45',
    status: 'Hoạt động',
  },
  {
    id: 'st-5',
    username: 'vuthaohoa',
    password: '123',
    name: 'Vũ Thảo Hoa',
    classGroup: 'Lớp 6A4',
    avatar: '💻',
    registeredAt: '29/07/2026, 11:30:00',
    lastLoginAt: '31/07/2026, 10:05:10',
    status: 'Hoạt động',
  },
  {
    id: 'st-6',
    username: 'dangquochung',
    password: '123',
    name: 'Đặng Quốc Hùng',
    classGroup: 'Lớp 6A5',
    avatar: '🎓',
    registeredAt: '30/07/2026, 15:45:00',
    lastLoginAt: '31/07/2026, 10:20:00',
    status: 'Hoạt động',
  },
];

const SAMPLE_STUDENT_HISTORY: AttemptRecord[] = [
  {
    id: 'sample-1',
    date: '31/07/2026, 08:30:15',
    mode: 'Thi Thử Tổng Hợp',
    correctCount: 10,
    totalQuestions: 10,
    score: '10.0',
    rank: 'Xuất Sắc 🏆',
    studentName: 'Nguyễn Văn An',
    classGroup: 'Lớp 6A1',
    avatar: '🎓',
  },
  {
    id: 'sample-2',
    date: '31/07/2026, 08:45:20',
    mode: 'Trắc Nghiệm Bài 1',
    correctCount: 9,
    totalQuestions: 10,
    score: '9.0',
    rank: 'Giỏi ⭐',
    studentName: 'Trần Thị Bích',
    classGroup: 'Lớp 6A1',
    avatar: '⭐',
  },
  {
    id: 'sample-3',
    date: '31/07/2026, 09:12:00',
    mode: 'Thi Thử Tổng Hợp',
    correctCount: 8,
    totalQuestions: 10,
    score: '8.0',
    rank: 'Khá 👍',
    studentName: 'Lê Hoàng Cường',
    classGroup: 'Lớp 6A2',
    avatar: '🚀',
  },
  {
    id: 'sample-4',
    date: '31/07/2026, 09:30:45',
    mode: 'Trắc Nghiệm Chương 1',
    correctCount: 10,
    totalQuestions: 10,
    score: '10.0',
    rank: 'Xuất Sắc 🏆',
    studentName: 'Phạm Minh Đức',
    classGroup: 'Lớp 6A3',
    avatar: '🤖',
  },
  {
    id: 'sample-5',
    date: '31/07/2026, 10:05:10',
    mode: 'Trắc Nghiệm Bài 2',
    correctCount: 7,
    totalQuestions: 10,
    score: '7.0',
    rank: 'Khá 👍',
    studentName: 'Vũ Thảo Hoa',
    classGroup: 'Lớp 6A4',
    avatar: '💻',
  },
  {
    id: 'sample-6',
    date: '31/07/2026, 10:20:00',
    mode: 'Thi Thử Tổng Hợp',
    correctCount: 6,
    totalQuestions: 10,
    score: '6.0',
    rank: 'Đạt 👌',
    studentName: 'Đặng Quốc Hùng',
    classGroup: 'Lớp 6A5',
    avatar: '🎓',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [presenterMode, setPresenterMode] = useState<boolean>(false);
  const [audioActive, setAudioActive] = useState<boolean>(isAudioEnabled());

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('tinhoc6_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Học Sinh Khách',
      role: 'student',
      classGroup: 'Lớp 6A1',
      avatar: '🎓',
      isLoggedIn: false,
    };
  });

  // Question Banks
  const [mcqBank, setMcqBank] = useState<MCQQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('tinhoc6_mcq_custom');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_QUESTION_BANK_MCQ;
  });

  const [essayBank, setEssayBank] = useState<EssayQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('tinhoc6_essay_custom');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_QUESTION_BANK_ESSAY;
  });

  // History Records
  const [history, setHistory] = useState<AttemptRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tinhoc6_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SAMPLE_STUDENT_HISTORY;
  });

  // Students Directory Records
  const [students, setStudents] = useState<StudentUser[]>(() => {
    try {
      const saved = localStorage.getItem('tinhoc6_students');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SAMPLE_STUDENTS;
  });

  // Exam Attachments
  const [examAttachments, setExamAttachments] = useState<ExamAttachment[]>(() => {
    try {
      const saved = localStorage.getItem('tinhoc6_exam_attachments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_EXAM_ATTACHMENTS;
  });

  // Quiz Player state
  const [quizSubMode, setQuizSubMode] = useState<'setup' | 'player' | 'result'>('setup');
  const [quizQuestions, setQuizQuestions] = useState<MCQQuestion[]>([]);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [questionModalType, setQuestionModalType] = useState<'mcq' | 'essay'>('mcq');
  const [editQuestionId, setEditQuestionId] = useState<number | undefined>(undefined);

  // Supabase Initial Load & Auto Sync
  useEffect(() => {
    async function loadFromSupabase() {
      // 1. Fetch MCQ
      const dbMcq = await fetchMCQQuestions();
      if (dbMcq && dbMcq.length > 0) {
        setMcqBank(dbMcq);
      } else {
        // Seed initial MCQ to Supabase
        DEFAULT_QUESTION_BANK_MCQ.forEach((q) => upsertMCQQuestion(q));
      }

      // 2. Fetch Essay
      const dbEssay = await fetchEssayQuestions();
      if (dbEssay && dbEssay.length > 0) {
        setEssayBank(dbEssay);
      } else {
        // Seed initial Essay to Supabase
        DEFAULT_QUESTION_BANK_ESSAY.forEach((q) => upsertEssayQuestion(q));
      }

      // 3. Fetch Students
      const dbStudents = await fetchStudents();
      if (dbStudents && dbStudents.length > 0) {
        setStudents(dbStudents);
      } else {
        // Seed sample students
        SAMPLE_STUDENTS.forEach((st) => upsertStudent(st));
      }

      // 4. Fetch History
      const dbHistory = await fetchAttemptHistory();
      if (dbHistory && dbHistory.length > 0) {
        setHistory(dbHistory);
      } else {
        // Seed sample history
        SAMPLE_STUDENT_HISTORY.forEach((rec) => upsertAttemptHistory(rec));
      }
    }

    loadFromSupabase();
  }, []);

  // Persistence Effects for localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tinhoc6_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('tinhoc6_mcq_custom', JSON.stringify(mcqBank));
    } catch (e) {}
  }, [mcqBank]);

  useEffect(() => {
    try {
      localStorage.setItem('tinhoc6_essay_custom', JSON.stringify(essayBank));
    } catch (e) {}
  }, [essayBank]);

  useEffect(() => {
    try {
      localStorage.setItem('tinhoc6_history', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('tinhoc6_students', JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('tinhoc6_exam_attachments', JSON.stringify(examAttachments));
    } catch (e) {}
  }, [examAttachments]);

  // Handlers
  const handleSaveProfile = (profile: UserProfile) => {
    setCurrentUser(profile);

    // Save/update student in the student directory if role is student
    if (profile.role === 'student' && profile.name) {
      const now = new Date().toLocaleString('vi-VN');
      const usernameKey = profile.username || profile.name.toLowerCase().replace(/\s+/g, '');

      setStudents((prev) => {
        const existingIdx = prev.findIndex(
          (s) =>
            (s.username && s.username === usernameKey) ||
            s.name.toLowerCase() === profile.name.toLowerCase()
        );

        let updatedStudent: StudentUser;
        let nextStudents: StudentUser[];

        if (existingIdx >= 0) {
          updatedStudent = {
            ...prev[existingIdx],
            name: profile.name,
            classGroup: profile.classGroup,
            avatar: profile.avatar,
            password: profile.password || prev[existingIdx].password || '123456',
            lastLoginAt: now,
          };
          nextStudents = [...prev];
          nextStudents[existingIdx] = updatedStudent;
        } else {
          updatedStudent = {
            id: Date.now().toString(),
            username: usernameKey,
            password: profile.password || '123456',
            name: profile.name,
            classGroup: profile.classGroup,
            avatar: profile.avatar,
            registeredAt: now,
            lastLoginAt: now,
            status: 'Hoạt động',
          };
          nextStudents = [updatedStudent, ...prev];
        }

        // Sync to Supabase
        upsertStudent(updatedStudent);
        return nextStudents;
      });
    }
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    deleteStudent(id);
  };

  const handleClearStudents = () => {
    setStudents([]);
    localStorage.removeItem('tinhoc6_students');
    students.forEach((s) => deleteStudent(s.id));
  };

  const handleAddSampleStudents = () => {
    setStudents(SAMPLE_STUDENTS);
    SAMPLE_STUDENTS.forEach((st) => upsertStudent(st));
  };

  const handleLogout = () => {
    setCurrentUser({
      name: 'Học Sinh Khách',
      role: 'student',
      classGroup: 'Lớp 6A',
      avatar: '🎓',
      isLoggedIn: false,
    });
  };

  const handleTogglePresenter = () => {
    setPresenterMode((prev) => !prev);
  };

  const handleToggleAudio = () => {
    const newState = toggleAudioState();
    setAudioActive(newState);
  };

  const handleSaveAttemptRecord = (
    mode: string,
    correctCount: number,
    totalQuestions: number,
    score: string,
    rank: string
  ) => {
    const record: AttemptRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('vi-VN'),
      mode,
      correctCount,
      totalQuestions,
      score,
      rank,
      studentName: currentUser.name || 'Học Sinh Lớp 6',
      classGroup: currentUser.classGroup || 'Lớp 6A',
      avatar: currentUser.avatar || '🎓',
    };
    setHistory((prev) => [record, ...prev].slice(0, 100));
    upsertAttemptHistory(record);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('tinhoc6_history');
    clearAllAttemptHistory();
  };

  const handleAddSampleHistory = () => {
    setHistory(SAMPLE_STUDENT_HISTORY);
    SAMPLE_STUDENT_HISTORY.forEach((rec) => upsertAttemptHistory(rec));
  };

  const handleOpenQuestionModal = (type: 'mcq' | 'essay', id?: number) => {
    setQuestionModalType(type);
    setEditQuestionId(id);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (type: 'mcq' | 'essay', id: number) => {
    if (confirm(`Bạn có chắc chắn muốn XÓA câu hỏi #${id}? Thao tác này không thể hoàn tác.`)) {
      if (type === 'mcq') {
        setMcqBank((prev) => prev.filter((q) => q.id !== id));
        deleteMCQQuestion(id);
      } else {
        setEssayBank((prev) => prev.filter((q) => q.id !== id));
        deleteEssayQuestion(id);
      }
    }
  };

  const handleResetDefaultQuestions = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục lại Ngân hàng câu hỏi mặc định của hệ thống?')) {
      setMcqBank(DEFAULT_QUESTION_BANK_MCQ);
      setEssayBank(DEFAULT_QUESTION_BANK_ESSAY);
      DEFAULT_QUESTION_BANK_MCQ.forEach((q) => upsertMCQQuestion(q));
      DEFAULT_QUESTION_BANK_ESSAY.forEach((q) => upsertEssayQuestion(q));
    }
  };

  const handleImportQuestionsJSON = (mcqs: MCQQuestion[], essays: EssayQuestion[]) => {
    if (mcqs.length > 0) {
      setMcqBank(mcqs);
      mcqs.forEach((q) => upsertMCQQuestion(q));
    }
    if (essays.length > 0) {
      setEssayBank(essays);
      essays.forEach((q) => upsertEssayQuestion(q));
    }
  };

  const handleStartQuizForLesson = (lessonId: number) => {
    const lessonQuestions = mcqBank.filter((q) => q.lessonId === lessonId);
    let pool = lessonQuestions.length > 0 ? lessonQuestions : mcqBank;
    pool = [...pool].sort(() => Math.random() - 0.5);

    setQuizQuestions(pool);
    setQuizSubMode('player');
    setActiveTab('quiz-setup');
  };

  const handleStartGeneratedAIQuiz = (aiQuestions: MCQQuestion[]) => {
    setQuizQuestions(aiQuestions);
    setQuizSubMode('player');
    setActiveTab('quiz-setup');
  };

  const handleSaveAttachment = (attachment: ExamAttachment) => {
    setExamAttachments((prev) => {
      const idx = prev.findIndex((a) => a.id === attachment.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = attachment;
        return copy;
      }
      return [attachment, ...prev];
    });
  };

  const handleDeleteAttachment = (id: string) => {
    setExamAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleResetDefaultAttachments = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục lại danh sách đề thi đính kèm mặc định?')) {
      setExamAttachments(DEFAULT_EXAM_ATTACHMENTS);
    }
  };

  return (
    <div
      className={`bg-slate-100 text-slate-800 font-sans min-h-screen flex flex-col antialiased ${
        presenterMode ? 'text-lg text-slate-900 font-medium' : ''
      }`}
    >
      <Header
        currentUser={currentUser}
        presenterMode={presenterMode}
        audioEnabled={audioActive}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onTogglePresenter={handleTogglePresenter}
        onToggleAudio={handleToggleAudio}
      />

      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (!currentUser.isLoggedIn && tab !== 'home' && tab !== 'guide') {
            setIsLoginOpen(true);
          }
          setActiveTab(tab);
          if (tab === 'quiz-setup') setQuizSubMode('setup');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdmin={currentUser.role === 'admin'}
        isLoggedIn={currentUser.isLoggedIn}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {activeTab === 'home' && (
          <TabHome
            onSelectTab={setActiveTab}
            isLoggedIn={currentUser.isLoggedIn}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {/* Global Login Protection for Functional Tabs */}
        {!currentUser.isLoggedIn && activeTab !== 'home' && activeTab !== 'guide' ? (
          <LockedSystemOverlay
            onOpenLogin={() => setIsLoginOpen(true)}
            message="Bạn phải đăng nhập để sử dụng hệ thống"
          />
        ) : (
          <>
            {activeTab === 'lessons' && (
              <TabLessons
                onStartQuizForLesson={handleStartQuizForLesson}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === 'chapters' && (
              <TabChapters onStartQuizForLesson={handleStartQuizForLesson} />
            )}

            {(activeTab === 'quiz-setup' || activeTab === 'quiz-player' || activeTab === 'quiz-result') && (
              <TabQuiz
                questionBankMCQ={mcqBank}
                activeSubMode={quizSubMode}
                setActiveSubMode={setQuizSubMode}
                quizQuestions={quizQuestions}
                setQuizQuestions={setQuizQuestions}
                history={history}
                currentUser={currentUser}
                onSaveAttemptRecord={handleSaveAttemptRecord}
                onGenerateAIQuiz={() => setActiveTab('ai-assistant')}
              />
            )}

            {activeTab === 'essay' && (
              <TabEssay
                essayQuestions={essayBank}
                isAdminOrTeacher={currentUser.role === 'admin' || currentUser.role === 'teacher'}
                onOpenQuestionModal={handleOpenQuestionModal}
                onDeleteQuestion={handleDeleteQuestion}
              />
            )}

            {activeTab === 'mock-exam' && (
              <TabMockExam
                questionBankMCQ={mcqBank}
                questionBankEssay={essayBank}
                history={history}
                currentUser={currentUser}
                attachments={examAttachments}
                onSaveAttachment={handleSaveAttachment}
                onDeleteAttachment={handleDeleteAttachment}
                onResetDefaultAttachments={handleResetDefaultAttachments}
                onSaveAttemptRecord={handleSaveAttemptRecord}
                onFinishExam={() => setActiveTab('stats')}
              />
            )}

            {activeTab === 'stats' && (
              <TabStats
                currentUser={currentUser}
                history={history}
                students={students}
                onClearHistory={handleClearHistory}
                onAddSampleHistory={handleAddSampleHistory}
                onDeleteStudent={handleDeleteStudent}
                onClearStudents={handleClearStudents}
                onAddSampleStudents={handleAddSampleStudents}
                onOpenLoginModal={() => setIsLoginOpen(true)}
              />
            )}

            {activeTab === 'manage-questions' && (
              <TabManageQuestions
                currentUser={currentUser}
                questionBankMCQ={mcqBank}
                questionBankEssay={essayBank}
                onOpenQuestionModal={handleOpenQuestionModal}
                onDeleteQuestion={handleDeleteQuestion}
                onResetDefaultQuestions={handleResetDefaultQuestions}
                onImportQuestionsJSON={handleImportQuestionsJSON}
                onOpenLoginModal={() => setIsLoginOpen(true)}
              />
            )}

            {activeTab === 'ai-assistant' && (
              <TabAIAssistant onStartGeneratedAIQuiz={handleStartGeneratedAIQuiz} />
            )}
          </>
        )}

        {activeTab === 'guide' && <TabGuide />}
      </main>

      <Footer />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSaveProfile={handleSaveProfile}
        students={students}
      />

      <QuestionModal
        isOpen={isQuestionModalOpen}
        type={questionModalType}
        editQuestionId={editQuestionId}
        questionBankMCQ={mcqBank}
        questionBankEssay={essayBank}
        onClose={() => setIsQuestionModalOpen(false)}
        onSaveMCQ={(q) => {
          setMcqBank((prev) => {
            const idx = prev.findIndex((item) => item.id === q.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = q;
              return updated;
            }
            return [...prev, q];
          });
          upsertMCQQuestion(q);
        }}
        onSaveEssay={(q) => {
          setEssayBank((prev) => {
            const idx = prev.findIndex((item) => item.id === q.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = q;
              return updated;
            }
            return [...prev, q];
          });
          upsertEssayQuestion(q);
        }}
      />
    </div>
  );
}
