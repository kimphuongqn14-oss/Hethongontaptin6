import React, { useState } from 'react';
import { EssayQuestion } from '../types';
import { playSound } from '../utils/audio';
import { PenTool, Lightbulb, CheckCheck, Plus, Trash2, Edit3 } from 'lucide-react';

interface TabEssayProps {
  essayQuestions: EssayQuestion[];
  isAdminOrTeacher: boolean;
  onOpenQuestionModal: (type: 'essay', questionId?: number) => void;
  onDeleteQuestion: (type: 'essay', id: number) => void;
}

export const TabEssay: React.FC<TabEssayProps> = ({
  essayQuestions,
  isAdminOrTeacher,
  onOpenQuestionModal,
  onDeleteQuestion,
}) => {
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const filteredQuestions = essayQuestions.filter((q) => {
    if (chapterFilter === 'all') return true;
    const chNum = parseInt(chapterFilter.replace('ch', ''));
    return q.chapterId === chNum;
  });

  const toggleHint = (id: number) => {
    playSound('click');
    setShowHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const revealAnswer = (id: number) => {
    playSound('click');
    setShowAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <PenTool className="w-6 h-6 text-purple-600" /> Rèn Luyện Câu Hỏi Tự Luận
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Tự suy luận, gõ câu trả lời, xem gợi ý và đối chiếu đáp án mẫu.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdminOrTeacher && (
            <button
              onClick={() => onOpenQuestionModal('essay')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Thêm Câu Hỏi
            </button>
          )}
          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl px-4 py-2 font-medium"
          >
            <option value="all">Tất Cả Bài Học</option>
            <option value="ch1">Chủ đề 1: Máy tính và cộng đồng</option>
            <option value="ch2">Chủ đề 2: Mạng máy tính & Internet</option>
            <option value="ch3">Chủ đề 3: Tìm kiếm & Lưu trữ</option>
            <option value="ch4">Chủ đề 4: An toàn thông tin</option>
            <option value="ch5">Chủ đề 5: Ứng dụng tin học</option>
            <option value="ch6">Chủ đề 6: Thuật toán</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredQuestions.map((q, idx) => (
          <div key={`essay-${q.id || ''}-${idx}`} className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="bg-purple-100 text-purple-700 font-bold text-xs px-3 py-1 rounded-full">
                Tự Luận #{idx + 1}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Chủ đề {q.chapterId}</span>
                {isAdminOrTeacher && (
                  <>
                    <button
                      onClick={() => onOpenQuestionModal('essay', q.id)}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      onClick={() => onDeleteQuestion('essay', q.id)}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-lg transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{q.title}</h3>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">{q.question}</p>

            {q.imageUrl && (
              <div className="my-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center max-h-72 overflow-hidden">
                <img
                  src={q.imageUrl}
                  alt={`Minh họa ${q.title}`}
                  className="max-h-64 object-contain rounded-xl shadow-sm"
                />
              </div>
            )}

            <div>
              <textarea
                value={userInputs[q.id] || ''}
                onChange={(e) =>
                  setUserInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                placeholder="Nhập câu trả lời của em tại đây..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[100px]"
              ></textarea>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleHint(q.id)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Lightbulb className="w-4 h-4 text-amber-600" /> Xem Gợi Ý
              </button>
              <button
                onClick={() => revealAnswer(q.id)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" /> Xem Đáp Án Mẫu
              </button>
            </div>

            {showHints[q.id] && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed animate-fade-in flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{q.hint}</span>
              </div>
            )}

            {showAnswers[q.id] && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-2 animate-fade-in">
                <div className="font-bold text-purple-900 flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4 text-purple-600" /> ĐÁP ÁN MẪU CHUẨN:
                </div>
                <div className="whitespace-pre-line leading-relaxed text-slate-800 font-mono bg-white p-3 rounded-xl border border-purple-100">
                  {q.sampleAnswer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
