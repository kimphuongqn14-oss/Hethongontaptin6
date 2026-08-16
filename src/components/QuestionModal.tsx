import React, { useState, useEffect, useRef } from 'react';
import { MCQQuestion, EssayQuestion, QuestionLevel } from '../types';
import { CURRICULUM_LESSONS } from '../data/curriculum';
import { playSound } from '../utils/audio';
import { X, Save, Edit3, Image as ImageIcon, Upload, Trash2, Link } from 'lucide-react';

interface QuestionModalProps {
  isOpen: boolean;
  type: 'mcq' | 'essay';
  editQuestionId?: number;
  questionBankMCQ: MCQQuestion[];
  questionBankEssay: EssayQuestion[];
  onClose: () => void;
  onSaveMCQ: (question: MCQQuestion) => void;
  onSaveEssay: (question: EssayQuestion) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  type,
  editQuestionId,
  questionBankMCQ,
  questionBankEssay,
  onClose,
  onSaveMCQ,
  onSaveEssay,
}) => {
  const [lessonId, setLessonId] = useState<number>(1);
  const [level, setLevel] = useState<string>('Nhận biết');
  const [questionText, setQuestionText] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  // MCQ Fields
  const [optA, setOptA] = useState<string>('');
  const [optB, setOptB] = useState<string>('');
  const [optC, setOptC] = useState<string>('');
  const [optD, setOptD] = useState<string>('');
  const [correctOpt, setCorrectOpt] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>('');

  // Essay Fields
  const [essayHint, setEssayHint] = useState<string>('');
  const [essaySample, setEssaySample] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editQuestionId) {
      if (type === 'mcq') {
        const q = questionBankMCQ.find((item) => item.id === editQuestionId);
        if (q) {
          setLessonId(q.lessonId || 1);
          setLevel(q.level || 'Thông hiểu');
          setQuestionText(q.question || '');
          setImageUrl(q.imageUrl || '');
          setOptA((q.options[0] || '').replace(/^A\.\s*/, ''));
          setOptB((q.options[1] || '').replace(/^B\.\s*/, ''));
          setOptC((q.options[2] || '').replace(/^C\.\s*/, ''));
          setOptD((q.options[3] || '').replace(/^D\.\s*/, ''));
          setCorrectOpt(q.correctAnswer || 0);
          setExplanation(q.explanation || '');
        }
      } else {
        const q = questionBankEssay.find((item) => item.id === editQuestionId);
        if (q) {
          setLessonId(q.lessonId || 1);
          setLevel(q.title || 'Câu hỏi tự luận');
          setQuestionText(q.question || '');
          setImageUrl(q.imageUrl || '');
          setEssayHint(q.hint || '');
          setEssaySample(q.sampleAnswer || '');
        }
      }
    } else {
      // Reset defaults
      setLessonId(1);
      setLevel('Nhận biết');
      setQuestionText('');
      setImageUrl('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectOpt(0);
      setExplanation('');
      setEssayHint('');
      setEssaySample('');
    }
  }, [editQuestionId, type, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, GIF, WEBP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng hình ảnh lớn hơn 5MB! Vui lòng chọn tệp nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        playSound('click');
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    playSound('victory');
    const selectedLesson = CURRICULUM_LESSONS.find((l) => l.id === lessonId);
    const chapterId = selectedLesson?.chapterId || 1;

    if (type === 'mcq') {
      const optionA = optA.trim() ? (optA.startsWith('A.') ? optA : `A. ${optA}`) : 'A. Lựa chọn A';
      const optionB = optB.trim() ? (optB.startsWith('B.') ? optB : `B. ${optB}`) : 'B. Lựa chọn B';
      const optionC = optC.trim() ? (optC.startsWith('C.') ? optC : `C. ${optC}`) : 'C. Lựa chọn C';
      const optionD = optD.trim() ? (optD.startsWith('D.') ? optD : `D. ${optD}`) : 'D. Lựa chọn D';

      const mcq: MCQQuestion = {
        id: editQuestionId || Date.now(),
        lessonId,
        chapterId,
        level: (level as QuestionLevel) || 'Thông hiểu',
        question: questionText.trim(),
        imageUrl: imageUrl.trim() || undefined,
        options: [optionA, optionB, optionC, optionD],
        correctAnswer: correctOpt,
        explanation: explanation.trim() || 'Đáp án chính xác theo kiến thức SGK.',
      };
      onSaveMCQ(mcq);
    } else {
      const essay: EssayQuestion = {
        id: editQuestionId || Date.now(),
        lessonId,
        chapterId,
        title: level.trim() || 'Câu Hỏi Tự Luận',
        question: questionText.trim(),
        imageUrl: imageUrl.trim() || undefined,
        hint: essayHint.trim(),
        sampleAnswer: essaySample.trim() || 'Nội dung câu trả lời mẫu.',
      };
      onSaveEssay(essay);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 border-b border-slate-200 pb-4 mb-6">
          <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-blue-600" />
            {editQuestionId
              ? `Sửa Câu Hỏi ${type === 'mcq' ? 'Trắc Nghiệm' : 'Tự Luận'}`
              : `Thêm Câu Hỏi ${type === 'mcq' ? 'Trắc Nghiệm' : 'Tự Luận'} Mới`}
          </h3>
          <p className="text-slate-500 text-xs">Điền đầy đủ thông tin để lưu vào ngân hàng câu hỏi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Thuộc Bài Học / Chủ Đề:
              </label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {CURRICULUM_LESSONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} (Chủ đề {l.chapterId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {type === 'mcq' ? 'Mức Độ Câu Hỏi:' : 'Tiêu Đề Tự Luận:'}
              </label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder={type === 'mcq' ? 'Nhận biết / Thông hiểu / Vận dụng' : 'Ví dụ: Phân biệt bit và byte'}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nội Dung Câu Hỏi:</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              rows={3}
              placeholder="Nhập câu hỏi tại đây..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Image Attachment Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Hình Ảnh Minh Họa Đính Kèm (Không bắt buộc):
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setImageUrl('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa ảnh
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-white max-h-52 flex items-center justify-center p-2 group">
                <img
                  src={imageUrl}
                  alt="Ảnh minh họa câu hỏi"
                  className="max-h-48 object-contain rounded-xl"
                  onError={() => alert('Không thể tải hình ảnh từ URL này, vui lòng kiểm tra lại đường dẫn!')}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white hover:bg-blue-50 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Tải ảnh từ máy tính</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="relative flex items-center">
                  <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Hoặc dán URL ảnh (https://...)"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-500 italic">
              💡 Hỗ trợ hình sơ đồ, bản đồ tư duy, đồ họa máy tính hoặc hình ảnh minh họa bài tập.
            </p>
          </div>

          {/* MCQ Options */}
          {type === 'mcq' && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-700">
                Các Lựa Chọn Đáp Án Trắc Nghiệm:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500">Đáp án A:</span>
                  <input
                    type="text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Nội dung đáp án A"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium mt-1"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500">Đáp án B:</span>
                  <input
                    type="text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Nội dung đáp án B"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium mt-1"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500">Đáp án C:</span>
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Nội dung đáp án C"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium mt-1"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500">Đáp án D:</span>
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Nội dung đáp án D"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đáp Án Đúng:</label>
                  <select
                    value={correctOpt}
                    onChange={(e) => setCorrectOpt(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700"
                  >
                    <option value={0}>A - Đáp án A</option>
                    <option value={1}>B - Đáp án B</option>
                    <option value={2}>C - Đáp án C</option>
                    <option value={3}>D - Đáp án D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giải Thích Đáp Án:
                  </label>
                  <input
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Giải thích vì sao đáp án này đúng..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Essay Options */}
          {type === 'essay' && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gợi Ý Làm Bài:
                </label>
                <input
                  type="text"
                  value={essayHint}
                  onChange={(e) => setEssayHint(e.target.value)}
                  placeholder="Gợi ý hướng suy nghĩ cho học sinh..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đáp Án Mẫu Chi Tiết:
                </label>
                <textarea
                  value={essaySample}
                  onChange={(e) => setEssaySample(e.target.value)}
                  rows={3}
                  placeholder="Nội dung đáp án mẫu chi tiết..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium"
                ></textarea>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Lưu Câu Hỏi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
