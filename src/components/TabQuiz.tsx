import React, { useState, useEffect, useRef } from 'react';
import { MCQQuestion, AttemptRecord, UserProfile } from '../types';
import { playSound } from '../utils/audio';
import { LeaderboardBoard } from './LeaderboardBoard';
import { ExportResultModal, QuizResultData } from './ExportResultModal';
import {
  Sliders,
  Play,
  Wand2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Trophy,
  RotateCcw,
  Search,
  Printer,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface TabQuizProps {
  questionBankMCQ: MCQQuestion[];
  activeSubMode: 'setup' | 'player' | 'result';
  setActiveSubMode: (mode: 'setup' | 'player' | 'result') => void;
  quizQuestions: MCQQuestion[];
  setQuizQuestions: (questions: MCQQuestion[]) => void;
  history?: AttemptRecord[];
  currentUser?: UserProfile;
  onSaveAttemptRecord: (
    mode: string,
    correctCount: number,
    totalQuestions: number,
    score: string,
    rank: string
  ) => void;
  onGenerateAIQuiz: () => void;
}

export const TabQuiz: React.FC<TabQuizProps> = ({
  questionBankMCQ,
  activeSubMode,
  setActiveSubMode,
  quizQuestions,
  setQuizQuestions,
  history = [],
  currentUser,
  onSaveAttemptRecord,
  onGenerateAIQuiz,
}) => {
  // Quiz Setup state
  const [quizScope, setQuizScope] = useState<string>('all');
  const [quizCount, setQuizCount] = useState<number | 'all'>(10);

  // Active Quiz state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<
    Record<number, { selected: number; isCorrect: boolean; isSubmitted: boolean }>
  >({});
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Quiz Timer
  useEffect(() => {
    if (activeSubMode === 'player') {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSubMode]);

  const handleStartQuiz = () => {
    playSound('click');
    let pool = [...questionBankMCQ];

    if (quizScope.startsWith('ch')) {
      const chNum = parseInt(quizScope.replace('ch', ''));
      pool = pool.filter((q) => q.chapterId === chNum);
    } else if (quizScope.startsWith('lesson_')) {
      const lNum = parseInt(quizScope.replace('lesson_', ''));
      pool = pool.filter((q) => q.lessonId === lNum);
    }

    if (pool.length === 0) {
      alert('Không có câu hỏi cho phạm vi đã chọn, đang tự động dùng tất cả câu hỏi!');
      pool = [...questionBankMCQ];
    }

    // Shuffle pool
    pool.sort(() => Math.random() - 0.5);

    let count = quizCount === 'all' ? pool.length : quizCount;
    if (typeof count === 'number' && count > pool.length) {
      count = pool.length;
    }

    const selectedQuestions = pool.slice(0, typeof count === 'number' ? count : pool.length);

    setQuizQuestions(selectedQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setTimerSeconds(0);
    setShowReview(false);
    setActiveSubMode('player');
  };

  const handleSelectAnswer = (optIdx: number) => {
    if (userAnswers[currentIndex]?.isSubmitted) return;
    playSound('click');
    const q = quizQuestions[currentIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        selected: optIdx,
        isCorrect: optIdx === q.correctAnswer,
        isSubmitted: false,
      },
    }));
  };

  const handleConfirmAnswer = () => {
    const currentAns = userAnswers[currentIndex];
    if (!currentAns) {
      alert('Vui lòng chọn 1 đáp án trước khi xác nhận!');
      return;
    }

    if (currentAns.isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        isSubmitted: true,
      },
    }));
  };

  const handleNextQuestion = () => {
    playSound('click');
    if (currentIndex === quizQuestions.length - 1) {
      handleFinishQuiz();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevQuestion = () => {
    playSound('click');
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinishQuiz = () => {
    playSound('victory');
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx]?.isCorrect) {
        correctCount++;
      }
    });

    const total = quizQuestions.length;
    const scoreNum = ((correctCount / total) * 10).toFixed(1);
    const pct = Math.round((correctCount / total) * 100);

    let rank = 'Xuất Sắc';
    if (pct < 50) rank = 'Cần Cố Gắng';
    else if (pct < 70) rank = 'Trung Bình - Khá';
    else if (pct < 85) rank = 'Giỏi';

    onSaveAttemptRecord('Luyện Trắc Nghiệm', correctCount, total, scoreNum, rank);
    setActiveSubMode('result');
  };

  const formatTime = (secs: number) => {
    const min = String(Math.floor(secs / 60)).padStart(2, '0');
    const sec = String(secs % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  // 1. SETUP SUBMODE
  if (activeSubMode === 'setup') {
    return (
      <section className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
            <Sliders className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Cấu Hình Bài Trắc Nghiệm</h2>
            <p className="text-slate-600 text-sm mt-2">
              Tùy chọn số lượng câu hỏi và phạm vi kiến thức luyện tập.
            </p>
          </div>

          <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Phạm vi kiến thức:
              </label>
              <select
                value={quizScope}
                onChange={(e) => setQuizScope(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Toàn bộ chương trình (Tất cả các bài)</option>
                <option value="ch1">Chủ đề 1: Máy tính và cộng đồng</option>
                <option value="ch2">Chủ đề 2: Mạng máy tính và Internet</option>
                <option value="ch3">Chủ đề 3: Tổ chức lưu trữ và tìm kiếm</option>
                <option value="ch4">Chủ đề 4: An toàn thông tin</option>
                <option value="ch5">Chủ đề 5: Soạn thảo & Sơ đồ tư duy</option>
                <option value="ch6">Chủ đề 6: Thuật toán & Giải quyết vấn đề</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Số lượng câu hỏi:
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[10, 20, 30, 'all'].map((val) => {
                  const isSel = quizCount === val;
                  return (
                    <button
                      key={String(val)}
                      onClick={() => setQuizCount(val as any)}
                      className={`px-4 py-3 border rounded-xl font-bold transition text-sm ${
                        isSel
                          ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      {val === 'all' ? 'Tất Cả' : `${val} Câu`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartQuiz}
              className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-lg rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" /> BẮT ĐẦU LÀM BÀI
            </button>
            <button
              onClick={onGenerateAIQuiz}
              className="py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Wand2 className="w-5 h-5 text-amber-300" /> Tạo Đề AI
            </button>
          </div>
        </div>

        {/* Top 10 Leaderboard for Students */}
        <div className="pt-4">
          <LeaderboardBoard
            history={history}
            title="BẢNG XẾP HẠNG TOP 10 LUYỆN TRẮC NGHIỆM 🏆"
            subtitle="Học sinh xem bảng vàng thành tích trước khi làm bài luyện tập"
          />
        </div>
      </section>
    );
  }

  // 2. ACTIVE QUIZ PLAYER SUBMODE
  if (activeSubMode === 'player') {
    const q = quizQuestions[currentIndex];
    if (!q) return null;

    const currentAns = userAnswers[currentIndex];
    const isSubmitted = currentAns?.isSubmitted;

    return (
      <section className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Top Info Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl text-sm">
              Câu {currentIndex + 1}/{quizQuestions.length}
            </span>
            <span className="bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-lg text-xs">
              Mức độ: {q.level || 'Nhận biết'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
            <Clock className="w-5 h-5" />
            <span>{formatTime(timerSeconds)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question & Options Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
            {currentIndex + 1}. {q.question}
          </div>

          {q.imageUrl && (
            <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center max-h-72 overflow-hidden">
              <img
                src={q.imageUrl}
                alt={`Minh họa câu ${currentIndex + 1}`}
                className="max-h-64 object-contain rounded-xl shadow-sm"
              />
            </div>
          )}

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = currentAns?.selected === idx;
              let btnClass =
                'w-full text-left p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer bg-white text-sm ';

              if (!isSubmitted) {
                if (isSelected) {
                  btnClass += 'border-2 border-blue-600 text-slate-900 font-bold shadow-sm';
                } else {
                  btnClass += 'border-slate-200 hover:border-slate-300 text-slate-800 font-medium';
                }
              } else {
                if (isSelected) {
                  if (currentAns.isCorrect) {
                    btnClass += 'border-2 border-emerald-500 text-slate-900 font-bold shadow-sm';
                  } else {
                    btnClass += 'border-2 border-rose-500 text-slate-900 font-bold shadow-sm';
                  }
                } else if (idx === q.correctAnswer) {
                  btnClass += 'border-2 border-emerald-500 text-slate-900 font-bold shadow-sm';
                } else {
                  btnClass += 'border-slate-200 text-slate-500 font-medium opacity-70';
                }
              }

              return (
                <button key={idx} onClick={() => handleSelectAnswer(idx)} className={btnClass}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors bg-white ${
                        isSubmitted
                          ? isSelected
                            ? currentAns.isCorrect
                              ? 'border-emerald-600 text-emerald-600'
                              : 'border-rose-600 text-rose-600'
                            : idx === q.correctAnswer
                            ? 'border-emerald-600 text-emerald-600'
                            : 'border-slate-300'
                          : isSelected
                          ? 'border-blue-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && !isSubmitted && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      )}
                      {isSubmitted && isSelected && currentAns.isCorrect && (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      )}
                      {isSubmitted && isSelected && !currentAns.isCorrect && (
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                      )}
                      {isSubmitted && !isSelected && idx === q.correctAnswer && (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      )}
                    </div>
                    <span>{opt}</span>
                  </div>

                  {isSubmitted && (
                    <div>
                      {isSelected &&
                        (currentAns.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        ))}
                      {!isSelected && idx === q.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Box */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-2xl border text-sm font-medium animate-fade-in space-y-1 ${
                currentAns.isCorrect
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-rose-300 bg-rose-50 text-rose-900'
              }`}
            >
              <div className="font-extrabold text-base flex items-center gap-2">
                {currentAns.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> ✔ CHÍNH XÁC! RẤT TỐT!
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" /> ✘ CHƯA ĐÚNG!
                  </>
                )}
              </div>
              <p className="text-slate-700 leading-relaxed">
                {q.explanation || 'Đáp án chính xác theo chương trình SGK Tin học 6.'}
              </p>
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className={`px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition flex items-center gap-1 ${
                currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Câu Trước
            </button>

            <div className="flex gap-3">
              {!isSubmitted ? (
                <button
                  onClick={handleConfirmAnswer}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md"
                >
                  Xác Nhận Đáp Án
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition shadow-md flex items-center gap-1"
                >
                  {currentIndex === quizQuestions.length - 1 ? (
                    <>
                      Hoàn Thành <Flag className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Câu Tiếp Theo <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 3. QUIZ RESULT SUBMODE
  let correctCount = 0;
  quizQuestions.forEach((q, idx) => {
    if (userAnswers[idx]?.isCorrect) correctCount++;
  });
  const total = quizQuestions.length;
  const score = total > 0 ? ((correctCount / total) * 10).toFixed(1) : '0';
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  let rank = 'Xuất Sắc';
  if (pct < 50) rank = 'Cần Cố Gắng';
  else if (pct < 70) rank = 'Trung Bình - Khá';
  else if (pct < 85) rank = 'Giỏi';

  return (
    <section className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-5xl mx-auto shadow-inner">
          <Trophy className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">HOÀN THÀNH BÀI TRẮC NGHIỆM!</h2>
          <p className="text-emerald-600 font-bold text-lg mt-1">Xếp loại: {rank}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div className="text-xs font-bold text-slate-500 uppercase">Điểm Số</div>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">{score}/10</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div className="text-xs font-bold text-slate-500 uppercase">Tỉ Lệ Đúng</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{pct}%</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div className="text-xs font-bold text-slate-500 uppercase">Số Câu Đúng</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              {correctCount}/{total}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div className="text-xs font-bold text-slate-500 uppercase">Thời Gian</div>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">{formatTime(timerSeconds)}</div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveSubMode('setup')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Làm Bài Khác
          </button>
          <button
            onClick={() => setShowReview(!showReview)}
            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Xem Lại Đáp Án
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Xuất Kết Quả / In
          </button>
        </div>

        {/* Modal Xuất Kết Quả / In Chi Tiết */}
        <ExportResultModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          data={{
            title:
              quizScope === 'all'
                ? 'Luyện Tập Trắc Nghiệm Tổng Hợp'
                : quizScope.startsWith('c_')
                ? `Luyện Tập Chủ Đề ${quizScope.replace('c_', '')}`
                : `Luyện Tập Bài ${quizScope.replace('l_', '')}`,
            studentName: currentUser?.name || 'Học Sinh Lớp 6',
            classGroup: currentUser?.classGroup || 'Khối 6',
            avatar: currentUser?.avatar || '🎓',
            date: new Date().toLocaleString('vi-VN'),
            score: score,
            maxScore: 10,
            pct: pct,
            correctCount: correctCount,
            totalQuestions: total,
            timeSpent: formatTime(timerSeconds),
            rank: rank,
            questions: quizQuestions,
            userAnswers: userAnswers,
          }}
        />

        {showReview && (
          <div className="text-left space-y-4 pt-6 border-t border-slate-200 animate-fade-in">
            <h3 className="font-extrabold text-xl text-slate-900 mb-4">Chi Tiết Từng Câu Hỏi:</h3>
            <div className="space-y-4">
              {quizQuestions.map((q, idx) => {
                const uAns = userAnswers[idx];
                const selectedIdx = uAns ? uAns.selected : -1;
                const isCorr = uAns ? uAns.isCorrect : false;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${
                      isCorr ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                    } space-y-2`}
                  >
                    <div className="font-bold text-slate-900 text-sm">
                      Câu {idx + 1}: {q.question}
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        • Lựa chọn của bạn:{' '}
                        <span
                          className={`font-bold ${isCorr ? 'text-emerald-700' : 'text-rose-700'}`}
                        >
                          {selectedIdx >= 0 ? q.options[selectedIdx] : 'Bỏ trống'}
                        </span>
                      </div>
                      {!isCorr && (
                        <div className="text-emerald-700 font-bold">
                          • Đáp án đúng: {q.options[q.correctAnswer]}
                        </div>
                      )}
                      <div className="text-slate-600 italic">
                        💡 {q.explanation || 'Giải thích kiến thức SGK'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top 10 Leaderboard in Result Mode */}
        <div className="pt-6 border-t border-slate-200">
          <LeaderboardBoard
            history={history}
            title="BẢNG XẾP HẠNG TOP 10 SAU KHI NỘP BÀI 🏆"
            subtitle="Kiểm tra vị trí xếp hạng của bạn trên bảng vinh danh toàn khối 6"
          />
        </div>
      </div>
    </section>
  );
};
