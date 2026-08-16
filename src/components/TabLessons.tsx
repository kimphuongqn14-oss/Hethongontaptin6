import React, { useState } from 'react';
import { CURRICULUM_LESSONS } from '../data/curriculum';
import { BookMarked, Key, Star, PlayCircle, PenTool } from 'lucide-react';
import { TabId } from '../types';

interface TabLessonsProps {
  onStartQuizForLesson: (lessonId: number) => void;
  onSelectTab: (tab: TabId) => void;
}

export const TabLessons: React.FC<TabLessonsProps> = ({
  onStartQuizForLesson,
  onSelectTab,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<string>('all');

  const filteredLessons = CURRICULUM_LESSONS.filter((l) => {
    if (selectedChapter === 'all') return true;
    return l.chapterId === parseInt(selectedChapter);
  });

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-blue-600" /> Danh Sách Bài Học Tin Học 6
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Chọn bài học để xem lý thuyết trọng tâm và làm bài tập tương ứng.
          </p>
        </div>
        <div>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Tất Cả Chủ Đề (Chủ đề 1 - 6)</option>
            <option value="1">Chủ đề 1: Máy tính và cộng đồng</option>
            <option value="2">Chủ đề 2: Mạng máy tính và Internet</option>
            <option value="3">Chủ đề 3: Tổ chức lưu trữ, tìm kiếm thông tin</option>
            <option value="4">Chủ đề 4: Đạo đức, pháp luật & văn hóa số</option>
            <option value="5">Chủ đề 5: Ứng dụng tin học</option>
            <option value="6">Chủ đề 6: Giải quyết vấn đề với máy tính</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-500 transition-all shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1 rounded-xl">
                  Chủ đề {lesson.chapterId}
                </span>
                <span className="text-xs font-semibold text-slate-400">Bài #{lesson.id}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{lesson.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{lesson.desc}</p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-600" /> Từ khóa cốt lõi:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-slate-200 text-slate-700 font-medium px-2.5 py-0.5 rounded-lg text-[11px]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Star className="w-4 h-4 text-amber-500" /> Kiến thức trọng tâm:
                </div>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  {lesson.keyPoints.map((kp, idx) => (
                    <li key={idx}>{kp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => onStartQuizForLesson(lesson.id)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PlayCircle className="w-4 h-4" /> Làm Trắc Nghiệm
              </button>
              <button
                onClick={() => onSelectTab('essay')}
                className="px-4 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <PenTool className="w-4 h-4" /> Tự Luận
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
