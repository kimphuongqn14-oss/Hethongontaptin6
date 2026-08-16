import React, { useState } from 'react';
import { CURRICULUM_CHAPTERS, CURRICULUM_LESSONS } from '../data/curriculum';
import { Network, Workflow, ListCheck } from 'lucide-react';

interface TabChaptersProps {
  onStartQuizForLesson: (lessonId: number) => void;
}

export const TabChapters: React.FC<TabChaptersProps> = ({ onStartQuizForLesson }) => {
  const [activeChapterId, setActiveChapterId] = useState<number>(1);

  const activeChapter =
    CURRICULUM_CHAPTERS.find((c) => c.id === activeChapterId) || CURRICULUM_CHAPTERS[0];
  const chapterLessons = CURRICULUM_LESSONS.filter((l) => l.chapterId === activeChapterId);

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Network className="w-6 h-6 text-emerald-600" /> Ôn Tập Theo Chủ Đề & Sơ Đồ Tư Duy
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Tổng quan kiến thức 6 Chủ đề lớn của chương trình Tin học lớp 6 qua Sơ đồ tư duy trực quan.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
        {CURRICULUM_CHAPTERS.map((ch) => {
          const isActive = ch.id === activeChapterId;
          return (
            <button
              key={ch.id}
              onClick={() => setActiveChapterId(ch.id)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 flex-shrink-0 border ${
                isActive
                  ? 'bg-emerald-600 text-white border-transparent shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
              }`}
            >
              <Network className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
              Chủ Đề {ch.id}
            </button>
          );
        })}
      </div>

      {/* Active Chapter Details & Mindmap */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-8 shadow-sm">
        <div className="flex items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold flex-shrink-0">
            <Network className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Sơ Đồ Kiến Thức Tóm Tắt
            </span>
            <h3 className="text-2xl font-black text-slate-900">{activeChapter.title}</h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">{activeChapter.summary}</p>
          </div>
        </div>

        {/* Mindmap Nodes Grid */}
        <div>
          <h4 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
            <Workflow className="w-5 h-5 text-emerald-600" /> Sơ Đồ Tư Duy Tương Tác
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeChapter.mindmapNodes.map((node, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-200 shadow-sm space-y-2 hover:shadow-md transition"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{node.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter Lessons List */}
        <div>
          <h4 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
            <ListCheck className="w-5 h-5 text-blue-600" /> Các Bài Học Thuộc Chủ Đề
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {chapterLessons.map((l) => (
              <div
                key={l.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between hover:border-blue-300 transition"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">{l.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{l.keywords.join(', ')}</div>
                </div>
                <button
                  onClick={() => onStartQuizForLesson(l.id)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex-shrink-0 shadow-sm"
                >
                  Luyện Tập
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
