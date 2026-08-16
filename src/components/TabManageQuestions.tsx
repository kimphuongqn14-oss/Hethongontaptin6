import React, { useState, useRef } from 'react';
import { MCQQuestion, EssayQuestion, UserProfile } from '../types';
import { playSound } from '../utils/audio';
import {
  Database,
  Plus,
  RotateCcw,
  Search,
  ListCheck,
  PenTool,
  Download,
  Upload,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Trash2,
  Lock
} from 'lucide-react';

interface TabManageQuestionsProps {
  currentUser: UserProfile;
  questionBankMCQ: MCQQuestion[];
  questionBankEssay: EssayQuestion[];
  onOpenQuestionModal: (type: 'mcq' | 'essay', questionId?: number) => void;
  onDeleteQuestion: (type: 'mcq' | 'essay', id: number) => void;
  onResetDefaultQuestions: () => void;
  onImportQuestionsJSON: (mcqList: MCQQuestion[], essayList: EssayQuestion[]) => void;
  onOpenLoginModal: () => void;
}

export const TabManageQuestions: React.FC<TabManageQuestionsProps> = ({
  currentUser,
  questionBankMCQ,
  questionBankEssay,
  onOpenQuestionModal,
  onDeleteQuestion,
  onResetDefaultQuestions,
  onImportQuestionsJSON,
  onOpenLoginModal,
}) => {
  const [currentManageType, setCurrentManageType] = useState<'mcq' | 'essay'>('mcq');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAdminOrTeacher = currentUser.role === 'admin' || currentUser.role === 'teacher';

  const handleExportJSON = () => {
    playSound('click');
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      mcq: questionBankMCQ,
      essay: questionBankEssay,
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ngan-hang-cau-hoi-tinhoc6-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.mcq) || Array.isArray(parsed.essay)) {
          onImportQuestionsJSON(parsed.mcq || [], parsed.essay || []);
          playSound('victory');
          alert('Nhập ngân hàng câu hỏi từ tệp JSON thành công!');
        } else {
          alert('Định dạng tệp JSON không hợp lệ! Vui lòng chọn tệp được xuất từ ứng dụng.');
        }
      } catch (err) {
        alert('Lỗi đọc tệp JSON! Vui lòng kiểm tra lại định dạng tệp.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredMCQ = questionBankMCQ.filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEssay = questionBankEssay.filter((q) =>
    (q.title + q.question).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" /> Quản Lý Ngân Hàng Câu Hỏi
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Thêm mới, chỉnh sửa, xuất/nhập tệp hoặc khôi phục ngân hàng câu hỏi môn Tin học 6.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdminOrTeacher ? (
            <>
              <button
                onClick={() => onOpenQuestionModal('mcq')}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Thêm Trắc Nghiệm
              </button>
              <button
                onClick={() => onOpenQuestionModal('essay')}
                className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Thêm Tự Luận
              </button>
              <button
                onClick={handleExportJSON}
                className="px-3 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                title="Xuất ngân hàng câu hỏi ra tệp JSON"
              >
                <Download className="w-4 h-4" /> Xuất JSON
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                title="Nhập ngân hàng câu hỏi từ tệp JSON"
              >
                <Upload className="w-4 h-4" /> Nhập JSON
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={onResetDefaultQuestions}
                className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                title="Khôi phục câu hỏi mặc định"
              >
                <RotateCcw className="w-4 h-4" /> Khôi Phục Gốc
              </button>
            </>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2"
            >
              <Lock className="w-4 h-4" /> Đăng Nhập Quản Trị (admin/admin)
            </button>
          )}
        </div>
      </div>

      {/* Permission Status Banner */}
      {!isAdminOrTeacher ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              Bạn đang xem ở chế độ đọc. Hãy đăng nhập tài khoản <strong>Quản trị viên (admin/admin)</strong> để có toàn quyền thêm, sửa, xóa và nhập/xuất câu hỏi.
            </span>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg ml-3 text-xs flex-shrink-0"
          >
            Đăng nhập Admin
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            Đã đăng nhập quyền <strong>{currentUser.role === 'admin' ? 'Quản trị viên (Admin)' : 'Giáo viên'}</strong>. Bạn có thể toàn quyền quản lý ngân hàng câu hỏi.
          </span>
        </div>
      )}

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentManageType('mcq')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentManageType === 'mcq'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ListCheck className="w-4 h-4" /> Trắc Nghiệm ({questionBankMCQ.length})
          </button>
          <button
            onClick={() => setCurrentManageType('essay')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentManageType === 'essay'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PenTool className="w-4 h-4" /> Tự Luận ({questionBankEssay.length})
          </button>
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nội dung câu hỏi..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {currentManageType === 'mcq' ? (
          filteredMCQ.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border">
              Không tìm thấy câu hỏi trắc nghiệm nào.
            </div>
          ) : (
            filteredMCQ.map((q, idx) => (
              <div key={`manage-mcq-${q.id || ''}-${idx}`} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg">
                      #{idx + 1} (ID: {q.id})
                    </span>
                    <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-0.5 rounded-lg">
                      Bài {q.lessonId}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2 py-0.5 rounded-lg">
                      {q.level || 'Nhận biết'}
                    </span>
                  </div>
                  {isAdminOrTeacher && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onOpenQuestionModal('mcq', q.id)}
                        className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Sửa
                      </button>
                      <button
                        onClick={() => onDeleteQuestion('mcq', q.id)}
                        className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-lg transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  )}
                </div>

                <div className="font-bold text-slate-900 text-sm leading-relaxed">{q.question}</div>

                {q.imageUrl && (
                  <div className="my-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 inline-block max-w-md">
                    <img
                      src={q.imageUrl}
                      alt="Hình ảnh câu hỏi"
                      className="max-h-48 object-contain rounded-xl"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={`opt-${idx}-${oIdx}`}
                      className={`p-2.5 rounded-xl border ${
                        oIdx === q.correctAnswer
                          ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt} {oIdx === q.correctAnswer ? '✔ (Đáp án đúng)' : ''}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    💡 Giải thích: {q.explanation}
                  </div>
                )}
              </div>
            ))
          )
        ) : filteredEssay.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border">
            Không tìm thấy câu hỏi tự luận nào.
          </div>
        ) : (
          filteredEssay.map((q, idx) => (
            <div key={`manage-essay-${q.id || ''}-${idx}`} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg">
                    #{idx + 1} (ID: {q.id})
                  </span>
                  <span className="bg-purple-100 text-purple-800 font-bold text-xs px-2.5 py-0.5 rounded-lg">
                    Bài {q.lessonId}
                  </span>
                </div>
                {isAdminOrTeacher && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenQuestionModal('essay', q.id)}
                      className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      onClick={() => onDeleteQuestion('essay', q.id)}
                      className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-lg transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                )}
              </div>

              <div className="font-extrabold text-slate-900 text-sm">{q.title}</div>
              <div className="text-xs text-slate-700 font-medium">{q.question}</div>

              {q.imageUrl && (
                <div className="my-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 inline-block max-w-md">
                  <img
                    src={q.imageUrl}
                    alt="Hình ảnh tự luận"
                    className="max-h-48 object-contain rounded-xl"
                  />
                </div>
              )}
              {q.hint && (
                <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  💡 Gợi ý: {q.hint}
                </div>
              )}
              <div className="text-xs text-purple-900 bg-purple-50 p-3 rounded-xl border border-purple-200 font-mono whitespace-pre-line">
                📝 Đáp án mẫu: {q.sampleAnswer}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
