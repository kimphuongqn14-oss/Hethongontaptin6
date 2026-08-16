import React, { useState, useEffect, useRef } from 'react';
import { MCQQuestion, EssayQuestion, AttemptRecord, UserProfile, ExamAttachment } from '../types';
import { CURRICULUM_CHAPTERS } from '../data/curriculum';
import { playSound } from '../utils/audio';
import { LeaderboardBoard } from './LeaderboardBoard';
import { ExportResultModal } from './ExportResultModal';
import { ExamAttachmentSection } from './ExamAttachmentSection';
import { ExamAttachmentPreviewModal } from './ExamAttachmentPreviewModal';
import { ExamAttachmentUploadModal } from './ExamAttachmentUploadModal';
import {
  Clock,
  FileCheck2,
  AlertTriangle,
  Send,
  Trophy,
  RotateCcw,
  Search,
  Printer,
  CheckCircle2,
  XCircle,
  BookOpen,
  CheckSquare,
  Square,
  Sparkles,
  Paperclip,
  Eye,
  Download,
  Plus,
} from 'lucide-react';

interface TabMockExamProps {
  questionBankMCQ: MCQQuestion[];
  questionBankEssay: EssayQuestion[];
  history?: AttemptRecord[];
  currentUser?: UserProfile;
  attachments: ExamAttachment[];
  onSaveAttachment: (attachment: ExamAttachment) => void;
  onDeleteAttachment: (id: string) => void;
  onResetDefaultAttachments: () => void;
  onSaveAttemptRecord: (
    mode: string,
    correctCount: number,
    totalQuestions: number,
    score: string,
    rank: string
  ) => void;
  onFinishExam: () => void;
}

