import React from 'react';
import { TabId } from '../types';
import { playSound } from '../utils/audio';
import {
  BookOpen,
  Network,
  ListCheck,
  PenTool,
  Clock,
  BarChart3,
  Bot,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Lock,
  LogIn,
  ShieldAlert,
} from 'lucide-react';

interface TabHomeProps {
  onSelectTab: (tab: TabId) => void;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
}

export const TabHome: React.FC<TabHomeProps> = ({ onSelectTab, isLoggedIn = true, onOpenLogin }) => {
  const cards = [
    {
      id: 'lessons' as TabId,
      title: 'Ôn Tập Theo Bài',
      desc: 'Xem hệ thống lý thuyết trọng tâm, từ khóa cốt lõi và bài tập kiểm tra cho từng bài học SGK.',
      count: '15 Bài học',
      icon: <BookOpen className="w-7 h-7" />,
      color: 'blue',
      bgClass: 'from-white to-blue-50/40 hover:border-blue-500',
      iconBg: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      textColor: 'text-blue-600',
    },
    {
      id: 'chapters' as TabId,
      title: 'Ôn Tập Theo Chủ Đề',
      desc: 'Khái quát 6 Chủ đề lớn qua sơ đồ tư duy tương tác giúp ghi nhớ trực quan kiến thức toàn khóa.',
      count: '6 Chủ đề lớn',
      icon: <Network className="w-7 h-7" />,
      color: 'emerald',
      bgClass: 'from-white to-emerald-50/40 hover:border-emerald-500',
      iconBg: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      textColor: 'text-emerald-600',
    },
    {
      id: 'quiz-setup' as TabId,
      title: 'Luyện Trắc Nghiệm',
      desc: 'Ngân hàng câu hỏi trắc nghiệm phong phú, phản hồi đáp án tức thì kèm hiệu ứng âm thanh và giải thích.',
      count: '10 - 30 Câu',
      icon: <ListCheck className="w-7 h-7" />,
      color: 'amber',
      bgClass: 'from-white to-amber-50/40 hover:border-amber-500',
      iconBg: 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      textColor: 'text-amber-600',
    },
    {
      id: 'essay' as TabId,
      title: 'Câu Hỏi Tự Luận',
      desc: 'Rèn luyện kỹ năng tự duy luận, gõ câu trả lời, xem gợi ý và đối chiếu đáp án mẫu chi tiết.',
      count: 'Luyện tư duy',
      icon: <PenTool className="w-7 h-7" />,
      color: 'purple',
      bgClass: 'from-white to-purple-50/40 hover:border-purple-500',
      iconBg: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
      textColor: 'text-purple-600',
    },
    {
      id: 'mock-exam' as TabId,
      title: 'Thi Thử 45 Phút',
      desc: 'Đề thi tổng hợp chuẩn gồm 15 câu trắc nghiệm & 2 câu tự luận có đếm ngược thời gian nghiêm túc.',
      count: 'Đề chuẩn 45P',
      icon: <Clock className="w-7 h-7" />,
      color: 'rose',
      bgClass: 'from-white to-rose-50/40 hover:border-rose-500',
      iconBg: 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
      textColor: 'text-rose-600',
    },
    {
      id: 'stats' as TabId,
      title: 'Thống Kê Điểm Số',
      desc: 'Lưu trữ lịch sử học tập, theo dõi biểu đồ tiến bộ điểm số và tổng hợp kết quả cá nhân.',
      count: 'Xem biểu đồ',
      icon: <BarChart3 className="w-7 h-7" />,
      color: 'cyan',
      bgClass: 'from-white to-cyan-50/40 hover:border-cyan-500',
      iconBg: 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white',
      textColor: 'text-cyan-600',
    },
    {
      id: 'ai-assistant' as TabId,
      title: 'Trợ Lý AI Học Tập',
      desc: 'Giải đáp câu hỏi Tin học 6 trực tiếp, tạo đề trắc nghiệm AI và hỗ trợ hỏi đáp tương tác 24/7.',
      count: 'Gemini AI',
      icon: <Bot className="w-7 h-7" />,
      color: 'indigo',
      bgClass: 'from-purple-50/60 to-indigo-50/60 hover:border-purple-600',
      iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white',
      textColor: 'text-purple-700',
      isAi: true
    },
    {
      id: 'guide' as TabId,
      title: 'Hướng Dẫn Sử Dụng',
      desc: 'Sổ tay hướng dẫn thao tác chi tiết dành cho Giáo viên trình chiếu và Học sinh tự luyện tập tại nhà.',
      count: 'Xem chi tiết',
      icon: <HelpCircle className="w-7 h-7" />,
      color: 'slate',
      bgClass: 'from-white to-slate-100/50 hover:border-slate-500',
      iconBg: 'bg-slate-200 text-slate-700 group-hover:bg-slate-800 group-hover:text-white',
      textColor: 'text-slate-700',
    },
  ];

  return (
    <section className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-600" /> Danh Mục Chức Năng Ôn Tập
          </h2>
          <p className="text-slate-600 text-sm mt-1">Lựa chọn chế độ học tập phù hợp với mục tiêu ôn tập của bạn</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> Sẵn sàng học tập
        </div>
      </div>

      {/* Top Lock Banner if not logged in */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white rounded-3xl p-6 shadow-xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              <Lock className="w-6 h-6 text-amber-200 animate-pulse" />
            </div>
            <div>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider inline-block mb-1">
                ⚠️ Chú Ý
              </span>
              <h3 className="text-lg font-black leading-tight">
                Bạn phải đăng nhập để sử dụng hệ thống
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                Các chức năng ôn tập, trắc nghiệm, tự luận, thi thử và trợ lý AI sẽ tự động mở khóa sau khi đăng nhập.
              </p>
            </div>
          </div>
          {onOpenLogin && (
            <button
              onClick={() => {
                playSound('click');
                onOpenLogin();
              }}
              className="bg-white hover:bg-slate-100 text-rose-700 px-6 py-3 rounded-2xl text-xs font-black shadow-lg transition shrink-0 flex items-center gap-2 transform hover:scale-105"
            >
              <LogIn className="w-4 h-4" /> ĐĂNG NHẬP NGAY
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const isLocked = !isLoggedIn && card.id !== 'guide';

          return (
            <div
              key={card.id}
              onClick={() => {
                if (isLocked) {
                  playSound('wrong');
                  if (onOpenLogin) onOpenLogin();
                } else {
                  playSound('click');
                  onSelectTab(card.id);
                }
              }}
              className={`group bg-gradient-to-b ${card.bgClass} rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-200 transform hover:-translate-y-1.5 flex flex-col justify-between h-64 relative overflow-hidden ${
                isLocked ? 'opacity-90 border-amber-300' : ''
              }`}
            >
              {isLocked && (
                <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 shadow">
                  <Lock className="w-3 h-3" /> Cần Đăng Nhập
                </div>
              )}

              <div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 transition-all shadow-md ${card.iconBg}`}
                >
                  {card.icon}
                </div>
                {card.isAi && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 uppercase tracking-wider mb-1 inline-block">
                    Tích hợp AI
                  </span>
                )}
                <h3 className={`text-xl font-extrabold text-slate-900 group-hover:${card.textColor} transition`}>
                  {card.title}
                </h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed line-clamp-3">
                  {card.desc}
                </p>
              </div>
              <div className={`pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold ${card.textColor}`}>
                <span>{isLocked ? '🔒 Bạn phải đăng nhập' : card.count}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
