import React from 'react';
import { HelpCircle, UserCheck } from 'lucide-react';

export const TabGuide: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Hướng Dẫn Sử Dụng Hệ Thống</h2>
            <p className="text-slate-600 text-sm">Hướng dẫn quy trình tự ôn tập kiến thức và rèn luyện trắc nghiệm, tự luận.</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 text-blue-600">
              <UserCheck className="w-5 h-5" /> Dành Cho Học Sinh Ôn Tập:
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2">
              <li>
                <strong>Ôn bài:</strong> Đọc lại kiến thức trọng tâm và từ khóa cốt lõi của 15 bài học trong mục <em>Ôn Tập Theo Bài</em>.
              </li>
              <li>
                <strong>Trắc nghiệm:</strong> Chọn số câu hỏi (10, 20, 30 câu) hoặc chọn tạo đề tự động bằng AI Gemini.
              </li>
              <li>
                <strong>Tự luận:</strong> Gõ câu trả lời, bấm mở gợi ý và đối chiếu đáp án mẫu chi tiết.
              </li>
              <li>
                <strong>Thi thử:</strong> Luyện đề thi tổng hợp 45 phút (15 câu trắc nghiệm + 2 câu tự luận) để chuẩn bị cho kỳ kiểm tra chính thức.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