export const TabMockExam: React.FC<TabMockExamProps> = ({
  questionBankMCQ,
  questionBankEssay,
  history = [],
  currentUser,
  attachments = [],
  onSaveAttachment,
  onDeleteAttachment,
  onResetDefaultAttachments,
  onSaveAttemptRecord,
  onFinishExam,
}) => {
  const [examView, setExamView] = useState<'intro' | 'testing' | 'result'>('intro');
  const [selectedChapters, setSelectedChapters] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [examMCQs, setExamMCQs] = useState<MCQQuestion[]>([]);
  const [examEssays, setExamEssays] = useState<EssayQuestion[]>([]);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});
  const [timerSeconds, setTimerSeconds] = useState<number>(45 * 60);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [examTopicTitle, setExamTopicTitle] = useState<string>('Tất Cả 6 Chủ Đề');

  // Attachment modals state
  const [selectedAttachment, setSelectedAttachment] = useState<ExamAttachment | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (examView === 'testing') {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examView]);

  const toggleChapter = (chapterId: number) => {
    playSound('click');
    setSelectedChapters((prev) => {
      if (prev.includes(chapterId)) {
        // Prevent deselecting all chapters
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== chapterId);
      } else {
        return [...prev, chapterId].sort((a, b) => a - b);
      }
    });
  };

  const selectAllChapters = () => {
    playSound('click');
    setSelectedChapters([1, 2, 3, 4, 5, 6]);
  };

  const handleOpenPreview = (att: ExamAttachment) => {
    setSelectedAttachment(att);
    setIsPreviewModalOpen(true);
  };

  const handleStartExam = () => {
    playSound('click');

    // Lọc câu hỏi theo các chủ đề đã chọn mà không bị trùng lặp
    const selectedMCQs = questionBankMCQ.filter((q) => selectedChapters.includes(q.chapterId));
    const selectedEssays = questionBankEssay.filter((eq) => selectedChapters.includes(eq.chapterId));

    // Tập hợp không trùng lặp
    let mcqPool = [...selectedMCQs];
    if (mcqPool.length < 15) {
      const remainingMCQ = questionBankMCQ.filter(
        (q) => !mcqPool.some((item) => String(item.id) === String(q.id))
      );
      mcqPool = [...mcqPool, ...remainingMCQ];
    }

    let essayPool = [...selectedEssays];
    if (essayPool.length < 2) {
      const remainingEssay = questionBankEssay.filter(
        (eq) => !essayPool.some((item) => String(item.id) === String(eq.id))
      );
      essayPool = [...essayPool, ...remainingEssay];
    }

    const finalMCQs = [...mcqPool].sort(() => Math.random() - 0.5).slice(0, 15);
    const finalEssays = [...essayPool].sort(() => Math.random() - 0.5).slice(0, 2);

    let topicName = 'Tất Cả 6 Chủ Đề';
    if (selectedChapters.length < 6) {
      topicName = `Chủ Đề: ${selectedChapters.join(', ')}`;
    }
    setExamTopicTitle(topicName);

    setExamMCQs(finalMCQs);
    setExamEssays(finalEssays);
    setMcqAnswers({});
    setEssayAnswers({});
    setTimerSeconds(45 * 60);
    setTimeSpentSeconds(0);
    setShowReview(false);
    setExamView('testing');
  };

  const handleSubmitExam = () => {
    playSound('victory');
    let mcqCorrect = 0;
    examMCQs.forEach((q, idx) => {
      if (mcqAnswers[idx] === q.correctAnswer) mcqCorrect++;
    });

    const mcqScoreNum = (mcqCorrect / 15) * 7.5;
    // 2.5 points for essay if answered
    let essayCount = 0;
    examEssays.forEach((_, idx) => {
      if (essayAnswers[idx] && essayAnswers[idx].trim().length > 10) essayCount++;
    });
    const essayScoreNum = essayCount === 2 ? 2.5 : essayCount === 1 ? 1.25 : 0;
    const totalScoreNum = Math.min(10, mcqScoreNum + essayScoreNum);
    const scoreStr = totalScoreNum.toFixed(1);

    let rankStr = 'Xuất Sắc';
    if (totalScoreNum < 5.0) rankStr = 'Cần Cố Gắng';
    else if (totalScoreNum < 6.5) rankStr = 'Trung Bình';
    else if (totalScoreNum < 8.0) rankStr = 'Khá';
    else if (totalScoreNum < 9.0) rankStr = 'Giỏi';

    const modeName = selectedChapters.length === 6 ? 'Thi Thử 45P (Tất Cả)' : `Thi Thử (CĐ ${selectedChapters.join(',')})`;
    onSaveAttemptRecord(modeName, mcqCorrect, 15, scoreStr, rankStr);
    setExamView('result');
  };

  const formatTime = (secs: number) => {
    const min = String(Math.floor(secs / 60)).padStart(2, '0');
    const sec = String(secs % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  const scrollToQuestion = (qNum: number) => {
    const el = document.getElementById(`examQBlock-${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // 1. INTRO VIEW
  if (examView === 'intro') {
    return (
      <section className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Đề Thi Thử Định Kỳ Tin Học 6
            </h2>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm max-w-2xl mx-auto">
              Cấu trúc đề chuẩn gồm <strong>15 câu trắc nghiệm (7.5 điểm)</strong> và{' '}
              <strong>2 câu tự luận (2.5 điểm)</strong>. Thời gian làm bài: <strong>45 phút</strong>.
            </p>
          </div>

          {/* Chọn chủ đề thi thử */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Chọn Các Chủ Đề Muốn Thi Thử:
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Đã chọn: <strong className="text-blue-600">{selectedChapters.length}/6</strong> chủ đề
                </span>
                <button
                  type="button"
                  onClick={selectAllChapters}
                  className="text-xs px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 font-bold rounded-lg transition shadow-2xs cursor-pointer"
                >
                  Chọn Tất Cả
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {CURRICULUM_CHAPTERS.map((ch) => {
                const isChecked = selectedChapters.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChapter(ch.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50/70 text-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-blue-600">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 fill-blue-100" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs leading-snug">
                      <strong className={`block ${isChecked ? 'text-blue-900' : 'text-slate-800'}`}>
                        Chủ đề {ch.id}
                      </strong>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {ch.title.replace(/^CHỦ ĐỀ \d+:\s*/, '')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-800 text-xs font-medium text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>
              Lưu ý: Hệ thống sẽ tự động tổng hợp ngẫu nhiên 15 câu trắc nghiệm & 2 câu tự luận từ{' '}
              <strong>{selectedChapters.length} chủ đề</strong> bạn đã chọn. Sau khi nộp bài, bạn có thể xem lại
              lời giải chi tiết và bấm <strong>&quot;Xuất Kết Quả / In&quot;</strong> để lưu phiếu điểm PDF.
            </span>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-5 h-5" /> BẮT ĐẦU THI THỬ TRỰC TUYẾN ({selectedChapters.length} CHỦ ĐỀ - 45 PHÚT)
          </button>
        </div>

        {/* Exam Attachments Section */}
        <ExamAttachmentSection
          attachments={attachments}
          currentUser={currentUser}
          onPreviewAttachment={handleOpenPreview}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onDeleteAttachment={onDeleteAttachment}
          onResetDefaultAttachments={onResetDefaultAttachments}
        />

        {/* Leaderboard Board for Exam Section */}
        <div className="pt-2">
          <LeaderboardBoard
            history={history}
            title="BẢNG XẾP HẠNG TOP 10 THI THỬ 45 PHÚT 🏆"
            subtitle="Bảng vinh danh các học sinh có kết quả thi thử xuất sắc nhất"
          />
        </div>

        {/* Modals */}
        <ExamAttachmentPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          attachment={selectedAttachment}
        />

        <ExamAttachmentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSaveAttachment={onSaveAttachment}
          currentUser={currentUser}
        />
      </section>
    );
  }

  // 2. RESULT VIEW
  if (examView === 'result') {
    let mcqCorrect = 0;
    const formattedUserAnswers: Record<number, { selected: number; isCorrect: boolean }> = {};

    examMCQs.forEach((q, idx) => {
      const sel = mcqAnswers[idx];
      const isCorr = sel === q.correctAnswer;
      if (isCorr) mcqCorrect++;
      formattedUserAnswers[idx] = {
        selected: sel !== undefined ? sel : -1,
        isCorrect: isCorr,
      };
    });

    const mcqScore = ((mcqCorrect / 15) * 7.5).toFixed(1);
    let essayCount = 0;
    examEssays.forEach((_, idx) => {
      if (essayAnswers[idx] && essayAnswers[idx].trim().length > 10) essayCount++;
    });
    const essayScore = (essayCount === 2 ? 2.5 : essayCount === 1 ? 1.25 : 0).toFixed(1);
    const totalScore = (parseFloat(mcqScore) + parseFloat(essayScore)).toFixed(1);
    const pct = Math.round((mcqCorrect / 15) * 100);

    let rank = 'Xuất Sắc';
    const numScore = parseFloat(totalScore);
    if (numScore < 5) rank = 'Cần Cố Gắng';
    else if (numScore < 6.5) rank = 'Trung Bình';
    else if (numScore < 8.0) rank = 'Khá';
    else if (numScore < 9.0) rank = 'Giỏi';

    return (
      <section className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-5xl mx-auto shadow-inner">
            <Trophy className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">HOÀN THÀNH ĐỀ THI THỬ 45 PHÚT!</h2>
            <p className="text-emerald-600 font-bold text-lg mt-1">Xếp loại bài thi: {rank}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase">Tổng Điểm</div>
              <div className="text-3xl font-extrabold text-blue-600 mt-1">{totalScore}/10</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase">Điểm Trắc Nghiệm</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">{mcqScore}/7.5</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase">Số Câu MCQ Đúng</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                {mcqCorrect}/15
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase">Thời Gian Làm</div>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">
                {formatTime(timeSpentSeconds)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => setExamView('intro')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Làm Đề Thi Mới
            </button>
            <button
              onClick={() => setShowReview(!showReview)}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" /> {showReview ? 'Ẩn Chi Tiết' : 'Xem Chi Tiết Bài Làm'}
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Xuất Kết Quả / In
            </button>
          </div>

          {/* Modal Xuất Kết Quả / In Cho Đề Thi Thử */}
          <ExportResultModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            data={{
              title: `Đề Thi Thử Tin Học 6 (45P) - ${examTopicTitle}`,
              studentName: currentUser?.name || 'Học Sinh Lớp 6',
              classGroup: currentUser?.classGroup || 'Khối 6',
              avatar: currentUser?.avatar || '🎓',
              date: new Date().toLocaleString('vi-VN'),
              score: totalScore,
              maxScore: 10,
              pct: pct,
              correctCount: mcqCorrect,
              totalQuestions: 15,
              timeSpent: formatTime(timeSpentSeconds),
              rank: rank,
              questions: examMCQs,
              userAnswers: formattedUserAnswers,
              essayQuestions: examEssays,
              essayAnswers: essayAnswers,
            }}
          />

          {showReview && (
            <div className="text-left space-y-6 pt-6 border-t border-slate-200 animate-fade-in">
              <h3 className="font-extrabold text-xl text-slate-900">
                PHẦN I: CHI TIẾT TRẮC NGHIỆM ({mcqCorrect}/15 CÂU ĐÚNG)
              </h3>
              <div className="space-y-4">
                {examMCQs.map((q, idx) => {
                  const sel = mcqAnswers[idx];
                  const isCorr = sel === q.correctAnswer;

                  return (
                    <div
                      key={`rev-mcq-${q.id || ''}-${idx}`}
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
                            {sel !== undefined ? q.options[sel] : 'Chưa chọn đáp án'}
                          </span>
                        </div>
                        {!isCorr && (
                          <div className="text-emerald-700 font-bold">
                            • Đáp án đúng: {q.options[q.correctAnswer]}
                          </div>
                        )}
                        {q.explanation && (
                          <div className="text-slate-600 italic">💡 {q.explanation}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 className="font-extrabold text-xl text-slate-900 pt-4 border-t border-slate-200">
                PHẦN II: CHI TIẾT TỰ LUẬN
              </h3>
              <div className="space-y-4">
                {examEssays.map((eq, idx) => {
                  const studentAns = essayAnswers[idx] || '(Chưa làm bài tự luận)';
                  return (
                    <div
                      key={`rev-essay-${eq.id || ''}-${idx}`}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-sm"
                    >
                      <div className="font-bold text-slate-900">
                        Câu {15 + idx + 1} ({eq.title}): {eq.question}
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap text-xs sm:text-sm">
                        <strong className="text-slate-500 block text-xs mb-1">
                          Bài làm của học sinh:
                        </strong>
                        {studentAns}
                      </div>
                      {eq.sampleAnswer && (
                        <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                          <strong>Gợi ý / Đáp án tham khảo:</strong> {eq.sampleAnswer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top 10 Leaderboard */}
          <div className="pt-6 border-t border-slate-200">
            <LeaderboardBoard
              history={history}
              title="BẢNG XẾP HẠNG TOP 10 SAU KHI THI THỬ 🏆"
              subtitle="Vị trí xếp hạng của bạn trên bảng vinh danh toàn khối 6"
            />
          </div>
        </div>

        {/* Attachment Preview Modal in result view */}
        <ExamAttachmentPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          attachment={selectedAttachment}
        />
      </section>
    );
  }

  // 3. TESTING VIEW
  return (
    <section className="space-y-6 animate-fade-in">
      {/* Sticky Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">Đề Thi Ôn Tập Tổng Hợp Tin Học 6</h3>
          <p className="text-xs text-slate-500">Hãy hoàn thành tất cả câu hỏi trước khi nộp bài.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {attachments.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedAttachment(attachments[0]);
                setIsPreviewModalOpen(true);
              }}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer"
              title="Mở tệp đề tham khảo / đề in sẵn"
            >
              <Paperclip className="w-4 h-4 text-indigo-600" />
              <span>Xem Tệp Đề ({attachments.length})</span>
            </button>
          )}

          <div className="text-rose-600 font-extrabold text-lg sm:text-xl bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{formatTime(timerSeconds)}</span>
          </div>
          <button
            onClick={handleSubmitExam}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Nộp Bài Thi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Questions List */}
        <div className="lg:col-span-3 space-y-8">
          <div className="font-extrabold text-xl text-slate-900 border-b pb-2">
            PHẦN I: TRẮC NGHIỆM (15 CÂU - 7.5 ĐIỂM)
          </div>

          {examMCQs.map((q, idx) => (
            <div
              key={`exam-mcq-${q.id || ''}-${idx}`}
              id={`examQBlock-${idx + 1}`}
              className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm"
            >
              <div className="font-bold text-slate-900 text-base">
                Câu {idx + 1}: {q.question}
              </div>
              {q.imageUrl && (
                <div className="my-3 p-2 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center max-h-64 overflow-hidden">
                  <img
                    src={q.imageUrl}
                    alt={`Hình minh họa câu ${idx + 1}`}
                    className="max-h-56 object-contain rounded-xl"
                  />
                </div>
              )}
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={`opt-${idx}-${optIdx}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-800"
                  >
                    <input
                      type="radio"
                      name={`examMCQ_${idx}`}
                      checked={mcqAnswers[idx] === optIdx}
                      onChange={() => setMcqAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="font-extrabold text-xl text-slate-900 border-b pb-2 pt-6">
            PHẦN II: TỰ LUẬN (2 CÂU - 2.5 ĐIỂM)
          </div>

          {examEssays.map((eq, idx) => {
            const qNum = 15 + idx + 1;
            return (
              <div
                key={`exam-essay-${eq.id || ''}-${idx}`}
                id={`examQBlock-${qNum}`}
                className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm"
              >
                <div className="font-bold text-slate-900 text-base">
                  Câu {qNum} ({eq.title}):
                </div>
                <p className="text-sm text-slate-700">{eq.question}</p>
                {eq.imageUrl && (
                  <div className="my-3 p-2 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center max-h-64 overflow-hidden">
                    <img
                      src={eq.imageUrl}
                      alt={`Hình minh họa câu tự luận ${qNum}`}
                      className="max-h-56 object-contain rounded-xl"
                    />
                  </div>
                )}
                <textarea
                  value={essayAnswers[idx] || ''}
                  onChange={(e) =>
                    setEssayAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                  }
                  placeholder="Bài làm tự luận của học sinh..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>
            );
          })}
        </div>

        {/* Question Palette Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 sticky top-36 space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm">Danh Sách Câu Hỏi</h4>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 17 }).map((_, i) => {
                const qNum = i + 1;
                let isAnswered = false;
                if (qNum <= 15) {
                  isAnswered = mcqAnswers[qNum - 1] !== undefined;
                } else {
                  isAnswered = Boolean(
                    essayAnswers[qNum - 16] && essayAnswers[qNum - 16].trim()
                  );
                }

                return (
                  <button
                    key={qNum}
                    onClick={() => scrollToQuestion(qNum)}
                    className={`w-9 h-9 rounded-xl font-bold text-xs transition flex items-center justify-center cursor-pointer ${
                      isAnswered
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {qNum}
                  </button>
                );
              })}
            </div>

            {attachments.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-600" /> Tệp Đề Đính Kèm ({attachments.length}):
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {attachments.map((att, attIdx) => (
                    <button
                      key={`test-att-${att.id}-${attIdx}`}
                      type="button"
                      onClick={() => handleOpenPreview(att)}
                      className="w-full p-2 bg-indigo-50/60 hover:bg-indigo-100/80 rounded-xl text-left border border-indigo-100 transition flex items-center gap-2 text-xs text-indigo-900 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate font-semibold">{att.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attachment Preview Modal during test */}
      <ExamAttachmentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        attachment={selectedAttachment}
      />
    </section>
  );
};
