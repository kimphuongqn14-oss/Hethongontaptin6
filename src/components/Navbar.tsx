import React from 'react';
import { TabId } from '../types';
import {
  Home,
  BookOpen,
  Network,
  ListCheck,
  PenTool,
  Clock,
  BarChart3,
  Database,
  Bot,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isAdmin: boolean;
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, isAdmin, isLoggedIn = true }) => {
  const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: string; color?: string }[] = [
    { id: 'home', label: 'Trang Chủ', icon: <Home className="w-4 h-4" /> },
    { id: 'lessons', label: 'Ôn Tập Theo Bài', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'chapters', label: 'Ôn Tập Theo Chủ Đề', icon: <Network className="w-4 h-4" /> },
    { id: 'quiz-setup', label: 'Luyện Trắc Nghiệm', icon: <ListCheck className="w-4 h-4" /> },
    { id: 'essay', label: 'Câu Hỏi Tự Luận', icon: <PenTool className="w-4 h-4" /> },
    { id: 'mock-exam', label: 'Thi Thử 45 Phút', icon: <Clock className="w-4 h-4" /> },
    { id: 'stats', label: 'Thống Kê', icon: <BarChart3 className="w-4 h-4" /> },
    {
      id: 'manage-questions',
      label: 'Quản Lý Câu Hỏi',
      icon: <Database className="w-4 h-4 text-amber-500" />,
      badge: isAdmin ? 'Admin' : undefined,
    },
    {
      id: 'ai-assistant',
      label: 'Trợ Lý AI',
      icon: <Bot className="w-4 h-4 text-purple-600" />,
      color: 'ai'
    },
    { id: 'guide', label: 'Hướng Dẫn', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1 py-2 min-w-max">
          {navItems.map((item) => {
            const isActive = activeTab === item.id ||
              (item.id === 'quiz-setup' && (activeTab === 'quiz-player' || activeTab === 'quiz-result'));

            let activeClass = 'bg-blue-50 text-blue-700 shadow-sm font-extrabold';
            if (item.color === 'ai' && isActive) {
              activeClass = 'bg-purple-100 text-purple-800 shadow-sm font-extrabold';
            }

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                  isActive
                    ? activeClass
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {!isLoggedIn && item.id !== 'home' && item.id !== 'guide' && (
                  <Lock className="w-3 h-3 text-amber-500" />
                )}
                {item.badge && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
